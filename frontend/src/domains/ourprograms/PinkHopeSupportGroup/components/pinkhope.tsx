import MissionHighlight from "@/shared/components/Missionsection";

// Content is data, kept separate from markup so the same MissionHighlight
// component can be reused across pages by swapping this object out.
const OUR_MISSION_CONTENT = {
  label: "Programs",
  heading: (
    <>
     Pink Hope Patient {" "}
      <br className="hidden min-[1920px]:block"/>
      Support Group
    </>
  ),
  paragraphs: [
    "Take pride in how far you've come",
    "In May 2009 five women got together to pursue a common goal: that of helping women suffering from breast cancer to overcome their fear of the disease, and to help them cope with the difficult treatment.",
    "These five women from diverse backgrounds had one thing in common: they were all breast cancer survivors. They all of them had the burning desire to help breast cancer patients get through the emotional and physical trauma caused by the diagnosis of the disease and its treatment, by sharing their experiences.",
  ],
  image: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791357160516-48mhx-rectangle-1655-1-.webp",
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