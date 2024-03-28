"use server";
import { authOptions } from "@/app/api/auth";
import { LeagueId, Round } from "@/app/types/FriendLeague";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { CopyLeagueId } from "../CopyLeagueId";
import { getPlayer, getServerGame } from "@/app/api/apiUtils";
import { Suspense } from "react";
import Loading from "./loading";

export default async function League({
  params,
}: {
  params: { leagueId: string };
}) {
  const player = await getPlayer()

  const {
    data: league,
    error,
    message,
  } = await getServerGame({
    leagueId: params.leagueId,
    email: player.email,
  });

  if (error) {
    return <div>{message}</div>;
  }

  let isStarted = false;
  let roundId: string | undefined = undefined;

  if (league) {
    isStarted = league.rounds.at(0)?.status !== "not started";

    const uncompletedGames = league.rounds.filter(
      ({ status }) => status !== "completed"
    );

    roundId = uncompletedGames.at(0)?.id;

    if (roundId) {
      const newRoundIndex = league.rounds.findIndex(
        (round) => round.id === roundId
      );
      if (
        newRoundIndex > 0 &&
        league.rounds[newRoundIndex - 1]?.status === "completed" &&
        league.rounds[newRoundIndex].status === "not started"
      ) {
        roundId = league.rounds[newRoundIndex - 1].id;
      }
    }
  }

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <CopyLeagueId leagueId={params.leagueId} />
      <Suspense fallback={<Loading />}>
        {league == null || error ? (
          <p className='text-red-500'>{error ?? "Game not found"}</p>
        ) : (
          <div className='flex flex-col justify-center items-center gap-8 '>
            <h1 className='font-bold text-lg underline'>
              {league.config.name}
            </h1>
            <ol className='w-[300px] list-decimal'>
              <p>Authors</p>
              {league.players.map((player, key) => (
                <li key={player.name + key}>
                  <p className='flex gap-2'>
                    {player.name}
                    {league.config.creator?.email === player.email && (
                      <CrownIcon />
                    )}
                  </p>
                </li>
              ))}
            </ol>
            {league.rounds.find(isInProgressOrComplete) && (
              <ol className='flex flex-col gap-4 w-full max-w-[700px] list-decimal'>
                <p>Rounds</p>
                {league.rounds.filter(isInProgressOrComplete).map((round) => (
                  <li key={round.id}>
                    <RoundCard round={round} leagueId={params.leagueId} />
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
        {roundId && (
          <Link href={`/league/${params.leagueId}/${roundId}`}>
            {isStarted ? "Continue" : "Start"}
          </Link>
        )}
      </Suspense>
      <Link href='/'>Back</Link>
    </div>
  );
}

function isInProgressOrComplete(round: Round) {
  return round.status === "in progress" || round.status === "completed";
}

function RoundCard({ round, leagueId }: { round: Round; leagueId: LeagueId }) {
  return (
    <Link
      href={`/league/${leagueId}/${round.id}`}
      className='flex flex-col justify-center items-center gap-8 w-full p-4 rounded border-black'
    >
      {round.prompt}
    </Link>
  );
}

function CrownIcon() {
  return (
    <svg
      width='24px'
      height='24px'
      viewBox='0 0 24 24'
      strokeWidth='1.5'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      color='#000000'
    >
      <path
        d='M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z'
        stroke='#000000'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
      <path
        d='M16.8 15.5L18 8.5L13.8 10.6L12 8.5L10.2 10.6L6 8.5L7.2 15.5H16.8Z'
        stroke='#000000'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      ></path>
    </svg>
  );
}
