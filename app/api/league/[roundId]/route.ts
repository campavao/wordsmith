import {
  FriendLeague,
  getUpdatedRoundStatus,
  Player,
  PlayerVote,
  RoundStatus,
  ServerPlayerVote,
  ServerSubmission,
  Submission,
} from "@/app/types/FriendLeague";
import addData from "../../firebase/addData";
import getDoc from "../../firebase/getData";
import { NextRequest } from "next/server";
import {
  getLeague,
  getPlayer,
  getRoundFromLeague,
  sendNotification,
} from "../../apiUtils";

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
  const player = await getPlayer();
  const { submission, playerVote, leagueId } = await request.json();
  const { roundId } = params;
  const league = await getLeague(leagueId);
  const round = getRoundFromLeague(league, roundId);

  try {
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

      const newSubmissions = [...round.submissions, serverSubmission];
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
      if (round.votes.find((sub) => sub.playerId === player.id)) {
        return Response.json({
          message: "already voted",
          error: true,
        });
      }
      const voteWithId = { ...playerVote, playerId: player.id };
      const newVotes = [...round.votes, voteWithId];
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
    round.status = getUpdatedRoundStatus(round, league.players.length);

    if (prevStatus !== round.status) {
      sendRoundChangeNotifications(player.id, league, round.status);
    }

    await addData("games", leagueId, league);

    return Response.json({
      message: "submission successful",
    });
  } catch (err) {
    console.log(err);
    throw new Error(err as string);
  }
}

async function sendRoundChangeNotifications(
  playerId: string,
  league: FriendLeague,
  status: RoundStatus
) {
  const listWithoutCurrPlayer = league.players.filter((p) => p.id !== playerId);
  let message: string | undefined;

  switch (status) {
    case "voting":
      message = `Voting has started for ${league.config.name}.`;
      break;
    case "completed":
      message = `The round has completed for ${league.config.name}. Check and see how you did!`;
      break;
    case "in progress":
      message = `The game has started for ${league.config.name}!`;
      break;
  }

  if (!message) {
    return;
  }

  await Promise.all(
    listWithoutCurrPlayer.map((player) => sendNotification(player.id, message!))
  );
}

function getLastPlayer(
  list:
    | Pick<ServerSubmission, "playerId">[]
    | Pick<ServerPlayerVote, "playerId">[],
  players: Player[]
) {
  const listIds = list.map((l) => l.playerId);
  const playersLeft = players.filter((p) => !listIds.includes(p.id));
  if (playersLeft.length === 1) {
    return playersLeft.at(0)?.id;
  }
}
