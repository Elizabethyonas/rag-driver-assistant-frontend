import { AlertIcon } from "@/components/ui/icons";

export function Alert({ children }: { children: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/8 px-3 py-2.5 text-sm text-danger"
    >
      <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
