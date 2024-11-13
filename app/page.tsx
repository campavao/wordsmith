import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "./api/auth";
import { HelpBlock } from "./components/HelpBlock";
import { History } from "./components/History";
import { Login } from "./components/Login";

async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-6xl'>Wordsmith</h1>
      {session ? (
        <div className='flex flex-col gap-4 text-center'>
          <Link href='/friendLeague'>League</Link>
          {/* <Link href='/globalLeague'>Global League</Link> */}
          <Link href='/submissions'>Recent Works</Link>
          <Link href='/profile'>Profile</Link>
          <Login isSignout />
          <History />
        </div>
      ) : (
        <>
          <p className='text-lg'>
            A free short story competition with your friends
          </p>
          <Login />
          <HelpBlock />
        </>
      )}
    </div>
  );
}

export default Home;
