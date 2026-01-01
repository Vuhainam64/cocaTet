import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { AccountModel } from '../database/models/account.js';
import { ProxyModel } from '../database/models/proxy.js';
import { CodeModel } from '../database/models/code.js';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

const BASE_URL = 'https://coke-tet-utc-public-api.adtimabox.vn/digital-api';
const CAPTCHA_SERVER_URL = process.env.CAPTCHA_SERVER_URL || 'http://cocacap.kimidev.net:5092';
const PRODUCT_ID = '69255e712d8de7e52b4a2a23';

let taskRunning = false;
let taskProgress = [];
let taskLogs = [];
let prizeList = [];
let blockedAccounts = new Set(); // Track các account bị block
let totalCodes = 0; // Tổng số codes ban đầu
let processedCodes = 0; // Số codes đã xử lý

function normalizeToken(token) {
    if (!token) return '';
    const trimmed = String(token).trim();
    if (/^Bearer\s+/i.test(trimmed)) return trimmed;
    return `Bearer ${trimmed}`;
}

function buildHeaders(tokenOverride) {
    const authToken = normalizeToken(tokenOverride);
    return {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 9; SM-N971N Build/PQ3A.190605.09261140;) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.82 Mobile Safari/537.36 Zalo android/250610822',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-ch-ua-platform': '"Android"',
        authorization: authToken,
        'sec-ch-ua': '"Chromium";v="124", "Android WebView";v="124", "Not-A.Brand";v="99"',
        'sec-ch-ua-mobile': '?1',
        origin: 'https://h5.zdn.vn',
        'x-requested-with': 'com.zing.zalo',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        referer: 'https://h5.zdn.vn/',
        Connection: 'keep-alive',
        Host: 'coke-tet-utc-public-api.adtimabox.vn',
    };
}

// Lấy thông tin user từ API
export async function getUserInfo(token) {
    try {
        const url = `${BASE_URL}/digital-user/me`;
        const headers = buildHeaders(token);
        
        const res = await axios.get(url, { 
            headers,
            timeout: 10000, // 10 giây timeout
        });
        
        if (res.data && res.data.statusCode === 200 && res.data.data) {
            return {
                success: true,
                name: res.data.data.name || res.data.data.fullName || null,
                data: res.data.data,
            };
        }
        
        return { success: false, error: 'Invalid response' };
    } catch (error) {
        return { 
            success: false, 
            error: error.message || 'Failed to get user info' 
        };
    }
}

function buildProxyAgent(proxy) {
    if (!proxy) return null;
    
    // Mặc định là HTTP proxy
    const proxyType = proxy.type || 'http';
    
    const proxyUrl = proxy.username && proxy.password
        ? `${proxyType}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
        : `${proxyType}://${proxy.host}:${proxy.port}`;
    
    if (proxyType === 'http' || proxyType === 'https') {
        return new HttpsProxyAgent(proxyUrl);
    } else {
        // socks5 hoặc socks4
        return new SocksProxyAgent(proxyUrl);
    }
}

async function getSmartCaptcha(options = {}, tokenOverride, proxy = null, retryCount = 0) {
    const { length = 3, charsetType = 'alphabet' } = options;
    const url = `${BASE_URL}/digital-campaign-utc-codes/getSmartCaptcha?length=${length}&charsetType=`;
    const headers = buildHeaders(tokenOverride);
    
    // Thêm delay nhỏ trước khi gọi API để tránh rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const axiosConfig = { 
        headers,
        timeout: 30000, // 30 giây timeout
    };
    const proxyAgent = buildProxyAgent(proxy);
    if (proxyAgent) {
        axiosConfig.httpsAgent = proxyAgent;
        axiosConfig.httpAgent = proxyAgent;
    }
    
    try {
        const res = await axios.get(url, axiosConfig);
        return res.data;
    } catch (error) {
        // Retry nếu gặp lỗi network (Socket closed, ECONNRESET, etc.)
        if (retryCount < 3 && (
            error.message?.includes('Socket closed') ||
            error.message?.includes('ECONNRESET') ||
            error.message?.includes('ETIMEDOUT') ||
            error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT'
        )) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Exponential backoff
            return getSmartCaptcha(options, tokenOverride, proxy, retryCount + 1);
        }
        throw error;
    }
}

