import Link from "next/link";
import { Button } from "./ui/button";

export default function HomeBtn() {
    return (
        <Button asChild>
            <Link href={{
                pathname: '/',
            }}>Home</Link>
        </Button>
    )
}