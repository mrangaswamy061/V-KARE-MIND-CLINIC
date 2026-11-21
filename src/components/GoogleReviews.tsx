import React from "react";
import { motion } from "framer-motion";
import { Star, ExternalLink, ShieldCheck, HeartHandshake, Award } from "lucide-react";
import { CLINIC_INFO } from "../data/clinicData";

const StarRating: React.FC<{ count?: number; size?: string }> = ({
  count = 5,
  size = "w-4 h-4",
}) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: count }).map((_, i) => (
      <Star
        key={i}
        className={`${size} fill-amber-400 text-amber-400 flex-shrink-0`}
      />
    ))}
  </div>
);

export const GoogleReviews: React.FC = () => {
  return (
    <section id="reviews" className="py-16 sm:py-20 bg-white scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-[#EAF5FC] text-[#2878B9] border border-[#D9EAF5] px-3.5 py-1 rounded-full text-xs font-semibold mb-3">
            <StarRating count={5} size="w-3.5 h-3.5" />
            <span>Official Google Reviews</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#123B66] tracking-tight mb-3">
            Real Reviews, 100% Genuine
          </h2>
          <p className="text-xs sm:text-sm text-[#26384A]/75 leading-relaxed">
            At V-KARE, we value authentic patient trust and transparency. We don't display fabricated reviews — read live, unfiltered ratings or share your own consultation experience on our official Google Business page.
          </p>
        </div>

        {/* Google Reviews Interactive Showcase Card */}
        <motion.div
          className="rounded-3xl overflow-hidden border border-[#D9EAF5] shadow-soft bg-gradient-to-br from-[#EAF5FC] via-white to-[#E9F6F3]/50 p-6 sm:p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Google Clinic Profile & Rating Info */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center flex-shrink-0 border border-[#D9EAF5] p-4">
                <svg viewBox="0 0 24 24" className="w-12 h-12" aria-label="Google">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D9EAF5] text-[#087F8C] text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#087F8C] animate-pulse" />
                  <span>Google Verified Medical Profile</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#123B66]">
                  V-KARE Mind and Brain Clinic
                </h3>
                <p className="text-xs text-[#26384A]/70 max-w-md">
                  Siddaganga Extension, Tumkur • Psychiatry, Clinical Psychology & Child Development
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
                  <StarRating count={5} size="w-4 h-4" />
                  <span className="text-sm font-bold text-[#123B66]">
                    5.0 ★ Top Rated on Google
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Direct Action CTAs */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <a
                href={CLINIC_INFO.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-[#2878B9] hover:bg-[#1f5f93] text-white px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Write a Google Review</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              <a
                href={CLINIC_INFO.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#EAF5FC] text-[#123B66] border border-[#D9EAF5] px-6 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-xs cursor-pointer"
              >
                <span>Read All Google Reviews</span>
                <ExternalLink className="w-4 h-4 text-[#2878B9]" />
              </a>
            </div>
          </div>

          {/* 3 Authentic Care Guarantees Strip */}
          <div className="mt-8 pt-8 border-t border-[#D9EAF5] grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#D9EAF5] flex items-center justify-center text-[#2878B9] flex-shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#123B66]">100% Unbiased</p>
                <p className="text-[11px] text-[#26384A]/70 mt-0.5">
                  Direct from Google Business without filtering or alterations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#D9EAF5] flex items-center justify-center text-[#087F8C] flex-shrink-0 shadow-xs">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#123B66]">Patient Privacy</p>
                <p className="text-[11px] text-[#26384A]/70 mt-0.5">
                  Share voluntary feedback under complete confidentiality.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#D9EAF5] flex items-center justify-center text-[#2878B9] flex-shrink-0 shadow-xs">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#123B66]">Clinical Quality</p>
                <p className="text-[11px] text-[#26384A]/70 mt-0.5">
                  Every feedback note is reviewed by our lead psychiatrists.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
