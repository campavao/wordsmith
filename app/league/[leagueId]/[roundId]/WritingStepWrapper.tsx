"use server"
import { getPlayer, getServerGame } from "@/app/api/apiUtils";
import { WritingStepClient } from "./WritingStep";
import { FriendLeague, Player, Round } from "@/app/types/FriendLeague";

export interface SharedStep {
  roundId: string;
  leagueId: string;
  player: Player;
  league: FriendLeague;
  round: Round
}

export async function WritingStep({
  leagueId,
  roundId,
  player,
  league,
  round
}: SharedStep) {
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
