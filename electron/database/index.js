import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

let db = null;

export function initDatabase() {
  const isDev = !app.isPackaged;
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'data.db');

  // Ensure directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  console.log(`📂 Database path: ${dbPath}`);

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run migrations
  runMigrations();

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function runMigrations() {
  console.log('🔄 Running database migrations...');

  // Create migrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrations = [
    {
      name: '001-proxies-and-collections',
      up: () => {
        // Tạo bảng proxies
        db.exec(`
          CREATE TABLE IF NOT EXISTS proxies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            host TEXT NOT NULL,
            port INTEGER NOT NULL,
            username TEXT,
            password TEXT,
            type TEXT DEFAULT 'socks5',
            status TEXT DEFAULT 'active',
            last_used DATETIME,
            collection_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_proxies_status ON proxies(status);
          CREATE INDEX IF NOT EXISTS idx_proxies_collection_id ON proxies(collection_id);
        `);

        // Tạo bảng proxy_collections
        db.exec(`
          CREATE TABLE IF NOT EXISTS proxy_collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_proxy_collections_created_at ON proxy_collections(created_at);
        `);

        console.log('  ✅ Created proxies and proxy_collections tables');
      },
    },
    {
      name: '002-account-collections',
      up: () => {
        // Tạo bảng account_collections
        db.exec(`
          CREATE TABLE IF NOT EXISTS account_collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_account_collections_created_at ON account_collections(created_at);
        `);

        console.log('  ✅ Created account_collections table');
      },
    },
    {
      name: '003-accounts',
      up: () => {
        // Tạo bảng accounts
        db.exec(`
          CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            token TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            collection_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_accounts_collection_id ON accounts(collection_id);
          CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
        `);

        console.log('  ✅ Created accounts table');
      },
    },
    {
      name: '004-accounts-add-name-token',
      up: () => {
        // Kiểm tra xem bảng accounts có tồn tại không
        const tableInfo = db.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name='accounts'
        `).get();

        if (tableInfo) {
          // Lấy thông tin các cột hiện có
          const columns = db.prepare(`PRAGMA table_info(accounts)`).all();
          const columnNames = columns.map(col => col.name);

          // Thêm cột name nếu chưa có
          if (!columnNames.includes('name')) {
            db.exec(`ALTER TABLE accounts ADD COLUMN name TEXT DEFAULT ''`);
            // Cập nhật giá trị mặc định cho các row hiện có
            db.exec(`UPDATE accounts SET name = 'Account ' || id WHERE name IS NULL OR name = ''`);
            console.log('  ✅ Added name column to accounts');
          }

          // Thêm cột token nếu chưa có
          if (!columnNames.includes('token')) {
            db.exec(`ALTER TABLE accounts ADD COLUMN token TEXT DEFAULT ''`);
            console.log('  ✅ Added token column to accounts');
          }

          // Thêm cột updated_at nếu chưa có
          if (!columnNames.includes('updated_at')) {
            db.exec(`ALTER TABLE accounts ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
            console.log('  ✅ Added updated_at column to accounts');
          }
        }
      },
    },
    {
      name: '005-code-collections',
      up: () => {
        db.exec(`
          CREATE TABLE IF NOT EXISTS code_collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_code_collections_created_at ON code_collections(created_at);
        `);

        console.log('  ✅ Created code_collections table');
      },
    },
    {
      name: '006-codes',
      up: () => {
        db.exec(`
          CREATE TABLE IF NOT EXISTS codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            collection_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_codes_collection_id ON codes(collection_id);
          CREATE INDEX IF NOT EXISTS idx_codes_status ON codes(status);
        `);

        console.log('  ✅ Created codes table');
      },
    },
  ];

  for (const migration of migrations) {
    const executed = db
      .prepare('SELECT * FROM migrations WHERE name = ?')
      .get(migration.name);

    if (!executed) {
      console.log(`  ✅ Executing migration: ${migration.name}`);
      migration.up();
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
    }
  }

  console.log('✅ Migrations completed');
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
