import {
  DoctorPaymentSettings,
  PaymentRequest,
  PaymentTransaction,
  PaymentStatus,
  SessionTypeFee,
} from "../types";
import { DOCTORS } from "../data/clinicData";
import { generateQrSvgDataUrl } from "../utils/qrUtils";

const DOCTOR_PAYMENTS_KEY = "vkare_doctor_payments";
const PAYMENT_REQUESTS_KEY = "vkare_payment_requests";
const PAYMENT_TRANSACTIONS_KEY = "vkare_payment_transactions";

const PLACEHOLDER_AUTO_VPAS = new Set([
  "vkaremind@upi",
  ...DOCTORS.map((d) => `${d.name.toLowerCase().replace(/[^a-z]/g, "")}@okaxis`),
]);

export function isValidUpiIdFormat(upiId?: string): boolean {
  const trimmed = (upiId || "").trim();
  return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/.test(trimmed);
}

export function isPlaceholderUpiId(upiId?: string): boolean {
  const trimmed = (upiId || "").trim().toLowerCase();
  if (!trimmed || !isValidUpiIdFormat(trimmed)) return true;
  return PLACEHOLDER_AUTO_VPAS.has(trimmed);
}

export function isUploadedCustomQr(qrImage?: string): boolean {
  if (!qrImage || typeof qrImage !== "string") return false;
  const trimmed = qrImage.trim();
  return trimmed.startsWith("data:image/") && !trimmed.startsWith("data:image/svg+xml");
}

