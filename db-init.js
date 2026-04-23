const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

async function init() {
  console.log('🚀 Starting database initialization...');
  try {
    // Check if tables already exist
    const res = await pool.query("SELECT to_regclass('public.users') as exists");
    if (res.rows[0].exists) {
      console.log('✅ Database already initialized. Skipping.');
      process.exit(0);
    }

    console.log('📦 Creating schema and seeding data...');
    
    // Read and execute init.sql
    const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await pool.query(initSql);
    console.log('✅ init.sql executed successfully.');

    // Read and execute init-vouchers.sql
    const vouchersSql = fs.readFileSync(path.join(__dirname, 'init-vouchers.sql'), 'utf8');
    await pool.query(vouchersSql);
    console.log('✅ init-vouchers.sql executed successfully.');

    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
}

init();
