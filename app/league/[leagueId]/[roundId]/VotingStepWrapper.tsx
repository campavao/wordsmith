"use server";
import {
  updateRoundForUser,
  getPlayer,
  getServerGame,
} from "@/app/api/apiUtils";
import { SharedStep } from "./WritingStepWrapper";
import { VotingStepClient } from "./VotingStep";
import Error from "../error";
import { PlayerVote, VotedSubmission } from "@/app/types/FriendLeague";
import { redirect } from "next/navigation";

export async function VotingStep({ roundId, leagueId }: SharedStep) {
  const player = await getPlayer();
  const {
    data: league,
    error,
    message,
  } = await getServerGame({ leagueId, email: player.email });

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

  const onSubmit = async (votes: VotedSubmission[]) => {
    const playerVote: PlayerVote = {
      playerId: player.id,
      submissions: votes,
    };

    const response = await updateRoundForUser({
      player,
      playerVote,
      leagueId,
      roundId,
    });

    if (response.error) {
      console.error(response.message);
      return;
    }

    redirect(`/league/${leagueId}/${roundId}`);
  };

  const availableSubmissions = round.submissions.filter(
    (s) => s.playerId !== player.id
  );

  const playerVotes = round.votes.find((v) => v.playerId === player.id);

  const { numberOfDownvotes, numberOfUpvotes } = league.config;

  const isTwoPlayer = round.submissions.length <= 2;

  return (
    <VotingStepClient
      isDone={playerVotes != null}
      isTwoPlayer={isTwoPlayer}
      onSubmit={onSubmit}
      availableSubmissions={availableSubmissions}
      submittedVotes={playerVotes?.submissions}
      prompt={round.prompt}
      numberOfDownvotes={numberOfDownvotes}
      numberOfUpvotes={numberOfUpvotes}
    />
  );
}
