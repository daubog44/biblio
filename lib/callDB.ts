import { cache } from "react";
import prisma from "./utils";

export const booksGet = cache(async (start: number, per_page: number) => {
  return await Promise.all([
    prisma.book.findMany({
      skip: start,
      include: { category: true },
      take: Number(per_page),
    }),
    prisma.book.count(),
  ]);
});

export const booksGetByCat = cache(
  async (category: string, start: number, per_page: number) => {
    return await Promise.all([
      prisma.book.findMany({
        skip: start,
        take: per_page,
        include: { category: true },
        where: {
          category: {
            name: category,
          },
        },
      }),
      prisma.book.count({
        where: {
          category: {
            name: category,
          },
        },
      }),
    ]);
  }
);
