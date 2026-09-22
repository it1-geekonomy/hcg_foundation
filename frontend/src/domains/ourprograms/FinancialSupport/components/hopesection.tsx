import MissionHighlight from "@/shared/components/Missionsection";

// Content is data, kept separate from markup so the same MissionHighlight
// component can be reused across pages by swapping this object out.
const OUR_MISSION_CONTENT = {
  label: "Our Mission",
  heading: (
    <>
      Care, Hope &amp; Healing for {" "}
      <br className="hidden min-[1920px]:block"/>
      Every Patient
    </>
  ),
  paragraphs: [
    "HCG Foundation works to support cancer patients, families, and communities through initiatives focused on financial assistance, awareness, early detection, education, and holistic patient support.",
    "Our work aims to make cancer care more accessible and extend support beyond clinical treatment — helping patients and families navigate different stages of the cancer journey with greater care, dignity, and hope. HCG Foundation supports cancer patients and families through financial assistance, awareness, early detection, and holistic care—bringing greater hope and support throughout their cancer journey.",
  ],
  image: "/aboutus/mission.png",
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