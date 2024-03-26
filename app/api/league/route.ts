import {
  DEFAULT_ROUND,
  FriendLeague,
  Player,
  Round,
} from "@/app/types/FriendLeague";
import { DEFAULT_FRIEND_LEAGUE } from "../../types/FriendLeague";
import { Prompt } from "@/app/friendLeague/CreateGame";
import addData from "../firebase/addData";
import getDoc from "../firebase/getData";
import { addToArray } from "../firebase/updateData";

// Get game
export async function GET(request: Request) {
  // Your server-side logic here
  console.log("getting league");
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
export async function POST(request: Request) {
  // Your server-side logic here
  const { player, payload } = await request.json();

  // create game
  const league: FriendLeague = {
    ...DEFAULT_FRIEND_LEAGUE,
    leagueId: createLeagueId(5),
    config: {
      ...DEFAULT_FRIEND_LEAGUE.config,
      name: payload.leagueName,
      maxPlayers: payload.maxPlayers,
      creator: player,
    },
    players: [player],
    rounds: getRounds(payload.prompts),
  };

  try {
    await addData("games", league.leagueId, league);

    // add game to player
    await addToArray("users", player.id, "history", {
      name: league.config.name,
      leagueId: league.leagueId,
    });

    return Response.json({
      message: "creating with firebase game",
      data: league,
    });
  } catch (err) {
    throw new Error(err as string);
  }
}

// Join game
export async function PUT(request: Request) {
  // Your server-side logic here
  const data = await request.json();

  const player: Player = data.player;
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

    if (game.rounds.find((round) => round.status != "not started")) {
      return Response.json({
        message: "can't join a game that's in progress",
        error: true,
      });
    }

    const players = [...game.players, player];

    const updatedGame = {
      ...game,
      players,
    };

    // add to game
    await addToArray("games", leagueId, "players", player);

    // add game to player
    await addToArray("users", player.id, "history", {
      name: game.config.name,
      leagueId: leagueId,
    });

    return Response.json({
      message: "joining game",
      data: updatedGame,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ message: "server error", error: true });
  }
}


function createLeagueId(length: number) {
  let randomCode = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomCode += characters[randomIndex];
  }

  return randomCode;
}

function getRounds(prompts: Prompt[]): Round[] {
  return prompts.map(({ id, text: prompt, wordLimit }) => ({
    ...DEFAULT_ROUND,
    prompt,
    id,
    wordLimit,
  }));
}
