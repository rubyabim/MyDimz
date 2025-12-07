/**
 * update-user.js
 * Updates user password in the database
 * Usage: node scripts/update-user.js <username> <new_password>
 * 
 * Example:
 *   node scripts/update-user.js admin Abim_febriansyah@teknokrat.ac.id Ruby.Abim
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function updateUserPassword() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log('Usage: node scripts/update-user.js <username> <new_password>');
      console.log('');
      console.log('Example:');
      console.log('  node scripts/update-user.js admin Ruby.Abim');
      process.exit(1);
    }

    const username = args[0];
    const newPassword = args[1];

    // Validasi
    if (username.length < 3) {
      console.error('❌ Username minimal 3 karakter');
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.error('❌ Password minimal 6 karakter');
      process.exit(1);
    }

    // Cek apakah user ada
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.error(`❌ User "${username}" tidak ditemukan`);
      process.exit(1);
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { username },
      data: {
        password: hashedPassword,
      },
    });

    console.log(`✅ Password user "${username}" berhasil diperbarui`);
    console.log(`ID: ${updatedUser.id}`);
    console.log(`Username: ${updatedUser.username}`);
    console.log(`Role: ${updatedUser.role}`);
    console.log(`Updated at: ${updatedUser.updatedAt}`);
  } catch (err) {
    console.error('❌ Error updating user:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPassword();
