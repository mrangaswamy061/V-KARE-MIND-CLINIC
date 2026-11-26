import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  Upload,
  AlertCircle,
  FileCheck,
  X,
  Smartphone,
  Copy,
  Check,
  QrCode,
  Printer,
  Share2,
  Lock,
  MessageSquare,
} from "lucide-react";
import { PaymentRequest, PaymentTransaction } from "../types";
import {
  paymentService,
  createUpiAppUris,
  generateUpiQrDataUrl,
  isPlaceholderUpiId,
  isUploadedCustomQr,
} from "../services/paymentService";
import { compressImageFile, exportQrAsPngDataUrl } from "../utils/qrUtils";
import { CLINIC_INFO } from "../data/clinicData";

interface PatientPaymentScreenProps {
  paymentId: string;
  onClose: () => void;
}

type PaymentTab = "pay" | "utr";

export const PatientPaymentScreen: React.FC<PatientPaymentScreenProps> = ({
  paymentId,
  onClose,
}) => {
  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);

  // Tabs & QR Display State
  const [activeTab, setActiveTab] = useState<PaymentTab>("pay");
  const [qrMode, setQrMode] = useState<"fixed" | "uploaded">("fixed");

  // UTR / Manual Proof State
  const [upiRefInput, setUpiRefInput] = useState("");
  const [screenshotData, setScreenshotData] = useState<string>("");
  const [notesInput, setNotesInput] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Copy & Feedback
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const [desktopAppHint, setDesktopAppHint] = useState(false);

  const loadMergedUrlParams = () => {
    const merged = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    if (hash.includes("?")) {
      const hashParams = new URLSearchParams(hash.substring(hash.indexOf("?") + 1));
      hashParams.forEach((v, k) => {
        if (!merged.has(k)) merged.set(k, v);
      });
    }
    return merged;
  };

  // Load and sync request details
  const refresh = () => {
    let req = paymentService.getRequestById(paymentId);
    if (!req) {
      req = paymentService.resolveRequestFromUrl(paymentId, loadMergedUrlParams());
    }
    setRequest(req);
    if (req) {
      const txn = paymentService.getTransactionByPaymentId(req.paymentId);
      setTransaction(txn);
    }
  };

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener("vkare_payments_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("vkare_payments_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [paymentId]);

  if (!request) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-[#D9EAF5]">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold text-[#123B66] mb-2">
            Payment Request Not Found
          </h3>
          <p className="text-xs text-[#26384A]/70 mb-6">
            The requested payment reference <span className="font-mono font-bold">{paymentId}</span> could not be located or has expired.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-[#2878B9] hover:bg-[#1f5f93] text-white py-3 rounded-full text-sm font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const docSettings = paymentService.findDoctorSettings(request.doctorId || request.doctorName);
  const effectiveUpiId = !isPlaceholderUpiId(request.doctorUpiId)
    ? request.doctorUpiId!.trim()
    : !isPlaceholderUpiId(docSettings?.upiId)
    ? docSettings!.upiId!.trim()
    : "";

  const uploadedQrSrc = isUploadedCustomQr(docSettings?.upiQrImage)
    ? docSettings!.upiQrImage!
    : isUploadedCustomQr(request.doctorUpiQrImage)
    ? request.doctorUpiQrImage!
    : "";

  const payeeName = request.merchantPayeeName || docSettings?.payeeName || request.doctorName;
  const merchantCode = request.merchantCode || docSettings?.merchantCode;
  const fixedAmountText = Number(request.amount).toFixed(2);

  const upiLinks = effectiveUpiId
    ? createUpiAppUris(effectiveUpiId, payeeName, request.amount, `V KARE ${request.paymentId}`, {
        transactionRef: request.paymentId,
        merchantCode,
        lockAmount: true,
      })
    : null;

  const fixedAmountQrSrc = effectiveUpiId
    ? generateUpiQrDataUrl(effectiveUpiId, payeeName, request.amount, `V KARE ${request.paymentId}`, {
        transactionRef: request.paymentId,
        merchantCode,
        lockAmount: true,
      })
    : "";

  const hasBothQrModes = Boolean(fixedAmountQrSrc && uploadedQrSrc);
  const activeQrSrc =
    hasBothQrModes
      ? qrMode === "uploaded"
        ? uploadedQrSrc
        : fixedAmountQrSrc
      : fixedAmountQrSrc || uploadedQrSrc;

  const isMobileDevice =
    typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isIosDevice =
    typeof navigator !== "undefined" && /iPad|iPhone|iPod/i.test(navigator.userAgent);

  const safeCopy = async (text: string, onDone: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    onDone(true);
    setTimeout(() => onDone(false), 2500);
  };

  const handleCopyUpi = () => {
    if (!effectiveUpiId) return;
    void safeCopy(effectiveUpiId, setCopiedUpi);
  };

  const handleCopyAmount = () => {
    void safeCopy(fixedAmountText, setCopiedAmount);
  };

  const handleCopyShareLink = () => {
    const url = paymentService.getPaymentUrl(request);
    void safeCopy(url, setCopiedLink);
  };

  const handleDownloadQr = async () => {
    if (!activeQrSrc) return;
    try {
      const pngDataUrl = await exportQrAsPngDataUrl(activeQrSrc, 800);
      const a = document.createElement("a");
      a.href = pngDataUrl;
      a.download = `V-KARE-Payment-QR-${request.paymentId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setQrDownloaded(true);
      setTimeout(() => setQrDownloaded(false), 2500);
    } catch {
      const a = document.createElement("a");
      a.href = activeQrSrc;
      a.download = `V-KARE-Payment-QR-${request.paymentId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setQrDownloaded(true);
      setTimeout(() => setQrDownloaded(false), 2500);
    }
  };

  const handleUpiAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isMobileDevice) {
      e.preventDefault();
      setDesktopAppHint(true);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleShareWhatsAppReceipt = () => {
    const text =
      `🏥 *V-KARE Mind & Brain Clinic - Payment Receipt*\n\n` +
      `• *Receipt No:* REC-${request.paymentId.replace("VK-PAY-", "")}\n` +
      `• *Patient Name:* ${request.patientName}\n` +
      `• *Doctor:* ${request.doctorName}\n` +
      `• *Session Type:* ${request.sessionType}\n` +
      `• *Amount Paid:* ₹${request.amount}.00\n` +
      `• *Status:* ✅ Confirmed & Verified\n` +
      `• *Transaction Ref:* ${transaction?.upiReference || "Verified by Clinic"}\n\n` +
      `Thank you for choosing V-KARE Clinic. Helpline: ${CLINIC_INFO.phone}.`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const getWhatsAppProofToClinicUrl = (utr: string) => {
    const phone = (CLINIC_INFO.appointmentAlertPhone || CLINIC_INFO.phone || "8317399068").replace(
      /[^0-9]/g,
      ""
    );
    const text =
      `✅ *V-KARE CONSULTATION PAYMENT PROOF*\n\n` +
      `• *Payment ID:* ${request.paymentId}\n` +
      `• *Patient:* ${request.patientName} (${request.patientPhone})\n` +
      `• *Doctor:* ${request.doctorName}\n` +
      `• *Amount Paid:* ₹${request.amount}\n` +
      `• *UPI UTR / Ref:* ${utr}\n` +
      (notesInput.trim() ? `• *Notes:* ${notesInput.trim()}\n` : "") +
      `\nPlease verify and confirm my consultation payment.`;
    return `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(text)}`;
  };

  // ─── UTR / Proof Submission ────────────────────────────────────────────────
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setSubmitError("Screenshot image must be under 8MB");
      return;
    }
    try {
      const compressed = await compressImageFile(file, 720, 0.8);
      setScreenshotData(compressed);
      setSubmitError("");
    } catch {
      setSubmitError("Could not read screenshot image. Please try a PNG or JPG.");
    }
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const cleanRef = upiRefInput.trim();
    if (!cleanRef) {
      setSubmitError("Please enter your 12-digit UPI reference / UTR number");
      return;
    }
    if (cleanRef.length < 6) {
      setSubmitError("Please enter a valid UPI transaction reference number");
      return;
    }

    paymentService.submitPaymentProof(request.paymentId, cleanRef, screenshotData, notesInput);
    setSubmitSuccess(true);
    refresh();
  };

  const isVerified = request.paymentStatus === "Payment Verified";
  const isSubmitted = request.paymentStatus === "Payment Submitted";
  const activeUtr = transaction?.upiReference || upiRefInput.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Printable receipt wrapper */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#D9EAF5] overflow-hidden my-4 sm:my-8 relative flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#123B66] via-[#1a4b7c] to-[#087F8C] px-4 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-xl min-w-0"
            title="Return to V-KARE Home"
          >
            <div className="w-10 h-10 rounded-full bg-white p-1 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
              <img
                src="/brand/vkare_logo.png"
                alt="V-KARE Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base sm:text-lg font-bold tracking-tight truncate">
                  V-KARE Mind & Brain Clinic
                </h2>
                <span className="hidden sm:inline-block text-[10px] bg-white/20 text-[#B8E3DF] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  Verified Portal
                </span>
              </div>
              <p className="text-[11px] text-[#B8E3DF] font-medium truncate">
                Official Consultation Invoice & Secure UPI Payment
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment portal"
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5">
          {/* ═══════════════════════════════════════════════════════════════════
              CASE 1: PAYMENT VERIFIED & PAID (OFFICIAL CLINICAL RECEIPT)
          ═══════════════════════════════════════════════════════════════════ */}
          {isVerified ? (
            <div className="space-y-6" id="printable-receipt">
              {/* Official Receipt Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-500/40 rounded-3xl p-6 text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
                  Payment Confirmed & Verified
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#123B66]">
                  Consultation Fee Received
                </h3>
                <p className="text-xs text-[#26384A]/75 max-w-md mx-auto mt-1">
                  Thank you, <strong className="text-[#123B66]">{request.patientName}</strong>! Your consultation fee has been verified by the clinic desk.
                </p>
              </div>

              {/* Receipt Bill Card */}
              <div className="bg-[#F8FBFE] rounded-2xl border border-[#D9EAF5] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#D9EAF5]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#087F8C] tracking-wider block">
                      Official Receipt No.
                    </span>
                    <span className="font-mono text-xs font-bold text-[#123B66]">
                      REC-{request.paymentId.replace("VK-PAY-", "")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#26384A]/60 tracking-wider block">
                      Payment ID
                    </span>
                    <span className="font-mono text-xs font-bold text-[#2878B9]">
                      {request.paymentId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#26384A]/60 block">
                      Patient Name
                    </span>
                    <p className="font-bold text-[#123B66]">{request.patientName}</p>
                    <span className="text-[10px] text-[#26384A]/60">{request.patientPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#26384A]/60 block">
                      Consulting Doctor
                    </span>
                    <p className="font-bold text-[#123B66]">{request.doctorName}</p>
                    <span className="text-[10px] text-[#087F8C] font-medium">Specialist</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#26384A]/60 block">
                      Session Type
                    </span>
                    <p className="font-semibold text-[#123B66]">{request.sessionType}</p>
                    <span className="text-[10px] text-[#26384A]/60">{request.sessionDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#26384A]/60 block">
                      Transaction Ref / UTR
                    </span>
                    <p className="font-mono font-bold text-emerald-800 break-all text-[11px]">
                      {transaction?.upiReference || "Verified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#26384A]/60 block">
                      Verified By
                    </span>
                    <p className="font-semibold text-[#123B66]">
                      {transaction?.verifiedBy || "Clinic Verification"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#26384A]/60 block">
                      Payment Mode
                    </span>
                    <p className="font-semibold text-[#123B66]">
                      {transaction?.notes || "UPI Payment"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D9EAF5] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#123B66]">Total Amount Paid</span>
                  <span className="font-serif text-2xl font-bold text-emerald-700">
                    ₹{request.amount}.00
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 bg-[#123B66] hover:bg-[#0c2847] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={handleShareWhatsAppReceipt}
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb355] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp Receipt</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-[#123B66] border border-[#D9EAF5] py-3 px-5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Close & Back to Home
                </button>
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════════════
               CASE 2: PAYMENT DUE / PENDING — REAL UPI QR, GPAY / PHONEPE & UTR
            ═══════════════════════════════════════════════════════════════════ */
            <div className="space-y-5">
              {/* Consultation Bill Summary Banner */}
              <div className="bg-[#F8FBFE] p-4 sm:p-5 rounded-2xl border border-[#D9EAF5] space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#D9EAF5]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#087F8C] tracking-wider block">
                      Consulting Specialist
                    </span>
                    <p className="font-serif text-base font-bold text-[#123B66]">
                      {request.doctorName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#26384A]/60 tracking-wider flex items-center justify-end gap-1">
                      <Lock className="w-3 h-3 text-[#087F8C]" />
                      Fixed Fee
                    </span>
                    <p className="font-serif text-2xl font-bold text-[#2878B9]">
                      ₹{request.amount}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-[#26384A]/80 pt-1">
                  <div>
                    <span className="text-[#26384A]/50 block text-[10px] uppercase font-semibold">
                      Patient
                    </span>
                    <p className="font-medium text-[#123B66] truncate">{request.patientName}</p>
                  </div>
                  <div>
                    <span className="text-[#26384A]/50 block text-[10px] uppercase font-semibold">
                      Session
                    </span>
                    <p className="font-medium text-[#123B66] truncate">{request.sessionType}</p>
                  </div>
                  <div>
                    <span className="text-[#26384A]/50 block text-[10px] uppercase font-semibold">
                      Date
                    </span>
                    <p className="font-medium text-[#123B66]">{request.sessionDate}</p>
                  </div>
                  <div>
                    <span className="text-[#26384A]/50 block text-[10px] uppercase font-semibold">
                      Status
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSubmitted
                          ? "bg-blue-100 text-[#123B66] border border-blue-200"
                          : "bg-amber-100 text-amber-900 border border-amber-200"
                      }`}
                    >
                      {request.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submitted Proof Banner */}
              {(isSubmitted || submitSuccess) && activeUtr && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#2878B9] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#123B66]">
                        UTR Submitted: <span className="font-mono">{activeUtr}</span>
                      </p>
                      <p className="text-[11px] text-[#26384A]/75">
                        If you paid from your mobile phone, also share this confirmation to the clinic WhatsApp desk for instant approval.
                      </p>
                    </div>
                  </div>
                  <a
                    href={getWhatsAppProofToClinicUrl(activeUtr)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1fb355] text-white py-2 px-3.5 rounded-xl text-[11px] font-bold flex-shrink-0 shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Proof on WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Primary 2-Tab Navigation */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("pay")}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    activeTab === "pay"
                      ? "bg-[#123B66] text-white border-[#123B66] shadow-md shadow-[#123B66]/20"
                      : "bg-white text-[#26384A] border-[#D9EAF5] hover:bg-[#F8FBFE]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <QrCode className={`w-4 h-4 ${activeTab === "pay" ? "text-[#B8E3DF]" : "text-[#087F8C]"}`} />
                    <span className="text-xs font-bold">Scan QR / PhonePe / GPay</span>
                  </div>
                  <p className={`text-[10px] ${activeTab === "pay" ? "text-white/80" : "text-[#26384A]/60"}`}>
                    Pay ₹{request.amount} via UPI App or QR
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("utr")}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    activeTab === "utr"
                      ? "bg-[#123B66] text-white border-[#123B66] shadow-md shadow-[#123B66]/20"
                      : "bg-white text-[#26384A] border-[#D9EAF5] hover:bg-[#F8FBFE]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <FileCheck className={`w-4 h-4 ${activeTab === "utr" ? "text-[#B8E3DF]" : "text-[#087F8C]"}`} />
                    <span className="text-xs font-bold">Submit UTR / Screenshot</span>
                  </div>
                  <p className={`text-[10px] ${activeTab === "utr" ? "text-white/80" : "text-[#26384A]/60"}`}>
                    Confirm payment after paying
                  </p>
                </button>
              </div>

              {/* ────────────────────────────────────────────────────────────────
                  TAB 1: REAL SCANNABLE QR + PHONEPE / GPAY / PAYTM
              ──────────────────────────────────────────────────────────────── */}
              {activeTab === "pay" && (
                <div className="space-y-4">
                  {/* QR Card */}
                  {activeQrSrc ? (
                    <div className="bg-white rounded-2xl border border-[#D9EAF5] p-5 space-y-4 text-center shadow-xs">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#123B66]">
                          Scan Using PhonePe, Google Pay, Paytm or Any UPI App
                        </p>
                        {effectiveUpiId && (!hasBothQrModes || qrMode === "fixed") ? (
                          <p className="text-[11px] text-[#087F8C] font-semibold">
                            Amount ₹{fixedAmountText} is locked automatically in this QR
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-800 font-semibold">
                            Doctor's Uploaded QR • Please enter exact fee ₹{fixedAmountText} after scanning
                          </p>
                        )}
                      </div>

                      {hasBothQrModes && (
                        <div className="inline-flex p-1 rounded-xl bg-[#EAF5FC] border border-[#D9EAF5] text-[11px] font-semibold">
                          <button
                            type="button"
                            onClick={() => setQrMode("fixed")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              qrMode === "fixed"
                                ? "bg-[#123B66] text-white shadow-xs"
                                : "text-[#123B66]/70 hover:text-[#123B66]"
                            }`}
                          >
                            Fixed ₹{request.amount} QR
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrMode("uploaded")}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              qrMode === "uploaded"
                                ? "bg-[#123B66] text-white shadow-xs"
                                : "text-[#123B66]/70 hover:text-[#123B66]"
                            }`}
                          >
                            Doctor's Uploaded QR
                          </button>
                        </div>
                      )}

                      <div className="flex justify-center">
                        <div className="inline-block p-3.5 bg-white rounded-2xl border-2 border-[#D9EAF5] shadow-md">
                          <img
                            src={activeQrSrc}
                            alt={`UPI QR Code for ${request.doctorName}`}
                            className="w-56 h-56 sm:w-60 sm:h-60 object-contain mx-auto rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Copyable UPI ID & Fixed Fee */}
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {effectiveUpiId && (
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5FC] hover:bg-[#D9EAF5] border border-[#D9EAF5] text-xs font-mono text-[#123B66] cursor-pointer transition-colors"
                            title="Copy UPI ID"
                          >
                            <span>UPI: {effectiveUpiId}</span>
                            {copiedUpi ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[#2878B9]" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleCopyAmount}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 cursor-pointer transition-colors"
                          title="Copy Exact Amount"
                        >
                          <span>₹{fixedAmountText}</span>
                          {copiedAmount ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => void handleDownloadQr()}
                          className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#123B66] border border-[#D9EAF5] py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          {qrDownloaded ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-[#087F8C]" />
                          )}
                          <span>{qrDownloaded ? "Saved PNG!" : "Download QR (PNG)"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("utr")}
                          className="inline-flex items-center gap-1.5 bg-[#087F8C] hover:bg-[#066570] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>I Have Paid • Enter UTR</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 text-center space-y-3">
                      <AlertCircle className="w-9 h-9 text-amber-600 mx-auto" />
                      <h4 className="font-serif font-bold text-sm text-[#123B66]">
                        Clinic UPI QR Not Configured Yet
                      </h4>
                      <p className="text-xs text-[#26384A]/80 max-w-md mx-auto leading-relaxed">
                        The doctor has not linked a verified UPI ID or uploaded a QR code yet for this link. Please message reception on WhatsApp or call{" "}
                        <a href={`tel:+91${CLINIC_INFO.phone}`} className="font-bold underline text-[#123B66]">
                          +91 {CLINIC_INFO.phone}
                        </a>{" "}
                        to receive the active payment QR.
                      </p>
                      <a
                        href={CLINIC_INFO.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb355] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Request QR on WhatsApp</span>
                      </a>
                    </div>
                  )}

                  {/* Direct PhonePe / GPay / Paytm Mobile App Buttons */}
                  {upiLinks && (
                    <div className="bg-white rounded-2xl border border-[#D9EAF5] p-4 sm:p-5 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="font-serif font-bold text-[#123B66] text-sm">
                            Pay Directly in Mobile UPI App
                          </h4>
                          <p className="text-[11px] text-[#26384A]/70">
                            Opens your installed UPI app with fixed fee ₹{fixedAmountText} pre-filled.
                          </p>
                        </div>
                        <Smartphone className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <a
                          href={isIosDevice ? upiLinks.gpayIos : upiLinks.standard}
                          onClick={handleUpiAppClick}
                          className="p-3 rounded-2xl border border-gray-200 hover:border-[#4285F4] hover:bg-blue-50/50 flex items-center gap-2.5 transition-all cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-gray-100 flex items-center justify-center font-bold text-[#4285F4] flex-shrink-0">
                            G
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-[#123B66] group-hover:text-[#4285F4] truncate">
                              Google Pay
                            </p>
                            <span className="text-[10px] text-[#26384A]/50 block truncate">GPay App</span>
                          </div>
                        </a>

                        <a
                          href={isIosDevice ? upiLinks.phonepeIos : upiLinks.standard}
                          onClick={handleUpiAppClick}
                          className="p-3 rounded-2xl border border-gray-200 hover:border-[#5f259f] hover:bg-purple-50/50 flex items-center gap-2.5 transition-all cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#5f259f] text-white shadow-xs flex items-center justify-center font-bold text-xs flex-shrink-0">
                            पे
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-[#123B66] group-hover:text-[#5f259f] truncate">
                              PhonePe
                            </p>
                            <span className="text-[10px] text-[#26384A]/50 block truncate">PhonePe App</span>
                          </div>
                        </a>

                        <a
                          href={isIosDevice ? upiLinks.paytmIos : upiLinks.standard}
                          onClick={handleUpiAppClick}
                          className="p-3 rounded-2xl border border-gray-200 hover:border-[#00b9f1] hover:bg-sky-50/50 flex items-center gap-2.5 transition-all cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#00b9f1] text-white shadow-xs flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            Paytm
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-[#123B66] group-hover:text-[#00b9f1] truncate">
                              Paytm
                            </p>
                            <span className="text-[10px] text-[#26384A]/50 block truncate">Paytm App</span>
                          </div>
                        </a>

                        <a
                          href={upiLinks.standard}
                          onClick={handleUpiAppClick}
                          className="p-3 rounded-2xl border border-gray-200 hover:border-[#087F8C] hover:bg-[#EAF5FC] flex items-center gap-2.5 transition-all cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#087F8C] text-white shadow-xs flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            UPI
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-[#123B66] group-hover:text-[#087F8C] truncate">
                              BHIM / Any
                            </p>
                            <span className="text-[10px] text-[#26384A]/50 block truncate">UPI Chooser</span>
                          </div>
                        </a>
                      </div>

                      {desktopAppHint && (
                        <div className="p-2.5 rounded-xl bg-[#EAF5FC] border border-[#D9EAF5] text-[11px] text-[#123B66]">
                          UPI app links launch PhonePe or Google Pay directly on mobile phones. On desktop, scan the QR code above with your phone camera.
                        </div>
                      )}

                      <p className="text-[10px] text-[#26384A]/65 leading-relaxed bg-[#F8FBFE] p-2.5 rounded-xl border border-[#D9EAF5]">
                        <strong>Paying on your phone?</strong> If PhonePe or Google Pay blocks a direct browser payment link due to bank security limits, tap <strong>Download QR (PNG)</strong> above, open PhonePe/GPay → <strong>Scan QR</strong> → <strong>Upload from Gallery</strong>, or pay directly to UPI ID <span className="font-mono font-bold text-[#123B66]">{effectiveUpiId}</span>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────────────────────────
                  TAB 2: ENTER UTR / SUBMIT PROOF
              ──────────────────────────────────────────────────────────────── */}
              {activeTab === "utr" && (
                <div className="bg-white rounded-2xl border border-[#D9EAF5] p-5 space-y-4 shadow-xs">
                  {submitSuccess ? (
                    <div className="py-6 text-center space-y-3">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                      <h4 className="font-serif text-lg font-bold text-[#123B66]">
                        Payment Proof Recorded!
                      </h4>
                      <p className="text-xs text-[#26384A]/75 max-w-md mx-auto">
                        Reference <span className="font-mono font-bold text-[#123B66]">{activeUtr}</span> for ₹{request.amount} has been saved. Please tap below to forward confirmation to clinic reception on WhatsApp so staff on another device can verify immediately.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                        <a
                          href={getWhatsAppProofToClinicUrl(activeUtr)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb355] text-white py-2.5 px-5 rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Send Confirmation on WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setSubmitSuccess(false)}
                          className="py-2.5 px-4 rounded-xl border border-[#D9EAF5] text-xs font-semibold text-[#123B66] hover:bg-[#F8FBFE] cursor-pointer"
                        >
                          Edit Reference
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
                      {submitError && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                          {submitError}
                        </div>
                      )}

                      <div>
                        <label className="block font-semibold text-[#123B66] mb-1">
                          UPI Transaction ID / 12-Digit UTR Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 416528991204"
                          value={upiRefInput}
                          onChange={(e) => setUpiRefInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs font-mono text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                        />
                        <p className="text-[10px] text-[#26384A]/50 mt-1">
                          Found in your GPay / PhonePe / Paytm receipt as "UPI Ref No" or "UTR".
                        </p>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#123B66] mb-1">
                          Upload Payment Screenshot <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#D9EAF5] rounded-xl cursor-pointer hover:bg-[#EAF5FC] transition-colors">
                          <Upload className="w-6 h-6 text-[#2878B9] mb-1" />
                          <span className="text-[11px] font-medium text-[#123B66]">
                            Click to upload screenshot
                          </span>
                          <span className="text-[9px] text-[#26384A]/50">PNG, JPG up to 8MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => void handleScreenshotUpload(e)}
                            className="hidden"
                          />
                        </label>
                        {screenshotData && (
                          <div className="mt-2 p-2 bg-[#E9F6F3] rounded-lg flex items-center justify-between text-[11px] text-[#087F8C]">
                            <span>Screenshot attached successfully</span>
                            <button
                              type="button"
                              onClick={() => setScreenshotData("")}
                              className="text-red-500 hover:text-red-700 text-[10px] font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold text-[#123B66] mb-1">
                          Additional Notes <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Paid via PhonePe from account holder Ramesh"
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl bg-[#087F8C] hover:bg-[#066570] text-white font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Submit Payment Proof
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Bottom Quick Actions: Copy Link & Help */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1.5 text-[#2878B9] hover:underline cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "Payment Link Copied!" : "Copy Payment Link"}</span>
                </button>

                <div className="text-[11px] text-[#26384A]/60">
                  Ref: <span className="font-mono font-bold text-[#123B66]">{request.paymentId}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Support Info */}
        <div className="bg-[#F8FBFE] px-4 sm:px-6 py-3.5 border-t border-[#D9EAF5] text-center text-[11px] text-[#26384A]/70 flex-shrink-0 leading-relaxed">
          Need help with your payment? Call clinic desk at{" "}
          <a href={`tel:${CLINIC_INFO.landline}`} className="font-bold text-[#123B66] underline">
            {CLINIC_INFO.landline}
          </a>{" "}
          or WhatsApp{" "}
          <a
            href={CLINIC_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#123B66] underline"
          >
            {CLINIC_INFO.phone}
          </a>
          {" • "}
          <a href={`mailto:${CLINIC_INFO.email}`} className="font-semibold text-[#087F8C] underline">
            {CLINIC_INFO.email}
          </a>
        </div>
      </div>
    </div>
  );
};
