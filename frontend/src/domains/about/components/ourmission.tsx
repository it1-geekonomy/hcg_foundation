import MissionHighlight from "@/shared/components/Missionsection";

const OUR_MISSION_CONTENT = {
  label: "Our Mission & Vision",
  heading: (
    <>
      Care, Hope &amp; Healing for{" "}
      <br className="hidden min-[1920px]:block" />
      Every Patient
    </>
  ),
  paragraphs: [
    {
      title: "Mission:",
      items: [
        "Provide financial support to those who cannot afford cancer treatment.",
        "Spread awareness about cancer.",
        "Make early detection services more accessible to rural communities.",
        "Provide psychological support to families of cancer patients.",
        "Educate students on healthy lifestyle habits and cancer prevention.",
        "Support and promote research towards cancer prevention, treatment, and eradication.",
      ],
    },
    {
      title: "Vision:",
      items: [
        "Ensure access to quality cancer treatment for those in need.",
        "Create greater awareness about cancer and its prevention.",
      ],
    },
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