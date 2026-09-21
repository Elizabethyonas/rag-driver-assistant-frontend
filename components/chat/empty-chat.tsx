"use client";

import { SparkleIcon } from "@/components/ui/icons";

const EXAMPLES = [
  "Why is my engine overheating?",
  "What should I check if my brakes feel soft?",
  "How often should I change my engine oil?",
];

export function EmptyChat({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
        <SparkleIcon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">How can I help with your vehicle?</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        Ask a question about symptoms, maintenance, or dashboard warnings. Answers come from the RAG
        assistant connected to your FastAPI backend.
      </p>
      <ul className="mt-8 grid w-full gap-2 sm:grid-cols-1">
        {EXAMPLES.map((example) => (
          <li key={example}>
            <button
              type="button"
              onClick={() => onSelectPrompt(example)}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left text-sm hover:border-accent/40 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {example}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
