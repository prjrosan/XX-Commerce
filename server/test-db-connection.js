const { db } = require('./dist/database/init');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', ['admin@test.com']);
    console.log('📊 Database query result:', { usersCount: users?.length, users });
    
    if (users && users.length > 0) {
      console.log('✅ User found:', users[0]);
    } else {
      console.log('❌ No user found');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

testDatabaseConnection();
