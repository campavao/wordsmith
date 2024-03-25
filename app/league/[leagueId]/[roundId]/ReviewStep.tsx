import { useEffect, useMemo, useState } from "react";
import { SharedStep } from "./WritingStep";
import { Preview } from "./components/Preview";
import {
  FriendLeague,
  Round,
  Submission,
  VotedSubmission,
} from "@/app/types/FriendLeague";

type ReviewVotedSubmission = VotedSubmission & { playerId: string };

interface ReviewSubmission extends Submission {
  totalScore: number;
  votes: ReviewVotedSubmission[];
}

export function ReviewStep({ round, league }: SharedStep) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewSubmissions, setReviewSubmissions] = useState<
    ReviewSubmission[]
  >([]);

  useEffect(() => {
    if (reviewSubmissions.length === 0) {
      const reviewedSubmissions = getReviewedSubmissions(round);
      const sortedSubmissions = reviewedSubmissions.sort(
        (a, b) => b.totalScore - a.totalScore
      );
      setReviewSubmissions(sortedSubmissions);
    }
  }, [reviewSubmissions.length, round]);

  const comments = useMemo(
    () => getComments(reviewSubmissions[currentIndex], league),
    [currentIndex, league, reviewSubmissions]
  );

  return (
    <div>
      <strong className='flex justify-between'>
        <span>#{currentIndex + 1}</span>
        <span>Total: {reviewSubmissions[currentIndex]?.totalScore}</span>
      </strong>
      <Preview
        words={reviewSubmissions[currentIndex]?.text}
        title={reviewSubmissions[currentIndex]?.title}
        isEditable={false}
      />
      {comments.map((comment, key) => (
        <Comment comment={comment} key={key} />
      ))}
      <div className='flex justify-between w-full mb-10'>
        <button
          className='disabled:text-transparent'
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          Previous
        </button>
        <button
          className='disabled:text-transparent'
          disabled={currentIndex === reviewSubmissions?.length - 1}
          onClick={() => setCurrentIndex(currentIndex + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function getReviewedSubmissions(round: Round): ReviewSubmission[] {
  return round.submissions.map((submission) => {
    const isRightSubmission = ({ submissionId }: VotedSubmission) =>
      submissionId === submission.id;

    const votes = round.votes
      .filter((vote) => vote.submissions.find(isRightSubmission))
      .map((vote) => ({
        ...vote.submissions.find(isRightSubmission)!,
        playerId: vote.playerId,
      }));

    const totalScore = votes.reduce((acc, curr) => acc + (curr?.score ?? 0), 0);

    return {
      ...submission,
      votes,
      totalScore,
    };
  });
}

type Comment = ReviewVotedSubmission & { name: string };

function getComments(
  submission: ReviewSubmission,
  league: FriendLeague
): Comment[] {
  return (
    submission?.votes?.map((vote) => {
      const player = league.players.find((p) => p.id === vote.playerId);
      return {
        name: player?.name ?? "Unknown",
        ...vote,
      };
    }) ?? []
  );
}

function Comment({ comment }: { comment: Comment }) {
  return (
    <div className='w-full my-4'>
      <div className='flex justify-between'>
        <div className='text-sm underline'>{comment.name}</div>

        <div className='text-sm'>Score: {comment.score}</div>
      </div>
      <div className='text-sm'>{comment.comment}</div>
    </div>
  );
}
