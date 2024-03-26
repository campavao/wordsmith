import {
  LeagueId,
  Player,
  PlayerVote,
  Submission,
  VotedSubmission,
} from "../types/FriendLeague";
import { Prompt } from "../friendLeague/CreateGame";
import { Session } from "next-auth";

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
  player: Session["user"] | Player; // sometimes the session doesn't have an id
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
  id: string;
}

export async function addSubmission({
  player,
  text,
  title,
  roundId,
  leagueId,
  id,
}: AddSubmission) {
  const submission: Submission = {
    playerId: player.id,
    roundId,
    text,
    title,
    id,
  };

  const response = await fetch(`/api/league/${roundId}`, {
    method: "POST",
    body: JSON.stringify({ player, submission, leagueId }),
  });

  return response.json();
}

interface AddVotes {
  roundId: string;
  player: Player;
  leagueId: string;
  votedSubmissions: VotedSubmission[];
}

export async function addVotes({
  player,
  roundId,
  leagueId,
  votedSubmissions,
}: AddVotes) {
  const playerVote: PlayerVote = {
    playerId: player.id,
    submissions: votedSubmissions,
  };

  const response = await fetch(`/api/league/${roundId}`, {
    method: "POST",
    body: JSON.stringify({ player, playerVote, leagueId }),
  });

  return response.json();
}

export async function getPlayerData(playerId: string) {
  const response = await fetch(`/api/player/${playerId}`)

  return response.json()
}
