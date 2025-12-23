import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { getCorsOptions } from './config/cors';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import v1Routes from './routes/v1';
import authRoutes from './routes/v1/auth';
import { swaggerUi, swaggerSpec } from './config/swagger';
import { CacheService } from './services/CacheService';
import { DatabaseService } from './services/DatabaseService';
import logger from './utils/logger';

class App {
  public app: express.Application;
  private databaseService: DatabaseService;

  constructor() {
    this.app = express();
    this.databaseService = new DatabaseService();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Seguridad
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // máximo 100 requests por ventana
      message: {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);

    // Compresión
    this.app.use(compression());

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging


    // Trust proxy (importante para rate limiting y logs)
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/api/health', async (req, res) => {
      try {
        const dbHealth = await DatabaseService.healthCheck();
        res.status(200).json({
          status: 'OK',
          timestamp: new Date().toISOString(),
          database: dbHealth ? 'connected' : 'disconnected',
          version: process.env.npm_package_version || '1.0.0'
        });
      } catch (error: any) {
        const _ = error as any;
        res.status(503).json({
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          error: 'Database connection failed'
        });
      }
    });

    // Swagger documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // API v1 routes
    this.app.use('/api/v1', v1Routes);

    // Compatibility route for /api/auth (without /v1)
    this.app.use('/api/auth', authRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'ENDPOINT_NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} no encontrado`,
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async initialize(): Promise<void> {
    try {
      // Inicializar conexión a la base de datos
      await DatabaseService.initialize();
      console.log('✅ Base de datos conectada exitosamente');
    } catch (error: any) {
      console.error('❌ Error al conectar con la base de datos:', error as any);
      throw error;
    }
  }

  public async close(): Promise<void> {
    try {
      await DatabaseService.close();
      console.log('✅ Conexión a la base de datos cerrada');
    } catch (error: any) {
      console.error('❌ Error al cerrar la conexión a la base de datos:', error as any);
    }
  }
}

export default App;
