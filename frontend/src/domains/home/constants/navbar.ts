// domains/home/constants/navbar.ts
export const navLinks = [
  { label: "Home", href: "/", hasDropdown: false },
  {
    label: "About Us",
    href: "/about-us",
  },
  {
    label: "Our Programs",
    href: "#",
     hasDropdown: true,
    dropdownItems: [
      { label: "Financial Support for Pediatric Patients", href: "/financial-support-for-pediatric-patients" },
      { label: "Awareness & Screening Camps", href: "/awareness-and-screening-camps" },
      { label: "Swasthi Gallery", href: "/swasthi-gallery" },
    ],
  },
  {
    label: "Get Involved",
    href: "#",
    hasDropdown: true,
    dropdownItems: [
      { label: "CSR Partner", href: "/csr-partner" },
      { label: "Grants & Philanthropy", href: "/grants-and-philanthropy" },
      { label: "Participate", href: "/participate" },
    ],
  },
  {
    label: "Resources",
    href: "#",
    hasDropdown: true,
    dropdownItems: [
      { label: "Transparency & Knowledge Hub", href: "/transparency-and-knowledge-hub" },
      { label: "Projects", href: "/projects" },
      { label: "Events", href: "/events" },
    ],
  },
  { label: "Journey of Hope", 
    href: "#", hasDropdown: true,
    dropdownItems: [
      { label: "Testimonials", href: "/testimonials" },
      { label: "Patient Stories", href: "/patient-stories" },
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