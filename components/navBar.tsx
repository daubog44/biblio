"use server";
import { verifySession } from "@/lib/dal";
import NavBarClient from "./NbarClientPart";

export async function NavBar({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await verifySession();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <nav className="flex items-center justify-between p-4 border-b">
                <h1 className="text-2xl font-bold">Laura&Lucio books</h1>
                <NavBarClient role={session!.role} />
            </nav>
            {children}
        </div>
    )
}