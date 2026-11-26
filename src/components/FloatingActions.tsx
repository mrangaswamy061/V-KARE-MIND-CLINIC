import React from "react";
import { Phone, MessageSquare, Instagram } from "lucide-react";
import { CLINIC_INFO } from "../data/clinicData";

export const FloatingActions: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5 sm:gap-3">
      {/* Instagram CTA button */}
      <a
        href={CLINIC_INFO.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow V-KARE on Instagram"
        className="flex items-center gap-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white p-2.5 sm:px-4 sm:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
        title="Follow on Instagram @mind_and_brain_clinic"
      >
        <Instagram className="w-5 h-5" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide">
          Instagram
        </span>
      </a>

      {/* Call button */}
      <a
        href={`tel:+91${CLINIC_INFO.phone}`}
        aria-label="Call V-KARE Clinic"
        className="flex items-center gap-2 bg-[#123B66] hover:bg-[#0c2744] text-white p-2.5 sm:px-4 sm:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
        title="Call V-KARE Clinic"
      >
        <Phone className="w-5 h-5 text-[#B8E3DF]" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide">
          Call Clinic
        </span>
      </a>

      {/* WhatsApp button */}
      <a
        href={CLINIC_INFO.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp V-KARE Clinic"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
        title="WhatsApp V-KARE Clinic"
      >
        <MessageSquare className="w-5 h-5 fill-white" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide">
          WhatsApp Us
        </span>
      </a>
    </div>
  );
};
