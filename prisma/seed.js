const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create the test user from the README
  const hashedPassword = await bcrypt.hash('a', 10);
  
  const user = await prisma.user.upsert({
    where: { username: 'a' },
    update: {},
    create: {
      username: 'a',
      email: 'test@example.com',
      password: hashedPassword,
      isActive: true,
      isStaff: false,
      isSuperuser: false,
      firstName: '',
      lastName: '',
      dateJoined: new Date()
    },
  });

  console.log('Created user:', user.username);
  
  // You can add more seed data here if needed
  // For example, creating some initial posts:
  
  // const post = await prisma.post.create({
  //   data: {
  //     org: "Mass Struggle",
  //     title: "Counterprotest Start",
  //     stopKey: "place-kencl",
  //     datetime: new Date("2030-11-17T07:00")
  //   }
  // });
  
  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 