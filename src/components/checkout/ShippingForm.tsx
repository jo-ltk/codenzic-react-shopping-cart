import type { ChangeEvent, FormEvent } from "react";
import {
  type ShippingErrors,
  type ShippingField,
  type ShippingFormData,
} from "@/lib/checkout/shippingSchema";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface ShippingFormProps {
  values: ShippingFormData;
  errors: ShippingErrors;
  onChange: (field: ShippingField, value: string) => void;
  onBlur: (field: ShippingField) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const FIELDS: {
  name: ShippingField;
  label: string;
  type: string;
  autoComplete: string;
}[] = [
  { name: "fullName", label: "Full Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "address", label: "Address", type: "text", autoComplete: "street-address" },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { name: "postalCode", label: "Postal Code", type: "text", autoComplete: "postal-code" },
];

export function ShippingForm({
  values,
  errors,
  onChange,
  onBlur,
  onSubmit,
  onBack,
}: ShippingFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleChange = (field: ShippingField) => (e: ChangeEvent<HTMLInputElement>) => {
    onChange(field, e.target.value);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 pb-2">
      <div>
        <span className="meta text-accent">Shipping</span>
        <h3 className="mt-1 font-display text-xl font-light text-charcoal sm:text-2xl">
          Where should it arrive?
        </h3>
      </div>

      {hasErrors ? (
        <p className={ui.notice} role="alert">
          Please correct the highlighted fields before continuing.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const error = errors[field.name];
          const wide =
            field.name === "fullName" ||
            field.name === "address" ||
            field.name === "email";
          return (
            <div key={field.name} className={wide ? "sm:col-span-2" : undefined}>
              <label
                htmlFor={`ship-${field.name}`}
                className="meta mb-2 block text-charcoal/45"
              >
                {field.label}
              </label>
              <input
                id={`ship-${field.name}`}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                value={values[field.name]}
                onChange={handleChange(field.name)}
                onBlur={() => onBlur(field.name)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `ship-${field.name}-error` : undefined}
                data-cursor=""
                className={cn(
                  ui.fieldOnPaper,
                  "min-h-11",
                  error && "border-accent/60 bg-accent/[0.03]",
                )}
              />
              {error ? (
                <p
                  id={`ship-${field.name}-error`}
                  className="mt-1.5 text-xs leading-snug text-accent"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <button type="button" onClick={onBack} data-cursor="" className={cn(ui.btnGhost, "flex-1")}>
          Back to review
        </button>
        <button type="submit" data-cursor="" className={cn(ui.btnPrimary, "flex-1")}>
          Continue to payment
        </button>
      </div>
    </form>
  );
}
