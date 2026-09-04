import { z } from "zod";

export const shippingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(2, "Enter your full name"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .regex(/^[+]?[\d\s().-]{7,20}$/, "Enter a valid phone number"),
  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .min(5, "Enter a complete street address"),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .min(2, "Enter a valid city"),
  postalCode: z
    .string()
    .trim()
    .min(1, "Postal code is required")
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]{2,11}$/, "Enter a valid postal code"),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

export type ShippingField = keyof ShippingFormData;

export type ShippingErrors = Partial<Record<ShippingField, string>>;

export const EMPTY_SHIPPING: ShippingFormData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

/** Validate one field or the whole form. Returns field → message map. */
export function validateShipping(
  data: ShippingFormData,
  field?: ShippingField,
): ShippingErrors {
  if (field) {
    const shape = shippingSchema.shape[field];
    const result = shape.safeParse(data[field]);
    if (result.success) return {};
    return { [field]: result.error.issues[0]?.message ?? "Invalid value" };
  }

  const result = shippingSchema.safeParse(data);
  if (result.success) return {};

  const errors: ShippingErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) {
      errors[key as ShippingField] = issue.message;
    }
  }
  return errors;
}