async function checkCode({ code, recaptcha }, tokenOverride, proxy = null, retryCount = 0) {
    const url = `${BASE_URL}/digital-campaign-utc-codes/checkCode`;
    const headers = {
        ...buildHeaders(tokenOverride),
        'Content-Type': 'application/json',
        'content-type': 'application/json; charset=UTF-8',
    };
    const body = { code, mparams: {}, productId: PRODUCT_ID, recaptcha };
    
    const axiosConfig = { 
        headers,
        timeout: 30000, // 30 giây timeout
    };
    const proxyAgent = buildProxyAgent(proxy);
    if (proxyAgent) {
        axiosConfig.httpsAgent = proxyAgent;
        axiosConfig.httpAgent = proxyAgent;
    }
    
    try {
        const res = await axios.post(url, body, axiosConfig);
        return res.data;
    } catch (error) {
        // Retry nếu gặp lỗi network (Socket closed, ECONNRESET, etc.)
        if (retryCount < 3 && (
            error.message?.includes('Socket closed') ||
            error.message?.includes('ECONNRESET') ||
            error.message?.includes('ETIMEDOUT') ||
            error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT'
        )) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Exponential backoff
            return checkCode({ code, recaptcha }, tokenOverride, proxy, retryCount + 1);
        }
        throw error;
    }
}

async function checkResultScanCodeQueue(checkId, tokenOverride, proxy = null, retryCount = 0) {
    const url = `${BASE_URL}/digital-campaign-gifts/checkResultScanCodeQueue`;
    const headers = {
        ...buildHeaders(tokenOverride),
        'Content-Type': 'application/json',
        'content-type': 'application/json; charset=UTF-8',
    };
    const body = { checkId };
    
    const axiosConfig = { 
        headers,
        timeout: 30000, // 30 giây timeout
    };
    const proxyAgent = buildProxyAgent(proxy);
    if (proxyAgent) {
        axiosConfig.httpsAgent = proxyAgent;
        axiosConfig.httpAgent = proxyAgent;
    }
    
    try {
        const res = await axios.post(url, body, axiosConfig);
        return res.data;
    } catch (error) {
        // Retry nếu gặp lỗi network (Socket closed, ECONNRESET, etc.)
        if (retryCount < 3 && (
            error.message?.includes('Socket closed') ||
            error.message?.includes('ECONNRESET') ||
            error.message?.includes('ETIMEDOUT') ||
            error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT'
        )) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Exponential backoff
            return checkResultScanCodeQueue(checkId, tokenOverride, proxy, retryCount + 1);
        }
        throw error;
    }
}

async function solveCaptchaOnServer(payload) {
    const url = `${CAPTCHA_SERVER_URL}/solve-captcha`;
    const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
}

async function preprocessImageToWhiteBg(imagePath) {
    const buffer = await sharp(imagePath).grayscale().threshold(200).toBuffer();
    fs.writeFileSync(imagePath, buffer);
}

async function ocrCaptcha(imagePath) {
    await preprocessImageToWhiteBg(imagePath);
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', { logger: () => {} });
    return text.replace(/[^0-9]/g, '');
}

async function solveCaptchaForTet(token, proxy = null) {
    const captchaRes = await getSmartCaptcha({ length: 3, charsetType: 'alphabet' }, token, proxy);
    if (!captchaRes || captchaRes.statusCode !== 200 || !captchaRes.data) {
        throw new Error(`Lấy captcha thất bại: ${captchaRes && captchaRes.message}`);
    }

    const captchaData = captchaRes.data;

    if (captchaData.value && captchaData.images) {
        const serverPayload = {
            data: {
                value: captchaData.value,
                images: captchaData.images,
                type: 'cCaptcha',
            },
            type: 'cCaptcha',
        };

        const serverRes = await solveCaptchaOnServer(serverPayload);
        const recaptcha = serverRes?.result || serverRes?.data?.result;

        appendLog(`CAPTCHA_SERVER_RESPONSE | ${JSON.stringify(serverRes)}`);

        if (!recaptcha) {
            throw new Error(`Server giải captcha (cCaptcha) không trả về result hợp lệ: ${JSON.stringify(serverRes)}`);
        }

        return { recaptcha, raw: { captchaRes, serverRes } };
    }

    const imageBase64 = captchaData.image;
    if (!imageBase64) {
        throw new Error(`Dữ liệu captcha không có image: ${JSON.stringify(captchaData)}`);
    }

    const userDataPath = app.getPath('userData');
    const imagePath = path.join(userDataPath, 'captcha.png');
    let base64Data = imageBase64;
    if (base64Data.startsWith('data:image')) {
        base64Data = base64Data.split(',')[1];
    }
    const buf = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(imagePath, buf);

    const recaptcha = await ocrCaptcha(imagePath);
    appendLog(`S_CAPTCHA_OCR_RESULT | ${recaptcha}`);

    if (!recaptcha) {
        throw new Error('OCR captcha (sCaptcha) không đọc được ký tự hợp lệ');
    }

    return { recaptcha, raw: { captchaRes } };
}

