const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const prisma = new PrismaClient();

async function migrateData() {
  console.log('Starting data migration from Django to Prisma...');
  
  // Open the existing SQLite database
  const dbPath = path.join(__dirname, 'db.sqlite3');
  const db = new sqlite3.Database(dbPath);
  
  try {
    // Migrate users
    console.log('Migrating users...');
    const users = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM bostocracy_user", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          username: user.username,
          email: user.email,
          password: user.password,
          firstName: user.first_name,
          lastName: user.last_name,
          isActive: user.is_active === 1,
          isStaff: user.is_staff === 1,
          isSuperuser: user.is_superuser === 1,
          lastLogin: user.last_login ? new Date(user.last_login) : null,
          dateJoined: new Date(user.date_joined)
        }
      });
    }
    
    // Migrate posts
    console.log('Migrating posts...');
    const posts = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM bostocracy_post", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const post of posts) {
      await prisma.post.upsert({
        where: { id: post.id },
        update: {},
        create: {
          id: post.id,
          datetime: new Date(post.datetime),
          stopKey: post.stop_key,
          title: post.title,
          org: post.org
        }
      });
    }
    
    console.log(`Migration completed! Migrated ${users.length} users and ${posts.length} posts.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    db.close();
    await prisma.$disconnect();
  }
}

migrateData(); 