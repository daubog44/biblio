import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { redirect } from "next/navigation";
import { cache } from "react";
import prisma from "./utils";

export const verifySession = cache(async (withredirect = true) => {
  const cookie = cookies().get("session")?.value;

  const session = (await decrypt(cookie)) as { userId: number; role: string };

  if (!session?.userId) {
    if (withredirect) redirect("/login");
    else return null;
  }
  return {
    role: session.role as "ADMIN" | "VIEWER",
    userId: session.userId as number,
  };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: session.userId,
      },
      // Explicitly return the columns you need rather than the whole user object
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.log("Failed to fetch user");
    return null;
  }
});
