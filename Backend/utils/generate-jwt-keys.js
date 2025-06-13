const { generateKeyPairSync } = require('crypto');
const fs = require('fs');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

fs.writeFileSync('jwt-public-key.pem', publicKey.export({ type: 'spki', format: 'pem' }));
fs.writeFileSync('jwt-private-key.pem', privateKey.export({ type: 'pkcs8', format: 'pem' }));

console.log('JWT key pair generated. Convert to base64 for .env:');
console.log('Public Key:', publicKey.export({ type: 'spki', format: 'pem' }).toString('base64'));
console.log('Private Key:', privateKey.export({ type: 'pkcs8', format: 'pem' }).toString('base64'));