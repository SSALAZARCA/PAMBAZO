const axios = require('axios');

async function verify() {
    const baseURL = 'http://localhost:3001/api/v1';

    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            email: 'customer@pambazo.com',
            password: 'pambazo123'
        });

        const token = loginRes.data.data.tokens.accessToken;
        const userId = loginRes.data.data.user.id;
        console.log('   Login successful. User ID:', userId);

        // 2. Get Products
        console.log('2. Fetching products...');
        const prodRes = await axios.get(`${baseURL}/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const products = prodRes.data.data;
        console.log(`   Found ${products.length} products.`);
        if (products.length > 0) {
            console.log('   Sample Product:', products[0].name, 'Price:', products[0].price);
        } else {
            console.error('   NO PRODUCTS FOUND. Order creation might fail or have 0 total.');
        }

        // 3. Create Order
        if (products.length > 0) {
            console.log('3. Creating test order...');
            const orderData = {
                items: [
                    { product_id: products[0].id, quantity: 2, notes: 'Test item' }
                ],
                order_type: 'pickup',
                customer_name: 'Test Customer Verifier'
            };

            const orderRes = await axios.post(`${baseURL}/orders`, orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('   Order created:', orderRes.data.success);
            console.log('   Order ID:', orderRes.data.data.id);
            console.log('   Order Total:', orderRes.data.data.total);
            console.log('   Order Status:', orderRes.data.data.status);

            if (orderRes.data.data.total === null) {
                console.error('   CRITICAL: ORDER TOTAL IS NULL!');
            }
        }

        // 4. Get Orders
        console.log('4. Fetching order history...');
        const historyRes = await axios.get(`${baseURL}/orders?user=${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   Found ${historyRes.data.data.orders.length} orders for user.`);

    } catch (error) {
        console.error('ERROR:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

verify();
