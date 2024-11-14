import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import webpush from "web-push";
import {
  FriendLeague,
  getUpdatedRoundStatus,
  isPlayer,
  LeagueId,
  Player,
  PlayerVote,
  RoundStatus,
  ServerPlayerVote,
  ServerSubmission,
  Submission,
} from "../types/FriendLeague";
import { authOptions } from "./auth";
import addData from "./firebase/addData";
import { getDocuments } from "./firebase/get";
import getDocument from "./firebase/getData";

webpush.setVapidDetails(
  "mailto:cam9548@gmail.com",
  process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? "",
  process.env.WEB_PUSH_PRIVATE_KEY ?? ""
);

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

export async function getPlayerFromId(
  playerId: string
): Promise<Player | undefined> {
  const user = await getDocument("users", playerId);

  if (!user.exists()) {
    return undefined;
  }

  return user.data() as Player;
}

interface AddSubmission {
  player: Player;
  submission?: Submission;
  playerVote?: PlayerVote;
  leagueId: LeagueId;
  roundId: string;
}

export async function updateRoundForUser({
  submission,
  playerVote,
  leagueId,
  roundId,
}: AddSubmission): Promise<ServerResponse> {
  try {
    const player = await getPlayer();
    const league = await getLeague(leagueId);
    const round = getRoundFromLeague(league, roundId);

    if (submission) {
      if (round.submissions.find((sub) => sub.playerId === player.id)) {
        return {
          message: "already submitted",
          error: true,
        };
      }
      round.submissions.push({ ...submission, playerId: player.id });
    }

    if (playerVote) {
      if (round.votes.find((sub) => sub.playerId === player.id)) {
        return {
          message: "already votes",
          error: true,
        };
      }
      round.votes.push({ ...playerVote, playerId: player.id });
    }

    round.status = getUpdatedRoundStatus(round, league.players);

    const updatedLeague = {
      ...league,
      rounds: [...league.rounds],
    };

    await addData("games", leagueId, updatedLeague);

    return {
      message: "creating with firebase game",
    };
  } catch (err) {
    throw new Error(err as string);
  }
}

export async function getSubmissions(playerId: string) {
  const submissions = await getDocuments<ServerSubmission>(
    "submissions",
    "playerId",
    "==",
    playerId
  );

  return submissions;
}

type PlayerSubscription = {
  playerId: string;
  subscription: webpush.PushSubscription;
};

export async function sendNotification(playerId: string, message: string) {
  const subscriptions = await getDocuments<PlayerSubscription>(
    "subscriptions",
    "playerId",
    "==",
    playerId
  );

  try {
    await Promise.all(
      subscriptions.map(({ subscription }) =>
        webpush.sendNotification(subscription, message)
      )
    );
  } catch (err: any) {
    console.error(err.body);
  }
}

export async function getLeague(leagueId: LeagueId) {
  const serverLeague = await getDocument("games", leagueId);
  if (!serverLeague.exists()) {
    redirect("/");
  }
  return serverLeague.data() as FriendLeague;
}

export async function getPlayers(leagueId: LeagueId) {
  const league = await getLeague(leagueId);

  return {
    players: league.players,
    leagueName: league.config.name,
  };
}

export async function getRound(leagueId: LeagueId, roundId: string) {
  const league = await getLeague(leagueId);
  return getRoundFromLeague(league, roundId);
}

export function getRoundFromLeague(league: FriendLeague, roundId: string) {
  const round = league.rounds.find((item) => item.id === roundId);

  if (!round) {
    redirect(`/league/${league.leagueId}`);
  }

  return round;
}

interface UpdateRound {
  roundId: string;
  submission?: Submission;
  playerVote?: PlayerVote;
  leagueId: string;
}

export async function updateRound({
  roundId,
  submission,
  playerVote,
  leagueId,
}: UpdateRound) {
  const player = await getPlayer();
  const league = await getLeague(leagueId);
  const round = getRoundFromLeague(league, roundId);

  try {
    if (submission) {
      if (round.submissions.find((sub) => sub.playerId === player.id)) {
        return {
          message: "already submitted",
          error: true,
        };
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
        return {
          message: "already voted",
          error: true,
        };
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
    round.status = getUpdatedRoundStatus(round, league.players);

    if (round.status === "completed") {
      const isSomeoneSkipped = league.players.find((p) => p.isSkipped);

      console.log("maybe skipping", isSomeoneSkipped);
      // Reset players if at least one is skipped
      if (isSomeoneSkipped) {
        league.players = league.players.map((p) => ({
          ...p,
          isSkipped: false,
        }));
      }
    }

    if (prevStatus !== round.status) {
      sendRoundChangeNotifications(player.id, league, round.status);
    }

    await addData("games", leagueId, league);

    return {
      message: "submission successful",
    };
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong" };
  }
}

export async function sendRoundChangeNotifications(
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

export function getLastPlayer(
  list:
    | Pick<ServerSubmission, "playerId">[]
    | Pick<ServerPlayerVote, "playerId">[],
  players: Player[]
) {
  const listIds = list.map((l) => l.playerId);
  const playersLeft = players.filter(
    (p) => !listIds.includes(p.id) && !p.isRemoved && !p.isSkipped
  );
  if (playersLeft.length === 1) {
    return playersLeft.at(0)?.id;
  }
}
