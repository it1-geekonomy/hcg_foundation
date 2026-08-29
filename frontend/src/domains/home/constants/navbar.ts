// domains/home/constants/navbar.ts
export const navLinks = [
  { label: "Home", href: "/", hasDropdown: false },
  {
    label: "About Us",
    href: "/about",
    hasDropdown: true,
    dropdownItems: [
      { label: "Our Story", href: "/about/our-story" },
      { label: "Our Team", href: "/about/our-team" },
    ],
  },
  {
    label: "What We Do",
    href: "/what-we-do",
    hasDropdown: true,
    dropdownItems: [
      { label: "Patient Aid", href: "/what-we-do/patient-aid" },
      { label: "Awareness & Prevention", href: "/what-we-do/awareness-and-prevention" },
      { label: "Pink Hope Patient Support Group", href: "/what-we-do/pink-hope-patient-support" },
      { label: "Swasthi Art Gallery", href: "/what-we-do/swasthi-art-gallery" },
    ],
  },
  {
    label: "Get Involved",
    href: "/getinvolved",
    hasDropdown: true,
    dropdownItems: [
      { label: "Internship Program", href: "/getinvolved/internship-program" },
      { label: "Partnership", href: "/getinvolved/partnership" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    hasDropdown: true,
    dropdownItems: [
      { label: "Events", href: "/resources/events" },
      { label: "Projects", href: "/resources/projects" },
    ],
  },
  { label: "Journey of Hope", 
    href: "/journey-of-hope", hasDropdown: true,
    dropdownItems: [
      { label: "Patient Stories", href: "/journey-of-hope/patient-stories" },
      { label: "Patient Testimonials", href: "/journey-of-hope/patient-testimonials" },
    ],
   },
];

export const navbarContent = {
  logo: {
    src: "/footer/Logo.png",
    alt: "HCG Foundation",
  },
  donateButton: {
    label: "Contact-Us",
    href: "/contact",
  },
};