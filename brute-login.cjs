const axios = require('axios');
const BASE_URL = 'http://72.62.130.152:7001/api/v1';

const tests = [
    { e: 'admin@pambaso.com', p: 'admin123' },
    { e: 'admin@pambaso.com', p: 'pambazo123' },
    { e: 'admin@pambaso.com', p: '123456' },
    { e: 'admin@pambazo.com', p: 'admin123' },
    { e: 'admin@pambazo.com', p: 'pambazo123' },
    { e: 'admin@pambazo.com', p: '123456' },
    { e: 'admin', p: 'admin123' },
    { e: 'admin', p: 'pambazo123' },
    { e: 'admin', p: '123456' },
    { e: 'owner@pambaso.com', p: 'admin123' },
    { e: 'owner@pambazo.com', p: 'admin123' }
];

async function run() {
    for (const t of tests) {
        try {
            console.log(`Trying ${t.e} / ${t.p}...`);
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email: t.e,
                username: t.e,
                password: t.p
            });
            console.log('✅ SUCCESS!', JSON.stringify(res.data));
            return;
        } catch (e) {
            console.log(`❌ Fail: ${e.response ? JSON.stringify(e.response.data) : e.message}`);
        }
    }
}
run();
