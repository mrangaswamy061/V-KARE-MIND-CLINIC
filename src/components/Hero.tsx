import React from "react";
import { ArrowRight, ShieldCheck, HeartHandshake, UserCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface HeroProps {
  onBookClick: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onExploreServices }) => {
  return (
    <section
      id="home"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F7F7F1] via-[#F3F8F4] to-[#E4EDE5]/40"
    >
      {/* Subtle organic background decoration */}
      <div className="absolute top-12 right-0 w-96 h-96 bg-[#E4EDE5]/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#C6B89F]/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Small announcement badge */}
            <div className="inline-flex items-center gap-2 bg-[#E4EDE5] text-[#315C49] px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium w-fit mb-6 border border-[#315C49]/15 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#315C49]" />
              <span>Compassionate Mental Healthcare</span>
            </div>

            {/* Main heading in large elegant serif typography */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.85rem] leading-[1.15] tracking-tight text-[#102E28] mb-6 font-semibold">
              Your Mental Wellness Matters.{" "}
              <span className="italic font-normal text-[#315C49] block mt-1 sm:inline">
                A Better Tomorrow Begins Today.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#102E28]/80 leading-relaxed max-w-2xl mb-8 font-normal">
              At V-KARE Mind and Brain Clinic, we believe mental health deserves
              understanding, compassion and professional care. Our team provides
              personalized mental healthcare to help individuals navigate life’s
              challenges and improve their well-being.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              {/* 1. Primary Book Appointment button */}
              <button
                onClick={onBookClick}
                className="inline-flex items-center justify-center gap-3 bg-[#315C49] hover:bg-[#204033] text-white px-7 py-3.5 rounded-full text-base font-medium shadow-soft hover:shadow-card-hover transition-all duration-300 group cursor-pointer active:scale-[0.98]"
              >
                <span>Book an Appointment</span>
                <ArrowRight className="w-4 h-4 text-emerald-200 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {/* 2. Secondary Explore Our Services button */}
              <button
                onClick={onExploreServices}
                className="inline-flex items-center justify-center gap-2 bg-[#E4EDE5] hover:bg-[#d8e5d9] text-[#102E28] px-7 py-3.5 rounded-full text-base font-medium transition-all duration-300 border border-[#315C49]/20 cursor-pointer"
              >
                <span>Explore Our Services</span>
              </button>
            </div>

            {/* Three small trust indicators */}
            <div className="pt-6 border-t border-[#315C49]/15 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#E4EDE5] flex items-center justify-center text-[#315C49] flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#102E28]/90">
                  Professional Care
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#E4EDE5] flex items-center justify-center text-[#315C49] flex-shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#102E28]/90">
                  Confidential Support
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#E4EDE5] flex items-center justify-center text-[#315C49] flex-shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#102E28]/90">
                  Personalized Attention
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Large realistic photograph with rounded corners and subtle shadow */}
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5] object-cover bg-[#E4EDE5]">
                <img
                  src="/hero_clinic_interior.jpg"
                  alt="V-KARE Mind & Brain Clinic peaceful modern interior"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />
                {/* Soft gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Subtitle location badge pinned at top right */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-[#102E28] shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#315C49] animate-pulse" />
                  <span>Tumkur Clinic • Open</span>
                </div>
              </div>

              {/* Floating information card over the image */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-6 left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-float border border-[#E4EDE5] max-w-[260px] sm:max-w-[290px]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E4EDE5] flex items-center justify-center text-[#315C49] flex-shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-[#315C49]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#102E28] leading-tight">
                      Personalized Care
                    </h4>
                    <p className="text-xs text-[#315C49] font-medium mt-0.5">
                      Support for Your Well-being
                    </p>
                    <p className="text-[11px] text-[#102E28]/70 mt-1 leading-snug">
                      Evidence-based treatment designed around your unique life goals.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative accent element */}
              <div className="hidden sm:block absolute -top-4 -left-4 w-20 h-20 bg-[#315C49]/10 rounded-2xl -z-10 rotate-6" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
