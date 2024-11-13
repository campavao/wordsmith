"use server";
import { FriendLeague, Player, Round } from "@/app/types/FriendLeague";
import { WritingStepClient } from "./WritingStep";

export interface SharedStep {
  roundId: string;
  leagueId: string;
  player: Player;
  league: FriendLeague;
  round: Round;
}

export async function WritingStep({
  leagueId,
  roundId,
  player,
  league,
  round,
}: SharedStep) {
  const activePlayers = league.players.filter(
    (p) => !p.isRemoved && !p.isSkipped
  );
  const playerIds = new Set(activePlayers.map((p) => p.id));
  const activeSubmissions = round.submissions.filter((v) =>
    playerIds.has(v.playerId)
  );
  const isLastPlayer = activePlayers.length - activeSubmissions.length <= 1;
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
      leagueId={leagueId}
      roundId={round.id}
      isLastPlayer={isLastPlayer}
    />
  );
}
