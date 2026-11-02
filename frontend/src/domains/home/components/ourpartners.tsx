import Image from "next/image";
import Typography from "@/lib/Typography";

type Partner = {
  id: number;
  name: string;
  src: string;
};

const PARTNERS: Partner[] = [
  { id: 1, name: "Partner 1", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621047481-svz8b-partners1.webp" },
  { id: 2, name: "Partner 2", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621122639-dyvpn-partners2.webp" },
  { id: 3, name: "Partner 3", src:  "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621145405-o3qng-partners3.webp" },
  { id: 4, name: "Partner 4", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621170340-abxqq-partners4.webp"},
  { id: 5, name: "Partner 5", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621192237-xwj5h-partners5.webp" },
  { id: 6, name: "Partner 6", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621215721-da47g-partners6.webp"},
  { id: 7, name: "Partner 7", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621236414-syb39-partners7.webp" },
  { id: 8, name: "Partner 8", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621261319-geh73-partners8.webp"},
  { id: 9, name: "Partner 9", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621284006-6cx0e-partners9.webp" },
  { id: 10, name: "Partner 10", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621305818-rjqip-partners10.webp" },
  { id: 11, name: "Partner 11", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621325675-awy8y-partners11.webp"},
  { id: 12, name: "Partner 12", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621348929-7s0g4-partners12.webp" },
  { id: 13, name: "Partner 13", src:  "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621371210-m8v6n-partners13.webp" },
  { id: 14, name: "Partner 14", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621392513-5nm05-partners14.webp"},
  { id: 15, name: "Partner 15", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621415055-0fdtg-partners15.webp" },
  { id: 16, name: "Partner 16", src: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1793621439480-y6aoq-partners16.webp"},
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
            width={160}
            height={64}
            sizes="(min-width: 1024px) 128px, (min-width: 640px) 112px, 96px"
            loading={hidden ? "lazy" : "eager"}
            draggable={false}
            className="h-9 w-auto select-none object-contain sm:h-11 lg:h-14"
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