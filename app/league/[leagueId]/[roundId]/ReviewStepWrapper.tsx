import { getPlayer, getServerGame } from "@/app/api/apiUtils";
import { ReviewStepClient } from "./ReviewStep";
import { SharedStep } from "./WritingStepWrapper";
import Error from "../error";
import {
  VotedSubmission,
  Submission,
  Round,
  Player,
} from "@/app/types/FriendLeague";

export type ReviewVotedSubmission = VotedSubmission & {
  playerId: string;
};

export type ReviewSubmissionWithRank = MinimalReviewSubmission & {
  rank: number;
};

export interface ReviewSubmission extends Submission {
  totalScore: number;
  comments: Comment[];
  authorName: string;
}

export interface MinimalReviewSubmission
  extends Pick<Submission, "text" | "title"> {
  totalScore: number;
  comments: Comment[];
  authorName: string;
}

export async function ReviewStep({ roundId, leagueId }: SharedStep) {
  const player = await getPlayer();
  const {
    data: league,
    error,
    message,
  } = await getServerGame({ leagueId, playerId: player.id });

  if (error) {
    return <Error message={message} />;
  }

  if (!league) {
    return <Error message='No league found' />;
  }

  const round = league.rounds.find((r) => r.id === roundId);

  if (!round) {
    return <Error message='No round found' />;
  }

  const reviewSubmissions = getReviewedSubmissions(
    round,
    Object.values(league.players)
  );

  return <ReviewStepClient reviewSubmissions={reviewSubmissions} />;
}

function getReviewedSubmissions(
  round: Round,
  players: Player[]
): ReviewSubmissionWithRank[] {
  const playerRanks = new Map<string, number>();

  let rank = 1;
  const getRank = (
    submission: ReviewSubmission,
    allSubmissions: ReviewSubmission[]
  ) => {
    // If the player has the same score as the previous player, assign them the same rank
    if (submission.totalScore === allSubmissions[rank - 1].totalScore) {
      playerRanks.set(submission.id, rank);
    } else {
      // Otherwise, assign the player the next rank
      rank++;
      playerRanks.set(submission.id, rank);
    }
  };

  const almostSubmissions: ReviewSubmission[] = round.submissions
    .map((submission) => {
      const isRightSubmission = ({ submissionId }: VotedSubmission) =>
        submissionId === submission.id;

      const votes: ReviewVotedSubmission[] = round.votes
        .filter((vote) => vote.submissions.find(isRightSubmission))
        .map((vote) => ({
          ...vote.submissions.find(isRightSubmission)!,
          playerId: vote.playerId,
        }));

      const totalScore = votes.reduce(
        (acc, curr) => acc + (curr?.score ?? 0),
        0
      );

      const authorName = players.find(
        (p) => p.id === submission.playerId
      )?.name;

      const comments = getComments(votes, players);

      return {
        ...submission,
        comments,
        totalScore,
        authorName: authorName ?? "Unknown",
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  for (const submission of almostSubmissions) {
    getRank(submission, almostSubmissions);
  }

  const withRank: ReviewSubmissionWithRank[] = almostSubmissions.map(
    (submission) => ({
      title: submission.title,
      text: submission.text,
      totalScore: submission.totalScore,
      authorName: submission.authorName,
      comments: submission.comments,
      rank: playerRanks.get(submission.id)!,
    })
  );

  return withRank;
}

export type Comment = Omit<
  ReviewVotedSubmission,
  "playerId" | "submissionId"
> & {
  name: string;
};

function getComments(
  votes: ReviewVotedSubmission[],
  players: Player[]
): Comment[] {
  return (
    votes.map((vote) => {
      const player = players.find((p) => p.id === vote.playerId);
      return {
        name: player?.name ?? "Unknown",
        comment: vote.comment,
        score: vote.score,
      };
    }) ?? []
  );
}
