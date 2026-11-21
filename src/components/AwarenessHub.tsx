import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  BookOpen,
  Clock,
  ExternalLink,
  Heart,
  Camera,
  Image,
  Sparkles,
  Instagram,
} from "lucide-react";
import { useDynamicData } from "../hooks/useDynamicData";
import { AwarenessVideo, AwarenessBlog } from "../types";
import { CLINIC_INFO } from "../data/clinicData";

const instagramPosts = [
  { gradient: "from-[#123B66] to-[#087F8C]", icon: Heart },
  { gradient: "from-[#087F8C] to-[#2878B9]", icon: Sparkles },
  { gradient: "from-[#2878B9] to-[#123B66]", icon: Camera },
  { gradient: "from-pink-600 to-[#087F8C]", icon: Image },
  { gradient: "from-[#087F8C] to-teal-500", icon: Heart },
  { gradient: "from-[#2878B9] to-blue-600", icon: Sparkles },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

const VideoCard: React.FC<AwarenessVideo> = ({
  title,
  duration,
  gradient,
  tag,
  videoUrl,
  thumbnail,
}) => (
  <motion.div
    whileHover={{ y: -5, transition: { duration: 0.22 } }}
    className="group rounded-3xl overflow-hidden bg-white border border-[#D9EAF5] shadow-soft hover:shadow-card-hover transition-all duration-300"
  >
    {/* Banner with play button overlay */}
    <div
      className={`relative h-44 ${
        thumbnail ? "bg-slate-900" : `bg-gradient-to-br ${gradient || "from-[#123B66] to-[#087F8C]"}`
      } flex items-center justify-center overflow-hidden`}
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
      )}
      {/* Play button */}
      <a
        href={videoUrl || CLINIC_INFO.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform duration-300 shadow-md relative z-10 cursor-pointer"
        title="Watch Video on Instagram"
      >
        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
      </a>
      {/* Duration badge */}
      <span className="absolute bottom-3 right-3 text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full flex items-center gap-1 z-10">
        <Clock className="w-2.5 h-2.5" />
        {duration}
      </span>
      {/* Tag badge */}
      <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full z-10">
        {tag}
      </span>
    </div>

    {/* Card body */}
    <div className="p-5">
      <h4 className="text-sm font-bold text-[#123B66] leading-snug mb-3 group-hover:text-[#2878B9] transition-colors duration-200">
        {title}
      </h4>
      <a
        href={videoUrl || CLINIC_INFO.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087F8C] hover:text-[#2878B9] transition-colors duration-200"
      >
        <Instagram className="w-3.5 h-3.5" />
        <span>Watch on Instagram</span>
      </a>
    </div>
  </motion.div>
);

const BlogCard: React.FC<AwarenessBlog> = ({ title, duration, excerpt, articleUrl, thumbnail }) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.22 } }}
    className="group bg-white border border-[#D9EAF5] rounded-3xl p-5 sm:p-6 shadow-soft hover:shadow-card-hover transition-all duration-300 flex gap-4 overflow-hidden"
  >
    {thumbnail ? (
      <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-[#EAF5FC] border border-[#D9EAF5]">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
    ) : (
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#EAF5FC] flex items-center justify-center text-[#2878B9]">
        <BookOpen className="w-6 h-6" strokeWidth={1.75} />
      </div>
    )}
    <div className="flex-grow min-w-0">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-bold text-[#123B66] leading-snug group-hover:text-[#2878B9] transition-colors duration-200">
          {title}
        </h4>
        <span className="flex-shrink-0 text-[10px] font-bold text-[#087F8C] bg-[#E9F6F3] border border-[#B8E3DF] px-2.5 py-0.5 rounded-full flex items-center gap-1 mt-0.5">
          <Clock className="w-2.5 h-2.5" />
          {duration}
        </span>
      </div>
      <p className="text-xs text-[#26384A]/75 leading-relaxed mb-3 line-clamp-2">{excerpt}</p>
      <a
        href={articleUrl || "#"}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#087F8C] hover:text-[#2878B9] transition-colors"
      >
        <span>Read Article</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  </motion.div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export const AwarenessHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"videos" | "instagram">("videos");
  const { videos, blogs } = useDynamicData();

  return (
    <section
      id="awareness"
      className="py-16 sm:py-24 bg-white relative overflow-hidden scroll-mt-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-10 sm:mb-12"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#087F8C] mb-2 px-3.5 py-1 rounded-full bg-[#E9F6F3] border border-[#B8E3DF]">
            Psychoeducation & Digital Hub
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.6rem] font-serif font-bold text-[#123B66] leading-tight">
            Mental Health Awareness Hub
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#26384A]/75 max-w-xl mx-auto font-normal leading-relaxed">
            Accessible, evidence-based mental wellness videos, clinical guides, and Instagram reels curated by our specialists.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-[#EAF5FC] rounded-full p-1 border border-[#D9EAF5] gap-1 shadow-xs">
            {(["videos", "instagram"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#123B66] text-white shadow-sm"
                    : "text-[#123B66]/70 hover:text-[#2878B9]"
                }`}
              >
                {tab === "videos" ? "Educational Videos & Blogs" : "Instagram Channel"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "videos" ? (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              {/* Video Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {videos.map((video) => (
                  <VideoCard key={video.id || video.title} {...video} />
                ))}
              </div>

              {/* Blog Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id || blog.title} {...blog} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="instagram"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              {/* Instagram Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-6 rounded-3xl bg-[#EAF5FC] border border-[#D9EAF5] mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-md flex-shrink-0 text-white">
                    <Instagram className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#123B66]">
                      @mind_and_brain_clinic
                    </h4>
                    <p className="text-xs text-[#26384A]/75">
                      Follow for clinical coping strategies, child wellness insights, and psychiatric facts.
                    </p>
                  </div>
                </div>

                <a
                  href={CLINIC_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#087F8C] hover:bg-[#066570] text-white px-6 py-3 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-105"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Visit Instagram Profile</span>
                </a>
              </div>

              {/* Instagram Post Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {instagramPosts.map((post, i) => {
                  const Icon = post.icon;
                  return (
                    <motion.a
                      key={i}
                      href={CLINIC_INFO.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                      className={`aspect-square rounded-3xl bg-gradient-to-br ${post.gradient} flex items-center justify-center cursor-pointer shadow-sm hover:shadow-card-hover transition-all overflow-hidden relative group`}
                    >
                      <Icon className="w-7 h-7 text-white/60 group-hover:text-white transition-colors" strokeWidth={1.5} />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              {/* Follow CTA */}
              <div className="text-center">
                <a
                  href={CLINIC_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Follow @mind_and_brain_clinic on Instagram</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
