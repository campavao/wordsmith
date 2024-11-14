import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "./api/auth";
import { HelpBlock } from "./components/HelpBlock";
import { Login } from "./components/Login";

async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-2xl lg:text-6xl'>Wordsmith</h1>
      {session ? (
        <div className='flex flex-col gap-4 items-center'>
          <h2 className='text-lg font-bold'>TABLE OF CONTENTS</h2>
          <ol className='flex flex-col gap-4 items-start w-full lg:w-[400px]'>
            <li className='w-full'>
              <Link
                className='w-full flex flex-between items-end gap-1'
                href='/friendLeague'
              >
                League
                <span className='repeating-dots'></span> 1
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
                Personal Works
                <span className='repeating-dots'></span> 2
              </Link>
            </li>
            <li className='w-full'>
              <Link
                className='w-full flex flex-between items-end gap-1'
                href='/profile'
              >
                Profile
                <span className='repeating-dots'></span> 3
              </Link>
            </li>
            <li className='w-full'>
              <Link
                className='w-full flex flex-between items-end gap-1'
                href='/history'
              >
                History<span className='repeating-dots'></span>4
              </Link>
            </li>
          </ol>
          <Login isSignout />
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
