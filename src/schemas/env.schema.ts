import { z } from 'zod';

export const EnvConfigSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL').optional().or(z.literal('')),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(10, 'Invalid Supabase Anon Key')
    .optional()
    .or(z.literal('')),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

export function validateEnv(env: Record<string, string | undefined>): EnvConfig {
  const result = EnvConfigSchema.safeParse(env);
  if (!result.success) {
    console.warn('[Env Validation Warning]:', result.error.flatten().fieldErrors);
    return {
      EXPO_PUBLIC_SUPABASE_URL: env.EXPO_PUBLIC_SUPABASE_URL || '',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }
  return result.data;
}
