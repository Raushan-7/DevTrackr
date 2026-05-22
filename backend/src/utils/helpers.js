const crypto = require('crypto');

// Encrypt a cleartext string using AES-256-CBC
const encrypt = (text) => {
  if (!text) return null;
  
  try {
    const keyHex = process.env.GITHUB_ENCRYPTION_KEY;
    const key = Buffer.from(keyHex, 'hex');
    
    // AES-256-CBC expects 16-byte IV
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return concatenated IV and ciphertext
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('Encryption failed:', err.message);
    throw new Error('Token encryption failed.');
  }
};

// Decrypt an AES-256-CBC encrypted token string
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  
  try {
    const keyHex = process.env.GITHUB_ENCRYPTION_KEY;
    const key = Buffer.from(keyHex, 'hex');
    
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Malformed encrypted token.');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    throw new Error('Token decryption failed.');
  }
};

module.exports = {
  encrypt,
  decrypt
};
