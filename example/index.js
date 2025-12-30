import fs from 'fs';
import readline from 'readline';
const { cocaApi, captchaApi } = api;

const TOKENS_FILE = 'tokens.json';
const CODE_FILE = 'code.txt';
const CODE_ERROR_FILE = 'code_error.txt';
const LOG_FILE = 'log.txt';
const GIFT_FILE = 'gift.txt';

function loadTokens() {
  if (!fs.existsSync(TOKENS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

function ask(question, rl) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function chooseAccount() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let tokens = loadTokens();

  // Nếu chưa có tài khoản nào, bắt buộc nhập mới ít nhất 1 cái
  while (Object.keys(tokens).length === 0) {
    console.log('Chưa có tài khoản nào. Vui lòng thêm mới:');
    const token = await ask('Nhập token (có thể có hoặc không có "Bearer"): ', rl);
    const name = await ask('Đặt tên cho tài khoản này: ', rl);
    tokens[name.trim() || `acc_${Date.now()}`] = token.trim();
    saveTokens(tokens);
  }

  while (true) {
    const names = Object.keys(tokens);
    console.log('\n=== Danh sách tài khoản ===');
    names.forEach((name, i) => {
      console.log(`${i + 1}. ${name}`);
    });
    console.log(`${names.length + 1}. Thêm tài khoản mới`);
    console.log(`${names.length + 2}. Xóa tài khoản`);

    const idx = await ask('Chọn tài khoản để chạy: ', rl);
    const num = parseInt(idx, 10);

    if (!Number.isNaN(num) && num >= 1 && num <= names.length) {
      const chosenName = names[num - 1];
      const token = tokens[chosenName];
      rl.close();
      return { name: chosenName, token };
    }

    if (num === names.length + 1) {
      // Thêm mới
      const token = await ask('Nhập token (có thể có hoặc không có "Bearer"): ', rl);
      const name = await ask('Đặt tên cho tài khoản này: ', rl);
      tokens[name.trim() || `acc_${Date.now()}`] = token.trim();
      saveTokens(tokens);
      continue;
    }

    if (num === names.length + 2) {
      // Xóa tài khoản
      const delIdx = await ask('Nhập số thứ tự tài khoản muốn xóa: ', rl);
      const delNum = parseInt(delIdx, 10);
      if (!Number.isNaN(delNum) && delNum >= 1 && delNum <= names.length) {
        const delName = names[delNum - 1];
        const confirm = await ask(`Chắc chắn xóa '${delName}'? (y/n): `, rl);
        if (confirm.trim().toLowerCase() === 'y') {
          delete tokens[delName];
          saveTokens(tokens);
          console.log(`Đã xóa '${delName}'.`);
        } else {
          console.log('Đã hủy xóa.');
        }
      } else {
        console.log('Số thứ tự không hợp lệ.');
      }
      continue;
    }

    console.log('Lựa chọn không hợp lệ, vui lòng thử lại.');
  }
}

function loadCodes() {
  if (!fs.existsSync(CODE_FILE)) return [];
  return fs
    .readFileSync(CODE_FILE, 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l);
}

function saveCodes(codes) {
  fs.writeFileSync(CODE_FILE, codes.join('\n'));
}

function appendLine(file, line) {
  fs.appendFileSync(file, `${line}\n`);
}

function saveImageFromBase64(imageBase64, imagePath) {
  let base64Data = imageBase64;
  if (base64Data.startsWith('data:image')) {
    base64Data = base64Data.split(',')[1];
  }
  const buf = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(imagePath, buf);
}

async function solveCaptchaForTet(token) {
  const captchaRes = await cocaApi.getSmartCaptcha({ length: 3, charsetType: 'alphabet' }, token);
  if (!captchaRes || captchaRes.statusCode !== 200 || !captchaRes.data) {
    throw new Error(`Lấy captcha thất bại: ${captchaRes && captchaRes.message}`);
  }

  const captchaData = captchaRes.data;

  // Nếu là cCaptcha (value + images) -> dùng server giải captcha
  if (captchaData.value && captchaData.images) {
    const serverPayload = {
      data: {
        value: captchaData.value,
        images: captchaData.images,
        type: 'cCaptcha',
      },
      type: 'cCaptcha',
    };

    const serverRes = await captchaApi.solveCaptchaOnServer(serverPayload);
    const recaptcha = serverRes?.result || serverRes?.data?.result;

    appendLine(
      LOG_FILE,
      `${new Date().toISOString()} | CAPTCHA_SERVER_RESPONSE | ${JSON.stringify(serverRes)}`,
    );

    if (!recaptcha) {
      throw new Error(
        `Server giải captcha (cCaptcha) không trả về result hợp lệ: ${JSON.stringify(serverRes)}`,
      );
    }

    return { recaptcha, raw: { captchaRes, serverRes } };
  }

  // Ngược lại coi như sCaptcha (chỉ có image) -> dùng OCR local cocaTet/captcha/text.js
  const imageBase64 = captchaData.image;
  if (!imageBase64) {
    throw new Error(`Dữ liệu captcha không có image: ${JSON.stringify(captchaData)}`);
  }

  const imagePath = 'captcha.png';
  saveImageFromBase64(imageBase64, imagePath);

  const { ocrCaptcha } = await import('./captcha/text.js');
  const recaptcha = await ocrCaptcha(imagePath);

  appendLine(
    LOG_FILE,
    `${new Date().toISOString()} | S_CAPTCHA_OCR_RESULT | ${recaptcha}`,
  );

  if (!recaptcha) {
    throw new Error('OCR captcha (sCaptcha) không đọc được ký tự hợp lệ');
  }

  return { recaptcha, raw: { captchaRes } };
}

async function runNhapCodeForAccount(account, timeoutMs = 2000) {
  let codes = loadCodes();
  if (codes.length === 0) {
    console.log('Không có code nào trong code.txt');
    return;
  }

  console.log(`\n=== Bắt đầu nhập code cho tài khoản: ${account.name} ===`);

  while (codes.length > 0) {
    const code = codes[0];
    console.log(`\nĐang xử lý code: ${code}`);

    try {
      // 1. Solve captcha
      const { recaptcha } = await solveCaptchaForTet(account.token);
      console.log(`Captcha solve được: ${recaptcha}`);

      // 2. Gửi checkCode
      const res = await cocaApi.checkCode({ code, recaptcha }, account.token);
      const logBase = `${new Date().toISOString()} | ${account.name} | ${code}`;

      if (res && res.statusCode === 200) {
        appendLine(LOG_FILE, `${logBase} | SUCCESS | CHECK_CODE | ${JSON.stringify(res.data)}`);
        console.log('✅ Thành công checkCode:', res.data);

        // 3. Check quà bằng checkResultScanCodeQueue với logId / checkId
        const checkId = res.data?.logId || res.data?.checkId;
        if (checkId) {
          try {
            const checkRes = await cocaApi.checkResultScanCodeQueue(checkId, account.token);
            const checkData = checkRes?.data || {};

            // Theo rule thực tế: TRÚNG khi goodLuck === false
            const goodLuck = checkData.goodLuck;
            const hasGift = goodLuck === false;

            appendLine(
              LOG_FILE,
              `${logBase} | CHECK_GIFT | checkId=${checkId} | goodLuck=${goodLuck}`,
            );

            if (hasGift) {
              console.log('🎉 Có quà! Chi tiết:', checkData);
              appendLine(
                GIFT_FILE,
                `${new Date().toISOString()} | ${account.name} | ${code} | checkId=${checkId} | GIFT | ${JSON.stringify(
                  checkData,
                )}`,
              );
            } else {
              console.log('😔 Không có quà (goodLuck=true).');
            }
          } catch (e) {
            appendLine(
              LOG_FILE,
              `${logBase} | CHECK_GIFT_ERROR | ${e.message}`,
            );
            console.log('⚠️ Lỗi khi check quà:', e.message);
          }
        } else {
          appendLine(LOG_FILE, `${logBase} | NO_CHECK_ID_IN_RESPONSE`);
          console.log('⚠️ Không tìm thấy checkId/logId trong response, bỏ qua check quà.');
        }
      } else {
        appendLine(LOG_FILE, `${logBase} | ERROR | ${JSON.stringify(res)}`);
        appendLine(CODE_ERROR_FILE, `${code} | ${res ? res.message : 'Unknown error'}`);
        console.log('❌ Lỗi khi check code:', res);
      }
    } catch (err) {
      const apiBody = err.response?.data;
      const msg = apiBody ? JSON.stringify(apiBody) : err.message;

      appendLine(
        LOG_FILE,
        `${new Date().toISOString()} | ${account.name} | ${code} | EXCEPTION | ${msg}`,
      );
      appendLine(CODE_ERROR_FILE, `${code} | EXCEPTION | ${msg}`);
      console.log('⚠️ Lỗi exception:', msg);
    }

    // Sau khi xử lý xong (dù thành công hay lỗi), xoá code khỏi danh sách
    codes.shift();
    saveCodes(codes);

    // Delay giữa các code
    if (timeoutMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeoutMs));
    }
  }

  console.log('\nĐã xử lý xong toàn bộ code trong code.txt');
}

async function main() {
  const account = await chooseAccount();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('\n=== Chọn chức năng ===');
  console.log('1. Nhập code từ code.txt');
  console.log('2. Thoát');
  const choice = await ask('Nhập lựa chọn: ', rl);

  if (choice.trim() === '1') {
    const timeoutStr = await ask(
      'Nhập thời gian nghỉ giữa mỗi code (ms, mặc định 2000): ',
      rl,
    );
    const timeoutMs = parseInt(timeoutStr, 10);
    rl.close();
    await runNhapCodeForAccount(account, Number.isNaN(timeoutMs) ? 2000 : timeoutMs);
  } else {
    rl.close();
    console.log('Thoát.');
  }
}

main().catch((e) => {
  console.error('Lỗi chương trình chính:', e);
});


