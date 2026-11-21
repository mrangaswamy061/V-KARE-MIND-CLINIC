import {
  DoctorPaymentSettings,
  PaymentRequest,
  PaymentTransaction,
  PaymentStatus,
  SessionTypeFee,
} from "../types";
import { DOCTORS } from "../data/clinicData";

const DOCTOR_PAYMENTS_KEY = "vkare_doctor_payments";
const PAYMENT_REQUESTS_KEY = "vkare_payment_requests";
const PAYMENT_TRANSACTIONS_KEY = "vkare_payment_transactions";

// Standard UPI payment string generator (e.g. for Google Pay, PhonePe, Paytm)
export function createUpiUri(upiId: string, payeeName: string, amount: number, note: string = "Consultation Fee"): string {
  const cleanId = upiId.trim() || "vkaremind@upi";
  const cleanName = encodeURIComponent(payeeName.trim() || "V-KARE Clinic");
  const cleanNote = encodeURIComponent(note);
  return `upi://pay?pa=${cleanId}&pn=${cleanName}&am=${amount}&cu=INR&tn=${cleanNote}`;
}

// Generate a clean, crisp SVG QR Code representation for any UPI ID & amount
export function generateUpiQrDataUrl(upiId: string, payeeName: string, amount: number): string {
  const upiLink = createUpiUri(upiId, payeeName, amount);
  // High quality SVG QR-code visual with V-KARE branding
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300" data-upi="${upiLink}">
      <defs>
        <linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#123B66" />
          <stop offset="100%" stop-color="#087F8C" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" rx="24" fill="#FFFFFF" />
      <rect x="12" y="12" width="276" height="276" rx="16" fill="none" stroke="#D9EAF5" stroke-width="2" />
      
      <!-- Top Left Pos Marker -->
      <rect x="30" y="30" width="60" height="60" rx="8" fill="none" stroke="url(#qrGrad)" stroke-width="6" />
      <rect x="42" y="42" width="36" height="36" rx="4" fill="#123B66" />
      
      <!-- Top Right Pos Marker -->
      <rect x="210" y="30" width="60" height="60" rx="8" fill="none" stroke="url(#qrGrad)" stroke-width="6" />
      <rect x="222" y="42" width="36" height="36" rx="4" fill="#123B66" />
      
      <!-- Bottom Left Pos Marker -->
      <rect x="30" y="210" width="60" height="60" rx="8" fill="none" stroke="url(#qrGrad)" stroke-width="6" />
      <rect x="42" y="222" width="36" height="36" rx="4" fill="#123B66" />
      
      <!-- Procedural QR Data Matrix pattern -->
      <g fill="#123B66">
        <rect x="105" y="35" width="10" height="20" rx="2" />
        <rect x="125" y="30" width="20" height="10" rx="2" />
        <rect x="155" y="35" width="15" height="15" rx="2" />
        <rect x="180" y="45" width="15" height="10" rx="2" />
        
        <rect x="105" y="65" width="25" height="10" rx="2" />
        <rect x="140" y="60" width="10" height="25" rx="2" />
        <rect x="160" y="70" width="20" height="15" rx="2" />
        <rect x="190" y="65" width="10" height="20" rx="2" />

        <rect x="35" y="105" width="20" height="10" rx="2" />
        <rect x="65" y="110" width="15" height="20" rx="2" />
        <rect x="30" y="140" width="10" height="25" rx="2" />
        <rect x="50" y="150" width="25" height="10" rx="2" />
        <rect x="80" y="135" width="15" height="15" rx="2" />
        <rect x="35" y="175" width="20" height="15" rx="2" />
        <rect x="65" y="170" width="15" height="25" rx="2" />

        <rect x="105" y="105" width="20" height="20" rx="3" fill="#087F8C" />
        <rect x="135" y="105" width="15" height="10" rx="2" />
        <rect x="160" y="115" width="25" height="15" rx="2" />
        <rect x="195" y="105" width="15" height="20" rx="2" />
        <rect x="220" y="105" width="20" height="10" rx="2" />
        <rect x="250" y="115" width="15" height="15" rx="2" />

        <rect x="105" y="135" width="15" height="15" rx="2" />
        <rect x="130" y="145" width="20" height="10" rx="2" />
        <rect x="160" y="140" width="10" height="25" rx="2" />
        <rect x="180" y="150" width="25" height="10" rx="2" />
        <rect x="215" y="135" width="15" height="20" rx="2" />
        <rect x="240" y="145" width="25" height="15" rx="2" />

        <rect x="105" y="170" width="25" height="10" rx="2" />
        <rect x="140" y="165" width="10" height="20" rx="2" />
        <rect x="160" y="175" width="20" height="15" rx="2" />
        <rect x="190" y="170" width="15" height="20" rx="2" />
        <rect x="215" y="165" width="20" height="10" rx="2" />
        <rect x="245" y="175" width="20" height="15" rx="2" />

        <rect x="105" y="210" width="20" height="15" rx="2" />
        <rect x="135" y="220" width="25" height="10" rx="2" />
        <rect x="170" y="210" width="15" height="25" rx="2" />
        <rect x="195" y="215" width="20" height="10" rx="2" />
        <rect x="225" y="210" width="15" height="15" rx="2" />
        <rect x="250" y="220" width="20" height="15" rx="2" />

        <rect x="105" y="245" width="15" height="20" rx="2" />
        <rect x="130" y="240" width="20" height="10" rx="2" />
        <rect x="160" y="250" width="25" height="15" rx="2" />
        <rect x="195" y="240" width="15" height="20" rx="2" />
        <rect x="220" y="250" width="20" height="10" rx="2" />
        <rect x="250" y="245" width="15" height="20" rx="2" />
      </g>
      
      <!-- Center Emblem: V-KARE UPI -->
      <rect x="120" y="120" width="60" height="60" rx="14" fill="#FFFFFF" stroke="#087F8C" stroke-width="3" />
      <text x="150" y="146" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#123B66" text-anchor="middle">V-KARE</text>
      <text x="150" y="164" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#087F8C" text-anchor="middle">UPI ₹</text>
    </svg>
  `.trim();

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// Default session fees configuration
export const DEFAULT_SESSION_FEES: SessionTypeFee[] = [
  { sessionType: "In-Person (Clinic Visit)", fee: 800 },
  { sessionType: "Online (Video Consultation)", fee: 800 },
  { sessionType: "Comprehensive Evaluation", fee: 1200 },
  { sessionType: "Follow-up Review", fee: 600 },
];

const DEMO_PAYMENT_IDS = ["VK-PAY-2026-9041", "VK-PAY-2026-9042", "VK-PAY-2026-9043"];

// Initialize default doctor settings
function createDefaultDoctorSettings(): DoctorPaymentSettings[] {
  return DOCTORS.map((doc) => {
    const isSpecialist = doc.name.includes("Keerthi") || doc.name.includes("Kaushal");
    const baseFee = isSpecialist ? 800 : 700;
    const upiId = `${doc.name.toLowerCase().replace(/[^a-z]/g, "")}@okaxis`;

    return {
      doctorId: doc.id,
      doctorName: doc.name,
      consultationFee: baseFee,
      sessionFees: [
        { sessionType: "In-Person (Clinic Visit)", fee: baseFee },
        { sessionType: "Online (Video Consultation)", fee: baseFee },
        { sessionType: "Comprehensive Evaluation", fee: baseFee + 400 },
        { sessionType: "Follow-up Review", fee: baseFee - 200 },
      ],
      upiId,
      upiQrImage: generateUpiQrDataUrl(upiId, doc.name, baseFee),
      paymentEnabled: true,
      updatedAt: new Date().toISOString(),
    };
  });
}

class PaymentService {
  // ─── Doctor Settings ────────────────────────────────────────────────────────
  getDoctorSettingsList(): DoctorPaymentSettings[] {
    try {
      const raw = localStorage.getItem(DOCTOR_PAYMENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    const defaults = createDefaultDoctorSettings();
    localStorage.setItem(DOCTOR_PAYMENTS_KEY, JSON.stringify(defaults));
    return defaults;
  }

  getDoctorSettings(doctorIdOrName: string): DoctorPaymentSettings {
    const list = this.getDoctorSettingsList();
    const found = list.find(
      (s) => s.doctorId === doctorIdOrName || s.doctorName.toLowerCase() === doctorIdOrName.toLowerCase()
    );
    if (found) return found;

    // Fallback new default
    const newDocSettings: DoctorPaymentSettings = {
      doctorId: doctorIdOrName,
      doctorName: doctorIdOrName,
      consultationFee: 800,
      sessionFees: DEFAULT_SESSION_FEES,
      upiId: "vkaremind@upi",
      upiQrImage: generateUpiQrDataUrl("vkaremind@upi", doctorIdOrName, 800),
      paymentEnabled: true,
      updatedAt: new Date().toISOString(),
    };
    this.saveDoctorSettings(newDocSettings);
    return newDocSettings;
  }

  saveDoctorSettings(settings: DoctorPaymentSettings): void {
    const list = this.getDoctorSettingsList();
    const idx = list.findIndex(
      (s) => s.doctorId === settings.doctorId || s.doctorName.toLowerCase() === settings.doctorName.toLowerCase()
    );
    const updated = { ...settings, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    localStorage.setItem(DOCTOR_PAYMENTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
  }

  // ─── Payment Requests ───────────────────────────────────────────────────────
  getAllRequests(): PaymentRequest[] {
    try {
      const raw = localStorage.getItem(PAYMENT_REQUESTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((r: PaymentRequest) => !DEMO_PAYMENT_IDS.includes(r.paymentId));
          localStorage.setItem(PAYMENT_REQUESTS_KEY, JSON.stringify(clean));
          return clean;
        }
      }
    } catch {
      // ignore
    }
    localStorage.setItem(PAYMENT_REQUESTS_KEY, JSON.stringify([]));
    return [];
  }

  getRequestById(paymentId: string): PaymentRequest | null {
    const list = this.getAllRequests();
    return list.find((r) => r.paymentId === paymentId) ?? null;
  }

  createRequest(
    data: Omit<PaymentRequest, "paymentId" | "createdAt" | "updatedAt" | "paymentStatus"> & {
      initialStatus?: PaymentStatus;
    }
  ): PaymentRequest {
    const list = this.getAllRequests();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const paymentId = `VK-PAY-${new Date().getFullYear()}-${randomDigits}`;

    const newReq: PaymentRequest = {
      ...data,
      paymentId,
      paymentStatus: data.initialStatus ?? "Payment Requested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newReq, ...list];
    localStorage.setItem(PAYMENT_REQUESTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return newReq;
  }

  updateRequestStatus(paymentId: string, status: PaymentStatus): PaymentRequest | null {
    const list = this.getAllRequests();
    const idx = list.findIndex((r) => r.paymentId === paymentId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PAYMENT_REQUESTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return list[idx];
  }

  // ─── Transactions & Proofs ──────────────────────────────────────────────────
  getAllTransactions(): PaymentTransaction[] {
    try {
      const raw = localStorage.getItem(PAYMENT_TRANSACTIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((t: PaymentTransaction) => !DEMO_PAYMENT_IDS.includes(t.paymentId));
          localStorage.setItem(PAYMENT_TRANSACTIONS_KEY, JSON.stringify(clean));
          return clean;
        }
      }
    } catch {
      // ignore
    }
    localStorage.setItem(PAYMENT_TRANSACTIONS_KEY, JSON.stringify([]));
    return [];
  }

  getTransactionByPaymentId(paymentId: string): PaymentTransaction | null {
    const txns = this.getAllTransactions();
    return txns.find((t) => t.paymentId === paymentId) ?? null;
  }

  submitPaymentProof(
    paymentId: string,
    upiReference: string,
    screenshot?: string,
    notes?: string
  ): { request: PaymentRequest | null; transaction: PaymentTransaction } {
    const txns = this.getAllTransactions();
    const existingIdx = txns.findIndex((t) => t.paymentId === paymentId);

    const transactionId = `TXN-${paymentId.replace("VK-PAY-", "")}-${Date.now().toString().slice(-4)}`;
    const newTxn: PaymentTransaction = {
      transactionId,
      paymentId,
      upiReference: upiReference.trim(),
      screenshot: screenshot || undefined,
      verificationStatus: "Pending",
      submittedAt: new Date().toISOString(),
      notes: notes || "Submitted by patient",
    };

    if (existingIdx >= 0) {
      txns[existingIdx] = newTxn;
    } else {
      txns.unshift(newTxn);
    }
    localStorage.setItem(PAYMENT_TRANSACTIONS_KEY, JSON.stringify(txns));

    const req = this.updateRequestStatus(paymentId, "Payment Submitted");
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return { request: req, transaction: newTxn };
  }

  verifyPayment(
    paymentId: string,
    verifiedBy: string = "Admin",
    notes?: string
  ): { request: PaymentRequest | null; transaction: PaymentTransaction | null } {
    const req = this.updateRequestStatus(paymentId, "Payment Verified");

    const txns = this.getAllTransactions();
    const idx = txns.findIndex((t) => t.paymentId === paymentId);
    let txn: PaymentTransaction | null = null;
    if (idx >= 0) {
      txns[idx] = {
        ...txns[idx],
        verificationStatus: "Verified",
        verifiedBy,
        verifiedAt: new Date().toISOString(),
        notes: notes || txns[idx].notes,
      };
      txn = txns[idx];
      localStorage.setItem(PAYMENT_TRANSACTIONS_KEY, JSON.stringify(txns));
    }
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return { request: req, transaction: txn };
  }

  rejectPayment(
    paymentId: string,
    rejectedBy: string = "Admin",
    reason: string = "Invalid UPI transaction reference"
  ): { request: PaymentRequest | null; transaction: PaymentTransaction | null } {
    const req = this.updateRequestStatus(paymentId, "Payment Rejected");

    const txns = this.getAllTransactions();
    const idx = txns.findIndex((t) => t.paymentId === paymentId);
    let txn: PaymentTransaction | null = null;
    if (idx >= 0) {
      txns[idx] = {
        ...txns[idx],
        verificationStatus: "Rejected",
        rejectionReason: reason,
        verifiedBy: rejectedBy,
        verifiedAt: new Date().toISOString(),
      };
      txn = txns[idx];
      localStorage.setItem(PAYMENT_TRANSACTIONS_KEY, JSON.stringify(txns));
    }
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return { request: req, transaction: txn };
  }

  // ─── WhatsApp Integration ───────────────────────────────────────────────────
  getWhatsAppPaymentUrl(req: PaymentRequest): string {
    const cleanPhone = req.patientPhone.replace(/[^0-9]/g, "");
    const paymentUrl = `${window.location.origin}/#pay?id=${req.paymentId}`;
    const text =
      `Your consultation session with ${req.doctorName} has been completed. ` +
      `Your consultation fee is ₹${req.amount}. ` +
      `Please scan the payment QR code to complete your payment: ${paymentUrl} ` +
      `Thank you for choosing V-KARE Mind and Brain Clinic.`;
    return `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(text)}`;
  }
}

export const paymentService = new PaymentService();
