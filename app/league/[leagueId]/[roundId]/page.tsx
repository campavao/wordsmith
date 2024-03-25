"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { useGame } from "@/app/hooks/useGame";
import { WritingStep } from "./WritingStep";
import { VotingStep } from "./VotingStep";

export default function Round({
  params,
}: {
  params: {
    leagueId: string;
    roundId: string;
  };
}) {
  const { league, round, error, isLoading } = useGame(params);
  const { data: session } = useSession();

  if (isLoading) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
        Loading...
      </div>
    );
  }

  if (!league) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8 '>
        <p className='text-red-500'>League not found</p>
        <Link href='/'>Back</Link>
      </div>
    );
  }

  if (!round) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8 '>
        <p className='text-red-500'>Round not found</p>
        <Link href='/'>Back</Link>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8 '>
        <p className='text-red-500'>{error ?? "User not found"}</p>
        <Link href='/'>Back</Link>
      </div>
    );
  }

  const isWritingStep =
    round?.status === "not started" || round?.status === "in progress";

  const isVoting = round?.status === "voting";

  return (
    <div className='flex flex-col items-center'>
      <h1 className='h1 font-bold text-lg mt-10'>{league.config.name}</h1>
      <div className='max-w-lg w-screen'>
        {isWritingStep && (
          <WritingStep
            {...params}
            session={session}
            round={round}
            league={league}
          />
        )}
        {isVoting && (
          <VotingStep
            {...params}
            session={session}
            round={round}
            league={league}
          />
        )}
      </div>
    </div>
  );
}
