const QRCode = require('qrcode');
const logger = require('./logger');

const generateQRCode = async (data) => {
  try {
    if (!data) {
      throw new Error('No data provided for QR code generation');
    }

    // Generate QR code as a data URL (base64-encoded PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H', // High error correction for reliability
      type: 'image/png',
      margin: 1
    });

    logger.info(`QR code generated for data: ${data}`);
    return qrCodeDataUrl;
  } catch (error) {
    logger.error(`QR code generation error: ${error.message}`);
    throw error;
  }
};

module.exports = { generateQRCode };