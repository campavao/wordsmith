import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "./api/auth";
import { HelpBlock } from "./components/HelpBlock";
import { Login, SignOut } from "./components/Login";

async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className='flex flex-col justify-center h-[90%] gap-4'>
      {session ? (
        <>
          <h1 className='font-bold text-4xl'>Wordsmith</h1>
          <div className='flex flex-col gap-4'>
            <h2 className='text-lg text-gray-700'>Table of contents</h2>
            <ol className='flex flex-col gap-4 items-start w-full'>
              <li className='w-full'>
                <Link
                  className='w-full flex flex-between items-end gap-1'
                  href='/friendLeague/create'
                >
                  Create league
                  <span className='repeating-dots'></span> 1
                </Link>
              </li>
              <li className='w-full'>
                <Link
                  className='w-full flex flex-between items-end gap-1'
                  href='/friendLeague/join'
                >
                  Join league
                  <span className='repeating-dots'></span> 13
                </Link>
              </li>
              <li className='w-full'>
                <Link
                  className='w-full flex flex-between items-end gap-1'
                  href='/history'
                >
                  History
                  <span className='repeating-dots'></span> 27
                </Link>
              </li>
              {/* <li>
              <Link href='/globalLeague'>Global League</Link>
            </li> */}
              <li className='w-full'>
                <Link
                  className='w-full flex flex-between items-end gap-1'
                  href='/submissions'
                >
                  Written by me
                  <span className='repeating-dots'></span> 48
                </Link>
              </li>
              <li className='w-full'>
                <Link
                  className='w-full flex flex-between items-end gap-1'
                  href='/profile'
                >
                  Profile
                  <span className='repeating-dots'></span> 95
                </Link>
              </li>

              <li className='w-full'>
                <SignOut className='w-full flex flex-between items-end gap-1'>
                  Sign out
                  <span className='repeating-dots'></span> 100
                </SignOut>
              </li>
            </ol>
          </div>
        </>
      ) : (
        <div className='flex flex-col justify-center gap-8'>
          <div className='flex flex-col gap-4'>
            <h1 className='font-bold text-4xl md:text-6xl'>Wordsmith</h1>
            <h2 className='text-lg text-gray-700'>
              A free short story competition with your friends
            </h2>
          </div>

          <Login />
          <HelpBlock />
        </div>
      )}
    </div>
  );
}

export default Home;
