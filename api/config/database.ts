/**
 * Database Configuration - Production Ready
 * PostgreSQL only - No mock data fallback
 */

import { Pool } from 'pg';

interface DatabaseConfig {
  type: 'postgresql';
  pool?: Pool;
}

let dbConfig: DatabaseConfig = { type: 'postgresql' };
let pool: Pool | null = null;

/**
 * Initialize PostgreSQL connection
 */
export async function initializeDatabase(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required for production');
  }

  try {
    console.log('🔌 Connecting to PostgreSQL...');

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    dbConfig = { type: 'postgresql', pool };

    console.log('✅ PostgreSQL connected successfully');
    console.log('📊 Database ready for production');
  } catch (error: any) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

/**
 * Execute a query
 */
export async function query(sql: string, params?: any[]): Promise<any[]> {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }

  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error: any) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Execute a query and return a single row
 */
export async function queryOne(sql: string, params?: any[]): Promise<any | null> {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute within a transaction
 */
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  if (!pool) {
    throw new Error('Database not initialized');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get database type (always postgresql in production)
 */
export function getDatabaseType(): 'postgresql' {
  return 'postgresql';
}

/**
 * Get database status
 */
export async function getDatabaseStatus() {
  if (!pool) {
    return { connected: false, type: 'postgresql' };
  }

  try {
    const result = await pool.query('SELECT NOW() as time, version() as version');
    return {
      connected: true,
      type: 'postgresql',
      serverTime: result.rows[0].time,
      version: result.rows[0].version,
      poolSize: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount
    };
  } catch (error) {
    return { connected: false, type: 'postgresql', error: (error as Error).message };
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    try {
      await pool.end();
      console.log('✅ PostgreSQL connection closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
    pool = null;
  }
}

export default {
  initializeDatabase,
  query,
  queryOne,
  transaction,
  getDatabaseType,
  getDatabaseStatus,
  closeDatabase
};
