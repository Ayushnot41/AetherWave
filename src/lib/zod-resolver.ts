import type { FieldValues, Resolver, FieldErrors } from 'react-hook-form';
import type { z } from 'zod';

/**
 * Lightweight, zero-overhead Zod resolver for react-hook-form.
 * Conforms 100% to react-hook-form Resolver signature.
 */
export function zodResolver<TFieldValues extends FieldValues = FieldValues>(
  schema: z.ZodTypeAny,
): Resolver<TFieldValues> {
  return async (values: unknown) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: result.data as TFieldValues,
        errors: {},
      };
    }

    const errors: Record<string, { type: string; message: string }> = {};

    for (const issue of result.error.issues) {
      const field = issue.path.join('.') || 'root';
      if (!errors[field]) {
        errors[field] = {
          type: issue.code,
          message: issue.message,
        };
      }
    }

    return {
      values: {} as TFieldValues,
      errors: errors as FieldErrors<TFieldValues>,
    };
  };
}
