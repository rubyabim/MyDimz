const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Checking database...\n');
    
    const count = await prisma.product.count();
    console.log(`📦 Total products in database: ${count}`);
    
    if (count === 0) {
      console.log('\n⚠️  Database is empty!');
      console.log('   Run: npm run seed-products');
    } else {
      const products = await prisma.product.findMany({ take: 5 });
      console.log('\n✅ Sample products:');
      products.forEach(p => {
        console.log(`   ${p.id}. ${p.name} - Rp ${p.price} (${p.category})`);
      });
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testDatabase();
