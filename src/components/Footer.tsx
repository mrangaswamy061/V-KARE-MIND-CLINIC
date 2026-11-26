import React from "react";
import { Phone, Mail, MapPin, Clock, ArrowUp, MessageSquare, Lock, Instagram, Star, Globe } from "lucide-react";
import { CLINIC_INFO } from "../data/clinicData";

interface FooterProps {
  onOpenAdmin?: () => void;
  onSelectServiceById?: (serviceId: string) => void;
}

const FOOTER_NAV_LINKS = [
  { label: "About Us", href: "#about" },
  { label: "Our Services", href: "#services" },
  { label: "Our Doctors", href: "#doctors" },
  { label: "Why Choose Us", href: "#why-choose" },
  { label: "Community Programs", href: "#community" },
  { label: "Awareness Hub", href: "#awareness" },
  { label: "Patient Reviews", href: "#reviews" },
  { label: "Book Appointment", href: "#contact" },
];

const FOOTER_DISCIPLINES = [
  { id: "psychological-assessment", label: "Psychological Assessment" },
  { id: "individual-counselling", label: "Individual Counselling" },
  { id: "mental-health-support", label: "Mental Health Support" },
  { id: "behavioural-therapy", label: "Behavioural Therapy (CBT)" },
  { id: "stress-anxiety-management", label: "Stress & Anxiety Management" },
  { id: "child-adolescent-support", label: "Child & Adolescent Support" },
];

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onSelectServiceById }) => {
  const copyrightYear = Math.max(2026, new Date().getFullYear());

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToHash = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const targetId = href.replace(/^#/, "");
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="bg-[#123B66] text-white pt-14 sm:pt-16 pb-10 sm:pb-12 border-t border-[#2878B9]/30 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Call-to-action banner for Instagram & Appointments */}
        <div className="mb-10 sm:mb-12 p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-[#087F8C] to-[#2878B9] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 shadow-md">
          <div className="text-center md:text-left">
            <span className="text-[11px] font-bold text-[#B8E3DF] uppercase tracking-wider block mb-1">
              Join Our Community & Wellness Network
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Follow Us on Instagram for Daily Psychoeducation
            </h2>
            <p className="text-xs sm:text-sm text-white/85 mt-1 max-w-xl">
              Watch reels on anxiety coping, ADHD guidance, mood wellness, and mental health awareness.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
            <a
              href={CLINIC_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#123B66] hover:bg-[#EAF5FC] px-5 py-3 rounded-full text-xs font-bold transition-all shadow-sm hover:scale-105"
            >
              <Instagram className="w-4 h-4 text-[#087F8C]" />
              <span>@mind_and_brain_clinic</span>
            </a>

            <a
              href="#contact"
              onClick={(e) => scrollToHash(e, "#contact")}
              className="inline-flex items-center justify-center gap-2 bg-[#123B66] text-white hover:bg-[#0c2744] px-5 py-3 rounded-full text-xs font-bold transition-all border border-white/20"
            >
              <span>Book a Consultation</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 sm:pb-12 border-b border-white/10">
          {/* Col 1: Brand & Mission (4 cols) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8E3DF] rounded-xl"
              aria-label="V-KARE Mind and Brain Clinic — Back to Home"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/brand/vkare_logo.png"
                  alt="V-KARE Mind and Brain Clinic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-serif font-bold text-xl tracking-tight text-white group-hover:text-[#B8E3DF] transition-colors">
                  V-KARE
                </div>
                <div className="text-[10px] tracking-widest uppercase text-[#B8E3DF] font-semibold">
                  Mind and Brain Clinic
                </div>
              </div>
            </a>

            <p className="text-xs text-white/75 leading-relaxed max-w-sm">
              Tumkur's premier multidisciplinary mental healthcare and rehabilitation centre.
              Dedicated to destigmatizing psychiatric wellness, guiding childhood development,
              and delivering compassionate, evidence-based healing.
            </p>

            <div className="text-xs text-[#B8E3DF] font-medium italic">
              “{CLINIC_INFO.motto}”
            </div>

            {/* Emergency note */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-white/75 leading-relaxed">
              <span className="font-semibold text-[#B8E3DF] block mb-0.5">National Emergency Helpline</span>
              <span>
                Tele-MANAS:{" "}
                <a href="tel:14416" className="font-mono font-bold text-white hover:underline">
                  14416
                </a>
              </span>
              <span className="mx-1.5 text-white/40">|</span>
              <span>
                Clinic Desk:{" "}
                <a href={`tel:+91${CLINIC_INFO.phone}`} className="font-mono font-bold text-white hover:underline">
                  {CLINIC_INFO.phone}
                </a>
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-serif font-bold text-sm text-white">Navigation</h3>
            <ul className="space-y-2 text-xs text-white/75">
              {FOOTER_NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => scrollToHash(e, item.href)}
                    className="hover:text-[#B8E3DF] transition-colors inline-block py-0.5"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-serif font-bold text-sm text-white">Clinical Disciplines</h3>
            <ul className="space-y-2 text-xs text-white/75">
              {FOOTER_DISCIPLINES.map((disc) => (
                <li key={disc.id}>
                  <a
                    href="#services"
                    onClick={(e) => {
                      if (onSelectServiceById) {
                        e.preventDefault();
                        onSelectServiceById(disc.id);
                      }
                    }}
                    className="hover:text-[#B8E3DF] transition-colors inline-block py-0.5 text-left"
                  >
                    {disc.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Google Maps (3 cols) */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3">
            <h3 className="font-serif font-bold text-sm text-white">Visit Our Clinic</h3>
            <div className="space-y-2.5 text-xs text-white/75">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#B8E3DF] flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{CLINIC_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B8E3DF] flex-shrink-0" />
                <a
                  href={`tel:+91${CLINIC_INFO.phone}`}
                  className="hover:text-white transition-colors underline decoration-[#B8E3DF]/40 font-medium"
                >
                  +91 {CLINIC_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#B8E3DF] flex-shrink-0" />
                <a
                  href={`mailto:${CLINIC_INFO.email}`}
                  className="hover:text-white transition-colors underline decoration-[#B8E3DF]/40 break-all"
                >
                  {CLINIC_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#B8E3DF] flex-shrink-0" />
                <a
                  href={CLINIC_INFO.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline decoration-[#B8E3DF]/50 break-all"
                >
                  {CLINIC_INFO.domain}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#B8E3DF] flex-shrink-0" />
                <span>{CLINIC_INFO.workingHours}</span>
              </div>
            </div>

            {/* Embedded Google Map preview */}
            <div className="pt-1.5 space-y-2">
              <div className="rounded-2xl overflow-hidden border border-white/15 h-32 w-full shadow-inner">
                <iframe
                  title="V-KARE Mind & Brain Clinic Location"
                  src={CLINIC_INFO.googleMapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={CLINIC_INFO.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#B8E3DF] hover:text-white transition-colors font-medium"
              >
                <Star className="w-3.5 h-3.5 fill-[#B8E3DF] text-[#B8E3DF]" />
                <span>Review V-KARE on Google (5.0 ★)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-center sm:text-left">
            <span>© {copyrightYear} V-KARE Mind and Brain Clinic. All rights reserved.</span>
            {/* Discreet Admin Portal Entry */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 text-white/40 hover:text-white/85 transition-colors text-[11px] cursor-pointer py-1 px-1.5 rounded"
              title="Clinic Staff Portal"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Admin Access</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={CLINIC_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#B8E3DF] hover:text-white transition-colors text-xs font-semibold"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>

            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors text-xs font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Connect</span>
            </a>

            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-white/75 hover:text-white transition-colors cursor-pointer text-xs py-1"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
