import { Suspense } from "react";
import LoginForm from "@/domains/cms/components/LoginForm";

export default function AuthLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-white/50">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
