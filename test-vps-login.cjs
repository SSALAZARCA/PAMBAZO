const axios = require('axios');

async function test() {
    const email = 'admin@pambazo.com';
    const passwords = ['pambazo123', 'admin123', '123456'];

    for (const password of passwords) {
        try {
            console.log(`Intentando login con ${email} / ${password}...`);
            const res = await axios.post('http://72.62.130.152:7001/api/v1/auth/login', { email, password });
            console.log('✅ ÉXITO:', res.data);
            return;
        } catch (e) {
            console.log(`❌ FALLO (${password}):`, e.response ? e.response.status : e.message, e.response ? e.response.data : '');
        }
    }
}

test();
