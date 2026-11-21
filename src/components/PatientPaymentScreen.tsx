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
} from "lucide-react";
import { PaymentRequest, PaymentTransaction } from "../types";
import { paymentService, createUpiUri, generateUpiQrDataUrl } from "../services/paymentService";

interface PatientPaymentScreenProps {
  paymentId: string;
  onClose: () => void;
}

export const PatientPaymentScreen: React.FC<PatientPaymentScreenProps> = ({
  paymentId,
  onClose,
}) => {
  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [upiRefInput, setUpiRefInput] = useState("");
  const [screenshotData, setScreenshotData] = useState<string>("");
  const [notesInput, setNotesInput] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Load request details
  const refresh = () => {
    const req = paymentService.getRequestById(paymentId);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-[#D9EAF5]">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold text-[#123B66] mb-2">Payment Request Not Found</h3>
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
  const upiIntentUrl = createUpiUri(upiId, request.doctorName, request.amount, `V-KARE ${request.paymentId}`);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

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
      setShowSubmitModal(false);
      setSubmitSuccess(false);
      refresh();
    }, 1200);
  };

  const handleDownloadQr = () => {
    if (!request.doctorUpiQrImage) return;
    const a = document.createElement("a");
    a.href = request.doctorUpiQrImage;
    a.download = `V-KARE-Payment-QR-${request.doctorName.replace(/[^a-zA-Z]/g, "")}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#D9EAF5] overflow-hidden my-8 animate-fadeIn">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#123B66] to-[#087F8C] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1 flex-shrink-0 shadow-sm">
              <img
                src="/brand/vkare_logo.png"
                alt="V-KARE"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold tracking-tight">V-KARE Mind & Brain Clinic</h2>
              <p className="text-[11px] text-[#B8E3DF] font-medium">Official Consultation Payment Portal</p>
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

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status Alert Banner */}
          {request.paymentStatus === "Payment Verified" ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Payment Confirmed & Verified</p>
                <p className="text-xs text-emerald-700">
                  Thank you! Your consultation payment of ₹{request.amount} has been verified by the clinic.
                </p>
              </div>
            </div>
          ) : request.paymentStatus === "Payment Submitted" ? (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#2878B9] flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-[#123B66]">Payment Submitted — Verification Pending</p>
                <p className="text-xs text-[#26384A]/75">
                  Your reference <span className="font-mono font-bold">{transaction?.upiReference}</span> has been received. Our team will verify and confirm shortly.
                </p>
              </div>
            </div>
          ) : request.paymentStatus === "Payment Rejected" ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-900">Payment Verification Failed</p>
                <p className="text-xs text-red-700">
                  {transaction?.rejectionReason || "The reference could not be verified. Please re-submit your correct 12-digit UPI UTR."}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#EAF5FC] border border-[#D9EAF5] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#123B66]">
                <ShieldCheck className="w-4 h-4 text-[#087F8C]" />
                <span>100% Secure Clinic UPI Transfer</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#2878B9] bg-white px-2.5 py-0.5 rounded-full border border-[#D9EAF5]">
                {request.paymentId}
              </span>
            </div>
          )}

          {/* Session Details Card */}
          <div className="bg-[#F8FBFE] p-5 rounded-2xl border border-[#D9EAF5] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9EAF5]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#087F8C] tracking-wider block">
                  Consulting Doctor
                </span>
                <p className="font-serif text-base font-bold text-[#123B66]">{request.doctorName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#26384A]/60 tracking-wider block">
                  Consultation Fee
                </span>
                <p className="font-serif text-2xl font-bold text-[#2878B9]">₹{request.amount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-[#26384A]/80 pt-1">
              <div>
                <span className="text-[#26384A]/50 block text-[10px] uppercase font-semibold">Patient Name</span>
                <p className="font-medium text-[#123B66]">{request.patientName}</p>
              </div>
              <div>
                <span className="text-[#26384A]/50 block text-[10px] uppercase font-semibold">Session Type</span>
                <p className="font-medium text-[#123B66]">{request.sessionType}</p>
              </div>
              <div>
                <span className="text-[#26384A]/50 block text-[10px] uppercase font-semibold">Consultation Date</span>
                <p className="font-medium text-[#123B66]">{request.sessionDate}</p>
              </div>
              <div>
                <span className="text-[#26384A]/50 block text-[10px] uppercase font-semibold">Payment Status</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5FC] text-[#2878B9] border border-[#D9EAF5]">
                  {request.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Doctor's UPI QR Code Display */}
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold text-[#123B66]">
              Scan the QR code below using any UPI App (GPay, PhonePe, Paytm, BHIM)
            </p>

            <div className="inline-block p-4 bg-white rounded-3xl border-2 border-[#D9EAF5] shadow-md relative group">
              <img
                src={request.doctorUpiQrImage || generateUpiQrDataUrl(upiId, request.doctorName, request.amount)}
                alt="Doctor UPI Payment QR Code"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl"
              />
            </div>

            {/* UPI ID Pill with Copy */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5FC] border border-[#D9EAF5] text-xs font-mono text-[#123B66]">
              <span>UPI ID: {upiId}</span>
              <button
                onClick={handleCopyUpi}
                className="hover:text-[#2878B9] transition-colors cursor-pointer"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Pay Now Button (Mobile Intent) */}
            <a
              href={upiIntentUrl}
              className="inline-flex items-center justify-center gap-2 bg-[#2878B9] hover:bg-[#1f5f93] text-white py-3 px-4 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Pay Now</span>
            </a>

            {/* Download QR Code */}
            <button
              onClick={handleDownloadQr}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#EAF5FC] text-[#123B66] border border-[#D9EAF5] py-3 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-[#087F8C]" />
              <span>Download QR</span>
            </button>

            {/* I Have Paid */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#087F8C] hover:bg-[#066570] text-white py-3 px-4 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>I Have Paid</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-[#F8FBFE] px-6 py-4 border-t border-[#D9EAF5] text-center text-[11px] text-[#26384A]/60">
          Need help with your payment? Call clinic desk at <strong className="text-[#123B66]">0816-3136697</strong> or WhatsApp <strong className="text-[#123B66]">9980999068</strong>.
        </div>
      </div>

      {/* "I Have Paid" Submission Dialog */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#D9EAF5] animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9EAF5] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E9F6F3] flex items-center justify-center text-[#087F8C]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#123B66]">Confirm Your Payment</h3>
                  <p className="text-[11px] text-[#087F8C]">Session Fee: ₹{request.amount}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-serif text-lg font-bold text-[#123B66]">Payment Submitted!</h4>
                <p className="text-xs text-[#26384A]/70">
                  Your reference has been sent to Dr. {request.doctorName} for confirmation.
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
                    <span className="text-[11px] font-medium text-[#123B66]">Click to upload screenshot</span>
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
                      <span>Screenshot ready for submission</span>
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
                    placeholder="e.g. Paid via PhonePe (Ramesh K)"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="w-1/2 py-2.5 rounded-full border border-[#D9EAF5] text-[#123B66] font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-full bg-[#087F8C] hover:bg-[#066570] text-white font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Submit Proof
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
