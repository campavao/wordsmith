"use server";
import Link from "next/link";
import { Footnote } from "./components/Footnote";
import { getPlayer, getServerGame } from "@/app/api/apiUtils";
import { WritingStep } from "./WritingStepWrapper";
import { VotingStep } from "./VotingStepWrapper";
import { ReviewStep } from "./ReviewStepWrapper";

export default async function Round({
  params,
}: {
  params: {
    leagueId: string;
    roundId: string;
  };
}) {
  const { leagueId, roundId } = params;
  const user = await getPlayer();
  const {
    data: league,
    error,
    message,
  } = await getServerGame({ leagueId, email: user.email });

  if (error) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8 '>
        <p className='text-red-500'>{message ?? "User not found"}</p>
        <Link href='/'>Back home</Link>
      </div>
    );
  }

  if (!league) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8 '>
        <p className='text-red-500'>League not found</p>
        <Link href='/'>Back home</Link>
      </div>
    );
  }

  const { rounds } = league;
  let roundIndex = rounds.findIndex((item) => item.id === roundId);

  if (roundIndex === -1) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8 '>
        <p className='text-red-500'>Round not found</p>
        <Link href='/'>Back home</Link>
      </div>
    );
  }

  let nextRoundId = undefined;

  if (rounds.length > roundIndex + 1) {
    nextRoundId = rounds[roundIndex + 1].id;
  }

  const round = rounds[roundIndex];

  const isWriting =
    round?.status === "not started" || round?.status === "in progress";

  const isVoting = round?.status === "voting";
  const isCompleted = round?.status === "completed";

  return (
    <div className='flex flex-col items-center gap-12'>
      <h1 className='h1 font-bold text-lg'>{league.config.name}</h1>
      <div className='max-w-lg w-full'>
        {isWriting && (
          <WritingStep
            {...params}
            player={user}
            league={league}
            round={round}
          />
        )}
        {isVoting && (
          <VotingStep {...params} player={user} league={league} round={round} />
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
              player={user}
              league={league}
              round={round}
            />
            {nextRoundId && (
              <Link
                className='block w-full text-center p-1'
                href={`/league/${params.leagueId}/${nextRoundId}`}
              >
                Next round
              </Link>
            )}
          </>
        )}
        <div className='text-center p-1 mt-4'>
          <Link href={`/league/${params.leagueId}`}>Back to league</Link>
        </div>
      </div>
    </div>
  );
}
