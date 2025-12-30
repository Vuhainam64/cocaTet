import crypto from 'crypto';
import { ProxyAgent } from 'undici';

function hashPassword(password) {
  const md5Hash = crypto.createHash("md5").update(password).digest("hex");
  const sha256Hash = crypto.createHash("sha256").update(md5Hash).digest("hex");
  return sha256Hash;
}

function generateRandomDeviceFingerprint() {
  const part1 = crypto.randomBytes(16).toString('base64');
  const part2 = crypto.randomBytes(64).toString('base64');
  const part3 = crypto.randomBytes(8).toString('base64');
  return `${part1}|${part2}|${part3}|08|3`;
}

function generateCSRFToken() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let index = 0; index < 32; index++) {
    let randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
}

function buildCookieHeaderFromMap(cookieMap) {
  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

function parseSetCookieHeaders(setCookieHeaders, cookieMap) {
  if (!setCookieHeaders) return;
  for (const setCookie of setCookieHeaders) {
    const semiIndex = setCookie.indexOf(';');
    const pair = semiIndex === -1 ? setCookie : setCookie.slice(0, semiIndex);
    const eqIndex = pair.indexOf('=');
    if (eqIndex === -1) continue;
    const name = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();
    if (name) {
      cookieMap.set(name, value);
    }
  }
}

async function postLogin(url, headers, body, cookieMap, proxyAgent) {
  const headersObj = { ...headers };
  if (cookieMap && cookieMap.size > 0) {
    headersObj['cookie'] = buildCookieHeaderFromMap(cookieMap);
  }

  const fetchOptions = {
    method: 'POST',
    headers: headersObj,
    body: JSON.stringify(body),
    redirect: 'manual',
  };

  if (proxyAgent) {
    fetchOptions.dispatcher = proxyAgent;
  }

  const response = await fetch(url, fetchOptions);

  let setCookies = [];
  if (typeof response.headers.getSetCookie === 'function') {
    setCookies = response.headers.getSetCookie();
  } else {
    const single = response.headers.get('set-cookie');
    if (single) {
      setCookies = [single];
    }
  }
  parseSetCookieHeaders(setCookies, cookieMap);

  let json;
  try {
    json = await response.json();
  } catch (_) {
    json = null;
  }

  return { status: response.status, json };
}

export async function convertSPC(entries, proxyId = null) {
  const { getDatabase } = await import('../database/index.js');
  const { ProxyModel } = await import('../database/models/proxy.js');
  
  const db = getDatabase();
  const proxies = proxyId 
    ? [ProxyModel.getById(proxyId)].filter(Boolean)
    : ProxyModel.getAll(null, 'active');

  const csrfToken = generateCSRFToken();
  const baseHeaders = {
    accept: 'application/json',
    'accept-language': 'vi-VN,vi;q=0.9',
    'content-type': 'application/json',
    origin: 'https://shopee.vn',
    priority: 'u=1, i',
    referer: 'https://shopee.vn/buyer/login?next=https%3A%2F%2Fshopee.vn%2F',
    'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'x-api-source': 'pc',
    'x-csrftoken': csrfToken,
    'x-requested-with': 'XMLHttpRequest',
    'x-shopee-language': 'vi',
    'x-sz-sdk-version': '1.12.22-1',
  };
  const loginUrl = 'https://shopee.vn/api/v4/account/login_by_password';

  const outputData = [];
  let currentProxyIndex = -1;
  let currentProxyAgent = null;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const { phonePart, plainPassword, spcF, spcFieldForOutput } = entry;

    if (i % 3 === 0 && proxies.length > 0) {
      currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
      const currentProxy = proxies[currentProxyIndex];
      const proxyUrl = `http://${currentProxy.username}:${currentProxy.password}@${currentProxy.host}:${currentProxy.port}`;
      currentProxyAgent = new ProxyAgent(proxyUrl);
    } else if (proxies.length === 0) {
      currentProxyAgent = null;
    }

    const isPhone = /^\d+$/.test(phonePart);
    const phone = isPhone ? (phonePart.startsWith('84') ? phonePart : `84${phonePart}`) : null;

    const deviceFp = generateRandomDeviceFingerprint();

    const requestBody = isPhone
      ? {
          phone,
          password: hashPassword(plainPassword),
          support_ivs: true,
          client_identifier: {
            security_device_fingerprint: deviceFp,
          },
        }
      : {
          username: phonePart,
          password: hashPassword(plainPassword),
          support_ivs: true,
          client_identifier: {
            security_device_fingerprint: deviceFp,
          },
        };

    const cookieMap = new Map();

    try {
      const first = await postLogin(loginUrl, baseHeaders, requestBody, cookieMap, currentProxyAgent);
      if (first.status >= 400) {
        console.error(`First login call failed for ${phonePart}:`, first.status, first.json);
      }

      if (spcF) {
        cookieMap.set('SPC_F', spcF);
      }

      const second = await postLogin(loginUrl, baseHeaders, requestBody, cookieMap, currentProxyAgent);
      if (second.status >= 400) {
        console.error(`Second login call failed for ${phonePart}:`, second.status, second.json);
      }

      const spcSt = cookieMap.get('SPC_ST') || '';
      const spcStField = `SPC_ST=${spcSt}`;

      outputData.push({
        phonePart,
        plainPassword,
        spcFieldForOutput,
        spcStField,
      });
    } catch (error) {
      console.error(`Error processing ${phonePart}:`, error.message);
      outputData.push({
        phonePart,
        plainPassword,
        spcFieldForOutput,
        spcStField: 'SPC_ST=',
        error: error.message,
      });
    }
  }

  return outputData;
}

