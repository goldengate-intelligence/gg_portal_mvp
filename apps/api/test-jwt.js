const jwt = require('jsonwebtoken');

const secret = 'dev-super-secret-jwt-key-change-this-in-production-minimum-32-characters';
const payload = {
  sub: '510cd321-2066-4338-94ed-7f899055a0ea',
  email: 'john@hedge.com',
  role: 'member',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
};

const token = jwt.sign(payload, secret);
console.log(token);