function sanitizeUpiText(value: string, fallback: string, maxLen: number = 50): string {
  const cleaned = (value || "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
  return cleaned || fallback;
}

export interface UpiUriOptions {
  transactionRef?: string;
  merchantCode?: string;
  lockAmount?: boolean;
}

function buildUpiQueryString(
  upiId: string,
  payeeName: string,
  amount: number,
  note: string = "Consultation Fee",
  options?: UpiUriOptions
): string {
  const cleanId = (upiId || "").trim();
  const cleanName = sanitizeUpiText(payeeName, "V KARE Clinic", 50);
  const fixedAmount = Math.max(1, Number(amount) || 0).toFixed(2);
  const cleanNote = sanitizeUpiText(note, "V KARE Consultation Fee", 50);

  const params = new URLSearchParams({
    pa: cleanId,
    pn: cleanName,
    am: fixedAmount,
    cu: "INR",
    tn: cleanNote,
  });

  // NPCI mam locks minimum amount to prevent payer editing below the entered consultation fee
  if (options?.lockAmount !== false) {
    params.set("mam", fixedAmount);
  }

  if (options?.transactionRef) {
    const cleanTr = options.transactionRef.replace(/[^a-zA-Z0-9]/g, "").slice(0, 35);
    if (cleanTr) params.set("tr", cleanTr);
  }

  if (options?.merchantCode && /^\d{4}$/.test(options.merchantCode.trim())) {
    params.set("mc", options.merchantCode.trim());
  }

  // PhonePe / GPay parsers expect strict RFC-3986 %20 instead of +
  return params.toString().replace(/\+/g, "%20");
}

// Standard UPI payment string generator (Google Pay, PhonePe, Paytm, BHIM)
export function createUpiUri(
  upiId: string,
  payeeName: string,
  amount: number,
  note: string = "Consultation Fee",
  options?: UpiUriOptions
): string {
  const cleanId = upiId.trim();
  if (!cleanId) return "";
  return `upi://pay?${buildUpiQueryString(cleanId, payeeName, amount, note, options)}`;
}

// App-specific deep link schemes (used on iOS where generic upi:// fails and for app targeting)
export function createUpiAppUris(
  upiId: string,
  payeeName: string,
  amount: number,
  note: string = "Consultation Fee",
  options?: UpiUriOptions
): {
  standard: string;
  gpayIos: string;
  phonepeIos: string;
  paytmIos: string;
} {
  const qs = buildUpiQueryString(upiId, payeeName, amount, note, options);
  return {
    standard: `upi://pay?${qs}`,
    gpayIos: `tez://upi/pay?${qs}`,
    phonepeIos: `phonepe://pay?${qs}`,
    paytmIos: `paytmmp://pay?${qs}`,
  };
}

// Generate a real ISO-compliant scannable SVG QR Code for a UPI ID & locked amount
export function generateUpiQrDataUrl(
  upiId: string,
  payeeName: string,
  amount: number,
  note: string = "Consultation Fee",
  options?: UpiUriOptions
): string {
  const upiLink = createUpiUri(upiId.trim() || "vkaremind@upi", payeeName, amount, note, options);
  return generateQrSvgDataUrl(upiLink);
}

// Default session fees configuration
export const DEFAULT_SESSION_FEES: SessionTypeFee[] = [
  { sessionType: "In-Person (Clinic Visit)", fee: 800 },
  { sessionType: "Online (Video Consultation)", fee: 800 },
  { sessionType: "Comprehensive Evaluation", fee: 1200 },
  { sessionType: "Follow-up Review", fee: 600 },
];

const DEMO_PAYMENT_IDS = ["VK-PAY-2026-9041", "VK-PAY-2026-9042", "VK-PAY-2026-9043"];

function safeSetLocalStorage(key: string, data: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Failed saving ${key} to localStorage:`, err);
    return false;
  }
}

// Initialize default doctor settings (no fake hardcoded SVGs stored as uploaded QR)
function createDefaultDoctorSettings(): DoctorPaymentSettings[] {
  return DOCTORS.map((doc) => {
    const isSpecialist = doc.name.includes("Keerthi") || doc.name.includes("Kaushal");
    const baseFee = isSpecialist ? 800 : 700;

    return {
      doctorId: doc.id,
      doctorName: doc.name,
      consultationFee: baseFee,
      sessionFees: [
        { sessionType: "In-Person (Clinic Visit)", fee: baseFee },
        { sessionType: "Online (Video Consultation)", fee: baseFee },
        { sessionType: "Comprehensive Evaluation", fee: baseFee + 400 },
        { sessionType: "Follow-up Review", fee: Math.max(200, baseFee - 200) },
      ],
      upiId: "",
      payeeName: doc.name,
      upiQrImage: "",
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrate legacy placeholder VPAs / old fake SVG strings safely without losing user-uploaded photos
          return parsed.map((entry: DoctorPaymentSettings) => ({
            ...entry,
            upiId: isPlaceholderUpiId(entry.upiId) ? "" : entry.upiId?.trim(),
            upiQrImage: isUploadedCustomQr(entry.upiQrImage) ? entry.upiQrImage : "",
          }));
        }
      }
    } catch {
      // ignore malformed storage
    }
    const defaults = createDefaultDoctorSettings();
    safeSetLocalStorage(DOCTOR_PAYMENTS_KEY, defaults);
    return defaults;
  }

  findDoctorSettings(doctorIdOrName: string): DoctorPaymentSettings | null {
    if (!doctorIdOrName) return null;
    const needle = doctorIdOrName.trim().toLowerCase();
    const list = this.getDoctorSettingsList();
    return (
      list.find(
        (s) =>
          s.doctorId.toLowerCase() === needle ||
          s.doctorName.toLowerCase() === needle ||
          s.doctorName.toLowerCase().includes(needle) ||
          needle.includes(s.doctorName.toLowerCase())
      ) ?? null
    );
  }

  getDoctorSettings(doctorIdOrName: string): DoctorPaymentSettings {
    const existing = this.findDoctorSettings(doctorIdOrName);
    if (existing) return existing;

    const newDocSettings: DoctorPaymentSettings = {
      doctorId: doctorIdOrName,
      doctorName: doctorIdOrName,
      consultationFee: 800,
      sessionFees: DEFAULT_SESSION_FEES,
      upiId: "",
      payeeName: doctorIdOrName,
      upiQrImage: "",
      paymentEnabled: true,
      updatedAt: new Date().toISOString(),
    };
    this.saveDoctorSettings(newDocSettings);
    return newDocSettings;
  }

  saveDoctorSettings(settings: DoctorPaymentSettings): boolean {
    const list = this.getDoctorSettingsList();
    const idx = list.findIndex(
      (s) =>
        s.doctorId === settings.doctorId ||
        s.doctorName.toLowerCase() === settings.doctorName.toLowerCase()
    );
    const sanitizedUpi = isPlaceholderUpiId(settings.upiId) ? "" : settings.upiId?.trim();
    const sanitizedQr = isUploadedCustomQr(settings.upiQrImage) ? settings.upiQrImage : "";
    const updated: DoctorPaymentSettings = {
      ...settings,
      upiId: sanitizedUpi,
      upiQrImage: sanitizedQr,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    const saved = safeSetLocalStorage(DOCTOR_PAYMENTS_KEY, list);
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return saved;
  }

  // ─── Payment Requests ───────────────────────────────────────────────────────
  getAllRequests(): PaymentRequest[] {
    try {
      const raw = localStorage.getItem(PAYMENT_REQUESTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((r: PaymentRequest) => !DEMO_PAYMENT_IDS.includes(r.paymentId));
          if (clean.length !== parsed.length) {
            safeSetLocalStorage(PAYMENT_REQUESTS_KEY, clean);
          }
          return clean;
        }
      }
    } catch {
      // ignore
    }
    safeSetLocalStorage(PAYMENT_REQUESTS_KEY, []);
    return [];
  }

  getRequestById(paymentId: string): PaymentRequest | null {
    const cleanId = paymentId.trim().toUpperCase();
    const list = this.getAllRequests();
    return list.find((r) => r.paymentId.toUpperCase() === cleanId) ?? null;
  }

  resolveRequestFromUrl(
    paymentId: string,
    params?: URLSearchParams | Record<string, string>
  ): PaymentRequest | null {
    if (!paymentId) return null;
    const cleanId = paymentId.trim().toUpperCase();
    const existing = this.getRequestById(cleanId);

    const getVal = (k: string) => {
      if (!params) return null;
      if (params instanceof URLSearchParams) return params.get(k);
      return params[k] || null;
    };

    const amtParam = getVal("amt") || getVal("amount");
    const parsedAmt = amtParam !== null ? Number(amtParam) : NaN;
    const hasExplicitAmount = Number.isFinite(parsedAmt) && parsedAmt >= 1;

    const upiParam = (getVal("upi") || "").trim();
    const hasExplicitUpi = Boolean(upiParam) && !isPlaceholderUpiId(upiParam);

    const docParam = (getVal("doc") || getVal("doctor") || "").trim();
    const patParam = (getVal("pat") || getVal("patient") || "").trim();
    const phParam = (getVal("ph") || getVal("phone") || "").trim();
    const typeParam = (getVal("type") || getVal("sessionType") || "").trim();
    const dateParam = (getVal("date") || "").trim();
    const pnParam = (getVal("pn") || "").trim();
    const mcParam = (getVal("mc") || "").trim();

    if (existing) {
      // Sync explicit URL params into unpaid local records so fixed entered fee edits stick consistently
      const isFinalized =
        existing.paymentStatus === "Payment Verified" || existing.paymentStatus === "Payment Submitted";

      if (
        !isFinalized &&
        ((hasExplicitAmount && parsedAmt !== existing.amount) ||
          (hasExplicitUpi && upiParam !== existing.doctorUpiId) ||
          (pnParam && pnParam !== existing.merchantPayeeName) ||
          (mcParam && mcParam !== existing.merchantCode))
      ) {
        const list = this.getAllRequests();
        const idx = list.findIndex((r) => r.paymentId.toUpperCase() === cleanId);
        if (idx >= 0) {
          list[idx] = {
            ...list[idx],
            amount: hasExplicitAmount ? parsedAmt : list[idx].amount,
            doctorUpiId: hasExplicitUpi ? upiParam : list[idx].doctorUpiId,
            merchantPayeeName: pnParam || list[idx].merchantPayeeName,
            merchantCode: mcParam || list[idx].merchantCode,
            updatedAt: new Date().toISOString(),
          };
          safeSetLocalStorage(PAYMENT_REQUESTS_KEY, list);
          window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
          return list[idx];
        }
      }
      return existing;
    }

    const docName = docParam || "Dr. Keerthi Sundar";
    const docSettings = this.findDoctorSettings(docName);
    const resolvedUpi = hasExplicitUpi
      ? upiParam
      : docSettings?.upiId && !isPlaceholderUpiId(docSettings.upiId)
      ? docSettings.upiId
      : "";
    const resolvedAmount = hasExplicitAmount ? parsedAmt : docSettings?.consultationFee || 800;
    const patName = patParam || "Valued Patient";
    const patPhone = phParam || "8317399068";

    const restoredReq: PaymentRequest = {
      paymentId: cleanId,
      sessionId: `SES-${cleanId}`,
      appointmentId: cleanId,
      doctorId: docSettings?.doctorId || docName.toLowerCase().replace(/[^a-z]/g, "-"),
      doctorName: docName,
      patientId: `VK-P${patPhone.replace(/[^0-9]/g, "").slice(-3) || "001"}`,
      patientName: patName,
      patientPhone: patPhone,
      amount: resolvedAmount,
      sessionType: typeParam || "Clinic Consultation",
      sessionDate: dateParam || new Date().toISOString().split("T")[0],
      doctorUpiId: resolvedUpi,
      merchantPayeeName: pnParam || docSettings?.payeeName || docName,
      merchantCode: mcParam || docSettings?.merchantCode,
      doctorUpiQrImage:
        docSettings?.upiQrImage && isUploadedCustomQr(docSettings.upiQrImage)
          ? docSettings.upiQrImage
          : undefined,
      paymentStatus: "Payment Requested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = this.getAllRequests();
    safeSetLocalStorage(PAYMENT_REQUESTS_KEY, [restoredReq, ...list]);
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return restoredReq;
  }

  createRequest(
    data: Omit<PaymentRequest, "paymentId" | "createdAt" | "updatedAt" | "paymentStatus"> & {
      initialStatus?: PaymentStatus;
    }
  ): PaymentRequest {
    const list = this.getAllRequests();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const paymentId = `VK-PAY-${new Date().getFullYear()}-${randomDigits}`;

    const cleanUpi = isPlaceholderUpiId(data.doctorUpiId) ? "" : data.doctorUpiId?.trim();
    const cleanQr = isUploadedCustomQr(data.doctorUpiQrImage) ? data.doctorUpiQrImage : undefined;

    const newReq: PaymentRequest = {
      ...data,
      doctorUpiId: cleanUpi,
      doctorUpiQrImage: cleanQr,
      paymentId,
      paymentStatus: data.initialStatus ?? "Payment Requested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updated = [newReq, ...list];
    if (!safeSetLocalStorage(PAYMENT_REQUESTS_KEY, updated)) {
      // If quota tight due to historical images, keep new request cleanly without heavy duplicate image
      const compactReq: PaymentRequest = { ...newReq, doctorUpiQrImage: undefined };
      updated = [compactReq, ...list];
      safeSetLocalStorage(PAYMENT_REQUESTS_KEY, updated);
    }
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return newReq;
  }

  updateRequestStatus(paymentId: string, status: PaymentStatus): PaymentRequest | null {
    const cleanId = paymentId.trim().toUpperCase();
    const list = this.getAllRequests();
    const idx = list.findIndex((r) => r.paymentId.toUpperCase() === cleanId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    };
    safeSetLocalStorage(PAYMENT_REQUESTS_KEY, list);
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
          if (clean.length !== parsed.length) {
            safeSetLocalStorage(PAYMENT_TRANSACTIONS_KEY, clean);
          }
          return clean;
        }
      }
    } catch {
      // ignore
    }
    safeSetLocalStorage(PAYMENT_TRANSACTIONS_KEY, []);
    return [];
  }

  getTransactionByPaymentId(paymentId: string): PaymentTransaction | null {
    const cleanId = paymentId.trim().toUpperCase();
    const txns = this.getAllTransactions();
    return txns.find((t) => t.paymentId.toUpperCase() === cleanId) ?? null;
  }

  submitPaymentProof(
    paymentId: string,
    upiReference: string,
    screenshot?: string,
    notes?: string
  ): { request: PaymentRequest | null; transaction: PaymentTransaction; storageError?: boolean } {
    const cleanId = paymentId.trim().toUpperCase();
    const txns = this.getAllTransactions();
    const existingIdx = txns.findIndex((t) => t.paymentId.toUpperCase() === cleanId);

    const transactionId = `TXN-${cleanId.replace("VK-PAY-", "")}-${Date.now().toString().slice(-4)}`;
    const newTxn: PaymentTransaction = {
      transactionId,
      paymentId: cleanId,
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

    let saved = safeSetLocalStorage(PAYMENT_TRANSACTIONS_KEY, txns);
    if (!saved && newTxn.screenshot) {
      // Fallback without image if browser storage is nearly full
      const noShotTxn: PaymentTransaction = { ...newTxn, screenshot: undefined };
      if (existingIdx >= 0) txns[existingIdx] = noShotTxn;
      else txns[0] = noShotTxn;
      saved = safeSetLocalStorage(PAYMENT_TRANSACTIONS_KEY, txns);
    }

    const req = this.updateRequestStatus(cleanId, "Payment Submitted");
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return { request: req, transaction: newTxn, storageError: !saved };
  }

  verifyPayment(
    paymentId: string,
    verifiedBy: string = "Admin",
    notes?: string
  ): { request: PaymentRequest | null; transaction: PaymentTransaction | null } {
    const cleanId = paymentId.trim().toUpperCase();
    const req = this.updateRequestStatus(cleanId, "Payment Verified");

    const txns = this.getAllTransactions();
    const idx = txns.findIndex((t) => t.paymentId.toUpperCase() === cleanId);
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
      safeSetLocalStorage(PAYMENT_TRANSACTIONS_KEY, txns);
    }
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return { request: req, transaction: txn };
  }

  rejectPayment(
    paymentId: string,
    rejectedBy: string = "Admin",
    reason: string = "Invalid UPI transaction reference"
  ): { request: PaymentRequest | null; transaction: PaymentTransaction | null } {
    const cleanId = paymentId.trim().toUpperCase();
    const req = this.updateRequestStatus(cleanId, "Payment Rejected");

    const txns = this.getAllTransactions();
    const idx = txns.findIndex((t) => t.paymentId.toUpperCase() === cleanId);
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
      safeSetLocalStorage(PAYMENT_TRANSACTIONS_KEY, txns);
    }
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));
    return { request: req, transaction: txn };
  }

  // ─── Payment URL Generator (Universal across devices) ───────────────────────
  getPaymentUrl(req: PaymentRequest): string {
    const origin = window.location.origin;
    const docSettings = this.findDoctorSettings(req.doctorId || req.doctorName);
    const upi =
      (req.doctorUpiId && !isPlaceholderUpiId(req.doctorUpiId) ? req.doctorUpiId : "") ||
      (docSettings?.upiId && !isPlaceholderUpiId(docSettings.upiId) ? docSettings.upiId : "");

    const params = new URLSearchParams({
      pay: req.paymentId,
      amt: String(req.amount),
      doc: req.doctorName,
      pat: req.patientName,
      ph: req.patientPhone,
      type: req.sessionType,
      date: req.sessionDate,
    });

    if (upi) params.set("upi", upi);
    if (req.merchantPayeeName || docSettings?.payeeName) {
      params.set("pn", (req.merchantPayeeName || docSettings?.payeeName || "").trim());
    }
    if (req.merchantCode || docSettings?.merchantCode) {
      params.set("mc", (req.merchantCode || docSettings?.merchantCode || "").trim());
    }

    return `${origin}/?${params.toString()}`;
  }

  // ─── WhatsApp Integration ───────────────────────────────────────────────────
  getWhatsAppPaymentUrl(req: PaymentRequest): string {
    const cleanPhone = req.patientPhone.replace(/[^0-9]/g, "");
    const paymentUrl = this.getPaymentUrl(req);
    const text =
      `🏥 *V-KARE Mind & Brain Clinic*\n\n` +
      `Dear *${req.patientName}*,\n` +
      `Your consultation session with *${req.doctorName}* has been completed.\n\n` +
      `• *Consultation Fee:* ₹${req.amount}\n` +
      `• *Session Type:* ${req.sessionType}\n` +
      `• *Payment ID:* ${req.paymentId}\n\n` +
      `💳 *Click the link below to pay ₹${req.amount} via PhonePe, Google Pay, Paytm or UPI QR:*\n` +
      `${paymentUrl}\n\n` +
      `Thank you for choosing V-KARE Clinic. Helpline: 8317399068.`;
    return `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(text)}`;
  }
}

export const paymentService = new PaymentService();
