import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

export class DatabaseService {
  private static db: Database | null = null;

  static async initialize(): Promise<Database> {
    if (!this.db) {
      const dbPath = process.env.DATABASE_URL || './api/data/pambazo.db';
      const dbDir = path.dirname(dbPath);

      // Crear directorio si no existe
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Abrir base de datos
      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      console.log(`✅ Base de datos SQLite conectada: ${dbPath}`);

      // Inicializar schema si es necesario
      await this.initializeSchema();
    }

    return this.db;
  }

  private static async initializeSchema(): Promise<void> {
    if (!this.db) return;

    try {
      // Verificar si las tablas existen
      const tables = await this.db.all(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );

      if (tables.length === 0) {
        console.log('📋 Inicializando schema de base de datos...');

        // Leer y ejecutar schema.sql
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schema = fs.readFileSync(schemaPath, 'utf-8');
          await this.db.exec(schema);
          console.log('✅ Schema creado exitosamente');

          // Ejecutar seed.sql si existe
          const seedPath = path.join(__dirname, '../../database/seed.sql');
          if (fs.existsSync(seedPath)) {
            const seed = fs.readFileSync(seedPath, 'utf-8');
            await this.db.exec(seed);
            console.log('✅ Datos iniciales cargados');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error al inicializar schema:', error);
      throw error;
    }
  }

  static getDb(): Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  static async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('✅ Conexión a la base de datos cerrada');
    }
  }

  static async query(sql: string, params?: any[]): Promise<any> {
    const db = this.getDb();
    const start = Date.now();

    try {
      const result = await db.all(sql, params);
      const duration = Date.now() - start;

      console.log('Query ejecutada:', {
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: result.length
      });

      return result;
    } catch (error: any) {
      const duration = Date.now() - start;
      console.error('Error en query:', {
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  static async run(sql: string, params?: any[]): Promise<any> {
    const db = this.getDb();
    return await db.run(sql, params);
  }

  static async get(sql: string, params?: any[]): Promise<any> {
    const db = this.getDb();
    return await db.get(sql, params);
  }

  static async all(sql: string, params?: any[]): Promise<any[]> {
    const db = this.getDb();
    return await db.all(sql, params);
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const db = this.getDb();
      await db.get('SELECT 1');
      return true;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }
}
