import React from "react";
import { TESTIMONIALS } from "../data/clinicData";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-[#F7F7F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-[#315C49] uppercase block mb-2">
            Real Experiences
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102E28] tracking-tight mb-4">
            Patient Stories & Recovery
          </h2>
          <p className="text-base text-[#102E28]/75 leading-relaxed">
            Genuine testimonials from individuals and families who placed their trust
            in V-KARE’s compassionate psychiatric, therapeutic, and child care.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-7 sm:p-8 border border-[#E4EDE5] shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-[#E4EDE5] group-hover:text-[#315C49]/20 transition-colors" />
                </div>

                {/* Comment Text */}
                <p className="text-[#102E28]/80 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  “{t.comment}”
                </p>
              </div>

              {/* Patient Info Footer */}
              <div className="pt-4 border-t border-[#E4EDE5]/60 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#102E28]">
                    {t.name}
                  </h4>
                  <p className="text-xs text-[#315C49] font-medium">
                    {t.serviceReceived} • {t.location}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#315C49] bg-[#E4EDE5]/70 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#315C49]" />
                  <span>Verified</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
