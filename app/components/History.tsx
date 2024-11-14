"server only";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "../api/auth";
import getDocument from "../api/firebase/getData";

export async function History() {
  const session = await getServerSession(authOptions);
  const playerId = session?.user?.id;

  if (!playerId) {
    console.log("no session id");
    return;
  }

  const entry = await getDocument("users", playerId);
  const player = entry.exists() ? entry.data() : {};

  if (!player?.history) {
    console.log("no history found");
    return;
  }

  return (
    <div className='flex flex-col items-center gap-4' suppressHydrationWarning>
      <h1 className='font-bold text-4xl'>History</h1>
      <h2 className='text-lg text-gray-700'>Your personal chapters</h2>
      <ul className='flex flex-col items-start gap-4 w-[400px]'>
        {player.history.map(
          (data: { name: string; leagueId: string }, index: number) => {
            return (
              <li className='w-full' key={"history-" + index}>
                <Link
                  href={`/league/${data.leagueId}`}
                  className='flex flex-between items-end w-full gap-1'
                >
                  <span className='whitespace-nowrap'>{data.name}</span>
                  <span className='repeating-dots'></span>
                  <span className=''>{index + 1}</span>
                </Link>
              </li>
            );
          }
        )}
      </ul>
    </div>
  );
}
