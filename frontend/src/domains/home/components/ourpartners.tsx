import Image from "next/image";
import Typography from "@/lib/Typography";

type Partner = {
  id: number;
  name: string;
  src: string;
};

const PARTNERS: Partner[] = [
  { id: 1, name: "Partner 1", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678346275-qjnh8-11127low_mercklogobluergb-1.webp" },
  { id: 2, name: "Partner 2", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678430459-3dexk-whatsapp-image-2025-06-09-at-10.49.11-am-1.webp" },
  { id: 3, name: "Partner 3", src:  "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678483636-xanmd-cvc-logo-1.webp" },
  { id: 4, name: "Partner 4", src:  "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678524791-k605p-chf-logo-1.webp"},
  { id: 5, name: "Partner 5", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678567381-f4ldn-nes-fircroft-logo-1-png-1.webp"},
  { id: 6, name: "Partner 6", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678635110-ib6wn-efl-logo-1.webp"},
  { id: 7, name: "Partner 7", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678685508-vj10b-prestige_group_logo-1.webp" },
  { id: 8, name: "Partner 8", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678729472-tnxc5-sd-foundation-logo-3.webp"},
  { id: 9, name: "Partner 9", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678796205-u7nh8-image-93.webp"},
  { id: 10, name: "Partner 10", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678840491-apawg-corporatelogomark_rgb_hr-2-1.webp"},
  { id: 11, name: "Partner 11", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678923536-ep1da-220923-nuvama-private-sub-brand-identity-gradient-cmyk-positive-blue-1.webp"},
  { id: 12, name: "Partner 12", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793678988630-9gnk0-360one_brandmark_cmyk_top_right_white-1.webp" },
  { id: 13, name: "Partner 13", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793679042987-95vq2-image-97.webp"},
  { id: 14, name: "Partner 14", src:  "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793679107635-ftfwu-neo_page-0002-1.webp"},
  { id: 15, name: "Partner 15", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793679158361-serml-rego_logo-1.webp" },
  { id: 16, name: "Partner 16", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793679211030-4bkf4-ig-color-logo-1.webp"},
];

function LogoGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="
        flex min-w-full shrink-0 items-center justify-around
        gap-10 pr-10 sm:gap-14 sm:pr-14 lg:gap-20 lg:pr-20
        animate-[marquee_45s_linear_infinite]
        group-hover:[animation-play-state:paused]
        motion-reduce:animate-none
      "
    >
      {PARTNERS.map(({ id, src, name }) => (
        <li key={id} className="flex shrink-0 items-center">
        <Image
  src={src}
  alt={hidden ? "" : name}
  width={320}
  height={128}
  unoptimized
  loading={hidden ? "lazy" : "eager"}
  draggable={false}
  className="h-10 w-auto max-w-[160px] select-none object-contain sm:h-12 sm:max-w-[190px] lg:h-16 lg:max-w-[230px]"
/>
        </li>
      ))}
    </ul>
  );
}

export default function OurPartners() {
  return (
    <section
      aria-labelledby="our-partners-heading"
      className="bg-[#FFF6D8] pt-8 pb-6 sm:py-10 lg:py-14"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <Typography
          id="our-partners-heading"
          variant="heading-1"
          as="h2"
          className="text-center text-[#382E07] font-tiempos-headline"
        >
          Our Partners
        </Typography>
      </div>

      <div
        className="
          group mt-8 flex overflow-hidden sm:mt-10 lg:mt-12
          [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]
          motion-reduce:overflow-x-auto
        "
      >
        <LogoGroup />
        <LogoGroup hidden />
      </div>
    </section>
  );
}