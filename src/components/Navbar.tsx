import React, { useState, useEffect } from "react";
import { Calendar, Phone, Menu, X, ArrowRight, Instagram } from "lucide-react";
import { CLINIC_INFO } from "../data/clinicData";

interface NavbarProps {
  onBookClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Our Doctors", href: "#doctors" },
    { name: "Why Choose Us", href: "#why-choose" },
    { name: "Community", href: "#community" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#D9EAF5] py-2.5"
            : "bg-white border-b border-[#D9EAF5]/60 py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left side: Logo & Clinic Name */}
            <a href="#home" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-[#2878B9]/20 shadow-xs bg-white p-0.5 flex-shrink-0 transition-transform group-hover:scale-105 duration-300">
                <img
                  src="/brand/vkare_logo.png"
                  alt="V-KARE Mind and Brain Clinic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif font-bold text-base sm:text-xl tracking-tight text-[#123B66]">
                    V-KARE
                  </span>
                  <span className="text-[10px] font-semibold text-[#087F8C] uppercase tracking-wider hidden sm:inline">
                    Clinic
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10.5px] font-medium tracking-wider text-[#087F8C] uppercase">
                  Mind and Brain Clinic
                </span>
              </div>
            </a>

            {/* Centre navigation: Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#123B66]/85 hover:text-[#2878B9] transition-colors rounded-lg hover:bg-[#EAF5FC]"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Right side: Action CTA Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Instagram CTA Button */}
              <a
                href={CLINIC_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087F8C] bg-[#E9F6F3] border border-[#B8E3DF] px-3.5 py-2 rounded-full hover:bg-[#B8E3DF]/50 hover:text-[#123B66] transition-all duration-200"
                title="Follow V-KARE on Instagram"
              >
                <Instagram className="w-3.5 h-3.5 text-[#087F8C]" />
                <span>Instagram</span>
              </a>

              {/* Call Link */}
              <a
                href={`tel:${CLINIC_INFO.phone}`}
                className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-[#123B66] bg-[#EAF5FC] px-3.5 py-2 rounded-full hover:bg-[#d5ecfa] transition-colors border border-[#D9EAF5]"
                title="Call Clinic"
              >
                <Phone className="w-3.5 h-3.5 text-[#2878B9]" />
                <span>{CLINIC_INFO.phone}</span>
              </a>

              {/* Primary Book Appointment Button */}
              <button
                onClick={onBookClick}
                className="inline-flex items-center gap-2 bg-[#2878B9] hover:bg-[#1f5f93] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-soft hover:shadow-card-hover transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-white/90" />
                <span>Book Appointment</span>
                <ArrowRight className="w-3 h-3 opacity-80" />
              </button>
            </div>

            {/* Mobile Actions Button */}
            <div className="flex sm:hidden items-center gap-2">
              <a
                href={CLINIC_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-[#087F8C] bg-[#E9F6F3] rounded-full border border-[#B8E3DF]"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <button
                onClick={onBookClick}
                className="bg-[#2878B9] text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-xs"
              >
                Book
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-[#123B66] hover:bg-[#EAF5FC] focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fadeIn">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#D9EAF5]">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/brand/vkare_logo.png"
                    alt="V-KARE Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <div className="font-serif font-bold text-sm text-[#123B66]">V-KARE</div>
                    <div className="text-[8px] uppercase tracking-wider text-[#087F8C]">Mind and Brain Clinic</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-[#EAF5FC] text-[#123B66]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-5 flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-[#26384A] hover:text-[#2878B9] hover:bg-[#EAF5FC] rounded-xl transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>

              {/* Instagram Banner in Mobile Drawer */}
              <div className="mt-6 p-3 rounded-2xl bg-[#E9F6F3] border border-[#B8E3DF]">
                <span className="text-[10px] font-bold text-[#087F8C] uppercase tracking-wider block mb-1">
                  Connect on Social Media
                </span>
                <a
                  href={CLINIC_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B66] hover:text-[#2878B9]"
                >
                  <Instagram className="w-4 h-4 text-[#087F8C]" />
                  <span>@mind_and_brain_clinic</span>
                </a>
              </div>
            </div>

            <div className="pt-5 border-t border-[#D9EAF5] space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBookClick();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#2878B9] hover:bg-[#1f5f93] text-white py-3 rounded-xl font-semibold shadow-sm transition-colors text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </button>
              <a
                href={`tel:${CLINIC_INFO.phone}`}
                className="w-full flex items-center justify-center gap-2 border border-[#087F8C]/40 text-[#087F8C] py-2.5 rounded-xl font-medium hover:bg-[#E9F6F3] transition-colors text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Reception: {CLINIC_INFO.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
