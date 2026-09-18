export interface PatientTestimonial {
  id: string;
  patientName: string;
  role: string;
  date?: string;
  quote?: string;
  videoUrl: string;
  thumbnailUrl: string;
  featured?: boolean;
}

export const PATIENT_TESTIMONIALS: PatientTestimonial[] = [
  {
    id: "1",
    patientName: "Chandana",
    role: "Parent",
    date: "2025",
    quote: "HCG Foundation gave our family strength and financial support when we needed it the most. Their care saved my child.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    featured: true,
  },
  {
    id: "2",
    patientName: "Kushi",
    role: "Parent",
    date: "2025",
    quote: "The doctors and compassionate team at HCG Foundation treated us like family throughout the pediatric treatment.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop",
    featured: false,
  },
  {
    id: "3",
    patientName: "Somappa J J",
    role: "Cancer Survivor",
    date: "2024",
    quote: "Through surgical intervention and rehab, I got my life and health back. Early action is everything.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    featured: false,
  },
  {
    id: "4",
    patientName: "Aleema Banu",
    role: "Patient",
    date: "2024",
    quote: "Overcoming financial barriers allowed me to focus 100% on recovery with zero stress on my family.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=800&auto=format&fit=crop",
    featured: false,
  },
];
