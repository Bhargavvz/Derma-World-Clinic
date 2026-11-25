import type { ReactNode } from "react";

/** Label + control + hint + error, wired with aria-describedby / aria-invalid by the caller via ids. */
export function FormField({
  id,
  label,
  required,
  requiredLabel,
  optionalLabel,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  requiredLabel?: string;
  optionalLabel?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required ? (
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
        ) : optionalLabel ? (
          <span className="font-normal text-gray-600"> ({optionalLabel})</span>
        ) : null}
        {required && requiredLabel && <span className="sr-only"> ({requiredLabel})</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}

export const describedBy = (id: string, hasHint: boolean, hasError: boolean) =>
  [hasHint ? `${id}-hint` : "", hasError ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

/** Hidden honeypot field: humans never see or fill it. */
export function HoneypotField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
