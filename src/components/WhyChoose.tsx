import React from "react";
import { WHY_CHOOSE_ITEMS } from "../data/clinicData";
import {
  HeartHandshake,
  Stethoscope,
  UserCheck,
  ShieldCheck,
  FileSpreadsheet,
  Building2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export const WhyChoose: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "HeartHandshake":
        return <HeartHandshake className="w-5 h-5 text-[#315C49]" />;
      case "Stethoscope":
        return <Stethoscope className="w-5 h-5 text-[#315C49]" />;
      case "UserCheck":
        return <UserCheck className="w-5 h-5 text-[#315C49]" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5 text-[#315C49]" />;
      case "FileSpreadsheet":
        return <FileSpreadsheet className="w-5 h-5 text-[#315C49]" />;
      case "Building2":
        return <Building2 className="w-5 h-5 text-[#315C49]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#315C49]" />;
    }
  };

  return (
    <section id="why-choose" className="py-12 sm:py-16 bg-[#F1F6F2]/70 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Standard Size */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-[11px] font-bold tracking-widest text-[#315C49] uppercase block mb-1">
            The V-KARE Standard
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#102E28] tracking-tight mb-2">
            Why Choose V-KARE?
          </h2>
          <p className="text-xs sm:text-sm text-[#102E28]/70 leading-relaxed">
            Rigorous clinical science blended with deep empathy to deliver dignified, patient-first mental and developmental healthcare in Tumkur.
          </p>
        </div>

        {/* 6 Grid Cards: Standardized Compact Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_CHOOSE_ITEMS.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-[#E4EDE5] shadow-xs hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E4EDE5] flex items-center justify-center mb-3 group-hover:bg-[#315C49]/15 transition-colors">
                {getIcon(item.iconName)}
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#102E28] mb-1.5 group-hover:text-[#315C49] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-[#102E28]/70 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
