const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDemoProducts() {
  try {
    const existing = await prisma.product.findFirst({ where: { name: 'Test Product' } });
    if (existing) {
      console.log('Test Product already exists');
      return;
    }

    await prisma.product.createMany({
      data: [
        {
          name: 'Test Product',
          price: 10000,
          stock: 10,
          category: 'Makanan',
          description: 'Produk demo untuk testing aplikasi',
        },
        {
          name: 'Beras Premium 5kg',
          price: 75000,
          stock: 50,
          category: 'Makanan',
        },
        {
          name: 'Minyak Goreng 2L',
          price: 32000,
          stock: 30,
          category: 'Kebutuhan Rumah',
        }
      ]
    });

    console.log('Demo products created');
  } catch (err) {
    console.error('Failed to create demo products:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoProducts();
