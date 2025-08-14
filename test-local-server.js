// test-local-server.js
// ไฟล์ทดสอบการทำงานของ local server

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testServer() {
  console.log('🧪 Testing Local Server...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: LINE Auth URL
    console.log('2️⃣ Testing LINE Auth URL...');
    const lineAuthResponse = await axios.get(`${BASE_URL}/api/auth/line/auth-url`);
    console.log('✅ LINE Auth URL:', lineAuthResponse.data);
    console.log('');

    // Test 3: Register User
    console.log('3️⃣ Testing User Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User'
    });
    console.log('✅ User Registration:', registerResponse.data);
    console.log('');

    // Test 4: Login User
    console.log('4️⃣ Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ User Login:', loginResponse.data);
    console.log('');

    // Test 5: Get User Profile (with token)
    console.log('5️⃣ Testing Get User Profile...');
    const token = loginResponse.data.token;
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ User Profile:', profileResponse.data);
    console.log('');

    console.log('🎉 All tests passed! Server is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Server is not running. Please start the server first:');
      console.error('   npm run dev');
    }
  }
}

// Test LINE Process Login (simulated)
async function testLineProcessLogin() {
  console.log('\n🟩 Testing LINE Process Login (Simulated)...');
  
  try {
    const lineLoginResponse = await axios.post(`${BASE_URL}/api/auth/line/process-login`, {
      accessToken: 'simulated_access_token',
      email: 'line_user@example.com',
      displayName: 'LINE User',
      pictureUrl: 'https://example.com/line_photo.jpg'
    });
    console.log('✅ LINE Process Login Response:', lineLoginResponse.data);
  } catch (error) {
    console.log('⚠️ LINE Process Login Test (Expected to fail with invalid token):');
    console.log('   Error:', error.response?.data?.error || error.message);
  }
}

// Run tests
async function runAllTests() {
  await testServer();
  await testLineProcessLogin();
}

// Run if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { testServer, testLineProcessLogin }; 