"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { useGame } from "@/app/hooks/useGame";
import { WritingStep } from "./WritingStep";
import { VotingStep } from "./VotingStep";
import { ReviewStep } from "./ReviewStep";
import { useMemo } from "react";
import { Footnote } from "./components/Footnote";

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

  const nextRoundId = useMemo(() => {
    if (league?.rounds) {
      const currentIndex = league.rounds.findIndex(
        ({ id }) => id === params.roundId
      );

      if (currentIndex !== -1 && league.rounds.length > currentIndex + 1) {
        return league.rounds[currentIndex + 1].id;
      }
    }
  }, [league?.rounds, params.roundId]);

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

  const isWriting =
    round?.status === "not started" || round?.status === "in progress";

  const isVoting = round?.status === "voting";
  const isCompleted = round?.status === "completed";

  return (
    <div className='flex flex-col items-center gap-12'>
      <h1 className='h1 font-bold text-lg'>{league.config.name}</h1>
      <div className='max-w-lg w-screen'>
        {isWriting && (
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
        {(isWriting || isVoting) && (
          <Footnote
            round={round}
            league={league}
            action={isWriting ? "submitted" : "voted"}
            isVoting={isVoting}
          />
        )}
        {isCompleted && (
          <>
            <ReviewStep
              {...params}
              session={session}
              round={round}
              league={league}
            />
            {nextRoundId ? (
              <Link
                className='block w-full text-center p-1'
                href={`/league/${params.leagueId}/${nextRoundId}`}
              >
                Next round
              </Link>
            ) : (
              <Link
                className='block w-full text-center p-1'
                href={`/league/${params.leagueId}`}
              >
                Back
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
