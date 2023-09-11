const crypto = require('crypto');

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  const result = [];
  
  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % characters.length;
    result.push(characters[index]);
  }
  
  return result.join('');
}

module.exports = {
  generateRandomString
}