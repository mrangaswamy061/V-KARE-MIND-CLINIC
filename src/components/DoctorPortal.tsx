import React, { useState, useEffect } from "react";
import {
  Stethoscope,
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
  RefreshCw,
  Eye,
  Sliders,
} from "lucide-react";
import { DOCTORS } from "../data/clinicData";
import { DoctorPaymentSettings, PaymentRequest, SessionTypeFee } from "../types";
import {
  paymentService,
  generateUpiQrDataUrl,
  DEFAULT_SESSION_FEES,
} from "../services/paymentService";

interface DoctorPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPatientPayment?: (paymentId: string) => void;
}

interface AppointmentItem {
  id: string;
  patientName: string;
  phone: string;
  doctor: string;
  date: string;
  timeSlot: string;
  consultationType: string;
  status: string;
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
  const [settings, setSettings] = useState<DoctorPaymentSettings>(() =>
    paymentService.getDoctorSettings(currentDoctor.id)
  );
  const [baseFeeInput, setBaseFeeInput] = useState<number>(settings.consultationFee);
  const [upiIdInput, setUpiIdInput] = useState<string>(settings.upiId || "");
  const [qrPreview, setQrPreview] = useState<string>(settings.upiQrImage || "");
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
  const [customAmount, setCustomAmount] = useState<number>(800);
  const [customSessionType, setCustomSessionType] = useState<string>("In-Person (Clinic Visit)");
  const [createdPayment, setCreatedPayment] = useState<PaymentRequest | null>(null);
  const [notificationToast, setNotificationToast] = useState("");

  // Payment Requests State
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  // Load doctor settings whenever doctor changes
  useEffect(() => {
    const s = paymentService.getDoctorSettings(currentDoctor.id);
    setSettings(s);
    setBaseFeeInput(s.consultationFee);
    setUpiIdInput(s.upiId || "");
    setQrPreview(s.upiQrImage || generateUpiQrDataUrl(s.upiId || "vkaremind@upi", currentDoctor.name, s.consultationFee));
    setPaymentEnabled(s.paymentEnabled);
    setSessionFees(s.sessionFees && s.sessionFees.length > 0 ? s.sessionFees : DEFAULT_SESSION_FEES);
  }, [currentDoctor.id, currentDoctor.name]);

