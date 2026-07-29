import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, ReactNode, forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: ReactNode;
  error?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-xs tracking-[0.14em] uppercase text-slate">
          {label}
          {props.required ? <span className="text-warm-metal"> *</span> : null}
        </label>
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-surface border border-line-strong px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-silver appearance-none",
            error && "border-danger",
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {placeholder ? (
            <option value="" className="bg-ink text-slate">
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-ink">
              {option.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
