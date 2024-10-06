import { Login } from "@/components/login";
import { cookies } from "next/headers";

export default async function Page() {
    const session = cookies().get("session")?.value;
    return <Login session={session} />
}