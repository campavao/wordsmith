import { Prompt } from "@/app/friendLeague/CreateGame";
import { DEFAULT_ROUND, FriendLeague, Round } from "@/app/types/FriendLeague";
import { getPlayer, updateRound } from "../apiUtils";
import addData from "../firebase/addData";
import getDoc from "../firebase/getData";
import { addToArray } from "../firebase/updateData";

// Get game
export async function GET(request: Request) {
  // Your server-side logic here
  console.log("getting league");
  const { searchParams } = new URL(request.url);
  const player = await getPlayer();
  const leagueId = searchParams.get("leagueId");

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

  if (!game.players.find((currPlayer) => currPlayer.email === player.email)) {
    return Response.json({ message: "not apart of game", error: true });
  }

  return Response.json({
    message: "getting game",
    data: game,
  });
}

// Create game
export async function POST(request: Request) {
  // Your server-side logic here
  const { payload } = await request.json();
  const player = await getPlayer();

  const document = await getDoc("games", payload.leagueId);

  if (document.exists()) {
    return Response.json({ message: "game already exists", error: true });
  }

  // create game
  const league: FriendLeague = {
    leagueId: payload.leagueId,
    config: {
      numberOfDownvotes: payload.numberOfDownvotes,
      numberOfUpvotes: payload.numberOfUpvotes,
      name: payload.leagueName,
      maxPlayers: payload.maxPlayers,
      creator: player,
    },
    players: [player],
    rounds: getRounds(payload.prompts),
  };

  const isValid = isLeagueValid(league);

  if (!isValid) {
    return Response.json({ message: "game setup is invalid", error: true });
  }

  try {
    await addData("games", league.leagueId, league);

    // add game to player
    await addToArray("users", player.id, "history", {
      name: league.config.name,
      leagueId: league.leagueId,
    });

    return Response.json({
      message: "created game",
    });
  } catch (err) {
    throw new Error(err as string);
  }
}

// Join game
export async function PUT(request: Request) {
  // Your server-side logic here
  const data = await request.json();
  const player = await getPlayer();

  // if specified but no game found, errors
  const leagueId = data.leagueId;

  // find game
  try {
    const document = await getDoc("games", leagueId);
    const game = document.data() as FriendLeague | undefined;

    if (game == null) {
      return Response.json({ message: "league id isn't valid", error: true });
    }

    if (game.players.find((p) => p.email === player.email)) {
      // add game to player
      await addToArray("users", player.id, "history", {
        name: game.config.name,
        leagueId: leagueId,
      });
      return Response.json({ message: "already in game", data: game });
    }

    if (game.config.maxPlayers === game.players.length) {
      return Response.json({ message: "game is full", error: true });
    }

    if (
      game.rounds.at(0)?.status === "voting" ||
      game.rounds.at(0)?.status === "completed"
    ) {
      return Response.json({
        message: "can't join a game that's in progress",
        error: true,
      });
    }

    // add to game
    await addToArray("games", leagueId, "players", player);

    // add game to player
    await addToArray("users", player.id, "history", {
      name: game.config.name,
      leagueId: leagueId,
    });

    return Response.json({
      message: "joining game",
    });
  } catch (e) {
    console.error(e);
    return Response.json({ message: "server error", error: true });
  }
}

function getRounds(prompts: Prompt[]): Round[] {
  return prompts.map(({ id, text: prompt, wordLimit }) => ({
    ...DEFAULT_ROUND,
    prompt,
    id,
    wordLimit,
  }));
}

function isLeagueValid(league: FriendLeague) {
  return (
    league.leagueId != null &&
    league.config.name != null &&
    league.config.maxPlayers < 9 &&
    league.config.numberOfDownvotes < 9 &&
    league.config.numberOfUpvotes < 9 &&
    league.rounds.every(
      (round) => round.wordLimit < 1001 && round.wordLimit > 0
    )
  );
}

export async function PATCH(request: Request) {
  // Your server-side logic here
  const data = await request.json();
  const player = await getPlayer();

  // if specified but no game found, errors
  const { leagueId, playerEmail, type } = data;

  // find game
  try {
    const document = await getDoc("games", leagueId);
    const game = document.data() as FriendLeague | undefined;

    // Game isn't found
    if (game == null) {
      return Response.json({ message: "league id isn't valid", error: true });
    }

    const playerToUpdate = game.players.find((p) => p.email === playerEmail);

    // Player isn't found
    if (playerToUpdate == null) {
      return Response.json({ message: "player not found", data: game });
    }

    // Prevent non-creators from updating other players in a game
    if (player.email !== game.config.creator?.email) {
      return Response.json({ message: "restricted", data: game });
    }

    const updatedPlayers = game.players.filter((p) => p.email !== playerEmail);

    const league: FriendLeague = {
      ...game,
      players: [
        ...updatedPlayers,
        {
          ...playerToUpdate,
          isSkipped: type === "skip",
          isRemoved: type === "remove",
        },
      ],
    };

    await addData("games", leagueId, league);

    const roundId = league.rounds.find(
      (round) => round.status !== "completed"
    )?.id;

    // Trigger update on any active rounds
    if (roundId) {
      await updateRound({ roundId, leagueId });
    }

    return Response.json({
      message: "player updated",
    });
  } catch (e) {
    console.error(e);
    return Response.json({ message: "server error", error: true });
  }
}
