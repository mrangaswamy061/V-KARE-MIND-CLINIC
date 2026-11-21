import React from "react";
import { Phone, Mail, MapPin, Clock, ArrowUp, MessageSquare, Lock, Instagram } from "lucide-react";
import { CLINIC_INFO } from "../data/clinicData";

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#123B66] text-white pt-16 pb-12 border-t border-[#2878B9]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Call-to-action banner for Instagram & Appointments */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#087F8C] to-[#2878B9] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="text-center md:text-left">
            <span className="text-[11px] font-bold text-[#B8E3DF] uppercase tracking-wider block mb-1">
              Join Our Community & Wellness Network
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Follow Us on Instagram for Daily Psychoeducation
            </h3>
            <p className="text-xs sm:text-sm text-white/85 mt-1 max-w-xl">
              Watch reels on anxiety coping, ADHD guidance, mood wellness, and mental health awareness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={CLINIC_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#123B66] hover:bg-[#EAF5FC] px-5 py-3 rounded-full text-xs font-bold transition-all shadow-sm hover:scale-105"
            >
              <Instagram className="w-4 h-4 text-[#087F8C]" />
              <span>@mind_and_brain_clinic</span>
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-[#123B66] text-white hover:bg-[#0c2744] px-5 py-3 rounded-full text-xs font-bold transition-all border border-white/20"
            >
              <span>Book a Consultation</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 shadow-sm flex-shrink-0">
                <img
                  src="/brand/vkare_logo.png"
                  alt="V-KARE Mind and Brain Clinic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-serif font-bold text-xl tracking-tight text-white">
                  V-KARE
                </div>
                <div className="text-[10px] tracking-widest uppercase text-[#B8E3DF] font-semibold">
                  Mind and Brain Clinic
                </div>
              </div>
            </div>

            <p className="text-xs text-white/75 leading-relaxed max-w-sm">
              Tumkur's premier multidisciplinary mental healthcare and rehabilitation centre.
              Dedicated to destigmatizing psychiatric wellness, guiding childhood development,
              and delivering compassionate, evidence-based healing.
            </p>

            <div className="text-xs text-[#B8E3DF] font-medium italic">
              “{CLINIC_INFO.motto}”
            </div>

            {/* Emergency note */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-white/75">
              <span className="font-semibold text-[#B8E3DF] block mb-0.5">National Emergency Helpline</span>
              Tele-MANAS: <span className="font-mono font-bold text-white">14416</span> | Clinic Desk: <span className="font-mono font-bold text-white">{CLINIC_INFO.phone}</span>
            </div>
          </div>

          {/* Col 2: Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-sm text-white">Navigation</h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <a href="#home" className="hover:text-[#B8E3DF] transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#B8E3DF] transition-colors">About Us</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#B8E3DF] transition-colors">Our Services</a>
              </li>
              <li>
                <a href="#doctors" className="hover:text-[#B8E3DF] transition-colors">Our Doctors</a>
              </li>
              <li>
                <a href="#why-choose" className="hover:text-[#B8E3DF] transition-colors">Why Choose Us</a>
              </li>
              <li>
                <a href="#community" className="hover:text-[#B8E3DF] transition-colors">Community Programs</a>
              </li>
              <li>
                <a href="#awareness" className="hover:text-[#B8E3DF] transition-colors">Awareness Hub</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#B8E3DF] transition-colors">Book Appointment</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Services (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm text-white">Clinical Disciplines</h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <a href="#services" className="hover:text-[#B8E3DF] transition-colors">Psychological Assessment</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#B8E3DF] transition-colors">Individual Counselling</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#B8E3DF] transition-colors">Mental Health Support</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#B8E3DF] transition-colors">Behavioural Therapy (CBT)</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#B8E3DF] transition-colors">Stress & Anxiety Management</a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#B8E3DF] transition-colors">Child & Adolescent Support</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Google Maps (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm text-white">Visit Our Clinic</h4>
            <div className="space-y-2 text-xs text-white/75">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#B8E3DF] flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{CLINIC_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B8E3DF] flex-shrink-0" />
                <span>+91 {CLINIC_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#B8E3DF] flex-shrink-0" />
                <span>{CLINIC_INFO.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#B8E3DF] flex-shrink-0" />
                <span>{CLINIC_INFO.workingHours}</span>
              </div>
            </div>

            {/* Embedded Google Map preview */}
            <div className="pt-1.5">
              <div className="rounded-2xl overflow-hidden border border-white/15 h-28 w-full shadow-inner">
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
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} V-KARE Mind and Brain Clinic. All rights reserved.</span>
            {/* Discreet Admin Portal Entry */}
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 text-white/30 hover:text-white/80 transition-colors text-[10px] cursor-pointer"
              title="Clinic Staff Portal"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Admin Access</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
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
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer text-xs"
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
