// domains/home/constants/navbar.ts
export const navLinks = [
  { label: "Home", href: "/", hasDropdown: false },
  {
    label: "About Us",
    href: "/about-us",
  },
  {
    label: "Our Programs",
    href: "/our-programs",
     hasDropdown: true,
    dropdownItems: [
      { label: "Financial Support for Pediatric Patients", href: "/our-programs/financial-support-for-pediatric-patients" },
      { label: "Awareness & Screening Camps", href: "/our-programs/awareness-and-screening-camps" },
      { label: "Swasthi Gallery", href: "/our-programs/swasthi-gallery" },
    ],
  },
  {
    label: "Get Involved",
    href: "/getinvolved",
    hasDropdown: true,
    dropdownItems: [
      { label: "CSR Partner", href: "/getinvolved/CSR-partner" },
      { label: "Granst & Philanthrophy", href: "/getinvolved/granst-and-philanthrophy" },
      { label: "Participate", href: "/getinvolved/participate" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    hasDropdown: true,
    dropdownItems: [
      { label: "Transparency & Knowledge Hub", href: "/resources/transparency-and-knowledge-hub" },
      { label: "Events", href: "/resources/events" },
    ],
  },
  { label: "Journey of Hope", 
    href: "/journey-of-hope", hasDropdown: true,
    dropdownItems: [
      { label: "Testimonials", href: "/journey-of-hope/testimonials" },
      { label: "Patient Stories", href: "/journey-of-hope/patient-stories" },
    ],
   },
];

export const navbarContent = {
  logo: {
    src: "/footer/Logo.png",
    alt: "HCG Foundation",
  },
  donateButton: {
    label: "Donate Now",
    href: "",
  },
};