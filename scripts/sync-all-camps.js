const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { INITIAL_ALL_CAMPS, INITIAL_EVENTS, INITIAL_MARSHALS } = require('../src/lib/campsData.js');

const PMS_DIR = path.resolve(__dirname, '../../../pms(pwd a)');

async function syncAll() {
  try {
    console.log('--- STARTING CAMPS & PMS FULL SYNC ---');

    // 1. Sync aanandham.go CampOverride in Database
    console.log('1. Updating PostgreSQL CampOverride table...');
    await prisma.campOverride.upsert({
      where: { id: 'camps_catalog_v1' },
      create: {
        id: 'camps_catalog_v1',
        data: INITIAL_ALL_CAMPS
      },
      update: {
        data: INITIAL_ALL_CAMPS
      }
    });
    console.log('✅ CampOverride updated with ' + INITIAL_ALL_CAMPS.length + ' camps.');

    // 2. Sync Properties and RoomTypes in PostgreSQL Database via raw SQL
    console.log('2. Syncing Properties and RoomTypes via PostgreSQL SQL...');
    for (const camp of INITIAL_ALL_CAMPS) {
      const id = camp.id;
      const title = camp.title || camp.name;
      const shortTitle = camp.shortTitle || camp.title;
      const slug = camp.id.replace('pkg-', '');
      const category = camp.category || 'Resort';
      const region = camp.region || 'Munnar';
      const location = camp.location || 'Munnar, Kerala';
      const altitude = camp.altitude || '7,000 FT';
      const basePrice = Number(camp.price || camp.basePrice || 1499);
      const rating = Number(camp.rating || 5.0);
      const image = camp.image || '/images/high-altitude-4x4-convoy.jpg';
      const gallery = JSON.stringify(camp.gallery || []);
      const description = camp.description || '';
      const inclusions = JSON.stringify(camp.inclusions || []);
      const exclusions = JSON.stringify(camp.exclusions || []);
      const amenities = JSON.stringify(camp.amenities ? camp.amenities.map(a => a.name || a) : (camp.highlights || []));
      const isActive = camp.isAvailable !== false;
      const tenantId = 't-aanandham-hq';

      // Upsert Property
      await prisma.$executeRawUnsafe(`
        INSERT INTO "Property" ("id", "tenantId", "title", "shortTitle", "slug", "category", "region", "location", "altitude", "basePrice", "rating", "image", "gallery", "description", "inclusions", "exclusions", "amenities", "isActive", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $15::jsonb, $16::jsonb, $17::jsonb, $18, NOW())
        ON CONFLICT ("id") DO UPDATE SET
          "title" = EXCLUDED."title",
          "shortTitle" = EXCLUDED."shortTitle",
          "slug" = EXCLUDED."slug",
          "category" = EXCLUDED."category",
          "region" = EXCLUDED."region",
          "location" = EXCLUDED."location",
          "altitude" = EXCLUDED."altitude",
          "basePrice" = EXCLUDED."basePrice",
          "rating" = EXCLUDED."rating",
          "image" = EXCLUDED."image",
          "gallery" = EXCLUDED."gallery",
          "description" = EXCLUDED."description",
          "inclusions" = EXCLUDED."inclusions",
          "exclusions" = EXCLUDED."exclusions",
          "amenities" = EXCLUDED."amenities",
          "isActive" = EXCLUDED."isActive",
          "updatedAt" = NOW();
      `, id, tenantId, title, shortTitle, slug, category, region, location, altitude, basePrice, rating, image, gallery, description, inclusions, exclusions, amenities, isActive);

      // Sync RoomTypes
      if (Array.isArray(camp.rooms) && camp.rooms.length > 0) {
        await prisma.$executeRawUnsafe(`DELETE FROM "RoomType" WHERE "propertyId" = $1;`, id);

        for (const room of camp.rooms) {
          const parseCap = (c) => {
            if (typeof c === 'number') return Math.max(1, c);
            const match = String(c || '').match(/(\d+)/);
            return match ? Math.max(1, parseInt(match[1], 10)) : 2;
          };

          const roomId = room.id || `r-${id}-${Date.now()}`;
          const rName = room.name || 'Standard Unit';
          const rCap = parseCap(room.capacity);
          const rUnits = Number(room.totalUnits) || 6;
          const rPrice = Number(room.price || room.basePrice || camp.price || 0);
          const rDesc = Array.isArray(room.features) ? room.features.join(', ') : (room.features || '');
          const rImages = JSON.stringify(room.image ? [room.image] : []);

          await prisma.$executeRawUnsafe(`
            INSERT INTO "RoomType" ("id", "propertyId", "name", "capacity", "totalUnits", "basePrice", "description", "images", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
            ON CONFLICT ("id") DO UPDATE SET
              "name" = EXCLUDED."name",
              "capacity" = EXCLUDED."capacity",
              "totalUnits" = EXCLUDED."totalUnits",
              "basePrice" = EXCLUDED."basePrice",
              "description" = EXCLUDED."description",
              "images" = EXCLUDED."images",
              "updatedAt" = NOW();
          `, roomId, id, rName, rCap, rUnits, rPrice, rDesc, rImages);
        }
      }
    }
    console.log('✅ All ' + INITIAL_ALL_CAMPS.length + ' Properties & RoomTypes upserted in PostgreSQL database!');

    // 3. Write all camp modules to PMS
    console.log('3. Writing PMS camp modules...');
    const campFileMap = [
      { id: 'pkg-kolukkumalai', filename: 'kolukkumalai.js', varName: 'kolukkumalaiCamp' },
      { id: 'pkg-meesapulimala', filename: 'meesapulimala.js', varName: 'meesapulimalaCamp' },
      { id: 'pkg-suryanelli', filename: 'suryanelli.js', varName: 'suryanelliCamp' },
      { id: 'pkg-mini-mexico', filename: 'miniMexico.js', varName: 'miniMexicoCamp' },
      { id: 'pkg-wildlink', filename: 'wildlink.js', varName: 'wildlinkCamp' },
      { id: 'pkg-tentvilla-domes', filename: 'tentvilla.js', varName: 'tentvillaCamp' },
      { id: 'pkg-kolukkumalai-teddy-domes', filename: 'teddyDomes.js', varName: 'teddyDomesCamp' }
    ];

    for (const item of campFileMap) {
      const camp = INITIAL_ALL_CAMPS.find(c => c.id === item.id);
      if (camp) {
        const enrichedCamp = {
          ...camp,
          tenantId: 't-aanandham-hq',
          tenantSlug: 'aanandham.go',
          tenantName: 'Aanandham.go'
        };
        const content = `/**
 * ${camp.title}
 * ID: ${camp.id}
 */
export const ${item.varName} = ${JSON.stringify(enrichedCamp, null, 2)};

export default ${item.varName};
`;
        fs.writeFileSync(path.join(PMS_DIR, 'src/lib/camps', item.filename), content, 'utf8');
        console.log(`✅ Written PMS src/lib/camps/${item.filename}`);
      }
    }

    // 4. Update PMS src/lib/camps/index.js
    const pmsIndexContent = `/**
 * Lazy-loading index for all camp modules
 * Uses dynamic imports to reduce initial bundle size
 */

// Map of camp IDs to their dynamic import functions
const CAMP_MODULES = {
  "pkg-kolukkumalai": () =>
    import("./kolukkumalai.js").then((m) => m.default || m.kolukkumalaiCamp),
  "pkg-meesapulimala": () =>
    import("./meesapulimala.js").then((m) => m.default || m.meesapulimalaCamp),
  "pkg-suryanelli": () =>
    import("./suryanelli.js").then((m) => m.default || m.suryanelliCamp),
  "pkg-vagamon-pine": () =>
    import("./vagamon.js").then((m) => m.default || m.vagamonCamp),
  "pkg-wayanad": () =>
    import("./wayanad.js").then((m) => m.default || m.wayanadCamp),
  "pkg-mini-mexico": () =>
    import("./miniMexico.js").then((m) => m.default || m.miniMexicoCamp),
  "pkg-wildlink": () =>
    import("./wildlink.js").then((m) => m.default || m.wildlinkCamp),
  "pkg-tentvilla-domes": () =>
    import("./tentvilla.js").then((m) => m.default || m.tentvillaCamp),
  "pkg-kolukkumalai-teddy-domes": () =>
    import("./teddyDomes.js").then((m) => m.default || m.teddyDomesCamp),
};

// Cache for loaded camps
const campCache = new Map();

/**
 * Load a single camp by ID (lazy-loaded)
 */
export async function loadCamp(campId) {
  if (campCache.has(campId)) {
    return campCache.get(campId);
  }

  const loader = CAMP_MODULES[campId];
  if (!loader) {
    console.warn(\`Camp module not found: \${campId}\`);
    return null;
  }

  try {
    const camp = await loader();
    campCache.set(campId, camp);
    return camp;
  } catch (error) {
    console.error(\`Failed to load camp \${campId}:\`, error);
    return null;
  }
}

/**
 * Load multiple camps by IDs (parallel loading)
 */
export async function loadCamps(campIds) {
  const promises = campIds.map((id) => loadCamp(id));
  const results = await Promise.all(promises);
  return results.filter((camp) => camp !== null);
}

/**
 * Get all camp IDs
 */
export function getAllCampIds() {
  return Object.keys(CAMP_MODULES);
}

/**
 * Load all camps (eager loading - use sparingly)
 */
export async function loadAllCamps() {
  return loadCamps(getAllCampIds());
}

/**
 * Clear the camp cache (useful for testing or hot reload)
 */
export function clearCampCache() {
  campCache.clear();
}

/**
 * Get a camp synchronously from cache (must be preloaded)
 */
export function getCampFromCache(campId) {
  return campCache.get(campId) || null;
}

export const CAMP_IDS = Object.keys(CAMP_MODULES);

export default {
  loadCamp,
  loadCamps,
  loadAllCamps,
  getAllCampIds,
  clearCampCache,
  getCampFromCache,
  CAMP_IDS,
};
`;
    fs.writeFileSync(path.join(PMS_DIR, 'src/lib/camps/index.js'), pmsIndexContent, 'utf8');
    console.log('✅ Updated PMS src/lib/camps/index.js');

    // 5. Update PMS src/lib/campsData.js
    const pmsCampsDataContent = `// ── CENTRALIZED KERALA WILDERNESS CAMPS & PROPERTIES DATA ──
export const INITIAL_ALL_CAMPS = ${JSON.stringify(INITIAL_ALL_CAMPS, null, 2)};

export const DEPRECATED_CAMP_IDS = new Set([
  "pkg-chembra-peak",
  "pkg-900-kandi",
  "pkg-vagamon-pine",
  "pkg-athirappilly",
  "pkg-athirappilly-rapids",
  "pkg-chembra",
  "pkg-vagamon",
  "pkg-phantom",
  "pkg-wayanad"
]);

// Helper to get all active verified camps
export function getAllCamps(bookings = null) {
  return INITIAL_ALL_CAMPS.filter(c => c && c.id && !DEPRECATED_CAMP_IDS.has(c.id));
}

// Helper to find a specific camp by ID
export function getCampById(id) {
  const all = getAllCamps();
  if (!id) return all[0];
  const cleanTarget = String(id).toLowerCase().replace("pkg-", "").trim();
  return (
    all.find((c) => {
      const cleanId = String(c.id).toLowerCase().replace("pkg-", "").trim();
      return cleanId === cleanTarget || c.id === id;
    }) || all[0]
  );
}

export const INITIAL_EVENTS = ${JSON.stringify(INITIAL_EVENTS || [], null, 2)};

export const INITIAL_STAFFS = ${JSON.stringify(INITIAL_MARSHALS || [], null, 2)};
export const INITIAL_MARSHALS = INITIAL_STAFFS;
`;
    fs.writeFileSync(path.join(PMS_DIR, 'src/lib/campsData.js'), pmsCampsDataContent, 'utf8');
    console.log('✅ Updated PMS src/lib/campsData.js');

    console.log('--- ALL CAMPS & PMS SYNC COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('❌ Sync Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

syncAll();
