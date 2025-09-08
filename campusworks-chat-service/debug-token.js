const jwt = require('jsonwebtoken');

// Test JWT secret
const jwtSecret = 'mysupersecuresecretkeythatismorethan32chars';

// Test token (you can replace this with a real token from localStorage)
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlcyI6IlVTRVIiLCJpYXQiOjE2MzA5NTU2MDAsImV4cCI6MTYzMDk1OTIwMH0.test';

console.log('JWT Secret:', jwtSecret);
console.log('Test Token:', testToken);

try {
  // Try to decode without verification
  const decoded = jwt.decode(testToken);
  console.log('Decoded token:', decoded);
  
  // Try to verify
  const verified = jwt.verify(testToken, jwtSecret);
  console.log('Verified token:', verified);
} catch (error) {
  console.error('JWT Error:', error.message);
}
