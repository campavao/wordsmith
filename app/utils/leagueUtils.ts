import { Session } from "next-auth";
import { LeagueId, Player } from "../types/FriendLeague";
import { Prompt } from "../friendLeague/CreateGame";

export async function getGame({ player, leagueId }: JoinGame) {
  if (!player || !leagueId) {
    throw new Error("No player or leagueId supplied");
  }
  const response = await fetch(
    `/api/league?leagueId=${leagueId}`,
    {
      method: "GET"
    }
  );

  return response.json();
}

interface JoinGame {
  player: Player;
  leagueId: LeagueId;
}

export async function joinGame({ player, leagueId }: JoinGame) {
  if (!player || !leagueId) {
    throw new Error("No player or leagueId supplied");
  }
  const response = await fetch(
    `/api/league`,
    {
      method: "PUT",
      body: JSON.stringify({ player, leagueId }),
    }
  );

  return response.json();
}

interface CreateGame {
  player: Player;
  payload: CreateGamePayload;
}

export interface CreateGamePayload {
  leagueName: string;
  maxPlayers: number;
  picture: File;
  prompts: Prompt[];
}

export async function createGame({ player, payload }: CreateGame) {
  if (!player) {
    throw new Error("No player supplied");
  }

  const response = await fetch("/api/league", {
    method: "POST",
    body: JSON.stringify({ player, payload }),
  });

  return response.json();
}
