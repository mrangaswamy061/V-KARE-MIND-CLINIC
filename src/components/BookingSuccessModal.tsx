import React from "react";
import { CheckCircle2, MessageSquare, Phone, X, Calendar, User, Clock, ShieldCheck, Bell } from "lucide-react";
import { AppointmentData } from "../types";
import { CLINIC_INFO } from "../data/clinicData";

interface BookingSuccessModalProps {
  data: AppointmentData | null;
  refId: string;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  data,
  refId,
  onClose,
}) => {
  if (!data) return null;

  const NOTIFICATION_PHONE = CLINIC_INFO.appointmentAlertPhone || "9980999068";

  const notificationMessage = encodeURIComponent(
    `🔔 *NEW APPOINTMENT BOOKING ALERT*\n\n` +
    `• *Ref ID:* ${refId}\n` +
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

  const whatsappNotificationUrl = `https://api.whatsapp.com/send?phone=91${NOTIFICATION_PHONE}&text=${notificationMessage}`;
  const smsNotificationUrl = `sms:+91${NOTIFICATION_PHONE}?body=${notificationMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D9EAF5] relative">
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
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B8E3DF] block mb-1">
            Appointment Request Confirmed
          </span>
          <h3 className="font-serif text-2xl font-bold">Booking Submitted!</h3>
          <p className="text-xs text-white/85 mt-1 max-w-xs mx-auto">
            Reference ID: <span className="font-mono font-bold text-[#B8E3DF] text-sm">{refId}</span>
          </p>
        </div>

        {/* Appointment Summary */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Notification Alert Target Box */}
          <div className="p-3 bg-[#E9F6F3] border border-[#B8E3DF] rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#087F8C] text-white flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-[#123B66]">Desk Notification: +91 {NOTIFICATION_PHONE}</div>
              <div className="text-[#087F8C] text-[11px]">
                Ready to dispatch booking alert to V-KARE clinic reception
              </div>
            </div>
          </div>

          <div className="bg-[#EAF5FC]/40 p-4 rounded-2xl border border-[#D9EAF5] space-y-2.5 text-xs text-[#26384A]/90">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9EAF5]">
              <span className="text-[#26384A]/60 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2878B9]" /> Patient Name:
              </span>
              <span className="font-bold text-[#123B66]">{data.patientName}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#D9EAF5]">
              <span className="text-[#26384A]/60 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2878B9]" /> Phone Number:
              </span>
              <span className="font-semibold text-[#123B66]">{data.phone}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#D9EAF5]">
              <span className="text-[#26384A]/60 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#087F8C]" /> Doctor:
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
              Your health information is strictly confidential and protected by healthcare privacy protocols.
            </span>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-2">
            <a
              href={whatsappNotificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-5 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send WhatsApp Notification to 9980999068</span>
            </a>

            <a
              href={smsNotificationUrl}
              className="w-full py-2.5 px-5 rounded-full border border-[#087F8C]/40 text-[#087F8C] hover:bg-[#E9F6F3] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Send SMS Notification to 9980999068</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-5 rounded-full text-[#26384A]/60 hover:text-[#123B66] hover:bg-[#EAF5FC] text-xs transition-colors cursor-pointer"
            >
              Done / Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
