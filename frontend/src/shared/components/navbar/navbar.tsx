import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center px-8">
        {/* Navigation */}
        <nav className="flex-1">
          <ul className="flex items-center justify-center gap-10 whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-gray-700">
            <li>
              <Link href="/" className="hover:text-blue-600 transition">
                Home
              </Link>
            </li>

            <li>
              <Link href="/about" className="hover:text-blue-600 transition">
                About
              </Link>
            </li>

            <li>
              <Link
                href="/what-we-do"
                className="hover:text-blue-600 transition"
              >
                What We Do
              </Link>
            </li>

            <li>
              <Link
                href="/getinvolved"
                className="hover:text-blue-600 transition"
              >
                Get Involved
              </Link>
            </li>

            <li>
              <Link
                href="/resources"
                className="hover:text-blue-600 transition"
              >
                Resources
              </Link>
            </li>

            <li>
              <Link
                href="/journey-of-hope"
                className="hover:text-blue-600 transition"
              >
                Journey of Hope
              </Link>
            </li>
          </ul>
        </nav>

        {/* Contact Button */}
        <Link
          href="/contact"
          className="ml-10 rounded-full border border-blue-600 px-6 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
        >
          Contact Us
        </Link>
      </div>
    </header>
  );
}