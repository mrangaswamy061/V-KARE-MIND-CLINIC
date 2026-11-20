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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ServicesProps {
  onSelectService: (service: Service) => void;
  onBookService: (serviceName: string) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Disciplines" },
  { id: "psychiatry", label: "Psychiatry & Mood" },
  { id: "psychology", label: "Psychotherapy" },
  { id: "child", label: "Child & Behavioral" },
  { id: "speech", label: "Speech & Hearing" },
  { id: "orthopedics", label: "Pediatric Orthopedics" },
];

const AUTO_SLIDE_MS = 4000;

const ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain className="w-10 h-10 text-[#315C49]" />,
  HeartPulse: <HeartPulse className="w-10 h-10 text-[#315C49]" />,
  Baby: <Baby className="w-10 h-10 text-[#315C49]" />,
  MessageSquare: <MessageSquare className="w-10 h-10 text-[#315C49]" />,
  Activity: <Activity className="w-10 h-10 text-[#315C49]" />,
  Moon: <Moon className="w-10 h-10 text-[#315C49]" />,
};

function getIcon(iconName: string) {
  return ICON_MAP[iconName] ?? <Sparkles className="w-10 h-10 text-[#315C49]" />;
}

const CATEGORY_LABEL: Record<string, string> = {
  psychiatry: "Psychiatry & Mood",
  psychology: "Psychotherapy",
  child: "Child & Behavioral",
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
    <section id="services" className="py-14 sm:py-20 bg-[#F1F6F2]/60 scroll-mt-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-[11px] font-bold tracking-widest text-[#315C49] uppercase block mb-1">
            Clinical Disciplines
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#102E28] tracking-tight mb-2">
            Our Specialized Services
          </h2>
          <p className="text-xs sm:text-sm text-[#102E28]/70 leading-relaxed">
            Evidence-based multidisciplinary healthcare tailored to mental wellness, child development, and physical rehabilitation.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2 mb-10 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#315C49] text-white shadow-sm"
                  : "bg-white text-[#102E28]/70 hover:bg-[#E4EDE5]/70 hover:text-[#102E28] border border-[#E4EDE5]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Arrow — Left */}
          <button
            onClick={prev}
            aria-label="Previous service"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 z-10 w-10 h-10 rounded-full bg-white border border-[#E4EDE5] shadow-md flex items-center justify-center text-[#315C49] hover:bg-[#315C49] hover:text-white transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Arrow — Right */}
          <button
            onClick={next}
            aria-label="Next service"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 z-10 w-10 h-10 rounded-full bg-white border border-[#E4EDE5] shadow-md flex items-center justify-center text-[#315C49] hover:bg-[#315C49] hover:text-white transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Area */}
          <div className="overflow-hidden rounded-3xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={service.id + "-" + currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                className="bg-white rounded-3xl border border-[#E4EDE5] shadow-lg overflow-hidden"
              >
                {/* Card Top Banner */}
                <div className="bg-gradient-to-br from-[#315C49] to-[#102E28] px-8 py-8 sm:py-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Icon circle */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner">
                    <div className="[&_svg]:text-white [&_svg]:w-9 [&_svg]:h-9">
                      {getIcon(service.iconName)}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <span className="inline-block text-[10px] font-bold tracking-widest text-white/60 uppercase mb-2">
                      {CATEGORY_LABEL[service.category] ?? service.category}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
                      {service.shortDesc}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-8 py-7 bg-[#F7F7F1]/40">
                  {/* Highlights Badges */}
                  {service.highlights && service.highlights.length > 0 && (
                    <div className="mb-7">
                      <p className="text-[10px] font-bold tracking-widest text-[#315C49] uppercase mb-3">
                        Key Highlights
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {service.highlights.map((hl) => (
                          <span
                            key={hl}
                            className="text-xs font-medium bg-[#E4EDE5] text-[#102E28] px-3 py-1 rounded-full border border-[#315C49]/15"
                          >
                            {hl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => onSelectService(service)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border-2 border-[#315C49] text-[#315C49] text-sm font-semibold hover:bg-[#315C49] hover:text-white transition-all duration-200 cursor-pointer"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onBookService(service.title)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#315C49] text-white text-sm font-semibold hover:bg-[#102E28] transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      Book Care
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
                    ? "w-6 h-2.5 bg-[#315C49]"
                    : "w-2.5 h-2.5 bg-[#315C49]/25 hover:bg-[#315C49]/50"
                }`}
              />
            ))}
          </div>

          {/* Slide counter */}
          <p className="text-center text-xs text-[#102E28]/40 mt-3 select-none">
            {currentIndex + 1} / {total}
          </p>
        </div>
      </div>
    </section>
  );
};
