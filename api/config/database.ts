import { Pool, PoolClient } from 'pg';
import { MockDataService } from '../services/mockDataService.js';

interface DatabaseConfig {
  type: 'postgresql' | 'mock';
  pool?: Pool;
}

let dbConfig: DatabaseConfig | null = null;
let useMockData = false;

// Initialize PostgreSQL connection
function initializePostgreSQL(): Pool {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'pambaso_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
  });

  return pool;
}

// Initialize database connection
export async function initDB(): Promise<void> {
  try {
    const pool = initializePostgreSQL();

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW() as current_time, version() as pg_version');
    client.release();

    dbConfig = { type: 'postgresql', pool };
    useMockData = false;
    console.log('✅ Connected to PostgreSQL database');
    console.log(`📊 Database: ${process.env.DB_NAME || 'pambaso_db'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);

  } catch (error: any) {
    console.warn('⚠️ PostgreSQL connection failed, using mock data service');
    console.warn('💡 To use PostgreSQL: install it and run migrations');
    console.warn('📖 See DATABASE_SETUP.md for installation instructions');

    dbConfig = { type: 'mock' };
    useMockData = true;
    console.log('✅ Using mock data service for development');
    console.log('📊 Mock database initialized with sample data');
  }
}

// Get database connection pool
export function getDB(): Pool {
  if (!dbConfig || dbConfig.type !== 'postgresql') {
    throw new Error('PostgreSQL not available. Using mock data service.');
  }
  return dbConfig.pool!;
}

// Check if using mock data
export function isUsingMockData(): boolean {
  return useMockData;
}

// Get mock data service
export function getMockService() {
  return MockDataService;
}

// Execute query with automatic connection handling
export async function query(text: string, params?: any[]): Promise<any> {
  if (!dbConfig) {
    throw new Error('Database not initialized. Call initDB() first.');
  }

  if (dbConfig.type === 'mock') {
    throw new Error('Query not supported with mock data. Use getMockService() instead.');
  }

  const client = await dbConfig.pool!.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Get a client from the pool for transactions
export async function getClient(): Promise<PoolClient> {
  if (!dbConfig || dbConfig.type !== 'postgresql') {
    throw new Error('Transactions not supported with mock data.');
  }
  return await dbConfig.pool!.connect();
}

// Get database type
export function getDatabaseType(): 'postgresql' | 'mock' {
  return dbConfig?.type || 'mock';
}

// Close database connections
export async function closeDB(): Promise<void> {
  try {
    if (dbConfig?.type === 'postgresql' && dbConfig.pool) {
      await dbConfig.pool.end();
      console.log('✅ PostgreSQL connection pool closed');
    } else if (dbConfig?.type === 'mock') {
      console.log('✅ Mock data service closed');
    }
    dbConfig = null;
    useMockData = false;
  } catch (error: any) {
    console.error('❌ Error closing database connections:', error);
  }
}

// Export default for compatibility
export default { query, getClient, getDB, getDatabaseType, closeDB };

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down database connections...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Gracefully shutting down database connections...');
  await closeDB();
  process.exit(0);
});

process.on('SIGQUIT', async () => {
  console.log('\n🔄 Gracefully shutting down database connections...');
  await closeDB();
  process.exit(0);
});
