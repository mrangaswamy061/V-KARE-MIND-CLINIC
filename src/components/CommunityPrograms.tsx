import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useDynamicData } from "../hooks/useDynamicData";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export const CommunityPrograms: React.FC = () => {
  const { programs } = useDynamicData();

  return (
    <section
      id="community"
      className="py-20 md:py-28 bg-[#102E28] relative overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #315C49 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3B6E58 0%, transparent 50%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-700/30">
            Outreach & Impact
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.6rem] font-serif font-bold text-white leading-tight">
            Community Programs
          </h2>
          <p className="mt-3 text-base text-emerald-200/70 max-w-xl mx-auto font-medium">
            Mental Health Awareness for Everyone
          </p>
          <div className="mt-5 w-14 h-0.5 bg-emerald-500/50 mx-auto rounded-full" />
        </motion.div>

        {/* Program Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {programs.map((program) => {
            return (
              <motion.div
                key={program.id || program.title}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 cursor-default"
              >
                {/* Photo Header (if photo is available) */}
                {program.image ? (
                  <div className="h-40 w-full relative overflow-hidden bg-emerald-950/40">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {program.tag && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold text-emerald-300 bg-[#102E28]/85 backdrop-blur-sm px-2.5 py-1 rounded-full border border-emerald-500/30">
                        {program.tag}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-6 pb-0 flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: program.color || "#315C49" }}
                    >
                      <Sparkles className="w-6 h-6 text-white" strokeWidth={1.75} />
                    </div>
                    {program.tag && (
                      <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-900/50 border border-emerald-700/30 px-2.5 py-0.5 rounded-full">
                        {program.tag}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-emerald-200 transition-colors duration-200">
                    {program.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-emerald-100/65 leading-relaxed flex-grow mb-5">
                    {program.description}
                  </p>

                  {/* CTA Button */}
                  <a
                    href={program.buttonLink || "#contact"}
                    onClick={(e) => {
                      if (!program.buttonLink || program.buttonLink.startsWith("#")) {
                        e.preventDefault();
                        const targetId = (program.buttonLink || "#contact").replace("#", "");
                        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-white transition-colors duration-200 group/btn mt-auto"
                  >
                    <span>{program.buttonLabel || "Learn More"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 bg-gradient-to-r from-[#315C49] to-[#3B6E58] rounded-2xl px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg"
        >
          <div>
            <p className="text-white font-bold text-lg leading-tight">
              Want to partner with us or volunteer?
            </p>
            <p className="text-emerald-200/70 text-sm mt-1">
              We welcome NGOs, schools, and individuals who share our mission.
            </p>
          </div>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#315C49] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-50 transition-colors duration-200 shadow-sm cursor-pointer"
          >
            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
