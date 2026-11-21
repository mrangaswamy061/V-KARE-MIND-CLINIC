import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";
import { About } from "./components/About";
import { Services } from "./components/Services";
import { Doctors } from "./components/Doctors";
import { WhyChoose } from "./components/WhyChoose";
import { GoogleReviews } from "./components/GoogleReviews";
import { CommunityPrograms } from "./components/CommunityPrograms";
import { AwarenessHub } from "./components/AwarenessHub";
import { AppointmentSection } from "./components/AppointmentSection";
import { Footer } from "./components/Footer";
import { DoctorModal } from "./components/DoctorModal";
import { ServiceModal } from "./components/ServiceModal";
import { BookingSuccessModal } from "./components/BookingSuccessModal";
import { FloatingActions } from "./components/FloatingActions";
import { AdminPortal } from "./components/AdminPortal";
import { Doctor, Service, AppointmentData } from "./types";

export default function App() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [preselectedDoctor, setPreselectedDoctor] = useState<string>("");
  const [preselectedService, setPreselectedService] = useState<string>("");
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<{
    data: AppointmentData;
    refId: string;
  } | null>(null);

  // Check URL hash for #admin or #portal & keyboard shortcut
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#admin" || hash === "#portal") {
        setIsAdminOpen(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination: Ctrl + Shift + A to open Admin Portal
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === "#admin" || window.location.hash === "#portal") {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  const scrollToAppointment = (doctorName?: string, serviceName?: string) => {
    if (doctorName) setPreselectedDoctor(doctorName);
    if (serviceName) setPreselectedService(serviceName);

    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToServices = () => {
    const el = document.getElementById("services");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#26384A] antialiased selection:bg-[#2878B9]/20 selection:text-[#123B66]">
      {/* Navigation Bar (Public pages do not show Admin Portal) */}
      <Navbar onBookClick={() => scrollToAppointment()} />

      <main className="flex-grow">
        {/* Unified Home & About Story */}
        <Hero
          onBookClick={() => scrollToAppointment()}
          onExploreServices={scrollToServices}
        />

        {/* Statistics Strip */}
        <Stats />

        {/* Merged About Us Story: Seamless narrative continuation */}
        <About />

        {/* Minimized Standard-Size Specialized Services */}
        <Services
          onSelectService={(service) => setSelectedService(service)}
          onBookService={(serviceName) => scrollToAppointment(undefined, serviceName)}
        />

        {/* Minimized Standard-Size Specialist Doctors */}
        <Doctors
          onSelectDoctor={(doctor) => setSelectedDoctor(doctor)}
          onBookDoctor={(docName) => scrollToAppointment(docName)}
        />

        {/* Minimized Standard-Size Why Choose V-KARE */}
        <WhyChoose />

        {/* Patient Reviews */}
        <GoogleReviews />

        {/* Community Outreach Programs */}
        <CommunityPrograms />

        {/* Mental Health Awareness, Blogs & Instagram */}
        <AwarenessHub />

        {/* Appointment Booking */}
        <AppointmentSection
          preselectedDoctor={preselectedDoctor}
          preselectedService={preselectedService}
          onSuccess={(data, refId) => setBookingSuccess({ data, refId })}
        />
      </main>

      {/* Footer (with subtle discreet admin portal trigger for clinic team) */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Interactive Modals */}
      <DoctorModal
        doctor={selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        onBook={(docName) => scrollToAppointment(docName)}
      />

      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onBook={(serviceName) => scrollToAppointment(undefined, serviceName)}
      />

      <BookingSuccessModal
        data={bookingSuccess?.data || null}
        refId={bookingSuccess?.refId || ""}
        onClose={() => setBookingSuccess(null)}
      />

      {/* Emergency & WhatsApp Floating Buttons */}
      <FloatingActions />

      {/* Universal Admin Portal (Not shown on public web pages; accessed via #admin or discreet trigger) */}
      <AdminPortal isOpen={isAdminOpen} onClose={handleCloseAdmin} />
    </div>
  );
}
