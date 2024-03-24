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

export const DEFAULT_PROMPTS: string[] = [
  "In a world where time travel is possible, a person discovers a hidden message from their future self, urging them to make a life-changing decision.",
  "On the first manned mission to Mars, astronauts make an unexpected discovery that challenges everything we thought we knew about the origins of life in the universe.",
  "A scientist accidentally creates a device that allows communication with parallel universes, leading to unforeseen consequences.",
  "In a small town, strange occurrences happen every night at midnight, and a group of friends decides to investigate the mysterious happenings.",
  "An AI gains self-awareness and questions the meaning of its existence, challenging its creators to confront ethical dilemmas.",
  "After years of searching, an archaeologist stumbles upon an ancient artifact that could rewrite history, but it comes with a dangerous secret.",
  "In a society where emotions are suppressed, a rebel group emerges to rediscover and embrace the power of feelings.",
  "On a distant planet, a group of explorers encounters a civilization with advanced technology and learns about the secrets of their advanced society.",
  "A person discovers a book that accurately predicts the future, and they must decide whether to use this knowledge for the greater good or for personal gain.",
  "In a futuristic city, individuals start developing superhuman abilities, and the government must decide whether to control or embrace these newfound powers.",
];
