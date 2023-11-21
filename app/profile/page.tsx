"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function Profile() {
  const { data: session } = useSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>Author</h1>
      <div>Name: {session?.user?.name}</div>
      <div>Email: {session?.user?.email}</div>
      <Link href='/'>Back</Link>
    </div>
  );
}
