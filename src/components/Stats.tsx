import React from "react";
import { CLINIC_STATS } from "../data/clinicData";
import { motion } from "framer-motion";

export const Stats: React.FC = () => {
  return (
    <section className="relative z-10 -mt-6 sm:-mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-clip">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-[#D9EAF5] py-7 sm:py-10 px-4 sm:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 lg:divide-x divide-[#D9EAF5]">
          {CLINIC_STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`flex flex-col items-center text-center px-2 lg:px-4 ${
                idx < 2 ? "pb-4 border-b border-[#D9EAF5] lg:pb-0 lg:border-b-0" : ""
              }`}
            >
              <span className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#2878B9] tracking-tight mb-1">
                {stat.num}
              </span>
              <span className="text-xs sm:text-base font-bold text-[#123B66] tracking-tight">
                {stat.label}
              </span>
              <span className="text-[11px] sm:text-xs text-[#26384A]/70 mt-1 max-w-[200px] leading-snug">
                {stat.subtext}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
