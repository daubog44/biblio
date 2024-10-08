"use server";

import { BlobNotFoundError, del, head, put } from "@vercel/blob";
import { verifySession } from "@/app/lib/dal";
import { userModifier } from "@/app/lib/definitions";
import prisma from "@/app/lib/utils";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { Book } from "@prisma/client";
import _ from "lodash";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { deleteCsv } from "./utils";

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

  if (formData.email) {
    const validatedFields = userModifier.safeParse({
      email: formData.email,
    });

    if (!validatedFields.success) {
      return {
        error:
          validatedFields.error.flatten().fieldErrors.email?.length &&
          (validatedFields.error.flatten().fieldErrors.email as string[])
            .length > 0
            ? (validatedFields.error.flatten().fieldErrors.email as string[])[0]
            : "error",
      };
    }
  }

  if (
    "password" in formData ||
    "number" in formData ||
    formData.email ||
    "name" in formData ||
    formData.role
  ) {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...("password" in formData && { password: newPassword }),
          ...("number" in formData && { number: formData.number }),
          ...(formData.email && { email: formData.email }),
          ...("name" in formData && { name: formData.name }),
          ...(formData.role && {
            role: formData.role,
          }),
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          return { error: "C'è già un utente con questa email." };
        }
      }
      return { error: "Errore: dal server" };
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
    await prisma.user.create({
      data: {
        password,
        email,
        ...("number" in data && { number: data.number }),
        ...("name" in data && { name: data.name }),
        role: data.role || "VIEWER",
      },
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return { error: "C'è già un utente con questa email." };
      }
    }
    return { error: "Errore dal server." };
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

const MB = 1_048_576;
export async function modifyBook(data: Book, form: FormData) {
  const verify = await verifySession(false);
  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  if (!data || !data.id) {
    return { error: "Mancano i dati." };
  }
  const book = await prisma.book.findUnique({ where: { id: data.id } });
  if (!book) {
    return { error: "Il libro da modificare non esiste." };
  }
  if (
    book?.categoryId === data.categoryId ||
    (_.isEqual(data, _.pick(book, Object.keys(data))) && !form.has("file"))
  )
    return { error: "Nulla da modificare." };
  if (data.categoryId) {
    const cat = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!cat) {
      return { error: "La categoria non esiste." };
    }
  }

  let blob;
  try {
    if (form.has("file")) {
      const file = form.get("file") as File;
      if (file.size / MB > 1) {
        return { error: "Errore: l'immagine è troppo grande." };
      }
      if (!form.get("fileType")!.toString().startsWith("image/")) {
        return { error: "Errore: l'immagine non è adatta." };
      }
      const bytes = await file.arrayBuffer();
      blob = await put("imagesbiblio/" + file.name.trim(), bytes, {
        access: "public",
      });
      if (!blob) {
        return { error: "Errore dal server, l'mmagine non è adatta." };
      }
    }
  } catch (err) {
    return { error: "Errore: " + (err as Error).message };
  }

  if (
    data.titolo ||
    data.categoryId ||
    blob ||
    "autore" in data ||
    "casaEditrice" in data ||
    "annoPubblicazione" in data ||
    "scompartoCase" in data ||
    "note" in data
  ) {
    try {
      const res = await prisma.book.update({
        where: { id: data.id },
        data: {
          ...(blob && { image: blob.url }),
          ...("autore" in data && { autore: data.autore }),
          ...("casaEditrice" in data && { casaEditrice: data.casaEditrice }),
          ...(data.titolo && { titolo: data.titolo }),
          ...("annoPubblicazione" in data && {
            annoPubblicazione: data.annoPubblicazione,
          }),
          ...("scompartoCase" in data && { scompartoCase: data.scompartoCase }),
          ...("note" in data && { note: data.note }),
          ...(data.categoryId && {
            category: { connect: { id: data.categoryId } },
          }),
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          return { error: "C'è già un libro con questo nome." };
        }
      }
      return { error: "Errore dal server." };
    }
  } else {
    return { error: "Nulla da modificare." };
  }

  await deleteCsv();

  revalidatePath("/");
  revalidatePath("/admin");
  return { msg: "success" };
}

