import { LeagueId, Player, Submission } from "../types/FriendLeague";
import { Prompt } from "../friendLeague/CreateGame";

export async function getGame({ player, leagueId }: JoinGame) {
  if (!player || !leagueId) {
    throw new Error("No player or leagueId supplied");
  }
  const response = await fetch(
    `/api/league?leagueId=${leagueId}&playerEmail=${player.email}`,
    {
      method: "GET",
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
  const response = await fetch(`/api/league`, {
    method: "PUT",
    body: JSON.stringify({ player, leagueId }),
  });

  return response.json();
}

interface CreateGame {
  player: Player;
  payload: CreateGamePayload;
}

export interface CreateGamePayload {
  leagueName: string;
  maxPlayers: number;
  picture?: File;
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

interface AddSubmission {
  title: string;
  roundId: string;
  player: Player;
  text: string;
  leagueId: string;
}

export async function addSubmission({
  player,
  text,
  title,
  roundId,
  leagueId,
}: AddSubmission) {
  const submission: Submission = {
    playerId: player.id,
    roundId,
    text,
    title,
  };
  const response = await fetch(`/api/league/${roundId}`, {
    method: "POST",
    body: JSON.stringify({ player, submission, leagueId }),
  });

  return response.json();
}
