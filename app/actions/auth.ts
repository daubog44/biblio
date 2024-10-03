"use server";
import { createSession, deleteSession } from "@/lib/session";
import { FormState, SigninFormSchema } from "@/lib/definitions";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import prisma from "@/lib/utils";
import { verifySession } from "@/lib/dal";

export async function logout() {
  deleteSession();
  redirect("/login");
}

export async function signin(formstate: FormState, formData: FormData) {
  // Previous steps:
  // 1. Validate form fields
  const validatedFields = SigninFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      message: "non hai inserito la password o l'email.",
    };
  }

  const { email, password } = validatedFields.data;
  const [user, session] = await Promise.all([
    prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        password: true,
        role: true,
        id: true,
      },
    }),
    verifySession(false),
  ]);
  if (session) {
    return {
      message: "hai già eseguito il login!",
    };
  }
  if (!user) {
    return {
      message: "le credenziali sono sbagliate!",
    };
  }
  // e.g. Hash the user's password before storing it
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return {
      message: "le credenziali sono sbagliate!",
    };
  }
  // Current steps:
  // 4. Create user session
  await createSession(user.id, user.role);
  // 5. Redirect user
  redirect("/");
}
