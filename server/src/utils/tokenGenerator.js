const crypto = require('crypto');

// Cantidad de bytes (ej: 32 bytes = 256 bits)
const bytes = 32;

// Generar secreto aleatorio en formato hexadecimal
const secret = crypto.randomBytes(bytes).toString('hex');

console.log('JWT_SECRET generado:\n');
console.log(secret);
