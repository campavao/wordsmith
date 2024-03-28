import { addSubmission, getPlayer, getServerGame } from "@/app/api/apiUtils";
import { Submission } from "@/app/types/FriendLeague";
import { v4 as uuid } from "uuid";
import { WritingStepClient } from "./WritingStep";
import { redirect } from "next/navigation";

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

  const onSubmit = async (text: string, title: string) => {
    const id = uuid();
    const submission: Submission = {
      playerId: player.id,
      roundId,
      text,
      title,
      id,
    };

    await addSubmission({
      player,
      roundId,
      leagueId,
      submission,
    });

    const isLastPlayer = league.players.length - round.votes.length <= 1;
    if (isLastPlayer) {
      // Hack to reload the page server-side
      redirect(`/league/${leagueId}/${roundId}`);
    }
  };

  const limit = round.wordLimit;
  const prompt = round.prompt;

  const activeSubmission = round.submissions.find(
    (item) => item.playerId === player.id && item.roundId === roundId
  );

  return (
    <WritingStepClient
      limit={limit}
      onSubmit={onSubmit}
      prompt={prompt}
      foundText={activeSubmission?.text}
      foundTitle={activeSubmission?.title}
    />
  );
}
