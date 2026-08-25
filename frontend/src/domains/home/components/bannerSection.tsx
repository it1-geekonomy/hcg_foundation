export default function BannerSection() {
  return (
    <section className="min-h-screen bg-slate-100 px-6 py-16 text-slate-900 sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col justify-center">
        <p className="font-manrope text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          HCG Foundation · Font test
        </p>

        <h1 className="mt-6 max-w-4xl font-argestadisplay text-6xl leading-none sm:text-8xl">
          Hope begins with a human story.
        </h1>

        <div className="mt-16 grid gap-8 border-t border-slate-300 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-manrope text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Manrope
            </p>
            <p className="mt-4 font-manrope text-xl font-medium leading-snug">
              Clear, warm, and modern.
            </p>
          </div>

          <div>
            <p className="font-manrope text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tiempos Fine
            </p>
            <p className="mt-4 font-tiempos-fine text-2xl leading-snug">
              Every journey matters.
            </p>
          </div>

          <div>
            <p className="font-manrope text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tiempos Headline
            </p>
            <p className="mt-4 font-tiempos-headline text-3xl leading-tight">
              A gentler way forward.
            </p>
          </div>

          <div>
            <p className="font-manrope text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Argesta Display
            </p>
            <p className="mt-4 font-argestadisplay text-3xl leading-tight">
              Together, we rise.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}