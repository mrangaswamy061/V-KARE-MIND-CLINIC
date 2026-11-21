import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  MessageSquare,
} from "lucide-react";
import { DOCTORS, CLINIC_INFO } from "../data/clinicData";
import { AppointmentData } from "../types";

interface AppointmentSectionProps {
  preselectedDoctor?: string;
  preselectedService?: string;
  onSuccess: (data: AppointmentData, refId: string) => void;
}

export const AppointmentSection: React.FC<AppointmentSectionProps> = ({
  preselectedDoctor,
  preselectedService,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<AppointmentData>({
    patientName: "",
    phone: "",
    email: "",
    department: "Psychiatry & Neuropsychiatry",
    doctor: preselectedDoctor || "Dr. Keerthi Sundar",
    date: "",
    timeSlot: "Morning: 10:00 AM – 10:45 AM (30-45 mins)",
    consultationType: "In-Person (Clinic Visit)",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (preselectedDoctor) {
      setFormData((prev) => ({
        ...prev,
        doctor: preselectedDoctor,
      }));
    }
  }, [preselectedDoctor]);

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

    // Generate unique clinical appointment reference
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const refId = `VK-${new Date().getFullYear()}-${randomDigits}`;

    // Store in localStorage for audit & patient record persistence
    const existing = JSON.parse(localStorage.getItem("vkare_appointments") || "[]");
    const record = {
      ...formData,
      id: refId,
      refId,
      createdAt: new Date().toISOString(),
      status: "Confirmed",
    };
    const updatedApts = [record, ...existing];
    localStorage.setItem("vkare_appointments", JSON.stringify(updatedApts));

    // Also register patient into vkare_registered_patients
    try {
      const regRaw = localStorage.getItem("vkare_registered_patients");
      const regList = regRaw ? JSON.parse(regRaw) : [];
      const cleanPhone = (formData.phone || "").trim();
      const cleanName = (formData.patientName || "").trim();
      const existingIdx = regList.findIndex(
        (p: any) =>
          (cleanPhone && p.phone === cleanPhone) ||
          p.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (existingIdx >= 0) {
        regList[existingIdx].lastVisit = formData.date || new Date().toISOString().split("T")[0];
        regList[existingIdx].service = formData.department;
        if (formData.email) regList[existingIdx].email = formData.email;
        if (formData.message) regList[existingIdx].notes = formData.message;
      } else {
        const regNum = String(regList.length + 1).padStart(3, "0");
        regList.push({
          regId: `VK${regNum}`,
          name: cleanName,
          age: "—",
          gender: "—",
          parent: "—",
          address: "Tumkur",
          phone: cleanPhone,
          email: formData.email || "",
          service: formData.department,
          lastVisit: formData.date || new Date().toISOString().split("T")[0],
          notes: formData.message || "Online Appointment Booking",
        });
      }
      localStorage.setItem("vkare_registered_patients", JSON.stringify(regList));
    } catch {
      // ignore
    }

    // Trigger immediate reactive sync events across all open components and tabs
    window.dispatchEvent(new CustomEvent("vkare_appointment_booked", { detail: record }));
    window.dispatchEvent(new CustomEvent("vkare_appointments_updated"));
    window.dispatchEvent(new StorageEvent("storage", { key: "vkare_appointments" }));

    setTimeout(() => {
      setLoading(false);
      onSuccess(formData, refId);
      // Reset form
      setFormData({
        patientName: "",
        phone: "",
        email: "",
        department: "Psychiatry & Neuropsychiatry",
        doctor: "Dr. Keerthi Sundar",
        date: "",
        timeSlot: "Morning: 10:00 AM – 10:45 AM (30-45 mins)",
        consultationType: "In-Person (Clinic Visit)",
        message: "",
      });
    }, 600);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#EAF5FC]/50 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Appointment Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-10 border border-[#D9EAF5] shadow-card-hover">
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
            <div className="bg-gradient-to-r from-[#087F8C] to-[#2878B9] text-white p-4 sm:p-5 rounded-2xl mb-7 shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/30">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8E3DF] block">
                  Clinical Session Standard
                </span>
                <h4 className="font-serif font-bold text-base text-white">
                  Time Range: 30 – 45 Minutes per Session
                </h4>
                <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                  Every consultation is allocated an unhurried 30 to 45-minute window for thorough evaluation, compassionate discussion, and tailored therapeutic guidance.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Patient Name */}
              <div>
                <label className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2878B9]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Kumar"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      errors.patientName ? "border-red-400 bg-red-50/20" : "border-[#D9EAF5] bg-[#EAF5FC]/20"
                    } text-sm text-[#26384A] placeholder-[#26384A]/40 focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all`}
                  />
                </div>
                {errors.patientName && (
                  <p className="text-xs text-red-500 mt-1">{errors.patientName}</p>
                )}
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2878B9]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
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

                <div>
                  <label className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-[10px] text-[#26384A]/40 lowercase">(optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] placeholder-[#26384A]/40 focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                  />
                </div>
              </div>

              {/* Specialist Selection & Consultation Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Select Specialist
                  </label>
                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                  >
                    {DOCTORS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Consultation Mode
                  </label>
                  <select
                    name="consultationType"
                    value={formData.consultationType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#D9EAF5] bg-[#EAF5FC]/20 text-sm text-[#26384A] focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all"
                  >
                    <option value="In-Person (Clinic Visit)">In-Person (Clinic Visit - Tumkur)</option>
                    <option value="Online (Video Consultation)">Online (Video Consultation)</option>
                  </select>
                </div>
              </div>

              {/* Date & Time Slot Row (with 30-45 mins explicit range) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2878B9]">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      name="date"
                      min={minDateString}
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.date ? "border-red-400 bg-red-50/20" : "border-[#D9EAF5] bg-[#EAF5FC]/20"
                      } text-sm text-[#26384A] focus:outline-none focus:border-[#2878B9] focus:ring-1 focus:ring-[#2878B9] transition-all`}
                    />
                  </div>
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                    Preferred Time Slot (30–45 mins)
                  </label>
                  <select
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
                <label className="block text-xs font-semibold text-[#123B66] uppercase tracking-wider mb-1.5">
                  Brief Details / Symptoms <span className="text-[10px] text-[#26384A]/40 lowercase">(optional)</span>
                </label>
                <textarea
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
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Card */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-[#D9EAF5] shadow-soft space-y-6">
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
                  href={`tel:${CLINIC_INFO.phone}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#EAF5FC] hover:bg-[#d8ecf8] transition-colors border border-[#D9EAF5]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#2878B9] text-white flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
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
                  <div>
                    <div className="text-[11px] font-semibold text-[#087F8C] uppercase">WhatsApp Helpdesk</div>
                    <div className="text-sm font-bold text-[#123B66]">Chat with V-KARE Team</div>
                  </div>
                </a>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#EAF5FC]/40 border border-[#D9EAF5]">
                  <div className="w-10 h-10 rounded-xl bg-[#D9EAF5] text-[#123B66] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#123B66] uppercase">Working Hours</div>
                    <div className="text-xs font-semibold text-[#26384A]">{CLINIC_INFO.workingHours}</div>
                    <div className="text-[11px] text-[#26384A]/60 mt-0.5">{CLINIC_INFO.sundayStatus}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#EAF5FC]/40 border border-[#D9EAF5]">
                  <div className="w-10 h-10 rounded-xl bg-[#D9EAF5] text-[#123B66] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#123B66] uppercase">Clinic Location</div>
                    <div className="text-xs font-medium text-[#26384A] leading-snug">
                      {CLINIC_INFO.address}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Guide */}
            <div className="bg-[#E9F6F3] rounded-3xl p-6 sm:p-7 border border-[#B8E3DF] space-y-3">
              <h4 className="font-serif font-bold text-base text-[#123B66]">
                How Booking Works
              </h4>
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
                  <span>Clinic desk confirms your 30–45 min time slot via WhatsApp / SMS to +91 9980999068.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
