const jwt = require('jsonwebtoken');
const moment = require('moment')
const { generateRandomString } = require('../utils/generateRandomString')
const { userTable, refreshTokens } = require('../../config/database');

const secretKeys = {};

function createToken(payload) {
  const { id, username } = payload
  const secretKey = generateRandomString(32); // 应该是一个随机的、安全的字符串
  const accessToken = jwt.sign({id, username}, secretKey, { expiresIn: '1h' });
  const refreshToken = jwt.sign({id, username}, secretKey);
  const expires = moment().add(1, 'hour');
  refreshTokens[refreshToken] = true
  secretKeys[id] = secretKey
  secretKeys[refreshToken] = secretKey
  console.log('createToken', secretKey);
  return { accessToken, refreshToken, expires }
}

function refreshTokenFn(refreshToken) {
  return new Promise((resolve, reject) => {
    if (refreshToken in refreshTokens) {
      const secretKey = secretKeys[refreshToken]
      const { username } = jwt.verify(refreshToken, secretKey);
      const { id } = userTable[username]
      const newAccessToken = jwt.sign({ id, username }, secretKey, { expiresIn: '1h' });
      const newRefreshToken = jwt.sign({id, username}, secretKey);
      const expires = moment().add(1, 'hour');
      resolve({ id, newAccessToken, newRefreshToken, expires })
    } else {
      reject()
    }
  })
}

function verifyToken(req) {
  return new Promise((resolve, reject) => {
    const token = req.headers['authorization'].split(' ')[1];
    const { id } = req.query
    try {
      const secretKey = secretKeys[id]
      console.log('secretKey', secretKey);
      const decoded = jwt.verify(token, secretKey);
      console.log('Decoded JWT:', decoded);
      resolve(decoded)
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      reject(error)
    }
  })
}

module.exports = {
  createToken,
  refreshTokenFn,
  verifyToken
}