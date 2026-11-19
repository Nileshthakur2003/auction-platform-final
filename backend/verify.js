// Quick smoke test verifying models, routes, and password hashing
const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testBackend() {
  console.log('Testing backend core components...');

  // 1. Test bcrypt
  const pwd = 'secretpassword123';
  const hashed = await bcrypt.hash(pwd, 10);
  const matched = await bcrypt.compare(pwd, hashed);
  assert.strictEqual(matched, true, 'Bcrypt password comparison should match');
  console.log('✔ Bcrypt hashing works');

  // 2. Test JWT
  const secret = 'testsecretkey';
  const token = jwt.sign({ userId: '12345', email: 'test@example.com' }, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);
  assert.strictEqual(decoded.userId, '12345', 'JWT payload userId should match');
  console.log('✔ JWT generation and verification works');

  // 3. Test modules loading
  const authRoutes = require('./routes/auth');
  const auctionRoutes = require('./routes/auctions');
  const bidRoutes = require('./routes/bids');
  assert.ok(authRoutes && auctionRoutes && bidRoutes, 'Routes should load without error');
  console.log('✔ All route modules load cleanly');

  console.log('Backend smoke tests passed successfully!');
}

testBackend().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
