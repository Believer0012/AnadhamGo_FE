const fs = require('fs');
const path = require('path');

const PMS_DIR = path.resolve(__dirname, '../../../pms(pwd a)');

// Update PMS BookingWizard.jsx
const pmsWizardPath = path.join(PMS_DIR, 'src/components/booking/BookingWizard.jsx');
if (fs.existsSync(pmsWizardPath)) {
  let content = fs.readFileSync(pmsWizardPath, 'utf8');
  if (!content.includes('handleStep3Next={handleStep3Next}\n              handleDirectWhatsAppBooking={handleDirectWhatsAppBooking}')) {
    content = content.replace(
      'handleStep3Next={handleStep3Next}\n              setStep={setStep}',
      'handleStep3Next={handleStep3Next}\n              handleDirectWhatsAppBooking={handleDirectWhatsAppBooking}\n              setStep={setStep}'
    );
    fs.writeFileSync(pmsWizardPath, content, 'utf8');
    console.log('✅ Updated PMS BookingWizard.jsx passing handleDirectWhatsAppBooking to Step 3');
  }
}
