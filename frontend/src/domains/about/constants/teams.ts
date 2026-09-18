export type Person = {
  id?: string;
  name: string;
  role: string;
  img: string;
  description: string[];
};

export const DUMMY_DESCRIPTION: string[] = [
  "Some placeholder text for the first paragraph.",
  "Some placeholder text for the second paragraph.",
];

/** Strip HTML and split into paragraphs for the flip-card back panel. */
export function contentToDescription(html?: string | null): string[] {
  if (!html?.trim()) return [];

  const fromParagraphs = Array.from(
    html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)
  )
    .map((m) =>
      m[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);

  if (fromParagraphs.length > 0) return fromParagraphs;

  const plain = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .trim();

  return plain
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Map a published CMS team/trustee record → About Us Person card. */
export function mapTeamToPerson(member: {
  id?: string;
  title: string;
  designation?: string | null;
  teamImage?: string | null;
  content?: string | null;
}): Person {
  return {
    id: member.id,
    name: member.title,
    role: member.designation?.trim() || "",
    img: member.teamImage?.trim() || "",
    description: contentToDescription(member.content),
  };
}

export const trusteesRowOne: Person[] = [
  {
    name: "Dr. B.S. Ajaikumar",
    role: "Founder and Managing Trustee",
    img: "/Team/Ajaikumar.png",
    description: [
      "Dr. Ajaikumar is a world-renowned doctorpreneur and Executive Chairman of HealthCare Global Enterprises Ltd. He is a distinguished radiation and medical oncologist, who is a visionary cancer care crusader working tirelessly to help patients win over cancer.",
      "Being a social entrepreneur and philanthropist, Dr. Ajaikumar has initiated several NGOs engaged in developmental work in the Gundlupet district, Karnataka. His organizations have provided financial aid for needy cancer patients, enabling 20,000+ women through microfinance and empowerment programs, and built a school for educating around 550 children each year.",
    ],
  },
  {
    name: "Ms. Anjali Ajaikumar Rossi",
    role: "Trustee",
    img: "/Team/Anjali.png",
    description:[
      "Ms. Anjali Ajaikumar is a healthcare professional and committed social entrepreneur currently serving as an Executive Director at Healthcare Global Enterprises Ltd. (HCG) and overseeing the Fertility business of Milann. In her fifteen years of experience as an administrator and strategist, she has worked extensively to redefine the patient experience for cancer patients in India. Anjali is an MBA graduate in Entrepreneurship from Babson College, is a mentor to start-ups within the healthcare space, and brings a unique perspective along with a wealth of experience to provide guidance and strategic support to emerging entrepreneurs.",],
  },
  {
    name: "Dr. Ganesh Nayak",
    role: "Trustee",
    img: "/Team/Ganesh.png",
    description:[
      "Dr. Ganesh Nayak is a Cardiac Surgeon from Bengaluru and has an experience of 55 years in this field. Dr. Ganesh Nayak is currently a practicing surgeon at Residency Specialists Centre in Residency Road, Bengaluru.",],
  },
];

export const trusteesRowTwo: Person[] = [
  {
    name: "Dr. Ramesh S",
    role: "Trustee",
    img: "/Team/Ramesh.png",
    description:[
      "Prof. (Dr.) Ramesh S Bilimagga is a renowned Senior Consultant and Professor Emeritus in Radiation Oncology at HCG Cancer Centre, Bengaluru. With over four decades of experience, he has been a pioneer in advanced cancer treatment modalities including IMRT, IGRT, SRS, and brachytherapy. A former President of AROI, ISO and the Indian Brachytherapy Society, he has played a pivotal role in shaping oncology practice in India.",],
  },
  {
    name: "Mr. Satish Shenoy",
    role: "Trustee",
    img: "/Team/Satish.png",
    description:[
      "Mr. Satish Shenoy has three decades of experience in consulting and financial services encompassing business consulting, investment banking, capital markets, M&A and financial distribution. Satish founded SIRI electromotive to realize his dream of contributing to a greener planet through meaningful participation in the setting of EV charging infrastructure in India.",],
  },
];

export const teamRow: Person[] = [
  {
    name: "Feros Khan",
    role: "Sr. Manager",
    img: "/Team/Feros.png",
    description:[
      "I began my career at an international bank in Dubai before joining the HCG Foundation in 2013. Transitioning to the NGO sector provided a refreshing psychological shift from the routine of working in the payroll department. At the HCG Foundation, I have experienced significant personal and professional growth, enjoying the autonomy to implement innovative strategies and ideas to further the Foundation's mission and vision. Currently, I lead the Foundation's Fundraising and Operations.",],
  },
  {
    name: "Hari",
    role: "Patient Care Coordinator",
    img: "/Team/Hari.png",
    description:[
      "Leveraging my extensive experience in the BPO sector, I made a significant career shift to the non-profit arena during the COVID-19 lockdown. At HCG Foundation, my role as a Patient Care Coordinator is not just a job; it's a daily mission to make a meaningful impact.",
      " I am dedicated to guiding underprivileged patients through their treatment journeys, alleviating their burdens, and ensuring they receive the essential care they deserve. The joy on their faces and their heartfelt gratitude after successful treatments are unparalleled motivators, driving my unwavering commitment to helping many more patients in need.",],
  },
  {
    name: "Omkara Murthy",
    role: "Accounts Manager ",
    img: "/Team/Omkar.png",
    description:[
      "Originating from Chitra Durga, Karnataka, I transitioned from a role in an accounting firm to embrace the impactful mission of the HCG Foundation. At the Foundation, my primary responsibilities encompass overseeing financial matters with meticulous attention to detail. Additionally, I actively engage in diverse administrative tasks, ensuring seamless operational support. I am driven by a deep commitment to contribute meaningfully to the Foundation's objectives, leveraging my expertise to foster efficiency and effectiveness. Together, let's continue to make a positive difference through our dedicated efforts.",],
  },
  {
    name: "Renu Golani",
    role: "Regional Manager, Gujarat",
    img: "/Team/Renu.png",
    description:[
      "Renu Golani, based in Ahmedabad, Gujarat, brings over 15 years of experience in the development sector. She has successfully led initiatives focused on community empowerment, education, healthcare access, and sustainable development.",
      "With expertise in strategic planning and stakeholder engagement, Renu has collaborated with NGOs, government bodies, and private organizations to drive impactful projects. Her dedication to creating meaningful change and uplifting underserved communities defines her professional journey.",],
  },
];

export const CARD_W = 280;
export const CARD_W_2XL = 340;

/**
 * Exact CMS upload size for About Us team / trustee photos.
 * PersonCard frame is aspect 320/380 with object-cover (head/top-weighted).
 *
 * Why 960×1140:
 * - Exact 320:380 ratio (same as the card)
 * - 3× the design frame — sharp on desktop (up to 340px) and mobile
 */
export const TEAM_IMAGE_SIZE = { width: 960, height: 1140 } as const;

export const XS_FIXED_CARD_WIDTH = "w-[260px]";

export const SM_FLUID_CARD_WIDTH =
  "sm:w-[calc((100%-16px)/2)]";

export const CARD_GRADIENT_BG =
  "bg-[linear-gradient(90deg,rgba(252,204,45,0.62)_0%,rgba(56,43,0,0.70)_100%)] backdrop-blur-lg";

export const BACK_PANEL_BG =
  "bg-[#2E2404] bg-[linear-gradient(90deg,rgba(252,204,45,0.62)_0%,rgba(56,43,0,0.70)_100%)]";