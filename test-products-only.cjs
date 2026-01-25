const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testProducts() {
  try {
    console.log('🔐 Obteniendo token...');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'owner@pambazo.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Token obtenido');

    // Test products
    console.log('📦 Probando endpoint de productos...');
    const productsResponse = await axios.get(`${BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Productos obtenidos:', productsResponse.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testProducts();