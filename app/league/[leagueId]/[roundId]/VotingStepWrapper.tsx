"use server";
import { VotingStepClient } from "./VotingStep";
import { SharedStep } from "./WritingStepWrapper";

export async function VotingStep({
  leagueId,
  round,
  player,
  league,
}: SharedStep) {
  const submissions = round.submissions.filter((s) => s.playerId !== player.id);

  const availableSubmissions = shuffle(submissions);
  const submissionIds = availableSubmissions.map((i) => i.id);

  const playerVotes = round.votes.find((v) => v.playerId === player.id);

  const playerVoteSubmissions = playerVotes?.submissions.sort(
    (a, b) =>
      submissionIds.indexOf(a.submissionId) -
      submissionIds.indexOf(b.submissionId)
  );

  const { numberOfDownvotes, numberOfUpvotes } = league.config;

  const isTwoPlayer = round.submissions.length <= 2;
  const activePlayers = league.players.filter(
    (p) => !p.isRemoved && !p.isSkipped
  );
  const playerIds = new Set(activePlayers.map((p) => p.id));
  const activeVotes = round.votes.filter((v) => playerIds.has(v.playerId));
  const isLastPlayer = activePlayers.length - activeVotes.length <= 1;

  return (
    <VotingStepClient
      isDone={playerVotes != null}
      isTwoPlayer={isTwoPlayer}
      availableSubmissions={availableSubmissions}
      submittedVotes={playerVoteSubmissions}
      prompt={round.prompt}
      numberOfDownvotes={numberOfDownvotes}
      numberOfUpvotes={numberOfUpvotes}
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
