import { z } from 'zod';

export const UserSchema = z
  .object({
    // UUID string
    id: z.string().uuid('The id needs to be a valid UUID'),
    firstName: z
      .string({ message: 'First name is required' })
      .min(1, 'First name cannot be an empty string'),
    lastName: z
      .string({ message: 'Last name is required' })
      .min(1, 'Last name cannot be an empty string'),
    // Array of unique emails, min 1, max 3
    emails: z
      .array(z.string().email('Invalid email format'), {
        message: 'The emails field is required',
      })
      .min(1, 'A user must have at least 1 email')
      .max(3, 'A user can have at most 3 emails')
      .refine((emails) => new Set(emails).size === emails.length, {
        message: 'All the emails must be unique',
      }),
    // ISO date format (YYYY-MM-DD)
    dob: z
      .string({
        message: 'Date of birth is required',
      })
      .date('dob must be in the format YYYY-MM-DD'),
  })
  .required()
  .strict();

export type User = z.infer<typeof UserSchema>;
