import { getPlayer, getServerGame } from "@/app/api/apiUtils";
import { LeagueId } from "@/app/types/FriendLeague";
import Error from "../error";

// submissionId, totalScore
type SubmissionMap = Record<string, number>;

// playerId, SubmissionMap
type ResultMap = Record<string, SubmissionMap>;

export default async function ResultsPage({
  params,
}: {
  params: { leagueId: LeagueId };
}) {
  const player = await getPlayer();
  const game = await getServerGame({
    leagueId: params.leagueId,
    email: player.email,
  });

  if (game.error) {
    return <Error message={game.message} />;
  }

  return <div>Coming soon</div>;
}
