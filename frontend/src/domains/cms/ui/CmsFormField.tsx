import Typography from "@/lib/Typography";
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
      <Typography
        variant="label-1"
        as="label"
        htmlFor={htmlFor}
        className="block font-medium text-cms-ink"
      >
        {label}
      </Typography>
      {children}
      {hint ? (
        <Typography variant="caption-1" as="p" className="text-cms-muted">
          {hint}
        </Typography>
      ) : null}
    </div>
  );
}
