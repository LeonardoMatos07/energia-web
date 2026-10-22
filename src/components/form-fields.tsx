import type { ReactNode } from "react";
import type { Option } from "@/lib/member-options";

export const inputClass =
  "border-line bg-surface text-ink focus-visible:border-accent w-full rounded-lg border px-3 py-2 text-sm";

export function Field({
  id,
  label,
  hint,
  required = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-muted mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  required,
  placeholder = "Selecione",
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <Field id={id} label={label} required={required} hint={hint}>
      <select
        id={id}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckboxGroup({
  legend,
  options,
  selected,
  onChange,
  hint,
}: {
  legend: string;
  options: readonly Option[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
  hint?: string;
}) {
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      {hint ? <p className="text-muted mb-2 text-xs">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                checked
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line bg-surface hover:border-accent hover:bg-accent-soft"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => toggle(option.value)}
              />
              {checked ? <span aria-hidden>✓ </span> : null}
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FormMessage({
  status,
  children,
}: {
  status: "error" | "success";
  children: ReactNode;
}) {
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2 text-sm ${
        status === "error"
          ? "border-danger text-danger"
          : "border-success text-success bg-success-soft"
      }`}
    >
      {children}
    </p>
  );
}

export const primaryButton =
  "bg-accent text-on-accent rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60";
