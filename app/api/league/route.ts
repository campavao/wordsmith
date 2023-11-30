import { FriendLeague, Player } from "@/app/types/FriendLeague";
import { DEFAULT_FRIEND_LEAGUE } from '../../types/FriendLeague';

export async function GET(request: Request) {
  // Your server-side logic here
  console.log("getting league");
  const {searchParams} = new URL(request.url);
  const leagueId = searchParams.get("leagueId");


  if (leagueId == null) {
    return Response.json({ message: "no league id", error: true });
  }

  return Response.json({ message: "getting game", data: games[leagueId] });
}

export async function POST(request: Request) {
  // Your server-side logic here
  const data = await request.json();
  console.log("htting server", data);

  const player: Player = data.player;

  // if specified but no game found, errors
  const leagueId = data.leagueId;

  // find or create game
  let league = games[leagueId] ?? {
    ...DEFAULT_FRIEND_LEAGUE,
    leagueId: createLeagueId(5),
    config: {
      ...DEFAULT_FRIEND_LEAGUE.config,
      creator: player.email
    }
  };

  // if we're looking for a leagueId but we couldn't find the league, exit
  if (leagueId && leagueId !== league.leagueId) {
    return Response.json({ message: "not found", error: true, leagueId });
  }

  // if player joining
  if (!league.players.find((p) => p.email === player.email)) {
    league = {
      ...league,
      players: [...league.players, player],
    };
  }

  games = { ...games, [league.leagueId]: league };

  return Response.json({
    message: leagueId === league.leagueId ? "joining game" : "creating game",
    data: league,
    games,
  });
}

let games: Record<string, FriendLeague> = {};

function createLeagueId(length: number) {
  let randomCode = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomCode += characters[randomIndex];
  }

  return randomCode;
}
