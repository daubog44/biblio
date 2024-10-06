
import { BookSearchComponent } from '@/components/book-search';
import { booksGet, booksGetByCat, getAllCategories } from '@/app/lib/callDB';
import { getUser } from '@/app/lib/dal'
import prisma from '@/app/lib/utils';
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getUser()

  if (!session) {
    return redirect("/login")
  }

  const page = searchParams['page'] ?? '1'
  const per_page = searchParams['limit'] ?? '16'
  const category = searchParams['category'];
  const query = searchParams['query'];
  const start = (Number(page) - 1) * Number(per_page) // 0, 5, 10 ...
  const end = start + Number(per_page) // 5, 10, 15 ...
  const categories = await getAllCategories();
  let books, count;
  //if (query?.length === 4 && Number(query))

  if (query && typeof query === "string")
    [books, count] = await Promise.all([prisma.book.findMany({
      skip: start,
      take: Number(per_page),
      include: { category: true },
      where: {
        OR: [
          { titolo: { contains: query, mode: 'insensitive' } },
          { autore: { contains: query, mode: 'insensitive' } },
        ],
      },
    }), prisma.book.count({
      where: {
        OR: [
          { titolo: { contains: query, mode: 'insensitive' } },
          { autore: { contains: query, mode: 'insensitive' } },
        ],
      },
    })]);

  else if (category && typeof category === "string") {
    [books, count] = await booksGetByCat(category, start, Number(per_page));
  }
  else
    [books, count] = await booksGet(start, Number(per_page))

  return <BookSearchComponent count={count} categories={categories} books={books} totalPages={Math.ceil(count / Number(per_page))} hasPrevPage={start > 0} hasNextPage={end < count} />
}
