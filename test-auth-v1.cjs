const axios = require('axios');

async function testAuthV1() {
  try {
    console.log('🔍 Testing API v1 authentication...');
    
    // Test 1: Health check v1
    console.log('\n1. Testing health check v1...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/api/v1/health');
      console.log('✅ Health check v1:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check v1 failed:', error.response?.data || error.message);
    }

    // Test 2: Login with API v1
    console.log('\n2. Testing login v1...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
        email: 'owner@pambazo.com',
        password: 'admin123'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Login v1 successful:', {
        success: loginResponse.data.success,
        user: loginResponse.data.data?.user?.email,
        role: loginResponse.data.data?.user?.role,
        hasToken: !!loginResponse.data.data?.tokens?.accessToken
      });

      // Test 3: Get current user
      if (loginResponse.data.data?.tokens?.accessToken) {
        console.log('\n3. Testing get current user...');
        try {
          const meResponse = await axios.get('http://localhost:3001/api/v1/auth/me', {
            headers: { 
              'Authorization': `Bearer ${loginResponse.data.data.tokens.accessToken}`
            }
          });
          console.log('✅ Get current user successful:', {
            success: meResponse.data.success,
            user: meResponse.data.data?.email,
            role: meResponse.data.data?.role
          });
        } catch (error) {
          console.log('❌ Get current user failed:', error.response?.data || error.message);
        }
      }

    } catch (error) {
      console.log('❌ Login v1 failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testAuthV1();