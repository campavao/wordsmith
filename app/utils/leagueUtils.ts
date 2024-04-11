"client only";
import {
  LeagueId,
  PlayerVote,
  Submission,
  VotedSubmission,
} from "../types/FriendLeague";
import { Prompt } from "../friendLeague/CreateGame";

export async function getGame({ leagueId }: JoinGame) {
  if (!leagueId) {
    throw new Error("No player or leagueId supplied");
  }
  const response = await fetch(`/api/league?leagueId=${leagueId}`, {
    method: "GET",
  });

  return response.json();
}

interface JoinGame {
  leagueId: LeagueId;
}

export async function joinGame({ leagueId }: JoinGame) {
  if (!leagueId) {
    throw new Error("No player or leagueId supplied");
  }
  const response = await fetch(`/api/league`, {
    method: "PUT",
    body: JSON.stringify({ leagueId }),
  });

  return response.json();
}

interface CreateGame {
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

export async function createGame({ payload }: CreateGame) {
  const response = await fetch("/api/league", {
    method: "POST",
    body: JSON.stringify({ payload }),
  });

  return response.json();
}

interface AddSubmission {
  title: string;
  roundId: string;
  text: string;
  leagueId: string;
  id: string;
}

export async function addSubmission({
  text,
  title,
  roundId,
  leagueId,
  id,
}: AddSubmission) {
  const submission: Submission = {
    roundId,
    text,
    title,
    id,
  };

  const response = await fetch(`/api/league/${roundId}`, {
    method: "POST",
    body: JSON.stringify({ submission, leagueId }),
  });

  return response.json();
}

interface AddVotes {
  roundId: string;
  leagueId: string;
  votedSubmissions: VotedSubmission[];
}

export async function addVotes({
  roundId,
  leagueId,
  votedSubmissions,
}: AddVotes) {
  const playerVote: PlayerVote = {
    submissions: votedSubmissions,
  };

  const response = await fetch(`/api/league/${roundId}`, {
    method: "POST",
    body: JSON.stringify({ playerVote, leagueId }),
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
