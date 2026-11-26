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

const DEFAULT_PAGE_TITLE =
  "V-KARE Mind and Brain Clinic | Compassionate Mental Healthcare in Tumkur";

export default function App() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [requestedServiceId, setRequestedServiceId] = useState<string | null>(null);
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

  // Sync browser tab title to active modal / portal / view
  useEffect(() => {
    if (isAdminOpen) {
      document.title = "Admin Portal | V-KARE Mind and Brain Clinic";
    } else if (isDoctorPortalOpen) {
      document.title = "Doctor Dashboard | V-KARE Mind and Brain Clinic";
    } else if (patientPaymentId) {
      document.title = `Payment ${patientPaymentId} | V-KARE Mind and Brain Clinic`;
    } else if (selectedDoctor) {
      document.title = `${selectedDoctor.name} | V-KARE Mind and Brain Clinic`;
    } else if (selectedService) {
      document.title = `${selectedService.title} | V-KARE Mind and Brain Clinic`;
    } else {
      document.title = DEFAULT_PAGE_TITLE;
    }
  }, [isAdminOpen, isDoctorPortalOpen, patientPaymentId, selectedDoctor, selectedService]);

  // Universal URL & Hash Route Detector (#admin, #pay & ?pay=...)
  useEffect(() => {
    const handleRouteDetection = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const lowerHash = hash.toLowerCase();

      // Merge search params with any hash query parameters so #pay?id=...&amt=... preserves fee & UPI info
      const mergedParams = new URLSearchParams(searchParams);
      if (hash.includes("?")) {
        const hashQuery = new URLSearchParams(hash.substring(hash.indexOf("?") + 1));
        hashQuery.forEach((value, key) => {
          if (!mergedParams.has(key)) mergedParams.set(key, value);
        });
      }

      let targetPayId =
        mergedParams.get("pay") || mergedParams.get("paymentId") || mergedParams.get("id");

      if (!targetPayId && lowerHash.startsWith("#pay")) {
        if (hash.includes("/")) {
          targetPayId = hash.split("/")[1]?.split("?")[0] || null;
        } else if (hash.includes("=")) {
          targetPayId = hash.split("=")[1]?.split("&")[0] || null;
        }
      }

      if (targetPayId && targetPayId.trim()) {
        const cleanId = targetPayId.trim().toUpperCase();
        paymentService.resolveRequestFromUrl(cleanId, mergedParams);
        setPatientPaymentId(cleanId);
      }

      if (
        lowerHash === "#admin" ||
        lowerHash === "#portal" ||
        searchParams.get("portal") === "admin"
      ) {
        setIsAdminOpen(true);
      }
    };

    handleRouteDetection();
    window.addEventListener("hashchange", handleRouteDetection);
    window.addEventListener("popstate", handleRouteDetection);
    return () => {
      window.removeEventListener("hashchange", handleRouteDetection);
      window.removeEventListener("popstate", handleRouteDetection);
    };
  }, []);

  // Keyboard shortcuts & Escape modal handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
      if (e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setIsDoctorPortalOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        if (bookingSuccess) setBookingSuccess(null);
        else if (selectedDoctor) setSelectedDoctor(null);
        else if (selectedService) setSelectedService(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bookingSuccess, selectedDoctor, selectedService]);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === "#admin" || window.location.hash === "#portal") {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  const handleCloseDoctorPortal = () => {
    setIsDoctorPortalOpen(false);
  };

  const handleClosePatientPayment = () => {
    setPatientPaymentId(null);
    const searchParams = new URLSearchParams(window.location.search);
    ["pay", "paymentId", "id", "amt", "amount", "doc", "doctor", "pat", "patient", "ph", "phone", "type", "sessionType", "date", "upi", "pn", "mc"].forEach((k) =>
      searchParams.delete(k)
    );
    const newQuery = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const keepHash = window.location.hash.toLowerCase().startsWith("#pay") ? "" : window.location.hash;
    history.pushState("", document.title, window.location.pathname + newQuery + keepHash);
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

  const handleSelectDiscipline = (serviceId: string) => {
    setRequestedServiceId(serviceId);
    scrollToServices();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#26384A] antialiased selection:bg-[#2878B9]/20 selection:text-[#123B66] overflow-x-clip">
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
          requestedServiceId={requestedServiceId}
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
        onSelectServiceById={handleSelectDiscipline}
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
