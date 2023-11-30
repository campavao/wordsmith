"use client"
import { FriendLeague } from "@/app/types/FriendLeague";
import Link from "next/link";
import { useCallback, useEffect,  useState } from "react";

export default function League({
  params,
}: {
  params: { leagueId: string };
  }) {
  const [league, setLeague] = useState<FriendLeague>()

  const getGame = useCallback(async () => {
    const response = await fetch(`/api/league?leagueId=${encodeURIComponent(params.leagueId)}`);
    const body = await response.json();
    const { data } = body;
    return data;
  }, [params.leagueId])

  useEffect(() => {
    (async () => {
      const game = await getGame();
      setLeague(game)
     })()
  }, [getGame])

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>League {params.leagueId}</h1>
      {league == null ? (
        <p className='text-red-500'>Game not found</p>
      ) : (
        <div>
          <p>{league.config.name}</p>
        </div>
      )}
      <Link href='/'>Back</Link>
    </div>
  );
}
