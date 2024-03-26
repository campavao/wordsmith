import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DocumentData } from "firebase/firestore";
import { getPlayerData } from "../utils/leagueUtils";

export function History() {
  const { data: session } = useSession();
  const [player, setPlayer] = useState<DocumentData | undefined>();

  useEffect(() => {
    (async () => {
      if (!player && session?.user?.id) {
        const { data: playerData } = await getPlayerData(session.user.id);
        setPlayer(playerData);
      }
    })();
  }, [player, session?.user?.id]);

  if (!player?.history) {
    return;
  }

  return (
    <div className='border-t'>
      <p className='underline p-5'>History</p>
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
