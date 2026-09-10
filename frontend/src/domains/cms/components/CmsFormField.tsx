import { cn } from "@/lib/utils";

export function CmsFormField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block font-manrope text-sm font-semibold text-[#212121]"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="font-manrope text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
