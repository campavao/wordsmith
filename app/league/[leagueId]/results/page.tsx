import { getPlayer, getServerGame } from "@/app/api/apiUtils";
import { LeagueId } from "@/app/types/FriendLeague";
import Error from "../error";
import Link from "next/link";

export default async function ResultsPage({
  params,
}: {
  params: { leagueId: LeagueId };
}) {
  const player = await getPlayer();
  const result = await getServerGame({
    leagueId: params.leagueId,
    email: player.email,
  });

  if (result.error) {
    return <Error message={result.message} />;
  }

  const game = result.data;

  if (!game) {
    return <Error message='Game not found' />;
  }

  // playerId, score
  let playerMap = new Map<string, number>();
  // playerId, number
  let playerRank = new Map<string, number>();

  let rank = 1;

  for (const player of game.players) {
    const playerId = player.id;

    const totalScore = game.rounds.reduce((acc, round) => {
      const submissionId = round.submissions.find(
        (s) => s.playerId === playerId
      )?.id;

      if (!submissionId) {
        return acc;
      }
      const votesFromSubmission = round.votes.flatMap((v) =>
        v.submissions.filter((s) => s.submissionId === submissionId)
      );

      const totalScoreFromSubmission = votesFromSubmission.reduce(
        (acc, curr) => acc + curr.score,
        0
      );

      return acc + totalScoreFromSubmission;
    }, 0);

    playerMap.set(playerId, totalScore);
  }

  // sort highest to lowest, then rank
  game.players
    .sort((a, b) => playerMap.get(b.id)! - playerMap.get(a.id)!)
    .forEach((player) => {
      // If the player has the same score as the previous player, assign them the same rank
      if (
        playerMap.get(player.id) === playerMap.get(game.players[rank - 1].id)
      ) {
        playerRank.set(player.id, rank);
      } else {
        // Otherwise, assign the player the next rank
        rank++;
        playerRank.set(player.id, rank);
      }
    });

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg underline'>{game.config.name}</h1>
      <table className='w-full max-w-lg text-center'>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {game.players.map((player) => (
            <tr key={player.id}>
              <td>#{playerRank.get(player.id)}</td>
              <td title={player.email}>{player.name}</td>
              <td>{playerMap.get(player.id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href={`/league/${params.leagueId}`}>Back to league</Link>
    </div>
  );
}
