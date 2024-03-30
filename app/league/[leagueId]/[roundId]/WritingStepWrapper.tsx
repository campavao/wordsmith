"use server"
import { getPlayer, getServerGame } from "@/app/api/apiUtils";
import { WritingStepClient } from "./WritingStep";

export interface SharedStep {
  roundId: string;
  leagueId: string;
}

export async function WritingStep({ leagueId, roundId }: SharedStep) {
  const player = await getPlayer();
  const {
    data: league,
    error,
    message,
  } = await getServerGame({ leagueId, email: player.email });

  if (error) {
    return <div>{message}</div>;
  }

  if (!league) {
    return <div>No league found</div>;
  }

  const round = league.rounds.find((r) => r.id === roundId);

  if (!round) {
    return <div>No round found</div>;
  }

  const isLastPlayer = league.players.length - round.submissions.length <= 1;
  const limit = round.wordLimit;
  const prompt = round.prompt;

  const activeSubmission = round.submissions.find(
    (item) => item.playerId === player.id && item.roundId === roundId
  );

  return (
    <WritingStepClient
      limit={limit}
      prompt={prompt}
      foundText={activeSubmission?.text}
      foundTitle={activeSubmission?.title}
      playerId={player.id}
      leagueId={leagueId}
      roundId={round.id}
      isLastPlayer={isLastPlayer}
    />
  );
}
