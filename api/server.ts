import dotenv from 'dotenv';
import App from './app';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Crear instancia de la aplicación
    const app = new App();
    
    // Inicializar la aplicación (conexión DB, etc.)
    await app.initialize();
    
    // Iniciar el servidor
    const server = app.app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
      console.log(`📊 Entorno: ${NODE_ENV}`);
      console.log(`🔗 API disponible en: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    });

    // Manejo de cierre graceful
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📡 Señal ${signal} recibida. Cerrando servidor...`);
      
      server.close(async () => {
        console.log('🔌 Servidor HTTP cerrado');
        
        try {
          await app.close();
          console.log('✅ Aplicación cerrada correctamente');
          process.exit(0);
        } catch (error: any) {
          console.error('❌ Error al cerrar la aplicación:', error);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        console.error('⏰ Forzando cierre del servidor...');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Excepción no capturada:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', reason);
      console.error('En:', promise);
      process.exit(1);
    });

  } catch (error: any) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();
