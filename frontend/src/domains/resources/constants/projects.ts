export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  category?: string;
  summary?: string;
  fullStory: string;
  imageUrl: string;
}

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "1",
    slug: "art-gallery-art-therapy-sessions",
    title: "Art Gallery & Art Therapy Sessions",
    date: "19 December 2025",
    category: "Wellness",
    summary:
      "Creative workshops and therapeutic art sessions providing cancer patients and their families a safe space to express emotions, reduce anxiety, and find hope.",
    fullStory: `Art has the power to heal beyond words. Through creative workshops and therapeutic art sessions, HCG Foundation provides cancer patients and their families with a safe space to express emotions, reduce stress, and rediscover hope during their treatment journey. The Swasti Art Gallery & Art Therapy Sessions is a unique initiative by HCG Foundation that blends creativity with compassionate cancer care. Recognizing that healing extends beyond medical treatment, the program offers patients and their families an opportunity to express emotions, reduce anxiety, and find moments of joy through art. The initiative is centered around the belief that creativity can become a powerful source of hope, resilience, and emotional well-being.

Conducted under the guidance of professional artists, therapists, and volunteers, the sessions include painting, sketching, colouring, craft activities, and collaborative artwork. These creative experiences encourage patients to communicate feelings that are often difficult to express through words while fostering confidence, positivity, and meaningful social interaction.`,
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "2",
    slug: "cancer-awareness-screening",
    title: "Cancer Awareness & Screening",
    date: "19 December 2025",
    category: "Awareness",
    summary:
      "Free early detection screening camps and educational sessions organized across underserved rural and urban communities.",
    fullStory: `Early detection saves lives. HCG Foundation organized a comprehensive Cancer Awareness & Screening camp aimed at providing accessible health checks and early diagnostic support to vulnerable communities.

Medical experts and oncology specialists conducted consultations, mammograms, oral cancer screenings, and general wellness evaluations. Along with clinical check-ups, interactive awareness sessions educated attendees on early warning signs, lifestyle risks, and preventive care measures.

Through these initiatives, the foundation strives to bridge healthcare disparities and ensure that every individual, regardless of socioeconomic background, receives timely guidance and compassionate medical support.`,
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "3",
    slug: "hpv-vaccination-program",
    title: "HPV Vaccination Program",
    date: "19 December 2025",
    category: "Community Event",
    summary:
      "Protecting young women through subsidized and free Cervical Cancer HPV vaccination drives in partnership with local schools and healthcare workers.",
    fullStory: `Cervical cancer is one of the few cancers that can be effectively prevented through timely vaccination. As part of its preventive health campaign, HCG Foundation launched the HPV Vaccination Drive dedicated to safeguarding young girls and women.

The program includes comprehensive health education workshops for parents and guardians, addressing myths and highlighting the safety and efficacy of the HPV vaccine. Healthcare professionals administer vaccinations under strict clinical protocols while providing follow-up guidance.

By prioritizing preventive oncology, HCG Foundation aims to reduce the burden of cervical cancer and create a healthier future for generations to come.`,
    imageUrl:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    slug: "art-therapy-wellness",
    title: "Art Therapy & Wellness",
    date: "19 December 2025",
    category: "Wellness",
    summary:
      "Interactive group healing sessions, music therapy, and guided meditation sessions designed for oncology patients and caregivers.",
    fullStory: `Healing encompasses mind, body, and spirit. The Art Therapy & Wellness gathering brought together oncology patients, survivors, caregivers, and medical staff for a day of rejuvenation and mutual encouragement.

Participants engaged in guided meditation, expressive clay sculpting, and group music sessions. These activities provided a comforting outlet to relieve emotional fatigue and build strong bonds of solidarity within the survivor community.

HCG Foundation remains committed to expanding holistic wellness initiatives that enrich patient care and bring warmth to their healing journey.`,
    imageUrl:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "5",
    slug: "christmas-new-year-celebration",
    title: "Christmas & New Year Celebration",
    date: "25 December 2025",
    category: "Celebration",
    summary:
      "Festive holiday celebrations bringing smiles, gift distribution, and joyous music performances to pediatric and adult cancer wards.",
    fullStory: `Spreading joy and light during the holiday season, HCG Foundation organized a heart-warming Christmas and New Year celebration across pediatric and adult oncology wards.

Volunteers dressed as Santa Claus distributed personalized gift hampers, art kits, and healthy treats to patients. Local choir groups performed festive carols, filling the hospital hallways with laughter, warmth, and festive cheer.

Moments of joy play a vital role in patient recovery, reminding patients that they are surrounded by a caring and compassionate community.`,
    imageUrl:
      "https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "6",
    slug: "pediatric-oncology-support-drive",
    title: "Pediatric Oncology Support Drive",
    date: "10 January 2026",
    category: "Community Event",
    summary:
      "Dedicated nutritional aid, educational scholarship kits, and emotional support programs for young brave heart cancer warriors.",
    fullStory: `Children facing cancer demonstrate extraordinary courage every single day. The Pediatric Oncology Support Drive was launched to provide holistic assistance to young patients and their families.

The initiative delivered specialized high-protein nutritional supplements, interactive learning tablets, and financial assistance grants to cover auxiliary treatment costs. 

HCG Foundation stands beside every child and family, ensuring no young warrior walks their cancer journey alone.`,
    imageUrl:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "7",
    slug: "art-therapy-wellness-session",
    title: "Art Therapy & Wellness",
    date: "19 Dec 2025",
    category: "Wellness",
    summary:
      "Expressive art workshops providing oncology patients a creative sanctuary for healing and emotional well-being.",
    fullStory: `Healing encompasses mind, body, and spirit. The Art Therapy & Wellness gathering brought together oncology patients, survivors, caregivers, and medical staff for a day of rejuvenation and mutual encouragement.`,
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "8",
    slug: "cancer-awareness-screening-drive",
    title: "Cancer Awareness & Screening",
    date: "19 Dec 2025",
    category: "Awareness",
    summary:
      "Comprehensive cancer screening and early detection camps organized for community healthcare access.",
    fullStory: `Early detection saves lives. HCG Foundation organized a comprehensive Cancer Awareness & Screening camp aimed at providing accessible health checks and early diagnostic support to vulnerable communities.`,
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "9",
    slug: "hpv-vaccination-community-drive",
    title: "HPV Vaccination Program",
    date: "19 Dec 2025",
    category: "Community Event",
    summary:
      "Protecting young women through subsidized and free Cervical Cancer HPV vaccination drives in partnership with local schools and healthcare workers.",
    fullStory: `Cervical cancer is one of the few cancers that can be effectively prevented through timely vaccination. As part of its preventive health campaign, HCG Foundation launched the HPV Vaccination Drive dedicated to safeguarding young girls and women.`,
    imageUrl:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "10",
    slug: "swasti-art-therapy-and-wellness",
    title: "Art Therapy & Wellness",
    date: "19 Dec 2025",
    category: "Wellness",
    summary:
      "Interactive group healing sessions, music therapy, and guided meditation sessions designed for oncology patients and caregivers.",
    fullStory: `Healing encompasses mind, body, and spirit. The Art Therapy & Wellness gathering brought together oncology patients, survivors, caregivers, and medical staff for a day of rejuvenation and mutual encouragement.`,
    imageUrl:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "11",
    slug: "cancer-awareness-rural-screening",
    title: "Cancer Awareness & Screening",
    date: "19 Dec 2025",
    category: "Awareness",
    summary:
      "Free early detection screening camps and educational sessions organized across underserved rural and urban communities.",
    fullStory: `Early detection saves lives. HCG Foundation organized a comprehensive Cancer Awareness & Screening camp aimed at providing accessible health checks and early diagnostic support to vulnerable communities.`,
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "12",
    slug: "art-therapy-caregivers-wellness",
    title: "Art Therapy & Wellness",
    date: "19 Dec 2025",
    category: "Wellness",
    summary:
      "Creative workshops and therapeutic art sessions providing cancer patients and their families a safe space to express emotions, reduce anxiety, and find hope.",
    fullStory: `Art has the power to heal beyond words. Through creative workshops and therapeutic art sessions, HCG Foundation provides cancer patients and their families with a safe space to express emotions, reduce stress, and rediscover hope during their treatment journey.`,
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
  },
];
