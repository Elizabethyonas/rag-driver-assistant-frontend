import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ id, label, error, hint, trailing, className = "", ...props }, ref) {
    const fieldId = id ?? props.name;
    const errorId = error ? `${fieldId}-error` : undefined;
    const hintId = hint ? `${fieldId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="relative">
          <input
            id={fieldId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
            className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:ring-3 focus:ring-accent/20 ${
              error ? "border-danger" : "border-border"
            } ${trailing ? "pr-11" : ""} ${className}`}
            {...props}
          />
          {trailing ? (
            <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>
          ) : null}
        </div>
        {hint && !error ? (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
