import React from "react";
import { CheckCircle2, MessageSquare, Phone, X, Calendar, User, Clock, ShieldCheck, Bell } from "lucide-react";
import { AppointmentData } from "../types";
import { CLINIC_INFO } from "../data/clinicData";

interface BookingSuccessModalProps {
  data: AppointmentData | null;
  refId: string;
  patientId?: string;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  data,
  refId,
  patientId,
  onClose,
}) => {
  if (!data) return null;

  const NOTIFICATION_PHONE = CLINIC_INFO.appointmentAlertPhone || "9980999068";
  const displayPatientId = patientId || data.patientId || "VK-P001";
  const patientPhoneClean = data.phone.replace(/[^0-9]/g, "");

  const notificationMessage = encodeURIComponent(
    `🔔 *NEW APPOINTMENT BOOKING ALERT*\n\n` +
    `• *Patient ID:* ${displayPatientId}\n` +
    `• *Ref ID:* ${refId}\n` +
    `• *Status:* 🟡 Pending Confirmation\n` +
    `• *Patient:* ${data.patientName}\n` +
    `• *Phone:* ${data.phone}\n` +
    (data.email ? `• *Email:* ${data.email}\n` : "") +
    `• *Doctor:* ${data.doctor}\n` +
    `• *Department:* ${data.department}\n` +
    `• *Date:* ${data.date}\n` +
    `• *Time Slot:* ${data.timeSlot}\n` +
    `• *Mode:* ${data.consultationType}\n` +
    (data.message ? `• *Notes:* ${data.message}\n` : "") +
    `\n_Sent to V-KARE Clinic Scheduling Desk (+91 ${NOTIFICATION_PHONE})_`
  );

  const cleanSmsText = `V-KARE CLINIC ALERT: New Appointment Request. Ref: ${refId}, Patient ID: ${displayPatientId}, Patient: ${data.patientName} (${data.phone}), Doctor: ${data.doctor}, Date: ${data.date} (${data.timeSlot}), Mode: ${data.consultationType}. Notes: ${data.message || "None"}.`;
  
  const whatsappNotificationUrl = `https://api.whatsapp.com/send?phone=91${NOTIFICATION_PHONE}&text=${notificationMessage}`;
  const smsNotificationUrl = `sms:+91${NOTIFICATION_PHONE}?&body=${encodeURIComponent(cleanSmsText)}`;

  const patientConfirmSmsUrl = `sms:+91${patientPhoneClean}?&body=${encodeURIComponent(
    `V-KARE CLINIC: Dear ${data.patientName}, your appointment request (Ref: ${refId}, Patient ID: ${displayPatientId}) with ${data.doctor} on ${data.date} (${data.timeSlot}) is received and is PENDING CONFIRMATION. Clinic Desk: 9980999068.`
  )}`;

  const patientConfirmWhatsappUrl = `https://api.whatsapp.com/send?phone=91${patientPhoneClean}&text=${encodeURIComponent(
    `🏥 *V-KARE Mind & Brain Clinic, Tumkur*\n\n` +
    `Dear *${data.patientName}*,\n` +
    `Thank you for scheduling your consultation with V-KARE Clinic.\n\n` +
    `• *Patient ID:* ${displayPatientId}\n` +
    `• *Booking Reference ID:* ${refId}\n` +
    `• *Status:* 🟡 Pending Clinic Confirmation\n` +
    `• *Specialist:* ${data.doctor}\n` +
    `• *Department:* ${data.department}\n` +
    `• *Date & Slot:* ${data.date} (${data.timeSlot})\n` +
    `• *Mode:* ${data.consultationType}\n\n` +
    `Our clinic scheduling desk will confirm your appointment shortly.\n` +
    `Helpline: +91 9980999068 / 8317399068\n` +
    `Location: 3rd Cross, Siddaganga Extension, Tumkur.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#D9EAF5] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-[#EAF5FC] flex items-center justify-center text-[#123B66] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="bg-gradient-to-r from-[#123B66] to-[#087F8C] text-white p-7 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-full bg-white/15 mx-auto flex items-center justify-center text-[#B8E3DF] mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 block mb-1">
            Appointment Request Submitted (Pending Confirmation)
          </span>
          <h3 className="font-serif text-2xl font-bold">Booking Received!</h3>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-md font-mono font-bold text-[#B8E3DF]">
              Patient ID: {displayPatientId}
            </span>
            <span>•</span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded-md font-mono font-bold text-white">
              Ref: {refId}
            </span>
          </div>
        </div>

        {/* Appointment Summary */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Notification Alert Target Box */}
          <div className="p-3 bg-[#E9F6F3] border border-[#B8E3DF] rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#087F8C] text-white flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#123B66]">Desk Notification: +91 {NOTIFICATION_PHONE}</div>
                <div className="text-[#087F8C] text-[11px]">
                  Doctor & Clinic reception alert ready to dispatch
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Pending Confirmation
            </span>
          </div>

          <div className="bg-[#EAF5FC]/40 p-4 rounded-2xl border border-[#D9EAF5] space-y-2.5 text-xs text-[#26384A]/90">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9EAF5]">
              <span className="text-[#26384A]/60 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2878B9]" /> Patient Name & ID:
              </span>
              <span className="font-bold text-[#123B66]">
                {data.patientName} <span className="text-xs font-mono text-[#087F8C]">({displayPatientId})</span>
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#D9EAF5]">
              <span className="text-[#26384A]/60 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2878B9]" /> Phone Number:
              </span>
              <span className="font-semibold text-[#123B66]">{data.phone}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#D9EAF5]">
              <span className="text-[#26384A]/60 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#087F8C]" /> Doctor & Dept:
              </span>
              <span className="font-semibold text-[#087F8C]">{data.doctor}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#D9EAF5]">
              <span className="text-[#26384A]/60 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#087F8C]" /> Date & Slot:
              </span>
              <span className="font-semibold text-[#123B66]">
                {data.date} ({data.timeSlot})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#26384A]/60">Consultation Mode:</span>
              <span className="font-semibold text-[#2878B9]">{data.consultationType}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#26384A]/70">
            <ShieldCheck className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
            <span>
              Your booking is received. You will receive a confirmation message from our clinic reception.
            </span>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#123B66]/60 block mb-1">
              Notify Doctor & Clinic Desk:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={whatsappNotificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebd5a] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Doctor Desk</span>
              </a>

              <a
                href={smsNotificationUrl}
                className="py-2.5 px-3 rounded-xl bg-[#123B66] hover:bg-[#0c2847] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>SMS Doctor Desk</span>
              </a>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#123B66]/60 block mt-2 mb-1">
              Send Confirmation to Patient ({data.phone}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={patientConfirmWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl border border-[#25D366] text-[#128C7E] hover:bg-[#E9F6F3] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Patient</span>
              </a>

              <a
                href={patientConfirmSmsUrl}
                className="py-2.5 px-3 rounded-xl border border-[#2878B9] text-[#2878B9] hover:bg-[#EAF5FC] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>SMS Patient</span>
              </a>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 px-5 rounded-full text-[#26384A]/60 hover:text-[#123B66] hover:bg-[#EAF5FC] text-xs font-semibold transition-colors cursor-pointer"
            >
              Done / Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
