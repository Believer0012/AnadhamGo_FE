const fs = require('fs');
const path = require('path');

const PMS_DIR = path.resolve(__dirname, '../../../pms(pwd a)');

// 1. Update PMS Step3CamperContact.jsx
const pmsStep3Path = path.join(PMS_DIR, 'src/components/booking/Step3CamperContact.jsx');
if (fs.existsSync(pmsStep3Path)) {
  let content = fs.readFileSync(pmsStep3Path, 'utf8');

  // Add WhatsAppIcon import if not present
  if (!content.includes('WhatsAppIcon')) {
    content = content.replace(
      'import { ROW_GAP_10 } from "./BookingConstants";',
      'import { WhatsAppIcon } from "../common/BrandIcons";\nimport { ROW_GAP_10 } from "./BookingConstants";'
    );
  }

  // Add handleDirectWhatsAppBooking prop if not present
  if (!content.includes('handleDirectWhatsAppBooking,')) {
    content = content.replace(
      'handleStep3Next,\n  setStep,',
      'handleStep3Next,\n  handleDirectWhatsAppBooking,\n  setStep,\n  setValidationError = () => {},'
    );
  }

  // Add validation helper inside component if not present
  if (!content.includes('handleWhatsAppSubmit')) {
    content = content.replace(
      'return (',
      `const isValidPhoneNumber = (num) => {
    const cleaned = String(num || "").replace(/\\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 13;
  };

  const handleWhatsAppSubmit = () => {
    if (setValidationError) setValidationError("");
    if (!customerName || !customerName.trim()) {
      if (setValidationError) setValidationError("Please enter your full name as on government ID.");
      return;
    }
    if (!customerPhone || !customerPhone.trim() || !isValidPhoneNumber(customerPhone)) {
      if (setValidationError) setValidationError("Please enter a valid 10-digit mobile / WhatsApp number.");
      return;
    }
    if (handleDirectWhatsAppBooking) {
      handleDirectWhatsAppBooking();
    }
  };

  return (`
    );
  }

  // Replace action buttons with sole Enquire via WhatsApp button
  const oldActionsRegex = /\{\/\* Actions \*\/\}\s*<div\s+className="booking-step-actions"[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}/;
  const newActions = `{/* Actions */}
      <div
        className="booking-step-actions"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => setStep(2)}
          className="btn-secondary"
          style={{
            background: "#F1F3EC",
            border: "none",
            fontSize: "13px",
            fontWeight: "700",
            color: "#59655D",
            cursor: "pointer",
            padding: "10px 18px",
            borderRadius: "12px",
          }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleWhatsAppSubmit}
          title="Send reservation inquiry with your selected campsite, lodging, dates & details directly to WhatsApp Concierge"
          style={{
            padding: "13px 26px",
            fontSize: "14.5px",
            fontWeight: "900",
            borderRadius: "14px",
            background: "#25D366",
            border: "none",
            color: "#0A2E14",
            display: "inline-flex",
            alignItems: "center",
            gap: "9px",
            cursor: "pointer",
            boxShadow: "0 4px 18px rgba(37, 211, 102, 0.35)",
            transition: "all 0.2s ease",
          }}
        >
          <WhatsAppIcon size={19} color="#0A2E14" />
          <span>Enquire via WhatsApp →</span>
        </button>
      </div>
    </div>
  );
}`;

  content = content.replace(oldActionsRegex, newActions);
  fs.writeFileSync(pmsStep3Path, content, 'utf8');
  console.log('✅ Updated PMS Step3CamperContact.jsx with sole Enquire via WhatsApp action');
}

// 2. Update PMS BookingWizardHeader.jsx
const pmsHeaderPath = path.join(PMS_DIR, 'src/components/booking/BookingWizardHeader.jsx');
if (fs.existsSync(pmsHeaderPath)) {
  let content = fs.readFileSync(pmsHeaderPath, 'utf8');
  content = content.replace(
    "{step === 3 && '3. Camper & Contact Information'}",
    "{step === 3 && '3. Camper Info & WhatsApp Enquiry'}"
  );
  content = content.replace(
    "{step < 4 && (",
    "{step < 4 && ("
  );
  content = content.replace(
    "{step < 5 && (",
    "{step < 4 && ("
  );
  // replace 4-element steps array with 3-element steps array
  const stepsBarRegex = /\{\[\s*\{\s*num:\s*1[\s\S]*?\}\s*\]\.map/;
  const newStepsBar = `{[
            { num: 1, label: 'Stay & Dates', shortLabel: 'Stays' },
            { num: 2, label: 'Add-Ons', shortLabel: 'Add-Ons' },
            { num: 3, label: 'WhatsApp Enquiry', shortLabel: 'Enquire' }
          ].map`;
  content = content.replace(stepsBarRegex, newStepsBar);
  content = content.replace('{idx < 3 &&', '{idx < 2 &&');
  fs.writeFileSync(pmsHeaderPath, content, 'utf8');
  console.log('✅ Updated PMS BookingWizardHeader.jsx to 3-step WhatsApp Enquiry flow');
}
