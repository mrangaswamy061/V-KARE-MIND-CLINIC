import React from "react";
import { ArrowRight, ShieldCheck, HeartHandshake, UserCheck, Sparkles, CheckCircle2, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { CLINIC_INFO } from "../data/clinicData";

interface HeroProps {
  onBookClick: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onExploreServices }) => {
  return (
    <section
      id="home"
      className="relative pt-24 pb-20 sm:pt-28 md:pt-36 md:pb-24 overflow-x-clip bg-gradient-to-b from-[#EAF5FC] via-[#F4F9FD] to-white scroll-mt-20"
    >
      {/* Decorative soft teal & ice blue ambient blurs */}
      <div className="absolute top-10 right-0 w-[420px] h-[420px] bg-[#B8E3DF]/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-[360px] h-[360px] bg-[#EAF5FC] rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN: Main Text & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Announcement badge */}
            <div className="inline-flex items-center gap-2 bg-white text-[#087F8C] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold w-fit mb-5 border border-[#B8E3DF] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#2878B9]" />
              <span>Compassionate, Multidisciplinary Mental Healthcare</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] xl:text-[3.75rem] leading-[1.18] tracking-tight text-[#123B66] mb-6 font-bold">
              Your Mind Matters.{" "}
              <span className="block text-[#087F8C] font-normal italic mt-1">
                Your Wellbeing Comes First.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-[#26384A]/85 leading-relaxed max-w-2xl mb-8 font-normal">
              At <strong>V-KARE Mind and Brain Clinic</strong>, we believe mental health deserves
              deep understanding, scientific expertise, and genuine compassion. Our board-certified
              psychiatrists and clinical psychologists provide comprehensive, confidential care tailored
              to help you and your family thrive.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3.5 mb-8">
              {/* Primary Book Appointment */}
              <button
                type="button"
                onClick={onBookClick}
                className="inline-flex items-center justify-center gap-2.5 bg-[#2878B9] hover:bg-[#1f5f93] text-white px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold shadow-soft hover:shadow-card-hover transition-all duration-200 group cursor-pointer active:scale-[0.98]"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              {/* Secondary Explore Services */}
              <button
                type="button"
                onClick={onExploreServices}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#EAF5FC] text-[#123B66] px-6 py-3.5 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 border border-[#D9EAF5] shadow-xs cursor-pointer"
              >
                <span>Explore Services</span>
              </button>

              {/* Instagram CTA Button */}
              <a
                href={CLINIC_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#E9F6F3] hover:bg-[#B8E3DF]/60 text-[#087F8C] px-5 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 border border-[#B8E3DF] shadow-xs group"
                title="Follow V-KARE on Instagram"
              >
                <Instagram className="w-4 h-4 text-[#087F8C] group-hover:scale-110 transition-transform" />
                <span>Follow on Instagram</span>
              </a>
            </div>

            {/* Three Trust Indicators */}
            <div className="pt-6 border-t border-[#D9EAF5] grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EAF5FC] flex items-center justify-center text-[#2878B9] flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#123B66]">
                  100% Confidential
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E9F6F3] flex items-center justify-center text-[#087F8C] flex-shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#123B66]">
                  Compassionate Care
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EAF5FC] flex items-center justify-center text-[#2878B9] flex-shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#123B66]">
                  Dedicated 30–45m Sessions
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Professional Photography with Modern Soft Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.15 }}
            className="lg:col-span-5 relative pb-8 lg:pb-0"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Photo Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5] bg-[#EAF5FC]">
                <img
                  src="/hero_clinic_interior.jpg"
                  alt="V-KARE Mind & Brain Clinic peaceful modern consultation interior"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123B66]/50 via-transparent to-transparent pointer-events-none" />

                {/* Subtitle status badge */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-[#123B66] shadow-md flex items-center gap-2 border border-[#D9EAF5]">
                  <span className="w-2 h-2 rounded-full bg-[#087F8C] animate-pulse" />
                  <span>Tumkur Clinic • Open</span>
                </div>
              </div>

              {/* Floating information card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="relative -mt-8 mx-3 sm:mx-0 sm:absolute sm:-bottom-6 sm:-left-6 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-float border border-[#D9EAF5] sm:max-w-[300px]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E9F6F3] flex items-center justify-center text-[#087F8C] flex-shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-[#087F8C]" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-base text-[#123B66] leading-tight">
                      Patient-Centred Care
                    </h2>
                    <p className="text-xs text-[#087F8C] font-semibold mt-0.5">
                      Doctor-Led & Holistic
                    </p>
                    <p className="text-[11px] text-[#26384A]/70 mt-1 leading-snug">
                      Evidence-based treatment designed around your unique personal healing goals.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative accent element */}
              <div className="hidden sm:block absolute -top-4 -left-4 w-20 h-20 bg-[#B8E3DF]/50 rounded-2xl -z-10 rotate-6" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
