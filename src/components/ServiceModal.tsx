import React from "react";
import { Service } from "../types";
import { X, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

interface ServiceModalProps {
  service: Service | null;
  onClose: () => void;
  onBook: (serviceName: string) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose, onBook }) => {
  if (!service) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D9EAF5] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#123B66] hover:bg-[#EAF5FC] transition-colors border border-[#D9EAF5] cursor-pointer"
          aria-label="Close service overview modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-5 sm:p-8 bg-gradient-to-r from-[#EAF5FC] to-white border-b border-[#D9EAF5]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#087F8C] bg-[#E9F6F3] px-3 py-1 rounded-full border border-[#B8E3DF] inline-block mb-3">
            {service.category} Discipline
          </span>
          <h3 id="service-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#123B66] pr-8">
            {service.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#26384A]/70 mt-1 max-w-xl">
            {service.shortDesc}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Detailed Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#087F8C] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#2878B9]" />
              <span>Clinical Overview</span>
            </h4>
            <p className="text-sm text-[#26384A]/80 leading-relaxed font-normal">
              {service.fullDesc}
            </p>
          </div>

          {/* When to Seek Help / Symptoms */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#087F8C] mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#2878B9]" />
              <span>Common Symptoms & Conditions Treated</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.symptoms.map((sym) => (
                <div key={sym} className="flex items-start gap-2 text-xs text-[#26384A]/85 bg-[#EAF5FC]/50 p-2.5 rounded-xl border border-[#D9EAF5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#087F8C] mt-1.5 flex-shrink-0" />
                  <span>{sym}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence-Based Therapies & Protocol */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#087F8C] mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2878B9]" />
              <span>Evidence-Based Treatment Modalities</span>
            </h4>
            <div className="space-y-2">
              {service.treatments.map((tr) => (
                <div key={tr} className="flex items-center gap-2 text-xs text-[#26384A]/85 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#087F8C] flex-shrink-0" />
                  <span>{tr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-3 border-t border-[#D9EAF5]">
            <button
              onClick={() => {
                onClose();
                onBook(service.title);
              }}
              className="w-full py-3.5 px-6 rounded-full bg-[#2878B9] hover:bg-[#1f5f93] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-soft transition-colors cursor-pointer"
            >
              <span>Book Appointment for {service.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
