import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if admin exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: 'admin' },
  });

  if (existingAdmin) {
    console.log('✓ Admin user already exists!');
    console.log('Username: admin');
    console.log('Password: admin');
    return;
  }

  // Create default admin
  const password = 'admin';
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      passwordHash,
      email: 'admin@bizmanager.com',
    },
  });

  console.log('✓ Super Admin created successfully!');
  console.log('');
  console.log('=================================');
  console.log('  Default Super Admin Login');
  console.log('=================================');
  console.log('Username: admin');
  console.log('Password: admin');
  console.log('=================================');
  console.log('');
  console.log('⚠️  IMPORTANT: Change the password after first login!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
