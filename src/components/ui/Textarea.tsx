import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, ReactNode, forwardRef } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-xs tracking-[0.14em] uppercase text-slate">
          {label}
          {props.required ? <span className="text-warm-metal"> *</span> : null}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full min-h-28 bg-surface border border-line-strong px-4 py-3 text-sm text-ivory placeholder:text-slate/60 outline-none transition-colors focus:border-silver resize-y",
            error && "border-danger",
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error ? (
          <p id={`${inputId}-hint`} className="text-xs text-slate">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