  // Load appointments & requests
  const refreshData = () => {
    // Load pure appointments from localStorage, purging any legacy demo entries
    const rawApts = JSON.parse(localStorage.getItem("vkare_appointments") || "[]");
    const demoIds = ["VK-2026-9041", "VK-2026-9042", "VK-2026-9043", "VK-2026-9044"];
    const savedApts: AppointmentItem[] = Array.isArray(rawApts)
      ? rawApts.filter((a: AppointmentItem) => !demoIds.includes(a.id))
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
      refreshData();
    }
    const handleUpdate = () => refreshData();
    window.addEventListener("vkare_payments_updated", handleUpdate);
    return () => window.removeEventListener("vkare_payments_updated", handleUpdate);
  }, [isOpen, currentDoctor.id]);

  if (!isOpen) return null;

  // ─── Settings Handlers ───────────────────────────────────────────────────────
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setQrPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateDefaultQr = () => {
    const upi = upiIdInput.trim() || `${currentDoctor.name.toLowerCase().replace(/[^a-z]/g, "")}@okaxis`;
    const generated = generateUpiQrDataUrl(upi, currentDoctor.name, baseFeeInput);
    setQrPreview(generated);
  };

  const handleSessionFeeChange = (index: number, newFee: number) => {
    const updated = [...sessionFees];
    updated[index].fee = newFee;
    setSessionFees(updated);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DoctorPaymentSettings = {
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      consultationFee: Number(baseFeeInput) || 800,
      sessionFees,
      upiId: upiIdInput.trim() || "vkaremind@upi",
      upiQrImage: qrPreview || generateUpiQrDataUrl(upiIdInput || "vkaremind@upi", currentDoctor.name, baseFeeInput),
      paymentEnabled,
      updatedAt: new Date().toISOString(),
    };
    paymentService.saveDoctorSettings(updated);
    setSettings(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // ─── Consultation Completion & Send Payment Request ──────────────────────────
  const handleOpenCompleteModal = (apt: AppointmentItem) => {
    setSelectedAptForPayment(apt);
    setCreatedPayment(null);
    // Find matching session type fee if configured
    const matched = sessionFees.find((sf) => sf.sessionType === apt.consultationType);
    setCustomAmount(matched ? matched.fee : settings.consultationFee || 800);
    setCustomSessionType(apt.consultationType || "In-Person (Clinic Visit)");
  };

  const handleSendPaymentRequest = () => {
    if (!selectedAptForPayment) return;

    const newReq = paymentService.createRequest({
      sessionId: `SES-${selectedAptForPayment.id}`,
      appointmentId: selectedAptForPayment.id,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      patientId: `PAT-${selectedAptForPayment.phone.slice(-4)}`,
      patientName: selectedAptForPayment.patientName,
      patientPhone: selectedAptForPayment.phone,
      amount: Number(customAmount) || 800,
      sessionType: customSessionType,
      sessionDate: selectedAptForPayment.date,
      doctorUpiId: settings.upiId || "vkaremind@upi",
      doctorUpiQrImage: settings.upiQrImage || qrPreview,
      initialStatus: "Payment Requested",
    });

    setCreatedPayment(newReq);
    setNotificationToast("Payment request successfully sent to the patient.");
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
        <div className="bg-gradient-to-r from-[#123B66] via-[#1b4b7f] to-[#087F8C] px-6 py-4 sm:py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Stethoscope className="w-5 h-5 text-[#B8E3DF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold">Doctor Dashboard</h2>
                <span className="text-[10px] bg-[#B8E3DF] text-[#123B66] font-bold px-2 py-0.5 rounded-full">
                  Fees & Payments
                </span>
              </div>
              <p className="text-xs text-white/80">Manage your consultation fees, UPI QR, and patient requests</p>
            </div>
          </div>

          {/* Doctor Switcher & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              <User className="w-3.5 h-3.5 text-[#B8E3DF]" />
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer [&>option]:text-[#123B66]"
              >
                {DOCTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Doctor Summary Strip */}
        <div className="bg-[#EAF5FC] px-6 py-3 border-b border-[#D9EAF5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#123B66] flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={currentDoctor.image}
              alt={currentDoctor.name}
              className="w-8 h-8 rounded-full object-cover border border-[#2878B9]"
            />
            <div>
              <span className="font-bold">{currentDoctor.name}</span>
              <span className="text-[11px] text-[#26384A]/60 block">{currentDoctor.specialization}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-[#26384A]/60 uppercase block font-semibold">Configured Fee</span>
              <span className="font-bold text-[#2878B9] text-sm">₹{settings.consultationFee}</span>
            </div>
            <div className="text-right border-l border-[#D9EAF5] pl-4">
              <span className="text-[10px] text-[#26384A]/60 uppercase block font-semibold">Total Verified</span>
              <span className="font-bold text-emerald-600 text-sm">₹{totalCollected}</span>
            </div>
            <div className="text-right border-l border-[#D9EAF5] pl-4">
              <span className="text-[10px] text-[#26384A]/60 uppercase block font-semibold">Pending</span>
              <span className="font-bold text-amber-600 text-sm">₹{pendingAmount}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#D9EAF5] px-6 bg-[#F8FBFE] flex-shrink-0">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "sessions"
                ? "border-[#2878B9] text-[#2878B9]"
                : "border-transparent text-[#26384A]/70 hover:text-[#123B66]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Consultation Sessions ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "settings"
                ? "border-[#2878B9] text-[#2878B9]"
                : "border-transparent text-[#26384A]/70 hover:text-[#123B66]"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>My Fees & Payment Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "history"
                ? "border-[#2878B9] text-[#2878B9]"
                : "border-transparent text-[#26384A]/70 hover:text-[#123B66]"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Payment Requests & Status ({paymentRequests.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
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

              {notificationToast && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">{notificationToast}</span>
                  </div>
                  <button
                    onClick={() => setNotificationToast("")}
                    className="text-emerald-600 hover:text-emerald-800 cursor-pointer font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Sessions Table / Cards */}
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-[#26384A]/60">
                    No active sessions found for {currentDoctor.name}. New appointments will appear here automatically.
                  </div>
                ) : (
                  appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 sm:p-5 rounded-2xl border border-[#D9EAF5] bg-white hover:shadow-card-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-[#2878B9] bg-[#EAF5FC] px-2 py-0.5 rounded-md">
                            {apt.id}
                          </span>
                          <span className="font-serif font-bold text-sm text-[#123B66]">{apt.patientName}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {apt.consultationType}
                          </span>
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
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenCompleteModal(apt)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2878B9] hover:bg-[#1f5f93] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete Session</span>
                        </button>
                      </div>
                    </div>
                  ))
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
                        min="0"
                        step="50"
                        value={baseFeeInput}
                        onChange={(e) => setBaseFeeInput(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#D9EAF5] bg-white text-sm font-bold text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                        placeholder="800"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-[#26384A]/60">
                      This fee is pre-filled when completing patient consultation sessions.
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
                              min="0"
                              step="50"
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
                    <label className="text-xs font-bold text-[#123B66] block">
                      Doctor's Personal UPI ID (VPA)
                    </label>
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. drkeerthi@okaxis or 8317399068@upi"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#D9EAF5] bg-white text-xs font-mono text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                    />
                    <p className="text-[10px] text-[#26384A]/50">
                      Patients can pay directly to this UPI ID or scan your QR code.
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
                        <span className="text-[10px] text-[#26384A]/60">Scan preview</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#087F8C] bg-[#E9F6F3] px-2 py-0.5 rounded-full">
                        Live Preview
                      </span>
                    </div>

                    {/* QR Preview Box */}
                    <div className="p-3 bg-white rounded-2xl border-2 border-[#D9EAF5] shadow-sm inline-block">
                      <img
                        src={qrPreview}
                        alt="Doctor Payment QR"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-lg"
                      />
                    </div>

                    {/* Upload / Replace Controls */}
                    <div className="space-y-2">
                      <label className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2878B9] hover:bg-[#1f5f93] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Personal QR Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleGenerateDefaultQr}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-[#EAF5FC] text-[#123B66] border border-[#D9EAF5] text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3 h-3 text-[#087F8C]" />
                        <span>Auto-Generate Standard QR</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-[#26384A]/50">
                      Upload your Google Pay / PhonePe merchant QR screenshot or generate an instant UPI code.
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
                                        onClick={() => {
                                          paymentService.verifyPayment(req.paymentId, currentDoctor.name);
                                          refreshData();
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                                      >
                                        Verify
                                      </button>
                                      <button
                                        onClick={() => {
                                          const reason = window.prompt("Reason for rejection:");
                                          if (reason) {
                                            paymentService.rejectPayment(req.paymentId, currentDoctor.name, reason);
                                            refreshData();
                                          }
                                        }}
                                        className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold"
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
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-emerald-900 text-base">Payment Request Generated!</h4>
                  <p className="text-xs text-emerald-800">
                    Payment request ID <span className="font-mono font-bold">{createdPayment.paymentId}</span> for ₹{createdPayment.amount} has been created.
                  </p>
                </div>

                {/* WhatsApp Alert Button */}
                <a
                  href={paymentService.getWhatsAppPaymentUrl(createdPayment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb355] text-white py-3 px-4 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send WhatsApp Alert to Patient</span>
                </a>

                {/* Direct Patient Link */}
                <button
                  onClick={() => {
                    setSelectedAptForPayment(null);
                    onOpenPatientPayment?.(createdPayment.paymentId);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#2878B9] hover:bg-[#1f5f93] text-white py-2.5 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Patient Payment Screen</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#EAF5FC] rounded-xl border border-[#D9EAF5] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#26384A]/60">Date & Slot:</span>
                    <span className="font-semibold text-[#123B66]">
                      {selectedAptForPayment.date} ({selectedAptForPayment.timeSlot})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#26384A]/60">Contact:</span>
                    <span className="font-semibold text-[#123B66]">{selectedAptForPayment.phone}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#123B66] mb-1">Session Type</label>
                  <select
                    value={customSessionType}
                    onChange={(e) => {
                      setCustomSessionType(e.target.value);
                      const matched = sessionFees.find((sf) => sf.sessionType === e.target.value);
                      if (matched) setCustomAmount(matched.fee);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs font-semibold text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                  >
                    {sessionFees.map((sf) => (
                      <option key={sf.sessionType} value={sf.sessionType}>
                        {sf.sessionType} (₹{sf.fee})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#123B66] mb-1">
                    Consultation Fee to Request (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#123B66]">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#D9EAF5] bg-white font-bold text-sm text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                      placeholder="800"
                    />
                  </div>
                  <p className="text-[10px] text-[#26384A]/50 mt-1">
                    Doctor can adjust this fee based on session duration or special concessions.
                  </p>
                </div>

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
