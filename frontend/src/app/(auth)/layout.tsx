export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0C0C0C] px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(252,204,45,0.12),transparent_55%)]"
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
