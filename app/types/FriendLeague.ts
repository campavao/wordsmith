import { Session } from "next-auth";

export interface Player {
  id?: string; // TODO make this defined
  name: string;
  email: string;
}

export type RoundStatus = "not started" | "create" | "vote" | "review";

export interface Submission {
  playerId: string;
  submissionId: string;
  text: string;
}

export interface Vote {
  playerId: string;
  submissionId: string;
  score: number;
}

export interface Round {
  id: string;

  /** One prompt for entire round for everyone */
  prompt: string;

  /** Current status of the round*/
  status: RoundStatus;

  submissions: Submission[];

  votes: Vote[];

  wordLimit: number;
}

export interface LeagueConfiguration {
  name: string;

  maxPlayers: number;

  creator?: Player;
}

export interface FriendLeague {
  leagueId: string;
  players: Player[];
  rounds: Round[];
  config: LeagueConfiguration;
}

export const DEFAULT_FRIEND_LEAGUE: FriendLeague = {
  leagueId: "1",
  players: [],
  rounds: [],
  config: {
    name: "Friend League",
    maxPlayers: 8,
  },
};

export const DEFAULT_ROUND: Round = {
  id: "",
  prompt: "",
  status: "not started",
  submissions: [],
  votes: [],
  wordLimit: 100,
};

export type LeagueId = string;

export function isPlayer(user: Session["user"]): user is Player {
  return user?.email != null && user?.name != null;
}