function appendLog(message) {
    const timestamp = new Date().toISOString();
    const logLine = `${timestamp} | ${message}`;
    taskLogs.push(logLine);
    if (taskLogs.length > 1000) {
        taskLogs.shift();
    }
}

function formatProxy(proxy) {
    if (proxy.username && proxy.password) {
        return `${proxy.host}:${proxy.port}:${proxy.username}:${proxy.password}`;
    }
    return `${proxy.host}:${proxy.port}`;
}

async function processCodeForAccount(account, proxy, code, timeoutMs) {
    const accountId = account.id;
    const accountName = account.name;
    const proxyStr = proxy ? formatProxy(proxy) : 'No proxy';

    // Kiểm tra nếu account đã bị block thì không xử lý nữa
    if (blockedAccounts.has(accountId)) {
        appendLog(`${accountName} | ${code.code} | Account đã bị block - bỏ qua`);
        return;
    }

    updateProgress(accountId, {
        accountName,
        proxy: proxyStr,
        code: code.code,
        status: 'running',
    });

    try {
        appendLog(`${accountName} | ${code.code} | Bắt đầu xử lý`);

        const { recaptcha } = await solveCaptchaForTet(account.token, proxy);
        appendLog(`${accountName} | ${code.code} | Captcha solved: ${recaptcha}`);

        const res = await checkCode({ code: code.code, recaptcha }, account.token, proxy);

        if (res && res.statusCode === 200) {
            appendLog(`${accountName} | ${code.code} | SUCCESS | CHECK_CODE | ${JSON.stringify(res.data)}`);

            const checkId = res.data?.logId || res.data?.checkId;
            if (checkId) {
                try {
                    // Retry logic cho trường hợp goodLuck=undefined
                    let checkRes = null;
                    let checkData = {};
                    let retryCount = 0;
                    const maxRetries = 2;
                    
                    while (retryCount <= maxRetries) {
                        checkRes = await checkResultScanCodeQueue(checkId, account.token, proxy);
                        checkData = checkRes?.data || {};
                    const goodLuck = checkData.goodLuck;
                    const prizeName = checkData.prizeName || checkData.name || checkData.giftName || null;
                        const gift = checkData.gift || {};

                    // Log chi tiết để debug
                    appendLog(`${accountName} | ${code.code} | CHECK_GIFT | checkId=${checkId} | goodLuck=${goodLuck} | prizeName=${prizeName || 'null'} | fullData=${JSON.stringify(checkData)}`);
                        
                        // Nếu có prizeName hoặc có gift thì đã có kết quả, không cần retry
                        if (prizeName || gift.name || gift._id) {
                            break;
                        }
                        
                        // Nếu goodLuck không phải undefined thì đã có kết quả rõ ràng
                        if (goodLuck !== undefined) {
                            break;
                        }
                        
                        // Nếu đã retry đủ số lần thì dừng
                        if (retryCount >= maxRetries) {
                            break;
                        }
                        
                        // Retry sau 2 giây
                        retryCount++;
                        appendLog(`${accountName} | ${code.code} | goodLuck=undefined - retry lần ${retryCount}/${maxRetries} sau 2 giây...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    
                    const goodLuck = checkData.goodLuck;
                    const prizeName = checkData.prizeName || checkData.name || checkData.giftName || checkData.gift?.name || null;
                    const gift = checkData.gift || {};
                    const thumbnail = gift.thumbnail || null;

                    await CodeModel.update(code.id, { status: 'used' });
                    processedCodes++; // Tăng số codes đã xử lý
                    
                    let prizeText = 'No Prize';
                    // Xử lý các trường hợp:
                    // - goodLuck=false nhưng có gift: trúng quà
                    // - goodLuck=true: không trúng quà (đã check trước đó)
                    // - goodLuck=undefined: có thể là trúng quà nếu có prizeName hoặc gift
                    if (prizeName || gift.name) {
                        // Nếu có prizeName hoặc gift.name thì chắc chắn là trúng quà
                        prizeText = prizeName || gift.name;
                        addPrize({
                            account: accountName,
                            code: code.code,
                            prize: prizeText,
                            thumbnail: thumbnail,
                            giftId: gift._id,
                            time: new Date().toISOString(),
                        });
                        appendLog(`${accountName} | ${code.code} | TRÚNG QUÀ: ${prizeText} (goodLuck=${goodLuck})`);
                    } else if (goodLuck === undefined && retryCount >= maxRetries) {
                        // goodLuck=undefined sau khi đã retry - có thể là đang chờ kết quả hoặc không trúng
                        appendLog(`${accountName} | ${code.code} | goodLuck=undefined sau ${maxRetries} lần retry - có thể chưa có kết quả`);
                    }

                    updateProgress(accountId, {
                        accountName,
                        proxy: proxyStr,
                        code: code.code,
                        status: 'success',
                        prize: prizeText,
                    });
                } catch (e) {
                    appendLog(`${accountName} | ${code.code} | CHECK_GIFT_ERROR | ${e.message}`);
                    updateProgress(accountId, {
                        accountName,
                        proxy: proxyStr,
                        code: code.code,
                        status: 'error',
                        prize: 'No Prize',
                    });
                }
            } else {
                updateProgress(accountId, {
                    accountName,
                    proxy: proxyStr,
                    code: code.code,
                    status: 'success',
                    prize: 'No Prize',
                });
            }
        } else {
            const errorMsg = res ? res.message : 'Unknown error';
            appendLog(`${accountName} | ${code.code} | ERROR | ${JSON.stringify(res)}`);

            // Xử lý "User is block" - đánh dấu account bị block và dừng xử lý
            if (errorMsg && errorMsg.includes('User is block')) {
                blockedAccounts.add(accountId);
                await AccountModel.update(account.id, { status: 'block' });
                appendLog(`${accountName} | Account bị block - dừng xử lý, code vẫn active`);
                updateProgress(accountId, {
                    accountName,
                    proxy: proxyStr,
                    code: code.code,
                    status: 'blocked',
                    prize: 'No Prize',
                });
                return; // Dừng xử lý code tiếp theo cho account này
            }

            if (errorMsg && errorMsg.includes('Code invalid')) {
                await CodeModel.update(code.id, { status: 'invalid' });
            } else if (errorMsg && errorMsg.includes('Too many request')) {
                appendLog(`${accountName} | ${code.code} | Too many request - giữ code active`);
            }

            updateProgress(accountId, {
                accountName,
                proxy: proxyStr,
                code: code.code,
                status: 'error',
                prize: 'No Prize',
            });
        }
    } catch (err) {
        const apiBody = err.response?.data;
        const msg = apiBody ? JSON.stringify(apiBody) : err.message;
        const errorMessage = err.message || '';
        const statusCode = apiBody?.statusCode;

        appendLog(`${accountName} | ${code.code} | EXCEPTION | ${msg}`);

        // Xử lý "User is block" - đánh dấu account bị block và dừng xử lý
        if (msg.includes('User is block')) {
            blockedAccounts.add(accountId);
            await AccountModel.update(account.id, { status: 'block' });
            appendLog(`${accountName} | Account bị block - dừng xử lý, code vẫn active`);
            updateProgress(accountId, {
                accountName,
                proxy: proxyStr,
                code: code.code,
                status: 'blocked',
                prize: 'No Prize',
            });
            return; // Dừng xử lý code tiếp theo cho account này
        }

        // Xử lý các lỗi network - giữ code active để retry sau
        if (errorMessage.includes('Socket closed') || 
            errorMessage.includes('ECONNRESET') || 
            errorMessage.includes('ETIMEDOUT') ||
            errorMessage.includes('ECONNREFUSED') ||
            err.code === 'ECONNRESET' ||
            err.code === 'ETIMEDOUT' ||
            err.code === 'ECONNREFUSED') {
            appendLog(`${accountName} | ${code.code} | Network error - giữ code active để retry`);
            updateProgress(accountId, {
                accountName,
                proxy: proxyStr,
                code: code.code,
                status: 'error',
                prize: 'No Prize',
            });
            return; // Không đánh dấu code là invalid, để retry sau
        }

        // Đánh dấu invalid khi gặp "Code invalid"
        if (msg.includes('Code invalid')) {
            await CodeModel.update(code.id, { status: 'invalid' });
        } else if (msg.includes('Too many request')) {
            appendLog(`${accountName} | ${code.code} | Too many request - giữ code active`);
        }

        updateProgress(accountId, {
            accountName,
            proxy: proxyStr,
            code: code.code,
            status: 'error',
            prize: 'No Prize',
        });
    }

    // Delay giữa các code để tránh rate limit
    if (timeoutMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, timeoutMs));
    } else {
        // Nếu không có timeout, vẫn delay tối thiểu 2 giây
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
}

function updateProgress(accountId, data) {
    const index = taskProgress.findIndex(p => p.accountId === accountId);
    if (index >= 0) {
        taskProgress[index] = { ...taskProgress[index], ...data };
    } else {
        taskProgress.push({ accountId, ...data });
    }
}

function addPrize(prizeData) {
    prizeList.push(prizeData);
    // Giới hạn danh sách tối đa 1000 giải
    if (prizeList.length > 1000) {
        prizeList.shift();
    }
}

export async function startExchangeGift({ accountCollectionId, proxyCollectionId, codeCollectionId, timeoutMs, delayAccountMs = 1000 }) {
    if (taskRunning) {
        return { success: false, error: 'Task đang chạy' };
    }

    taskRunning = true;
    taskProgress = [];
    taskLogs = [];
    prizeList = [];
    blockedAccounts.clear(); // Reset blocked accounts khi bắt đầu task mới

    (async () => {
        try {
            const accounts = AccountModel.getAll(accountCollectionId, 'active');
            const proxies = ProxyModel.getAll(proxyCollectionId, 'active');
            const codes = CodeModel.getAll(codeCollectionId, 'active');

            if (accounts.length === 0) {
                taskRunning = false;
                return;
            }

            if (codes.length === 0) {
                taskRunning = false;
                return;
            }

            totalCodes = codes.length; // Lưu tổng số codes
            processedCodes = 0; // Reset số codes đã xử lý
            appendLog(`Bắt đầu task với ${accounts.length} accounts, ${proxies.length} proxies, ${codes.length} codes`);

            // Kiểm tra số lượng proxy
            if (proxies.length < accounts.length) {
                appendLog(`Cảnh báo: Chỉ có ${proxies.length} proxies nhưng có ${accounts.length} accounts. Chỉ chạy ${proxies.length} accounts đầu tiên.`);
            }

            // Shuffle proxies để phân phối ngẫu nhiên
            const shuffledProxies = [...proxies].sort(() => Math.random() - 0.5);
            
            // Chạy đa luồng - mỗi account chạy song song với proxy riêng
            // Thêm delay giữa các account để tránh "Too many request"
            const activeAccounts = accounts.slice(0, proxies.length);
            const delayMs = delayAccountMs || 1000;
            appendLog(`Delay giữa các account: ${delayMs}ms`);
            
            const accountPromises = activeAccounts.map(async (account, i) => {
                if (!taskRunning) return;

                // Delay giữa các account khi bắt đầu
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayMs * i));
                }

                // Mỗi account dùng 1 proxy riêng, không trùng
                const proxy = shuffledProxies[i] || null;

                updateProgress(account.id, {
                    accountName: account.name,
                    proxy: proxy ? formatProxy(proxy) : 'No proxy',
                    code: '-',
                    status: 'waiting',
                    prize: 'No Prize',
                });

                // Phân chia codes cho mỗi account để tránh trùng lặp
                // Mỗi account chỉ xử lý các codes có index % số_accounts == index_account
                const activeCodes = codes.filter(c => c.status === 'active');
                const accountCodes = activeCodes.filter((code, idx) => idx % activeAccounts.length === i);
                
                appendLog(`${account.name} | Được phân phối ${accountCodes.length} codes (tổng ${activeCodes.length} codes)`);
                
                for (const code of accountCodes) {
                    if (!taskRunning) break;
                    
                    // Kiểm tra nếu account đã bị block thì dừng xử lý
                    if (blockedAccounts.has(account.id)) {
                        appendLog(`${account.name} | Account đã bị block - dừng xử lý các code còn lại`);
                        break;
                    }

                    const codeData = CodeModel.getById(code.id);
                    if (codeData.status !== 'active') continue;

                    await processCodeForAccount(account, proxy, codeData, timeoutMs);
                }
            });

            await Promise.all(accountPromises);

            taskRunning = false;
            const remainingCodes = totalCodes - processedCodes;
            appendLog(`Task hoàn thành! Đã xử lý ${processedCodes}/${totalCodes} codes. Còn lại ${remainingCodes} codes.`);
        } catch (error) {
            taskRunning = false;
            appendLog(`Task error: ${error.message}`);
        }
    })();

    return { success: true };
}

export function stopExchangeGift() {
    taskRunning = false;
    appendLog('Task đã dừng bởi người dùng');
    return { success: true };
}

export function getExchangeGiftProgress() {
    const remainingCodes = totalCodes - processedCodes;
    return { 
        success: true, 
        data: taskProgress,
        stats: {
            totalCodes,
            processedCodes,
            remainingCodes,
        }
    };
}

export function getExchangeGiftLogs() {
    return { success: true, data: taskLogs.join('\n') };
}

export function getExchangeGiftPrizes() {
    return { success: true, data: prizeList };
}

export function isTaskRunning() {
    return taskRunning;
}

// Check proxy còn sống không
async function checkProxyStatus(proxy) {
    try {
        if (!proxy || !proxy.host || !proxy.port) {
            return { isAlive: false, error: 'Invalid proxy' };
        }

        const proxyAgent = buildProxyAgent(proxy);
        if (!proxyAgent) {
            return { isAlive: false, error: 'Cannot build proxy agent' };
        }

        // Test proxy bằng cách kết nối đến API đơn giản
        const testUrl = 'https://api.ipify.org?format=json';
        
        const res = await axios.get(testUrl, {
            httpsAgent: proxyAgent,
            httpAgent: proxyAgent,
            timeout: 10000, // 10 giây timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (res.data && res.data.ip) {
            return { 
                isAlive: true, 
                ip: res.data.ip,
            };
        }

        return { isAlive: false, error: 'Invalid response' };
    } catch (error) {
        return { 
            isAlive: false, 
            error: error.message || 'Failed to check proxy' 
        };
    }
}

// Check proxy của tất cả proxies trong collection
export async function checkAllProxiesStatus(proxyCollectionId) {
    try {
        const proxies = ProxyModel.getAll(proxyCollectionId, null); // Lấy tất cả, không filter status
        if (proxies.length === 0) {
            return { success: false, error: 'Không có proxy nào để check' };
        }

        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < proxies.length; i++) {
            const proxy = proxies[i];
            
            // Delay nhỏ giữa các request để tránh rate limit
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            try {
                const proxyStatus = await checkProxyStatus(proxy);
                const isAlive = proxyStatus.isAlive;
                
                if (isAlive) {
                    successCount++;
                    // Cập nhật status nếu cần
                    if (proxy.status !== 'active') {
                        await ProxyModel.update(proxy.id, { status: 'active' });
                    }
                } else {
                    failCount++;
                    // Đánh dấu proxy là invalid nếu không còn sống
                    await ProxyModel.update(proxy.id, { status: 'invalid' });
                }

                results.push({
                    proxyId: proxy.id,
                    proxyHost: `${proxy.host}:${proxy.port}`,
                    isAlive,
                    error: proxyStatus.error || null,
                    ip: proxyStatus.ip || null,
                });
            } catch (error) {
                failCount++;
                results.push({
                    proxyId: proxy.id,
                    proxyHost: `${proxy.host}:${proxy.port}`,
                    isAlive: false,
                    error: error.message || 'Unknown error',
                    ip: null,
                });
                // Đánh dấu proxy là invalid
                await ProxyModel.update(proxy.id, { status: 'invalid' });
            }
        }

        return {
            success: true,
            data: {
                results,
                total: proxies.length,
                successCount,
                failCount,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to check proxies',
        };
    }
}

// Check token của tất cả accounts trong collection
export async function checkAllAccountsToken(accountCollectionId) {
    try {
        const accounts = AccountModel.getAll(accountCollectionId, 'active');
        if (accounts.length === 0) {
            return { success: false, error: 'Không có account nào để check' };
        }

        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            
            // Delay nhỏ giữa các request để tránh rate limit
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            try {
                const userInfo = await getUserInfo(account.token);
                const isAlive = userInfo.success;
                
                if (isAlive) {
                    successCount++;
                    // Cập nhật status nếu cần
                    if (account.status !== 'active') {
                        await AccountModel.update(account.id, { status: 'active' });
                    }
                } else {
                    failCount++;
                    // Đánh dấu account là invalid nếu token không còn sống
                    await AccountModel.update(account.id, { status: 'invalid' });
                }

                results.push({
                    accountId: account.id,
                    accountName: account.name,
                    isAlive,
                    error: userInfo.error || null,
                    userInfo: userInfo.data || null,
                });
            } catch (error) {
                failCount++;
                results.push({
                    accountId: account.id,
                    accountName: account.name,
                    isAlive: false,
                    error: error.message || 'Unknown error',
                    userInfo: null,
                });
                // Đánh dấu account là invalid
                await AccountModel.update(account.id, { status: 'invalid' });
            }
        }

        return {
            success: true,
            data: {
                results,
                total: accounts.length,
                successCount,
                failCount,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to check accounts',
        };
    }
}

// Kiểm tra trạng thái voucher GotIt
async function checkGotItVoucher(redemptLink) {
    try {
        if (!redemptLink || !redemptLink.includes('v.gotit.vn/')) {
            return { isUsed: false, error: 'Invalid link' };
        }

        // Extract code từ link: https://v.gotit.vn/Pe5MWica/consent?gti=2 => Pe5MWica
        const match = redemptLink.match(/v\.gotit\.vn\/([^\/\?]+)/);
        if (!match || !match[1]) {
            return { isUsed: false, error: 'Cannot extract code' };
        }

        const voucherCode = match[1];
        const url = `https://openapi.gotit.vn/voucher/v1/v/${voucherCode}`;
        
        const res = await axios.get(url, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
            },
        });

        if (res.data && res.data.status === true && res.data.data) {
            const voucherData = res.data.data;
            // state = 4 và used_voucher_info có data => đã sử dụng
            // state = 3 và used_voucher_info = [] => chưa sử dụng
            const isUsed = voucherData.state === 4 && 
                          voucherData.used_voucher_info && 
                          voucherData.used_voucher_info.length > 0;
            
            return { 
                isUsed, 
                state: voucherData.state,
                usedVoucherInfo: voucherData.used_voucher_info || []
            };
        }

        return { isUsed: false, error: 'Invalid response' };
    } catch (error) {
        return { 
            isUsed: false, 
            error: error.message || 'Failed to check voucher' 
        };
    }
}

// Lấy danh sách quà của user
export async function getMyGifts(accountId, limit = 10, page = 0, proxy = null) {
    try {
        const account = AccountModel.getById(accountId);
        if (!account || !account.token) {
            return { success: false, error: 'Account không tồn tại hoặc không có token' };
        }

        // API này dùng page 0-based
        const url = `${BASE_URL}/digital-user/myGift?limit=${limit}&page=${page}`;
        const headers = buildHeaders(account.token);
        
        const axiosConfig = { 
            headers,
            timeout: 30000,
        };
        const proxyAgent = buildProxyAgent(proxy);
        if (proxyAgent) {
            axiosConfig.httpsAgent = proxyAgent;
            axiosConfig.httpAgent = proxyAgent;
        }

        const res = await axios.get(url, axiosConfig);
        
        if (res.data && res.data.statusCode === 200) {
            const data = res.data.data || {};
            const records = data.record || [];

            // Check voucher status cho các link GotIt với delay để tránh rate limit
            const recordsWithStatus = [];
            for (let i = 0; i < records.length; i++) {
                try {
                    const record = records[i];
                    if (record.redemptLink && record.redemptLink.includes('v.gotit.vn/')) {
                        // Delay nhỏ giữa các request
                        if (i > 0) {
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }
                        try {
                            const voucherStatus = await checkGotItVoucher(record.redemptLink);
                            recordsWithStatus.push({
                                ...record,
                                isUsed: voucherStatus.isUsed,
                                voucherState: voucherStatus.state,
                                voucherError: voucherStatus.error,
                            });
                        } catch (checkError) {
                            // Nếu check voucher lỗi, vẫn giữ record nhưng đánh dấu lỗi
                            recordsWithStatus.push({
                                ...record,
                                isUsed: false,
                                voucherState: null,
                                voucherError: checkError.message || 'Check failed',
                            });
                        }
                    } else {
                        recordsWithStatus.push({
                            ...record,
                            isUsed: false,
                            voucherState: null,
                        });
                    }
                } catch (error) {
                    // Đảm bảo record vẫn được thêm vào ngay cả khi có lỗi
                    recordsWithStatus.push({
                        ...records[i],
                        isUsed: false,
                        voucherState: null,
                        voucherError: error.message || 'Unknown error',
                    });
                }
            }

            return {
                success: true,
                data: {
                    ...data,
                    record: recordsWithStatus,
                },
            };
        }
        
        return { success: false, error: 'Invalid response' };
    } catch (error) {
        return { 
            success: false, 
            error: error.message || 'Failed to get my gifts' 
        };
    }
}

// Lấy danh sách người trúng giải theo giftId
export async function getGiftUserLuckyDraws(campaignId, giftId, limit = 10, page = 0) {
    try {
        const url = `${BASE_URL}/digital-campaign-anonymous/giftUserLuckyDraws?limit=${limit}&page=${page}&campaignId=${campaignId}&giftId=${giftId}`;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 9; SM-S908N Build/PQ3A.190605.09261140;) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.82 Mobile Safari/537.36 Zalo android/250220796',
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            Connection: 'keep-alive',
            Host: 'coke-tet-utc-public-api.adtimabox.vn',
            Origin: 'https://h5.zdn.vn',
            Referer: 'https://h5.zdn.vn/',
            'sec-ch-ua': '"Chromium";v="124", "Android WebView";v="124", "Not-A.Brand";v="99"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'X-Requested-With': 'com.zing.zalo',
        };

        const res = await axios.get(url, { 
            headers,
            timeout: 30000,
        });
        
        if (res.data && res.data.statusCode === 200) {
            return {
                success: true,
                data: res.data.data || {},
            };
        }
        
        return { success: false, error: 'Invalid response' };
    } catch (error) {
        return { 
            success: false, 
            error: error.message || 'Failed to get gift user lucky draws' 
        };
    }
}

// Lấy danh sách quà còn lại
export async function getListGifts(campaignId, limit = 100, page = 0) {
    try {
        const url = `${BASE_URL}/digital-campaign-gifts/listGifts?limit=${limit}&page=${page}&campaignId=${campaignId}`;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 9; SM-S908N Build/PQ3A.190605.09261140;) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.82 Mobile Safari/537.36 Zalo android/250220796',
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            Connection: 'keep-alive',
            Host: 'coke-tet-utc-public-api.adtimabox.vn',
            Origin: 'https://h5.zdn.vn',
            Referer: 'https://h5.zdn.vn/',
            'sec-ch-ua': '"Chromium";v="124", "Android WebView";v="124", "Not-A.Brand";v="99"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'X-Requested-With': 'com.zing.zalo',
        };

        const res = await axios.get(url, { 
            headers,
            timeout: 30000,
        });
        
        if (res.data && res.data.statusCode === 200) {
            return {
                success: true,
                data: res.data.data || {},
            };
        }
        
        return { success: false, error: 'Invalid response' };
    } catch (error) {
        return { 
            success: false, 
            error: error.message || 'Failed to get list gifts' 
        };
    }
}

