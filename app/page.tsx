"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

function Home() {
  const { data: session } = useSession();

  const handleLogin = async () => {
    await signIn("google");
  };

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>Wordsmith</h1>
      {session ? (
        <div className='flex flex-col gap-4 text-center'>
          <Link href='/friendLeague'>Friend League</Link>
          <Link href='/globalLeague'>Global League</Link>
          <Link href='/profile'>Profile</Link>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}

export default Home;
