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
      { label: "Patient Aid", href: "/patient-aid" },
      { label: "Awareness & Screening Camps", href: "/awareness-and-screening-camps" },
      { label: "Swasthi Art Gallery", href: "/swasti-art-gallery" },
      {label: "Pink Hope Support Group", href: "/pink-hope-support-group" },
      {label: "Research & Innovation", href: "/research-and-innovation" },
    ],
  },
  {
    label: "Get Involved",
    href: "#",
    hasDropdown: true,
    dropdownItems: [
      { label: "CSR Partner", href: "/csr-partner" },
      { label: "Grant & Philanthropy", href: "/grant-and-philanthropy" },
      { label: "Participate", href: "/participate" },
    ],
  },
  {
    label: "Resources",
    href: "#",
    hasDropdown: true,
    dropdownItems: [
      { label: "Transparency & Knowledge Hub", href: "/transparency-and-knowledge-hub" },
      // { label: "Projects", href: "/projects" },
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
    src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790826091485-84k1a-group-3-1-.webp",
    alt: "HCG Foundation",
  },
  donateButton: {
    label: "Donate Now",
    href: "",
  },
};