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

export const userGet = cache(async (start: number, per_page: number) => {
  return await Promise.all([
    prisma.user.findMany({
      skip: start,
      take: Number(per_page),
    }),
    prisma.user.count(),
  ]);
});

export const getAllCategories = cache(async () => {
  return await prisma.category.findMany({});
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

export const categoryWithCount = cache(async () => {
  const result = await prisma.book.groupBy({
    by: ["categoryId"],
    _count: {
      id: true,
    },
  });
  const categoriesWithCount = await Promise.all([
    ...result.map(async (group) => {
      const category = await prisma.category.findUnique({
        where: { id: group.categoryId },
        select: { name: true },
      });
      return {
        categoryName: category?.name,
        bookCount: group._count.id,
      };
    }),
  ]);
  return categoriesWithCount;
});

export const getLoans = cache(async (start: number, per_page: number) => {
  return await Promise.all([
    prisma.book.findMany({
      skip: start,
      take: per_page,
      where: {
        inPrestito: true,
      },
    }),
    prisma.book.count({
      where: {
        inPrestito: true,
      },
    }),
  ]);
});
