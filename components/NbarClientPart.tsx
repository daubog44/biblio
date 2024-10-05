"use client";
import { usePathname } from "next/navigation"
import { AdminBtn } from "./adminBtn";
import HomeBtn from "./HomeBtn";
import { Logout } from "./logout";
import { ModeToggle } from "./theme-btn";

export default function NavBarClient({ role }: { role: "ADMIN" | "VIEWER" }) {
    const path = usePathname();

    return (
        <div className="flex items-center space-x-4">
            <Logout />
            <ModeToggle />
            {role === "ADMIN" && path === "/" && <AdminBtn />}
            {role === "ADMIN" && path.startsWith("/admin") && <HomeBtn />}
        </div>
    )
}