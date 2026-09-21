import { Suspense, type ReactNode } from "react";
import { ChatLayout } from "@/components/chat/chat-layout";
import { ProtectedRoute } from "@/components/auth/route-guards";
import { FullPageSpinner } from "@/components/ui/spinner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
};

export default function ChatRouteLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading chat..." />}>
      <ProtectedRoute>
        <ChatLayout>{children}</ChatLayout>
      </ProtectedRoute>
    </Suspense>
  );
}
