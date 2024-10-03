
import { AdminDashboardComponent } from "@/components/admin-dashboard";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function Admin() {
    const session = await verifySession();
    const userRole = (session)?.role // Assuming 'role' is part of the session object

    if (userRole !== "ADMIN") {
        return redirect("/");
    }
    return <AdminDashboardComponent />
}