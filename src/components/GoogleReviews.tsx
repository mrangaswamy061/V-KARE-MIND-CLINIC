import React from "react";
import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";

interface Review {
  name: string;
  initials: string;
  avatarColor: string;
  rating: number;
  text: string;
  date: string;
}

const REVIEWS: Review[] = [
  {
    name: "Ananya D.",
    initials: "AD",
    avatarColor: "#4285F4",
    rating: 5,
    text: "I cannot thank V-KARE enough for the remarkable difference they've made in my daughter's life. Within just 3 months of their child-focused therapy, her concentration, behaviour at school, and overall confidence have improved tremendously. The psychologists here are incredibly patient and truly understand children.",
    date: "October 2024",
  },
  {
    name: "Nagaraj R.",
    initials: "NR",
    avatarColor: "#34A853",
    rating: 5,
    text: "Dr. Keerthi Sundar is an exceptional psychiatrist — one of the finest in Tumkur. What sets him apart is his completely non-judgmental approach and commitment to evidence-based treatment. He listens deeply, explains everything clearly, and tailors medication and therapy to your pace. I felt truly heard and respected.",
    date: "September 2024",
  },
  {
    name: "Meenakshi M.",
    initials: "MM",
    avatarColor: "#FBBC05",
    rating: 5,
    text: "The therapy sessions for my son at V-KARE have been absolutely fantastic. The therapists use a wonderful play-based approach that keeps him engaged and excited. His vocabulary and communication skills have grown so much in just a few months. I highly recommend V-KARE to any parent with similar concerns.",
    date: "November 2024",
  },
  {
    name: "Suresh P.",
    initials: "SP",
    avatarColor: "#EA4335",
    rating: 5,
    text: "Seeking help for clinical depression was one of the hardest steps I've taken, but V-KARE made it feel safe and dignified. The environment is completely discreet — I never once felt stigmatised. The team treated me with the utmost respect and professionalism. Deeply grateful for their care.",
    date: "August 2024",
  },
];

const StarRating: React.FC<{ count?: number; size?: string }> = ({
  count = 5,
  size = "w-3.5 h-3.5",
}) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <Star
        key={i}
        className={`${size} fill-amber-400 text-amber-400 flex-shrink-0`}
      />
    ))}
  </div>
);

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

export const GoogleReviews: React.FC = () => {
  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-[#EAF5FC] text-[#2878B9] border border-[#D9EAF5] px-3.5 py-1 rounded-full text-xs font-semibold mb-2">
            <StarRating count={5} size="w-3 h-3" />
            <span>Verified Patient Experiences</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#123B66] tracking-tight mb-3">
            Real Stories, Real Recovery
          </h2>
          <p className="text-xs sm:text-sm text-[#26384A]/75 leading-relaxed">
            Read what patients and families have shared about their journey of mental wellness and therapy at V-KARE Clinic.
          </p>
        </div>

        {/* Reviews Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {REVIEWS.map((review) => (
            <motion.div
              key={review.name}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-6 border border-[#D9EAF5] shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: review.avatarColor }}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#123B66] leading-tight">
                      {review.name}
                    </p>
                    <p className="text-[11px] text-[#26384A]/50">{review.date}</p>
                  </div>
                </div>

                {/* Google "G" badge */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs border border-gray-100 bg-white"
                  title="Posted on Google"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
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
              </div>

              <StarRating count={review.rating} />

              <p className="text-xs text-[#26384A]/80 leading-relaxed flex-grow">
                "{review.text}"
              </p>

              <div className="flex items-center gap-1.5 pt-2 border-t border-[#D9EAF5]">
                <span className="text-[10px] text-[#087F8C] font-semibold">
                  Verified Google Review
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Box */}
        <motion.div
          className="rounded-3xl overflow-hidden border border-[#D9EAF5] shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-[#EAF5FC] to-white px-6 py-8 sm:px-10 sm:py-9 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 border border-[#D9EAF5]">
                <svg viewBox="0 0 24 24" className="w-8 h-8" aria-label="Google">
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

              <div>
                <p className="text-xs font-bold text-[#087F8C] uppercase tracking-widest mb-1">
                  Google Clinic Reviews
                </p>
                <p className="text-lg sm:text-xl font-serif font-bold text-[#123B66] leading-snug">
                  See all patient ratings & reviews on Google
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StarRating count={5} size="w-4 h-4" />
                  <span className="text-xs font-bold text-[#123B66]">
                    5.0 Star Rating on Google
                  </span>
                </div>
              </div>
            </div>

            <a
              href="https://business.google.com/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2878B9] hover:bg-[#1f5f93] text-white px-6 py-3 rounded-full font-semibold text-xs sm:text-sm transition-colors duration-200 shadow-sm whitespace-nowrap flex-shrink-0 cursor-pointer"
            >
              <span>Read All Google Reviews</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
