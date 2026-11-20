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
    text: "I cannot thank V-KARE enough for the remarkable difference they've made in my daughter's life. She was struggling with ADHD and we were at our wits' end. Within just 3 months of their child-focused therapy, her concentration, behaviour at school, and overall confidence have improved tremendously. The therapists here are incredibly patient and truly understand children.",
    date: "October 2024",
  },
  {
    name: "Nagaraj R.",
    initials: "NR",
    avatarColor: "#34A853",
    rating: 5,
    text: "Dr. Keerthi Sundar is an exceptional psychiatrist — one of the finest I have encountered. What sets her apart is her completely non-judgmental approach and her commitment to evidence-based treatment. She listens deeply, explains everything clearly, and tailors her approach to your individual needs. I felt truly heard and respected throughout my treatment.",
    date: "September 2024",
  },
  {
    name: "Meenakshi M.",
    initials: "MM",
    avatarColor: "#FBBC05",
    rating: 5,
    text: "The speech therapy sessions for my 4-year-old son at V-KARE have been absolutely fantastic. The therapist uses a wonderful play-based approach that keeps my son engaged and excited to attend every session. His vocabulary and communication skills have grown so much in just a few months. I highly recommend their pediatric speech therapy to any parent with similar concerns.",
    date: "November 2024",
  },
  {
    name: "Suresh P.",
    initials: "SP",
    avatarColor: "#EA4335",
    rating: 5,
    text: "Seeking help for clinical depression was one of the hardest steps I've taken, but V-KARE made it feel safe and dignified. The environment is completely discreet — I never once felt stigmatised. The team treated me with the utmost respect and professionalism. Their holistic approach helped me regain my sense of self. I'm deeply grateful for their care.",
    date: "August 2024",
  },
];

const StarRating: React.FC<{ count?: number; size?: string }> = ({
  count = 5,
  size = "w-4 h-4",
}) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} className={`${size} fill-[#FBBC05] text-[#FBBC05]`} />
    ))}
  </div>
);

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55 },
  },
};

export const GoogleReviews: React.FC = () => {
  return (
    <section
      id="reviews"
      className="py-20 bg-[#F7F7F1]"
      aria-label="Patient Reviews"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#E4EDE5] text-[#315C49] text-xs font-semibold tracking-widest uppercase mb-4">
            Patient Voices
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102E28] leading-tight mb-3">
            What Our Patients Say
          </h2>
          <p className="text-sm sm:text-base text-[#102E28]/60 max-w-xl mx-auto">
            Read authentic reviews from our patients on Google
          </p>
        </motion.div>

        {/* Review Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {REVIEWS.map((review) => (
            <motion.div
              key={review.name}
              variants={cardVariants}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#E4EDE5] flex flex-col gap-4 hover:shadow-md transition-shadow duration-300"
            >
              {/* Card Header: Avatar + Name + Badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Initials Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: review.avatarColor }}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#102E28] leading-tight">
                      {review.name}
                    </p>
                    <p className="text-[11px] text-[#102E28]/50">{review.date}</p>
                  </div>
                </div>
                {/* Google "G" badge */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100"
                  style={{ background: "white" }}
                  title="Posted on Google"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
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

              {/* Star Rating */}
              <StarRating count={review.rating} />

              {/* Review Text */}
              <p className="text-xs text-[#102E28]/70 leading-relaxed flex-grow">
                "{review.text}"
              </p>

              {/* Posted on Google tag */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-[#E4EDE5]">
                <svg
                  viewBox="0 0 24 24"
                  className="w-3 h-3 flex-shrink-0"
                  aria-hidden="true"
                >
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
                <span className="text-[10px] text-[#102E28]/40 font-medium">
                  Posted on Google
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Box */}
        <motion.div
          className="rounded-2xl overflow-hidden border border-[#315C49]/20 shadow-sm"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <div className="bg-[#E4EDE5] px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left: Google Logo + Text */}
            <div className="flex items-center gap-5">
              {/* Google Logo */}
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
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
                <p className="text-xs font-semibold text-[#315C49] uppercase tracking-widest mb-1">
                  Google Reviews
                </p>
                <p className="text-lg sm:text-xl font-serif font-bold text-[#102E28] leading-snug">
                  See all our reviews on Google
                </p>
                {/* 5-star display */}
                <div className="flex items-center gap-2 mt-2">
                  <StarRating count={5} size="w-4 h-4" />
                  <span className="text-sm font-semibold text-[#102E28]">
                    Rated 5.0 on Google
                  </span>
                </div>
              </div>
            </div>

            {/* Right: CTA Button */}
            <a
              href="https://business.google.com/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#315C49] hover:bg-[#102E28] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors duration-200 shadow-sm whitespace-nowrap flex-shrink-0"
            >
              Read Google Reviews
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
