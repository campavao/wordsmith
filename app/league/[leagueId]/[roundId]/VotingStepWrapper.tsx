"use server";
import { getPlayer, getServerGame } from "@/app/api/apiUtils";
import { SharedStep } from "./WritingStepWrapper";
import { VotingStepClient } from "./VotingStep";
import Error from "../error";

export async function VotingStep({ roundId, leagueId }: SharedStep) {
  const player = await getPlayer();
  const {
    data: league,
    error,
    message,
  } = await getServerGame({ leagueId, playerId: player.id });

  if (error) {
    return <Error message={message} />;
  }

  if (!league) {
    return <Error message='No league found' />;
  }

  const round = league.rounds.find((r) => r.id === roundId);

  if (!round) {
    return <Error message='No round found' />;
  }

  const submissions = round.submissions.filter((s) => s.playerId !== player.id);

  const availableSubmissions = shuffle(submissions);

  const playerVotes = round.votes.find((v) => v.playerId === player.id);

  const { numberOfDownvotes, numberOfUpvotes } = league.config;

  const isTwoPlayer = round.submissions.length <= 2;
  const isLastPlayer =
    Object.values(league.players).length - round.votes.length <= 1;

  return (
    <VotingStepClient
      isDone={playerVotes != null}
      isTwoPlayer={isTwoPlayer}
      availableSubmissions={availableSubmissions}
      submittedVotes={playerVotes?.submissions}
      prompt={round.prompt}
      numberOfDownvotes={numberOfDownvotes}
      numberOfUpvotes={numberOfUpvotes}
      playerId={player.id}
      leagueId={leagueId}
      roundId={round.id}
      isLastPlayer={isLastPlayer}
    />
  );
}

// declare the function
function shuffle<T extends object>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
