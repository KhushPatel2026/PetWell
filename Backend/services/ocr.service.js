const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getFile } = require('./s3.service');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const processVaccineDocument = async (s3Key, petId, userId) => {
  const file = await getFile(s3Key);
  const result = await model.generateContent([
    { inlineData: { mimeType: 'application/pdf', data: file.Body.toString('base64') } },
    { text: 'Extract vaccine information: brand, preventative, name, date administered, date due, administered by. Return as JSON.' }
  ]);

  const vaccineData = JSON.parse(result.response.text());
  return {
    petId,
    userId,
    brand: vaccineData.brand,
    preventative: vaccineData.preventative,
    name: vaccineData.name,
    dateAdministered: new Date(vaccineData.dateAdministered),
    dateDue: new Date(vaccineData.dateDue),
    administeredBy: vaccineData.administeredBy,
    attestation: true
  };
};

const processDocument = async (s3Key) => {
  const file = await getFile(s3Key);
  const result = await model.generateContent([
    { inlineData: { mimeType: file.ContentType, data: file.Body.toString('base64') } },
    { text: 'Summarize the document content in 100 words or less.' }
  ]);

  return result.response.text();
};

module.exports = { processVaccineDocument, processDocument };