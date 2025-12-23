/**
 * SQLite database configuration for development fallback
 */
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

// SQLite database path
const dbPath = path.join(__dirname, '..', '..', 'data', 'pambaso.db');

// Initialize SQLite database
export async function initSQLiteDB(): Promise<Database> {
  if (db) {
    return db;
  }

  try {
    // Ensure data directory exists
    const fs = await import('fs/promises');
    const dataDir = path.dirname(dbPath);
    await fs.mkdir(dataDir, { recursive: true });

    // Open SQLite database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ SQLite database initialized at:', dbPath);

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON;');

    // Create tables if they don't exist
    await createTables();

    // Insert sample data
    await insertSampleData(db);

    console.log('✅ SQLite database initialized and tables created');

    return db;
  } catch (error: any) {
    console.error('❌ Error initializing SQLite database:', error);
    throw error;
  }
}

async function insertSampleData(db: Database) {
  try {
    // Insert sample categories
    const categories = [
      { name: 'Hamburguesas', description: 'Deliciosas hamburguesas artesanales' },
      { name: 'Bebidas', description: 'Refrescos y bebidas naturales' },
      { name: 'Postres', description: 'Dulces tentaciones' },
      { name: 'Acompañamientos', description: 'Papas, aros de cebolla y más' }
    ];

    for (const category of categories) {
      await db.run(
        'INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)',
        [category.name, category.description]
      );
    }

    // Insert sample products
    const products = [
      {
        name: 'Hamburguesa Clásica',
        description: 'Carne de res, lechuga, tomate, cebolla y salsa especial',
        category_id: 1,
        price: 12.99,
        preparation_time: 15,
        calories: 650,
        is_available: 1
      },
      {
        name: 'Coca Cola',
        description: 'Refresco de cola 355ml',
        category_id: 2,
        price: 2.50,
        preparation_time: 1,
        calories: 140,
        is_available: 1
      }
    ];

    for (const product of products) {
      await db.run(
        `INSERT OR IGNORE INTO products 
         (name, description, category_id, price, preparation_time, calories, is_available) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [product.name, product.description, product.category_id, product.price,
        product.preparation_time, product.calories, product.is_available]
      );
    }

    console.log('✅ Sample data inserted');
  } catch (error: any) {
    console.error('❌ Error inserting sample data:', error);
  }
}

// Create database tables
async function createTables() {
  if (!db) throw new Error('Database not initialized');

  // Drop existing tables to ensure schema updates
  const dropTables = [
    'DROP TABLE IF EXISTS product_ingredients',
    'DROP TABLE IF EXISTS sales',
    'DROP TABLE IF EXISTS order_items',
    'DROP TABLE IF EXISTS orders',
    'DROP TABLE IF EXISTS inventory',
    'DROP TABLE IF EXISTS products',
    'DROP TABLE IF EXISTS categories',
    'DROP TABLE IF EXISTS users'
  ];

  for (const dropSQL of dropTables) {
    await db.exec(dropSQL);
  }

  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Products table
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER,
      price DECIMAL(10,2) NOT NULL,
      cost DECIMAL(10,2),
      sku TEXT UNIQUE,
      barcode TEXT,
      image_url TEXT,
      preparation_time INTEGER,
      calories INTEGER,
      protein DECIMAL(5,2),
      carbs DECIMAL(5,2),
      fat DECIMAL(5,2),
      fiber DECIMAL(5,2),
      is_available BOOLEAN DEFAULT 1,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )`,

    // Inventory table
    `CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      min_stock INTEGER DEFAULT 0,
      max_stock INTEGER,
      location TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,

    // Orders table
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      total_amount DECIMAL(10,2) NOT NULL,
      tax_amount DECIMAL(10,2) DEFAULT 0,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`,

    // Order items table
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      notes TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,

    // Categories table
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Sales table
    `CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_amount DECIMAL(10,2) NOT NULL,
      payment_method TEXT,
      cashier_id INTEGER,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (cashier_id) REFERENCES users(id)
    )`,

    // Product ingredients table
    `CREATE TABLE IF NOT EXISTS product_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      ingredient_name TEXT NOT NULL,
      quantity DECIMAL(10,3) NOT NULL,
      unit TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`
  ];

  for (const tableSQL of tables) {
    await db.exec(tableSQL);
  }

  console.log('✅ SQLite tables created/verified');
}

// Close SQLite database
export async function closeSQLiteDB(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('✅ SQLite database connection closed');
  }
}

// Get database instance
export function getSQLiteDB(): Database | null {
  return db;
}

// Export default
export default {
  initSQLiteDB,
  closeSQLiteDB,
  getSQLiteDB
};
