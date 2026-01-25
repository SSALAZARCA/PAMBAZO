const axios = require('axios');
const fs = require('fs');

const logFile = 'verify_log.txt';
fs.writeFileSync(logFile, ''); // clear

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function verify() {
    const baseURL = 'http://localhost:3001/api/v1';

    try {
        log('--- START VERIFICATION ---');
        // 1. Login
        log('1. Logging in...');
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            email: 'customer@pambazo.com',
            password: 'pambazo123'
        });

        const token = loginRes.data.data.tokens.accessToken;
        const userId = loginRes.data.data.user.id;
        log(`   Login successful. User ID: ${userId}`);

        // 2. Get Products
        log('2. Fetching products...');
        const prodRes = await axios.get(`${baseURL}/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const products = prodRes.data.data;
        log(`   Found ${products.length} products.`);

        if (products.length > 0) {
            log(`   Sample Product [0]: ID=${products[0].id} Name="${products[0].name}" Price=${products[0].price} (Type: ${typeof products[0].price})`);
        }

        // 3. Create Order
        if (products.length > 0) {
            log('3. Creating test order...');
            const orderData = {
                items: [
                    { product_id: products[0].id, quantity: 2, notes: 'Test verification' }
                ],
                order_type: 'pickup',
                customer_name: 'Verifier'
            };

            const orderRes = await axios.post(`${baseURL}/orders`, orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            log(`   Order created: ${orderRes.data.success}`);
            log(`   Order ID: ${orderRes.data.data.id}`);
            log(`   Order Total: ${orderRes.data.data.total}`);

            if (orderRes.data.data.total === null) {
                log('   CRITICAL: ORDER TOTAL IS NULL!');
            }
        }

        // 4. Get Orders
        log('4. Fetching order history...');
        const historyRes = await axios.get(`${baseURL}/orders?user=${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        log(`   Found ${historyRes.data.data.orders.length} orders.`);

        log('--- VERIFICATION COMPLETE ---');

    } catch (error) {
        log(`CRITICAL ERROR: ${error.message}`);
        if (error.response) {
            log(`Response Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

verify();
