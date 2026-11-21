import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDynamicData } from "../hooks/useDynamicData";
import { Service } from "../types";
import {
  Brain,
  HeartPulse,
  Baby,
  MessageSquare,
  Activity,
  Moon,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ServicesProps {
  onSelectService: (service: Service) => void;
  onBookService: (serviceName: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Services" },
  { id: "psychology", label: "Psychological & Counselling" },
  { id: "psychiatry", label: "Psychiatry & Medical" },
  { id: "child", label: "Child & Adolescent" },
];

const AUTO_SLIDE_MS = 4500;

const ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain className="w-10 h-10 text-[#087F8C]" />,
  HeartPulse: <HeartPulse className="w-10 h-10 text-[#2878B9]" />,
  Baby: <Baby className="w-10 h-10 text-[#087F8C]" />,
  MessageSquare: <MessageSquare className="w-10 h-10 text-[#2878B9]" />,
  Activity: <Activity className="w-10 h-10 text-[#2878B9]" />,
  Moon: <Moon className="w-10 h-10 text-[#087F8C]" />,
  Sparkles: <Sparkles className="w-10 h-10 text-[#087F8C]" />,
};

function getIcon(iconName: string) {
  return ICON_MAP[iconName] ?? <Sparkles className="w-10 h-10 text-[#087F8C]" />;
}

const CATEGORY_LABEL: Record<string, string> = {
  psychiatry: "Psychiatry & Mood",
  psychology: "Psychology & Therapy",
  child: "Child & Adolescent",
  speech: "Speech & Hearing",
  orthopedics: "Pediatric Orthopedics",
};

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export const Services: React.FC<ServicesProps> = ({ onSelectService, onBookService }) => {
  const { services } = useDynamicData();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.category === activeCategory);

  const total = filteredServices.length;

  const goTo = useCallback(
    (index: number, dir: number) => {
      setDirection(dir);
      setCurrentIndex(((index % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => {
    goTo(currentIndex + 1, 1);
  }, [currentIndex, goTo]);

  const prev = useCallback(() => {
    goTo(currentIndex - 1, -1);
  }, [currentIndex, goTo]);

  // Reset index when category changes
  useEffect(() => {
    setDirection(1);
    setCurrentIndex(0);
  }, [activeCategory]);

  // Auto-slide
  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % total);
    }, AUTO_SLIDE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, total, activeCategory]);

  const service = filteredServices[currentIndex] ?? filteredServices[0];
  if (!service) return null;

  return (
    <section id="services" className="py-16 sm:py-24 bg-[#E9F6F3]/50 scroll-mt-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs font-bold tracking-widest text-[#087F8C] uppercase block mb-1.5">
            Compassionate Clinical Care
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#123B66] tracking-tight mb-3">
            Our Clinical Services
          </h2>
          <p className="text-xs sm:text-sm text-[#26384A]/75 leading-relaxed">
            Evidence-based psychology, psychiatric diagnostics, and therapy delivered with patience, dignity, and scientific precision.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 mb-10 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#123B66] text-white shadow-sm"
                  : "bg-white text-[#123B66]/80 hover:bg-[#EAF5FC] hover:text-[#123B66] border border-[#D9EAF5]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Carousel Area */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Arrow — Left */}
          <button
            onClick={prev}
            aria-label="Previous service"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-6 z-10 w-11 h-11 rounded-full bg-white border border-[#D9EAF5] shadow-md flex items-center justify-center text-[#123B66] hover:bg-[#2878B9] hover:text-white transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Arrow — Right */}
          <button
            onClick={next}
            aria-label="Next service"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-6 z-10 w-11 h-11 rounded-full bg-white border border-[#D9EAF5] shadow-md flex items-center justify-center text-[#123B66] hover:bg-[#2878B9] hover:text-white transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Container */}
          <div className="overflow-hidden rounded-3xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={service.id + "-" + currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38 }}
                className="bg-white rounded-3xl border border-[#D9EAF5] shadow-card-hover overflow-hidden"
              >
                {/* Card Top Banner: Navy & Teal Accent */}
                <div className="bg-gradient-to-r from-[#123B66] to-[#087F8C] px-7 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Icon Card */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center border border-[#B8E3DF]/50">
                    <div className="[&_svg]:w-10 [&_svg]:h-10">
                      {getIcon(service.iconName)}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <span className="inline-block text-[10px] font-bold tracking-widest text-[#B8E3DF] uppercase mb-1.5">
                      {CATEGORY_LABEL[service.category] ?? service.category}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight mb-2.5">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl">
                      {service.shortDesc}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-7 py-7 sm:px-10 bg-white">
                  {/* Highlights Badges */}
                  {service.highlights && service.highlights.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold tracking-widest text-[#087F8C] uppercase mb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#087F8C]" />
                        <span>Clinical Highlights</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {service.highlights.map((hl) => (
                          <span
                            key={hl}
                            className="text-xs font-semibold bg-[#EAF5FC] text-[#123B66] px-3.5 py-1 rounded-full border border-[#D9EAF5]"
                          >
                            {hl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Symptoms / When to Seek Help */}
                  {service.symptoms && service.symptoms.length > 0 && (
                    <div className="mb-7 pb-6 border-b border-[#D9EAF5]">
                      <p className="text-[10px] font-bold tracking-widest text-[#123B66] uppercase mb-2">
                        Common Indicators Addressed:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#26384A]/80">
                        {service.symptoms.slice(0, 4).map((sym) => (
                          <li key={sym} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#087F8C] flex-shrink-0" />
                            <span>{sym}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => onSelectService(service)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#087F8C] text-[#087F8C] text-xs font-semibold hover:bg-[#E9F6F3] transition-all duration-200 cursor-pointer"
                    >
                      <span>Explore Overview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onBookService(service.title)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-full bg-[#2878B9] hover:bg-[#1f5f93] text-white text-xs font-semibold transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      <span>Book Consultation</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {filteredServices.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => goTo(idx, idx > currentIndex ? 1 : -1)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? "w-7 h-2.5 bg-[#2878B9]"
                    : "w-2.5 h-2.5 bg-[#D9EAF5] hover:bg-[#087F8C]/40"
                }`}
              />
            ))}
          </div>

          {/* Slide counter */}
          <p className="text-center text-xs text-[#26384A]/50 mt-2.5 select-none font-medium">
            Service {currentIndex + 1} of {total}
          </p>
        </div>
      </div>
    </section>
  );
};
