"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function FriendLeague() {
  const { data: session } = useSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>Fellow Writers</h1>
      <button>Join</button>
      <button>Create</button>
      <Link href='/'>Back</Link>
    </div>
  );
}
