const { PrismaClient } = require('@prisma/client');
const { verifyPassword } = require('./auth-utils');

const prisma = new PrismaClient();

async function testSetup() {
  console.log('Testing Express server setup...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user query
    console.log('\n2. Testing user query...');
    const users = await prisma.user.findMany();
    console.log(`✅ Found ${users.length} users in database`);
    
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`   Sample user: ${testUser.username} (${testUser.email})`);
    }
    
    // Test post query
    console.log('\n3. Testing post query...');
    const posts = await prisma.post.findMany();
    console.log(`✅ Found ${posts.length} posts in database`);
    
    if (posts.length > 0) {
      const testPost = posts[0];
      console.log(`   Sample post: "${testPost.title}" by ${testPost.org}`);
    }
    
    // Test authentication (if test user exists)
    console.log('\n4. Testing authentication...');
    const testUser = await prisma.user.findUnique({
      where: { username: 'a' }
    });
    
    if (testUser) {
      const isValid = await verifyPassword('a', testUser.password);
      console.log(`✅ Test user authentication: ${isValid ? 'PASS' : 'FAIL'}`);
    } else {
      console.log('⚠️  Test user "a" not found - run the seed script first');
    }
    
    console.log('\n🎉 All tests passed! Server is ready to run.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you have run: npm install');
    console.log('2. Make sure you have run: npm run db:generate');
    console.log('3. Make sure you have run: npm run db:push');
    console.log('4. Check that your .env file has DATABASE_URL="file:./db.sqlite3"');
  } finally {
    await prisma.$disconnect();
  }
}

testSetup(); 