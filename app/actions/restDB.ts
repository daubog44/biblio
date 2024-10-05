"use server";

import { verifySession } from "@/lib/dal";
import { userModifier } from "@/lib/definitions";
import prisma from "@/lib/utils";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

export async function postLoan(data: any) {
  const verify = await verifySession(false);

  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  const { id, details } = data;
  if (!id || !details || !(Number(id) > 0)) {
    return { error: "Errore: i dati non sono corretti." };
  }

  const book = await prisma.book.findUnique({ where: { id: Number(id) } });
  if (!book) {
    return { error: "Errore: il libro non esiste." };
  }
  if (book?.inPrestito) {
    return { error: "Errore: il libro è già in prestito" };
  }

  const res = await prisma.book.update({
    where: {
      id: Number(id),
    },
    data: {
      inPrestito: true,
      dettagliPrestito: details,
    },
  });

  if (!res.id) {
    return { error: "Errore dal server" };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { msg: "success" };
}

export async function restituito(data: any) {
  const verify = await verifySession(false);

  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  const { id } = data;
  if (!id || !(Number(id) > 0)) {
    return { error: "Errore: i dati non sono corretti." };
  }

  const book = await prisma.book.findUnique({ where: { id: Number(id) } });
  if (!book) {
    return { error: "Errore: il libro non esiste." };
  }
  if (!book?.inPrestito) {
    return { error: "Errore: il libro non è in prestito" };
  }

  const res = await prisma.book.update({
    where: {
      id: Number(id),
    },
    data: {
      inPrestito: false,
      dettagliPrestito: "",
    },
  });

  if (!res.id) {
    return { error: "Errore dal server" };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { msg: "success" };
}

export async function modifyUser(formData: any) {
  const verify = await verifySession(false);
  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  if (!formData || !formData.id) {
    return { error: "Nulla da modificare." };
  }
  let newPassword;
  const id = formData.id;

  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user?.id) {
    return { error: "Utente non trovato." };
  }

  if (formData.password) {
    const validatedFields = userModifier.safeParse({
      password: formData.password,
    });

    if (!validatedFields.success) {
      return {
        error:
          validatedFields.error.flatten().fieldErrors.password?.length &&
          (validatedFields.error.flatten().fieldErrors.password as string[])
            .length > 0
            ? (
                validatedFields.error.flatten().fieldErrors.password as string[]
              )[0]
            : "error",
      };
    }

    newPassword = await bcrypt.hash(validatedFields.data.password, 11);
  }

  if (
    "password" in formData ||
    "number" in formData ||
    "email" in formData ||
    "name" in formData ||
    "role" in formData
  ) {
    const res = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...("password" in formData && { password: newPassword }),
        ...("number" in formData && { number: formData.number }),
        ...("email" in formData && { email: formData.email }),
        ...("name" in formData && { name: formData.name }),
        ...(formData.role && {
          role: formData.role,
        }),
      },
    });
    if (!res.id) {
      return { error: "Errore dal server" };
    }
  } else {
    return { error: "Nulla da modificare." };
  }

  revalidatePath("/admin");

  return { msg: "success" };
  // Return early if the form data is invalid
}

export async function addUser(data: any) {
  const verify = await verifySession(false);
  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  if (!data || !data.password || !data.email) {
    return { error: "Mancano i dati." };
  }

  const validatedFields = userModifier.safeParse({
    password: data.password,
    email: data.email,
  });
  if (!validatedFields.success) {
    return {
      error:
        validatedFields.error.flatten().fieldErrors.email?.length &&
        (validatedFields.error.flatten().fieldErrors.email as string[]).length >
          0
          ? (validatedFields.error.flatten().fieldErrors.email as string[])[0]
          : validatedFields.error.flatten().fieldErrors.password?.length &&
            (validatedFields.error.flatten().fieldErrors.password as string[])
              .length > 0
          ? (
              validatedFields.error.flatten().fieldErrors.password as string[]
            )[0]
          : "error",
    };
  }

  const password = await bcrypt.hash(validatedFields.data.password, 11);
  const email = validatedFields.data.email;

  try {
    const res = await prisma.user.create({
      data: {
        password,
        email,
        ...("number" in data && { number: data.number }),
        ...("name" in data && { name: data.name }),
        role: data.role || "VIEWER",
      },
    });
    if (!res.id) {
      return { error: "Errore dal server." };
    }
  } catch (err) {
    return { error: "Errore dal server, prova a cambiare l'email." };
  }

  revalidatePath("/admin");

  return { msg: "success" };
}

export async function deleteUser(id: number) {
  const verify = await verifySession(false);
  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  if (!id || !(id > 0)) {
    return { error: "Mancano i dati." };
  }
  const user = await prisma.user.findUnique({ where: { id: id } });
  if (!user) {
    return { error: "Errore: l'utente non esiste." };
  }

  const res = await prisma.user.delete({ where: { id } });
  if (!res.id) {
    return { error: "Nulla da modificare." };
  }

  revalidatePath("/admin");

  return { msg: "success" };
}
