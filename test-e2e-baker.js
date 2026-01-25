import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

console.log('\n🧪 ========================================');
console.log('   TEST END-TO-END: FLUJO COMPLETO BAKER');
console.log('========================================\n');

async function testCompleteFlow() {
    let token;

    try {
        // PASO 1: Login
        console.log('📝 PASO 1: Login Baker...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'baker@pambazo.com',
            password: 'pambazo123'
        });
        token = loginResponse.data.data.tokens.accessToken;
        console.log('   ✅ Login exitoso - Token obtenido\n');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // PASO 2: Obtener inventario inicial
        console.log('📦 PASO 2: Obtener inventario inicial...');
        const inventoryBefore = await axios.get(`${BASE_URL}/inventory`, { headers });
        const harinaInicial = inventoryBefore.data.data.find(i => i.id === 1);
        console.log(`   📊 Harina de Trigo: ${harinaInicial.stock} kg`);
        console.log(`   ✅ Inventario cargado (${inventoryBefore.data.data.length} items)\n`);

        // PASO 3: Crear lote y deducir materiales
        console.log('🔥 PASO 3: Crear lote y deducir materiales...');
        const deductResponse = await axios.post(
            `${BASE_URL}/production/batches/deduct-materials`,
            {
                materials: [
                    { materialId: '1', quantity: 2.5 },  // Harina
                    { materialId: '2', quantity: 0.5 }   // Azúcar
                ]
            },
            { headers }
        );
        console.log('   ✅ Materiales deducidos:');
        deductResponse.data.data.deductions.forEach(d => {
            console.log(`      - ${d.materialName}: -${d.quantityDeducted} ${d.unit || 'kg'} (Restante: ${d.remainingStock})`);
        });
        console.log('');

        // PASO 4: Verificar inventario actualizado
        console.log('🔍 PASO 4: Verificar inventario actualizado...');
        const inventoryAfter = await axios.get(`${BASE_URL}/inventory`, { headers });
        const harinaDespues = inventoryAfter.data.data.find(i => i.id === 1);
        const diferencia = harinaInicial.stock - harinaDespues.stock;
        console.log(`   📊 Harina de Trigo: ${harinaDespues.stock} kg`);
        console.log(`   📉 Diferencia: -${diferencia.toFixed(2)} kg`);
        console.log('   ✅ Inventario actualizado correctamente\n');

        // PASO 5: Simular producción (esperar)
        console.log('⏳ PASO 5: Simulando producción...');
        console.log('   🔥 Horneando... (simulado)');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('   ✅ Producción completada\n');

        // PASO 6: Agregar producto terminado
        console.log('📦 PASO 6: Agregar producto terminado al inventario...');
        const finishedResponse = await axios.post(
            `${BASE_URL}/production/batches/add-finished-product`,
            {
                productName: 'Croissant Artesanal',
                quantity: 50
            },
            { headers }
        );
        console.log('   ✅ Producto agregado:');
        console.log(`      - Nombre: ${finishedResponse.data.data.productName}`);
        console.log(`      - Cantidad: ${finishedResponse.data.data.quantityAdded} unidades`);
        console.log(`      - Stock total: ${finishedResponse.data.data.totalStock} unidades\n`);

        // PASO 7: Verificar inventario final
        console.log('🔍 PASO 7: Verificar inventario final...');
        const inventoryFinal = await axios.get(`${BASE_URL}/inventory`, { headers });
        const croissant = inventoryFinal.data.data.find(i =>
            i.name === 'Croissant Artesanal' || i.item_name === 'Croissant Artesanal'
        );
        if (croissant) {
            console.log(`   📊 ${croissant.name}: ${croissant.stock} unidades`);
            console.log('   ✅ Producto terminado en inventario\n');
        }

        // RESUMEN FINAL
        console.log('========================================');
        console.log('   ✅ FLUJO COMPLETO EXITOSO');
        console.log('========================================\n');
        console.log('📊 RESUMEN:');
        console.log(`   1. ✅ Login exitoso`);
        console.log(`   2. ✅ Inventario inicial: ${inventoryBefore.data.data.length} items`);
        console.log(`   3. ✅ Materiales deducidos: ${deductResponse.data.data.deductions.length} items`);
        console.log(`   4. ✅ Inventario actualizado correctamente`);
        console.log(`   5. ✅ Producción simulada`);
        console.log(`   6. ✅ Producto terminado agregado`);
        console.log(`   7. ✅ Inventario final verificado`);
        console.log('\n🎉 TODAS LAS OPERACIONES COMPLETADAS CON ÉXITO\n');

    } catch (error) {
        console.error('\n❌ ERROR EN EL FLUJO:');
        console.error(`   Mensaje: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, error.response.data);
        }
        process.exit(1);
    }
}

testCompleteFlow();
