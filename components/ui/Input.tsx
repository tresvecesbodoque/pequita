import { forwardRef } from "react";
import { clsx } from "clsx";
import { Rotulo } from "./Rotulo";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

// Campo de la v3: rótulo en versalitas de oro y caja de cristal (ver DESIGN.md).
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, className, id, ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      {label && <Rotulo>{label}</Rotulo>}
      <input
        ref={ref}
        id={id}
        className={clsx(
          "rounded-xl border-[1.5px] border-[var(--borde)] bg-[var(--cristal)] px-4 py-2.5 text-[var(--ink)] outline-none backdrop-blur-[4px] transition-colors placeholder:text-[var(--ink-tenue)] focus:border-[var(--borde-vivo)]",
          className
        )}
        {...props}
      />
    </label>
  );
});
