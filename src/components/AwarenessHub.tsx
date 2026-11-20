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
} from "lucide-react";
import { useDynamicData } from "../hooks/useDynamicData";
import { AwarenessVideo, AwarenessBlog } from "../types";

const instagramPosts = [
  { gradient: "from-purple-600 to-pink-500", icon: Heart },
  { gradient: "from-pink-500 to-rose-400", icon: Sparkles },
  { gradient: "from-indigo-600 to-purple-600", icon: Camera },
  { gradient: "from-fuchsia-600 to-pink-600", icon: Image },
  { gradient: "from-purple-500 to-indigo-600", icon: Heart },
  { gradient: "from-rose-500 to-fuchsia-600", icon: Sparkles },
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
    className="group rounded-2xl overflow-hidden bg-white border border-[#E4EDE5] shadow-sm hover:shadow-md transition-all duration-300"
  >
    {/* Banner with play button overlay */}
    <div
      className={`relative h-44 ${
        thumbnail ? "bg-black/30" : `bg-gradient-to-br ${gradient || "from-teal-700 to-emerald-600"}`
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
        href={videoUrl || "https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#"}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10 cursor-pointer"
      >
        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
      </a>
      {/* Duration badge */}
      <span className="absolute bottom-3 right-3 text-[10px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
        <Clock className="w-2.5 h-2.5" />
        {duration}
      </span>
      {/* Tag badge */}
      <span className="absolute top-3 left-3 text-[10px] font-semibold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
        {tag}
      </span>
    </div>

    {/* Card body */}
    <div className="p-4">
      <h4 className="text-sm font-bold text-[#102E28] leading-snug mb-3 group-hover:text-[#315C49] transition-colors duration-200">
        {title}
      </h4>
      <a
        href={videoUrl || "https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#"}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315C49] hover:text-[#102E28] transition-colors duration-200"
      >
        <Play className="w-3 h-3 fill-current" />
        Watch Now
      </a>
    </div>
  </motion.div>
);

const BlogCard: React.FC<AwarenessBlog> = ({ title, duration, excerpt, articleUrl, thumbnail }) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.22 } }}
    className="group bg-white border border-[#E4EDE5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 overflow-hidden"
  >
    {/* Thumbnail or Book icon */}
    {thumbnail ? (
      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-[#E4EDE5] border border-[#E4EDE5]">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
    ) : (
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#E4EDE5] flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-[#315C49]" strokeWidth={1.75} />
      </div>
    )}
    <div className="flex-grow min-w-0">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-bold text-[#102E28] leading-snug group-hover:text-[#315C49] transition-colors duration-200">
          {title}
        </h4>
        <span className="flex-shrink-0 text-[10px] font-semibold text-[#315C49] bg-[#E4EDE5] px-2 py-0.5 rounded-full flex items-center gap-1 mt-0.5">
          <Clock className="w-2.5 h-2.5" />
          {duration}
        </span>
      </div>
      <p className="text-xs text-[#102E28]/60 leading-relaxed mb-2.5 line-clamp-2">{excerpt}</p>
      <a
        href={articleUrl || "#"}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#315C49] hover:text-[#102E28] transition-colors"
      >
        Read Article
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
      className="py-20 md:py-28 bg-[#F7F7F1] relative overflow-hidden"
    >
      {/* Light texture */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 90% 10%, #E4EDE5 0%, transparent 55%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#315C49] mb-3 px-3 py-1 rounded-full bg-[#E4EDE5] border border-[#315C49]/20">
            Education & Community
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.6rem] font-serif font-bold text-[#102E28] leading-tight">
            Awareness Hub
          </h2>
          <p className="mt-3 text-base text-[#315C49]/70 max-w-xl mx-auto font-medium">
            Mental Health Education &amp; Community
          </p>
          <div className="mt-5 w-14 h-0.5 bg-[#315C49]/30 mx-auto rounded-full" />
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-[#E4EDE5] rounded-full p-1 shadow-inner gap-1">
            {(["videos", "instagram"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-[#315C49] text-white shadow-sm"
                    : "text-[#102E28]/70 hover:text-[#315C49]"
                }`}
              >
                {tab === "videos" ? "Videos & Blogs" : "Instagram"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                {videos.map((video, i) => (
                  <motion.div
                    key={video.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.1 }}
                  >
                    <VideoCard {...video} />
                  </motion.div>
                ))}
              </div>

              {/* Blog Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {blogs.map((blog, i) => (
                  <motion.div
                    key={blog.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.3 + i * 0.1 }}
                  >
                    <BlogCard {...blog} />
                  </motion.div>
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
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                {/* IG Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center shadow-md flex-shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 text-white fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#102E28]">
                    @mind_and_brain_clinic
                  </p>
                  <p className="text-sm text-[#315C49]/70">
                    Follow us for daily mental health tips, awareness content &amp;
                    clinic updates
                  </p>
                </div>
              </div>

              {/* Instagram Post Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {instagramPosts.map((post, i) => {
                  const Icon = post.icon;
                  return (
                    <motion.a
                      key={i}
                      href="https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#"
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: i * 0.07 }}
                      whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}
                      className={`aspect-square rounded-2xl bg-gradient-to-br ${post.gradient} flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative group`}
                    >
                      <Icon
                        className="w-7 h-7 text-white/50 group-hover:text-white/80 transition-colors duration-200"
                        strokeWidth={1.5}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              {/* Follow CTA */}
              <div className="text-center">
                <a
                  href="https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-8 py-3.5 rounded-full text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 fill-current flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  Follow on Instagram
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
