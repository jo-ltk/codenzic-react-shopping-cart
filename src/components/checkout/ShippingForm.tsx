import type { ChangeEvent, FormEvent } from "react";
import {
  type ShippingErrors,
  type ShippingField,
  type ShippingFormData,
} from "@/lib/checkout/shippingSchema";
import { cn } from "@/lib/utils";

interface ShippingFormProps {
  values: ShippingFormData;
  errors: ShippingErrors;
  onChange: (field: ShippingField, value: string) => void;
  onBlur: (field: ShippingField) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const FIELDS: { name: ShippingField; label: string; type: string; autoComplete: string }[] = [
  { name: "fullName", label: "Full Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "address", label: "Address", type: "text", autoComplete: "street-address" },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { name: "postalCode", label: "Postal Code", type: "text", autoComplete: "postal-code" },
];

const fieldClass =
  "w-full border border-charcoal/15 bg-transparent px-3.5 py-2.5 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-accent/60";

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

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <span className="meta text-accent">Shipping</span>
        <h3 className="mt-1 font-display text-xl font-light text-charcoal">
          Where should it arrive?
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const error = errors[field.name];
          const wide = field.name === "fullName" || field.name === "address" || field.name === "email";
          return (
            <div key={field.name} className={wide ? "sm:col-span-2" : undefined}>
              <label htmlFor={`ship-${field.name}`} className="meta mb-2 block text-charcoal/45">
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
                className={cn(fieldClass, error && "border-accent/50")}
              />
              {error ? (
                <p
                  id={`ship-${field.name}-error`}
                  className="mt-1.5 text-xs text-accent"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          data-cursor=""
          className="meta inline-flex min-h-11 flex-1 items-center justify-center border border-charcoal/15 px-4 py-3 text-charcoal transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          Back to review
        </button>
        <button
          type="submit"
          data-cursor=""
          className="meta inline-flex min-h-11 flex-1 items-center justify-center bg-ink px-4 py-3 text-paper transition-colors duration-300 hover:bg-accent"
        >
          Continue to payment
        </button>
      </div>
    </form>
  );
}
