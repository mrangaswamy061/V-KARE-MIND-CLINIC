import React from "react";
import { Check, Heart, Shield, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const About: React.FC = () => {
  return (
    <section id="about" className="py-12 sm:py-16 bg-[#F7F7F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Image Column: Left side */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 order-2 lg:order-1"
          >
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <div className="rounded-2xl overflow-hidden shadow-card-hover border-3 border-white aspect-[4/3] sm:aspect-[5/4] bg-[#E4EDE5]">
                <img
                  src="/about_consultation.jpg"
                  alt="V-KARE Mind & Brain Clinic consultation space"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Philosophy Card */}
              <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-white p-3.5 sm:p-4 rounded-xl shadow-float border border-[#E4EDE5] max-w-[220px]">
                <div className="flex items-center gap-1.5 mb-1 text-[#315C49]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Clinic Motto
                  </span>
                </div>
                <p className="font-serif text-xs sm:text-sm font-semibold text-[#102E28] italic">
                  “Healthy Mind • Brighter Future”
                </p>
              </div>

              {/* Decorative background border */}
              <div className="hidden sm:block absolute -top-3 -left-3 w-full h-full border-2 border-[#315C49]/15 rounded-2xl -z-10" />
            </div>
          </motion.div>

          {/* Text Column: Right side */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 order-1 lg:order-2"
          >
            <span className="text-[11px] font-bold tracking-widest text-[#315C49] uppercase block mb-1">
              About V-KARE
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102E28] tracking-tight mb-3 leading-tight">
              Understanding Minds.{" "}
              <span className="text-[#315C49] italic font-normal">
                Supporting Lives.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#102E28]/80 leading-relaxed mb-4 font-normal">
              Located in Siddaganga Extension, Tumkur, <strong>V-KARE Mind and Brain Clinic</strong> was
              founded to deliver compassionate, scientific, and dignified mental healthcare. We unite
              experienced psychiatrists, clinical psychologists, child counselors, pediatric orthopedic
              surgeons, and speech therapists under one collaborative roof.
            </p>

            <p className="text-xs sm:text-sm text-[#102E28]/70 leading-relaxed mb-6">
              Whether navigating acute life stressors, clinical depression, anxiety, or supporting a child’s
              speech and motor milestones, our multidisciplinary team crafts an unhurried, evidence-based
              pathway to lasting recovery.
            </p>

            {/* Core Values: Standard Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#E4EDE5] shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[#E4EDE5] flex items-center justify-center text-[#315C49] flex-shrink-0">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#102E28]">
                    Empathy & Active Listening
                  </h4>
                  <p className="text-[11px] text-[#102E28]/65 mt-0.5 leading-snug">
                    Safe, confidential space without stigma or rushed sessions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#E4EDE5] shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[#E4EDE5] flex items-center justify-center text-[#315C49] flex-shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#102E28]">
                    Evidence-Based Science
                  </h4>
                  <p className="text-[11px] text-[#102E28]/65 mt-0.5 leading-snug">
                    Internationally recognized psychiatric and therapeutic protocols.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#E4EDE5] shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[#E4EDE5] flex items-center justify-center text-[#315C49] flex-shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#102E28]">
                    Strict 100% Confidentiality
                  </h4>
                  <p className="text-[11px] text-[#102E28]/65 mt-0.5 leading-snug">
                    All assessments, notes, and records remain strictly private.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#E4EDE5] shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[#E4EDE5] flex items-center justify-center text-[#315C49] flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#102E28]">
                    Multidisciplinary Healing
                  </h4>
                  <p className="text-[11px] text-[#102E28]/65 mt-0.5 leading-snug">
                    Psychiatry, psychology, and speech care coordinated together.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
