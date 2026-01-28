const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.JWT_SECRET || 'secret', 'salt', 32); 
const iv = Buffer.alloc(16, 0); // For simplicity in this academic project using static IV for deterministic encryption (searchable). 
// In production, use random IV and store it with data.

exports.encrypt = (text) => {
    if(!text) return text;
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
};

exports.decrypt = (text) => {
    if(!text) return text;
    try {
        const encryptedText = Buffer.from(text, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch(e) {
        return text; // Return original if fail
    }
};
