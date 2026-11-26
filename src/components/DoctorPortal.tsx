import React, { useState, useEffect } from "react";
import {
  IndianRupee,
  Upload,
  CheckCircle2,
  Clock,
  FileCheck,
  Send,
  Calendar,
  User,
  Phone,
  MessageSquare,
  ExternalLink,
  Save,
  Check,
  X,
  Eye,
  Sliders,
  Smartphone,
  Copy,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { DOCTORS } from "../data/clinicData";
import { DoctorPaymentSettings, PaymentRequest, SessionTypeFee } from "../types";
import {
  paymentService,
  generateUpiQrDataUrl,
  DEFAULT_SESSION_FEES,
  isPlaceholderUpiId,
  isUploadedCustomQr,
  isValidUpiIdFormat,
} from "../services/paymentService";
import { decodeAndCompressUploadedQr } from "../utils/qrUtils";

interface DoctorPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPatientPayment?: (paymentId: string) => void;
}

interface AppointmentItem {
  id: string;
  refId?: string;
  patientId?: string;
  patientName: string;
  phone: string;
  doctor: string;
  date: string;
  timeSlot: string;
  consultationType: string;
  status: string;
  sessionStatus?: string;
  paymentStatus?: string;
  paymentId?: string;
  consultationFee?: number;
  doctorNotes?: string;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  isOpen,
  onClose,
  onOpenPatientPayment,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(DOCTORS[0].id);
  const currentDoctor = DOCTORS.find((d) => d.id === selectedDoctorId) || DOCTORS[0];

  const [activeTab, setActiveTab] = useState<"settings" | "sessions" | "history">("sessions");

