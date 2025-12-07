/**
 * create-custom-user.js
 * Creates a custom user in the database with username and password
 * Usage: node scripts/create-custom-user.js <username> <password> [role]
 * 
 * Examples:
 *   node scripts/create-custom-user.js admin123 mypassword123
 *   node scripts/create-custom-user.js kasir1 kasir123 cashier
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function createCustomUser() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log('Usage: node scripts/create-custom-user.js <username> <password> [role]');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/create-custom-user.js admin123 mypassword123');
      console.log('  node scripts/create-custom-user.js kasir1 kasir123 cashier');
      console.log('');
      console.log('Default role: admin');
      process.exit(1);
    }

    const username = args[0];
    const password = args[1];
    const role = args[2] || 'admin';

    // Validasi
    if (username.length < 3) {
      console.error('❌ Username minimal 3 karakter');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password minimal 6 karakter');
      process.exit(1);
    }

    // Cek apakah user sudah ada
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.error(`❌ Username "${username}" sudah terdaftar`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Buat user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    console.log('✅ User berhasil dibuat!');
    console.log('');
    console.log('📋 Detail User:');
    console.log(`  Username: ${newUser.username}`);
    console.log(`  Role: ${newUser.role}`);
    console.log(`  ID: ${newUser.id}`);
    console.log(`  Dibuat: ${newUser.createdAt}`);
    console.log('');
    console.log('🔐 Untuk login, gunakan:');
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
  } catch (err) {
    console.error('❌ Gagal membuat user:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createCustomUser();
