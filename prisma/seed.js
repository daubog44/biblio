/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import bcrypt from "bcrypt";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const d = fs.readFileSync("./prisma/data.json", "utf8");
  const data = JSON.parse(d);
  await prisma.$executeRaw`ALTER SEQUENCE "books_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "categories_id_seq" RESTART WITH 1`;

  await prisma.book.deleteMany({});
  if (
    await prisma.user.findUnique({
      where: {
        email: process.env.ADMIN_MAIL,
      },
    })
  )
    await prisma.user.delete({
      where: {
        email: process.env.ADMIN_MAIL,
      },
    });
  await prisma.category.deleteMany({});

  for (const category of Object.keys(data)) {
    const books = // @ts-ignore
      data[category]
        .filter((el) => el.TITOLO)
        .map((book) => ({
          titolo: book.TITOLO,
          autore: book.AUTORE,
          casaEditrice: book["CASA EDITRICE"],
          note: book.NOTE,
          scompartoCase: book["Scomparto Case"],
          annoPubblicazione: book["ANNO PUBBL."],
        }))
        .sort((a, b) => (a.autore ?? "").localeCompare(b.autore ?? ""));

    await prisma.category.create({
      data: {
        name: category,
        books: { createMany: { data: [...books], skipDuplicates: true } },
      },
    });
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 11);

  await prisma.user.create({
    data: {
      email: process.env.ADMIN_MAIL,
      password: hashedPassword,
      name: process.env.ADMIN_NAME,
      number: process.env.ADMIN_NUMBER,
      role: "ADMIN",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
