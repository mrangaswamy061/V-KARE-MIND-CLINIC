import React, { useState, useEffect } from "react";
import { Doctor } from "../types";
import { X, Award, CheckCircle2, Calendar, Stethoscope, GraduationCap, Clock, User } from "lucide-react";

interface DoctorModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBook: (doctorName: string) => void;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({ doctor, onClose, onBook }) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [doctor?.id]);

  if (!doctor) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-modal-title"
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
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#123B66] hover:bg-[#EAF5FC] transition-colors border border-[#D9EAF5] cursor-pointer"
          aria-label="Close doctor profile modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header / Banner */}
        <div className="p-5 sm:p-8 bg-gradient-to-r from-[#EAF5FC] to-white border-b border-[#D9EAF5] flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-white flex-shrink-0 bg-[#EAF5FC] flex items-center justify-center">
            {doctor.image && !imgFailed ? (
              <img
                src={doctor.image}
                alt={doctor.name}
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <User className="w-10 h-10 text-[#2878B9]" />
            )}
          </div>

          <div className="text-center sm:text-left pr-0 sm:pr-8">
            {doctor.experience?.trim() && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9F6F3] text-[#087F8C] border border-[#B8E3DF] text-xs font-semibold mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>{doctor.experience}</span>
              </div>
            )}
            <h3 id="doctor-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#123B66]">
              {doctor.name}
            </h3>
            <p className="text-xs font-bold text-[#2878B9] uppercase tracking-wider mt-0.5">
              {doctor.qualifications}
            </p>
            <p className="text-xs text-[#26384A]/70 mt-1">
              {doctor.title} • {doctor.department}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Clinical Bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#087F8C] mb-2">
              Clinical Background
            </h4>
            <p className="text-sm text-[#26384A]/80 leading-relaxed font-normal">
              {doctor.bio}
            </p>
          </div>

          {/* Key Areas of Expertise */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#087F8C] mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-[#2878B9]" />
              <span>Specialized Clinical Expertise</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {doctor.expertise.map((exp) => (
                <div key={exp} className="flex items-start gap-2 text-xs text-[#26384A]/85">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#087F8C] flex-shrink-0 mt-0.5" />
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials & Affiliations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#087F8C] mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#2878B9]" />
              <span>Education & Hospital Practice</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#26384A]/75">
              {doctor.education.map((edu) => (
                <li key={edu} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2878B9]" />
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timing & Session Duration (Price completely removed) */}
          <div className="p-4 rounded-2xl bg-[#EAF5FC]/60 border border-[#D9EAF5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-[#123B66] block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#087F8C]" />
                <span>Consultation Hours:</span>
              </span>
              <span className="text-[#26384A]/75 mt-0.5 block">{doctor.availability}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-semibold text-[#123B66] block">Session Length:</span>
              <span className="text-xs font-semibold text-[#087F8C] bg-[#B8E3DF]/50 border border-[#B8E3DF] px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                30 – 45 mins
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onBook(doctor.name);
              }}
              className="w-full sm:flex-1 py-3 px-6 rounded-full bg-[#2878B9] hover:bg-[#1f5f93] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-soft transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment with {doctor.name.split(" ")[1] || doctor.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
