import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, HeartHandshake } from "lucide-react";
import { useDynamicData } from "../hooks/useDynamicData";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const CommunityPrograms: React.FC = () => {
  const { programs } = useDynamicData();

  return (
    <section
      id="community"
      className="py-16 sm:py-24 bg-[#E9F6F3]/60 relative overflow-x-clip scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-12 sm:mb-14"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#087F8C] mb-2 px-3.5 py-1 rounded-full bg-white border border-[#B8E3DF] shadow-xs">
            Outreach & Social Impact
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.5rem] font-serif font-bold text-[#123B66] leading-tight">
            Community Mental Health Programs
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-[#26384A]/75 max-w-xl mx-auto font-normal leading-relaxed">
            Destigmatizing psychological wellness through school outreach, public seminars, de-addiction circles, and community support in Tumkur.
          </p>
        </motion.div>

        {/* Program Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {programs.map((program) => {
            return (
              <motion.div
                key={program.id || program.title}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group bg-white border border-[#D9EAF5] rounded-3xl overflow-hidden flex flex-col shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-default"
              >
                {/* Photo Header */}
                {program.image ? (
                  <div className="h-44 w-full relative overflow-hidden bg-[#EAF5FC]">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {program.tag && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold text-[#123B66] bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full border border-[#D9EAF5] shadow-sm">
                        {program.tag}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-6 pb-0 flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs"
                      style={{ backgroundColor: program.color || "#087F8C" }}
                    >
                      <Sparkles className="w-6 h-6 text-white" strokeWidth={1.75} />
                    </div>
                    {program.tag && (
                      <span className="text-[10px] font-bold text-[#087F8C] bg-[#E9F6F3] border border-[#B8E3DF] px-3 py-0.5 rounded-full">
                        {program.tag}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-base font-bold text-[#123B66] mb-2 leading-snug group-hover:text-[#2878B9] transition-colors duration-200">
                    {program.title}
                  </h3>

                  <p className="text-xs text-[#26384A]/75 leading-relaxed flex-grow mb-5">
                    {program.description}
                  </p>

                  <a
                    href={program.buttonLink || "#contact"}
                    target={program.buttonLink && /^https?:\/\//i.test(program.buttonLink) ? "_blank" : undefined}
                    rel={program.buttonLink && /^https?:\/\//i.test(program.buttonLink) ? "noopener noreferrer" : undefined}
                    onClick={(e) => {
                      const link = (program.buttonLink || "#contact").trim();
                      if (link.startsWith("#")) {
                        e.preventDefault();
                        const targetId = link.replace("#", "") || "contact";
                        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087F8C] hover:text-[#2878B9] transition-colors duration-200 group/btn mt-auto"
                  >
                    <span>{program.buttonLabel || "Learn More"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 sm:mt-14 bg-gradient-to-r from-[#123B66] to-[#087F8C] rounded-3xl px-5 py-6 sm:px-10 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 shadow-md text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 flex-shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                Partner with V-KARE for Community Wellness
              </p>
              <p className="text-[#B8E3DF] text-xs sm:text-sm mt-0.5">
                We organize mental health seminars and student counseling drives for schools, colleges, and NGOs.
              </p>
            </div>
          </div>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#123B66] hover:bg-[#EAF5FC] px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shadow-sm cursor-pointer hover:scale-105"
          >
            <span>Get in Touch</span>
            <ArrowRight className="w-4 h-4 text-[#087F8C]" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
