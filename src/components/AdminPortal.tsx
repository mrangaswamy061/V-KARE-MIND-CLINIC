import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  UserCheck,
  CheckCircle2,
  Phone,
  MessageSquare,
  Search,
  Download,
  Plus,
  X,
  Lock,
  ArrowLeft,
  Settings,
  Filter,
  Check,
  Ban,
  RefreshCw,
  Pencil,
  Trash2,
  Stethoscope,
  Layers,
  User,
  Key,
  Bell,
  HeartHandshake,
  Video,
  BookOpen,
  Upload,
  Image as ImageIcon,
  IndianRupee,
  Eye,
  ExternalLink,
  Clock,
  Send,
} from "lucide-react";
import { DOCTORS, CLINIC_INFO } from "../data/clinicData";
import { useDynamicData } from "../hooks/useDynamicData";
import { Doctor, Service, CommunityProgram, AwarenessVideo, AwarenessBlog, PaymentRequest } from "../types";
import { paymentService } from "../services/paymentService";
import {
  formatApptRef,
  getNextApptRef,
  formatPatientId,
  getOrRegisterPatientId,
} from "../services/appointmentService";

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDoctorPortal?: () => void;
  onOpenPatientPayment?: (paymentId: string) => void;
}

interface AppointmentRecord {
  id: string;
  refId?: string;
  patientId?: string;
  patientName: string;
  age?: string;
  gender?: string;
  parentName?: string;
  phone: string;
  email?: string;
  doctor: string;
  department: string;
  date: string;
  timeSlot: string;
  consultationType: string;
  message?: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
}

interface PatientRecord {
  regId: string;
  name: string;
  age: string;
  gender: string;
  parent?: string;
  address: string;
  phone: string;
  email?: string;
  service: string;
  lastVisit: string;
  notes?: string;
}

const DEMO_APPOINTMENT_IDS = ["VK-2026-9041", "VK-2026-9042", "VK-2026-9043", "VK-2026-9044"];
const DEMO_PATIENT_NAMES = [
  "Shobith",
  "Dhanyatha",
  "Praveen Kumar",
  "Sanmitha",
  "Sanna Rangamma",
  "Arhan Khan",
  "Rajashekar",
  "Sunil Kumar",
  "Kavitha Gowda",
  "Master Tejas",
  "Master Tejas (Parent: Ramesh)",
  "Deepak S.",
];

// Blank doctor template
const BLANK_DOCTOR: Omit<Doctor, "id"> = {
  name: "",
  title: "",
  qualifications: "",
  specialization: "",
  department: "",
  experience: "",
  image: "/doctors/placeholder.jpg",
  consultationFee: "",
  availability: "",
  bio: "",
  expertise: [],
  education: [],
  contact: "",
  consultationModes: ["in-person"],
};

// Blank service template
const BLANK_SERVICE: Omit<Service, "id"> = {
  title: "",
  category: "psychiatry",
  iconName: "Brain",
  shortDesc: "",
  fullDesc: "",
  symptoms: [],
  treatments: [],
  highlights: [],
};

const ICON_OPTIONS = ["Brain", "HeartPulse", "Baby", "MessageSquare", "Activity", "Moon", "Stethoscope", "Users", "UserCheck"];
const CATEGORY_OPTIONS: Service["category"][] = ["psychiatry", "psychology", "child", "speech", "orthopedics"];

// Input field helper
const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-semibold text-[#102E28] mb-1">{label}</label>
    {children}
  </div>
);

const inputCls =
  "w-full px-3 py-2 rounded-xl border border-[#E4EDE5] bg-[#F7F7F1] text-xs text-[#102E28] focus:outline-none focus:border-[#315C49]";

