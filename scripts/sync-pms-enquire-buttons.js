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
      'handleStep3Next,\n  handleDirectWhatsAppBooking,\n  setStep,'
    );
  }

  // Replace action buttons with side-by-side buttons
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
            padding: "10px 16px",
            borderRadius: "10px",
          }}
        >
          ← Back
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {handleDirectWhatsAppBooking && (
            <button
              type="button"
              onClick={handleDirectWhatsAppBooking}
              title="Send reservation inquiry with your details directly to WhatsApp Concierge"
              style={{
                padding: "12px 18px",
                fontSize: "13.5px",
                fontWeight: "800",
                borderRadius: "12px",
                background: "#25D366",
                border: "none",
                color: "#0A2E14",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37, 211, 102, 0.28)",
                transition: "all 0.2s ease",
              }}
            >
              <WhatsAppIcon size={17} color="#0A2E14" />
              <span>Enquire via WhatsApp</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleStep3Next}
            className="btn-lime"
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "800",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <span>Enquire & Pay</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}`;

  content = content.replace(oldActionsRegex, newActions);
  fs.writeFileSync(pmsStep3Path, content, 'utf8');
  console.log('✅ Updated PMS Step3CamperContact.jsx with side-by-side Enquire via WhatsApp and Enquire & Pay');
}

// 2. Update PMS Step4PaymentGateway.jsx
const pmsStep4Path = path.join(PMS_DIR, 'src/components/booking/Step4PaymentGateway.jsx');
if (fs.existsSync(pmsStep4Path)) {
  let content = fs.readFileSync(pmsStep4Path, 'utf8');
  const oldStep4ActionsRegex = /\{\/\* Actions \*\/\}\s*<div\s+className="booking-step-actions"[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}/;
  const newStep4Actions = `{/* Actions */}
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
          onClick={() => setStep(3)}
          className="btn-secondary"
          style={{
            background: "#F1F3EC",
            border: "none",
            fontSize: "13px",
            fontWeight: "700",
            color: "#59655D",
            cursor: "pointer",
            padding: "10px 16px",
            borderRadius: "10px",
          }}
        >
          ← Back
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {paymentSettings.mode === "coming_soon" ? (
            <button
              type="button"
              onClick={handleDirectWhatsAppBooking}
              disabled={isSubmitting}
              className="btn-lime"
              style={{
                padding: "13px 26px",
                fontSize: "14px",
                fontWeight: "900",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(229, 169, 59, 0.4)",
              }}
            >
              <WhatsAppIcon size={18} color="#121613" />
              <span>Reserve via WhatsApp (Zero Advance) →</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDirectWhatsAppBooking}
                disabled={isSubmitting}
                title="Send reservation directly to 24/7 WhatsApp Concierge"
                style={{
                  padding: "12px 20px",
                  fontSize: "13.5px",
                  fontWeight: "800",
                  borderRadius: "12px",
                  background: "#25D366",
                  border: "none",
                  color: "#0A2E14",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(37, 211, 102, 0.28)",
                  transition: "all 0.2s ease",
                }}
              >
                <WhatsAppIcon size={18} color="#0A2E14" />
                <span>Enquire via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleRazorpayCheckout}
                disabled={isSubmitting}
                className="btn-lime"
                style={{
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "900",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                <span>
                  {isSubmitting
                    ? "Opening Secure Checkout..."
                    : \`Enquire & Pay (₹\${(paymentMode === "advance" ? advanceAmount : totalAmount).toLocaleString("en-IN")}) →\`}
                </span>
                <ShieldCheck size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}`;

  content = content.replace(oldStep4ActionsRegex, newStep4Actions);
  fs.writeFileSync(pmsStep4Path, content, 'utf8');
  console.log('✅ Updated PMS Step4PaymentGateway.jsx with side-by-side Enquire via WhatsApp and Enquire & Pay');
}

// 3. Update PMS BookingEngineModal.jsx
const pmsModalPath = path.join(PMS_DIR, 'src/components/BookingEngineModal.jsx');
if (fs.existsSync(pmsModalPath)) {
  let content = fs.readFileSync(pmsModalPath, 'utf8');
  content = content.replace(
    'handleStep3Next={handleStep3Next}\n                            setStep={setStep}',
    'handleStep3Next={handleStep3Next}\n                            handleDirectWhatsAppBooking={handleDirectWhatsAppBooking}\n                            setStep={setStep}'
  );
  fs.writeFileSync(pmsModalPath, content, 'utf8');
  console.log('✅ Updated PMS BookingEngineModal.jsx passing handleDirectWhatsAppBooking');
}

// 4. Update PMS BookingWizardHeader.jsx
const pmsHeaderPath = path.join(PMS_DIR, 'src/components/booking/BookingWizardHeader.jsx');
if (fs.existsSync(pmsHeaderPath)) {
  let content = fs.readFileSync(pmsHeaderPath, 'utf8');
  content = content.replace(
    "{step === 4 && '4. Payment & Reservation Details'}",
    "{step === 4 && '4. Enquire & Payment Confirmation'}"
  );
  content = content.replace(
    "label: paymentSettings?.mode === 'coming_soon' ? 'Voucher Pass' : 'Payment'",
    "label: paymentSettings?.mode === 'coming_soon' ? 'WhatsApp Pass' : 'Enquire & Pay'"
  );
  content = content.replace(
    "shortLabel: 'Payment'",
    "shortLabel: 'Enquire & Pay'"
  );
  fs.writeFileSync(pmsHeaderPath, content, 'utf8');
  console.log('✅ Updated PMS BookingWizardHeader.jsx');
}
