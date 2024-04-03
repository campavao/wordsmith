import {
  FriendLeague,
  getUpdatedRoundStatus,
  Player,
  PlayerVote,
  RoundStatus,
  Submission,
} from "@/app/types/FriendLeague";
import addData from "../../firebase/addData";
import getDoc from "../../firebase/getData";
import { NextRequest } from "next/server";
import { sendNotification } from "../../apiUtils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get("leagueId");
  const email = searchParams.get("playerEmail");

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
      const newSubmissions = [...round.submissions, submission];
      round.submissions = newSubmissions;
      const lastPlayerId = getLastPlayer(newSubmissions, league.players);
      if (lastPlayerId) {
        await sendNotification(
          lastPlayerId,
          `You're the last to submit for ${league.config.name}!`
        );
      }
    }

    if (playerVote) {
      if (round.votes.find((sub) => sub.playerId === playerId)) {
        return Response.json({
          message: "already voted",
          error: true,
        });
      }
      const newVotes = [...round.votes, playerVote];
      round.votes = newVotes;
      const lastPlayerId = getLastPlayer(newVotes, league.players);
      if (lastPlayerId) {
        await sendNotification(
          lastPlayerId,
          `You're the last to vote for ${league.config.name}!`
        );
      }
    }

    const prevStatus = round.status;
    round.status = getUpdatedRoundStatus(round, league);

    if (prevStatus !== round.status) {
      sendRoundChangeNotifications(playerId, league, round.status);
    }

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

async function sendRoundChangeNotifications(
  playerId: string,
  league: FriendLeague,
  status: RoundStatus
) {
  const listWithoutCurrPlayer = league.players.filter((p) => p.id !== playerId);
  let message;

  switch (status) {
    case "voting":
      message = `Voting has started for ${league.config.name}.`;
    case "completed":
      message = `The round has completed for ${league.config.name}. Check and see how you did!`;
    case "in progress":
      message = `The game has started for ${league.config.name}!`;
  }

  if (!message) {
    return;
  }

  await Promise.all(
    listWithoutCurrPlayer.map((player) => sendNotification(player.id, message))
  );
}

function getLastPlayer(
  list: Pick<Submission, "playerId">[] | Pick<PlayerVote, "playerId">[],
  players: Player[]
) {
  const listIds = list.map((l) => l.playerId);
  const playersLeft = players.filter((p) => !listIds.includes(p.id));
  if (playersLeft.length === 1) {
    return playersLeft.at(0)?.id;
  }
}
