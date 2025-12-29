import * as z from 'zod';

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(1, { message: 'Password should be minimum 8 chars long' }),
  passwordConfirmation: z
    .string()
    .min(1, { message: 'Please confirm your password' }),
});
