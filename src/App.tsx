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
import { paymentService } from "./services/paymentService";

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
    patientId?: string;
  } | null>(null);

  // Universal URL & Hash Route Detector (#admin, #doctor, #pay & ?pay=...) + shortcuts
  useEffect(() => {
    const handleRouteDetection = () => {
      // 1. Check Query String e.g. ?pay=VK-PAY-2026-9041
      const searchParams = new URLSearchParams(window.location.search);
      const payQuery = searchParams.get("pay") || searchParams.get("paymentId") || searchParams.get("id");

      // 2. Check URL Hash e.g. #pay?id=... or #pay/VK-PAY-... or #doctor or #admin
      const hash = window.location.hash;
      const lowerHash = hash.toLowerCase();

      let targetPayId = payQuery;

      if (!targetPayId && lowerHash.startsWith("#pay")) {
        if (hash.includes("?")) {
          const hashParams = new URLSearchParams(hash.substring(hash.indexOf("?") + 1));
          targetPayId = hashParams.get("id") || hashParams.get("pay") || hashParams.get("paymentId");
        } else if (hash.includes("/")) {
          targetPayId = hash.split("/")[1];
        } else if (hash.includes("=")) {
          targetPayId = hash.split("=")[1];
        } else {
          targetPayId = "VK-PAY-2026-9041";
        }
      }

      if (targetPayId && targetPayId.trim()) {
        const cleanId = targetPayId.trim().toUpperCase();
        // Automatically restore/construct request if opened on a new device
        paymentService.resolveRequestFromUrl(cleanId, searchParams);
        setPatientPaymentId(cleanId);
      }

      if (
        lowerHash === "#doctor-portal" ||
        searchParams.get("portal") === "doctor"
      ) {
        setIsDoctorPortalOpen(true);
      } else if (
        lowerHash === "#admin" ||
        lowerHash === "#portal" ||
        searchParams.get("portal") === "admin"
      ) {
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

    handleRouteDetection();
    window.addEventListener("hashchange", handleRouteDetection);
    window.addEventListener("popstate", handleRouteDetection);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("hashchange", handleRouteDetection);
      window.removeEventListener("popstate", handleRouteDetection);
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
    if (window.location.hash === "#doctor-portal") {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  const handleClosePatientPayment = () => {
    setPatientPaymentId(null);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("pay");
    searchParams.delete("paymentId");
    searchParams.delete("id");
    searchParams.delete("amt");
    searchParams.delete("doc");
    searchParams.delete("pat");
    searchParams.delete("ph");
    searchParams.delete("type");
    searchParams.delete("date");
    searchParams.delete("upi");
    const newQuery = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const cleanUrl = window.location.pathname + newQuery;
    history.pushState("", document.title, cleanUrl);
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
          onSuccess={(data, refId, patientId) => setBookingSuccess({ data, refId, patientId })}
        />
      </main>

      {/* Footer (with subtle discreet admin portal trigger for clinic team) */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
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
        patientId={bookingSuccess?.patientId || bookingSuccess?.data?.patientId || ""}
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