const getInitialAuth = () => {
  try {
    const isAuth = localStorage.getItem("vkare_admin_auth") === "true";
    const lockRaw = localStorage.getItem("vkare_admin_lock");
    const mySessionId = sessionStorage.getItem("vkare_admin_session_id");
    if (isAuth && lockRaw && mySessionId) {
      const lock = JSON.parse(lockRaw);
      if (lock.sessionId === mySessionId && Date.now() - lock.lastActive < 20000) {
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
};

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  onOpenDoctorPortal,
  onOpenPatientPayment,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(getInitialAuth);
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isBlockedByOtherAdmin, setIsBlockedByOtherAdmin] = useState(false);
  const [sessionNotice, setSessionNotice] = useState("");
  const [activeTab, setActiveTab] = useState<
    "appointments" | "patients" | "doctors" | "services" | "programs" | "awareness" | "payments" | "settings"
  >("appointments");

  // Payment Management State
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [payDoctorFilter, setPayDoctorFilter] = useState("All");
  const [payStatusFilter, setPayStatusFilter] = useState("All");
  const [paySearchTerm, setPaySearchTerm] = useState("");
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState("");
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState("");
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<{
    appointment?: AppointmentRecord;
    patient?: PatientRecord;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [approvedAppointmentForConfirmation, setApprovedAppointmentForConfirmation] = useState<AppointmentRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newApt, setNewApt] = useState({
    patientName: "",
    age: "",
    gender: "Male",
    parentName: "",
    phone: "",
    doctor: DOCTORS[0].name,
    department: DOCTORS[0].department,
    date: new Date().toISOString().split("T")[0],
    timeSlot: "11:00 AM - 12:00 PM",
    consultationType: "In-Person (Clinic Visit)",
    message: "Walk-in patient registration",
  });

  // Dynamic data hook
  const {
    doctors,
    services,
    programs,
    videos,
    blogs,
    saveDoctors,
    saveServices,
    savePrograms,
    saveVideos,
    saveBlogs,
  } = useDynamicData();

  // Doctor modal state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState<Omit<Doctor, "id">>(BLANK_DOCTOR);

  // Service modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<Omit<Service, "id">>(BLANK_SERVICE);
  // For textarea comma-separated fields
  const [symptomsText, setSymptomsText] = useState("");
  const [treatmentsText, setTreatmentsText] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [expertiseText, setExpertiseText] = useState("");
  const [educationText, setEducationText] = useState("");

  // Community Program state
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<CommunityProgram | null>(null);
  const [programForm, setProgramForm] = useState<Omit<CommunityProgram, "id">>({
    title: "",
    description: "",
    buttonLabel: "Learn More",
    buttonLink: "#contact",
    color: "#315C49",
    tag: "Community",
    image: "",
  });

  // Awareness state
  const [awarenessSubTab, setAwarenessSubTab] = useState<"videos" | "blogs">("videos");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<AwarenessVideo | null>(null);
  const [videoForm, setVideoForm] = useState<Omit<AwarenessVideo, "id">>({
    title: "",
    duration: "5 min watch",
    tag: "Mental Health",
    videoUrl: "https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#",
    thumbnail: "",
    gradient: "from-teal-700 to-emerald-600",
  });

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<AwarenessBlog | null>(null);
  const [blogForm, setBlogForm] = useState<Omit<AwarenessBlog, "id">>({
    title: "",
    duration: "4 min read",
    excerpt: "",
    articleUrl: "#",
    thumbnail: "",
  });

  // Refresh appointments (pure live data, normalizing id, refId, and patientId)
  const refreshAppointments = (): AppointmentRecord[] => {
    try {
      const raw = localStorage.getItem("vkare_appointments");
      const saved = raw ? JSON.parse(raw) : [];

      // Filter demo data
      const nonDemo = Array.isArray(saved)
        ? saved.filter(
            (a: any) =>
              a &&
              a.patientName &&
              !DEMO_APPOINTMENT_IDS.includes(a.id) &&
              !DEMO_PATIENT_NAMES.includes(a.patientName)
          )
        : [];

      // Sort chronological to ensure serial 0001, 0002, 0003... follows sequence
      const sorted = [...nonDemo].sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) return timeA - timeB;
        return (a.date || "").localeCompare(b.date || "");
      });

      const clean = sorted.map((a: any, idx: number) => {
        const serialNum = idx + 1;
        const dateVal = a.date || new Date().toISOString().split("T")[0];
        let apptId = a.id || a.refId;
        // If apptId is old format without month (e.g. VK-2026-1234), normalize to continuous VK-YYYY-MMM-000X
        if (!apptId || !apptId.match(/^VK-\d{4}-[A-Z]{3}-\d{4}$/i)) {
          apptId = formatApptRef(dateVal, serialNum);
        }
        const pId = a.patientId && a.patientId.startsWith("VK-P")
          ? a.patientId
          : formatPatientId(serialNum);
        return {
          ...a,
          id: apptId,
          refId: a.refId || apptId,
          patientId: pId,
          status: a.status || "Pending",
        };
      });

      if (Array.isArray(saved) && (saved.length !== clean.length || JSON.stringify(saved) !== JSON.stringify(clean))) {
        localStorage.setItem("vkare_appointments", JSON.stringify(clean));
      }
      setAppointments(clean);
      return clean;
    } catch {
      setAppointments([]);
      return [];
    }
  };

  // Refresh patients directory (derived dynamically from live appointments + registered patients, pure data)
  const refreshPatients = (aptsList?: AppointmentRecord[]): PatientRecord[] => {
    const apts = aptsList !== undefined ? aptsList : appointments;
    let registered: PatientRecord[] = [];
    try {
      const regRaw = localStorage.getItem("vkare_registered_patients");
      if (regRaw) {
        const parsed = JSON.parse(regRaw);
        if (Array.isArray(parsed)) {
          registered = parsed.filter(
            (p: PatientRecord) =>
              !["VK001", "VK002", "VK003", "VK004", "VK005", "VK006", "VK007"].includes(p.regId) &&
              !DEMO_PATIENT_NAMES.includes(p.name)
          );
          if (parsed.length !== registered.length) {
            localStorage.setItem("vkare_registered_patients", JSON.stringify(registered));
          }
        }
      }
    } catch {}

    const patientMap = new Map<string, PatientRecord>();

    // Add registered patients first
    registered.forEach((p) => {
      const key = (p.phone || p.name).trim().toLowerCase();
      if (key && !DEMO_PATIENT_NAMES.includes(p.name)) {
        patientMap.set(key, p);
      }
    });

    // Merge or add patients from live appointment records
    apts.forEach((apt) => {
      if (!apt.patientName || DEMO_PATIENT_NAMES.includes(apt.patientName)) return;
      const key = (apt.phone || apt.patientName).trim().toLowerCase();
      const existing = patientMap.get(key);
      if (existing) {
        if (!existing.lastVisit || apt.date > existing.lastVisit) {
          existing.lastVisit = apt.date;
        }
        if (apt.department && (!existing.service || existing.service === "Mind & Brain Consultation")) {
          existing.service = apt.department;
        }
        if (apt.email && !existing.email) {
          existing.email = apt.email;
        }
        if (apt.message && !existing.notes) {
          existing.notes = apt.message;
        }
        if (apt.age && (!existing.age || existing.age === "—")) {
          existing.age = apt.age;
        }
        if (apt.gender && (!existing.gender || existing.gender === "—")) {
          existing.gender = apt.gender;
        }
        if (apt.parentName && (!existing.parent || existing.parent === "—")) {
          existing.parent = apt.parentName;
        }
      } else {
        const regNum = patientMap.size + 1;
        const pId = formatPatientId(regNum);
        patientMap.set(key, {
          regId: pId,
          name: apt.patientName,
          age: apt.age || "—",
          gender: apt.gender || "—",
          parent: apt.parentName || "—",
          address: "Tumkur",
          phone: apt.phone || "—",
          email: apt.email || "",
          service: apt.department || "Mind & Brain Consultation",
          lastVisit: apt.date || new Date().toISOString().split("T")[0],
          notes: apt.message || "",
        });
      }
    });

    const cleanList = Array.from(patientMap.values()).map((p, idx) => ({
      ...p,
      regId: p.regId && p.regId.startsWith("VK-P") ? p.regId : formatPatientId(idx + 1),
    }));
    setPatients(cleanList);
    return cleanList;
  };

  const refreshPayments = (): PaymentRequest[] => {
    const list = paymentService.getAllRequests();
    setPaymentRequests(list);
    return list;
  };

  // Comprehensive Refresh Handler for the Refresh Button
  const handleRefreshAll = () => {
    setIsRefreshing(true);
    const updatedApts = refreshAppointments();
    refreshPayments();
    refreshPatients(updatedApts);
    setRefreshToast("All clinic records refreshed and synchronized with live data.");
    setTimeout(() => setIsRefreshing(false), 600);
    setTimeout(() => setRefreshToast(""), 3000);
  };

  useEffect(() => {
    if (isOpen) {
      const apts = refreshAppointments();
      refreshPayments();
      refreshPatients(apts);
    }
    const handleSync = () => {
      const apts = refreshAppointments();
      refreshPayments();
      refreshPatients(apts);
    };
    window.addEventListener("vkare_payments_updated", handleSync);
    window.addEventListener("vkare_appointment_booked", handleSync);
    window.addEventListener("vkare_appointments_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("vkare_payments_updated", handleSync);
      window.removeEventListener("vkare_appointment_booked", handleSync);
      window.removeEventListener("vkare_appointments_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [isOpen]);

  // Periodic check if another admin is active
  useEffect(() => {
    if (!isOpen) return;

    const checkLockStatus = () => {
      try {
        const lockRaw = localStorage.getItem("vkare_admin_lock");
        const mySessionId = sessionStorage.getItem("vkare_admin_session_id");
        if (lockRaw) {
          const lock = JSON.parse(lockRaw);
          const isAlive = Date.now() - lock.lastActive < 15000;
          if (isAlive && lock.sessionId !== mySessionId) {
            setIsBlockedByOtherAdmin(true);
            return;
          }
        }
      } catch {
        // ignore
      }
      setIsBlockedByOtherAdmin(false);
    };

    checkLockStatus();
    const interval = setInterval(checkLockStatus, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Heartbeat & single-admin concurrency enforcement while logged in
  useEffect(() => {
    if (!isAuthenticated) return;

    const mySessionId = sessionStorage.getItem("vkare_admin_session_id");

    // Send heartbeat every 3 seconds
    const heartbeat = setInterval(() => {
      try {
        const lockRaw = localStorage.getItem("vkare_admin_lock");
        if (lockRaw) {
          const lock = JSON.parse(lockRaw);
          if (lock.sessionId === mySessionId) {
            lock.lastActive = Date.now();
            localStorage.setItem("vkare_admin_lock", JSON.stringify(lock));
          } else {
            // Another admin session has taken over
            setIsAuthenticated(false);
            localStorage.removeItem("vkare_admin_auth");
            setSessionNotice("Your session was closed because an administrator signed in from another window.");
          }
        }
      } catch {
        // ignore
      }
    }, 3000);

    // Immediate cross-tab lock sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "vkare_admin_lock") {
        if (!e.newValue) {
          setIsAuthenticated(false);
          localStorage.removeItem("vkare_admin_auth");
        } else {
          try {
            const lock = JSON.parse(e.newValue);
            if (lock.sessionId !== mySessionId) {
              setIsAuthenticated(false);
              localStorage.removeItem("vkare_admin_auth");
              setSessionNotice("Another admin session started. Only 1 administrator can access the portal at a time.");
            }
          } catch {
            // ignore
          }
        }
      }
    };

    const handleBeforeUnload = () => {
      try {
        const lockRaw = localStorage.getItem("vkare_admin_lock");
        if (lockRaw) {
          const lock = JSON.parse(lockRaw);
          if (lock.sessionId === mySessionId) {
            localStorage.removeItem("vkare_admin_lock");
            localStorage.removeItem("vkare_admin_auth");
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent, forceTakeover: boolean = false) => {
    if (e) e.preventDefault();
    setLoginError("");

    const rawUser = adminName.trim().toUpperCase();
    const cleanUser = rawUser.replace(/[\s\-_]+/g, " ");
    const rawPass = password.trim().toUpperCase();

    // Supports both "V-KARE MIND CLINIC" and "V-KARE MIND CLINC" (with or without hyphen, any case)
    const isUserValid =
      cleanUser === "V KARE MIND CLINIC" ||
      cleanUser === "V KARE MIND CLINC" ||
      cleanUser === "VKARE MIND CLINIC" ||
      cleanUser === "VKARE MIND CLINC" ||
      rawUser === "V-KARE MIND CLINIC" ||
      rawUser === "V-KARE MIND CLINC" ||
      rawUser === "VKARE MIND CLINIC" ||
      rawUser === "VKARE MIND CLINC";

    // Password: "PSYCHOLOGY" (any case)
    const isPassValid = rawPass === "PSYCHOLOGY";

    if (!isUserValid || !isPassValid) {
      setLoginError("Invalid credentials. Please enter the authorized Admin Name and Password.");
      return;
    }

    // Check if another admin session is currently active
    const lockRaw = localStorage.getItem("vkare_admin_lock");
    const myCurrentSession = sessionStorage.getItem("vkare_admin_session_id");
    if (lockRaw && !forceTakeover) {
      try {
        const lock = JSON.parse(lockRaw);
        const isAlive = Date.now() - lock.lastActive < 15000;
        if (isAlive && lock.sessionId !== myCurrentSession) {
          setIsBlockedByOtherAdmin(true);
          setLoginError("Another admin session is currently active. Only 1 administrator can access at a time.");
          return;
        }
      } catch {
        // ignore
      }
    }

    // Generate unique session for this tab
    const newSessionId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("vkare_admin_session_id", newSessionId);

    const lockData = {
      sessionId: newSessionId,
      adminName: "V-KARE MIND CLINC",
      lastActive: Date.now(),
      loginTime: new Date().toLocaleTimeString(),
    };
    localStorage.setItem("vkare_admin_lock", JSON.stringify(lockData));
    localStorage.setItem("vkare_admin_auth", "true");

    setIsAuthenticated(true);
    setIsBlockedByOtherAdmin(false);
    setSessionNotice("");
    setLoginError("");
    setAdminName("");
    setPassword("");
    refreshAppointments();
  };

  const handleLogout = () => {
    try {
      const lockRaw = localStorage.getItem("vkare_admin_lock");
      const mySessionId = sessionStorage.getItem("vkare_admin_session_id");
      if (lockRaw && mySessionId) {
        const lock = JSON.parse(lockRaw);
        if (lock.sessionId === mySessionId) {
          localStorage.removeItem("vkare_admin_lock");
        }
      }
    } catch {
      // ignore
    }
    localStorage.removeItem("vkare_admin_auth");
    sessionStorage.removeItem("vkare_admin_session_id");
    setIsAuthenticated(false);
  };

  const updateStatus = (id: string, status: "Pending" | "Confirmed" | "Completed" | "Cancelled") => {
    const updated = appointments.map((a) => (a.id === id || a.refId === id ? { ...a, status } : a));
    setAppointments(updated);
    localStorage.setItem("vkare_appointments", JSON.stringify(updated));
    refreshPatients(updated);
    window.dispatchEvent(new CustomEvent("vkare_appointments_updated"));
    setRefreshToast(`Appointment ${id} status updated to: ${status}`);
    setTimeout(() => setRefreshToast(""), 3500);
  };

  const handleApproveAppointment = (apt: AppointmentRecord) => {
    updateStatus(apt.id, "Confirmed");
    setApprovedAppointmentForConfirmation({ ...apt, status: "Confirmed" });
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.patientName || !newApt.phone) return;

    const { refId } = getNextApptRef(newApt.date);
    const patientId = getOrRegisterPatientId(newApt.patientName, newApt.phone, {
      service: newApt.department,
      date: newApt.date,
      message: newApt.message,
      age: newApt.age,
      gender: newApt.gender,
      parentName: newApt.parentName,
    });

    const record: AppointmentRecord = {
      id: refId,
      refId,
      patientId,
      ...newApt,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const updated = [...appointments, record];
    setAppointments(updated);
    localStorage.setItem("vkare_appointments", JSON.stringify(updated));
    refreshPatients(updated);
    window.dispatchEvent(new CustomEvent("vkare_appointments_updated"));
    setShowAddModal(false);
    setRefreshToast(`Walk-in appointment registered: ${refId} (Patient ID: ${patientId}).`);
    setTimeout(() => setRefreshToast(""), 3500);
    setNewApt({
      patientName: "",
      age: "",
      gender: "Male",
      parentName: "",
      phone: "",
      doctor: DOCTORS[0].name,
      department: DOCTORS[0].department,
      date: new Date().toISOString().split("T")[0],
      timeSlot: "11:00 AM - 12:00 PM",
      consultationType: "In-Person (Clinic Visit)",
      message: "Walk-in patient registration",
    });
  };

  const exportToCSV = () => {
    const headers = ["ID", "Patient Name", "Phone", "Doctor", "Date", "Time Slot", "Mode", "Status"];
    const rows = appointments.map((a) => [
      a.id,
      `"${a.patientName}"`,
      a.phone,
      `"${a.doctor}"`,
      a.date,
      `"${a.timeSlot}"`,
      `"${a.consultationType}"`,
      a.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `VKare_Appointments_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Payment Management Handlers ─────────────────────────────────────────────
  const handleVerifyPayment = (paymentId: string) => {
    paymentService.verifyPayment(paymentId, "Administrator");
    refreshPayments();
    setPaymentSuccessToast("Payment verified successfully!");
    setTimeout(() => setPaymentSuccessToast(""), 3000);
  };

  const handleRejectPayment = (paymentId: string) => {
    const reason = window.prompt("Reason for rejecting payment (e.g. UTR mismatch):");
    if (!reason) return;
    paymentService.rejectPayment(paymentId, "Administrator", reason);
    refreshPayments();
    setPaymentSuccessToast("Payment marked as rejected.");
    setTimeout(() => setPaymentSuccessToast(""), 3000);
  };

  const exportPaymentsCSV = () => {
    const headers = [
      "Payment ID",
      "Patient Name",
      "Phone",
      "Doctor",
      "Session Type",
      "Date",
      "Amount (INR)",
      "Status",
      "UPI Reference",
      "Verification Status",
      "Verified By",
      "Verified At",
    ];
    const rows = paymentRequests.map((r) => {
      const txn = paymentService.getTransactionByPaymentId(r.paymentId);
      return [
        `"${r.paymentId}"`,
        `"${r.patientName}"`,
        `"${r.patientPhone}"`,
        `"${r.doctorName}"`,
        `"${r.sessionType}"`,
        `"${r.sessionDate}"`,
        r.amount,
        `"${r.paymentStatus}"`,
        `"${txn?.upiReference || "N/A"}"`,
        `"${txn?.verificationStatus || "Pending"}"`,
        `"${txn?.verifiedBy || "N/A"}"`,
        `"${txn?.verifiedAt || "N/A"}"`,
      ].join(",");
    });
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `VKARE_Payments_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPaymentRequests = paymentRequests.filter((r) => {
    const matchesDoc = payDoctorFilter === "All" || r.doctorName === payDoctorFilter;
    const matchesStatus = payStatusFilter === "All" || r.paymentStatus === payStatusFilter;
    const matchesSearch =
      paySearchTerm === "" ||
      r.patientName.toLowerCase().includes(paySearchTerm.toLowerCase()) ||
      r.patientPhone.includes(paySearchTerm) ||
      r.paymentId.toLowerCase().includes(paySearchTerm.toLowerCase());
    return matchesDoc && matchesStatus && matchesSearch;
  });

  const totalCollectedPayments = paymentRequests
    .filter((r) => r.paymentStatus === "Payment Verified")
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingVerificationCount = paymentRequests.filter(
    (r) => r.paymentStatus === "Payment Submitted"
  ).length;

  const pendingVerificationAmount = paymentRequests
    .filter((r) => r.paymentStatus === "Payment Submitted" || r.paymentStatus === "Payment Requested")
    .reduce((sum, r) => sum + r.amount, 0);

  // Filtered Appointments (with Up-to-Down serial sorting)
  const filteredAppointments = appointments
    .filter((a) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        a.patientName.toLowerCase().includes(term) ||
        a.phone.includes(searchTerm) ||
        a.doctor.toLowerCase().includes(term) ||
        (a.patientId && a.patientId.toLowerCase().includes(term)) ||
        (a.id && a.id.toLowerCase().includes(term));
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const getNum = (id?: string) => {
        if (!id) return 0;
        const m = id.match(/(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      };
      const numA = getNum(a.id || a.refId);
      const numB = getNum(b.id || b.refId);
      return sortOrder === "asc" ? numA - numB : numB - numA;
    });

  // Filtered Patients (Pure Live Data)
  const filteredPatients = patients.filter((p) => {
    if (!patientSearchTerm.trim()) return true;
    const term = patientSearchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      p.regId.toLowerCase().includes(term) ||
      p.service.toLowerCase().includes(term) ||
      p.address.toLowerCase().includes(term)
    );
  });

  // ─── Doctor CRUD ─────────────────────────────────────────────────────────────
  const openAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm(BLANK_DOCTOR);
    setExpertiseText("");
    setEducationText("");
    setShowDoctorModal(true);
  };

  const openEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name,
      title: doc.title,
      qualifications: doc.qualifications,
      specialization: doc.specialization,
      department: doc.department,
      experience: doc.experience,
      image: doc.image,
      consultationFee: doc.consultationFee,
      availability: doc.availability,
      bio: doc.bio,
      expertise: doc.expertise,
      education: doc.education,
      contact: doc.contact || "",
      consultationModes: doc.consultationModes,
    });
    setExpertiseText(doc.expertise.join("\n"));
    setEducationText(doc.education.join("\n"));
    setShowDoctorModal(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    const expertiseArr = expertiseText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const educationArr = educationText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingDoctor) {
      const updated = doctors.map((d) =>
        d.id === editingDoctor.id
          ? { ...d, ...doctorForm, expertise: expertiseArr, education: educationArr }
          : d
      );
      saveDoctors(updated);
    } else {
      const newDoc: Doctor = {
        id: `doc-${Date.now()}`,
        ...doctorForm,
        expertise: expertiseArr,
        education: educationArr,
      };
      saveDoctors([...doctors, newDoc]);
    }
    setShowDoctorModal(false);
  };

  const handleDeleteDoctor = (id: string) => {
    if (!window.confirm("Are you sure you want to remove this doctor?")) return;
    saveDoctors(doctors.filter((d) => d.id !== id));
  };

  const toggleDoctorMode = (mode: "in-person" | "video") => {
    const modes = doctorForm.consultationModes.includes(mode)
      ? doctorForm.consultationModes.filter((m) => m !== mode)
      : [...doctorForm.consultationModes, mode];
    setDoctorForm({ ...doctorForm, consultationModes: modes as ("in-person" | "video")[] });
  };

  // ─── Service CRUD ─────────────────────────────────────────────────────────────
  const openAddService = () => {
    setEditingService(null);
    setServiceForm(BLANK_SERVICE);
    setSymptomsText("");
    setTreatmentsText("");
    setHighlightsText("");
    setShowServiceModal(true);
  };

  const openEditService = (svc: Service) => {
    setEditingService(svc);
    setServiceForm({
      title: svc.title,
      category: svc.category,
      iconName: svc.iconName,
      shortDesc: svc.shortDesc,
      fullDesc: svc.fullDesc,
      symptoms: svc.symptoms,
      treatments: svc.treatments,
      highlights: svc.highlights,
    });
    setSymptomsText(svc.symptoms.join("\n"));
    setTreatmentsText(svc.treatments.join("\n"));
    setHighlightsText(svc.highlights.join(", "));
    setShowServiceModal(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const symptomsArr = symptomsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const treatmentsArr = treatmentsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const highlightsArr = highlightsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingService) {
      const updated = services.map((s) =>
        s.id === editingService.id
          ? { ...s, ...serviceForm, symptoms: symptomsArr, treatments: treatmentsArr, highlights: highlightsArr }
          : s
      );
      saveServices(updated);
    } else {
      const newSvc: Service = {
        id: `svc-${Date.now()}`,
        ...serviceForm,
        symptoms: symptomsArr,
        treatments: treatmentsArr,
        highlights: highlightsArr,
      };
      saveServices([...services, newSvc]);
    }
    setShowServiceModal(false);
  };

  const handleDeleteService = (id: string) => {
    if (!window.confirm("Are you sure you want to remove this service?")) return;
    saveServices(services.filter((s) => s.id !== id));
  };

  // ─── Community Programs CRUD ───────────────────────────────────────────────
  const handleProgramImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProgramForm((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddProgram = () => {
    setEditingProgram(null);
    setProgramForm({
      title: "",
      description: "",
      buttonLabel: "Learn More",
      buttonLink: "#contact",
      color: "#315C49",
      tag: "Community",
      image: "",
    });
    setShowProgramModal(true);
  };

  const openEditProgram = (prog: CommunityProgram) => {
    setEditingProgram(prog);
    setProgramForm({
      title: prog.title,
      description: prog.description,
      buttonLabel: prog.buttonLabel || "Learn More",
      buttonLink: prog.buttonLink || "#contact",
      color: prog.color || "#315C49",
      tag: prog.tag || "Community",
      image: prog.image || "",
    });
    setShowProgramModal(true);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProgram) {
      const updated = programs.map((p) =>
        p.id === editingProgram.id ? { ...p, ...programForm } : p
      );
      savePrograms(updated);
    } else {
      const newProg: CommunityProgram = {
        id: `prog-${Date.now()}`,
        ...programForm,
      };
      savePrograms([...programs, newProg]);
    }
    setShowProgramModal(false);
  };

  const handleDeleteProgram = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this community program?")) return;
    savePrograms(programs.filter((p) => p.id !== id));
  };

  // ─── Awareness Videos CRUD ─────────────────────────────────────────────────
  const handleVideoThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoForm((prev) => ({ ...prev, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddVideo = () => {
    setEditingVideo(null);
    setVideoForm({
      title: "",
      duration: "5 min watch",
      tag: "Mental Health",
      videoUrl: "https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#",
      thumbnail: "",
      gradient: "from-teal-700 to-emerald-600",
    });
    setShowVideoModal(true);
  };

  const openEditVideo = (vid: AwarenessVideo) => {
    setEditingVideo(vid);
    setVideoForm({
      title: vid.title,
      duration: vid.duration,
      tag: vid.tag,
      videoUrl: vid.videoUrl || "https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#",
      thumbnail: vid.thumbnail || "",
      gradient: vid.gradient || "from-teal-700 to-emerald-600",
    });
    setShowVideoModal(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVideo) {
      const updated = videos.map((v) =>
        v.id === editingVideo.id ? { ...v, ...videoForm } : v
      );
      saveVideos(updated);
    } else {
      const newVid: AwarenessVideo = {
        id: `vid-${Date.now()}`,
        ...videoForm,
      };
      saveVideos([...videos, newVid]);
    }
    setShowVideoModal(false);
  };

  const handleDeleteVideo = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    saveVideos(videos.filter((v) => v.id !== id));
  };

  // ─── Awareness Blogs CRUD ──────────────────────────────────────────────────
  const handleBlogThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogForm((prev) => ({ ...prev, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: "",
      duration: "4 min read",
      excerpt: "",
      articleUrl: "#",
      thumbnail: "",
    });
    setShowBlogModal(true);
  };

  const openEditBlog = (b: AwarenessBlog) => {
    setEditingBlog(b);
    setBlogForm({
      title: b.title,
      duration: b.duration,
      excerpt: b.excerpt,
      articleUrl: b.articleUrl || "#",
      thumbnail: b.thumbnail || "",
    });
    setShowBlogModal(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlog) {
      const updated = blogs.map((b) =>
        b.id === editingBlog.id ? { ...b, ...blogForm } : b
      );
      saveBlogs(updated);
    } else {
      const newBlog: AwarenessBlog = {
        id: `blog-${Date.now()}`,
        ...blogForm,
      };
      saveBlogs([...blogs, newBlog]);
    }
    setShowBlogModal(false);
  };

  const handleDeleteBlog = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    saveBlogs(blogs.filter((b) => b.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F7F1] flex flex-col overflow-hidden animate-fadeIn">
      {/* If Not Authenticated: Security Gate */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#E4EDE5] text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#102E28]/60 hover:text-[#102E28] rounded-full hover:bg-[#E4EDE5]/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-[#E4EDE5] text-[#315C49] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>

            <div className="font-serif font-bold text-2xl text-[#102E28] mb-1">
              Universal Admin Portal
            </div>
            <p className="text-xs text-[#315C49] font-semibold uppercase tracking-wider mb-6">
              V-KARE Mind & Brain Clinic • Tumkur
            </p>

            {sessionNotice && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-left">
                {sessionNotice}
              </div>
            )}

            {isBlockedByOtherAdmin && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Admin Session Currently Active</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-700">
                  Another administrator is currently active in the portal. Only 1 admin can access at a time to prevent conflicts.
                </p>
                <button
                  type="button"
                  onClick={(e) => handleLogin(e, true)}
                  className="w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Force Takeover & Log In
                </button>
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e, false)} className="space-y-4">
              <div className="text-left space-y-1">
                <label className="block text-xs font-semibold text-[#102E28] uppercase tracking-wider">
                  Admin Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#315C49]" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Enter Admin Name"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E4EDE5] bg-[#F7F7F1] text-xs text-[#102E28] font-medium focus:outline-none focus:border-[#315C49]"
                    autoFocus
                  />
                </div>
              </div>

              <div className="text-left space-y-1">
                <label className="block text-xs font-semibold text-[#102E28] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#315C49]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E4EDE5] bg-[#F7F7F1] text-xs text-[#102E28] font-medium focus:outline-none focus:border-[#315C49]"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 text-center font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#315C49] hover:bg-[#204033] text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-sm hover:shadow"
              >
                Sign In to Admin Portal
              </button>
            </form>

            <div className="pt-6 border-t border-[#E4EDE5] mt-6 text-[11px] text-[#102E28]/50">
              Only 1 admin session is permitted at a time. Authorized medical administration only.
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Admin Dashboard */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Admin Navigation Header */}
          <header className="bg-[#102E28] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#315C49]/40 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white p-0.5 overflow-hidden flex-shrink-0">
                <img
                  src="/brand/vkare_logo.png"
                  alt="V-KARE Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base sm:text-lg">
                    V-KARE Universal Admin
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold hidden sm:inline">
                    LIVE
                  </span>
                </div>
                <div className="text-[10px] text-emerald-200/70 font-mono">
                  Siddaganga Extension, Tumkur • System Admin Mode
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
                title="Return to Public Website"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to Website</span>
              </button>

              {onOpenDoctorPortal && (
                <button
                  onClick={onOpenDoctorPortal}
                  className="px-3 py-1.5 rounded-lg bg-[#087F8C] hover:bg-[#066570] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Open Doctor Dashboard & Fees"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Doctor Dashboard</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Sub Navigation Bar / Tabs & Stats */}
          <div className="bg-white border-b border-[#E4EDE5] px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 shadow-xs">
            <div className="flex items-center flex-wrap gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab("appointments")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "appointments"
                    ? "bg-[#315C49] text-white shadow-xs"
                    : "text-[#102E28]/70 hover:bg-[#E4EDE5]/60 hover:text-[#102E28]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Appointments ({appointments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("patients")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "patients"
                    ? "bg-[#315C49] text-white shadow-xs"
                    : "text-[#102E28]/70 hover:bg-[#E4EDE5]/60 hover:text-[#102E28]"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Patient Directory ({patients.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("doctors")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "doctors"
                    ? "bg-[#315C49] text-white shadow-xs"
                    : "text-[#102E28]/70 hover:bg-[#E4EDE5]/60 hover:text-[#102E28]"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Doctors ({doctors.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("services")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "services"
                    ? "bg-[#315C49] text-white shadow-xs"
                    : "text-[#102E28]/70 hover:bg-[#E4EDE5]/60 hover:text-[#102E28]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Services ({services.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("programs")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "programs"
                    ? "bg-[#315C49] text-white shadow-xs"
                    : "text-[#102E28]/70 hover:bg-[#E4EDE5]/60 hover:text-[#102E28]"
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Community ({programs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("awareness")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "awareness"
                    ? "bg-[#315C49] text-white shadow-xs"
                    : "text-[#102E28]/70 hover:bg-[#E4EDE5]/60 hover:text-[#102E28]"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Awareness Hub ({videos.length + blogs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("payments")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "payments"
                    ? "bg-[#2878B9] text-white shadow-xs"
                    : "text-[#102E28]/70 hover:bg-[#EAF5FC] hover:text-[#123B66]"
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Payments ({paymentRequests.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-[#315C49] text-white shadow-xs"
                    : "text-[#102E28]/70 hover:bg-[#E4EDE5]/60 hover:text-[#102E28]"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Clinic Info</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#123B66] bg-[#EAF5FC] hover:bg-[#D9EAF5] border border-[#2878B9]/30 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
                title="Refresh All Records & Payments"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#2878B9] ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </button>

              {activeTab === "appointments" && (
                <>
                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#102E28] bg-[#F7F7F1] border border-[#E4EDE5] hover:bg-[#E4EDE5]/70 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#315C49]" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#315C49] hover:bg-[#204033] px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Walk-in</span>
                  </button>
                </>
              )}

              {activeTab === "payments" && (
                <>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123B66] bg-[#EAF5FC] border border-[#D9EAF5] hover:bg-[#D9EAF5] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#2878B9]" />
                    <span>Daily/Monthly Reports</span>
                  </button>
                  <button
                    onClick={exportPaymentsCSV}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2878B9] hover:bg-[#1f5f93] px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </>
              )}

              {activeTab === "doctors" && (
                <button
                  onClick={openAddDoctor}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#315C49] hover:bg-[#204033] px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Doctor</span>
                </button>
              )}

              {activeTab === "services" && (
                <button
                  onClick={openAddService}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#315C49] hover:bg-[#204033] px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Service</span>
                </button>
              )}

              {activeTab === "programs" && (
                <button
                  onClick={openAddProgram}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#315C49] hover:bg-[#204033] px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Community Program</span>
                </button>
              )}

              {activeTab === "awareness" && (
                <button
                  onClick={() => (awarenessSubTab === "videos" ? openAddVideo() : openAddBlog())}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#315C49] hover:bg-[#204033] px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{awarenessSubTab === "videos" ? "Add Video" : "Add Article"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {refreshToast && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{refreshToast}</span>
                </div>
                <button
                  onClick={() => setRefreshToast("")}
                  className="text-emerald-700 hover:text-emerald-900 font-bold px-1.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-[#E4EDE5] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#102E28]/60 tracking-wider">
                  Total Bookings
                </span>
                <div className="font-serif text-2xl font-bold text-[#315C49] mt-0.5">
                  {appointments.length}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">All active slots</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E4EDE5] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#102E28]/60 tracking-wider">
                  Pending Approvals
                </span>
                <div className="font-serif text-2xl font-bold text-amber-600 mt-0.5">
                  {appointments.filter((a) => a.status === "Pending").length}
                </div>
                <span className="text-[10px] text-amber-600 font-medium">Action required</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E4EDE5] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#102E28]/60 tracking-wider">
                  Confirmed Patients
                </span>
                <div className="font-serif text-2xl font-bold text-[#102E28] mt-0.5">
                  {appointments.filter((a) => a.status === "Confirmed").length}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">Scheduled for visit</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E4EDE5] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#102E28]/60 tracking-wider">
                  Active Specialists
                </span>
                <div className="font-serif text-2xl font-bold text-[#315C49] mt-0.5">
                  {doctors.length}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">Tumkur Clinic & Online</span>
              </div>
            </div>

            {/* TAB 1: APPOINTMENTS */}
            {activeTab === "appointments" && (
              <div className="bg-white rounded-2xl border border-[#E4EDE5] shadow-xs overflow-hidden">
                {/* Search & Filter Toolbar */}
                <div className="p-4 border-b border-[#E4EDE5] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#102E28]/50" />
                    <input
                      type="text"
                      placeholder="Search patient, phone, doctor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E4EDE5] text-xs bg-[#F7F7F1]/50 focus:outline-none focus:border-[#315C49]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-3.5 h-3.5 text-[#315C49]" />
                    <span className="text-xs text-[#102E28]/60">Status:</span>
                    {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          statusFilter === s
                            ? "bg-[#E4EDE5] text-[#315C49] font-bold"
                            : "text-[#102E28]/70 hover:bg-[#F7F7F1]"
                        }`}
                      >
                        {s === "Pending" ? "Pending Approval" : s}
                      </button>
                    ))}

                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#D9EAF5] bg-[#EAF5FC] text-[#123B66] hover:bg-[#D9EAF5] transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ml-auto sm:ml-2"
                      title="Toggle serial sequence: Up-to-Down (0001 → 0002) vs Newest First"
                    >
                      <Filter className="w-3 h-3 text-[#2878B9]" />
                      <span>{sortOrder === "asc" ? "Up-to-Down (0001→0002)" : "Newest First"}</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#102E28]">
                    <thead className="bg-[#F7F7F1] text-[#102E28]/60 uppercase text-[10px] font-bold tracking-wider border-b border-[#E4EDE5]">
                      <tr>
                        <th className="py-3 px-3">Patient ID</th>
                        <th className="py-3 px-3">Appt Ref</th>
                        <th className="py-3 px-3">Patient Name</th>
                        <th className="py-3 px-3">Contact Phone</th>
                        <th className="py-3 px-3">Doctor / Specialty</th>
                        <th className="py-3 px-3">Date & Slot</th>
                        <th className="py-3 px-3">Mode</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-4 text-center min-w-[210px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4EDE5]/60">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-[#102E28]/50">
                            No appointments found matching current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((apt, idx) => {
                          const patientIdDisplay = apt.patientId || formatPatientId(idx + 1);

                          return (
                            <tr key={apt.id} className="hover:bg-[#F7F7F1]/50 transition-colors">
                              <td className="py-3.5 px-3 font-mono font-bold text-[#087F8C]">
                                <span className="bg-[#E9F6F3] text-[#087F8C] px-2 py-0.5 rounded-md text-[11px] font-bold border border-[#B8E3DF] whitespace-nowrap">
                                  {patientIdDisplay}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 font-mono font-semibold text-[#123B66] text-[11px] whitespace-nowrap">
                                {apt.id}
                              </td>
                              <td className="py-3.5 px-3 font-semibold text-[#102E28]">
                                <button
                                  onClick={() => setSelectedPatientForDetails({ appointment: { ...apt, patientId: patientIdDisplay } })}
                                  className="font-semibold text-[#102E28] hover:text-[#2878B9] hover:underline text-left cursor-pointer flex flex-col group"
                                  title="Click to view full patient details"
                                >
                                  <span className="group-hover:text-[#2878B9]">{apt.patientName}</span>
                                  {apt.message && (
                                    <span className="text-[10px] text-[#102E28]/50 truncate max-w-[170px] font-normal" title={apt.message}>
                                      Note: {apt.message}
                                    </span>
                                  )}
                                </button>
                              </td>
                              <td className="py-3.5 px-3 font-mono whitespace-nowrap">
                                <a
                                  href={`tel:${apt.phone}`}
                                  className="text-[#315C49] hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{apt.phone}</span>
                                </a>
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="font-medium text-[#102E28]">{apt.doctor}</div>
                                <div className="text-[10px] text-[#102E28]/60">{apt.department}</div>
                              </td>
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div className="font-semibold">{apt.date}</div>
                                <div className="text-[10px] text-[#102E28]/60">{apt.timeSlot}</div>
                              </td>
                              <td className="py-3.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap ${
                                    apt.consultationType.includes("Video")
                                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  {apt.consultationType.includes("Video") ? "Video" : "In-Clinic"}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                    apt.status === "Confirmed"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : apt.status === "Pending"
                                      ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                                      : apt.status === "Completed"
                                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                                      : "bg-red-100 text-red-800 border border-red-300"
                                  }`}
                                >
                                  {apt.status === "Pending" ? "Pending Approval" : apt.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* PENDING: APPROVE & REJECT */}
                                  {apt.status === "Pending" && (
                                    <>
                                      <button
                                        onClick={() => handleApproveAppointment({ ...apt, patientId: patientIdDisplay })}
                                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                        title="Approve Appointment & Send Confirmation to Patient"
                                      >
                                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>Approve</span>
                                      </button>

                                      <button
                                        onClick={() => updateStatus(apt.id, "Cancelled")}
                                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Reject / Cancel Appointment"
                                      >
                                        <Ban className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  {/* CONFIRMED: SEND CONFIRMATION, COMPLETE, CANCEL */}
                                  {apt.status === "Confirmed" && (
                                    <>
                                      <button
                                        onClick={() => setApprovedAppointmentForConfirmation({ ...apt, patientId: patientIdDisplay })}
                                        className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#1ebd5a] text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                        title="Send / Resend Booking Confirmation to Patient via WhatsApp or SMS"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Send Confirmation</span>
                                      </button>

                                      <button
                                        onClick={() => updateStatus(apt.id, "Completed")}
                                        className="px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold text-[11px] transition-colors cursor-pointer"
                                        title="Mark Consultation Completed"
                                      >
                                        Complete
                                      </button>

                                      <button
                                        onClick={() => updateStatus(apt.id, "Cancelled")}
                                        className="p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Cancel Appointment"
                                      >
                                        <Ban className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  {/* COMPLETED */}
                                  {apt.status === "Completed" && (
                                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                                      Completed
                                    </span>
                                  )}

                                  {/* CANCELLED */}
                                  {apt.status === "Cancelled" && (
                                    <button
                                      onClick={() => handleApproveAppointment({ ...apt, patientId: patientIdDisplay })}
                                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[10px] transition-colors cursor-pointer"
                                      title="Re-open & Approve this appointment"
                                    >
                                      Re-Approve
                                    </button>
                                  )}

                                  {/* View Details (Eye) */}
                                  <button
                                    onClick={() => setSelectedPatientForDetails({ appointment: { ...apt, patientId: patientIdDisplay } })}
                                    className="p-1.5 rounded-lg bg-[#EAF5FC] hover:bg-[#D9EAF5] text-[#2878B9] transition-colors cursor-pointer"
                                    title="View Full Patient Details & Notes"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: PATIENTS DIRECTORY */}
            {activeTab === "patients" && (
              <div className="bg-white rounded-2xl border border-[#E4EDE5] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#E4EDE5] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#102E28]">
                      Registered Clinic Patients
                    </h3>
                    <p className="text-xs text-[#102E28]/60">
                      Live directory synchronized with real clinic consultations and bookings
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#102E28]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search patient, phone, reg ID..."
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F7F1] border border-[#E4EDE5] rounded-xl text-[#102E28] placeholder-[#102E28]/40 focus:outline-hidden focus:border-[#315C49]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#102E28]">
                    <thead className="bg-[#F7F7F1] text-[#102E28]/60 uppercase text-[10px] font-bold tracking-wider border-b border-[#E4EDE5]">
                      <tr>
                        <th className="py-3 px-4">Reg ID</th>
                        <th className="py-3 px-4">Patient Name</th>
                        <th className="py-3 px-4">Age / Sex</th>
                        <th className="py-3 px-4">Parents / Guardian</th>
                        <th className="py-3 px-4">Address</th>
                        <th className="py-3 px-4">Mobile</th>
                        <th className="py-3 px-4">Department / Clinical Notes</th>
                        <th className="py-3 px-4">Last Visit</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4EDE5]/60">
                      {filteredPatients.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-[#102E28]/60">
                            <Users className="w-8 h-8 mx-auto text-[#102E28]/30 mb-2" />
                            <p className="font-semibold text-sm text-[#102E28]">No Patient Records Found</p>
                            <p className="text-xs text-[#102E28]/50 mt-1">
                              Live records: Patient entries will automatically appear here when appointments are booked or walk-ins are recorded.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredPatients.map((p) => (
                          <tr key={p.regId} className="hover:bg-[#F7F7F1]/50">
                            <td className="py-3 px-4 font-mono font-bold text-[#315C49]">
                              {p.regId}
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#102E28]">
                              <button
                                onClick={() => {
                                  const match = appointments.find(
                                    (a) => a.phone === p.phone || a.patientName.toLowerCase() === p.name.toLowerCase()
                                  );
                                  setSelectedPatientForDetails({ patient: p, appointment: match });
                                }}
                                className="font-semibold text-[#102E28] hover:text-[#2878B9] hover:underline text-left cursor-pointer"
                              >
                                {p.name}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              {p.age} • {p.gender}
                            </td>
                            <td className="py-3 px-4 text-[#102E28]/80">{p.parent || "—"}</td>
                            <td className="py-3 px-4 text-[#102E28]/80">{p.address}</td>
                            <td className="py-3 px-4 font-mono">
                              <a
                                href={`tel:${p.phone}`}
                                className="text-[#315C49] hover:underline"
                              >
                                {p.phone}
                              </a>
                            </td>
                            <td className="py-3 px-4 text-[#315C49] font-medium">{p.service}</td>
                            <td className="py-3 px-4 font-mono text-[11px] text-[#102E28]/60">
                              {p.lastVisit}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  const match = appointments.find(
                                    (a) => a.phone === p.phone || a.patientName.toLowerCase() === p.name.toLowerCase()
                                  );
                                  setSelectedPatientForDetails({ patient: p, appointment: match });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF5FC] hover:bg-[#D9EAF5] text-[#123B66] text-xs font-semibold transition-colors cursor-pointer"
                                title="View Patient Details"
                              >
                                <Eye className="w-3 h-3 text-[#2878B9]" />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: DOCTORS MANAGEMENT */}
            {activeTab === "doctors" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white p-5 rounded-2xl border border-[#E4EDE5] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="w-14 h-14 rounded-xl object-cover object-top border border-[#E4EDE5]"
                        />
                        <div>
                          <h4 className="font-serif font-bold text-base text-[#102E28]">
                            {doc.name}
                          </h4>
                          <p className="text-[11px] text-[#315C49] font-semibold">
                            {doc.qualifications}
                          </p>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold mt-1 inline-block">
                            {doc.department}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-[#102E28]/70 pt-2 border-t border-[#E4EDE5]/60 mb-3">
                        <div>
                          <strong>Session Duration:</strong> 30 – 45 mins
                        </div>
                        <div>
                          <strong>Hours:</strong> {doc.availability}
                        </div>
                        <div>
                          <strong>Contact:</strong>{" "}
                          <a
                            href={`tel:${doc.contact || CLINIC_INFO.phone}`}
                            className="text-[#315C49] hover:underline"
                          >
                            {doc.contact || CLINIC_INFO.phone}
                          </a>
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {doc.consultationModes.map((m) => (
                            <span
                              key={m}
                              className="text-[10px] bg-[#E4EDE5] text-[#315C49] px-2 py-0.5 rounded-full font-medium capitalize"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <a
                        href={`tel:${doc.contact || CLINIC_INFO.phone}`}
                        className="flex-1 py-1.5 rounded-lg border border-[#315C49]/30 text-[#315C49] text-center text-xs font-semibold hover:bg-[#E4EDE5]/40"
                      >
                        Call Doctor
                      </a>
                      <button
                        onClick={() => openEditDoctor(doc)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E4EDE5] text-[#315C49] text-xs font-semibold hover:bg-[#315C49] hover:text-white transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: COMMUNITY AWARENESS & PROGRAMS */}
            {activeTab === "programs" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E4EDE5] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#102E28]">
                      Community Outreach & Awareness Programs
                    </h3>
                    <p className="text-xs text-[#102E28]/60 mt-0.5">
                      Manage community initiatives, workshops, camps, and add program photos.
                    </p>
                  </div>
                  <button
                    onClick={openAddProgram}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#315C49] hover:bg-[#204033] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Program</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {programs.map((prog) => (
                    <div
                      key={prog.id}
                      className="bg-white rounded-2xl border border-[#E4EDE5] shadow-xs overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {prog.image ? (
                          <div className="h-44 w-full relative overflow-hidden bg-emerald-950/20 border-b border-[#E4EDE5]">
                            <img
                              src={prog.image}
                              alt={prog.title}
                              className="w-full h-full object-cover"
                            />
                            {prog.tag && (
                              <span className="absolute top-3 left-3 text-[10px] font-bold text-emerald-300 bg-[#102E28]/85 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                {prog.tag}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 pb-0 flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-[#E4EDE5] flex items-center justify-center text-[#315C49]">
                              <HeartHandshake className="w-5 h-5" />
                            </div>
                            {prog.tag && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                                {prog.tag}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="p-4">
                          <h4 className="font-serif font-bold text-base text-[#102E28] mb-1 leading-snug">
                            {prog.title}
                          </h4>
                          <p className="text-xs text-[#102E28]/70 line-clamp-3 leading-relaxed mb-3">
                            {prog.description}
                          </p>
                          <div className="text-[11px] text-[#315C49] font-semibold flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-[#F7F7F1] border border-[#E4EDE5]">
                              Button: {prog.buttonLabel || "Learn More"}
                            </span>
                            <span className="text-[#102E28]/50 truncate max-w-[150px]">
                              → {prog.buttonLink || "#contact"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-2 border-t border-[#E4EDE5]/60 flex items-center gap-2">
                        <button
                          onClick={() => openEditProgram(prog)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#E4EDE5] text-[#315C49] text-xs font-semibold hover:bg-[#315C49] hover:text-white transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit Program</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(prog.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: AWARENESS HUB (VIDEOS & BLOGS) */}
            {activeTab === "awareness" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E4EDE5] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#102E28]">
                      Awareness Hub Management
                    </h3>
                    <p className="text-xs text-[#102E28]/60 mt-0.5">
                      Publish educational mental health videos, reels, blogs, and awareness articles.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex bg-[#F7F7F1] p-1 rounded-xl border border-[#E4EDE5]">
                      <button
                        onClick={() => setAwarenessSubTab("videos")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          awarenessSubTab === "videos"
                            ? "bg-[#315C49] text-white shadow-xs"
                            : "text-[#102E28]/70 hover:text-[#315C49]"
                        }`}
                      >
                        Videos ({videos.length})
                      </button>
                      <button
                        onClick={() => setAwarenessSubTab("blogs")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          awarenessSubTab === "blogs"
                            ? "bg-[#315C49] text-white shadow-xs"
                            : "text-[#102E28]/70 hover:text-[#315C49]"
                        }`}
                      >
                        Articles & Blogs ({blogs.length})
                      </button>
                    </div>

                    <button
                      onClick={() => (awarenessSubTab === "videos" ? openAddVideo() : openAddBlog())}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#315C49] hover:bg-[#204033] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{awarenessSubTab === "videos" ? "+ Add Video" : "+ Add Article"}</span>
                    </button>
                  </div>
                </div>

                {awarenessSubTab === "videos" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {videos.map((vid) => (
                      <div
                        key={vid.id}
                        className="bg-white rounded-2xl border border-[#E4EDE5] shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          <div
                            className={`h-40 relative flex items-center justify-center overflow-hidden ${
                              vid.thumbnail
                                ? "bg-black/30"
                                : `bg-gradient-to-br ${vid.gradient || "from-teal-700 to-emerald-600"}`
                            }`}
                          >
                            {vid.thumbnail && (
                              <img
                                src={vid.thumbnail}
                                alt={vid.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-90"
                              />
                            )}
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50 text-white relative z-10 shadow-md">
                              <Video className="w-6 h-6" />
                            </div>
                            <span className="absolute bottom-2.5 right-2.5 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
                              {vid.duration}
                            </span>
                            <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
                              {vid.tag}
                            </span>
                          </div>

                          <div className="p-4">
                            <h4 className="font-serif font-bold text-sm text-[#102E28] mb-1.5 leading-snug">
                              {vid.title}
                            </h4>
                            <a
                              href={vid.videoUrl || "https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#315C49] hover:underline flex items-center gap-1 font-medium truncate"
                            >
                              <span>Watch: {vid.videoUrl || "Instagram Clinic Page"}</span>
                            </a>
                          </div>
                        </div>

                        <div className="p-4 pt-2 border-t border-[#E4EDE5]/60 flex items-center gap-2">
                          <button
                            onClick={() => openEditVideo(vid)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#E4EDE5] text-[#315C49] text-xs font-semibold hover:bg-[#315C49] hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit Video</span>
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {blogs.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white rounded-2xl border border-[#E4EDE5] shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          {b.thumbnail ? (
                            <div className="h-40 w-full relative overflow-hidden bg-black/10 border-b border-[#E4EDE5]">
                              <img
                                src={b.thumbnail}
                                alt={b.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-2.5 right-2.5 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                {b.duration}
                              </span>
                            </div>
                          ) : (
                            <div className="p-4 pb-0 flex items-center justify-between">
                              <div className="w-10 h-10 rounded-xl bg-[#E4EDE5] flex items-center justify-center text-[#315C49]">
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                                {b.duration}
                              </span>
                            </div>
                          )}

                          <div className="p-4">
                            <h4 className="font-serif font-bold text-sm text-[#102E28] mb-1.5 leading-snug">
                              {b.title}
                            </h4>
                            <p className="text-xs text-[#102E28]/70 line-clamp-3 leading-relaxed mb-2">
                              {b.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 pt-2 border-t border-[#E4EDE5]/60 flex items-center gap-2">
                          <button
                            onClick={() => openEditBlog(b)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#E4EDE5] text-[#315C49] text-xs font-semibold hover:bg-[#315C49] hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit Article</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(b.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SERVICES MANAGEMENT */}
            {activeTab === "services" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-white p-5 rounded-2xl border border-[#E4EDE5] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E4EDE5] flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-5 h-5 text-[#315C49]" />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-[#102E28] leading-tight">
                            {svc.title}
                          </h4>
                          <span className="text-[10px] bg-[#E4EDE5] text-[#315C49] px-2 py-0.5 rounded-full font-semibold capitalize inline-block mt-1">
                            {svc.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#102E28]/70 line-clamp-3 leading-relaxed">
                        {svc.shortDesc}
                      </p>
                      {svc.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {svc.highlights.slice(0, 3).map((h) => (
                            <span
                              key={h}
                              className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-[#E4EDE5]/60">
                      <button
                        onClick={() => openEditService(svc)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#E4EDE5] text-[#315C49] text-xs font-semibold hover:bg-[#315C49] hover:text-white transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit Service
                      </button>
                      <button
                        onClick={() => handleDeleteService(svc.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: COMMUNITY AWARENESS & PROGRAMS */}
            {activeTab === "programs" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E4EDE5] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#102E28]">
                      Community Outreach & Awareness Programs
                    </h3>
                    <p className="text-xs text-[#102E28]/60 mt-0.5">
                      Manage community initiatives, workshops, camps, and add program photos.
                    </p>
                  </div>
                  <button
                    onClick={openAddProgram}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#315C49] hover:bg-[#204033] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Program</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {programs.map((prog) => (
                    <div
                      key={prog.id}
                      className="bg-white rounded-2xl border border-[#E4EDE5] shadow-xs overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {prog.image ? (
                          <div className="h-44 w-full relative overflow-hidden bg-emerald-950/20 border-b border-[#E4EDE5]">
                            <img
                              src={prog.image}
                              alt={prog.title}
                              className="w-full h-full object-cover"
                            />
                            {prog.tag && (
                              <span className="absolute top-3 left-3 text-[10px] font-bold text-emerald-300 bg-[#102E28]/85 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                {prog.tag}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 pb-0 flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-[#E4EDE5] flex items-center justify-center text-[#315C49]">
                              <HeartHandshake className="w-5 h-5" />
                            </div>
                            {prog.tag && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                                {prog.tag}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="p-4">
                          <h4 className="font-serif font-bold text-base text-[#102E28] mb-1 leading-snug">
                            {prog.title}
                          </h4>
                          <p className="text-xs text-[#102E28]/70 line-clamp-3 leading-relaxed mb-3">
                            {prog.description}
                          </p>
                          <div className="text-[11px] text-[#315C49] font-semibold flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-[#F7F7F1] border border-[#E4EDE5]">
                              Button: {prog.buttonLabel || "Learn More"}
                            </span>
                            <span className="text-[#102E28]/50 truncate max-w-[150px]">
                              → {prog.buttonLink || "#contact"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-2 border-t border-[#E4EDE5]/60 flex items-center gap-2">
                        <button
                          onClick={() => openEditProgram(prog)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#E4EDE5] text-[#315C49] text-xs font-semibold hover:bg-[#315C49] hover:text-white transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit Program</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(prog.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: AWARENESS HUB (VIDEOS & BLOGS) */}
            {activeTab === "awareness" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E4EDE5] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#102E28]">
                      Awareness Hub Management
                    </h3>
                    <p className="text-xs text-[#102E28]/60 mt-0.5">
                      Publish educational mental health videos, reels, blogs, and awareness articles.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex bg-[#F7F7F1] p-1 rounded-xl border border-[#E4EDE5]">
                      <button
                        onClick={() => setAwarenessSubTab("videos")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          awarenessSubTab === "videos"
                            ? "bg-[#315C49] text-white shadow-xs"
                            : "text-[#102E28]/70 hover:text-[#315C49]"
                        }`}
                      >
                        Videos ({videos.length})
                      </button>
                      <button
                        onClick={() => setAwarenessSubTab("blogs")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          awarenessSubTab === "blogs"
                            ? "bg-[#315C49] text-white shadow-xs"
                            : "text-[#102E28]/70 hover:text-[#315C49]"
                        }`}
                      >
                        Articles & Blogs ({blogs.length})
                      </button>
                    </div>

                    <button
                      onClick={() => (awarenessSubTab === "videos" ? openAddVideo() : openAddBlog())}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#315C49] hover:bg-[#204033] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{awarenessSubTab === "videos" ? "+ Add Video" : "+ Add Article"}</span>
                    </button>
                  </div>
                </div>

                {awarenessSubTab === "videos" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {videos.map((vid) => (
                      <div
                        key={vid.id}
                        className="bg-white rounded-2xl border border-[#E4EDE5] shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          <div
                            className={`h-40 relative flex items-center justify-center overflow-hidden ${
                              vid.thumbnail
                                ? "bg-black/30"
                                : `bg-gradient-to-br ${vid.gradient || "from-teal-700 to-emerald-600"}`
                            }`}
                          >
                            {vid.thumbnail && (
                              <img
                                src={vid.thumbnail}
                                alt={vid.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-90"
                              />
                            )}
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50 text-white relative z-10 shadow-md">
                              <Video className="w-6 h-6" />
                            </div>
                            <span className="absolute bottom-2.5 right-2.5 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
                              {vid.duration}
                            </span>
                            <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
                              {vid.tag}
                            </span>
                          </div>

                          <div className="p-4">
                            <h4 className="font-serif font-bold text-sm text-[#102E28] mb-1.5 leading-snug">
                              {vid.title}
                            </h4>
                            <a
                              href={vid.videoUrl || "https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#315C49] hover:underline flex items-center gap-1 font-medium truncate"
                            >
                              <span>Watch: {vid.videoUrl || "Instagram Clinic Page"}</span>
                            </a>
                          </div>
                        </div>

                        <div className="p-4 pt-2 border-t border-[#E4EDE5]/60 flex items-center gap-2">
                          <button
                            onClick={() => openEditVideo(vid)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#E4EDE5] text-[#315C49] text-xs font-semibold hover:bg-[#315C49] hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit Video</span>
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {blogs.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white rounded-2xl border border-[#E4EDE5] shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          {b.thumbnail ? (
                            <div className="h-40 w-full relative overflow-hidden bg-black/10 border-b border-[#E4EDE5]">
                              <img
                                src={b.thumbnail}
                                alt={b.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-2.5 right-2.5 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                {b.duration}
                              </span>
                            </div>
                          ) : (
                            <div className="p-4 pb-0 flex items-center justify-between">
                              <div className="w-10 h-10 rounded-xl bg-[#E4EDE5] flex items-center justify-center text-[#315C49]">
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                                {b.duration}
                              </span>
                            </div>
                          )}

                          <div className="p-4">
                            <h4 className="font-serif font-bold text-sm text-[#102E28] mb-1.5 leading-snug">
                              {b.title}
                            </h4>
                            <p className="text-xs text-[#102E28]/70 line-clamp-3 leading-relaxed mb-2">
                              {b.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 pt-2 border-t border-[#E4EDE5]/60 flex items-center gap-2">
                          <button
                            onClick={() => openEditBlog(b)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#E4EDE5] text-[#315C49] text-xs font-semibold hover:bg-[#315C49] hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit Article</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(b.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PAYMENTS MANAGEMENT */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                {/* Header & Quick stats */}
                <div className="bg-white rounded-2xl border border-[#D9EAF5] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-[#123B66]">
                        Consultation Fees & Payment Verification
                      </h3>
                      <span className="text-[10px] font-bold bg-[#EAF5FC] text-[#2878B9] px-2.5 py-0.5 rounded-full border border-[#D9EAF5]">
                        UPI & Direct Pay
                      </span>
                    </div>
                    <p className="text-xs text-[#26384A]/70 mt-1">
                      Audit doctor payment requests, confirm patient UPI UTR references, and generate daily/monthly accounts.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF5FC] hover:bg-[#D9EAF5] text-[#123B66] text-xs font-semibold transition-colors cursor-pointer border border-[#D9EAF5]"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#2878B9]" />
                      <span>Financial Reports</span>
                    </button>

                    <button
                      onClick={exportPaymentsCSV}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2878B9] hover:bg-[#1f5f93] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {paymentSuccessToast && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-fadeIn">
                    <span>{paymentSuccessToast}</span>
                    <button
                      onClick={() => setPaymentSuccessToast("")}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* 4 Analytics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D9EAF5] shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[#26384A]/60 font-semibold mb-1">
                      <span>Verified Collections</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="font-serif text-2xl font-bold text-emerald-700">₹{totalCollectedPayments}</p>
                    <span className="text-[10px] text-emerald-600 block mt-1">
                      {paymentRequests.filter((r) => r.paymentStatus === "Payment Verified").length} verified payments
                    </span>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D9EAF5] shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[#26384A]/60 font-semibold mb-1">
                      <span>Pending Verification</span>
                      <Clock className="w-4 h-4 text-[#2878B9]" />
                    </div>
                    <p className="font-serif text-2xl font-bold text-[#2878B9]">₹{pendingVerificationAmount}</p>
                    <span className="text-[10px] text-[#2878B9] block mt-1">
                      {pendingVerificationCount} submissions awaiting check
                    </span>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D9EAF5] shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[#26384A]/60 font-semibold mb-1">
                      <span>Total Requests</span>
                      <IndianRupee className="w-4 h-4 text-[#087F8C]" />
                    </div>
                    <p className="font-serif text-2xl font-bold text-[#123B66]">{paymentRequests.length}</p>
                    <span className="text-[10px] text-[#087F8C] block mt-1">
                      Across all clinical disciplines
                    </span>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D9EAF5] shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[#26384A]/60 font-semibold mb-1">
                      <span>Configured Doctors</span>
                      <Stethoscope className="w-4 h-4 text-[#123B66]" />
                    </div>
                    <p className="font-serif text-2xl font-bold text-[#123B66]">{DOCTORS.length}</p>
                    <span className="text-[10px] text-[#26384A]/60 block mt-1">
                      Individual fees & UPI QR codes
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-[#D9EAF5] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#26384A]/50" />
                    <input
                      type="text"
                      placeholder="Search by patient name, phone, or payment ID..."
                      value={paySearchTerm}
                      onChange={(e) => setPaySearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs text-[#123B66] focus:outline-none focus:border-[#2878B9]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#26384A]/60 font-semibold">Doctor:</span>
                    <select
                      value={payDoctorFilter}
                      onChange={(e) => setPayDoctorFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs font-semibold text-[#123B66] focus:outline-none"
                    >
                      <option value="All">All Doctors</option>
                      {DOCTORS.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#26384A]/60 font-semibold">Status:</span>
                    <select
                      value={payStatusFilter}
                      onChange={(e) => setPayStatusFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-[#D9EAF5] bg-[#F8FBFE] text-xs font-semibold text-[#123B66] focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Payment Requested">Payment Requested</option>
                      <option value="Payment Submitted">Payment Submitted</option>
                      <option value="Payment Verified">Payment Verified</option>
                      <option value="Payment Rejected">Payment Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Payment Requests Table */}
                <div className="bg-white rounded-2xl border border-[#D9EAF5] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#EAF5FC] text-[#123B66] uppercase text-[10px] font-bold tracking-wider border-b border-[#D9EAF5]">
                        <tr>
                          <th className="py-3 px-4">Payment ID</th>
                          <th className="py-3 px-4">Patient Info</th>
                          <th className="py-3 px-4">Doctor</th>
                          <th className="py-3 px-4">Session / Date</th>
                          <th className="py-3 px-4">Fee (₹)</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Transaction UTR</th>
                          <th className="py-3 px-4 text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D9EAF5]/60 text-[#26384A]">
                        {filteredPaymentRequests.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-10 text-center text-[#26384A]/50">
                              No payment requests found matching your filter.
                            </td>
                          </tr>
                        ) : (
                          filteredPaymentRequests.map((req) => {
                            const txn = paymentService.getTransactionByPaymentId(req.paymentId);
                            return (
                              <tr key={req.paymentId} className="hover:bg-[#F8FBFE] transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-[#2878B9]">
                                  {req.paymentId}
                                </td>
                                <td className="py-3 px-4">
                                  <p className="font-bold text-[#123B66]">{req.patientName}</p>
                                  <p className="text-[10px] text-[#26384A]/60">{req.patientPhone}</p>
                                </td>
                                <td className="py-3 px-4 font-medium text-[#123B66]">
                                  {req.doctorName}
                                </td>
                                <td className="py-3 px-4 text-[11px]">
                                  <p className="font-semibold text-[#123B66]">{req.sessionType}</p>
                                  <p className="text-[10px] text-[#26384A]/60">{req.sessionDate}</p>
                                </td>
                                <td className="py-3 px-4 font-bold text-[#123B66]">
                                  ₹{req.amount}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      req.paymentStatus === "Payment Verified"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : req.paymentStatus === "Payment Submitted"
                                        ? "bg-blue-100 text-blue-800 animate-pulse"
                                        : req.paymentStatus === "Payment Rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {req.paymentStatus}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-[11px]">
                                  {txn ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-[#123B66]">{txn.upiReference}</span>
                                      {txn.screenshot && (
                                        <button
                                          onClick={() => setPreviewScreenshot(txn.screenshot || null)}
                                          className="text-[#2878B9] hover:text-[#123B66] p-0.5 cursor-pointer"
                                          title="View Screenshot Proof"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[#26384A]/40 italic">Awaiting UTR</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="inline-flex items-center gap-1.5">
                                    {/* Open Patient View */}
                                    <button
                                      onClick={() => onOpenPatientPayment?.(req.paymentId)}
                                      className="p-1.5 rounded-lg bg-[#EAF5FC] hover:bg-[#D9EAF5] text-[#2878B9] cursor-pointer"
                                      title="Open Patient Payment Screen"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Resend WhatsApp */}
                                    <a
                                      href={paymentService.getWhatsAppPaymentUrl(req)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                                      title="Resend WhatsApp Alert to Patient"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                    </a>

                                    {/* Verify Button */}
                                    {req.paymentStatus !== "Payment Verified" && (
                                      <button
                                        onClick={() => handleVerifyPayment(req.paymentId)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                                        title="Verify Payment"
                                      >
                                        Verify
                                      </button>
                                    )}

                                    {/* Reject Button */}
                                    {req.paymentStatus !== "Payment Rejected" && (
                                      <button
                                        onClick={() => handleRejectPayment(req.paymentId)}
                                        className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold cursor-pointer transition-colors"
                                        title="Reject Payment"
                                      >
                                        Reject
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CLINIC SETTINGS */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl border border-[#E4EDE5] p-6 max-w-2xl shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-lg text-[#102E28] mb-1">
                  Clinic Configuration & Contact Routing
                </h3>
                <p className="text-xs text-[#102E28]/60 mb-4">
                  Active contact and branch parameters for V-KARE Mind & Brain Clinic
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-emerald-800 font-semibold block mb-0.5">
                      🔔 Patient Appointment Notification Target Line
                    </span>
                    <span className="font-mono font-bold text-[#315C49] text-sm">
                      +91 {CLINIC_INFO.appointmentAlertPhone || "9980999068"}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">
                      Automatic destination for all incoming patient booking notifications via WhatsApp & SMS.
                    </span>
                  </div>

                  <div className="p-3 bg-[#F7F7F1] rounded-xl border border-[#E4EDE5]">
                    <span className="text-[#102E28]/60 block mb-0.5">Primary Contact Line</span>
                    <span className="font-mono font-bold text-[#315C49] text-sm">
                      {CLINIC_INFO.phone}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F7F7F1] rounded-xl border border-[#E4EDE5]">
                    <span className="text-[#102E28]/60 block mb-0.5">Landline / Reception</span>
                    <span className="font-mono font-bold text-[#102E28] text-sm">
                      {CLINIC_INFO.landline}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F7F7F1] rounded-xl border border-[#E4EDE5]">
                    <span className="text-[#102E28]/60 block mb-0.5">Physical Clinic Address</span>
                    <span className="font-medium text-[#102E28] text-sm">
                      {CLINIC_INFO.address}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F7F7F1] rounded-xl border border-[#E4EDE5]">
                    <span className="text-[#102E28]/60 block mb-0.5">Clinic Email</span>
                    <span className="font-medium text-[#102E28] text-sm">
                      {CLINIC_INFO.email}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Post-Approval Patient Booking Confirmation Dispatch Modal */}
          {approvedAppointmentForConfirmation && (() => {
            const apt = approvedAppointmentForConfirmation;
            const patientCleanPhone = (apt.phone || "").replace(/[^0-9]/g, "");
            const pId = apt.patientId || "VK-P001";

            const whatsappUrl = `https://api.whatsapp.com/send?phone=91${patientCleanPhone}&text=${encodeURIComponent(
              `🏥 *V-KARE Mind & Brain Clinic, Tumkur*\n\n` +
              `Dear *${apt.patientName}*,\n` +
              `Your consultation appointment has been *APPROVED & CONFIRMED*!\n\n` +
              `• *Patient ID:* ${pId}\n` +
              `• *Booking Ref ID:* ${apt.id}\n` +
              `• *Specialist:* ${apt.doctor} (${apt.department})\n` +
              `• *Date:* ${apt.date}\n` +
              `• *Time Slot:* ${apt.timeSlot}\n` +
              `• *Consultation Mode:* ${apt.consultationType}\n` +
              `• *Clinic Address:* 3rd Cross, Siddaganga Extension, Tumkur.\n\n` +
              `Clinic Helpline: +91 9980999068 / 8317399068\n` +
              `Please arrive 10 mins prior to your slot. Thank you!`
            )}`;

            const smsUrl = `sms:+91${patientCleanPhone}?&body=${encodeURIComponent(
              `V-KARE CLINIC: Dear ${apt.patientName}, your appointment with ${apt.doctor} on ${apt.date} (${apt.timeSlot}) is APPROVED & CONFIRMED. Patient ID: ${pId}, Booking Ref: ${apt.id}. Helpline: 9980999068.`
            )}`;

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-200 overflow-hidden relative">
                  <div className="p-6 bg-gradient-to-r from-emerald-700 to-teal-700 text-white relative">
                    <button
                      onClick={() => setApprovedAppointmentForConfirmation(null)}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                        Appointment Approved!
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold">
                      Send Confirmation to Patient
                    </h3>
                    <p className="text-xs text-white/80 mt-1">
                      Appointment is now Confirmed. Dispatch the official booking confirmation to the patient:
                    </p>
                  </div>

                  <div className="p-6 space-y-4 text-xs">
                    <div className="bg-[#EAF5FC] p-4 rounded-2xl border border-[#D9EAF5] space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#26384A]/60 font-medium">Patient:</span>
                        <span className="font-bold text-[#123B66]">
                          {apt.patientName} <span className="font-mono text-[#087F8C]">({pId})</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#26384A]/60 font-medium">Booking Ref:</span>
                        <span className="font-mono font-bold text-[#2878B9]">
                          {apt.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#26384A]/60 font-medium">Doctor:</span>
                        <span className="font-semibold text-[#102E28]">
                          {apt.doctor}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#26384A]/60 font-medium">Date & Slot:</span>
                        <span className="font-bold text-[#102E28]">
                          {apt.date} ({apt.timeSlot})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#26384A]/60 font-medium">Patient Mobile:</span>
                        <span className="font-mono font-bold text-[#102E28]">
                          {apt.phone}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Send WhatsApp Confirmation to Patient</span>
                      </a>

                      <a
                        href={smsUrl}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#087F8C] hover:bg-[#066570] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send SMS Confirmation to Patient</span>
                      </a>

                      <button
                        onClick={() => setApprovedAppointmentForConfirmation(null)}
                        className="w-full py-2 text-center text-xs font-semibold text-[#102E28]/60 hover:text-[#102E28] cursor-pointer"
                      >
                        Done / Return to Appointments Table
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Patient Details & Clinical Consultation Modal */}
          {selectedPatientForDetails && (() => {
            const apt = selectedPatientForDetails.appointment;
            const pat = selectedPatientForDetails.patient;
            const patientIdVal = apt?.patientId || pat?.regId || "VK-P001";
            const aptRefVal = apt?.id || apt?.refId || "—";
            const patientNameVal = apt?.patientName || pat?.name || "Patient";
            const phoneVal = apt?.phone || pat?.phone || "";
            const phoneClean = phoneVal.replace(/[^0-9]/g, "");
            const doctorVal = apt?.doctor || "V-KARE Specialist";
            const deptVal = apt?.department || pat?.service || "Mind & Brain Care";
            const dateVal = apt?.date || pat?.lastVisit || "Recent";
            const slotVal = apt?.timeSlot || "Clinic Working Hours";
            const modeVal = apt?.consultationType || "In-Person (Clinic Visit)";
            const notesVal = apt?.message || pat?.notes || "No additional problem notes specified by patient during online booking.";
            const currentStatus = apt?.status || "Pending";

            const whatsappPatientConfirm = `https://api.whatsapp.com/send?phone=91${phoneClean}&text=${encodeURIComponent(
              `🏥 *V-KARE MIND & BRAIN CLINIC - APPOINTMENT CONFIRMATION*\n\n` +
              `Dear *${patientNameVal}*,\n` +
              `Your appointment has been confirmed at V-KARE Clinic.\n\n` +
              `• *Patient ID:* ${patientIdVal}\n` +
              `• *Booking Ref ID:* ${aptRefVal}\n` +
              `• *Specialist:* ${doctorVal} (${deptVal})\n` +
              `• *Date:* ${dateVal}\n` +
              `• *Time Slot:* ${slotVal}\n` +
              `• *Consultation Mode:* ${modeVal}\n` +
              `• *Clinic Address:* 3rd Cross, Siddaganga Extension, Tumkur.\n\n` +
              `Clinic Helpline: +91 9980999068 / 8317399068\n` +
              `Please arrive 10 mins prior to your slot. Thank you!`
            )}`;

            const smsPatientConfirm = `sms:+91${phoneClean}?&body=${encodeURIComponent(
              `V-KARE CLINIC: Dear ${patientNameVal}, your appointment with ${doctorVal} on ${dateVal} (${slotVal}) is CONFIRMED. Patient ID: ${patientIdVal}, Booking Ref: ${aptRefVal}. Clinic Helpline: 9980999068.`
            )}`;

            const whatsappDoctorDesk = `https://api.whatsapp.com/send?phone=919980999068&text=${encodeURIComponent(
              `🔔 *V-KARE DOCTOR / DESK ALERT*\n\n` +
              `• *Patient ID:* ${patientIdVal}\n` +
              `• *Booking Ref:* ${aptRefVal}\n` +
              `• *Patient:* ${patientNameVal}\n` +
              `• *Mobile:* ${phoneVal}\n` +
              `• *Doctor:* ${doctorVal}\n` +
              `• *Department:* ${deptVal}\n` +
              `• *Date & Slot:* ${dateVal} (${slotVal})\n` +
              `• *Mode:* ${modeVal}\n` +
              (apt?.message ? `• *Notes:* ${apt.message}\n` : "") +
              `• *Status:* ${currentStatus}`
            )}`;

            const smsDoctorDesk = `sms:+919980999068?&body=${encodeURIComponent(
              `V-KARE DOCTOR ALERT: Appointment for ${doctorVal}. Patient: ${patientNameVal} (${phoneVal}), Patient ID: ${patientIdVal}, Ref: ${aptRefVal}, Date: ${dateVal} (${slotVal}), Mode: ${modeVal}. Notes: ${apt?.message || "None"}.`
            )}`;

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D9EAF5] relative">
                  {/* Header */}
                  <div className="p-6 bg-gradient-to-r from-[#123B66] to-[#087F8C] text-white rounded-t-3xl relative">
                    <button
                      onClick={() => setSelectedPatientForDetails(null)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8E3DF] block mb-1">
                      Patient Clinical Profile & Booking Details
                    </span>
                    <h3 className="font-serif text-2xl font-bold">
                      {patientNameVal}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-white/90">
                      <span className="bg-[#E9F6F3] text-[#087F8C] px-2.5 py-0.5 rounded-md font-mono font-bold text-xs border border-white/20">
                        Patient ID: {patientIdVal}
                      </span>
                      <span className="bg-white/15 text-white px-2.5 py-0.5 rounded-md font-mono font-semibold text-xs border border-white/20">
                        Ref: {aptRefVal}
                      </span>
                      <span>•</span>
                      <span>{dateVal}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-5 text-xs text-[#102E28]">
                    {/* Status Banner */}
                    {apt && (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EAF5FC] border border-[#D9EAF5]">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#2878B9] block">Appointment Status</span>
                          <span className={`inline-block font-bold text-xs mt-0.5 px-2.5 py-0.5 rounded-full ${
                            currentStatus === "Confirmed"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : currentStatus === "Completed"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : currentStatus === "Cancelled"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                          }`}>
                            {currentStatus === "Pending" ? "Pending Confirmation" : currentStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {currentStatus !== "Confirmed" && (
                            <button
                              onClick={() => {
                                updateStatus(apt.id, "Confirmed");
                                setSelectedPatientForDetails((prev) =>
                                  prev?.appointment ? { ...prev, appointment: { ...prev.appointment, status: "Confirmed" } } : prev
                                );
                                setApprovedAppointmentForConfirmation({
                                  ...apt,
                                  patientId: patientIdVal,
                                  status: "Confirmed",
                                });
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Confirm</span>
                            </button>
                          )}
                          {currentStatus !== "Completed" && (
                            <button
                              onClick={() => {
                                updateStatus(apt.id, "Completed");
                                setSelectedPatientForDetails((prev) =>
                                  prev?.appointment ? { ...prev, appointment: { ...prev.appointment, status: "Completed" } } : prev
                                );
                              }}
                              className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl font-semibold text-[11px] cursor-pointer transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          {currentStatus !== "Cancelled" && (
                            <button
                              onClick={() => {
                                updateStatus(apt.id, "Cancelled");
                                setSelectedPatientForDetails((prev) =>
                                  prev?.appointment ? { ...prev, appointment: { ...prev.appointment, status: "Cancelled" } } : prev
                                );
                              }}
                              className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-semibold text-[11px] cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact & Identification Card */}
                    <div className="bg-[#F7F7F1] p-4 rounded-2xl border border-[#E4EDE5] space-y-2.5">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#315C49] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Contact & Identification</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] text-[#102E28]/60 block">Patient ID</span>
                          <span className="font-mono font-bold text-[#087F8C] text-sm">
                            {patientIdVal}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#102E28]/60 block">Appointment Ref ID</span>
                          <span className="font-mono font-semibold text-[#123B66]">
                            {aptRefVal}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#102E28]/60 block">Age & Gender</span>
                          <span className="font-semibold text-[#102E28]">
                            {apt?.age || pat?.age ? `${apt?.age || pat?.age} yrs` : "—"} • {apt?.gender || pat?.gender || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#102E28]/60 block">Parent / Guardian</span>
                          <span className="font-semibold text-[#102E28]">
                            {apt?.parentName || pat?.parent || "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#102E28]/60 block">Mobile Number</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <a
                              href={`tel:${phoneVal}`}
                              className="font-mono font-bold text-[#2878B9] hover:underline"
                            >
                              {phoneVal || "—"}
                            </a>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#102E28]/60 block">Email Address</span>
                          <span className="font-medium text-[#102E28]">
                            {apt?.email || pat?.email || "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Clinical & Appointment Details */}
                    <div className="bg-white p-4 rounded-2xl border border-[#E4EDE5] space-y-2.5 shadow-2xs">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#087F8C] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Consultation Booking Information</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] text-[#102E28]/60 block">Doctor Assigned</span>
                          <span className="font-bold text-[#102E28]">
                            {doctorVal}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#102E28]/60 block">Department / Service</span>
                          <span className="font-medium text-[#315C49]">
                            {deptVal}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#102E28]/60 block">Consultation Date</span>
                          <span className="font-bold text-[#102E28]">
                            {dateVal}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#102E28]/60 block">Time Slot</span>
                          <span className="font-medium text-[#102E28]">
                            {slotVal}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-[#102E28]/60 block">Consultation Mode</span>
                          <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF5FC] text-[#2878B9] border border-[#D9EAF5]">
                            {modeVal}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Patient Symptoms / Reason for Consultation */}
                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Patient's Reason for Consultation / Symptoms Note</span>
                      </span>
                      <p className="text-xs text-[#102E28] leading-relaxed italic bg-white p-3 rounded-xl border border-amber-100">
                        "{notesVal}"
                      </p>
                    </div>

                    {/* Direct Patient Confirmation & Doctor Alerts */}
                    <div className="pt-2 border-t border-[#E4EDE5] space-y-2">
                      <span className="text-[10px] uppercase font-bold text-[#102E28]/70 tracking-wider block">
                        Direct Patient Confirmation & Clinic Alerts
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={whatsappPatientConfirm}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          title="Send Booking Confirmation to Patient via WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Patient</span>
                        </a>

                        <a
                          href={smsPatientConfirm}
                          className="py-2.5 px-3 rounded-xl bg-[#087F8C] hover:bg-[#066570] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          title="Send Booking Confirmation to Patient via SMS"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>SMS Patient</span>
                        </a>

                        <a
                          href={whatsappDoctorDesk}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-[#123B66] hover:bg-[#0c2847] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          title="Alert Doctor & Front Desk via WhatsApp (9980999068)"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>WhatsApp Desk</span>
                        </a>

                        <a
                          href={smsDoctorDesk}
                          className="py-2.5 px-3 rounded-xl bg-[#2878B9] hover:bg-[#1f5f93] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          title="Alert Doctor & Front Desk via SMS (9980999068)"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>SMS Desk (9980999068)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* New Walk-in Appointment Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E4EDE5] relative">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#102E28]/60 hover:text-[#102E28]"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="font-serif font-bold text-xl text-[#102E28] mb-1">
                  Add Walk-In Patient
                </h3>
                <p className="text-xs text-[#102E28]/60 mb-5">
                  Register in-clinic reception consultation
                </p>

                <form onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh"
                      value={newApt.patientName}
                      onChange={(e) => setNewApt({ ...newApt, patientName: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Age (years)</label>
                      <input
                        type="number"
                        placeholder="e.g. 28"
                        min="1"
                        max="120"
                        value={newApt.age}
                        onChange={(e) => setNewApt({ ...newApt, age: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Gender</label>
                      <select
                        value={newApt.gender}
                        onChange={(e) => setNewApt({ ...newApt, gender: e.target.value })}
                        className={inputCls}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Parent / Guardian Name (optional)</label>
                    <input
                      type="text"
                      placeholder="Father / Mother / Guardian"
                      value={newApt.parentName}
                      onChange={(e) => setNewApt({ ...newApt, parentName: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit phone"
                      value={newApt.phone}
                      onChange={(e) => setNewApt({ ...newApt, phone: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Doctor</label>
                    <select
                      value={newApt.doctor}
                      onChange={(e) => {
                        const doc = doctors.find((d) => d.name === e.target.value);
                        setNewApt({
                          ...newApt,
                          doctor: e.target.value,
                          department: doc?.department || newApt.department,
                        });
                      }}
                      className={inputCls}
                    >
                      {doctors.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Date</label>
                      <input
                        type="date"
                        value={newApt.date}
                        onChange={(e) => setNewApt({ ...newApt, date: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Time Slot</label>
                      <select
                        value={newApt.timeSlot}
                        onChange={(e) => setNewApt({ ...newApt, timeSlot: e.target.value })}
                        className={inputCls}
                      >
                        <option value="10:00 AM - 11:30 AM">10:00 AM - 11:30 AM</option>
                        <option value="11:30 AM - 01:00 PM">11:30 AM - 01:00 PM</option>
                        <option value="02:30 PM - 04:30 PM">02:30 PM - 04:30 PM</option>
                        <option value="05:00 PM - 06:30 PM">05:00 PM - 06:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl border border-[#E4EDE5] text-[#102E28]/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#315C49] text-white font-medium"
                    >
                      Save Walk-in
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Doctor Edit/Add Modal ─────────────────────────────────────────── */}
          {showDoctorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E4EDE5] relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowDoctorModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#102E28]/60 hover:text-[#102E28]"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="font-serif font-bold text-xl text-[#102E28] mb-1">
                  {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                </h3>
                <p className="text-xs text-[#102E28]/60 mb-5">
                  {editingDoctor
                    ? "Update doctor profile — changes appear on the public website"
                    : "Add a new specialist to the clinic roster"}
                </p>

                <form onSubmit={handleSaveDoctor} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Full Name *">
                      <input
                        required
                        value={doctorForm.name}
                        onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                        placeholder="e.g. Dr. Keerthi Sundar"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Title / Role *">
                      <input
                        required
                        value={doctorForm.title}
                        onChange={(e) => setDoctorForm({ ...doctorForm, title: e.target.value })}
                        placeholder="e.g. Chief Psychiatrist"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Qualifications *">
                      <input
                        required
                        value={doctorForm.qualifications}
                        onChange={(e) =>
                          setDoctorForm({ ...doctorForm, qualifications: e.target.value })
                        }
                        placeholder="e.g. MBBS, MD (Psychiatry)"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Department *">
                      <input
                        required
                        value={doctorForm.department}
                        onChange={(e) =>
                          setDoctorForm({ ...doctorForm, department: e.target.value })
                        }
                        placeholder="e.g. Psychiatry & Neuropsychiatry"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Specialization *">
                      <input
                        required
                        value={doctorForm.specialization}
                        onChange={(e) =>
                          setDoctorForm({ ...doctorForm, specialization: e.target.value })
                        }
                        placeholder="e.g. Adult Psychiatry, Anxiety"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Experience">
                      <input
                        value={doctorForm.experience}
                        onChange={(e) =>
                          setDoctorForm({ ...doctorForm, experience: e.target.value })
                        }
                        placeholder="e.g. 14+ Years Verified Experience"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Consultation Fee (Optional / Hidden)">
                      <input
                        value={doctorForm.consultationFee}
                        onChange={(e) =>
                          setDoctorForm({ ...doctorForm, consultationFee: e.target.value })
                        }
                        placeholder="e.g. ₹600 (not shown on website)"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Contact Number">
                      <input
                        value={doctorForm.contact}
                        onChange={(e) =>
                          setDoctorForm({ ...doctorForm, contact: e.target.value })
                        }
                        placeholder="e.g. 8317399068"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Availability / Timing">
                    <input
                      value={doctorForm.availability}
                      onChange={(e) =>
                        setDoctorForm({ ...doctorForm, availability: e.target.value })
                      }
                      placeholder="e.g. Mon - Sat: 10:00 AM - 1:00 PM"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Photo URL">
                    <input
                      value={doctorForm.image}
                      onChange={(e) => setDoctorForm({ ...doctorForm, image: e.target.value })}
                      placeholder="/doctors/dr_name.jpg"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Bio / About">
                    <textarea
                      rows={3}
                      value={doctorForm.bio}
                      onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                      placeholder="Short biography of the doctor..."
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Expertise (one per line)">
                    <textarea
                      rows={3}
                      value={expertiseText}
                      onChange={(e) => setExpertiseText(e.target.value)}
                      placeholder={"Clinical Depression\nAnxiety Disorders\nBipolar Spectrum"}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Education (one per line)">
                    <textarea
                      rows={3}
                      value={educationText}
                      onChange={(e) => setEducationText(e.target.value)}
                      placeholder={"MBBS - Medical College\nMD in Psychiatry\n..."}
                      className={inputCls}
                    />
                  </Field>

                  <div>
                    <label className="block text-xs font-semibold text-[#102E28] mb-2">
                      Consultation Modes
                    </label>
                    <div className="flex gap-4">
                      {(["in-person", "video"] as const).map((mode) => (
                        <label
                          key={mode}
                          className="flex items-center gap-2 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={doctorForm.consultationModes.includes(mode)}
                            onChange={() => toggleDoctorMode(mode)}
                            className="w-4 h-4 accent-[#315C49]"
                          />
                          <span className="capitalize">{mode === "in-person" ? "In-Person" : "Video"}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E4EDE5]">
                    <button
                      type="button"
                      onClick={() => setShowDoctorModal(false)}
                      className="px-4 py-2 rounded-xl border border-[#E4EDE5] text-[#102E28]/70 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#315C49] text-white font-semibold text-xs hover:bg-[#204033] transition-colors"
                    >
                      {editingDoctor ? "Save Changes" : "Add Doctor"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Service Edit/Add Modal ─────────────────────────────────────────── */}
          {showServiceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E4EDE5] relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#102E28]/60 hover:text-[#102E28]"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="font-serif font-bold text-xl text-[#102E28] mb-1">
                  {editingService ? "Edit Service" : "Add New Service"}
                </h3>
                <p className="text-xs text-[#102E28]/60 mb-5">
                  {editingService
                    ? "Update service details — changes appear on the public website"
                    : "Add a new clinical service to the website"}
                </p>

                <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Service Title *">
                      <input
                        required
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                        placeholder="e.g. Neuropsychiatry & Clinical Psychiatry"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Category *">
                      <select
                        value={serviceForm.category}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            category: e.target.value as Service["category"],
                          })
                        }
                        className={inputCls}
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Icon Name">
                      <select
                        value={serviceForm.iconName}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, iconName: e.target.value })
                        }
                        className={inputCls}
                      >
                        {ICON_OPTIONS.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Short Description *">
                    <textarea
                      required
                      rows={2}
                      value={serviceForm.shortDesc}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, shortDesc: e.target.value })
                      }
                      placeholder="Brief one-sentence service description..."
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Full Description">
                    <textarea
                      rows={3}
                      value={serviceForm.fullDesc}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, fullDesc: e.target.value })
                      }
                      placeholder="Detailed description of the service..."
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Symptoms (one per line)">
                    <textarea
                      rows={3}
                      value={symptomsText}
                      onChange={(e) => setSymptomsText(e.target.value)}
                      placeholder={"Persistent sadness\nOverwhelming worry\nSleep disturbances"}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Treatments (one per line)">
                    <textarea
                      rows={3}
                      value={treatmentsText}
                      onChange={(e) => setTreatmentsText(e.target.value)}
                      placeholder={"Clinical Diagnostic Evaluation\nPharmacotherapy\nCBT"}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Highlights (comma-separated)">
                    <input
                      value={highlightsText}
                      onChange={(e) => setHighlightsText(e.target.value)}
                      placeholder="Doctor Led, Evidence-Based, Confidential"
                      className={inputCls}
                    />
                  </Field>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E4EDE5]">
                    <button
                      type="button"
                      onClick={() => setShowServiceModal(false)}
                      className="px-4 py-2 rounded-xl border border-[#E4EDE5] text-[#102E28]/70 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#315C49] text-white font-semibold text-xs hover:bg-[#204033] transition-colors"
                    >
                      {editingService ? "Save Changes" : "Add Service"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Community Program Modal ────────────────────────────────────── */}
          {showProgramModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E4EDE5] relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowProgramModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#102E28]/60 hover:text-[#102E28]"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="font-serif font-bold text-xl text-[#102E28] mb-1">
                  {editingProgram ? "Edit Community Program" : "Add Community Outreach Program"}
                </h3>
                <p className="text-xs text-[#102E28]/60 mb-5">
                  {editingProgram
                    ? "Update program outreach initiative, photo, and registration details"
                    : "Create a new community mental health outreach or school/corporate workshop"}
                </p>

                <form onSubmit={handleSaveProgram} className="space-y-3.5 text-xs">
                  <Field label="Program Title *">
                    <input
                      required
                      value={programForm.title}
                      onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                      placeholder="e.g. Campus Mental Health Awareness Drive"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Tag / Category *">
                      <input
                        required
                        value={programForm.tag || ""}
                        onChange={(e) => setProgramForm({ ...programForm, tag: e.target.value })}
                        placeholder="e.g. School Outreach, Corporate, Free Camp"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Theme Color">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={programForm.color || "#315C49"}
                          onChange={(e) => setProgramForm({ ...programForm, color: e.target.value })}
                          className="w-10 h-8 rounded-lg cursor-pointer border border-[#E4EDE5] p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={programForm.color || "#315C49"}
                          onChange={(e) => setProgramForm({ ...programForm, color: e.target.value })}
                          placeholder="#315C49"
                          className={inputCls}
                        />
                      </div>
                    </Field>
                  </div>

                  {/* Photo / Image Upload Section */}
                  <Field label="Program Photo (Upload or Image URL)">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-[#315C49]/30 rounded-xl bg-[#F7F7F1] hover:bg-[#E4EDE5]/50 cursor-pointer transition-colors text-xs font-semibold text-[#315C49]">
                          <Upload className="w-4 h-4" />
                          <span>Upload Photo from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProgramImageUpload}
                            className="hidden"
                          />
                        </label>
                        {programForm.image && (
                          <button
                            type="button"
                            onClick={() => setProgramForm({ ...programForm, image: "" })}
                            className="px-3 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-xs font-semibold"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#102E28]/50 uppercase tracking-wider font-semibold">Or URL:</span>
                        <input
                          type="text"
                          value={programForm.image || ""}
                          onChange={(e) => setProgramForm({ ...programForm, image: e.target.value })}
                          placeholder="https://images.unsplash.com/... or paste image URL"
                          className={inputCls}
                        />
                      </div>

                      {programForm.image && (
                        <div className="relative rounded-xl overflow-hidden border border-[#E4EDE5] h-36 bg-slate-100">
                          <img
                            src={programForm.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-xs flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>Photo Preview</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Field>

                  <Field label="Program Description *">
                    <textarea
                      required
                      rows={3}
                      value={programForm.description}
                      onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                      placeholder="Explain what the program covers, who it is for, and how community members can participate..."
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Action Button Label">
                      <input
                        value={programForm.buttonLabel || ""}
                        onChange={(e) => setProgramForm({ ...programForm, buttonLabel: e.target.value })}
                        placeholder="e.g. Register for Workshop"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Action Button Link">
                      <input
                        value={programForm.buttonLink || ""}
                        onChange={(e) => setProgramForm({ ...programForm, buttonLink: e.target.value })}
                        placeholder="#contact, tel:9980999068, or URL"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E4EDE5]">
                    <button
                      type="button"
                      onClick={() => setShowProgramModal(false)}
                      className="px-4 py-2 rounded-xl border border-[#E4EDE5] text-[#102E28]/70 text-xs hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#315C49] text-white font-semibold text-xs hover:bg-[#204033] transition-colors"
                    >
                      {editingProgram ? "Save Changes" : "Add Program"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Awareness Video Modal ────────────────────────────────────────── */}
          {showVideoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E4EDE5] relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#102E28]/60 hover:text-[#102E28]"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="font-serif font-bold text-xl text-[#102E28] mb-1">
                  {editingVideo ? "Edit Awareness Video" : "Add Awareness Video"}
                </h3>
                <p className="text-xs text-[#102E28]/60 mb-5">
                  Link mental health reels & educational talks from Instagram or clinic media.
                </p>

                <form onSubmit={handleSaveVideo} className="space-y-3.5 text-xs">
                  <Field label="Video Title *">
                    <input
                      required
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      placeholder="e.g. Recognizing Hidden Signs of Depression & Anxiety"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Duration *">
                      <input
                        required
                        value={videoForm.duration}
                        onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                        placeholder="e.g. 5 min watch, Reel"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Topic / Tag *">
                      <input
                        required
                        value={videoForm.tag}
                        onChange={(e) => setVideoForm({ ...videoForm, tag: e.target.value })}
                        placeholder="e.g. Mental Health, Stress Relief"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Video URL / Instagram Link *">
                    <input
                      required
                      value={videoForm.videoUrl || ""}
                      onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                      placeholder="https://www.instagram.com/mind_and_brain_clinic/?__pwa=1#"
                      className={inputCls}
                    />
                  </Field>

                  {/* Thumbnail Photo Upload */}
                  <Field label="Video Thumbnail Photo (Upload or URL)">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-[#315C49]/30 rounded-xl bg-[#F7F7F1] hover:bg-[#E4EDE5]/50 cursor-pointer transition-colors text-xs font-semibold text-[#315C49]">
                          <Upload className="w-4 h-4" />
                          <span>Upload Thumbnail Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleVideoThumbnailUpload}
                            className="hidden"
                          />
                        </label>
                        {videoForm.thumbnail && (
                          <button
                            type="button"
                            onClick={() => setVideoForm({ ...videoForm, thumbnail: "" })}
                            className="px-3 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-xs font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#102E28]/50 uppercase tracking-wider font-semibold">Or URL:</span>
                        <input
                          type="text"
                          value={videoForm.thumbnail || ""}
                          onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                          placeholder="https://... image URL"
                          className={inputCls}
                        />
                      </div>

                      {videoForm.thumbnail && (
                        <div className="relative rounded-xl overflow-hidden border border-[#E4EDE5] h-32 bg-slate-100">
                          <img
                            src={videoForm.thumbnail}
                            alt="Thumbnail Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </Field>

                  <Field label="Gradient Background Theme">
                    <select
                      value={videoForm.gradient || "from-teal-700 to-emerald-600"}
                      onChange={(e) => setVideoForm({ ...videoForm, gradient: e.target.value })}
                      className={inputCls}
                    >
                      <option value="from-teal-700 to-emerald-600">Teal to Emerald</option>
                      <option value="from-emerald-700 to-green-800">Deep Emerald to Forest Green</option>
                      <option value="from-cyan-700 to-teal-800">Cyan to Deep Teal</option>
                      <option value="from-slate-700 to-emerald-800">Slate to Emerald</option>
                      <option value="from-indigo-700 to-teal-700">Indigo to Teal</option>
                    </select>
                  </Field>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E4EDE5]">
                    <button
                      type="button"
                      onClick={() => setShowVideoModal(false)}
                      className="px-4 py-2 rounded-xl border border-[#E4EDE5] text-[#102E28]/70 text-xs hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#315C49] text-white font-semibold text-xs hover:bg-[#204033] transition-colors"
                    >
                      {editingVideo ? "Save Changes" : "Add Video"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Awareness Blog Modal ─────────────────────────────────────────── */}
          {showBlogModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E4EDE5] relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowBlogModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#102E28]/60 hover:text-[#102E28]"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="font-serif font-bold text-xl text-[#102E28] mb-1">
                  {editingBlog ? "Edit Psychoeducation Blog" : "Add Psychoeducation Article"}
                </h3>
                <p className="text-xs text-[#102E28]/60 mb-5">
                  Publish or update clinical insights and mental wellness articles.
                </p>

                <form onSubmit={handleSaveBlog} className="space-y-3.5 text-xs">
                  <Field label="Article Title *">
                    <input
                      required
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      placeholder="e.g. Overcoming Everyday Burnout & Chronic Fatigue"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Reading Time *">
                      <input
                        required
                        value={blogForm.duration}
                        onChange={(e) => setBlogForm({ ...blogForm, duration: e.target.value })}
                        placeholder="e.g. 4 min read"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Article Link / URL">
                      <input
                        value={blogForm.articleUrl || ""}
                        onChange={(e) => setBlogForm({ ...blogForm, articleUrl: e.target.value })}
                        placeholder="# or external article URL"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  {/* Thumbnail / Cover Photo */}
                  <Field label="Cover Photo (Upload or URL)">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex-到位 items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-[#315C49]/30 rounded-xl bg-[#F7F7F1] hover:bg-[#E4EDE5]/50 cursor-pointer transition-colors text-xs font-semibold text-[#315C49]">
                          <Upload className="w-4 h-4" />
                          <span>Upload Cover Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBlogThumbnailUpload}
                            className="hidden"
                          />
                        </label>
                        {blogForm.thumbnail && (
                          <button
                            type="button"
                            onClick={() => setBlogForm({ ...blogForm, thumbnail: "" })}
                            className="px-3 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-xs font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#102E28]/50 uppercase tracking-wider font-semibold">Or URL:</span>
                        <input
                          type="text"
                          value={blogForm.thumbnail || ""}
                          onChange={(e) => setBlogForm({ ...blogForm, thumbnail: e.target.value })}
                          placeholder="https://... cover image URL"
                          className={inputCls}
                        />
                      </div>

                      {blogForm.thumbnail && (
                        <div className="relative rounded-xl overflow-hidden border border-[#E4EDE5] h-32 bg-slate-100">
                          <img
                            src={blogForm.thumbnail}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </Field>

                  <Field label="Article Excerpt / Summary *">
                    <textarea
                      required
                      rows={4}
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      placeholder="Write an insightful summary or opening paragraph of the article..."
                      className={inputCls}
                    />
                  </Field>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E4EDE5]">
                    <button
                      type="button"
                      onClick={() => setShowBlogModal(false)}
                      className="px-4 py-2 rounded-xl border border-[#E4EDE5] text-[#102E28]/70 text-xs hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#315C49] text-white font-semibold text-xs hover:bg-[#204033] transition-colors"
                    >
                      {editingBlog ? "Save Changes" : "Add Article"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Payment Financial Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#D9EAF5] relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#D9EAF5]">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF5FC] flex items-center justify-center text-[#2878B9]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#123B66]">
                      Consultation Financial & Payment Audit Report
                    </h3>
                    <p className="text-xs text-[#26384A]/70">
                      V-KARE Mind & Brain Clinic • Daily & Monthly Collections
                    </p>
                  </div>
                </div>

                {/* 2 Big Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                      Total Verified Collections
                    </span>
                    <p className="font-serif text-2xl font-bold text-emerald-700 mt-1">
                      ₹{totalCollectedPayments}
                    </p>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">
                      {paymentRequests.filter((r) => r.paymentStatus === "Payment Verified").length} verified payments
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] font-bold uppercase text-blue-800 tracking-wider block">
                      Pending Approvals
                    </span>
                    <p className="font-serif text-2xl font-bold text-blue-700 mt-1">
                      ₹{pendingVerificationAmount}
                    </p>
                    <span className="text-[10px] text-blue-600 block mt-0.5">
                      {pendingVerificationCount} submissions awaiting check
                    </span>
                  </div>
                </div>

                {/* Doctor-wise Breakdown */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-serif font-bold text-sm text-[#123B66]">
                    Revenue Breakdown by Specialist Doctor
                  </h4>
                  <div className="border border-[#D9EAF5] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#EAF5FC] text-[#123B66] uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Doctor</th>
                          <th className="py-2.5 px-3">Requests</th>
                          <th className="py-2.5 px-3">Verified (₹)</th>
                          <th className="py-2.5 px-3">Pending (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D9EAF5]/60 text-[#26384A]">
                        {DOCTORS.map((doc) => {
                          const docReqs = paymentRequests.filter(
                            (r) => r.doctorId === doc.id || r.doctorName === doc.name
                          );
                          const docVerified = docReqs
                            .filter((r) => r.paymentStatus === "Payment Verified")
                            .reduce((s, r) => s + r.amount, 0);
                          const docPending = docReqs
                            .filter((r) => r.paymentStatus === "Payment Submitted" || r.paymentStatus === "Payment Requested")
                            .reduce((s, r) => s + r.amount, 0);

                          return (
                            <tr key={doc.id}>
                              <td className="py-2.5 px-3 font-semibold text-[#123B66]">{doc.name}</td>
                              <td className="py-2.5 px-3">{docReqs.length}</td>
                              <td className="py-2.5 px-3 font-bold text-emerald-700">₹{docVerified}</td>
                              <td className="py-2.5 px-3 font-medium text-amber-700">₹{docPending}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#D9EAF5]">
                  <button
                    onClick={exportPaymentsCSV}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2878B9] hover:bg-[#1f5f93] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Report</span>
                  </button>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#D9EAF5] text-[#123B66] text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Screenshot Proof Preview Modal */}
          {previewScreenshot && (
            <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-lg w-full p-4 relative shadow-2xl">
                <button
                  onClick={() => setPreviewScreenshot(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <h4 className="font-serif font-bold text-sm text-[#123B66] mb-3">Submitted Payment Proof</h4>
                <div className="max-h-[70vh] overflow-auto rounded-xl border border-gray-200">
                  <img src={previewScreenshot} alt="Payment Proof" className="w-full h-auto" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
