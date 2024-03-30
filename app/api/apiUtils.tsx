import getDocument from "./firebase/getData";
import {
  FriendLeague,
  getUpdatedRoundStatus,
  isPlayer,
  LeagueId,
  Player,
  PlayerVote,
  Submission,
} from "../types/FriendLeague";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";
import addData from "./firebase/addData";
import { addToArray } from "./firebase/updateData";

type ServerResponse = { data?: FriendLeague; error?: true; message: string };

export async function getServerGame({
  leagueId,
  email,
}: {
  leagueId: LeagueId;
  email: string;
}): Promise<ServerResponse> {
  if (leagueId == null) {
    return { message: "no league id", error: true };
  }

  let game: FriendLeague | undefined = undefined;

  try {
    const document = await getDocument("games", leagueId);

    game = document.data() as FriendLeague | undefined;

    if (!document.exists()) {
      return { message: "game doesn't exist", error: true };
    }
  } catch (e) {
    console.error(e);
  }

  if (game == null) {
    return { message: "league id isn't valid", error: true };
  }

  if (!game.players.find((player) => player.email === email)) {
    return { message: "not apart of game", error: true };
  }

  return {
    message: "getting game",
    data: game,
  };
}

export async function getPlayer(): Promise<Player> {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!isPlayer(user)) {
    redirect("/");
  }

  return user;
}

interface AddSubmission {
  player: Player;
  submission?: Submission;
  playerVote?: PlayerVote;
  leagueId: LeagueId;
  roundId: string;
}

export async function updateRoundForUser({
  player,
  submission,
  playerVote,
  leagueId,
  roundId,
}: AddSubmission): Promise<ServerResponse> {
  try {
    const serverLeague = await getDocument("games", leagueId);
    if (!serverLeague.exists()) {
      return {
        message: "game does not exist",
        error: true,
      };
    }
    const league = serverLeague.data() as FriendLeague;
    const round = league.rounds.find((item) => item.id === roundId);

    if (!round) {
      return {
        message: "round does not exist",
        error: true,
      };
    }

    if (submission) {
      if (round.submissions.find((sub) => sub.playerId === player.id)) {
        return {
          message: "already submitted",
          error: true,
        };
      }
      round.submissions.push(submission);
    }

    if (playerVote) {
      if (round.votes.find((sub) => sub.playerId === player.id)) {
        return {
          message: "already votes",
          error: true,
        };
      }
      round.votes.push(playerVote);
    }

    round.status = getUpdatedRoundStatus(round, league);

    const updatedLeague = {
      ...league,
      rounds: [...league.rounds],
    };

    await addData("games", leagueId, updatedLeague);

    return {
      message: "creating with firebase game",
      data: league,
    };
  } catch (err) {
    throw new Error(err as string);
  }
}
