/**
 * create-admin-direct.js
 * Creates an admin user in the database using Prisma Client directly, without needing the API server.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const username = 'admin';
    const defaultPassword = 'admin123';

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log('Admin user created successfully (username: admin, password: admin123)');
  } catch (err) {
    console.error('Failed to create admin', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
