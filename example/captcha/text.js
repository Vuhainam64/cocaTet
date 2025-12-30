import Tesseract from 'tesseract.js';
import fs from 'fs';
import sharp from 'sharp';

async function preprocessImageToWhiteBg(imagePath = './captcha.png') {
  const buffer = await sharp(imagePath).grayscale().threshold(200).toBuffer();
  fs.writeFileSync(imagePath, buffer);
}

async function ocrCaptcha(imagePath = './captcha.png') {
  await preprocessImageToWhiteBg(imagePath);
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, 'eng', { logger: () => {} });
  return text.replace(/[^0-9]/g, '');
}

export { preprocessImageToWhiteBg, ocrCaptcha };

