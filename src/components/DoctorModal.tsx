import React from "react";
import { Doctor } from "../types";
import { X, Award, CheckCircle2, Calendar, Phone, Stethoscope, GraduationCap } from "lucide-react";

interface DoctorModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBook: (doctorName: string) => void;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({ doctor, onClose, onBook }) => {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E4EDE5] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#102E28] hover:bg-[#E4EDE5] transition-colors border border-[#E4EDE5]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header / Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-[#E4EDE5]/60 to-[#F7F7F1] border-b border-[#E4EDE5] flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-white flex-shrink-0 bg-white">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#315C49]/10 text-[#315C49] text-xs font-semibold mb-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>{doctor.experience}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#102E28]">
              {doctor.name}
            </h3>
            <p className="text-xs font-bold text-[#315C49] uppercase tracking-wider mt-0.5">
              {doctor.qualifications}
            </p>
            <p className="text-xs text-[#102E28]/70 mt-1">
              {doctor.title} • {doctor.department}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Clinical Bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#315C49] mb-2">
              Clinical Background
            </h4>
            <p className="text-sm text-[#102E28]/80 leading-relaxed font-normal">
              {doctor.bio}
            </p>
          </div>

          {/* Key Areas of Expertise */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#315C49] mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              <span>Specialized Clinical Expertise</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {doctor.expertise.map((exp) => (
                <div key={exp} className="flex items-start gap-2 text-xs text-[#102E28]/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#315C49] flex-shrink-0 mt-0.5" />
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials & Affiliations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#315C49] mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>Education & Hospital Practice</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#102E28]/75">
              {doctor.education.map((edu) => (
                <li key={edu} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#315C49]" />
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timing & Fee */}
          <div className="p-4 rounded-2xl bg-[#F7F7F1] border border-[#E4EDE5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-[#102E28] block">Consultation Hours:</span>
              <span className="text-[#102E28]/70">{doctor.availability}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-[#102E28] block">Fee / Session:</span>
              <span className="text-base font-bold text-[#315C49]">{doctor.consultationFee}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onBook(doctor.name);
              }}
              className="w-full sm:flex-1 py-3 px-6 rounded-full bg-[#315C49] hover:bg-[#204033] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment with {doctor.name.split(" ")[1] || doctor.name}</span>
            </button>

            {doctor.contact && (
              <a
                href={`tel:${doctor.contact}`}
                className="w-full sm:w-auto py-3 px-5 rounded-full border border-[#315C49]/30 text-[#315C49] hover:bg-[#E4EDE5]/50 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Clinic</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
