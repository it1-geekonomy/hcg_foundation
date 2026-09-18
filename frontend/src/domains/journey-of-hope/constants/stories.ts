export interface PatientStory {
  id: string;
  slug: string;
  patientName: string;
  date: string;
  conditionTag: string;
  excerpt: string;
  fullStory: string;
  quote?: string;
  imageUrl: string;
  heroImageUrl: string;
  age?: number;
  location?: string;
}

export interface PatientStory {
  id: string;
  slug: string;
  patientName: string;
  date: string;
  conditionTag: string;
  excerpt: string;
  fullStory: string;
  quote?: string;
  imageUrl: string;
  heroImageUrl: string;
  age?: number;
  location?: string;
}

export const PATIENT_STORIES: PatientStory[] = [
  {
    id: "1",
    slug: "jatin-leukemia-recovery",
    patientName: "Jatin",
    date: "3 August, 2020",
    conditionTag: "Pediatric Care & Leukemia",
    excerpt: "At just 7 years old, Jatin faced acute leukemia. With financial aid and holistic medical support from HCG Foundation, he successfully completed his treatment.",
    fullStory: `Jatin was diagnosed with acute lymphoblastic leukemia at the age of seven. For his family, hailing from a small village in Karnataka, the news was devastating. The cost of advanced chemotherapy and supportive care was beyond their financial reach.

Through HCG Foundation's Patient Support Program, Jatin received complete financial assistance for his medical treatment, as well as nutritional and emotional guidance. Today, Jatin is cancer-free, back in school, and dreaming of becoming a doctor to help others in need.`,
    quote: "HCG Foundation didn't just support my treatment; they gave me a second chance at life and a future to dream about.",
    imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1600&auto=format&fit=crop",
    age: 11,
    location: "Bengaluru, Karnataka",
  },
  {
    id: "2",
    slug: "archana-breast-cancer-journey",
    patientName: "Archana P",
    date: "5 December, 2025",
    conditionTag: "Breast Cancer Support",
    excerpt: "Diagnosed with Stage II breast cancer, Archana found strength through the Pink Hope Support Group and specialized care funded by HCG Foundation.",
    fullStory: `Archana P, a primary school teacher, discovered a lump during a routine health camp organized by HCG Foundation. Timely diagnosis and prompt intervention were critical to her survival.

Over the course of eight months, Archana underwent surgery and radiation therapy. The Pink Hope Support Group connected her with fellow survivors who provided emotional fortitude. Today, she actively volunteers at cancer awareness drives to encourage early detection among women.`,
    quote: "Early detection saved my life, but the compassionate care at HCG Foundation gave me the courage to fight.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1600&auto=format&fit=crop",
    age: 42,
    location: "Mysuru, Karnataka",
  },
  {
    id: "3",
    slug: "swati-patil-art-therapy",
    patientName: "Swathi Patil",
    date: "19 June 2025",
    conditionTag: "Neuroendocrine Tumor Support",
    excerpt: "Ms. Swati Patil, a 37-year-old woman, has been diagnosed with a Neuroendocrine Tumor and is currently undergoing treatment at HCG KR Hospital, Bengaluru.",
    fullStory: `Friday, 19 June, 2026

Ms. Swati Patil, a 37-year-old woman, has been diagnosed with a Neuroendocrine Tumor and is currently undergoing treatment at HCG KR Hospital, Bengaluru, under the care of Dr. Kallur. Doctors have advised her to undergo FAPI Therapy, a crucial treatment in her fight against cancer, with an estimated cost of approximately ₹8,00,000.

Swati is unmarried and completely dependent on her elderly father, who is 74 years old and retired. With no stable source of income, the family is facing immense financial hardship while trying to arrange funds for her treatment. At this stage of life, her father is struggling emotionally and financially to save his daughter’s life.

Despite the challenges, Swati and her father continue to hold on to hope. However, they need the support of compassionate donors to help continue her treatment without delay.

We humbly request your generous contribution towards Ms. Swati Patil’s cancer treatment. Your support can help ease the burden on this elderly father and give Swati a chance to fight cancer with strength and dignity. Every donation, no matter how small, can make a life-saving difference.`,
    quote: "Every donation, no matter how small, can make a life-saving difference.",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop",
    age: 37,
    location: "Bengaluru, Karnataka",
  },
  {
    id: "4",
    slug: "master-vikshith-pediatric-aid",
    patientName: "Master Vikshith",
    date: "1 October, 2025",
    conditionTag: "Pediatric Oncology",
    excerpt: "Master Vikshith received life-saving pediatric bone marrow transplant support, returning to his playful childhood.",
    fullStory: `Four-year-old Master Vikshith was diagnosed with a rare pediatric blood disorder requiring a bone marrow transplant. Thanks to the generosity of donors and HCG Foundation's specialized care fund, the transplant was performed successfully.

Today, Vikshith is thriving, full of laughter, and spending his days playing with his elder sister.`,
    quote: "We thought all hope was lost until HCG Foundation stepped in to save our son.",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1600&auto=format&fit=crop",
    age: 5,
    location: "Mangaluru, Karnataka",
  },
  {
    id: "5",
    slug: "aleema-banu-patient-aid",
    patientName: "Aleema Banu",
    date: "4 April, 2024",
    conditionTag: "Financial Patient Aid",
    excerpt: "Overcoming financial barriers, Aleema completed targeted therapy with zero financial burden on her family.",
    fullStory: `Aleema Banu, a homemaker from Belagavi, was diagnosed with advanced cervical cancer. Her husband, a daily wage laborer, could not afford the specialized targeted therapy required for her recovery.

HCG Foundation covered 100% of her medical expenses, enabling her to undergo treatment smoothly. She is now cancer-free and spending quality time with her family.`,
    quote: "The kindness of the doctors and the support team brought light back into our lives.",
    imageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=1600&auto=format&fit=crop",
    age: 48,
    location: "Belagavi, Karnataka",
  },
  {
    id: "6",
    slug: "somappa-jj-courage",
    patientName: "Somappa J J",
    date: "19 December, 2024",
    conditionTag: "Head & Neck Cancer",
    excerpt: "Retired farmer Somappa reclaimed his health and voice following advanced surgical treatment and speech therapy.",
    fullStory: `Somappa J J presented with oral cancer that affected his ability to speak and eat. Through multidisciplinary surgical intervention and speech rehabilitation at HCG, Somappa recovered his health and independence.

He now spends his days educating rural farmers about the dangers of tobacco consumption.`,
    quote: "Never lose hope. With the right care and early action, cancer can be conquered.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop",
    age: 63,
    location: "Davanagere, Karnataka",
  },
  {
    id: "7",
    slug: "priya-sharma-recovery",
    patientName: "Priya Sharma",
    date: "14 February, 2025",
    conditionTag: "Bone Marrow Recovery",
    excerpt: "Priya successfully underwent bone marrow transplantation and now leads an active life as a youth counselor.",
    fullStory: `Priya Sharma faced a life-threatening bone marrow disorder during her college years. Supported by HCG Foundation's specialized BMT fund, she received advanced cellular treatment.

She has returned to university, graduated with honors, and actively counsels young patients undergoing long hospital stays.`,
    quote: "The care I received made me feel like family, not just a patient in a bed.",
    imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1600&auto=format&fit=crop",
    age: 24,
    location: "Bengaluru, Karnataka",
  },
  {
    id: "8",
    slug: "rajesh-kumar-hope",
    patientName: "Rajesh Kumar",
    date: "28 August, 2025",
    conditionTag: "Prostate Cancer Support",
    excerpt: "Diagnosed during an awareness drive, Rajesh underwent robotic surgery and is now completely cancer-free.",
    fullStory: `Rajesh Kumar attended an HCG Foundation community screening camp in Tumakuru. Early detection of early-stage prostate cancer allowed doctors to perform minimally invasive robotic surgery.

His swift recovery enabled him to return to his family business within weeks.`,
    quote: "Attending that free screening camp was the best decision of my life.",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1600&auto=format&fit=crop",
    age: 58,
    location: "Tumakuru, Karnataka",
  },
  // PAGE 2 (STORIES 9 TO 16)
  {
    id: "9",
    slug: "meenakshi-sundaram-gynecologic-care",
    patientName: "Meenakshi S",
    date: "12 January, 2026",
    conditionTag: "Gynecologic Care",
    excerpt: "Meenakshi conquered ovarian cancer through comprehensive financial support and advanced surgical intervention.",
    fullStory: `Meenakshi Sundaram, a weaver from Shivamogga, was diagnosed with Stage III ovarian cancer. Through HCG Foundation's specialized patient support program, her entire surgery and chemotherapy cycle was fully sponsored.

She has resumed her weaving craft and inspires women in her town to prioritize routine wellness checkups.`,
    quote: "HCG Foundation carried the weight of my medical bills so I could focus on healing.",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop",
    age: 51,
    location: "Shivamogga, Karnataka",
  },
  {
    id: "10",
    slug: "devendra-patel-lung-care",
    patientName: "Devendra Patel",
    date: "22 March, 2026",
    conditionTag: "Lung Cancer Support",
    excerpt: "Devendra completed targeted immunotherapy treatment, returning to his beloved organic farm.",
    fullStory: `Devendra Patel suffered from persistent respiratory issues that revealed a lung tumor. Advanced molecular testing and targeted immunotherapy funded by HCG Foundation helped shrink the tumor significantly.

He is now back on his farm and advocates for clean air and healthy living initiatives.`,
    quote: "Targeted therapy gave me my strength back. I am forever grateful.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1600&auto=format&fit=crop",
    age: 55,
    location: "Ballari, Karnataka",
  },
  {
    id: "11",
    slug: "preeti-deshmukh-pink-hope",
    patientName: "Preeti Deshmukh",
    date: "9 May, 2026",
    conditionTag: "Pink Hope Support",
    excerpt: "Preeti transformed her recovery into a mission, mentoring newly diagnosed women in the Pink Hope group.",
    fullStory: `Preeti Deshmukh received specialized breast cancer therapy and reconstruction care. She now serves as a key mentor in the Pink Hope initiative, offering peer counseling and hope to hundreds of women.`,
    quote: "You are never alone in this fight. Together we are stronger.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1600&auto=format&fit=crop",
    age: 39,
    location: "Kalaburagi, Karnataka",
  },
  {
    id: "12",
    slug: "baby-aarav-pediatric-aid",
    patientName: "Baby Aarav",
    date: "18 July, 2026",
    conditionTag: "Pediatric Oncology",
    excerpt: "Two-year-old Aarav received critical pediatric oncology care and is now celebrating healthy milestones.",
    fullStory: `Baby Aarav was diagnosed with Wilms' tumor at 18 months. With immediate intervention and financial aid from HCG Foundation's Pediatric Fund, Aarav completed his treatment with high success.`,
    quote: "Seeing Aarav smile again is the greatest gift any parent could ask for.",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1600&auto=format&fit=crop",
    age: 3,
    location: "Udupi, Karnataka",
  },
  {
    id: "13",
    slug: "gangadhar-n-rehabilitation",
    patientName: "Gangadhar N",
    date: "11 August, 2026",
    conditionTag: "Oral Rehabilitation",
    excerpt: "Gangadhar regained his health and confidence through reconstructive surgery and swallowing therapy.",
    fullStory: `Gangadhar N underwent complex facial reconstruction following head and neck cancer surgery. Specialized speech and swallowing rehabilitation enabled him to speak clearly and resume his daily work.`,
    quote: "The doctors didn't just cure the disease; they restored my dignity.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop",
    age: 60,
    location: "Kolar, Karnataka",
  },
  {
    id: "14",
    slug: "sunita-rao-lymphoma",
    patientName: "Sunita Rao",
    date: "30 September, 2026",
    conditionTag: "Lymphoma Support",
    excerpt: "Sunita overcame Hodgkin lymphoma with state-of-the-art chemotherapy and supportive care.",
    fullStory: `Sunita Rao, a software designer, was diagnosed with Hodgkin lymphoma. Supported by HCG Foundation's patient navigation team, her treatment proceeded without delay, leading to full remission.`,
    quote: "Compassionate healthcare makes all the difference when you're facing cancer.",
    imageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=1600&auto=format&fit=crop",
    age: 31,
    location: "Bengaluru, Karnataka",
  },
  {
    id: "15",
    slug: "rahul-varma-youth-recovery",
    patientName: "Rahul Varma",
    date: "15 October, 2026",
    conditionTag: "Youth Oncology",
    excerpt: "Rahul beat bone sarcoma and returned to playing competitive cricket with his college team.",
    fullStory: `College student Rahul Varma faced bone sarcoma requiring limb-sparing surgery and extensive physical therapy. HCG Foundation assisted with rehabilitation costs, helping him walk and run again.`,
    quote: "I fought back to get back on the cricket pitch, and HCG made it possible.",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1600&auto=format&fit=crop",
    age: 21,
    location: "Hassan, Karnataka",
  },
  {
    id: "16",
    slug: "kavitha-n-awareness",
    patientName: "Kavitha N",
    date: "2 November, 2026",
    conditionTag: "Awareness & Early Action",
    excerpt: "Kavitha's story highlights the power of early detection and community health screening drives.",
    fullStory: `Kavitha N was diagnosed at Stage 1 during a mobile mammography drive in rural Mandya. Early intervention ensured complete recovery with minimal treatment burden.`,
    quote: "Don't delay your health checks. Early action changes outcomes.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1600&auto=format&fit=crop",
    age: 45,
    location: "Mandya, Karnataka",
  },
];

