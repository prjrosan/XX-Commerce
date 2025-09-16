const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/ecommerce.db');

console.log('🔍 Checking for admin users in database...');

db.all('SELECT id, email, name, role FROM users WHERE role = "admin"', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('📊 Admin users found:', rows.length);
    if (rows.length > 0) {
      console.log('👤 Admin users:');
      rows.forEach(user => {
        console.log(`   ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
      });
    } else {
      console.log('⚠️  No admin users found in database');
    }
  }
  
  // Also check all users
  db.all('SELECT id, email, name, role FROM users', (err, allUsers) => {
    if (err) {
      console.error('❌ Error getting all users:', err);
    } else {
      console.log('\n📊 All users in database:', allUsers.length);
      allUsers.forEach(user => {
        console.log(`   ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
      });
    }
    db.close();
  });
});
