import { CarIcon } from "@/components/ui/icons";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 bg-background">
      <section className="relative hidden w-[46%] overflow-hidden bg-ink px-12 py-12 text-ink-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.18),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.12),transparent_40%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm">
            <CarIcon className="h-4 w-4 text-accent" />
            Driver Assistant
          </div>
          <h1 className="mt-10 max-w-md text-4xl font-semibold tracking-tight">
            Practical answers for the car in front of you.
          </h1>
          <p className="mt-4 max-w-sm text-base leading-7 text-white/70">
            Ask about warning lights, maintenance, overheating, brakes, and owner-manual
            procedures. Retrieval stays grounded in your vehicle knowledge base.
          </p>
        </div>
        <ul className="relative space-y-3 text-sm text-white/70">
          <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            Chat history stays with your account
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            Sessions sync through the FastAPI RAG backend
          </li>
        </ul>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <CarIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">Driver Assistant</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </div>
  );
}
