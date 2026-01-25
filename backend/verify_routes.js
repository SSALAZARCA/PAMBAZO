const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function verify() {
    console.log('🔍 Iniciando Verificación de Rutas para Rol: OWNER');
    console.log('--------------------------------------------------');

    try {
        // 1. Login
        console.log('1️⃣  Autenticando...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'owner@pambazo.com',
            password: 'pambazo123'
        });
        const token = loginRes.data.tokens.accessToken;
        console.log('✅ Login Exitoso. Token recibido.');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Check Modulos
        const endpoints = [
            { name: 'Staff (Usuarios)', url: '/users', method: 'GET' },
            { name: 'Productos', url: '/products', method: 'GET' },
            { name: 'Inventario', url: '/inventory', method: 'GET' },
            { name: 'Finanzas (Resumen)', url: '/finance/summary', method: 'GET' },
            { name: 'Finanzas (Historial Turnos)', url: '/shifts', method: 'GET' },
            { name: 'Analytics (Ventas)', url: '/analytics/sales', method: 'GET' },
            { name: 'Estadísticas (Overview)', url: '/stats/overview', method: 'GET' }
        ];

        let successCount = 0;

        for (const ep of endpoints) {
            try {
                process.stdout.write(`⏳ Verificando ${ep.name}... `);
                await axios.get(`${BASE_URL}${ep.url}`, { headers });
                console.log('✅ OK');
                successCount++;
            } catch (err) {
                console.log(`❌ FALLÓ (${err.response?.status} - ${err.response?.data?.error || err.message})`);
            }
        }

        console.log('--------------------------------------------------');
        console.log(`📊 Resultado: ${successCount}/${endpoints.length} Rutas Funcionando Correctamente.`);

    } catch (error) {
        console.error('❌ Error Crítico en Verificación:', error.message);
        if (error.response) console.error('Detalle:', error.response.data);
    }
}

verify();
