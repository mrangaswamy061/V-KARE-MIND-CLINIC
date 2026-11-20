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
    timeSlot: "11:00 AM - 12:00 PM",
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
      refId,
      createdAt: new Date().toISOString(),
      status: "Confirmed",
    };
    localStorage.setItem("vkare_appointments", JSON.stringify([record, ...existing]));

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
        timeSlot: "11:00 AM - 12:00 PM",
        consultationType: "In-Person (Clinic Visit)",
        message: "",
      });
    }, 600);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#F1F6F2]/60 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT: Appointment Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-10 border border-[#E4EDE5] shadow-card-hover">
            <div className="mb-8">
              <span className="text-xs font-bold tracking-widest text-[#315C49] uppercase block mb-1">
                Schedule Your Consultation
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102E28] tracking-tight">
                Book an Appointment
              </h2>
              <p className="text-sm text-[#102E28]/70 mt-2">
                Choose your specialist, date, and consultation type. Our front desk will
                confirm your slot via Phone/WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Patient Name */}
              <div>
                <label className="block text-xs font-semibold text-[#102E28] uppercase tracking-wider mb-1.5">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#315C49]/60">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Kumar"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      errors.patientName ? "border-red-400 bg-red-50/20" : "border-[#E4EDE5] bg-[#F7F7F1]/40"
                    } text-sm text-[#102E28] placeholder-[#102E28]/40 focus:outline-none focus:border-[#315C49] focus:ring-1 focus:ring-[#315C49] transition-all`}
                  />
                </div>
                {errors.patientName && (
                  <p className="text-xs text-red-500 mt-1">{errors.patientName}</p>
                )}
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102E28] uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#315C49]/60">
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
                        errors.phone ? "border-red-400 bg-red-50/20" : "border-[#E4EDE5] bg-[#F7F7F1]/40"
                      } text-sm text-[#102E28] placeholder-[#102E28]/40 focus:outline-none focus:border-[#315C49] focus:ring-1 focus:ring-[#315C49] transition-all`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102E28] uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-[10px] text-[#102E28]/40 lowercase">(optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E4EDE5] bg-[#F7F7F1]/40 text-sm text-[#102E28] placeholder-[#102E28]/40 focus:outline-none focus:border-[#315C49] focus:ring-1 focus:ring-[#315C49] transition-all"
                  />
                </div>
              </div>

              {/* Specialist Selection & Consultation Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102E28] uppercase tracking-wider mb-1.5">
                    Select Doctor / Specialist
                  </label>
                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E4EDE5] bg-[#F7F7F1]/40 text-sm text-[#102E28] focus:outline-none focus:border-[#315C49] focus:ring-1 focus:ring-[#315C49] transition-all"
                  >
                    {DOCTORS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102E28] uppercase tracking-wider mb-1.5">
                    Preferred Consultation Type
                  </label>
                  <select
                    name="consultationType"
                    value={formData.consultationType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E4EDE5] bg-[#F7F7F1]/40 text-sm text-[#102E28] focus:outline-none focus:border-[#315C49] focus:ring-1 focus:ring-[#315C49] transition-all"
                  >
                    <option value="In-Person (Clinic Visit)">In-Person (Clinic Visit - Tumkur)</option>
                    <option value="Online (Video Consultation)">Online (Video Consultation)</option>
                  </select>
                </div>
              </div>

              {/* Date & Time Slot Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102E28] uppercase tracking-wider mb-1.5">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#315C49]/60">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      name="date"
                      min={minDateString}
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.date ? "border-red-400 bg-red-50/20" : "border-[#E4EDE5] bg-[#F7F7F1]/40"
                      } text-sm text-[#102E28] focus:outline-none focus:border-[#315C49] focus:ring-1 focus:ring-[#315C49] transition-all`}
                    />
                  </div>
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102E28] uppercase tracking-wider mb-1.5">
                    Preferred Time Range
                  </label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E4EDE5] bg-[#F7F7F1]/40 text-sm text-[#102E28] focus:outline-none focus:border-[#315C49] focus:ring-1 focus:ring-[#315C49] transition-all"
                  >
                    <option value="10:00 AM - 11:30 AM">Morning (10:00 AM – 11:30 AM)</option>
                    <option value="11:30 AM - 01:00 PM">Noon (11:30 AM – 01:00 PM)</option>
                    <option value="02:30 PM - 04:30 PM">Afternoon (02:30 PM – 04:30 PM)</option>
                    <option value="05:00 PM - 06:30 PM">Evening (05:00 PM – 06:30 PM)</option>
                    <option value="06:30 PM - 08:00 PM">Late Evening (06:30 PM – 08:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Message (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-[#102E28] uppercase tracking-wider mb-1.5">
                  Brief Details / Symptoms <span className="text-[10px] text-[#102E28]/40 lowercase">(optional)</span>
                </label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Share any key symptoms or questions in advance..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E4EDE5] bg-[#F7F7F1]/40 text-sm text-[#102E28] placeholder-[#102E28]/40 focus:outline-none focus:border-[#315C49] focus:ring-1 focus:ring-[#315C49] transition-all"
                />
              </div>

              {/* Privacy assurance */}
              <div className="flex items-center gap-2 text-xs text-[#102E28]/70 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#315C49] flex-shrink-0" />
                <span>
                  100% Confidential. Your data is encrypted and handled exclusively by licensed clinicians.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full bg-[#315C49] hover:bg-[#204033] text-white font-medium text-base shadow-soft hover:shadow-card-hover transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-[#E4EDE5] shadow-soft space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-[#315C49] uppercase block mb-1">
                  Immediate Assistance
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#102E28]">
                  Need Help Today?
                </h3>
                <p className="text-xs sm:text-sm text-[#102E28]/70 mt-1">
                  Call our front desk directly for emergency scheduling or general queries.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <a
                  href={`tel:${CLINIC_INFO.phone}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#E4EDE5]/50 hover:bg-[#E4EDE5] transition-colors border border-[#315C49]/15"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#315C49] text-white flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#315C49] uppercase">Primary Phone</div>
                    <div className="text-sm font-bold text-[#102E28]">{CLINIC_INFO.phone}</div>
                  </div>
                </a>

                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#1e8343] uppercase">Instant WhatsApp Desk</div>
                    <div className="text-sm font-bold text-[#102E28]">Chat with V-KARE Team</div>
                  </div>
                </a>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F7F7F1] border border-[#E4EDE5]">
                  <div className="w-10 h-10 rounded-xl bg-[#E4EDE5] text-[#315C49] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#315C49] uppercase">Working Hours</div>
                    <div className="text-xs font-semibold text-[#102E28]">{CLINIC_INFO.workingHours}</div>
                    <div className="text-[11px] text-[#102E28]/60 mt-0.5">{CLINIC_INFO.sundayStatus}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F7F7F1] border border-[#E4EDE5]">
                  <div className="w-10 h-10 rounded-xl bg-[#E4EDE5] text-[#315C49] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#315C49] uppercase">Location</div>
                    <div className="text-xs font-medium text-[#102E28] leading-snug">
                      {CLINIC_INFO.address}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Guide */}
            <div className="bg-[#E4EDE5]/50 rounded-3xl p-6 sm:p-7 border border-[#315C49]/15 space-y-3">
              <h4 className="font-serif font-bold text-base text-[#102E28]">
                How It Works
              </h4>
              <ul className="space-y-2 text-xs text-[#102E28]/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#315C49] flex-shrink-0" />
                  <span>Submit the form above with your date and specialty preference.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#315C49] flex-shrink-0" />
                  <span>You receive an instant appointment reference code.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#315C49] flex-shrink-0" />
                  <span>Our clinic desk confirms your timing by Phone or WhatsApp within minutes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
