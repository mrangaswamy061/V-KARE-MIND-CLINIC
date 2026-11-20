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
  patientName: string;
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
