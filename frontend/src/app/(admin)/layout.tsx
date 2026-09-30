import AdminAuthGate from "@/domains/cms/shell/AdminAuthGate";
import AdminShell from "@/domains/cms/shell/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGate>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGate>
  );
}
