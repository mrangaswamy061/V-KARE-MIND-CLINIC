import React from "react";
import { Check, Heart, Shield, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const About: React.FC = () => {
  return (
    <section id="about" className="pt-12 pb-10 sm:pt-16 sm:pb-12 bg-white scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Image Column: Left side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5 order-2 lg:order-1"
          >
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <div className="rounded-3xl overflow-hidden shadow-card-hover border-4 border-white aspect-[4/3] sm:aspect-[5/4] bg-[#EAF5FC]">
                <img
                  src="/about_consultation.jpg"
                  alt="V-KARE Mind & Brain Clinic consultation space"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Philosophy Card */}
              <div className="absolute -bottom-5 -right-2 sm:-right-5 bg-white p-4 sm:p-5 rounded-2xl shadow-float border border-[#B8E3DF] max-w-[240px]">
                <div className="flex items-center gap-1.5 mb-1.5 text-[#087F8C]">
                  <Sparkles className="w-4 h-4 text-[#2878B9]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Our Clinic Motto
                  </span>
                </div>
                <p className="font-serif text-xs sm:text-sm font-bold text-[#123B66] italic">
                  “Healthy Mind • Brighter Future”
                </p>
                <span className="text-[10px] text-[#26384A]/60 block mt-1">
                  Compassionate Mental Wellness in Tumkur
                </span>
              </div>

              {/* Decorative background border */}
              <div className="hidden sm:block absolute -top-3 -left-3 w-full h-full border-2 border-[#B8E3DF] rounded-3xl -z-10" />
            </div>
          </motion.div>

          {/* Text Column: Right side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7 order-1 lg:order-2"
          >
            <span className="text-xs font-bold tracking-widest text-[#087F8C] uppercase block mb-1.5">
              About V-KARE Clinic
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-[#123B66] tracking-tight mb-4 leading-tight">
              Understanding Minds.{" "}
              <span className="text-[#087F8C] italic font-normal block sm:inline">
                Restoring Hope & Wellbeing.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#26384A]/85 leading-relaxed mb-4 font-normal">
              Located in Siddaganga Extension, Tumkur, <strong>V-KARE Mind and Brain Clinic</strong> was
              founded to deliver compassionate, scientific, and dignified mental healthcare. We unite
              experienced psychiatrists, clinical psychologists, child counselors, and speech rehabilitation
              specialists under one supportive roof.
            </p>

            <p className="text-xs sm:text-sm text-[#26384A]/75 leading-relaxed mb-7">
              Whether navigating depression, anxiety, life stressors, or supporting a child's
              developmental milestones, our multidisciplinary team crafts an unhurried, evidence-based
              pathway to lasting mental and emotional vitality.
            </p>

            {/* Core Values: Standard Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="flex items-start gap-3 bg-[#EAF5FC]/50 p-3.5 rounded-2xl border border-[#D9EAF5]">
                <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#2878B9] flex-shrink-0">
                  <Heart className="w-4 h-4 text-[#087F8C]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#123B66]">
                    Empathy & Active Listening
                  </h4>
                  <p className="text-[11px] text-[#26384A]/70 mt-0.5 leading-snug">
                    Safe, confidential sanctuary without judgment or rushed consultations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#EAF5FC]/50 p-3.5 rounded-2xl border border-[#D9EAF5]">
                <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#2878B9] flex-shrink-0">
                  <Award className="w-4 h-4 text-[#2878B9]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#123B66]">
                    Evidence-Based Science
                  </h4>
                  <p className="text-[11px] text-[#26384A]/70 mt-0.5 leading-snug">
                    Internationally recognized psychiatric and CBT therapeutic protocols.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#EAF5FC]/50 p-3.5 rounded-2xl border border-[#D9EAF5]">
                <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#087F8C] flex-shrink-0">
                  <Shield className="w-4 h-4 text-[#087F8C]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#123B66]">
                    Strict 100% Confidentiality
                  </h4>
                  <p className="text-[11px] text-[#26384A]/70 mt-0.5 leading-snug">
                    All assessments, therapy notes, and records remain strictly private.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#EAF5FC]/50 p-3.5 rounded-2xl border border-[#D9EAF5]">
                <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#2878B9] flex-shrink-0">
                  <Check className="w-4 h-4 text-[#2878B9]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#123B66]">
                    Multidisciplinary Healing
                  </h4>
                  <p className="text-[11px] text-[#26384A]/70 mt-0.5 leading-snug">
                    Psychiatry, psychology, and speech care seamlessly coordinated together.
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
