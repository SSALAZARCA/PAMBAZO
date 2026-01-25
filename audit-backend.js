import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3001/api/v1';
const AUTH_URL = 'http://localhost:3001/api/v1/auth';

let token = null;
const results = [];

async function testEndpoint(method, url, description, body = null, requiresAuth = true) {
    try {
        const config = {
            method,
            url,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (requiresAuth && token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) {
            config.data = body;
        }

        const response = await axios(config);
        console.log(`✅ ${description}: OK (${response.status})`);
        results.push({ endpoint: url, description, status: 'OK', code: response.status });
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'ERROR';
        console.log(`❌ ${description}: FAIL (${status})`);
        results.push({ endpoint: url, description, status: 'FAIL', code: status });
        return null;
    }
}

async function runAudit() {
    console.log('\n========================================');
    console.log('AUDITORÍA BACKEND - DASHBOARD PANADERO');
    console.log('========================================\n');

    // 1. HEALTH CHECK
    console.log('[1] HEALTH CHECK');
    await testEndpoint('GET', 'http://localhost:3001/api/health', 'Health Check', null, false);

    // 2. AUTENTICACIÓN
    console.log('\n[2] AUTENTICACIÓN');
    const loginData = await testEndpoint('POST', `${AUTH_URL}/login`, 'Login Baker', {
        email: 'baker@pambazo.com',
        password: 'pambazo123'
    }, false);

    if (loginData?.data?.tokens?.accessToken) {
        token = loginData.data.tokens.accessToken;
        console.log('   Token obtenido correctamente');
    } else {
        console.log('   ⚠️  No se pudo obtener token. Abortando...');
        return;
    }

    // 3. INVENTARIO
    console.log('\n[3] INVENTARIO');
    const inventory = await testEndpoint('GET', `${BASE_URL}/inventory`, 'Obtener Inventario');
    if (inventory?.data) {
        console.log(`   📦 ${inventory.data.length} items en inventario`);
    }

    // 4. PRODUCCIÓN - LOTES
    console.log('\n[4] PRODUCCIÓN - LOTES');
    const batches = await testEndpoint('GET', `${BASE_URL}/production/batches`, 'Obtener Lotes de Producción');
    if (batches?.data) {
        console.log(`   🔥 ${batches.data.length} lotes de producción`);
    }

    // 5. DEDUCCIÓN DE MATERIALES
    console.log('\n[5] DEDUCCIÓN DE MATERIALES');
    await testEndpoint('POST', `${BASE_URL}/production/batches/deduct-materials`, 'Deducir Materiales', {
        materials: [{ materialId: '1', quantity: 0.1 }]
    });

    // 6. AGREGAR PRODUCTO TERMINADO
    console.log('\n[6] PRODUCTO TERMINADO');
    await testEndpoint('POST', `${BASE_URL}/production/batches/add-finished-product`, 'Agregar Producto Terminado', {
        productName: 'Pan de Prueba Auditoría',
        quantity: 5
    });

    // 7. ÓRDENES
    console.log('\n[7] ÓRDENES');
    const orders = await testEndpoint('GET', `${BASE_URL}/orders`, 'Obtener Órdenes');
    if (orders?.data) {
        console.log(`   📋 ${orders.data.length} órdenes`);
    }

    // 8. PRODUCTOS
    console.log('\n[8] PRODUCTOS');
    const products = await testEndpoint('GET', `${BASE_URL}/products`, 'Obtener Productos');
    if (products?.data) {
        console.log(`   🥖 ${products.data.length} productos`);
    }

    // 9. USUARIOS
    console.log('\n[9] USUARIOS');
    const users = await testEndpoint('GET', `${BASE_URL}/users`, 'Obtener Usuarios');
    if (users?.data) {
        console.log(`   👥 ${users.data.length} usuarios`);
    }

    // 10. VERIFICAR db.json
    console.log('\n[10] BASE DE DATOS');
    const dbPath = path.join(__dirname, 'backend', 'db.json');


    if (fs.existsSync(dbPath)) {
        const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        console.log('✅ db.json existe');
        console.log(`   - users: ${dbContent.users?.length || 0} items`);
        console.log(`   - products: ${dbContent.products?.length || 0} items`);
        console.log(`   - inventory: ${dbContent.inventory?.length || 0} items`);
        console.log(`   - orders: ${dbContent.orders?.length || 0} items`);
        console.log(`   - productionBatches: ${dbContent.productionBatches?.length || 0} items`);
    } else {
        console.log('❌ db.json NO existe');
    }

    // RESUMEN
    console.log('\n========================================');
    console.log('RESUMEN DE AUDITORÍA');
    console.log('========================================\n');

    const total = results.length;
    const passed = results.filter(r => r.status === 'OK').length;
    const failed = total - passed;
    const percentage = ((passed / total) * 100).toFixed(2);

    console.log(`Total de pruebas: ${total}`);
    console.log(`✅ Exitosas: ${passed}`);
    console.log(`❌ Fallidas: ${failed}`);
    console.log(`\n📊 Porcentaje de éxito: ${percentage}%`);

    if (percentage >= 80) {
        console.log('🎉 Estado: EXCELENTE');
    } else if (percentage >= 50) {
        console.log('⚠️  Estado: NECESITA ATENCIÓN');
    } else {
        console.log('🚨 Estado: CRÍTICO');
    }

    console.log('\n========================================\n');
}

runAudit().catch(console.error);
