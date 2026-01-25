const axios = require('axios');

async function testbackend() {
    const API_URL = 'http://localhost:3001/api/v1';

    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@pambazo.com',
            password: 'pambazo123'
        });

        const token = loginRes.data.data.tokens.accessToken;
        console.log('Login successful. Token obtained.');

        // 2. Create Item
        console.log('Creating Test Item...');
        const newItem = {
            item_name: "Test Insumo " + Date.now(),
            current_stock: 100,
            min_stock: 10,
            unit: "kg",
            cost_per_unit: 5000,
            supplier: "Tester"
        };

        const createRes = await axios.post(`${API_URL}/inventory`, newItem, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Create Response Status:', createRes.status);
        console.log('Created Item ID:', createRes.data.data.id);

        // 3. Fetch Inventory
        console.log('Fetching Inventory...');
        const fetchRes = await axios.get(`${API_URL}/inventory`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const items = fetchRes.data.data;
        console.log('Total Items:', items.length);

        // 4. Verify
        const found = items.find(i => i.item_name === newItem.item_name);
        if (found) {
            console.log('SUCCESS: Item found in list!', found);
        } else {
            console.error('FAILURE: Item NOT found in list.');
            console.log('List Preview:', items.slice(-3));
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) console.error('Response Data:', error.response.data);
    }
}

testbackend();
