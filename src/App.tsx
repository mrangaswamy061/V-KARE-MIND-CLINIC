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
import { DoctorPortal } from "./components/DoctorPortal";
import { PatientPaymentScreen } from "./components/PatientPaymentScreen";
import { Doctor, Service, AppointmentData } from "./types";

export default function App() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [preselectedDoctor, setPreselectedDoctor] = useState<string>("");
  const [preselectedService, setPreselectedService] = useState<string>("");
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isDoctorPortalOpen, setIsDoctorPortalOpen] = useState<boolean>(false);
  const [patientPaymentId, setPatientPaymentId] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    data: AppointmentData;
    refId: string;
  } | null>(null);

  // Check URL hash for #admin, #doctor, #pay & keyboard shortcuts
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith("#pay")) {
        const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
        const id = urlParams.get("id");
        if (id) {
          setPatientPaymentId(id.toUpperCase());
        } else {
          setPatientPaymentId("VK-PAY-2026-9041");
        }
      } else if (hash === "#doctor" || hash === "#doctors" || hash === "#doctor-portal") {
        setIsDoctorPortalOpen(true);
      } else if (hash === "#admin" || hash === "#portal") {
        setIsAdminOpen(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A -> Admin Portal
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
      // Ctrl + Shift + D -> Doctor Portal
      if (e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setIsDoctorPortalOpen((prev) => !prev);
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

  const handleCloseDoctorPortal = () => {
    setIsDoctorPortalOpen(false);
    if (window.location.hash === "#doctor" || window.location.hash === "#doctor-portal") {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  const handleClosePatientPayment = () => {
    setPatientPaymentId(null);
    if (window.location.hash.startsWith("#pay")) {
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

      {/* Footer (with subtle discreet doctor & admin portal triggers for clinic team) */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenDoctorPortal={() => setIsDoctorPortalOpen(true)}
      />

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

      {/* Doctor Dashboard: Fees, UPI QR, and Session Payment Requests */}
      <DoctorPortal
        isOpen={isDoctorPortalOpen}
        onClose={handleCloseDoctorPortal}
        onOpenPatientPayment={(paymentId) => setPatientPaymentId(paymentId)}
      />

      {/* Patient Payment Request Screen (Direct link via #pay?id=... or notification) */}
      {patientPaymentId && (
        <PatientPaymentScreen
          paymentId={patientPaymentId}
          onClose={handleClosePatientPayment}
        />
      )}

      {/* Universal Admin Portal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        onOpenDoctorPortal={() => setIsDoctorPortalOpen(true)}
        onOpenPatientPayment={(paymentId) => setPatientPaymentId(paymentId)}
      />
    </div>
  );
}
