import Link from "next/link";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import {
  FOOTER_QUICK_LINKS,
  FOOTER_INNER_PAGES,
  FOOTER_CONTACT_INFO,
  FOOTER_SOCIAL_LINKS,
  FOOTER_DEVELOPER,
  FOOTER_LEGAL_LINKS,
} from "@/domains/home/constants/footer";
import Typography from "@/lib/Typography";

// Shared container: fixed at 1200px through the 2xl breakpoint,
// then steps up to a fixed 1600px on very large screens.
// Explicit stepped values, no fluid clamp() math to second-guess.
const CONTAINER = "max-w-[1200px] 2xl:max-w-[1600px] mx-auto px-6";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="footer-heading"
      as="h3"
      className="text-white uppercase tracking-wider font-manrope"
    >
      {children}
    </Typography>
  );
}

function Logo() {
  return (
    <div className="flex items-center space-x-3 justify-center lg:justify-start">
      <img
        src="/footer/Logo.png"
        alt="HCG Foundation Logo"
        className="h-20 w-auto object-contain"
      />
    </div>
  );
}

const FacebookIcon = () => (
  <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#373737] text-white">
      {/* Main Footer Section */}
      <div className={`${CONTAINER} py-8`}>
        <div
          className="
            grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[minmax(280px,320px)_1fr] gap-x-6 md:gap-x-8 gap-y-10 lg:gap-y-0 lg:gap-x-0
          "
        >
          {/* Column 1: Logo and Newsletter */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-8 lg:max-w-xs lg:shrink-0">
            <div className="space-y-8 lg:space-y-6">
              <Logo />

              {/* 80G Text */}
              <Typography
                variant="footer-heading"
                as="p"
                className="text-gray-300 font-normal! leading-relaxed max-w-[280px] font-manrope text-center lg:text-left mx-auto lg:mx-0"
              >
                The HCG Foundation is approved under sec 80G of the IT Act.
              </Typography>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <Typography variant="footer-heading" as="h4" className="font-normal! font-manrope text-white text-center lg:text-left">
                Subscribe to our Newsletter
              </Typography>
              <div className="flex w-full max-w-[280px] h-12 rounded-md overflow-hidden border border-[#FDB723] mx-auto lg:mx-0">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 min-w-0 h-full px-4 bg-[#FDB723] text-gray-900 placeholder:text-[#373737] font-manrope text-base font-normal border-0 outline-none focus:outline-none"
                />
                <button
                  type="button"
                  className="w-12 h-full shrink-0 bg-black border-3 border-[#FDB723] flex items-center justify-center transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4 text-[#FDB723]" />
                </button>
              </div>
            </div>
          </div>

          {/* Columns 2–4: grouped, shifted right, tighter gaps */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 lg:flex lg:flex-row lg:items-start lg:justify-end lg:gap-x-10 xl:gap-x-14 2xl:gap-x-28">
          {/* Column 2: Quick Links */}
          <div className="col-span-1">
            <FooterHeading>QUICK LINKS</FooterHeading>
            <ul className="mt-8 space-y-3">
              {FOOTER_QUICK_LINKS.map((label) => (
                <li key={label}>
                  <Link href="/" className="hover:text-[#FDB723] transition-colors">
                    <Typography variant="footer-heading" as="span" className="text-white font-normal! font-manrope">
                      {label}
                    </Typography>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Inner Pages */}
          <div className="col-span-1">
            <FooterHeading>INNER PAGES</FooterHeading>
            <ul className="mt-8 space-y-3">
              {FOOTER_INNER_PAGES.map((label) => (
                <li key={label}>
                  <Link href="/" className="hover:text-[#FDB723] transition-colors">
                    <Typography variant="footer-heading" as="span" className="text-white font-normal! font-manrope">
                      {label}
                    </Typography>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="col-span-2 md:col-span-1">
            <FooterHeading>CONTACT US</FooterHeading>
            <div className="mt-8 space-y-4">
              {/* Address */}
              <div className="flex items-start space-x-4 max-w-[260px]">
                <MapPin className="w-5 h-5 text-[#787878] flex-shrink-0 mt-0.5" />
                <Typography variant="body" as="p" className="text-white leading-relaxed font-manrope">
                  {FOOTER_CONTACT_INFO.address}
                </Typography>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-4">
                <Phone className="w-5 h-5 text-[#787878] flex-shrink-0" />
                <a href={FOOTER_CONTACT_INFO.phoneLink}>
                  <Typography variant="body-sm" as="span" className="text-white hover:text-[#FDB723] transition-colors font-manrope">
                    {FOOTER_CONTACT_INFO.phone}
                  </Typography>
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4">
                <Mail className="w-5 h-5 text-[#787878] flex-shrink-0" />
                <a href={FOOTER_CONTACT_INFO.emailLink}>
                  <Typography variant="body-sm" as="span" className="text-white hover:text-[#FDB723] transition-colors font-manrope">
                    {FOOTER_CONTACT_INFO.email}
                  </Typography>
                </a>
              </div>

              {/* Social Media Icons */}
              <div className="flex space-x-4 pt-2">
                {FOOTER_SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-[#FDB723] rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
                  >
                    {social.name === "Facebook" && <FacebookIcon />}
                    {social.name === "LinkedIn" && <LinkedinIcon />}
                    {social.name === "Instagram" && <InstagramIcon />}
                  </a>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Golden Yellow */}
      <div className="bg-[#FDB723] py-2">
        <div className={CONTAINER}>
          <div className="flex flex-col lg:flex-row justify-between items-center text-gray-900 gap-1 lg:gap-0">
            {/* Copyright */}
            <Typography variant="footer-heading" as="p" className="font-manrope text-gray-900 font-normal!">
              © {new Date().getFullYear()} The HCG Foundation
            </Typography>

            {/* Developer Credit */}
            <Typography variant="footer-heading" as="p" className="font-manrope text-gray-900 font-normal!">
              {FOOTER_DEVELOPER.text}{" "}
              <a
                href={FOOTER_DEVELOPER.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#373737] transition-colors underline"
              >
                {FOOTER_DEVELOPER.company}
              </a>
            </Typography>
          </div>
        </div>
      </div>
    </footer>
  );
}