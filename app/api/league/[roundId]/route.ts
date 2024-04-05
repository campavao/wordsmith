import { FriendLeague, getUpdatedRoundStatus } from "@/app/types/FriendLeague";
import addData from "../../firebase/addData";
import getDoc from "../../firebase/getData";
import { NextRequest } from "next/server";
import { getPlayer } from "../../apiUtils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get("leagueId");
  const { email } = await getPlayer();

  if (leagueId == null) {
    return Response.json({ message: "no league id", error: true });
  }

  let game: FriendLeague | undefined = undefined;

  try {
    const document = await getDoc("games", leagueId);

    game = document.data() as FriendLeague | undefined;

    if (!document.exists()) {
      return Response.json({ message: "game doesn't exist", error: true });
    }
  } catch (e) {
    console.error(e);
  }

  if (game == null) {
    return Response.json({ message: "league id isn't valid", error: true });
  }

  if (!game.players.find((player) => player.email === email)) {
    return Response.json({ message: "not apart of game", error: true });
  }

  return Response.json({
    message: "getting game",
  });
}

// Create game
export async function POST(
  request: NextRequest,
  { params }: { params: { roundId: string } }
) {
  // Your server-side logic here
  const { submission, playerVote, leagueId } = await request.json();
  const { roundId } = params;
  const player = await getPlayer();

  try {
    const serverLeague = await getDoc("games", leagueId);
    if (!serverLeague.exists()) {
      return Response.json({
        message: "game does not exist",
        error: true,
      });
    }
    const league = serverLeague.data() as FriendLeague;
    const round = league.rounds.find((item) => item.id === roundId);
    if (!round) {
      return Response.json({
        message: "round does not exist",
        error: true,
      });
    }
    if (submission) {
      if (round.submissions.find((sub) => sub.playerId === player.id)) {
        return Response.json({
          message: "already submitted",
          error: true,
        });
      }

      const serverSubmission = {
        ...submission,
        playerId: player.id,
      };

      // dual write to new submission tables
      await addData("submissions", submission.id, {
        ...serverSubmission,
        config: {
          leagueId,
          leagueName: league.config.name,
          roundPrompt: round.prompt,
        },
      });

      round.submissions.push(serverSubmission);
    }

    if (playerVote) {
      if (round.votes.find((sub) => sub.playerId === player.id)) {
        return Response.json({
          message: "already voted",
          error: true,
        });
      }
      round.votes.push({ ...playerVote, playerId: player.id });
    }

    round.status = getUpdatedRoundStatus(round, league);

    const updatedLeague = {
      ...league,
      rounds: [...league.rounds],
    };

    await addData("games", leagueId, updatedLeague);

    return Response.json({
      message: "submission successful",
    });
  } catch (err) {
    throw new Error(err as string);
  }
}
