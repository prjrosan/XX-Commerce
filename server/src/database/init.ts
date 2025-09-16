import mysql from "mysql2/promise";
import sqlite3 from "sqlite3";

let connection: any = null;
let isMySQL = false;

export async function initializeDatabase(): Promise<void> {
  try {
    // Force SQLite for now to fix admin login
    console.log("⚠️  Using SQLite for admin login fix...");
    throw new Error("Force SQLite fallback");
  } catch (error) {
    console.log("⚠️  Falling back to SQLite...");
    
    // Fallback to SQLite
    const db = new sqlite3.Database("./data/ecommerce.db");
    connection = db;
    isMySQL = false;
    console.log("✅ SQLite fallback database initialized");
  }
}

async function createMySQLTables(): Promise<void> {
  if (!connection || !isMySQL) return;

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role ENUM('user', 'seller', 'admin') DEFAULT 'user',
      phone VARCHAR(20),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      image VARCHAR(500),
      stock INT DEFAULT 0,
      seller_id INT,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      total_amount DECIMAL(10,2) NOT NULL,
      status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
      shipping_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      product_id INT,
      quantity INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`
  ];

  for (const table of tables) {
    await connection.execute(table);
  }
  
  console.log("✅ MySQL tables created/verified");
}

export function closeDatabase(): void {
  if (connection && typeof connection.end === "function") {
    connection.end();
  }
}

// Initialize database immediately when module is loaded
initializeDatabase().catch(console.error);

// Database wrapper that handles both MySQL and SQLite
export const db = {
  execute: async (query: string, params: any[] = []) => {
    if (isMySQL) {
      return await connection.execute(query, params);
    } else {
      return new Promise((resolve, reject) => {
        connection.all(query, params, (err: any, result: any) => {
          if (err) reject(err);
          else resolve([result]); // Wrap result in array to match MySQL format
        });
      });
    }
  },
  
  get: (query: string, params: any[] = [], callback: Function) => {
    if (isMySQL) {
      connection.execute(query, params).then(([result]: any) => {
        callback(null, Array.isArray(result) ? result[0] : result);
      }).catch(callback);
    } else {
      connection.get(query, params, callback);
    }
  },
  
  all: (query: string, params: any[] = [], callback: Function) => {
    if (isMySQL) {
      connection.execute(query, params).then(([result]: any) => {
        callback(null, result);
      }).catch(callback);
    } else {
      connection.all(query, params, callback);
    }
  },
  
  run: (query: string, params: any[] = [], callback: Function) => {
    if (isMySQL) {
      connection.execute(query, params).then(([result]: any) => {
        callback(null, { insertId: result.insertId, changes: result.affectedRows });
      }).catch(callback);
    } else {
      connection.run(query, params, callback);
    }
  }
};
