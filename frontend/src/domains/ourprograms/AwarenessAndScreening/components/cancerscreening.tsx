import MissionHighlight from "@/shared/components/Missionsection";

// Content is data, kept separate from markup so the same MissionHighlight
// component can be reused across pages by swapping this object out.
const OUR_MISSION_CONTENT = {
  label: "Our Mission",
  heading: (
    <>
      Cancer Screening and {" "}
      <br className="hidden min-[1920px]:block"/>
      Awareness Programs
    </>
  ),
  paragraphs: [
    "At HCG Foundation, we believe that cancer is curable if detected early. Unfortunately, our experience has shown that many individuals seek medical attention only when the disease has progressed to advanced stages (III or IV). This lack of early diagnosis is prevalent among various groups, including government health department personnel, rural populations, and even educated individuals.",
    "To address this critical issue, we have developed comprehensive programs aimed at cancer screening programs and raising awareness about cancer, with a particular focus on breast, oral, and cervical cancers. These initiatives educate communities about cancer's early signs and symptoms and promote regular screenings.",
  ],
  image: "/cancerscreening/cancerscreening.png",
  imageAlt: "A family greeting an elderly couple outdoors",
};

export default function OurMissionSection() {
  return (
    <MissionHighlight
      label={OUR_MISSION_CONTENT.label}
      heading={OUR_MISSION_CONTENT.heading}
      paragraphs={OUR_MISSION_CONTENT.paragraphs}
      image={OUR_MISSION_CONTENT.image}
      imageAlt={OUR_MISSION_CONTENT.imageAlt}
    />
  );
}

/*
Reusing MissionHighlight on another page just means passing a different
content object, e.g.:

<MissionHighlight
  label="Our Approach"
  heading="Community First, Always"
  paragraphs={["...", "..."]}
  image="/programs/community-first.png"
/>
*/