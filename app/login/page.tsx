import { Login } from "@/components/login";
import { getUser } from "../lib/dal";

export default async function Page() {
    const session = await getUser();
    return <Login session={session?.name} />
}