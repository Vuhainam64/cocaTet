import axios from 'axios';

/**
 * Base URL Coke Tết UTC
 */
const BASE_URL = 'https://coke-tet-utc-public-api.adtimabox.vn/digital-api';

/**
 * Base URL server giải captcha
 * Có thể override qua .env: CAPTCHA_SERVER_URL
 */
const CAPTCHA_SERVER_URL =
  process.env.CAPTCHA_SERVER_URL || 'http://cocacap.kimidev.net:5092';

/**
 * PRODUCT_ID mặc định của campaign Tết
 * Nếu cần đổi, sửa trực tiếp hằng số này.
 */
const PRODUCT_ID = '69255e712d8de7e52b4a2a23';

/**
 * Chuẩn hóa token người dùng nhập (có thể có hoặc không có "Bearer ")
 */
function normalizeToken(token) {
  if (!token) return '';
  const trimmed = String(token).trim();
  if (/^Bearer\s+/i.test(trimmed)) return trimmed;
  return `Bearer ${trimmed}`;
}

/**
 * Tạo headers mặc định cho tất cả request
 * Nếu truyền tokenOverride thì dùng token đó (chấp nhận có hoặc không có "Bearer ")
 */
function buildHeaders(tokenOverride) {
  const authToken = normalizeToken(tokenOverride);
  return {
    'User-Agent':
      'Mozilla/5.0 (Linux; Android 12L; CPH2119 Build/SP1A.210812.016;) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/142.0.7444.102 Mobile Safari/537.36 Zalo android/251010850 ZaloTheme/light ZaloLanguage/en',
    Accept: 'application/json',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'sec-ch-ua-platform': '"Android"',
    authorization: authToken, // "Bearer ..."
    'sec-ch-ua':
      '"Chromium";v="142", "Android WebView";v="142", "Not_A Brand";v="99"',
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

/**
 * Lấy profile user
 * GET /digital-user/me
 * @param {string} [tokenOverride] - token riêng cho tài khoản (nếu có)
 */
export async function getProfile(tokenOverride) {
  const url = `${BASE_URL}/digital-user/me`;
  const headers = buildHeaders(tokenOverride);

  const res = await axios.get(url, { headers });
  return res.data;
}

/**
 * Lấy captcha
 * GET /digital-campaign-utc-codes/getSmartCaptcha?length=3&charsetType=alphabet
 *
 * length, charsetType có thể custom qua options.
 * @param {object} [options]
 * @param {string} [tokenOverride] - token riêng cho tài khoản (nếu có)
 */
export async function getSmartCaptcha(options = {}, tokenOverride) {
  const { length = 3, charsetType = 'alphabet' } = options;
  const url = `${BASE_URL}/digital-campaign-utc-codes/getSmartCaptcha?length=${length}&charsetType=`;
  const headers = buildHeaders(tokenOverride);

  const res = await axios.get(url, { headers });
  return res.data;
}

/**
 * Check code (scan code)
 * POST /digital-campaign-utc-codes/checkCode
 *
 * payload mẫu:
 * {
 *   code: "92KUK2YV3RV",
 *   mparams: {},
 *   productId: "69255e712d8de7e52b4a2a23",
 *   recaptcha: "BCQ"
 * }
 * @param {object} params
 * @param {string} params.code
 * @param {object} [params.mparams]
 * @param {string} [params.productId]
 * @param {string} params.recaptcha
 * @param {string} [tokenOverride] - token riêng cho tài khoản (nếu có)
 */
export async function checkCode(
  { code, mparams = {}, productId = PRODUCT_ID, recaptcha },
  tokenOverride,
) {
  const url = `${BASE_URL}/digital-campaign-utc-codes/checkCode`;
  const headers = {
    ...buildHeaders(tokenOverride),
    'Content-Type': 'application/json',
    'content-type': 'application/json; charset=UTF-8',
  };

  const body = {
    code,
    mparams,
    productId,
    recaptcha,
  };

  const res = await axios.post(url, body, { headers });
  return res.data;
}

/**
 * Check kết quả scan code (hàng chờ)
 * POST /digital-campaign-gifts/checkResultScanCodeQueue
 *
 * payload: { checkId: "69304967e9c95fafb45865b1" }
 * @param {string} checkId
 * @param {string} [tokenOverride] - token riêng cho tài khoản (nếu có)
 */
export async function checkResultScanCodeQueue(checkId, tokenOverride) {
  const url = `${BASE_URL}/digital-campaign-gifts/checkResultScanCodeQueue`;
  const headers = {
    ...buildHeaders(tokenOverride),
    'Content-Type': 'application/json',
    'content-type': 'application/json; charset=UTF-8',
  };

  const body = { checkId };

  const res = await axios.post(url, body, { headers });
  return res.data;
}

/**
 * Gọi server giải captcha
 * payload ví dụ (tuỳ theo server của bạn):
 * {
 *   data: {
 *     value,
 *     images,
 *     type: "cCaptcha" | "sCaptcha" | ...
 *   },
 *   type: "cCaptcha"
 * }
 */
export async function solveCaptchaOnServer(payload) {
  const url = `${CAPTCHA_SERVER_URL}/solve-captcha`;
  const res = await axios.post(
    url,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return res.data;
}

/**
 * Gom nhóm API cho dễ dùng
 */
export const cocaApi = {
  getProfile,
  getSmartCaptcha,
  checkCode,
  checkResultScanCodeQueue,
};

export const captchaApi = {
  solveCaptchaOnServer,
};

export default {
  cocaApi,
  captchaApi,
};

