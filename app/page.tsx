export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { checkPostTableExists } from "@/lib/db-utils";

export default async function Home() {
  // Check if the post table exists
  const tableExists = await checkPostTableExists();

  // If the post table doesn't exist, redirect to setup page
  if (!tableExists) {
    redirect("/setup");
  }

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-24 px-8"></div>
  );
}
