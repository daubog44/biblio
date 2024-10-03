import { NavBar } from "@/components/navBar";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <NavBar>
            {children}
        </NavBar>
    );
}
