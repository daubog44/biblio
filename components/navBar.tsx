import { getUser } from "@/app/lib/dal";
import NavBarClient from "./NbarClientPart";
import { redirect } from "next/navigation";

export async function NavBar({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getUser();
    if (!session) {

        return redirect("/login")
    }

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