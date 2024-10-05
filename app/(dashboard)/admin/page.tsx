
import { AdminDashboardComponent } from "@/components/admin-dashboard";
import Loading from "@/components/Loading";
import { booksGet, getAllCategories, getLoans, userGet } from "@/lib/callDB";
import {
    getUser
} from "@/lib/dal";
import prisma from "@/lib/utils";
import { redirect } from "next/navigation";
import { Suspense } from "react";


export default async function Admin({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    return (
        <Suspense fallback={<Loading />}>
            <Body searchParams={searchParams} />
        </Suspense>
    )
}

async function Body({
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
    const per_page = searchParams['limit'] ?? '8'
    const start = (Number(page) - 1) * Number(per_page) // 0, 5, 10 ...
    const end = start + Number(per_page)
    let books, categories, users, userCount, booksCount, loans;


    if (query && typeof query === "string" && section === "book")
        [books, booksCount] = await Promise.all([prisma.book.findMany({
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
    else if (section && section === "book") {
        [books, booksCount] = await booksGet(start, Number(per_page))
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
        [loans, booksCount] = await getLoans(start, Number(per_page));
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