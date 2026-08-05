import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function BannerSection() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-6">
      <h1 className="mb-4 text-center text-5xl font-bold text-slate-900">
        Home Banner Section
      </h1>

      <p className="mb-12 max-w-2xl text-center text-lg text-slate-600">
        Examples of customizing shadcn Buttons using only the <code>className</code> prop.
      </p>
    </section>
  );
}