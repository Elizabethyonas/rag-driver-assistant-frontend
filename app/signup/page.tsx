import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { GuestRoute } from "@/components/auth/route-guards";
import { FullPageSpinner } from "@/components/ui/spinner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading..." />}>
      <GuestRoute>
        <AuthShell
          title="Create your account"
          subtitle="Sign up to save chats and ask the vehicle assistant."
        >
          <SignupForm />
        </AuthShell>
      </GuestRoute>
    </Suspense>
  );
}
