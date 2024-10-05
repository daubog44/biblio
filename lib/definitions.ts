export interface SessionPayload {
  [key: string]: string | Date | number; // Add this line if dynamic keys are expected
  // other properties...
}

import { z } from "zod";

export const userModifier = z.object({
  email: z.string().email({ message: "l'email non è valida" }).trim(),
  password: z
    .string()
    .min(8, { message: "la password deve avere almeno 8 caratteri." })
    .regex(/[a-zA-Z]/, {
      message: "la password deve contenere almeno una lettera.",
    })
    .regex(/[0-9]/, {
      message: "la password deve contenere almeno un numero.",
    })
    .regex(/[^a-zA-Z0-9]/, {
      message: "la password deve contenere almeno un carattere speciale.",
    })
    .trim(),
});

export const SigninFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z.string().trim(),
});

export type FormState =
  | {
      message?: string;
    }
  | undefined;
