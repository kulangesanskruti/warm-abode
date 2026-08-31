import { z, ZodSchema, ZodError } from "zod";

export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

export const validate = <T>(schema: ZodSchema, data: unknown): ValidationResult<T> => {
  try {
    const parsed = schema.parse(data);
    return {
      isValid: true,
      data: parsed as T,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });

      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: false,
      errors: { general: ["Validation failed"] },
    };
  }
};

export const validateAsync = async <T>(
  schema: ZodSchema,
  data: unknown,
): Promise<ValidationResult<T>> => {
  try {
    const parsed = await schema.parseAsync(data);
    return {
      isValid: true,
      data: parsed as T,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });

      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: false,
      errors: { general: ["Validation failed"] },
    };
  }
};

// Common validation schemas
export const emailSchema = z.string().email("Invalid email format");

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const idSchema = z.string().uuid("Invalid ID format");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
});
