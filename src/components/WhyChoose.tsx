import React from "react";
import { WHY_CHOOSE_ITEMS } from "../data/clinicData";
import {
  HeartHandshake,
  Stethoscope,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export const WhyChoose: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "HeartHandshake":
        return <HeartHandshake className="w-6 h-6 text-[#087F8C]" />;
      case "Stethoscope":
        return <Stethoscope className="w-6 h-6 text-[#2878B9]" />;
      case "UserCheck":
        return <UserCheck className="w-6 h-6 text-[#2878B9]" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-[#087F8C]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#087F8C]" />;
    }
  };

  return (
    <section id="why-choose" className="py-16 sm:py-24 bg-[#EAF5FC]/50 scroll-mt-20 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <span className="text-xs font-bold tracking-widest text-[#087F8C] uppercase block mb-1.5">
            The V-KARE Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#123B66] tracking-tight mb-3">
            Why Choose V-KARE?
          </h2>
          <p className="text-xs sm:text-sm text-[#26384A]/75 leading-relaxed">
            Rigorous clinical science blended with deep empathy to deliver dignified, patient-first mental and developmental healthcare in Tumkur.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE_ITEMS.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D9EAF5] shadow-soft hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF5FC] border border-[#D9EAF5] flex items-center justify-center mb-5 group-hover:bg-[#E9F6F3] group-hover:border-[#B8E3DF] transition-colors">
                  {getIcon(item.iconName)}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#123B66] mb-2.5 group-hover:text-[#2878B9] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-[#26384A]/75 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#D9EAF5]/60 flex items-center gap-1.5 text-[11px] font-semibold text-[#087F8C]">
                <span>Gold Standard Protocol</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
