const fs = require('fs');
const path = require('path');

const PMS_DIR = path.resolve(__dirname, '../../../pms(pwd a)');

const pmsModalPath = path.join(PMS_DIR, 'src/components/BookingEngineModal.jsx');
if (fs.existsSync(pmsModalPath)) {
  let content = fs.readFileSync(pmsModalPath, 'utf8');
  content = content.replace(/\*🏕️ Campsite Booking & Permit Inquiry - Aanandham Wilderness\*/g, '*Aanandham Wilderness — Campsite Booking & Permit Inquiry*');
  content = content.replace(/•/g, '-');
  fs.writeFileSync(pmsModalPath, content, 'utf8');
  console.log('✅ Cleaned WhatsApp template in PMS BookingEngineModal.jsx');
}

const pmsWizardPath = path.join(PMS_DIR, 'src/components/booking/BookingWizard.jsx');
if (fs.existsSync(pmsWizardPath)) {
  let content = fs.readFileSync(pmsWizardPath, 'utf8');
  content = content.replace(/\*🏕️ Campsite Booking & Permit Inquiry - Aanandham Wilderness\*/g, '*Aanandham Wilderness — Campsite Booking & Permit Inquiry*');
  content = content.replace(/•/g, '-');
  fs.writeFileSync(pmsWizardPath, content, 'utf8');
  console.log('✅ Cleaned WhatsApp template in PMS BookingWizard.jsx');
}
