"server only";
import Link from "next/link";
import { authOptions } from "../api/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>Author</h1>
      <div>Name: {session?.user?.name}</div>
      <div>Email: {session?.user?.email}</div>
      <Link href='/'>Back home</Link>
    </div>
  );
}
