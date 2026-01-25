const { io } = require('socket.io-client');
const axios = require('axios');

class WebSocketTester {
    constructor(serverUrl = 'http://localhost:3001') {
        this.serverUrl = serverUrl;
        this.socket = null;
        this.isConnected = false;
        this.userInfo = null;
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${type}] ${message}`);
    }

    async login(email = 'owner@pambazo.com', password = 'admin123') {
        try {
            this.log(`Intentando login con ${email}...`);
            
            const response = await axios.post(`${this.serverUrl}/api/v1/auth/login`, {
                email,
                password
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data && response.data.data && response.data.data.tokens && response.data.data.tokens.accessToken) {
                this.userInfo = response.data.data;
                this.log(`✅ Login exitoso para ${email} (${response.data.data.user.role})`);
                return response.data.data.tokens.accessToken;
            } else {
                throw new Error('No se recibió token en la respuesta');
            }
        } catch (error) {
            this.log(`❌ Error en login: ${error.message}`, 'ERROR');
            if (error.response) {
                this.log(`Status: ${error.response.status}`, 'ERROR');
                this.log(`Data: ${JSON.stringify(error.response.data)}`, 'ERROR');
            }
            throw error;
        }
    }

    connect(token) {
        return new Promise((resolve, reject) => {
            this.log('Conectando al servidor WebSocket...');

            this.socket = io(this.serverUrl, {
                auth: { token },
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                this.isConnected = true;
                this.log('✅ Conectado al servidor WebSocket');
                this.setupEventListeners();
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                this.log(`❌ Error de conexión: ${error.message}`, 'ERROR');
                reject(error);
            });

            this.socket.on('disconnect', (reason) => {
                this.isConnected = false;
                this.log(`❌ Desconectado: ${reason}`, 'WARN');
            });
        });
    }

    setupEventListeners() {
        // Pong response
        this.socket.on('pong', (data) => {
            this.log(`🏓 Pong recibido: ${data.timestamp}`, 'RECEIVED');
        });

        // User events
        this.socket.on('user:connected', (data) => {
            this.log(`👤 Usuario conectado: ${data.email} (${data.role})`, 'RECEIVED');
        });

        this.socket.on('user:disconnected', (data) => {
            this.log(`👤 Usuario desconectado: ${data.email} (${data.role})`, 'RECEIVED');
        });

        this.socket.on('user:status_changed', (data) => {
            this.log(`👤 Estado cambiado: ${data.email} -> ${data.status}`, 'RECEIVED');
        });

        this.socket.on('user:online_users', (data) => {
            this.log(`👥 Usuarios en línea: ${data.count}`, 'RECEIVED');
            if (data.users && data.users.length > 0) {
                data.users.forEach(user => {
                    this.log(`  - ${user.email} (${user.role}) - ${user.status || 'online'}`, 'RECEIVED');
                });
            }
        });

        // Order events
        this.socket.on('order:created', (data) => {
            this.log(`📝 Orden creada: ${data.orderId || 'N/A'} por ${data.createdBy}`, 'RECEIVED');
        });

        this.socket.on('order:updated', (data) => {
            this.log(`📝 Orden actualizada: ${data.orderId || 'N/A'} por ${data.updatedBy}`, 'RECEIVED');
        });

        this.socket.on('order:status_changed', (data) => {
            this.log(`📝 Estado de orden cambiado: ${data.orderId || 'N/A'} -> ${data.status}`, 'RECEIVED');
        });

        // Inventory events
        this.socket.on('inventory:updated', (data) => {
            this.log(`📦 Inventario actualizado: ${data.productId || 'N/A'} -> ${data.stockLevel || 'N/A'}`, 'RECEIVED');
        });

        this.socket.on('inventory:low_stock_alert', (data) => {
            this.log(`📦 ⚠️ Alerta de stock bajo: ${data.productId || 'N/A'}`, 'RECEIVED');
        });

        // Table events
        this.socket.on('table:status_changed', (data) => {
            this.log(`🪑 Estado de mesa cambiado: Mesa ${data.tableNumber || 'N/A'} -> ${data.status}`, 'RECEIVED');
        });

        this.socket.on('table:reserved', (data) => {
            this.log(`🪑 Mesa reservada: Mesa ${data.tableNumber || 'N/A'} para ${data.customerName || 'N/A'}`, 'RECEIVED');
        });

        // Error handler
        this.socket.on('error', (error) => {
            this.log(`❌ Error: ${error}`, 'ERROR');
        });
    }

    // Test methods
    sendPing() {
        if (this.socket && this.isConnected) {
            this.socket.emit('ping');
            this.log('🏓 Ping enviado', 'SENT');
        }
    }

    updateUserStatus(status = 'busy') {
        if (this.socket && this.isConnected) {
            this.socket.emit('user:status_update', { status });
            this.log(`👤 Actualizando estado a: ${status}`, 'SENT');
        }
    }

    getOnlineUsers() {
        if (this.socket && this.isConnected) {
            this.socket.emit('user:get_online');
            this.log('👥 Solicitando usuarios en línea', 'SENT');
        }
    }

    createTestOrder() {
        if (this.socket && this.isConnected) {
            const orderId = `order_test_${Date.now()}`;
            const orderData = {
                orderId,
                tableId: 'table_1',
                status: 'pending',
                items: [
                    { productId: 'product_1', quantity: 2, price: 15.99 },
                    { productId: 'product_2', quantity: 1, price: 8.50 }
                ],
                totalAmount: 40.48
            };
            
            this.socket.emit('order:create', orderData);
            this.log(`📝 Creando orden de prueba: ${orderId}`, 'SENT');
            return orderId;
        }
    }

    updateOrderStatus(orderId, status = 'confirmed') {
        if (this.socket && this.isConnected) {
            this.socket.emit('order:status_change', { orderId, status });
            this.log(`📝 Actualizando estado de orden ${orderId} a: ${status}`, 'SENT');
        }
    }

    updateInventory(productId = 'product_test', stockLevel = 15) {
        if (this.socket && this.isConnected) {
            this.socket.emit('inventory:update', { productId, stockLevel });
            this.log(`📦 Actualizando inventario ${productId}: ${stockLevel}`, 'SENT');
        }
    }

    triggerLowStockAlert(productId = 'product_test') {
        if (this.socket && this.isConnected) {
            this.socket.emit('inventory:low_stock', { 
                productId, 
                currentStock: 2, 
                minStock: 5 
            });
            this.log(`📦 Alerta de stock bajo para ${productId}`, 'SENT');
        }
    }

    changeTableStatus(tableNumber = 1, status = 'occupied') {
        if (this.socket && this.isConnected) {
            this.socket.emit('table:status_change', { tableNumber, status });
            this.log(`🪑 Cambiando estado de mesa ${tableNumber} a: ${status}`, 'SENT');
        }
    }

    createReservation(tableNumber = 2, customerName = 'Cliente Test') {
        if (this.socket && this.isConnected) {
            const reservationData = {
                tableNumber,
                customerName,
                reservationTime: new Date().toISOString(),
                partySize: 4
            };
            
            this.socket.emit('table:reservation', reservationData);
            this.log(`🪑 Creando reserva para mesa ${tableNumber}: ${customerName}`, 'SENT');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.log('🔌 Desconectado del servidor');
        }
    }

    // Run comprehensive test
    async runComprehensiveTest() {
        try {
            this.log('🚀 Iniciando prueba comprehensiva de WebSockets');
            
            // Login and connect
            const token = await this.login();
            await this.connect(token);
            
            // Wait a bit for connection to stabilize
            await this.sleep(1000);
            
            // Test ping
            this.sendPing();
            await this.sleep(500);
            
            // Test user events
            this.updateUserStatus('busy');
            await this.sleep(500);
            
            this.getOnlineUsers();
            await this.sleep(1000);
            
            // Test order events
            const orderId = this.createTestOrder();
            await this.sleep(1000);
            
            this.updateOrderStatus(orderId, 'confirmed');
            await this.sleep(500);
            
            this.updateOrderStatus(orderId, 'preparing');
            await this.sleep(500);
            
            this.updateOrderStatus(orderId, 'ready');
            await this.sleep(500);
            
            // Test inventory events
            this.updateInventory('product_test_1', 25);
            await this.sleep(500);
            
            this.triggerLowStockAlert('product_test_2');
            await this.sleep(500);
            
            // Test table events
            this.changeTableStatus(1, 'occupied');
            await this.sleep(500);
            
            this.createReservation(3, 'Juan Pérez');
            await this.sleep(500);
            
            this.changeTableStatus(3, 'reserved');
            await this.sleep(500);
            
            // Final status update
            this.updateUserStatus('online');
            await this.sleep(1000);
            
            this.log('✅ Prueba comprehensiva completada');
            
        } catch (error) {
            this.log(`❌ Error en prueba comprehensiva: ${error.message}`, 'ERROR');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'comprehensive';
    
    const tester = new WebSocketTester();
    
    try {
        switch (command) {
            case 'login':
                await tester.login();
                break;
                
            case 'connect':
                const token = await tester.login();
                await tester.connect(token);
                console.log('Presiona Ctrl+C para desconectar');
                break;
                
            case 'ping':
                const pingToken = await tester.login();
                await tester.connect(pingToken);
                tester.sendPing();
                await tester.sleep(2000);
                tester.disconnect();
                break;
                
            case 'comprehensive':
            default:
                await tester.runComprehensiveTest();
                await tester.sleep(2000);
                tester.disconnect();
                break;
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔌 Desconectando...');
    process.exit(0);
});

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = WebSocketTester;