import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { GuestRoute } from "@/components/auth/route-guards";
import { FullPageSpinner } from "@/components/ui/spinner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading..." />}>
      <GuestRoute>
        <AuthShell title="Welcome back" subtitle="Log in to continue your vehicle conversations.">
          <LoginForm />
        </AuthShell>
      </GuestRoute>
    </Suspense>
  );
}
