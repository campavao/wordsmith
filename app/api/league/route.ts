import {
  DEFAULT_ROUND,
  FriendLeague,
  Player,
  Round,
} from "@/app/types/FriendLeague";
import { DEFAULT_FRIEND_LEAGUE } from "../../types/FriendLeague";
import { Prompt } from "@/app/friendLeague/CreateGame";

// Get game
export async function GET(request: Request) {
  // Your server-side logic here
  console.log("getting league");
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get("leagueId");
  const email = searchParams.get("playerEmail"); // do I need this for getting games?

  if (leagueId == null) {
    return Response.json({ message: "no league id", error: true });
  }

  const game = games[leagueId];

  if (game == null) {
    return Response.json({ message: "league id isn't valid", error: true });
  }

  return Response.json({
    message: "joining game",
    data: game,
    games,
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

  games = { ...games, [league.leagueId]: league };

  return Response.json({
    message: "creating game",
    data: league,
    games,
  });
}

// Join game
export async function PUT(request: Request) {
  // Your server-side logic here
  const data = await request.json();

  const player: Player = data.player;
  // if specified but no game found, errors
  const leagueId = data.leagueId;

  // find game
  const game = games[leagueId];

  if (game == null) {
    return Response.json({ message: "league id isn't valid", error: true });
  }

  if (game.players.find((p) => p.email === player.email)) {
    return Response.json({ message: "already in game", error: true });
  }

  if (game.config.maxPlayers === game.players.length) {
    return Response.json({ message: "game is full", error: true });
  }

  const updatedGame = {
    ...game,
    players: [...game.players, player],
  };

  games = { ...games, [leagueId]: updatedGame };

  return Response.json({
    message: "joining game",
    data: updatedGame,
    games,
  });
}

let games: Record<string, FriendLeague> = {};

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
  return prompts.map(({ id, text: prompt }) => ({
    ...DEFAULT_ROUND,
    prompt,
    id,
  }));
}
