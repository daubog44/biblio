import { AdminDashboardComponent } from "@/components/admin-dashboard";
import Loading from "@/components/Loading";
import { booksGet, getAllCategories, getLoans, userGet } from "@/app/lib/callDB";
import {
    getUser
} from "@/app/lib/dal";
import prisma, { per_page_def, waituntil } from "@/app/lib/utils";
import { redirect } from "next/navigation";


export default async function Admin({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const session = await getUser()
    const userRole = (session)?.role // Assuming 'role' is part of the session object

    if (userRole !== "ADMIN") {
        return redirect("/");
    }

    const page = searchParams['page'] ?? '1'
    const query = searchParams['query'];
    const section = searchParams['section'] ?? "user" as "user" | "book" | "category" | "loan";
    const per_page = searchParams['limit'] ?? per_page_def;
    const start = (Number(page) - 1) * Number(per_page) // 0, 5, 10 ...
    const end = start + Number(per_page)
    let books, categories, users, userCount, booksCount, loans;


    if (query && typeof query === "string" && section === "book") {

        [categories, books, booksCount] = await Promise.all([getAllCategories(), prisma.book.findMany({
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
    }
    else if (section && section === "book") {
        [[books, booksCount], categories] = await Promise.all([booksGet(start, Number(per_page)), getAllCategories()])
    }

    else if (query && typeof query === "string" && section === "user") {
        [users, userCount] = await Promise.all([prisma.user.findMany({
            skip: start,
            take: Number(per_page),
            where: {
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                ],
            },
        }), prisma.user.count({
            where: {
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                ],
            },
        })]);
    } else if (section && section === "user") {
        [users, userCount] = await userGet(start, Number(per_page))
    }
    else if (query && typeof query === "string" && section === "category") {
        [categories] = await Promise.all([prisma.category.findMany({
            skip: start,
            take: Number(per_page),
            where: {
                name: { contains: query, mode: 'insensitive' },
            },
        })]);
    }
    else if (section && section === "category") {
        categories = await getAllCategories();
    } else if (section && section === "loan") {
        [loans, booksCount] = await getLoans();
        if (query && typeof query === "string")
            books = await prisma.book.findMany({
                skip: start,
                take: Number(per_page),
                include: { category: true },
                where: {
                    OR: [
                        { titolo: { contains: query || "", mode: 'insensitive' } },
                        { autore: { contains: query || "", mode: 'insensitive' } },
                    ],
                },
            });
    } else {
        return redirect("/")
    }

    return <AdminDashboardComponent loans={loans} categories={categories} users={users} userCount={userCount} booksCount={booksCount} books={books} start={start} end={end} />
}