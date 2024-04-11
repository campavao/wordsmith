export interface Player {
  id: string;
  name: string;
  email: string;
}

export type RoundStatus =
  | "not started"
  | "in progress"
  | "voting"
  | "completed";

export interface ServerSubmission {
  id: string;
  playerId: string;
  roundId: string;
  text: string;
  title: string;
  config?: {
    leagueId: LeagueId;
    leagueName: string;
    roundPrompt: string;
  };
}

export type Submission = Omit<ServerSubmission, "playerId">;

export interface VotedSubmission {
  submissionId: string;
  score: number;
  comment: string;
}

export interface ServerPlayerVote {
  playerId: string;
  submissions: VotedSubmission[];
}

export type PlayerVote = Omit<ServerPlayerVote, "playerId">;

export interface Round {
  id: string;

  /** One prompt for entire round for everyone */
  prompt: string;

  /** Current status of the round*/
  status: RoundStatus;

  submissions: ServerSubmission[];

  votes: ServerPlayerVote[];

  wordLimit: number;
}

export interface LeagueConfiguration {
  name: string;

  maxPlayers: number;

  numberOfUpvotes: number;

  numberOfDownvotes: number;

  creator?: Player;
}

export interface FriendLeague {
  leagueId: string;
  players: Player[];
  rounds: Round[];
  config: LeagueConfiguration;
}

export const DEFAULT_ROUND: Round = {
  id: "",
  prompt: "",
  status: "not started",
  submissions: [],
  votes: [],
  wordLimit: 100,
};

export type LeagueId = string;

export function isPlayer(user: any): user is Player {
  return user?.email != null && user?.name != null && user.id != null;
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
  "The old book sat on the dusty shelf, its pages whispering secrets of centuries past. Little did she know, opening it would change her life forever.",
  "The clock struck midnight as the streets fell silent, except for the faint sound of footsteps echoing in the darkness. Someone was following her, but when she turned around, there was no one there.",
  "In the abandoned mansion, strange lights flickered in the windows, illuminating the overgrown garden with an eerie glow. They had always heard rumors about the place being haunted, but they never believed it until now.",
  "As the storm raged outside, she sat by the fireplace, sipping hot cocoa and reading her favorite book. But when she heard a knock on the door, she realized she was all alone in the house.",
  "Deep in the forest, where the trees whispered ancient secrets, a hidden path beckoned to those who dared to explore. But they soon discovered that some secrets were better left undisturbed.",
  "The astronaut gazed out of the spaceship's window, mesmerized by the infinite expanse of stars stretching out before him. But when he looked closer, he saw something out there, something he couldn't explain.",
  "In the quiet town, where nothing ever seemed to happen, a mysterious stranger arrived, stirring up rumors and suspicion among the locals. Little did they know, the stranger was hiding a dark secret that would soon be revealed.",
  "As she walked through the carnival, the laughter and music filled her with a sense of nostalgia for childhood days gone by. But when she stumbled upon a hidden tent at the edge of the fairgrounds, she realized this carnival held secrets far darker than she could have imagined.",
  "The painting hung on the wall, its eyes seeming to follow her every move with an unsettling intensity. She had always been drawn to it, but now she couldn't shake the feeling that it was watching her, waiting for something.",
  "The door creaked open, revealing a room bathed in darkness except for a single flickering candle. She stepped inside, feeling a chill run down her spine as she realized she was not alone in the room.",
];

export function getUpdatedRoundStatus(
  round: Round,
  maxPlayers: number
): RoundStatus {
  switch (round.status) {
    case "not started":
      return "in progress";
    case "in progress":
      // check submissions length to see if it'd be last
      if (round.submissions.length === maxPlayers) {
        return "voting";
      }
      return "in progress";
    case "voting":
      // check votes length to see if it'd be last
      if (round.votes.length === maxPlayers) {
        return "completed";
      }
      return "voting";
    default:
      return "completed";
  }
}

export const getNextRound = (league: FriendLeague, currentRoundId: string): string | undefined => {
  if (league?.rounds) {
    const currentIndex = league.rounds.findIndex(
      ({ id }) => id === currentRoundId
    );

    if (currentIndex !== -1 && league.rounds.length > currentIndex + 1) {
      return league.rounds[currentIndex + 1].id;
    }
  }
}