  // Settings State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("vkare_doctor_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  const [settings, setSettings] = useState<DoctorPaymentSettings>(() =>
    paymentService.getDoctorSettings(currentDoctor.id)
  );
  const [baseFeeInput, setBaseFeeInput] = useState<string>(String(settings.consultationFee || 800));
  const [upiIdInput, setUpiIdInput] = useState<string>(
    isPlaceholderUpiId(settings.upiId) ? "" : settings.upiId || ""
  );
  const [payeeNameState, setPayeeNameState] = useState<string>(
    settings.payeeName || currentDoctor.name
  );
  const [merchantCodeState, setMerchantCodeState] = useState<string>(settings.merchantCode || "");
  const [uploadedQrImage, setUploadedQrImage] = useState<string>(
    isUploadedCustomQr(settings.upiQrImage) ? settings.upiQrImage || "" : ""
  );
  const [qrDecodeStatus, setQrDecodeStatus] = useState<{ ok: boolean; message: string } | null>(
    null
  );
  const [paymentEnabled, setPaymentEnabled] = useState<boolean>(settings.paymentEnabled);
  const [sessionFees, setSessionFees] = useState<SessionTypeFee[]>(
    settings.sessionFees && settings.sessionFees.length > 0
      ? settings.sessionFees
      : DEFAULT_SESSION_FEES
  );
  const [saveToast, setSaveToast] = useState(false);

  // Sessions & Appointments State
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedAptForPayment, setSelectedAptForPayment] = useState<AppointmentItem | null>(null);
  const [customAmountInput, setCustomAmountInput] = useState<string>("800");
  const [customSessionType, setCustomSessionType] = useState<string>("In-Person (Clinic Visit)");
  const [customNotes, setCustomNotes] = useState<string>("");
  const [sessionAmountError, setSessionAmountError] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [createdPayment, setCreatedPayment] = useState<PaymentRequest | null>(null);
  const [notificationToast, setNotificationToast] = useState("");

  // Payment Requests State
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  const syncSettingsState = () => {
    const s = paymentService.getDoctorSettings(currentDoctor.id);
    setSettings(s);
    setBaseFeeInput(String(s.consultationFee || 800));
    setUpiIdInput(isPlaceholderUpiId(s.upiId) ? "" : s.upiId || "");
    setPayeeNameState(s.payeeName || currentDoctor.name);
    setMerchantCodeState(s.merchantCode || "");
    setUploadedQrImage(isUploadedCustomQr(s.upiQrImage) ? s.upiQrImage || "" : "");
    setPaymentEnabled(s.paymentEnabled);
    setSessionFees(s.sessionFees && s.sessionFees.length > 0 ? s.sessionFees : DEFAULT_SESSION_FEES);
  };

  // Load doctor settings whenever doctor changes
  useEffect(() => {
    setQrDecodeStatus(null);
    syncSettingsState();
  }, [currentDoctor.id, currentDoctor.name]);

  // Load appointments & requests
  const refreshData = () => {
    // Load pure appointments from localStorage, purging any legacy demo entries and normalizing id/refId
    const rawApts = JSON.parse(localStorage.getItem("vkare_appointments") || "[]");
    const demoIds = ["VK-2026-9041", "VK-2026-9042", "VK-2026-9043", "VK-2026-9044"];
    const savedApts: AppointmentItem[] = Array.isArray(rawApts)
      ? rawApts
          .map((a: any) => ({
            ...a,
            id: a.id || a.refId || `VK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            status: a.status || "Confirmed",
          }))
          .filter((a: AppointmentItem) => !demoIds.includes(a.id))
      : [];
    if (Array.isArray(rawApts) && rawApts.length !== savedApts.length) {
      localStorage.setItem("vkare_appointments", JSON.stringify(savedApts));
    }

    // Filter for current doctor (or show all if flexible)
    const doctorApts = savedApts.filter(
      (a: AppointmentItem) =>
        a.doctor &&
        (a.doctor.toLowerCase().includes(currentDoctor.name.toLowerCase()) ||
          currentDoctor.name.toLowerCase().includes(a.doctor.toLowerCase()))
    );
    setAppointments(doctorApts);

    // Load payments for this doctor
    const allReqs = paymentService.getAllRequests();
    const docReqs = allReqs.filter(
      (r) =>
        r.doctorId === currentDoctor.id ||
        r.doctorName.toLowerCase().includes(currentDoctor.name.toLowerCase())
    );
    setPaymentRequests(docReqs);
  };

  useEffect(() => {
    if (isOpen) {
      const isAuth = sessionStorage.getItem("vkare_doctor_auth") === "true";
      setIsAuthenticated(isAuth);
      setPasswordInput("");
      setAuthError("");
      if (isAuth) {
        refreshData();
      }
    }
    const handleUpdate = () => {
      if (sessionStorage.getItem("vkare_doctor_auth") === "true") {
        refreshData();
      }
    };
    window.addEventListener("vkare_payments_updated", handleUpdate);
    window.addEventListener("vkare_appointment_booked", handleUpdate);
    window.addEventListener("vkare_appointments_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("vkare_payments_updated", handleUpdate);
      window.removeEventListener("vkare_appointment_booked", handleUpdate);
      window.removeEventListener("vkare_appointments_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [isOpen, currentDoctor.id]);

  if (!isOpen) return null;

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim().toUpperCase() === "PSYCHOLOGY") {
      sessionStorage.setItem("vkare_doctor_auth", "true");
      setIsAuthenticated(true);
      setAuthError("");
      refreshData();
    } else {
      setAuthError("Unauthorized access. Invalid staff authorization code.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#D9EAF5] overflow-hidden p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF5FC] text-[#123B66] mx-auto flex items-center justify-center mb-4 border border-[#D9EAF5] shadow-xs">
            <Lock className="w-7 h-7 text-[#087F8C]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Authorized Medical Personnel Only</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#123B66] mb-1.5">
            Doctor & Staff Access
          </h3>
          <p className="text-xs text-[#26384A]/70 mb-6 leading-relaxed">
            This internal portal contains physician fee management, UPI QR configurations, and patient sessions. Access is restricted to clinic physicians and authorized administration.
          </p>

          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div className="text-left">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#123B66] mb-1.5">
                Staff Authorization Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError("");
                }}
                placeholder="Enter password..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-[#D9EAF5] focus:outline-none focus:ring-2 focus:ring-[#087F8C] text-sm text-[#123B66]"
              />
              {authError && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <span>•</span>
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#D9EAF5] text-xs font-semibold text-[#123B66] hover:bg-[#EAF5FC] transition-colors cursor-pointer"
              >
                Back to Website
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#123B66] to-[#087F8C] hover:from-[#0d2a4a] hover:to-[#066570] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Verify & Enter
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── Settings Handlers ───────────────────────────────────────────────────────
  const numericBaseFee = Math.max(1, Number(baseFeeInput) || settings.consultationFee || 800);
  const cleanEnteredUpi = isPlaceholderUpiId(upiIdInput) ? "" : upiIdInput.trim();
  const liveQrPreview = uploadedQrImage
    ? uploadedQrImage
    : isValidUpiIdFormat(cleanEnteredUpi)
    ? generateUpiQrDataUrl(cleanEnteredUpi, payeeNameState || currentDoctor.name, numericBaseFee, `V-KARE ${currentDoctor.name}`, {
        merchantCode: merchantCodeState || undefined,
      })
    : "";

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const processed = await decodeAndCompressUploadedQr(file);
      const nextUpi = processed.decodedUpi?.upiId || cleanEnteredUpi;
      const nextPayee = processed.decodedUpi?.payeeName || payeeNameState || currentDoctor.name;
      const nextMc = processed.decodedUpi?.merchantCode || merchantCodeState || "";

      setUploadedQrImage(processed.compressedDataUrl);
      if (processed.decodedUpi?.upiId) {
        setUpiIdInput(processed.decodedUpi.upiId);
      }
      if (processed.decodedUpi?.payeeName) {
        setPayeeNameState(processed.decodedUpi.payeeName);
      }
      if (processed.decodedUpi?.merchantCode) {
        setMerchantCodeState(processed.decodedUpi.merchantCode);
      }

      // Persist immediately so switching tabs never loses uploaded QR
      const updated: DoctorPaymentSettings = {
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        consultationFee: numericBaseFee,
        sessionFees,
        upiId: nextUpi,
        payeeName: nextPayee,
        merchantCode: nextMc || undefined,
        upiQrImage: processed.compressedDataUrl,
        paymentEnabled,
        updatedAt: new Date().toISOString(),
      };
      const savedOk = paymentService.saveDoctorSettings(updated);
      setSettings(updated);

      if (processed.decodedUpi) {
        setQrDecodeStatus({
          ok: true,
          message: `QR decoded & saved (${processed.decodedUpi.upiId}). Patients scanning on mobile will get the exact fixed fee.`,
        });
        setNotificationToast(
          `Uploaded QR decoded (${processed.decodedUpi.upiId}) and saved for ${currentDoctor.name}.`
        );
      } else {
        setQrDecodeStatus({
          ok: false,
          message: savedOk
            ? "QR image uploaded & saved. Could not auto-read UPI ID from this image — please also enter your UPI ID so fixed-amount QR & PhonePe/GPay links work."
            : "QR image uploaded for preview, but browser storage is full. Please also enter your UPI ID above.",
        });
        setNotificationToast("Uploaded QR image saved. Verify your UPI ID above for fixed-fee UPI links.");
      }
    } catch {
      setQrDecodeStatus({
        ok: false,
        message: "Could not read this file as an image. Please upload a PNG or JPG screenshot of your PhonePe / GPay QR.",
      });
    }
  };

  const handleRemoveUploadedQr = () => {
    setUploadedQrImage("");
    setQrDecodeStatus(null);
    const updated: DoctorPaymentSettings = {
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      consultationFee: numericBaseFee,
      sessionFees,
      upiId: cleanEnteredUpi,
      payeeName: payeeNameState || currentDoctor.name,
      merchantCode: merchantCodeState || undefined,
      upiQrImage: "",
      paymentEnabled,
      updatedAt: new Date().toISOString(),
    };
    paymentService.saveDoctorSettings(updated);
    setSettings(updated);
    setNotificationToast("Removed uploaded QR image.");
  };

  const handleBaseFeeChange = (rawValue: string) => {
    setBaseFeeInput(rawValue);
    const parsed = Number(rawValue);
    if (Number.isFinite(parsed) && parsed > 0) {
      setSessionFees((prev) =>
        prev.map((sf) =>
          sf.sessionType === "In-Person (Clinic Visit)" || sf.sessionType === "Online (Video Consultation)"
            ? { ...sf, fee: parsed }
            : sf
        )
      );
    }
  };

  const handleSessionFeeChange = (index: number, newFee: number) => {
    setSessionFees((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, fee: Number.isFinite(newFee) ? Math.max(0, newFee) : 0 } : item))
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const feeToSave = Math.max(1, Number(baseFeeInput) || 800);
    setBaseFeeInput(String(feeToSave));

    const updated: DoctorPaymentSettings = {
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      consultationFee: feeToSave,
      sessionFees,
      upiId: cleanEnteredUpi,
      payeeName: payeeNameState || currentDoctor.name,
      merchantCode: merchantCodeState || undefined,
      upiQrImage: uploadedQrImage || "",
      paymentEnabled,
      updatedAt: new Date().toISOString(),
    };
    paymentService.saveDoctorSettings(updated);
    setSettings(updated);
    setSaveToast(true);
    setNotificationToast(
      `Saved ₹${feeToSave} consultation fee${cleanEnteredUpi ? ` & UPI (${cleanEnteredUpi})` : ""} for ${currentDoctor.name}.`
    );
    setTimeout(() => setSaveToast(false), 2500);
  };

  const copyToClipboard = async (text: string, onDone?: () => void) => {
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
    onDone?.();
  };

  // ─── Consultation Completion & Send Payment Request ──────────────────────────
  const handleOpenCompleteModal = (apt: AppointmentItem) => {
    const fresh = paymentService.getDoctorSettings(currentDoctor.id);
    setSettings(fresh);
    setSelectedAptForPayment(apt);
    setCreatedPayment(null);
    setCopiedLink(false);
    setSessionAmountError("");
    setCustomNotes(apt.doctorNotes || "");
    const activeFees =
      fresh.sessionFees && fresh.sessionFees.length > 0 ? fresh.sessionFees : DEFAULT_SESSION_FEES;
    const matched = activeFees.find((sf) => sf.sessionType === apt.consultationType);
    const resolvedFee =
      apt.consultationFee || (matched ? matched.fee : fresh.consultationFee || 800);
    setCustomAmountInput(String(resolvedFee));
    setCustomSessionType(apt.consultationType || "In-Person (Clinic Visit)");
  };

  const handleSendPaymentRequest = () => {
    if (!selectedAptForPayment) return;

    const amountVal = Math.round(Number(customAmountInput) * 100) / 100;
    if (!Number.isFinite(amountVal) || amountVal < 1) {
      setSessionAmountError("Please enter a valid consultation fee of at least ₹1.");
      return;
    }
    setSessionAmountError("");

    const fresh = paymentService.getDoctorSettings(currentDoctor.id);
    const activeUpi = !isPlaceholderUpiId(upiIdInput)
      ? upiIdInput.trim()
      : !isPlaceholderUpiId(fresh.upiId)
      ? fresh.upiId || ""
      : "";
    const activeUploadedQr = isUploadedCustomQr(uploadedQrImage)
      ? uploadedQrImage
      : isUploadedCustomQr(fresh.upiQrImage)
      ? fresh.upiQrImage
      : undefined;

    const patId =
      selectedAptForPayment.patientId ||
      `VK-P${selectedAptForPayment.phone.replace(/[^0-9]/g, "").slice(-3) || "001"}`;

    const newReq = paymentService.createRequest({
      sessionId: `SES-${selectedAptForPayment.id}`,
      appointmentId: selectedAptForPayment.id,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      patientId: patId,
      patientName: selectedAptForPayment.patientName,
      patientPhone: selectedAptForPayment.phone,
      amount: amountVal,
      sessionType: customSessionType,
      sessionDate: selectedAptForPayment.date,
      doctorUpiId: activeUpi,
      merchantPayeeName: payeeNameState || fresh.payeeName || currentDoctor.name,
      merchantCode: merchantCodeState || fresh.merchantCode,
      doctorUpiQrImage: activeUploadedQr,
      initialStatus: "Payment Requested",
    });

    // Update session status in appointments list
    try {
      const raw = localStorage.getItem("vkare_appointments");
      if (raw) {
        const apts = JSON.parse(raw);
        if (Array.isArray(apts)) {
          const updatedApts = apts.map((a: any) => {
            if (a.id === selectedAptForPayment.id || a.refId === selectedAptForPayment.id) {
              return {
                ...a,
                sessionStatus: "Completed",
                paymentStatus: "Payment Requested",
                paymentId: newReq.paymentId,
                consultationFee: amountVal,
                doctorNotes: customNotes.trim() || a.doctorNotes,
              };
            }
            return a;
          });
          localStorage.setItem("vkare_appointments", JSON.stringify(updatedApts));
        }
      }
    } catch (e) {
      console.error("Error updating appointment session status:", e);
    }

    // Dispatch sync events
    window.dispatchEvent(new CustomEvent("vkare_appointments_updated"));
    window.dispatchEvent(new CustomEvent("vkare_payments_updated"));

    setCreatedPayment(newReq);
    setNotificationToast(`Payment request ${newReq.paymentId} for ₹${amountVal} sent successfully.`);
    refreshData();
  };

  const filteredRequests =
    statusFilter === "All"
      ? paymentRequests
      : paymentRequests.filter((r) => r.paymentStatus === statusFilter);

  // Statistics
  const totalCollected = paymentRequests
    .filter((r) => r.paymentStatus === "Payment Verified")
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingAmount = paymentRequests
    .filter((r) => r.paymentStatus === "Payment Submitted" || r.paymentStatus === "Payment Requested")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-[#D9EAF5] overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Top Navbar */}
        <div className="bg-gradient-to-r from-[#123B66] via-[#1b4b7f] to-[#087F8C] px-4 sm:px-6 py-4 sm:py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              title="Back to V-KARE Home"
              className="w-10 h-10 rounded-full bg-white p-1 flex-shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            >
              <img src="/brand/vkare_logo.png" alt="V-KARE Logo" className="w-full h-full object-contain" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-base sm:text-lg font-bold">Doctor Dashboard</h2>
                <span className="text-[10px] bg-[#B8E3DF] text-[#123B66] font-bold px-2 py-0.5 rounded-full">
                  Fees & Payments
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/80">Manage your consultation fees, UPI QR, and patient requests</p>
            </div>
          </div>

          {/* Doctor Switcher & Close */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 text-xs flex-1 sm:flex-initial min-w-0">
              <User className="w-3.5 h-3.5 text-[#B8E3DF] flex-shrink-0" />
              <select
                aria-label="Select active doctor"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer w-full [&>option]:text-[#123B66]"
              >
                {DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Doctor Dashboard"
              className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Doctor Summary Strip */}
        <div className="bg-[#EAF5FC] px-4 sm:px-6 py-3 border-b border-[#D9EAF5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#123B66] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentDoctor.image}
              alt={currentDoctor.name}
              className="w-8 h-8 rounded-full object-cover border border-[#2878B9] flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="font-bold block truncate">{currentDoctor.name}</span>
              <span className="text-[11px] text-[#26384A]/60 block truncate">{currentDoctor.specialization}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-[#26384A]/60 uppercase block font-semibold">Configured Fee</span>
              <span className="font-bold text-[#2878B9] text-sm">₹{settings.consultationFee}</span>
            </div>
            <div className="text-left sm:text-right border-l border-[#D9EAF5] pl-3 sm:pl-4">
              <span className="text-[10px] text-[#26384A]/60 uppercase block font-semibold">Total Verified</span>
              <span className="font-bold text-emerald-600 text-sm">₹{totalCollected}</span>
            </div>
            <div className="text-left sm:text-right border-l border-[#D9EAF5] pl-3 sm:pl-4">
              <span className="text-[10px] text-[#26384A]/60 uppercase block font-semibold">Pending</span>
              <span className="font-bold text-amber-600 text-sm">₹{pendingAmount}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#D9EAF5] px-4 sm:px-6 bg-[#F8FBFE] flex-shrink-0 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("sessions")}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === "sessions"
                ? "border-[#2878B9] text-[#2878B9]"
                : "border-transparent text-[#26384A]/70 hover:text-[#123B66]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Sessions ({appointments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === "settings"
                ? "border-[#2878B9] text-[#2878B9]"
                : "border-transparent text-[#26384A]/70 hover:text-[#123B66]"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Fees & UPI QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === "history"
                ? "border-[#2878B9] text-[#2878B9]"
                : "border-transparent text-[#26384A]/70 hover:text-[#123B66]"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Payment History ({paymentRequests.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-6">
          {notificationToast && (
            <div role="status" className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-800 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{notificationToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotificationToast("")}
                className="text-emerald-700 hover:text-emerald-950 cursor-pointer font-bold px-1.5"
              >
                Dismiss
              </button>
            </div>
          )}
          {/* ════════════════ TAB 1: SESSIONS & COMPLETE SESSION ════════════════ */}
          {activeTab === "sessions" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#123B66]">Patient Consultations</h3>
                  <p className="text-xs text-[#26384A]/70">
                    Complete finished sessions and dispatch payment requests with your UPI QR code.
                  </p>
                </div>
                <div className="text-xs bg-[#EAF5FC] text-[#2878B9] font-semibold px-3 py-1.5 rounded-full border border-[#D9EAF5]">
                  Active Doctor: {currentDoctor.name}
                </div>
              </div>

              {/* Sessions Table / Cards */}
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-[#26384A]/60">
                    No active sessions found for {currentDoctor.name}. New appointments will appear here automatically.
                  </div>
                ) : (
                  appointments.map((apt) => {
                    const existingPayment = paymentRequests.find(
                      (r) => r.appointmentId === apt.id || (apt.refId && r.appointmentId === apt.refId)
                    );
                    const isCompleted = apt.sessionStatus === "Completed" || !!existingPayment;

                    return (
                      <div
                        key={apt.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isCompleted
                            ? "border-emerald-200/80 bg-gradient-to-r from-emerald-50/30 to-white"
                            : "border-[#D9EAF5] bg-white hover:shadow-card-hover"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#2878B9] bg-[#EAF5FC] px-2 py-0.5 rounded-md">
                              {apt.refId || apt.id}
                            </span>
                            {apt.patientId && (
                              <span className="font-mono text-[11px] font-semibold text-[#087F8C] bg-[#E9F6F3] px-2 py-0.5 rounded-md">
                                {apt.patientId}
                              </span>
                            )}
                            <span className="font-serif font-bold text-sm text-[#123B66]">{apt.patientName}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {apt.consultationType}
                            </span>
                            {isCompleted && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Session Completed</span>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#26384A]/70">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#087F8C]" /> {apt.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#087F8C]" /> {apt.timeSlot}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-[#087F8C]" /> {apt.phone}
                            </span>
                          </div>

                          {existingPayment && (
                            <div className="pt-1 flex items-center gap-2 text-xs">
                              <span className="text-[11px] text-[#26384A]/60 font-medium">Payment Status:</span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                                  existingPayment.paymentStatus === "Payment Verified"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : existingPayment.paymentStatus === "Payment Submitted"
                                    ? "bg-blue-100 text-blue-800 animate-pulse"
                                    : existingPayment.paymentStatus === "Payment Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {existingPayment.paymentStatus} (₹{existingPayment.amount})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {existingPayment ? (
                            <>
                              <a
                                href={paymentService.getWhatsAppPaymentUrl(existingPayment)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1fb355] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                                title="Resend WhatsApp payment request to patient"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp Request</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  const url = paymentService.getPaymentUrl(existingPayment);
                                  void copyToClipboard(url, () =>
                                    setNotificationToast(`Payment link for ${existingPayment.paymentId} copied!`)
                                  );
                                }}
                                className="inline-flex items-center gap-1.5 bg-white hover:bg-[#EAF5FC] text-[#123B66] border border-[#D9EAF5] px-3.5 py-2 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer"
                                title="Copy payment link"
                              >
                                <Copy className="w-3.5 h-3.5 text-[#2878B9]" />
                                <span>Copy Link</span>
                              </button>
                              <button
                                onClick={() => onOpenPatientPayment?.(existingPayment.paymentId)}
                                className="inline-flex items-center gap-1.5 bg-[#2878B9] hover:bg-[#1f5f93] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                                title="Open patient payment view"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Pay View</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenCompleteModal(apt)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2878B9] hover:bg-[#1f5f93] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete Session</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ════════════════ TAB 2: MY FEES & PAYMENT SETTINGS ════════════════ */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#D9EAF5]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#123B66]">My Fees & Payment Settings</h3>
                  <p className="text-xs text-[#26384A]/70">
                    Configure your standard consultation fees and personal UPI QR code for {currentDoctor.name}.
                  </p>
                </div>
                {saveToast && (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                    <span>Payment Settings Saved!</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left 7 cols: Fees and Config */}
                <div className="md:col-span-7 space-y-5">
                  {/* Base Fee input */}
                  <div className="bg-[#F8FBFE] p-5 rounded-2xl border border-[#D9EAF5] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#123B66] flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4 text-[#2878B9]" />
                        <span>Standard Consultation Fee (₹)</span>
                      </label>
                      <span className="text-[10px] text-[#087F8C] font-semibold bg-white px-2 py-0.5 rounded-md border border-[#D9EAF5]">
                        Default Fee
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#123B66]">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={baseFeeInput}
                        onChange={(e) => handleBaseFeeChange(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#D9EAF5] bg-white text-sm font-bold text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                        placeholder="800"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-[#26384A]/60">
                      Syncs standard In-Person and Video fees automatically and locks this fee in payment links.
                    </p>
                  </div>

                  {/* Different Session Types Fees */}
                  <div className="bg-[#F8FBFE] p-5 rounded-2xl border border-[#D9EAF5] space-y-3">
                    <label className="text-xs font-bold text-[#123B66] block">
                      Session Type Specific Fees (Optional)
                    </label>
                    <div className="space-y-2.5">
                      {sessionFees.map((sf, idx) => (
                        <div key={sf.sessionType} className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-[#26384A]/80 font-medium">{sf.sessionType}</span>
                          <div className="flex items-center gap-1.5 w-32">
                            <span className="text-xs font-bold text-[#123B66]">₹</span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={sf.fee}
                              onChange={(e) => handleSessionFeeChange(idx, Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[#D9EAF5] bg-white text-xs font-bold text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personal UPI ID */}
                  <div className="bg-[#F8FBFE] p-5 rounded-2xl border border-[#D9EAF5] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-[#123B66] block">
                        Doctor's Real UPI ID (VPA)
                      </label>
                      {isValidUpiIdFormat(cleanEnteredUpi) ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Valid UPI Configured
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Required for PhonePe / GPay
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="Enter real UPI ID (e.g. yourname@okicici or 98xxxxxx@ybl)"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D9EAF5] bg-white text-xs font-mono text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                    />
                    <p className="text-[10px] text-[#26384A]/60">
                      Auto-filled when you upload a PhonePe / Google Pay QR photo, or enter manually so the exact fee locks cleanly.
                    </p>
                  </div>

                  {/* Toggle Payment Requests */}
                  <div className="p-4 rounded-2xl bg-white border border-[#D9EAF5] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#123B66] block">Enable Payment Requests</span>
                      <span className="text-[11px] text-[#26384A]/60">Allow generating payment requests after sessions</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentEnabled}
                        onChange={(e) => setPaymentEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#087F8C]" />
                    </label>
                  </div>
                </div>

                {/* Right 5 cols: QR Code Upload & Preview */}
                <div className="md:col-span-5 space-y-4">
                  <div className="bg-[#F8FBFE] p-5 rounded-3xl border border-[#D9EAF5] text-center space-y-4">
                    <div className="flex items-center justify-between text-left">
                      <div>
                        <span className="text-xs font-bold text-[#123B66] block">Doctor's UPI QR Code</span>
                        <span className="text-[10px] text-[#26384A]/60">
                          {uploadedQrImage ? "Uploaded QR Photo (Active)" : isValidUpiIdFormat(cleanEnteredUpi) ? `Dynamic QR · ₹${numericBaseFee}` : "Awaiting QR or UPI ID"}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#087F8C] bg-[#E9F6F3] px-2 py-0.5 rounded-full">
                        Live Preview
                      </span>
                    </div>

                    {/* QR Preview Box */}
                    <div className="p-3 bg-white rounded-2xl border-2 border-[#D9EAF5] shadow-sm inline-flex items-center justify-center min-w-[200px] min-h-[200px]">
                      {liveQrPreview ? (
                        <img
                          src={liveQrPreview}
                          alt="Doctor Payment QR"
                          className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-lg"
                        />
                      ) : (
                        <div className="w-48 h-48 flex flex-col items-center justify-center text-center p-4 bg-[#F8FBFE] rounded-lg border border-dashed border-[#D9EAF5] text-[#26384A]/60">
                          <Upload className="w-7 h-7 text-[#2878B9] mb-2" />
                          <span className="text-[11px] font-semibold text-[#123B66]">No QR Uploaded Yet</span>
                          <span className="text-[10px] mt-1">
                            Upload your PhonePe / GPay QR or enter your UPI ID to generate a fixed-amount QR.
                          </span>
                        </div>
                      )}
                    </div>

                    {qrDecodeStatus && (
                      <div
                        className={`p-2.5 rounded-xl text-left text-[11px] border ${
                          qrDecodeStatus.ok
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-amber-50 border-amber-200 text-amber-900"
                        }`}
                      >
                        {qrDecodeStatus.message}
                      </div>
                    )}

                    {/* Upload / Replace Controls */}
                    <div className="space-y-2">
                      <label className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2878B9] hover:bg-[#1f5f93] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadedQrImage ? "Replace Uploaded QR Image" : "Upload Personal QR Image"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="hidden"
                        />
                      </label>

                      {uploadedQrImage && (
                        <button
                          type="button"
                          onClick={handleRemoveUploadedQr}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove Uploaded QR Image</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-[#26384A]/55 leading-relaxed">
                      Uploading your PhonePe / GPay QR extracts your UPI ID automatically so patients get both your QR and a locked ₹{numericBaseFee} scannable QR.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#D9EAF5] flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#087F8C] hover:bg-[#066570] text-white py-3 px-8 rounded-full text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Payment Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════ TAB 3: PAYMENT REQUESTS HISTORY ════════════════ */}
          {activeTab === "history" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#123B66]">Payment Requests History</h3>
                  <p className="text-xs text-[#26384A]/70">
                    Track patient payments, verify received UPI transfers, and manage receipts.
                  </p>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#26384A]/60 font-medium">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs font-semibold text-[#123B66] focus:outline-none"
                  >
                    <option value="All">All Requests ({paymentRequests.length})</option>
                    <option value="Payment Requested">Payment Requested</option>
                    <option value="Payment Submitted">Payment Submitted</option>
                    <option value="Payment Verified">Payment Verified</option>
                    <option value="Payment Rejected">Payment Rejected</option>
                  </select>
                </div>
              </div>

              {/* Table / List */}
              <div className="border border-[#D9EAF5] rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#EAF5FC] text-[#123B66] uppercase text-[10px] font-bold tracking-wider border-b border-[#D9EAF5]">
                      <tr>
                        <th className="py-3 px-4">Payment ID</th>
                        <th className="py-3 px-4">Patient</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Transaction UTR</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9EAF5]/60 text-[#26384A]">
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#26384A]/50">
                            No payment requests found matching this filter.
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((req) => {
                          const txn = paymentService.getTransactionByPaymentId(req.paymentId);
                          return (
                            <tr key={req.paymentId} className="hover:bg-[#F8FBFE] transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-[#2878B9]">
                                {req.paymentId}
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-[#123B66]">{req.patientName}</p>
                                <p className="text-[10px] text-[#26384A]/60">{req.patientPhone}</p>
                              </td>
                              <td className="py-3 px-4 text-[11px] text-[#26384A]/70">
                                {req.sessionDate}
                              </td>
                              <td className="py-3 px-4 font-bold text-[#123B66]">
                                ₹{req.amount}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    req.paymentStatus === "Payment Verified"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : req.paymentStatus === "Payment Submitted"
                                      ? "bg-blue-100 text-blue-800 animate-pulse"
                                      : req.paymentStatus === "Payment Rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {req.paymentStatus}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px]">
                                {txn ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[#123B66]">{txn.upiReference}</span>
                                    {txn.screenshot && (
                                      <button
                                        onClick={() => setPreviewScreenshot(txn.screenshot || null)}
                                        className="text-[#2878B9] hover:text-[#123B66] p-0.5"
                                        title="View Screenshot Proof"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[#26384A]/40 italic">Pending UTR</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  {/* View Patient Link */}
                                  <button
                                    onClick={() => onOpenPatientPayment?.(req.paymentId)}
                                    className="p-1.5 rounded-lg bg-[#EAF5FC] hover:bg-[#D9EAF5] text-[#2878B9]"
                                    title="Open Patient Payment View"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Verify button if submitted */}
                                  {req.paymentStatus === "Payment Submitted" && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          paymentService.verifyPayment(req.paymentId, currentDoctor.name);
                                          setNotificationToast(`Payment ${req.paymentId} verified successfully!`);
                                          refreshData();
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                                      >
                                        Verify
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const reason = window.prompt("Reason for rejection:");
                                          if (reason) {
                                            paymentService.rejectPayment(req.paymentId, currentDoctor.name, reason);
                                            setNotificationToast(`Payment ${req.paymentId} marked as rejected.`);
                                            refreshData();
                                          }
                                        }}
                                        className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════ COMPLETE SESSION MODAL ════════════════ */}
      {selectedAptForPayment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#D9EAF5] animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9EAF5] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF5FC] flex items-center justify-center text-[#2878B9]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#123B66]">Complete Consultation Session</h3>
                  <p className="text-[11px] text-[#087F8C]">Patient: {selectedAptForPayment.patientName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAptForPayment(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdPayment ? (
              <div className="space-y-4 py-1">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-emerald-950 text-base">Payment Request Dispatched!</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Request ID <span className="font-mono font-bold">{createdPayment.paymentId}</span> for ₹{createdPayment.amount} is active.
                    </p>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-3.5 bg-[#F8FBFE] rounded-2xl border border-[#D9EAF5] text-xs space-y-2 text-[#26384A]">
                  <div className="flex justify-between items-center pb-2 border-b border-[#D9EAF5]/70">
                    <span className="text-[#26384A]/60 font-medium">Patient:</span>
                    <span className="font-bold text-[#123B66]">
                      {createdPayment.patientName} ({createdPayment.patientPhone})
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#D9EAF5]/70">
                    <span className="text-[#26384A]/60 font-medium">Session Type:</span>
                    <span className="font-semibold text-[#087F8C]">{createdPayment.sessionType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#26384A]/60 font-medium">Consultation Fee:</span>
                    <span className="font-serif text-base font-bold text-[#123B66]">₹{createdPayment.amount}</span>
                  </div>
                </div>

                {/* Dispatch & Action Buttons */}
                <div className="space-y-2 pt-1">
                  {/* WhatsApp Action */}
                  <a
                    href={paymentService.getWhatsAppPaymentUrl(createdPayment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb355] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send WhatsApp Notification to Patient</span>
                  </a>

                  {/* SMS Action */}
                  <a
                    href={`sms:+91${createdPayment.patientPhone.replace(/[^0-9]/g, "")}?&body=${encodeURIComponent(
                      `V-KARE CLINIC: Dear ${createdPayment.patientName}, your consultation session with ${createdPayment.doctorName} has been completed. Consultation fee: Rs.${createdPayment.amount}. Pay online via UPI/Card: ${paymentService.getPaymentUrl(createdPayment)} - Helpline: 8317399068.`
                    )}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#123B66] hover:bg-[#0c2847] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Send SMS Notification to Patient</span>
                  </a>

                  {/* Copy Link & Open Pay Screen */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const payUrl = paymentService.getPaymentUrl(createdPayment);
                        void copyToClipboard(payUrl, () => {
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        });
                      }}
                      className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-[#EAF5FC] text-[#123B66] border border-[#D9EAF5] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      {copiedLink ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#2878B9]" />
                      )}
                      <span>{copiedLink ? "Link Copied!" : "Copy Pay Link"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAptForPayment(null);
                        onOpenPatientPayment?.(createdPayment.paymentId);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 bg-[#2878B9] hover:bg-[#1f5f93] text-white py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Pay Screen</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedAptForPayment(null);
                      setCreatedPayment(null);
                    }}
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Patient Summary Header */}
                <div className="p-3.5 bg-[#EAF5FC] rounded-2xl border border-[#D9EAF5] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#26384A]/60 font-medium">Patient Name:</span>
                    <span className="font-bold text-[#123B66] text-sm">{selectedAptForPayment.patientName}</span>
                  </div>
                  {selectedAptForPayment.patientId && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#26384A]/60 font-medium">Patient ID:</span>
                      <span className="font-mono font-bold text-[#2878B9] text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#D9EAF5]">
                        {selectedAptForPayment.patientId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[#26384A]/60 font-medium">Date & Slot:</span>
                    <span className="font-semibold text-[#123B66]">
                      {selectedAptForPayment.date} ({selectedAptForPayment.timeSlot})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#26384A]/60 font-medium">Contact:</span>
                    <span className="font-semibold text-[#123B66]">{selectedAptForPayment.phone}</span>
                  </div>
                </div>

                {/* Session Type (NO PRICE) */}
                <div>
                  <label className="block font-semibold text-[#123B66] mb-1">Session Type</label>
                  <select
                    value={customSessionType}
                    onChange={(e) => {
                      setCustomSessionType(e.target.value);
                      const matched = sessionFees.find((sf) => sf.sessionType === e.target.value);
                      if (matched) setCustomAmountInput(String(matched.fee));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs font-semibold text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                  >
                    {sessionFees.map((sf) => (
                      <option key={sf.sessionType} value={sf.sessionType}>
                        {sf.sessionType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Consultation Fee Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#123B66]">
                      Consultation Fee to Request (₹)
                    </label>
                    <span className="text-[10px] text-[#087F8C] font-semibold">Fixed in patient link</span>
                  </div>
                  {sessionAmountError && (
                    <div className="mb-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium">
                      {sessionAmountError}
                    </div>
                  )}
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#123B66]">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={customAmountInput}
                      onChange={(e) => {
                        setCustomAmountInput(e.target.value);
                        if (sessionAmountError) setSessionAmountError("");
                      }}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#D9EAF5] bg-white font-bold text-base text-[#123B66] focus:outline-none focus:border-[#2878B9] shadow-inner"
                      placeholder="800"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-[#26384A]/50">Presets:</span>
                    {[500, 800, 1000, 1200, 1500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setCustomAmountInput(String(amt));
                          if (sessionAmountError) setSessionAmountError("");
                        }}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          Number(customAmountInput) === amt
                            ? "bg-[#087F8C] text-white shadow-xs"
                            : "bg-[#EAF5FC] text-[#123B66] hover:bg-[#D9EAF5]"
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-[#26384A]/60 mt-1.5">
                    This exact fee is locked in the patient's UPI QR & PhonePe/GPay payment request.
                  </p>
                </div>

                {/* Optional Remarks */}
                <div>
                  <label className="block font-semibold text-[#123B66] mb-1">
                    Consultation Remarks <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. Consultation completed, treatment advice shared"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D9EAF5] bg-white text-xs text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedAptForPayment(null)}
                    className="w-1/2 py-2.5 rounded-full border border-[#D9EAF5] text-[#123B66] font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendPaymentRequest}
                    className="w-1/2 py-2.5 rounded-full bg-[#087F8C] hover:bg-[#066570] text-white font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Request</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 relative shadow-2xl">
            <button
              onClick={() => setPreviewScreenshot(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-serif font-bold text-sm text-[#123B66] mb-3">Submitted Payment Proof</h4>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-gray-200">
              <img src={previewScreenshot} alt="Payment Proof" className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
