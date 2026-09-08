import AdminAuthGate from "@/domains/cms/components/AdminAuthGate";
import AdminShell from "@/domains/cms/components/AdminShell";

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
