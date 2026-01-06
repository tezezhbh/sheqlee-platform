const crypto = require('crypto');

// Generate a random token (plain)
exports.createToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash a token before saving to DB
exports.hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Verify token by comparing hashed values
exports.verifyToken = (rawToken, hashedToken) => {
  const hashedRawToken = exports.hashToken(rawToken);
  return hashedRawToken === hashedToken;
};
