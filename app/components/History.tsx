"server only";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import getDocument from "../api/firebase/getData";
import { authOptions } from "../api/auth";

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
    <div className='border-t' suppressHydrationWarning>
      <p className='underline p-5 text-center'>History</p>
      <ul className='flex flex-col items-center gap-4'>
        {player.history.map(
          (data: { name: string; leagueId: string }, key: string) => (
            <li key={"history-" + key}>
              <Link href={`/league/${data.leagueId}`}>{data.name}</Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
