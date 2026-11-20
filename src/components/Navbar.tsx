import React, { useState, useEffect } from "react";
import { Calendar, Phone, Menu, X, ArrowRight } from "lucide-react";
import { CLINIC_INFO } from "../data/clinicData";

interface NavbarProps {
  onBookClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "Doctors", href: "#doctors" },
    { name: "Reviews", href: "#reviews" },
    { name: "Community", href: "#community" },
    { name: "Awareness Hub", href: "#awareness" },
    { name: "Contact Us", href: "#contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#F7F7F1]/95 backdrop-blur-md shadow-sm border-b border-[#E4EDE5]/60 py-2.5"
            : "bg-[#F7F7F1] py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left side: Logo & Clinic Name */}
            <a href="#home" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-[#315C49]/20 shadow-xs bg-white p-0.5 flex-shrink-0 transition-transform group-hover:scale-105 duration-300">
                <img
                  src="/brand/vkare_logo.png"
                  alt="V-KARE Mind and Brain Clinic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#102E28]">
                    V-KARE
                  </span>
                  <span className="text-[9px] font-semibold text-[#315C49] uppercase tracking-wider hidden sm:inline">
                    Clinic
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-medium tracking-wider text-[#315C49] uppercase">
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
                  className="px-3 py-1.5 text-xs font-semibold text-[#102E28]/80 hover:text-[#315C49] transition-colors rounded-lg hover:bg-[#E4EDE5]/50"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Right side: Action CTA */}
            <div className="hidden sm:flex items-center gap-2.5">
              <a
                href={`tel:${CLINIC_INFO.phone}`}
                className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-[#315C49] bg-[#E4EDE5]/70 px-3 py-1.5 rounded-full hover:bg-[#E4EDE5] transition-colors"
                title="Clinic Contact Number"
              >
                <Phone className="w-3.5 h-3.5 text-[#315C49]" />
                <span>{CLINIC_INFO.phone}</span>
              </a>

              <button
                onClick={onBookClick}
                className="inline-flex items-center gap-2 bg-[#315C49] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xs hover:bg-[#204033] hover:shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-100" />
                <span>Book an Appointment</span>
                <ArrowRight className="w-3 h-3 opacity-80" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={onBookClick}
                className="bg-[#315C49] text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-xs"
              >
                Book
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-[#102E28] hover:bg-[#E4EDE5]/50 focus:outline-none"
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
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#F7F7F1] shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E4EDE5]">
                <div className="flex items-center gap-2">
                  <img
                    src="/brand/vkare_logo.png"
                    alt="V-KARE Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <div className="font-serif font-bold text-sm text-[#102E28]">V-KARE</div>
                    <div className="text-[8px] uppercase tracking-wider text-[#315C49]">Mind and Brain Clinic</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-[#E4EDE5]/60 text-[#102E28]"
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
                    className="px-3 py-2.5 text-sm font-medium text-[#102E28] hover:text-[#315C49] hover:bg-[#E4EDE5]/50 rounded-xl transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
            </div>

            <div className="pt-5 border-t border-[#E4EDE5] space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBookClick();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#315C49] text-white py-2.5 rounded-xl font-medium shadow-sm hover:bg-[#204033] transition-colors text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </button>
              <a
                href={`tel:${CLINIC_INFO.phone}`}
                className="w-full flex items-center justify-center gap-2 border border-[#315C49]/30 text-[#315C49] py-2 rounded-xl font-medium hover:bg-[#E4EDE5]/40 transition-colors text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Clinic: {CLINIC_INFO.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