export async function deleteBook(id: number) {
  const verify = await verifySession(false);
  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  if (!id || !(id > 0)) {
    return { error: "Mancano i dati." };
  }
  const book = await prisma.book.findUnique({ where: { id: id } });
  if (!book) {
    return { error: "Errore: il libro non esiste." };
  }
  if (book.image) {
    try {
      const headB = await head(book.image);
      await del(headB.url);
    } catch (err) {
      if (err instanceof BlobNotFoundError) {
        return { error: (err as BlobNotFoundError).message };
      } else return { error: "Errore dal server." };
    }
  }

  const res = await prisma.book.delete({ where: { id } });
  if (!res.id) {
    return { error: "Nulla da modificare." };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { msg: "success" };
}

export async function addBook(data: Book, form: FormData) {
  const verify = await verifySession(false);

  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  if (!data || !data.titolo || !data.categoryId) {
    return { error: "Errore: i dati non sono corretti." };
  }

  const cat = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!cat) {
    return { error: "la categoria non esiste." };
  }

  let blob;
  try {
    if (form.has("file")) {
      const file = form.get("file") as File;
      if (file.size / MB > 1) {
        return { error: "Errore: l'immagine è troppo grande." };
      }
      if (!form.get("fileType")!.toString().startsWith("image/")) {
        return { error: "Errore: l'immagine non è adatta." };
      }
      const bytes = await file.arrayBuffer();
      blob = await put("imagesbiblio/" + file.name.trim(), bytes, {
        access: "public",
      });
      if (!blob) {
        return { error: "Errore dal server, l'mmagine non è adatta." };
      }
    }
  } catch (err) {
    return { error: "Errore: " + (err as Error).message };
  }

  try {
    const res = await prisma.book.create({
      data: {
        titolo: data.titolo,
        category: {
          connect: { id: data.categoryId },
        },
        ...(data.autore && { autore: data.autore }),
        ...(data.annoPubblicazione && {
          annoPubblicazione: data.annoPubblicazione,
        }),
        ...(data.casaEditrice && {
          casaEditrice: data.casaEditrice,
        }),
        ...(blob && {
          image: blob.url,
        }),
        ...(data.scompartoCase && {
          scompartoCase: data.scompartoCase,
        }),
        ...(data.note && {
          note: data.note,
        }),
      },
    });

    if (!res.id) {
      return { error: "Errore dal server." };
    }
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return { error: "C'è già un libro con questo titolo." };
      }
    }
    return { error: "Errore dal server." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { msg: "success" };
}

export async function addCategory(name: string) {
  const verify = await verifySession(false);

  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  if (!name) {
    return { error: "Errore: i dati non sono corretti." };
  }

  try {
    await prisma.category.create({ data: { name } });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return { error: "C'è già una categoria con questo nome." };
      }
    }
    return { error: "Errore: dal server" };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { msg: "success" };
}

export async function deleteCat(id: number, replaBooksTo?: number) {
  const verify = await verifySession(false);

  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  if (!id) {
    return { error: "Errore: i dati non sono corretti." };
  }

  try {
    if (replaBooksTo) {
      await prisma.book.updateMany({
        where: { categoryId: id },
        data: {
          categoryId: replaBooksTo,
        },
      });
    }
    await prisma.category.delete({ where: { id } });
  } catch (err) {
    return { error: "Errore dal server" };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { msg: "success" };
}

export async function modifyCat(id: number, name: string) {
  const verify = await verifySession(false);

  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  if (!id || !name) {
    return { error: "Errore: i dati non sono corretti." };
  }

  try {
    await prisma.category.update({ where: { id }, data: { name } });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return { error: "C'è già una categoria con questo nome." };
      }
    }
    return { error: "Errore: dal server" };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { msg: "success" };
}
