import { forwardRef } from "react";
import { clsx } from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, className, id, ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && <span className="font-medium text-[var(--muted)]">{label}</span>}
      <input
        ref={ref}
        id={id}
        className={clsx(
          "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]/60 focus:border-[var(--accent-soft)] focus:ring-2 focus:ring-[var(--accent-soft)]/30",
          className
        )}
        {...props}
      />
    </label>
  );
});
