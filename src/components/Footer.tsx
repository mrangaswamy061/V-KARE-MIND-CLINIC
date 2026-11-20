import React from "react";
import { Phone, Mail, MapPin, Clock, ArrowUp, MessageSquare, Lock } from "lucide-react";
import { CLINIC_INFO } from "../data/clinicData";

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#102E28] text-white pt-14 pb-10 border-t border-[#315C49]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 border-b border-white/10">
          {/* Col 1: Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-white p-0.5 shadow-xs flex-shrink-0">
                <img
                  src="/brand/vkare_logo.png"
                  alt="V-KARE Mind and Brain Clinic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-serif font-bold text-lg tracking-tight text-white">
                  V-KARE
                </div>
                <div className="text-[9px] tracking-widest uppercase text-emerald-300 font-semibold">
                  Mind and Brain Clinic
                </div>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Tumkur's multidisciplinary mental healthcare centre. Dedicated to
              destigmatizing psychological wellness, guiding childhood development, and
              providing compassionate, evidence-based recovery.
            </p>

            <div className="text-xs text-emerald-200 font-medium italic">
              “{CLINIC_INFO.motto}”
            </div>

            {/* Emergency note */}
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-[11px] text-white/70">
              <span className="font-semibold text-emerald-300 block mb-0.5">Emergency Helpline</span>
              Dial Tele-MANAS (14416) or our clinic line at {CLINIC_INFO.phone}.
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="font-serif font-bold text-sm text-white">Navigation</h4>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li>
                <a href="#home" className="hover:text-emerald-300 transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-emerald-300 transition-colors">About V-KARE</a>
              </li>
              <li>
                <a href="#services" className="hover:text-emerald-300 transition-colors">Our Services</a>
              </li>
              <li>
                <a href="#doctors" className="hover:text-emerald-300 transition-colors">Specialist Doctors</a>
              </li>
              <li>
                <a href="#why-choose" className="hover:text-emerald-300 transition-colors">Why Choose Us</a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-emerald-300 transition-colors">Google Reviews</a>
              </li>
              <li>
                <a href="#community" className="hover:text-emerald-300 transition-colors">Community Programs</a>
              </li>
              <li>
                <a href="#awareness" className="hover:text-emerald-300 transition-colors">Awareness Hub & Blog</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-emerald-300 transition-colors">Book Appointment</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Specialties (3 cols) */}
          <div className="lg:col-span-3 space-y-2.5">
            <h4 className="font-serif font-bold text-sm text-white">Specialized Care</h4>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li>
                <a href="#services" className="hover:text-emerald-300 transition-colors">Clinical Psychiatry & Mood</a>
              </li>
              <li>
                <a href="#services" className="hover:text-emerald-300 transition-colors">Psychotherapy & CBT</a>
              </li>
              <li>
                <a href="#services" className="hover:text-emerald-300 transition-colors">Child Guidance & ADHD</a>
              </li>
              <li>
                <a href="#services" className="hover:text-emerald-300 transition-colors">Speech & Language Therapy</a>
              </li>
              <li>
                <a href="#services" className="hover:text-emerald-300 transition-colors">Pediatric Orthopedic Surgery</a>
              </li>
              <li>
                <a href="#services" className="hover:text-emerald-300 transition-colors">De-Addiction & Sleep Care</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Google Maps (3 cols) */}
          <div className="lg:col-span-3 space-y-2.5">
            <h4 className="font-serif font-bold text-sm text-white">Visit Our Clinic</h4>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{CLINIC_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                <span>{CLINIC_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                <span>{CLINIC_INFO.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                <span>{CLINIC_INFO.workingHours}</span>
              </div>
            </div>

            {/* Embedded Google Map preview */}
            <div className="pt-1.5">
              <div className="rounded-xl overflow-hidden border border-white/10 h-24 w-full shadow-inner">
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
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} V-KARE Mind and Brain Clinic. All rights reserved.</span>
            {/* Discreet Admin Portal Entry (Not shown as prominent navbar button) */}
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 text-white/20 hover:text-white/60 transition-colors text-[10px] cursor-pointer"
              title="Clinic Staff Portal"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Admin Access</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-pink-300 hover:text-white transition-colors text-xs"
            >
              <span>Instagram</span>
            </a>

            <a
              href={CLINIC_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Connect</span>
            </a>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors cursor-pointer text-xs"
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
