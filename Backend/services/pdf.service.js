const PDFDocument = require('pdfkit');

const generateVaccinePDF = async (pet, vaccines, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(20).text('Pet Vaccine Record', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Pet: ${pet.name} (${pet.species}, ${pet.breed})`);
    doc.text(`Owner: ${user.name} (${user.email})`);
    doc.moveDown();

    vaccines.forEach(v => {
      doc.text(`Vaccine: ${v.name} (${v.brand})`);
      doc.text(`Preventative: ${v.preventative}`);
      doc.text(`Administered: ${new Date(v.dateAdministered).toLocaleDateString()}`);
      doc.text(`Due: ${new Date(v.dateDue).toLocaleDateString()}`);
      doc.text(`Location: ${v.location?.name || 'N/A'}`);
      doc.text(`Administered By: ${v.administeredBy || 'N/A'}`);
      doc.moveDown();
    });

    doc.end();
  });
};

module.exports = { generateVaccinePDF };