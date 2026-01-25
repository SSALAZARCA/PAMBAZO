const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';
let authToken = null;

// Función para hacer peticiones autenticadas
const authenticatedRequest = (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
  };
  
  if (data) {
    config.data = data;
    config.headers['Content-Type'] = 'application/json';
  }
  
  return axios(config);
};

async function testCompleteAPI() {
  console.log('🧪 Iniciando pruebas completas de la API v1...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await authenticatedRequest('GET', '/health');
    console.log('✅ Health Check:', healthResponse.data.data.status);
    console.log('   Uptime:', Math.round(healthResponse.data.data.uptime), 'segundos\n');

    // 2. Login
    console.log('2️⃣ Testing Login...');
    const loginResponse = await authenticatedRequest('POST', '/auth/login', {
      email: 'owner@pambazo.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.tokens.accessToken;
      console.log('✅ Login exitoso');
      console.log('   Usuario:', loginResponse.data.data.user.email);
      console.log('   Rol:', loginResponse.data.data.user.role);
      console.log('   Token obtenido ✓\n');
    } else {
      throw new Error('Login falló');
    }

    // 3. Get Current User
    console.log('3️⃣ Testing Get Current User...');
    const meResponse = await authenticatedRequest('GET', '/auth/me');
    console.log('✅ Usuario actual:', meResponse.data.data.email);
    console.log('   Nombre:', meResponse.data.data.firstName, meResponse.data.data.lastName, '\n');

    // 4. Get Users (requiere permisos de admin/owner)
    console.log('4️⃣ Testing Get Users...');
    const usersResponse = await authenticatedRequest('GET', '/users?limit=5');
    console.log('✅ Usuarios obtenidos:', usersResponse.data.data.users.length);
    console.log('   Total en DB:', usersResponse.data.data.pagination.total, '\n');

    // 5. Get Products
    console.log('5️⃣ Testing Get Products...');
    const productsResponse = await authenticatedRequest('GET', '/products?limit=5');
    console.log('✅ Productos obtenidos:', productsResponse.data.data.products.length);
    console.log('   Total en DB:', productsResponse.data.data.pagination.total);
    if (productsResponse.data.data.products.length > 0) {
      console.log('   Primer producto:', productsResponse.data.data.products[0].name);
    }
    console.log();

    // 6. Get Categories
    console.log('6️⃣ Testing Get Categories...');
    const categoriesResponse = await authenticatedRequest('GET', '/categories?limit=5');
    console.log('✅ Categorías obtenidas:', categoriesResponse.data.data.categories.length);
    console.log('   Total en DB:', categoriesResponse.data.data.pagination.total);
    if (categoriesResponse.data.data.categories.length > 0) {
      console.log('   Primera categoría:', categoriesResponse.data.data.categories[0].name);
    }
    console.log();

    // 7. Get Orders
    console.log('7️⃣ Testing Get Orders...');
    const ordersResponse = await authenticatedRequest('GET', '/orders?limit=5');
    console.log('✅ Órdenes obtenidas:', ordersResponse.data.data.orders.length);
    console.log('   Total en DB:', ordersResponse.data.data.pagination.total, '\n');

    // 8. Get Tables
    console.log('8️⃣ Testing Get Tables...');
    const tablesResponse = await authenticatedRequest('GET', '/tables?limit=5');
    console.log('✅ Mesas obtenidas:', tablesResponse.data.data.tables.length);
    console.log('   Total en DB:', tablesResponse.data.data.pagination.total);
    if (tablesResponse.data.data.tables.length > 0) {
      console.log('   Primera mesa:', 'Mesa #' + tablesResponse.data.data.tables[0].number);
    }
    console.log();

    // 9. Get Inventory
    console.log('9️⃣ Testing Get Inventory...');
    const inventoryResponse = await authenticatedRequest('GET', '/inventory?limit=5');
    console.log('✅ Items de inventario obtenidos:', inventoryResponse.data.data.inventory.length);
    console.log('   Total en DB:', inventoryResponse.data.data.pagination.total);
    if (inventoryResponse.data.data.inventory.length > 0) {
      console.log('   Primer item:', inventoryResponse.data.data.inventory[0].name);
    }
    console.log();

    // 10. Dashboard Report
    console.log('🔟 Testing Dashboard Report...');
    const dashboardResponse = await authenticatedRequest('GET', '/reports/dashboard');
    console.log('✅ Reporte del dashboard obtenido:');
    console.log('   Órdenes hoy:', dashboardResponse.data.data.todayOrders);
    console.log('   Ingresos diarios: $', dashboardResponse.data.data.dailyRevenue);
    console.log('   Mesas activas:', dashboardResponse.data.data.activeTables);
    console.log('   Items con stock bajo:', dashboardResponse.data.data.lowStockItems, '\n');

    // 11. Test de producto específico
    if (productsResponse.data.data.products.length > 0) {
      const productId = productsResponse.data.data.products[0].id;
      console.log('1️⃣1️⃣ Testing Get Product by ID...');
      const productResponse = await authenticatedRequest('GET', `/products/${productId}`);
      console.log('✅ Producto específico obtenido:', productResponse.data.data.name);
      console.log('   Precio: $', productResponse.data.data.price, '\n');
    }

    // 12. Logout
    console.log('1️⃣2️⃣ Testing Logout...');
    const logoutResponse = await authenticatedRequest('POST', '/auth/logout');
    console.log('✅ Logout exitoso:', logoutResponse.data.message, '\n');

    console.log('🎉 ¡Todas las pruebas de la API v1 completadas exitosamente!');
    console.log('📊 Resumen:');
    console.log('   ✅ Autenticación: Funcionando');
    console.log('   ✅ Usuarios: Funcionando');
    console.log('   ✅ Productos: Funcionando');
    console.log('   ✅ Categorías: Funcionando');
    console.log('   ✅ Órdenes: Funcionando');
    console.log('   ✅ Mesas: Funcionando');
    console.log('   ✅ Inventario: Funcionando');
    console.log('   ✅ Reportes: Funcionando');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testCompleteAPI();