const http = require('http');

// Helper wrapper for http request
function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/v1' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject({ status: res.statusCode, error: parsed });
                    }
                } catch (e) {
                    reject({ status: res.statusCode, error: body });
                }
            });
        });

        req.on('error', (e) => reject({ error: e.message }));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function verify() {
    console.log('VERIFICATION START - ROLE: OWNER');
    console.log('--------------------------------');

    try {
        // 1. Login
        console.log('Authenticating...');
        const loginRes = await request('POST', '/auth/login', {
            email: 'owner@pambazo.com',
            password: 'pambazo123'
        });
        const token = loginRes.data.tokens.accessToken;
        console.log('Login Success.');

        // 2. Check Modulos
        const endpoints = [
            { name: 'Staff (Users)', url: '/users', method: 'GET' },
            { name: 'Products', url: '/products', method: 'GET' },
            { name: 'Inventory', url: '/inventory', method: 'GET' },
            { name: 'Finance (Summary)', url: '/finance/summary', method: 'GET' },
            { name: 'Finance (Shifts)', url: '/shifts', method: 'GET' },
            { name: 'Analytics (Sales)', url: '/analytics/sales', method: 'GET' },
            { name: 'Stats (Overview)', url: '/stats/overview', method: 'GET' }
        ];

        let successCount = 0;

        for (const ep of endpoints) {
            try {
                process.stdout.write(`Checking ${ep.name}... `);
                await request(ep.method, ep.url, null, token);
                console.log('OK');
                successCount++;
            } catch (err) {
                console.log(`FAILED (${err.status || 'ERR'} - ${JSON.stringify(err.error)})`);
            }
        }

        console.log('--------------------------------');
        console.log(`RESULT: ${successCount}/${endpoints.length} Routes Working.`);

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

verify();
