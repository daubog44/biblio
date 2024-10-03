import Link from "next/link";
import { Button } from "./ui/button";

export function AdminBtn() {
    return (
        <Button asChild>
            <Link href={{
                pathname: '/admin',
            }}>Admin</Link>
        </Button>
    )
}