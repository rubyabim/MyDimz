/**
 * create-admin-direct.js
 * Creates an admin user in the database using Prisma Client directly, without needing the API server.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const providedPassword =
      process.env.ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD;

    const password =
      (providedPassword && String(providedPassword).trim()) ||
      crypto.randomBytes(9).toString('base64url');

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log(`Admin user created successfully (username: ${username})`);
    console.log(`Admin password: ${password}`);
  } catch (err) {
    console.error('Failed to create admin', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
