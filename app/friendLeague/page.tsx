import Link from "next/link";
import { getPlayer } from "../api/apiUtils";
import { FriendLeagueClient } from "./FriendLeagueClient";
import { Suspense } from "react";
import Loading from "../league/[leagueId]/loading";

export default async function FriendLeague() {
  const player = await getPlayer();

  return (
    <Suspense fallback={<Loading />}>
      <div className='flex flex-col w-full justify-center items-center h-[90%] gap-8'>
        <h1 className='font-bold text-lg'>Fellow Writers</h1>
        <FriendLeagueClient player={player} />
        <Link href='/'>Back home</Link>
      </div>
    </Suspense>
  );
}
