"client only";
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
  leagueId: LeagueId;
  leagueName: string;
  maxPlayers: number;
  numberOfUpvotes: number;
  numberOfDownvotes: number;
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
  playerId: string;
  text: string;
  leagueId: string;
  id: string;
}

export async function addSubmission({
  playerId,
  text,
  title,
  roundId,
  leagueId,
  id,
}: AddSubmission) {
  const submission: Submission = {
    playerId,
    roundId,
    text,
    title,
    id,
  };

  const response = await fetch(`/api/league/${roundId}`, {
    method: "POST",
    body: JSON.stringify({ playerId, submission, leagueId }),
  });

  return response.json();
}

interface AddVotes {
  roundId: string;
  playerId: string;
  leagueId: string;
  votedSubmissions: VotedSubmission[];
}

export async function addVotes({
  playerId,
  roundId,
  leagueId,
  votedSubmissions,
}: AddVotes) {
  const playerVote: PlayerVote = {
    playerId,
    submissions: votedSubmissions,
  };

  const response = await fetch(`/api/league/${roundId}`, {
    method: "POST",
    body: JSON.stringify({ playerId, playerVote, leagueId }),
  });

  return response.json();
}

export async function getPlayerData(playerId: string) {
  const response = await fetch(`/api/player/${playerId}`);

  return response.json();
}

export function createLeagueId(length: number) {
  let randomCode = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomCode += characters[randomIndex];
  }

  return randomCode;
}
