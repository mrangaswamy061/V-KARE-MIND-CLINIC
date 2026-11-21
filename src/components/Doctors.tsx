import React from "react";
import { useDynamicData } from "../hooks/useDynamicData";
import { Doctor } from "../types";
import { Award, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface DoctorsProps {
  onSelectDoctor: (doctor: Doctor) => void;
  onBookDoctor: (doctorName: string) => void;
}

export const Doctors: React.FC<DoctorsProps> = ({ onSelectDoctor, onBookDoctor }) => {
  const { doctors } = useDynamicData();

  return (
    <section id="doctors" className="py-16 sm:py-24 bg-white scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-bold tracking-widest text-[#087F8C] uppercase block mb-1.5">
            Clinical Specialists
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#123B66] tracking-tight mb-3">
            Our Specialist Doctors
          </h2>
          <p className="text-xs sm:text-sm text-[#26384A]/75 leading-relaxed">
            Board-certified psychiatrists, clinical psychologists, pediatric orthopedic surgeons, and speech therapists in Tumkur.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D9EAF5] shadow-soft hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Header: Photo + Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#EAF5FC] border border-[#D9EAF5] flex-shrink-0 shadow-xs relative">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      <span className="text-[10px] font-bold text-[#087F8C] bg-[#E9F6F3] border border-[#B8E3DF] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Award className="w-3 h-3 text-[#087F8C]" />
                        <span>{doc.experience.replace(" Verified Experience", "")}</span>
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#123B66] truncate leading-tight group-hover:text-[#2878B9] transition-colors">
                      {doc.name}
                    </h3>

                    <p className="text-xs font-semibold text-[#2878B9] truncate mt-0.5">
                      {doc.qualifications}
                    </p>

                    <p className="text-[11px] text-[#26384A]/60 truncate">
                      {doc.department}
                    </p>
                  </div>
                </div>

                {/* Specialization */}
                <p className="text-xs text-[#26384A]/80 line-clamp-2 leading-relaxed mb-4">
                  {doc.specialization}
                </p>

                {/* Timing Bar */}
                <div className="flex items-center gap-2 text-[11px] text-[#26384A]/70 py-2.5 border-t border-[#D9EAF5] mb-4">
                  <Clock className="w-3.5 h-3.5 text-[#087F8C] flex-shrink-0" />
                  <span className="truncate">{doc.availability}</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={() => onSelectDoctor(doc)}
                  className="flex-1 py-2.5 px-3 rounded-full border border-[#087F8C] text-[#087F8C] hover:bg-[#E9F6F3] font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  View Profile
                </button>

                <button
                  onClick={() => onBookDoctor(doc.name)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#2878B9] hover:bg-[#1f5f93] text-white font-semibold text-xs shadow-soft transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-white/90" />
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
