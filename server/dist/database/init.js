"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
exports.closeDatabase = closeDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
let connection = null;
let isMySQL = false;
async function initializeDatabase() {
    try {
        console.log("⚠️  Using SQLite to avoid MySQL database issues...");
        throw new Error("Force SQLite fallback");
    }
    catch (error) {
        console.log("⚠️  Using SQLite database...");
        const db = new sqlite3_1.default.Database("./data/ecommerce.db");
        connection = db;
        isMySQL = false;
        console.log("✅ SQLite database initialized");
    }
}
async function createMySQLTables() {
    if (!connection || !isMySQL)
        return;
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
function closeDatabase() {
    if (connection && typeof connection.end === "function") {
        connection.end();
    }
}
initializeDatabase().catch(console.error);
exports.db = {
    execute: async (query, params = []) => {
        if (isMySQL) {
            return await connection.execute(query, params);
        }
        else {
            return new Promise((resolve, reject) => {
                connection.all(query, params, (err, result) => {
                    if (err)
                        reject(err);
                    else
                        resolve([result]);
                });
            });
        }
    },
    get: (query, params = [], callback) => {
        if (isMySQL) {
            connection.execute(query, params).then(([result]) => {
                callback(null, Array.isArray(result) ? result[0] : result);
            }).catch(callback);
        }
        else {
            connection.get(query, params, callback);
        }
    },
    all: (query, params = [], callback) => {
        if (isMySQL) {
            connection.execute(query, params).then(([result]) => {
                callback(null, result);
            }).catch(callback);
        }
        else {
            connection.all(query, params, callback);
        }
    },
    run: (query, params = [], callback) => {
        if (isMySQL) {
            connection.execute(query, params).then(([result]) => {
                callback(null, { insertId: result.insertId, changes: result.affectedRows });
            }).catch(callback);
        }
        else {
            connection.run(query, params, callback);
        }
    }
};
//# sourceMappingURL=init.js.map