export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-cms
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cms-sidebar px-4 py-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]"
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
