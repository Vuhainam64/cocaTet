import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { getDatabase } from '../database/index.js';
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

function normalizeToken(token) {
    if (!token) return '';
    const trimmed = String(token).trim();
    if (/^Bearer\s+/i.test(trimmed)) return trimmed;
    return `Bearer ${trimmed}`;
}

function buildHeaders(tokenOverride) {
    const authToken = normalizeToken(tokenOverride);
    return {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 12L; CPH2119 Build/SP1A.210812.016;) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/142.0.7444.102 Mobile Safari/537.36 Zalo android/251010850 ZaloTheme/light ZaloLanguage/en',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'sec-ch-ua-platform': '"Android"',
        authorization: authToken,
        'sec-ch-ua': '"Chromium";v="142", "Android WebView";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?1',
        origin: 'https://h5.zdn.vn',
        'x-requested-with': 'com.zing.zalo',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        referer: 'https://h5.zdn.vn/',
        'accept-language': 'en-US,en;q=0.9',
        priority: 'u=1, i',
    };
}

function buildProxyAgent(proxy) {
    if (!proxy) return null;
    
    const proxyUrl = proxy.username && proxy.password
        ? `${proxy.type || 'socks5'}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
        : `${proxy.type || 'socks5'}://${proxy.host}:${proxy.port}`;
    
    if (proxy.type === 'http' || proxy.type === 'https') {
        return new HttpsProxyAgent(proxyUrl);
    } else {
        // socks5 hoặc socks4
        return new SocksProxyAgent(proxyUrl);
    }
}

async function getSmartCaptcha(options = {}, tokenOverride, proxy = null) {
    const { length = 3, charsetType = 'alphabet' } = options;
    const url = `${BASE_URL}/digital-campaign-utc-codes/getSmartCaptcha?length=${length}&charsetType=`;
    const headers = buildHeaders(tokenOverride);
    
    // Thêm delay nhỏ trước khi gọi API để tránh rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const axiosConfig = { headers };
    const proxyAgent = buildProxyAgent(proxy);
    if (proxyAgent) {
        axiosConfig.httpsAgent = proxyAgent;
        axiosConfig.httpAgent = proxyAgent;
    }
    
    const res = await axios.get(url, axiosConfig);
    return res.data;
}

async function checkCode({ code, recaptcha }, tokenOverride, proxy = null) {
    const url = `${BASE_URL}/digital-campaign-utc-codes/checkCode`;
    const headers = {
        ...buildHeaders(tokenOverride),
        'Content-Type': 'application/json',
        'content-type': 'application/json; charset=UTF-8',
    };
    const body = { code, mparams: {}, productId: PRODUCT_ID, recaptcha };
    
    const axiosConfig = { headers };
    const proxyAgent = buildProxyAgent(proxy);
    if (proxyAgent) {
        axiosConfig.httpsAgent = proxyAgent;
        axiosConfig.httpAgent = proxyAgent;
    }
    
    const res = await axios.post(url, body, axiosConfig);
    return res.data;
}

async function checkResultScanCodeQueue(checkId, tokenOverride, proxy = null) {
    const url = `${BASE_URL}/digital-campaign-gifts/checkResultScanCodeQueue`;
    const headers = {
        ...buildHeaders(tokenOverride),
        'Content-Type': 'application/json',
        'content-type': 'application/json; charset=UTF-8',
    };
    const body = { checkId };
    
    const axiosConfig = { headers };
    const proxyAgent = buildProxyAgent(proxy);
    if (proxyAgent) {
        axiosConfig.httpsAgent = proxyAgent;
        axiosConfig.httpAgent = proxyAgent;
    }
    
    const res = await axios.post(url, body, axiosConfig);
    return res.data;
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
                    const checkRes = await checkResultScanCodeQueue(checkId, account.token, proxy);
                    const checkData = checkRes?.data || {};
                    const goodLuck = checkData.goodLuck;
                    const prizeName = checkData.prizeName || checkData.name || checkData.giftName || null;

                    appendLog(`${accountName} | ${code.code} | CHECK_GIFT | checkId=${checkId} | goodLuck=${goodLuck}`);

                    await CodeModel.update(code.id, { status: 'used' });
                    
                    let prizeText = 'No Prize';
                    if (goodLuck === false && prizeName) {
                        prizeText = prizeName;
                        // Thêm vào danh sách giải đã trúng
                        addPrize({
                            account: accountName,
                            code: code.code,
                            prize: prizeName,
                            time: new Date().toISOString(),
                        });
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

        appendLog(`${accountName} | ${code.code} | EXCEPTION | ${msg}`);

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

export async function startExchangeGift({ accountCollectionId, proxyCollectionId, codeCollectionId, timeoutMs }) {
    if (taskRunning) {
        return { success: false, error: 'Task đang chạy' };
    }

    taskRunning = true;
    taskProgress = [];
    taskLogs = [];
    prizeList = [];

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

            appendLog(`Bắt đầu task với ${accounts.length} accounts, ${proxies.length} proxies, ${codes.length} codes`);

            // Kiểm tra số lượng proxy
            if (proxies.length < accounts.length) {
                appendLog(`Cảnh báo: Chỉ có ${proxies.length} proxies nhưng có ${accounts.length} accounts. Chỉ chạy ${proxies.length} accounts đầu tiên.`);
            }

            // Shuffle proxies để phân phối ngẫu nhiên
            const shuffledProxies = [...proxies].sort(() => Math.random() - 0.5);
            
            // Chạy đa luồng - mỗi account chạy song song với proxy riêng
            // Thêm delay giữa các account để tránh "Too many request"
            const accountPromises = accounts.slice(0, proxies.length).map(async (account, i) => {
                if (!taskRunning) return;

                // Delay giữa các account khi bắt đầu (mỗi account cách nhau 2 giây)
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000 * i));
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

                const activeCodes = codes.filter(c => c.status === 'active');
                
                for (const code of activeCodes) {
                    if (!taskRunning) break;

                    const codeData = CodeModel.getById(code.id);
                    if (codeData.status !== 'active') continue;

                    await processCodeForAccount(account, proxy, codeData, timeoutMs);
                }
            });

            await Promise.all(accountPromises);

            taskRunning = false;
            appendLog('Task hoàn thành');
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
    return { success: true, data: taskProgress };
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

