import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Phone,
  Mail,
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  MessageSquare,
  X,
} from "lucide-react";
import { CLINIC_INFO } from "../data/clinicData";
import { useDynamicData } from "../hooks/useDynamicData";
import { AppointmentData } from "../types";
import { getNextApptRef, getOrRegisterPatientId } from "../services/appointmentService";

interface AppointmentSectionProps {
  preselectedDoctor?: string;
  preselectedService?: string;
  onSuccess: (data: AppointmentData, refId: string, patientId?: string) => void;
}

export const AppointmentSection: React.FC<AppointmentSectionProps> = ({
  preselectedDoctor,
  preselectedService,
  onSuccess,
}) => {
  const { doctors, services } = useDynamicData();
  const defaultDoctor = doctors[0]?.name || "Dr. Keerthi Sundar";
  const defaultDepartment = services[0]?.title || "Psychological Assessment";

  const [formData, setFormData] = useState<AppointmentData>({
    patientName: "",
    age: "",
    gender: "",
    parentName: "",
    phone: "",
    email: "",
    department: defaultDepartment,
    doctor: preselectedDoctor || defaultDoctor,
    date: "",
    timeSlot: "Morning: 10:00 AM – 10:45 AM (30-45 mins)",
    consultationType: "In-Person (Clinic Visit)",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successNotice, setSuccessNotice] = useState<{ refId: string; patientId: string; patientName: string } | null>(null);

  useEffect(() => {
    if (preselectedDoctor) {
      const matchedDoc = doctors.find((d) => d.name === preselectedDoctor);
      setFormData((prev) => ({
        ...prev,
        doctor: preselectedDoctor,
        department: matchedDoc?.department || prev.department,
      }));
    }
  }, [preselectedDoctor, doctors]);

  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({
        ...prev,
        department: preselectedService,
      }));
    }
  }, [preselectedService]);

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split("T")[0];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.patientName.trim()) newErrors.patientName = "Patient name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.date) newErrors.date = "Please select a preferred date";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setSuccessNotice(null);

    const submittedData = { ...formData };
    // Generate continuous clinical appointment reference following the date (e.g. VK-2026-NOV-0001)
    const { refId } = getNextApptRef(submittedData.date);

    // Register / retrieve patient ID sequentially (e.g. VK-P001, VK-P002...)
    const patientId = getOrRegisterPatientId(submittedData.patientName, submittedData.phone, {
      email: submittedData.email,
      service: submittedData.department,
      date: submittedData.date,
      message: submittedData.message,
      age: submittedData.age,
      gender: submittedData.gender,
      parentName: submittedData.parentName,
    });

    // Store in localStorage for audit & patient record persistence
    const existing = JSON.parse(localStorage.getItem("vkare_appointments") || "[]");
    const record = {
      ...submittedData,
      id: refId,
      refId,
      patientId,
      createdAt: new Date().toISOString(),
      status: "Pending", // Online appointments stay Pending until admin approves it!
    };
    const updatedApts = [record, ...existing];
    localStorage.setItem("vkare_appointments", JSON.stringify(updatedApts));

    // Trigger immediate reactive sync events across all open components and tabs
    window.dispatchEvent(new CustomEvent("vkare_appointment_booked", { detail: record }));
    window.dispatchEvent(new CustomEvent("vkare_appointments_updated"));
    window.dispatchEvent(new StorageEvent("storage", { key: "vkare_appointments" }));

    setTimeout(() => {
      setLoading(false);
      setSuccessNotice({ refId, patientId, patientName: submittedData.patientName });
      onSuccess({ ...submittedData, patientId }, refId, patientId);
      // Reset form
      setFormData({
        patientName: "",
        age: "",
        gender: "",
        parentName: "",
        phone: "",
        email: "",
        department: defaultDepartment,
        doctor: defaultDoctor,
        date: "",
        timeSlot: "Morning: 10:00 AM – 10:45 AM (30-45 mins)",
        consultationType: "In-Person (Clinic Visit)",
        message: "",
      });
    }, 500);
  };

  return (
    <section id="contact" className="py-16 sm:py-20 lg:py-28 bg-[#EAF5FC]/50 scroll-mt-20 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* LEFT: Appointment Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-[#D9EAF5] shadow-card-hover min-w-0 w-full">
            {/* Header */}
            <div className="mb-6">
              <span className="text-xs font-bold tracking-widest text-[#087F8C] uppercase block mb-1.5">
                Schedule Your Consultation
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#123B66] tracking-tight">
                Book an Appointment
              </h2>
              <p className="text-sm text-[#26384A]/75 mt-2">
                Choose your specialist, date, and preferred time slot. Our reception desk will
                confirm your consultation via Phone or WhatsApp.
              </p>
            </div>

            {/* Attractive Teal Appointment Banner (Duration Highlight) */}
            <div className="bg-gradient-to-r from-[#087F8C] to-[#2878B9] text-white p-4 sm:p-5 rounded-2xl mb-6 shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/30">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8E3DF] block">
                  Clinical Session Standard
                </span>
                <h3 className="font-serif font-bold text-base text-white">
                  Time Range: 30 – 45 Minutes per Session
                </h3>
                <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                  Every consultation is allocated an unhurried 30 to 45-minute window for thorough evaluation, compassionate discussion, and tailored therapeutic guidance.
                </p>
              </div>
            </div>

            {/* Inline Success Feedback Banner */}
            {successNotice && (
              <div
                role="status"
                className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 animate-fadeIn"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-emerald-950">
                      Appointment Request Submitted for {successNotice.patientName}!
                    </p>
                    <p className="text-emerald-800">
                      Reference: <span className="font-mono font-bold">{successNotice.refId}</span> • Patient ID:{" "}
                      <span className="font-mono font-bold">{successNotice.patientId}</span>. Our clinic desk will confirm shortly.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessNotice(null)}
                  aria-label="Dismiss booking confirmation banner"
                  className="p-1 text-emerald-700 hover:text-emerald-950 cursor-pointer flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Patient Full Name & Parent/Guardian Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label htmlFor="appt-patientName" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Patient Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2878B9]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="appt-patientName"
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      placeholder="Enter patient's full name"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.patientName ? "border-red-400 bg-red-50/20" : "border-[#D9EAF5] bg-[#EAF5FC]/20"
                      } text-sm text-[#26384A] placeholder-[#26384A]/40 focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all`}
                    />
                  </div>
                  {errors.patientName && (
                    <p className="text-xs text-red-500 mt-1">{errors.patientName}</p>
                  )}
                </div>

                <div className="min-w-0">
                  <label htmlFor="appt-parentName" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Parent / Guardian Name <span className="text-[10px] text-[#26384A]/40 lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2878B9]">
                      <Users className="w-4 h-4" />
                    </div>
                    <input
                      id="appt-parentName"
                      type="text"
                      name="parentName"
                      value={formData.parentName || ""}
                      onChange={handleInputChange}
                      placeholder="Father / Mother / Guardian"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] placeholder-[#26384A]/40 focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label htmlFor="appt-age" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Age <span className="text-[10px] text-[#26384A]/50 lowercase">(years)</span>
                  </label>
                  <input
                    id="appt-age"
                    type="number"
                    name="age"
                    min="1"
                    max="120"
                    value={formData.age || ""}
                    onChange={handleInputChange}
                    placeholder="Age in years"
                    className="w-full px-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] placeholder-[#26384A]/40 focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                  />
                </div>

                <div className="min-w-0">
                  <label htmlFor="appt-gender" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    id="appt-gender"
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label htmlFor="appt-phone" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2878B9]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="appt-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.phone ? "border-red-400 bg-red-50/20" : "border-[#D9EAF5] bg-[#EAF5FC]/20"
                      } text-sm text-[#26384A] placeholder-[#26384A]/40 focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div className="min-w-0">
                  <label htmlFor="appt-email" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-[10px] text-[#26384A]/40 lowercase">(optional)</span>
                  </label>
                  <input
                    id="appt-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="yourname@gmail.com"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.email ? "border-red-400 bg-red-50/20" : "border-[#D9EAF5] bg-[#EAF5FC]/20"
                    } text-sm text-[#26384A] placeholder-[#26384A]/40 focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Specialist & Department Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label htmlFor="appt-doctor" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Select Specialist
                  </label>
                  <select
                    id="appt-doctor"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label htmlFor="appt-department" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Service / Concern
                  </label>
                  <select
                    id="appt-department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                    <option value="Psychiatry & Neuropsychiatry">Psychiatry & Neuropsychiatry</option>
                    <option value="Pediatric Care & Speech Therapy">Pediatric Care & Speech Therapy</option>
                  </select>
                </div>
              </div>

              {/* Consultation Mode */}
              <div>
                <label htmlFor="appt-mode" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                  Consultation Mode
                </label>
                <select
                  id="appt-mode"
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                >
                  <option value="In-Person (Clinic Visit)">In-Person (Clinic Visit - Tumkur)</option>
                  <option value="Online (Video Consultation)">Online (Video Consultation)</option>
                </select>
              </div>

              {/* Date & Time Slot Row (with 30-45 mins explicit range) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label htmlFor="appt-date" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2878B9]">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="appt-date"
                      type="date"
                      name="date"
                      min={minDateString}
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full min-w-0 max-w-full pl-10 pr-3 py-3 rounded-xl border ${
                        errors.date ? "border-red-400 bg-red-50/20" : "border-[#D9EAF5] bg-[#EAF5FC]/20"
                      } text-sm text-[#26384A] focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all`}
                    />
                  </div>
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>

                <div className="min-w-0">
                  <label htmlFor="appt-timeSlot" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Preferred Time Slot (30–45 mins)
                  </label>
                  <select
                    id="appt-timeSlot"
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                  >
                    <option value="Morning: 10:00 AM – 10:45 AM (30-45 mins)">Morning: 10:00 AM – 10:45 AM (30–45 mins)</option>
                    <option value="Morning: 11:00 AM – 11:45 AM (30-45 mins)">Morning: 11:00 AM – 11:45 AM (30–45 mins)</option>
                    <option value="Noon: 12:00 PM – 12:45 PM (30-45 mins)">Noon: 12:00 PM – 12:45 PM (30–45 mins)</option>
                    <option value="Afternoon: 02:30 PM – 03:15 PM (30-45 mins)">Afternoon: 02:30 PM – 03:15 PM (30–45 mins)</option>
                    <option value="Afternoon: 03:30 PM – 04:15 PM (30-45 mins)">Afternoon: 03:30 PM – 04:15 PM (30–45 mins)</option>
                    <option value="Evening: 05:00 PM – 05:45 PM (30-45 mins)">Evening: 05:00 PM – 05:45 PM (30–45 mins)</option>
                    <option value="Evening: 06:00 PM – 06:45 PM (30-45 mins)">Evening: 06:00 PM – 06:45 PM (30–45 mins)</option>
                    <option value="Late Evening: 07:00 PM – 07:45 PM (30-45 mins)">Late Evening: 07:00 PM – 07:45 PM (30–45 mins)</option>
                  </select>
                </div>
              </div>

              {/* Message (Optional) */}
              <div>
                <label htmlFor="appt-message" className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                  Brief Details / Symptoms <span className="text-[10px] text-[#26384A]/40 lowercase">(optional)</span>
                </label>
                <textarea
                  id="appt-message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Share any key symptoms or questions in advance..."
                  className="w-full px-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] placeholder-[#26384A]/40 focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                />
              </div>

              {/* Privacy assurance */}
              <div className="flex items-center gap-2 text-xs text-[#26384A]/70 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
                <span>
                  100% Confidential. Your data is protected and handled strictly by licensed medical staff.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full bg-[#2878B9] hover:bg-[#1f5f93] text-white font-semibold text-base shadow-soft hover:shadow-card-hover transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Confirming Appointment...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm Appointment Booking</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Direct Contact Details & Steps */}
          <div className="lg:col-span-5 space-y-6 min-w-0 w-full">
            {/* Quick Contact Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#D9EAF5] shadow-soft space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-[#087F8C] uppercase block mb-1">
                  Immediate Assistance
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#123B66]">
                  Need Help Today?
                </h3>
                <p className="text-xs sm:text-sm text-[#26384A]/70 mt-1">
                  Call our clinic reception directly for priority scheduling or general enquiries.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <a
                  href={`tel:+91${CLINIC_INFO.phone}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#EAF5FC] hover:bg-[#d8ecf8] transition-colors border border-[#D9EAF5]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#2878B9] text-white flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#2878B9] uppercase">Direct Phone Line</div>
                    <div className="text-sm font-bold text-[#123B66]">{CLINIC_INFO.phone}</div>
                  </div>
                </a>

                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#E9F6F3] hover:bg-[#d0f0eb] transition-colors border border-[#B8E3DF]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#087F8C] text-white flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#087F8C] uppercase">WhatsApp Helpdesk</div>
                    <div className="text-sm font-bold text-[#123B66]">Chat with V-KARE Team</div>
                  </div>
                </a>

                <a
                  href={`mailto:${CLINIC_INFO.email}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#EAF5FC]/70 hover:bg-[#EAF5FC] transition-colors border border-[#D9EAF5]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#123B66] text-white flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#2878B9] uppercase">Email Reception</div>
                    <div className="text-sm font-bold text-[#123B66] break-all">{CLINIC_INFO.email}</div>
                  </div>
                </a>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#EAF5FC]/40 border border-[#D9EAF5]">
                  <div className="w-10 h-10 rounded-xl bg-[#D9EAF5] text-[#123B66] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#123B66] uppercase">Working Hours</div>
                    <div className="text-xs font-semibold text-[#26384A]">{CLINIC_INFO.workingHours}</div>
                    <div className="text-[11px] text-[#26384A]/60 mt-0.5">{CLINIC_INFO.sundayStatus}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#EAF5FC]/40 border border-[#D9EAF5]">
                  <div className="w-10 h-10 rounded-xl bg-[#D9EAF5] text-[#123B66] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#123B66] uppercase">Clinic Location</div>
                    <div className="text-xs font-medium text-[#26384A] leading-snug">
                      {CLINIC_INFO.address}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Guide */}
            <div className="bg-[#E9F6F3] rounded-3xl p-5 sm:p-7 border border-[#B8E3DF] space-y-3">
              <h3 className="font-serif font-bold text-base text-[#123B66]">
                How Booking Works
              </h3>
              <ul className="space-y-2.5 text-xs text-[#26384A]/80">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
                  <span>Submit the simple form with preferred date and doctor.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
                  <span>Receive an instant booking reference code on screen.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
                  <span>Clinic desk confirms your 30–45 min time slot via WhatsApp / SMS from +91 8317399068.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
