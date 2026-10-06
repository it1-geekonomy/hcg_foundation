import Typography from "@/lib/Typography";

export default function Comingsoon() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-[#FFF8E2] px-4 py-24 sm:px-6 lg:min-h-[80vh] lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Typography
          variant="heading-2"
          as="h1"
          className="font-tiempos-headline font-normal text-black"
        >
          Research &amp; Innovation
        </Typography>
        <Typography
          variant="heading-8"
          as="p"
          className="mt-4 font-argestadisplay font-normal text-black"
        >
          Coming Soon
        </Typography>
      </div>
    </section>
  );
}
