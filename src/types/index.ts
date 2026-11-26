export interface Doctor {
  id: string;
  name: string;
  title: string;
  qualifications: string;
  specialization: string;
  department: string;
  experience: string;
  image: string;
  consultationFee: string;
  availability: string;
  bio: string;
  expertise: string[];
  education: string[];
  contact?: string;
  consultationModes: ("in-person" | "video")[];
}

export interface Service {
  id: string;
  title: string;
  category: "psychiatry" | "psychology" | "child" | "speech" | "orthopedics";
  iconName: string;
  shortDesc: string;
  fullDesc: string;
  symptoms: string[];
  treatments: string[];
  highlights: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  serviceReceived: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface AppointmentData {
  patientId?: string;
  patientName: string;
  age?: string;
  gender?: string;
  parentName?: string;
  phone: string;
  email?: string;
  department: string;
  doctor: string;
  date: string;
  timeSlot: string;
  consultationType: "In-Person (Clinic Visit)" | "Online (Video Consultation)";
  message?: string;
}

export interface CommunityProgram {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonLink?: string;
  color?: string;
  tag?: string;
  image?: string;
}

export interface AwarenessVideo {
  id: string;
  title: string;
  duration: string;
  tag: string;
  videoUrl?: string;
  thumbnail?: string;
  gradient?: string;
}

export interface AwarenessBlog {
  id: string;
  title: string;
  duration: string;
  excerpt: string;
  content?: string;
  articleUrl?: string;
  thumbnail?: string;
}

export type PaymentStatus =
  | "Payment Requested"
  | "Payment Pending"
  | "Payment Submitted"
  | "Payment Verified"
  | "Payment Rejected";

export interface SessionTypeFee {
  sessionType: string;
  fee: number;
}

export interface DoctorPaymentSettings {
  doctorId: string;
  doctorName: string;
  consultationFee: number;
  sessionFees?: SessionTypeFee[];
  upiId?: string;
  payeeName?: string;
  merchantCode?: string;
  upiQrImage?: string;
  paymentEnabled: boolean;
  updatedAt: string;
}

export interface ConsultationSession {
  sessionId: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  sessionDate: string;
  sessionType: string;
  sessionStatus: "Scheduled" | "In-Progress" | "Completed" | "Cancelled";
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentRequest {
  paymentId: string;
  sessionId?: string;
  appointmentId?: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  amount: number;
  sessionType: string;
  sessionDate: string;
  doctorUpiQrImage?: string;
  doctorUpiId?: string;
  merchantPayeeName?: string;
  merchantCode?: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  transactionId: string;
  paymentId: string;
  upiReference: string;
  screenshot?: string;
  verificationStatus: "Pending" | "Verified" | "Rejected";
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  submittedAt: string;
  notes?: string;
}
