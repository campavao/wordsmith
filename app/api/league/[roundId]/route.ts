import { FriendLeague } from "@/app/types/FriendLeague";
import { NextRequest } from "next/server";
import { getPlayer, updateRound } from "../../apiUtils";
import getDoc from "../../firebase/getData";

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
    return Response.json({ error: "Something went wrong" });
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
  const { submission, playerVote, leagueId } = await request.json();
  const { roundId } = params;
  const result = await updateRound({
    roundId,
    submission,
    playerVote,
    leagueId,
  });

  return Response.json(result);
}
