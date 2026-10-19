const path = require('path');
const { INITIAL_ALL_CAMPS } = require('../src/lib/campsData.js');

const PMS_DIR = path.resolve(__dirname, '../../../pms(pwd a)');
const { PrismaClient } = require(path.join(PMS_DIR, 'node_modules/@prisma/client'));
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.hceuwjredvvihbtnhufl:Aanandham.123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
    }
  }
});

async function run() {
  try {
    console.log('Connecting to Prisma from PMS...');
    const allProps = await prisma.property.findMany();
    console.log('Currently in Property table (' + allProps.length + ' total):');
    allProps.forEach(p => console.log(p.id, '|', p.title, '| tenantId:', p.tenantId, '| active:', p.isActive));

    console.log('\nSyncing all ' + INITIAL_ALL_CAMPS.length + ' camps to PMS Property & RoomType models...');
    
    // Deactivate deprecated camps in DB
    const DEPRECATED_CAMP_IDS = [
      "pkg-chembra-peak",
      "pkg-900-kandi",
      "pkg-vagamon-pine",
      "pkg-athirappilly",
      "pkg-athirappilly-rapids",
      "pkg-chembra",
      "pkg-vagamon",
      "pkg-phantom",
      "pkg-wayanad"
    ];

    await prisma.property.updateMany({
      where: { id: { in: DEPRECATED_CAMP_IDS } },
      data: { isActive: false }
    });

    for (const camp of INITIAL_ALL_CAMPS) {
      const propertyData = {
        title: camp.title || camp.name,
        shortTitle: camp.shortTitle || camp.title,
        slug: camp.id.replace('pkg-', ''),
        category: camp.category || 'Resort',
        region: camp.region || 'Munnar',
        location: camp.location || 'Munnar, Kerala',
        altitude: camp.altitude || '7,000 FT',
        basePrice: Number(camp.price || camp.basePrice || 1499),
        rating: Number(camp.rating || 5.0),
        image: camp.image || '/images/high-altitude-4x4-convoy.jpg',
        gallery: camp.gallery || [],
        description: camp.description || '',
        inclusions: camp.inclusions || [],
        exclusions: camp.exclusions || [],
        amenities: camp.amenities ? camp.amenities.map(a => a.name || a) : (camp.highlights || []),
        isActive: true,
        tenantId: 't-aanandham-hq'
      };

      const prop = await prisma.property.upsert({
        where: { id: camp.id },
        create: {
          id: camp.id,
          ...propertyData
        },
        update: propertyData
      });

      console.log('Upserted property:', prop.id, '->', prop.title, '₹' + prop.basePrice);

      // Sync RoomTypes
      if (Array.isArray(camp.rooms) && camp.rooms.length > 0) {
        await prisma.roomType.deleteMany({
          where: { propertyId: camp.id }
        });

        for (const room of camp.rooms) {
          const parseCap = (c) => {
            if (typeof c === 'number') return Math.max(1, c);
            const match = String(c || '').match(/(\d+)/);
            return match ? Math.max(1, parseInt(match[1], 10)) : 2;
          };

          await prisma.roomType.create({
            data: {
              id: room.id,
              propertyId: camp.id,
              name: room.name || 'Standard Unit',
              capacity: parseCap(room.capacity),
              totalUnits: Number(room.totalUnits) || 6,
              basePrice: Number(room.price || room.basePrice || camp.price || 0),
              description: Array.isArray(room.features) ? room.features.join(', ') : (room.features || ''),
              images: room.image ? [room.image] : []
            }
          });
        }
      }
    }

    console.log('\n--- FINAL ACTIVE PROPERTIES IN DB ---');
    const finalProps = await prisma.property.findMany({ where: { isActive: true }, include: { roomTypes: true } });
    finalProps.forEach(p => {
      console.log('Active in DB:', p.id, '|', p.title, '| ₹' + p.basePrice, '| Rooms:', p.roomTypes.length);
    });

  } catch (err) {
    console.error('Error running PMS prisma sync:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
