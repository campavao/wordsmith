import { FriendLeague, getUpdatedRoundStatus } from "@/app/types/FriendLeague";
import addData from "../../firebase/addData";
import getDoc from "../../firebase/getData";
import { NextRequest } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get("leagueId");
  const playerId = searchParams.get("playerId");

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

  if (playerId == null) {
    return Response.json({ message: "player id isn't found", error: true });
  }

  if (!game.players[playerId]) {
    return Response.json({ message: "not apart of game", error: true });
  }

  return Response.json({
    message: "getting game",
    data: game,
  });
}

// Create game
export async function POST(
  request: NextRequest,
  { params }: { params: { roundId: string } }
) {
  // Your server-side logic here
  const { playerId, submission, playerVote, leagueId } = await request.json();
  const { roundId } = params;

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
      if (round.submissions.find((sub) => sub.playerId === playerId)) {
        return Response.json({
          message: "already submitted",
          error: true,
        });
      }
      round.submissions.push(submission);
    }

    if (playerVote) {
      if (round.votes.find((sub) => sub.playerId === playerId)) {
        return Response.json({
          message: "already voted",
          error: true,
        });
      }
      round.votes.push(playerVote);
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
