/**
 * API v1 Routes Index
 * Centraliza todas las rutas de la API v1 siguiendo las especificaciones técnicas
 */

import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import productsRoutes from './products';
import categoriesRoutes from './categories';
import ordersRoutes from './orders';
import tablesRoutes from './tables';
import inventoryRoutes from './inventory';
import reportsRoutes from './reports';
import tipsRoutes from './tips';
import settingsRoutes from './settings';

const router = Router();

// Middleware para logging de rutas API v1
router.use((req, res, next) => {
  console.log(`[API v1] ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas principales de la API v1
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/orders', ordersRoutes);
router.use('/tables', tablesRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reports', reportsRoutes);
router.use('/tips', tipsRoutes);
router.use('/settings', settingsRoutes);

// Ruta de health check específica para v1
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      version: 'v1',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

export default router;
