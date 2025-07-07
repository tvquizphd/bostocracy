const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Django password hashing utilities
function djangoPasswordHash(password, salt) {
  const hash = crypto.createHash('sha1');
  hash.update(salt + password);
  return 'sha1$' + salt + '$' + hash.digest('hex');
}

function djangoPasswordVerify(password, hashedPassword) {
  // Handle Django's password format: algorithm$salt$hash
  const parts = hashedPassword.split('$');
  if (parts.length !== 3) {
    return false;
  }
  
  const algorithm = parts[0];
  const salt = parts[1];
  const hash = parts[2];
  
  if (algorithm === 'sha1') {
    const expectedHash = crypto.createHash('sha1')
      .update(salt + password)
      .digest('hex');
    return hash === expectedHash;
  }
  
  return false;
}

// Check if a password hash is in Django format
function isDjangoPasswordHash(hashedPassword) {
  return hashedPassword.includes('$') && hashedPassword.startsWith('sha1$');
}

// Verify password against either Django or bcrypt hash
async function verifyPassword(password, hashedPassword) {
  if (isDjangoPasswordHash(hashedPassword)) {
    return djangoPasswordVerify(password, hashedPassword);
  } else {
    // Assume bcrypt hash
    return await bcrypt.compare(password, hashedPassword);
  }
}

// Hash password using bcrypt (for new users)
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

module.exports = {
  djangoPasswordHash,
  djangoPasswordVerify,
  isDjangoPasswordHash,
  verifyPassword,
  hashPassword
}; 