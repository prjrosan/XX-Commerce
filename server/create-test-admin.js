const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./data/ecommerce.db');

console.log('🔐 Creating test admin user...');

const email = 'admin@test.com';
const password = 'admin123';
const name = 'Test Admin';

// First, delete existing test admin if it exists
db.run('DELETE FROM users WHERE email = ?', [email], (err) => {
  if (err) {
    console.error('❌ Error deleting existing user:', err);
    db.close();
    return;
  }

  console.log('✅ Deleted existing test admin if it existed');

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('❌ Error hashing password:', err);
      db.close();
      return;
    }

    // Insert new admin user
    db.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, 'admin'],
      function(err) {
        if (err) {
          console.error('❌ Error creating admin user:', err);
          db.close();
          return;
        }

        console.log('✅ Test admin user created successfully!');
        console.log('📋 Admin Credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Name: ${name}`);
        console.log(`   Role: admin`);
        console.log(`   ID: ${this.lastID}`);

        // Test the login
        console.log('\n🔐 Testing login...');
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
          if (err) {
            console.error('❌ Error fetching user:', err);
            db.close();
            return;
          }

          bcrypt.compare(password, user.password, (err, isValid) => {
            if (err) {
              console.error('❌ Password comparison error:', err);
            } else {
              console.log('🔑 Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
            }
            db.close();
          });
        });
      }
    );
  });
});
