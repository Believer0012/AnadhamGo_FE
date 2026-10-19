const fs = require('fs');
const path = require('path');

const PMS_DIR = path.resolve(__dirname, '../../../pms(pwd a)');
const targetFile = path.join(PMS_DIR, 'src/app/api/properties/route.js');

let content = fs.readFileSync(targetFile, 'utf8');

// Replace where.bypassTenantCheck with clean where filter
content = content.replace(
  `        const where = {};
        if (tenantId && tenantId !== "all") {
          where.tenantId = tenantId;
        } else {
          where.bypassTenantCheck = true;
        }
        if (region) where.region = { equals: region, mode: "insensitive" };
        where.isActive = true;`,
  `        const where = { isActive: true };
        if (tenantId && tenantId !== "all") {
          where.tenantId = tenantId;
        }
        if (region) where.region = { equals: region, mode: "insensitive" };`
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('✅ Fixed properties route in PMS.');
