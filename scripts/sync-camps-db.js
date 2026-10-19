const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { INITIAL_ALL_CAMPS } = require('../src/lib/campsData.js');

async function syncDirectlyToDatabase() {
  try {
    console.log('Connecting to PostgreSQL Database...');
    const result = await prisma.campOverride.upsert({
      where: { id: 'camps_catalog_v1' },
      create: {
        id: 'camps_catalog_v1',
        data: INITIAL_ALL_CAMPS
      },
      update: {
        data: INITIAL_ALL_CAMPS
      }
    });
    console.log('✅ Successfully synced ' + INITIAL_ALL_CAMPS.length + ' campsites directly into PostgreSQL Database (aanandham.go)!');
    console.log('Database Record ID:', result.id, 'Updated At:', result.updatedAt);
  } catch (err) {
    console.error('❌ Database Sync Error in aanandham.go:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncDirectlyToDatabase();
