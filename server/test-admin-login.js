const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/ecommerce.db');

console.log('🔐 Testing admin login directly with database...');

// Test with superadmin@xxcommerce.com
const email = 'superadmin@xxcommerce.com';
const password = 'SuperAdmin2024!';

db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
  if (err) {
    console.error('❌ Database error:', err);
    db.close();
    return;
  }

  if (!user) {
    console.log('❌ User not found:', email);
    db.close();
    return;
  }

  console.log('✅ User found:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Name:', user.name);
  console.log('   Role:', user.role);
  console.log('   Has password hash:', !!user.password);

  // Test password verification
  const bcrypt = require('bcryptjs');
  bcrypt.compare(password, user.password, (err, isValid) => {
    if (err) {
      console.error('❌ Password comparison error:', err);
    } else {
      console.log('🔑 Password valid:', isValid);
    }
    db.close();
  });
});
