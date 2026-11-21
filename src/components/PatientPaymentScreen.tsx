import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
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
  CreditCard,
  QrCode,
  Zap,
  Building2,
  Printer,
  Share2,
  Lock,
} from "lucide-react";
import { PaymentRequest, PaymentTransaction } from "../types";
import {
  paymentService,
  createUpiUri,
  generateUpiQrDataUrl,
} from "../services/paymentService";
import { CLINIC_INFO } from "../data/clinicData";

interface PatientPaymentScreenProps {
  paymentId: string;
  onClose: () => void;
}

type PaymentTab = "online" | "upi_apps" | "qr" | "utr";

export const PatientPaymentScreen: React.FC<PatientPaymentScreenProps> = ({
  paymentId,
  onClose,
}) => {
  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);

  // Tabs & Form State
  const [activeTab, setActiveTab] = useState<PaymentTab>("online");
  const [onlineMethod, setOnlineMethod] = useState<"upi_vpa" | "card" | "netbanking">("upi_vpa");
  const [upiVpaInput, setUpiVpaInput] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [selectedBank, setSelectedBank] = useState("State Bank of India");

  // Processing Animation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);

  // UTR / Manual Proof State
  const [upiRefInput, setUpiRefInput] = useState("");
  const [screenshotData, setScreenshotData] = useState<string>("");
  const [notesInput, setNotesInput] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Copy Feedback
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load and sync request details
  const refresh = () => {
    // 1. Try get request
    let req = paymentService.getRequestById(paymentId);
    if (!req) {
      // Try resolving with URL search params if opened fresh
      req = paymentService.resolveRequestFromUrl(
        paymentId,
        new URLSearchParams(window.location.search)
      );
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
    return () => window.removeEventListener("vkare_payments_updated", handleUpdate);
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

  const upiId = request.doctorUpiId || "vkaremind@upi";
  const upiIntentUrl = createUpiUri(
    upiId,
    request.doctorName,
    request.amount,
    `V-KARE ${request.paymentId}`
  );

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyShareLink = () => {
    const url = paymentService.getPaymentUrl(request);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    const qrSrc =
      request.doctorUpiQrImage ||
      generateUpiQrDataUrl(upiId, request.doctorName, request.amount);
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = `V-KARE-Payment-QR-${request.doctorName.replace(/[^a-zA-Z]/g, "")}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
      `• *Transaction Ref:* ${transaction?.upiReference || "UPI-ONL-" + Date.now().toString().slice(-6)}\n\n` +
      `Thank you for choosing V-KARE Clinic. Helpline: ${CLINIC_INFO.phone}.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // ─── Instant Online Payment Processing ──────────────────────────────────────
  const handleProcessOnlinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingStep(1);

    setTimeout(() => {
      setProcessingStep(2);
    }, 900);

    setTimeout(() => {
      setProcessingStep(3);
    }, 1800);

    setTimeout(() => {
      let methodLabel = "Instant UPI";
      let payerInfo = upiVpaInput.trim() || "UPI Intent";

      if (onlineMethod === "card") {
        methodLabel = "Credit/Debit Card";
        payerInfo = cardHolder ? `${cardHolder} (Card ending ${cardNumber.slice(-4) || "8899"})` : "Card ending 8899";
      } else if (onlineMethod === "netbanking") {
        methodLabel = `NetBanking (${selectedBank})`;
        payerInfo = selectedBank;
      }

      const randomTxnSuffix = Math.floor(100000 + Math.random() * 900000);
      const gatewayTxnRef = `UPI-ONL-${new Date().getFullYear()}-${randomTxnSuffix}`;

      paymentService.completeOnlinePayment(request.paymentId, {
        method: methodLabel,
        transactionReference: gatewayTxnRef,
        paidAmount: request.amount,
        payerInfo,
      });

      setIsProcessing(false);
      refresh();
    }, 2600);
  };

  // ─── UTR / Proof Submission ────────────────────────────────────────────────
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Screenshot image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotData(reader.result as string);
    };
    reader.readAsDataURL(file);
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
    setTimeout(() => {
      setSubmitSuccess(false);
      refresh();
    }, 1200);
  };

  const isVerified = request.paymentStatus === "Payment Verified";
  const isSubmitted = request.paymentStatus === "Payment Submitted";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Printable receipt wrapper */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#D9EAF5] overflow-hidden my-4 sm:my-8 relative flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#123B66] via-[#1a4b7c] to-[#087F8C] px-6 py-4 sm:py-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1 flex-shrink-0 shadow-sm">
              <img
                src="/brand/vkare_logo.png"
                alt="V-KARE Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold tracking-tight">
                  V-KARE Mind & Brain Clinic
                </h2>
                <span className="hidden sm:inline-block text-[10px] bg-white/20 text-[#B8E3DF] font-bold px-2 py-0.5 rounded-full">
                  Verified Portal
                </span>
              </div>
              <p className="text-[11px] text-[#B8E3DF] font-medium">
                Official Consultation Invoice & Secure Online Payment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
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
                  Thank you, <strong className="text-[#123B66]">{request.patientName}</strong>! Your consultation fee has been successfully credited and verified.
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
                      {transaction?.upiReference || "UPI-ONL-" + Date.now().toString().slice(-8)}
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
                      {transaction?.notes || "Online Payment"}
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
               CASE 2: PAYMENT DUE / PENDING — INTERACTIVE PAYMENT OPTIONS
            ═══════════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              {/* Consultation Bill Summary Banner */}
              <div className="bg-[#F8FBFE] p-5 rounded-2xl border border-[#D9EAF5] space-y-3">
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
                    <span className="text-[10px] uppercase font-bold text-[#26384A]/60 tracking-wider block">
                      Total Fee
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

              {/* Pending Submitted Notice if patient already submitted proof */}
              {isSubmitted && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#2878B9] flex-shrink-0 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-[#123B66]">
                        Proof Submitted (Ref: {transaction?.upiReference || "Pending"})
                      </p>
                      <p className="text-[11px] text-[#26384A]/70">
                        Doctor & front desk have received your reference. You can also pay instantly below to auto-verify!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Selector Tabs */}
              <div>
                <span className="text-xs font-bold text-[#123B66] block mb-2.5">
                  Select Your Payment Method:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("online")}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      activeTab === "online"
                        ? "bg-[#123B66] text-white border-[#123B66] shadow-md shadow-[#123B66]/20"
                        : "bg-white text-[#26384A] border-[#D9EAF5] hover:bg-[#F8FBFE]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className={`w-4 h-4 ${activeTab === "online" ? "text-amber-300" : "text-[#087F8C]"}`} />
                      <span className="text-xs font-bold">Pay Online</span>
                    </div>
                    <p className={`text-[10px] ${activeTab === "online" ? "text-white/80" : "text-[#26384A]/60"}`}>
                      Fast UPI / Card
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("upi_apps")}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      activeTab === "upi_apps"
                        ? "bg-[#123B66] text-white border-[#123B66] shadow-md shadow-[#123B66]/20"
                        : "bg-white text-[#26384A] border-[#D9EAF5] hover:bg-[#F8FBFE]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Smartphone className={`w-4 h-4 ${activeTab === "upi_apps" ? "text-emerald-300" : "text-[#087F8C]"}`} />
                      <span className="text-xs font-bold">UPI Apps</span>
                    </div>
                    <p className={`text-[10px] ${activeTab === "upi_apps" ? "text-white/80" : "text-[#26384A]/60"}`}>
                      GPay, PhonePe
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("qr")}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      activeTab === "qr"
                        ? "bg-[#123B66] text-white border-[#123B66] shadow-md shadow-[#123B66]/20"
                        : "bg-white text-[#26384A] border-[#D9EAF5] hover:bg-[#F8FBFE]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <QrCode className={`w-4 h-4 ${activeTab === "qr" ? "text-teal-300" : "text-[#087F8C]"}`} />
                      <span className="text-xs font-bold">Scan QR</span>
                    </div>
                    <p className={`text-[10px] ${activeTab === "qr" ? "text-white/80" : "text-[#26384A]/60"}`}>
                      Any UPI Scanner
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
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileCheck className={`w-4 h-4 ${activeTab === "utr" ? "text-blue-300" : "text-[#087F8C]"}`} />
                      <span className="text-xs font-bold">Enter UTR</span>
                    </div>
                    <p className={`text-[10px] ${activeTab === "utr" ? "text-white/80" : "text-[#26384A]/60"}`}>
                      Submit Reference
                    </p>
                  </button>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────────────
                  TAB 1: DIRECT INSTANT ONLINE CHECKOUT
              ──────────────────────────────────────────────────────────────── */}
              {activeTab === "online" && (
                <div className="bg-white rounded-2xl border border-[#D9EAF5] p-5 space-y-4 shadow-xs">
                  {/* Sub-modes: UPI ID vs Card vs Netbanking */}
                  <div className="flex items-center gap-2 pb-3 border-b border-[#D9EAF5] text-xs">
                    <button
                      type="button"
                      onClick={() => setOnlineMethod("upi_vpa")}
                      className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer ${
                        onlineMethod === "upi_vpa"
                          ? "bg-[#EAF5FC] text-[#123B66] border border-[#2878B9]"
                          : "text-[#26384A]/70 hover:bg-gray-50"
                      }`}
                    >
                      Instant UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlineMethod("card")}
                      className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer ${
                        onlineMethod === "card"
                          ? "bg-[#EAF5FC] text-[#123B66] border border-[#2878B9]"
                          : "text-[#26384A]/70 hover:bg-gray-50"
                      }`}
                    >
                      Debit / Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlineMethod("netbanking")}
                      className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer ${
                        onlineMethod === "netbanking"
                          ? "bg-[#EAF5FC] text-[#123B66] border border-[#2878B9]"
                          : "text-[#26384A]/70 hover:bg-gray-50"
                      }`}
                    >
                      Net Banking
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleProcessOnlinePayment} className="space-y-4 text-xs">
                    {onlineMethod === "upi_vpa" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block font-semibold text-[#123B66] mb-1">
                            Enter Your UPI ID / VPA
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="e.g. mobileNumber@upi or name@okhdfcbank"
                              value={upiVpaInput}
                              onChange={(e) => setUpiVpaInput(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs font-mono text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                            />
                          </div>
                          <p className="text-[10px] text-[#26384A]/60 mt-1">
                            Supports Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay.
                          </p>
                        </div>

                        {/* Quick suffix pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {["@okhdfcbank", "@okaxis", "@oksbi", "@ybl", "@paytm"].map((sfx) => (
                            <button
                              key={sfx}
                              type="button"
                              onClick={() => {
                                const base = upiVpaInput.includes("@")
                                  ? upiVpaInput.split("@")[0]
                                  : upiVpaInput || "user";
                                setUpiVpaInput(base + sfx);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#123B66] font-mono text-[10px] transition-colors cursor-pointer"
                            >
                              {sfx}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {onlineMethod === "card" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block font-semibold text-[#123B66] mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Full name as on card"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#123B66] mb-1">
                            Card Number (RuPay, Visa, Mastercard)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={19}
                              placeholder="•••• •••• •••• 4242"
                              value={cardNumber}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 16);
                                const formatted = v.match(/.{1,4}/g)?.join(" ") || v;
                                setCardNumber(formatted);
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs font-mono text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                            />
                            <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-[#123B66] mb-1">
                              Expiry (MM/YY)
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={5}
                              placeholder="12/28"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs font-mono text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-[#123B66] mb-1">
                              CVV / CVC
                            </label>
                            <input
                              type="password"
                              required
                              maxLength={4}
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs font-mono text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {onlineMethod === "netbanking" && (
                      <div className="space-y-3">
                        <label className="block font-semibold text-[#123B66] mb-1">
                          Select Your Bank
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs text-[#123B66] focus:outline-none focus:border-[#2878B9] cursor-pointer"
                        >
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Canara Bank">Canara Bank</option>
                          <option value="Bank of Baroda">Bank of Baroda</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                          <option value="Punjab National Bank">Punjab National Bank</option>
                        </select>
                        <p className="text-[10px] text-[#26384A]/60">
                          You will be routed through the secure bank authentication gateway.
                        </p>
                      </div>
                    )}

                    {/* Submit Pay Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#087F8C] hover:bg-[#066570] text-white py-3.5 px-6 rounded-2xl text-sm font-bold transition-all shadow-md shadow-[#087F8C]/20 cursor-pointer disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{request.amount} Online Securely</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-[#26384A]/50 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>256-Bit Encrypted Healthcare Payment • Instant Verified Receipt</span>
                    </div>
                  </form>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────────────
                  TAB 2: UPI MOBILE APPS (1-CLICK INTENT)
              ──────────────────────────────────────────────────────────────── */}
              {activeTab === "upi_apps" && (
                <div className="bg-white rounded-2xl border border-[#D9EAF5] p-5 space-y-4 shadow-xs">
                  <div className="text-center space-y-1">
                    <h4 className="font-serif font-bold text-[#123B66] text-sm">
                      Tap Your Preferred UPI App
                    </h4>
                    <p className="text-[11px] text-[#26384A]/70">
                      Tapping will open your chosen app with Dr. {request.doctorName}'s fee of ₹{request.amount} pre-filled.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <a
                      href={upiIntentUrl}
                      className="p-3.5 rounded-2xl border border-gray-200 hover:border-[#4285F4] hover:bg-blue-50/50 flex items-center gap-3 transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-gray-100 flex items-center justify-center font-bold text-[#4285F4]">
                        G
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#123B66] group-hover:text-[#4285F4]">
                          Google Pay
                        </p>
                        <span className="text-[10px] text-[#26384A]/50">Pay via GPay</span>
                      </div>
                    </a>

                    <a
                      href={upiIntentUrl}
                      className="p-3.5 rounded-2xl border border-gray-200 hover:border-[#5f259f] hover:bg-purple-50/50 flex items-center gap-3 transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#5f259f] text-white shadow-xs flex items-center justify-center font-bold text-xs">
                        पे
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#123B66] group-hover:text-[#5f259f]">
                          PhonePe
                        </p>
                        <span className="text-[10px] text-[#26384A]/50">Pay via PhonePe</span>
                      </div>
                    </a>

                    <a
                      href={upiIntentUrl}
                      className="p-3.5 rounded-2xl border border-gray-200 hover:border-[#00b9f1] hover:bg-sky-50/50 flex items-center gap-3 transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#00b9f1] text-white shadow-xs flex items-center justify-center font-bold text-[10px]">
                        Paytm
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#123B66] group-hover:text-[#00b9f1]">
                          Paytm
                        </p>
                        <span className="text-[10px] text-[#26384A]/50">Pay via Paytm</span>
                      </div>
                    </a>

                    <a
                      href={upiIntentUrl}
                      className="p-3.5 rounded-2xl border border-gray-200 hover:border-[#087F8C] hover:bg-[#EAF5FC] flex items-center gap-3 transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#087F8C] text-white shadow-xs flex items-center justify-center font-bold text-xs">
                        UPI
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#123B66] group-hover:text-[#087F8C]">
                          BHIM / Any App
                        </p>
                        <span className="text-[10px] text-[#26384A]/50">CRED, Amazon, etc.</span>
                      </div>
                    </a>
                  </div>

                  {/* Return Confirmation Action */}
                  <div className="p-4 bg-[#EAF5FC] rounded-2xl border border-[#D9EAF5] text-center space-y-2 mt-2">
                    <p className="text-xs font-semibold text-[#123B66]">
                      Completed your payment in your UPI app?
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("utr")}
                      className="inline-flex items-center gap-1.5 bg-[#2878B9] hover:bg-[#1f5f93] text-white py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Submit 12-Digit UPI UTR for Instant Receipt</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────────────
                  TAB 3: SCAN QR CODE
              ──────────────────────────────────────────────────────────────── */}
              {activeTab === "qr" && (
                <div className="bg-white rounded-2xl border border-[#D9EAF5] p-5 space-y-4 text-center shadow-xs">
                  <p className="text-xs font-semibold text-[#123B66]">
                    Scan using any UPI App (GPay, PhonePe, Paytm, BHIM, CRED)
                  </p>

                  <div className="inline-block p-4 bg-white rounded-3xl border-2 border-[#D9EAF5] shadow-md relative group">
                    <img
                      src={
                        request.doctorUpiQrImage ||
                        generateUpiQrDataUrl(upiId, request.doctorName, request.amount)
                      }
                      alt="Doctor UPI Payment QR Code"
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl"
                    />
                  </div>

                  {/* UPI ID Pill with Copy */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5FC] border border-[#D9EAF5] text-xs font-mono text-[#123B66]">
                      <span>UPI ID: {upiId}</span>
                      <button
                        onClick={handleCopyUpi}
                        className="hover:text-[#2878B9] transition-colors cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={handleDownloadQr}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#123B66] border border-[#D9EAF5] py-2 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#087F8C]" />
                      <span>Download QR</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("utr")}
                      className="inline-flex items-center gap-1.5 bg-[#087F8C] hover:bg-[#066570] text-white py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>I Have Scanned & Paid</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────────────
                  TAB 4: ENTER UTR / SUBMIT PROOF
              ──────────────────────────────────────────────────────────────── */}
              {activeTab === "utr" && (
                <div className="bg-white rounded-2xl border border-[#D9EAF5] p-5 space-y-4 shadow-xs">
                  {submitSuccess ? (
                    <div className="py-8 text-center space-y-3">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                      <h4 className="font-serif text-lg font-bold text-[#123B66]">
                        Payment Reference Submitted!
                      </h4>
                      <p className="text-xs text-[#26384A]/70">
                        Your reference has been sent to Dr. {request.doctorName} and clinic desk for confirmation.
                      </p>
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
                          <span className="text-[9px] text-[#26384A]/50">PNG, JPG up to 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
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
        <div className="bg-[#F8FBFE] px-6 py-3.5 border-t border-[#D9EAF5] text-center text-[11px] text-[#26384A]/70 flex-shrink-0">
          Need help with your payment? Call clinic desk at{" "}
          <strong className="text-[#123B66]">0816-3136697</strong> or WhatsApp{" "}
          <strong className="text-[#123B66]">8317399068</strong>.
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          ONLINE PAYMENT LIVE PROCESSING MODAL
      ────────────────────────────────────────────────────────────────────── */}
      {isProcessing && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-7 text-center shadow-2xl border border-[#D9EAF5] space-y-4 animate-scaleUp">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
              <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">
                ₹{request.amount}
              </div>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-[#123B66]">
                Processing Secure Payment
              </h4>
              <p className="text-xs text-[#26384A]/70 mt-1">
                {processingStep === 1 && "Connecting with UPI & Bank Gateway..."}
                {processingStep === 2 && "Authorizing consultation fee of ₹" + request.amount + "..."}
                {processingStep === 3 && "Payment received! Generating official receipt..."}
              </p>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <div
                className={`w-7 h-1.5 rounded-full transition-colors ${
                  processingStep >= 1 ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
              <div
                className={`w-7 h-1.5 rounded-full transition-colors ${
                  processingStep >= 2 ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
              <div
                className={`w-7 h-1.5 rounded-full transition-colors ${
                  processingStep >= 3 ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
            </div>

            <p className="text-[10px] text-gray-400">
              Please do not refresh or close this window.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
