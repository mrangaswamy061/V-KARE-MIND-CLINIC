import React from "react";
import { useDynamicData } from "../hooks/useDynamicData";
import { Doctor } from "../types";
import { Award, Clock, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

interface DoctorsProps {
  onSelectDoctor: (doctor: Doctor) => void;
  onBookDoctor: (doctorName: string) => void;
}

export const Doctors: React.FC<DoctorsProps> = ({ onSelectDoctor, onBookDoctor }) => {
  const { doctors } = useDynamicData();

  return (
    <section id="doctors" className="py-12 sm:py-16 bg-[#F7F7F1] scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Standard Size */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-[11px] font-bold tracking-widest text-[#315C49] uppercase block mb-1">
            Clinical Specialists
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#102E28] tracking-tight mb-2">
            Our Specialist Doctors
          </h2>
          <p className="text-xs sm:text-sm text-[#102E28]/70 leading-relaxed">
            Board-certified psychiatrists, clinical psychologists, pediatric orthopedic surgeons, and speech therapists in Tumkur.
          </p>
        </div>

        {/* Doctors Grid: Standardized Compact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E4EDE5] shadow-xs hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                {/* Compact Header: Avatar + Info */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-[#E4EDE5] border border-[#E4EDE5] flex-shrink-0 shadow-xs relative">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-bold text-[#315C49] bg-[#E4EDE5]/70 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Award className="w-2.5 h-2.5" />
                        {doc.experience.replace(" Verified Experience", "")}
                      </span>
                      <span className="text-xs font-bold text-[#315C49]">
                        {doc.consultationFee}
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#102E28] truncate leading-tight group-hover:text-[#315C49] transition-colors">
                      {doc.name}
                    </h3>

                    <p className="text-[11px] font-semibold text-[#315C49] truncate mt-0.5">
                      {doc.qualifications}
                    </p>

                    <p className="text-[11px] text-[#102E28]/60 truncate">
                      {doc.department}
                    </p>
                  </div>
                </div>

                {/* Compact Specialization */}
                <p className="text-xs text-[#102E28]/75 line-clamp-2 leading-relaxed mb-3">
                  {doc.specialization}
                </p>

                {/* Timing Bar */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#102E28]/60 py-2 border-t border-[#E4EDE5]/60 mb-3">
                  <Clock className="w-3 h-3 text-[#315C49] flex-shrink-0" />
                  <span className="truncate">{doc.availability}</span>
                </div>
              </div>

              {/* Action Buttons: Standard Compact Row */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onSelectDoctor(doc)}
                  className="flex-1 py-2 px-2.5 rounded-xl border border-[#315C49]/25 text-[#102E28] hover:bg-[#E4EDE5]/50 font-medium text-xs transition-colors cursor-pointer text-center"
                >
                  View Profile
                </button>

                <button
                  onClick={() => onBookDoctor(doc.name)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#315C49] text-white hover:bg-[#204033] font-medium text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Book Visit</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
