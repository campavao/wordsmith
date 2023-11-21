"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function GlobalLeague() {
  const { data: session } = useSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>Global Writers</h1>
      <button>Join</button>
      <Link href='/'>Back</Link>
    </div>
  );
}
