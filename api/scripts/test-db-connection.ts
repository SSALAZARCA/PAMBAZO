/**
 * Test PostgreSQL database connection
 */
import { getDB, initDB, closeDB } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔄 Testing PostgreSQL connection...');
  console.log('Database config:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'pambaso_db'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
  console.log('');

  try {
    // Initialize database connection
    await initDB();
    
    // Test basic connection
    const db = getDB();
    const client = await db.connect();
    
    console.log('✅ Successfully connected to PostgreSQL');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query test successful:');
    console.log(`  Current time: ${result.rows[0].current_time}`);
    console.log(`  PostgreSQL version: ${result.rows[0].pg_version}`);
    
    // Test pool status
    console.log('\n📊 Connection pool status:');
    console.log(`  Total connections: ${db.totalCount}`);
    console.log(`  Idle connections: ${db.idleCount}`);
    console.log(`  Waiting clients: ${db.waitingCount}`);
    
    client.release();
    console.log('\n✅ Database connection test completed successfully');
    
  } catch (error: any) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Suggestions:');
      console.log('  1. Make sure PostgreSQL is running');
      console.log('  2. Check if the host and port are correct');
      console.log('  3. Verify firewall settings');
    } else if (error.code === '28P01') {
      console.log('\n💡 Suggestions:');
      console.log('  1. Check username and password');
      console.log('  2. Verify user permissions');
    } else if (error.code === '3D000') {
      console.log('\n💡 Suggestions:');
      console.log('  1. Create the database first');
      console.log('  2. Check database name spelling');
    }
    
    process.exit(1);
  } finally {
    await closeDB();
    console.log('🔄 Connection pool closed');
  }
}

// Run the test
testConnection().catch(console.error);
