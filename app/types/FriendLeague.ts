export interface Player {
  id: string;
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
  title: string;

    /** One prompt for entire round for everyone */
  prompt: string;

  /** Current status of the round*/
  status: RoundStatus;

  submissions: Submission[];

  votes: Vote[];
}

export interface LeagueConfiguration {
  name: string;
  wordLimit: number;
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
    wordLimit: 100,
  },
};

export const DEFAULT_ROUND: Round = {
    title: "",
    prompt: "",
    status: "not started",
    submissions: [],
    votes: []
};
