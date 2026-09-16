import MissionHighlight from "@/shared/components/Missionsection";

// Content is data, kept separate from markup so the same MissionHighlight
// component can be reused across pages by swapping this object out.
const OUR_MISSION_CONTENT = {
  label: "Our Mission",
  heading: (
    <>
      Care, Hope &amp; Healing for {" "}
      <br className="hidden lg:block"/>
      Every Patient
    </>
  ),
  paragraphs: [
    "HCG Foundation is the philanthropic arm of HCG — India's largest cancer care network. Established to bridge the gap between world class oncology and accessible community support, we serve patients and families across India regardless of their financial means.",
    "Our work spans financial assistance, awareness, early detection, education, and holistic patient support — addressing every dimension of the cancer journey, not just the clinical one.",
  ],
  image: "/aboutus/healingpatient.png",
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