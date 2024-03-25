"use client";
import {
  isPlayer,
  Submission,
  VotedSubmission,
} from "@/app/types/FriendLeague";
import { Preview } from "./components/Preview";
import { SharedStep } from "./WritingStep";
import { useState, useEffect, useMemo, useCallback, ChangeEvent } from "react";
import { addVotes } from "@/app/utils/leagueUtils";

export function VotingStep({
  roundId,
  leagueId,
  round,
  session,
  league,
}: SharedStep) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const playerId = session.user.id;
  const [error, setError] = useState<string>("");
  const [isDone, setIsDone] = useState(false);
  const [availableDownvotes, setAvailableDownvotes] = useState<number>(
    league.config.numberOfDownvotes
  );
  const [availableUpvotes, setAvailableUpvotes] = useState<number>(
    league.config.numberOfUpvotes
  );

  const availableSubmissions = useMemo(
    () => round.submissions.filter((item) => item.playerId !== playerId),
    [playerId, round.submissions]
  );

  const [votes, setVotes] = useState<VotedSubmission[]>(
    getVotes(availableSubmissions)
  );

  useEffect(() => {
    if (availableSubmissions) {
      const roundVotes = round.votes.find((vote) => vote.playerId === playerId);
      const votedSubmissions = (roundVotes?.submissions ?? []).map(
        (item) => item.submissionId
      );
      const submissionIndex = availableSubmissions.findIndex(
        (item) => !votedSubmissions.includes(item.id)
      );

      if (submissionIndex !== -1) {
        setCurrentIndex(submissionIndex);
      } else {
        const previousVotes = roundVotes?.submissions ?? votes;
        setVotes(previousVotes);
        setIsDone(true);
      }
    }
  }, [availableSubmissions, playerId, round.votes, league.config, votes]);

  const submission = useMemo(
    () => availableSubmissions.at(currentIndex),
    [availableSubmissions, currentIndex]
  );

  const downvote = useCallback(() => {
    if (availableDownvotes > 0) {
      const currentScore = votes[currentIndex].score;
      const newVotes = [...votes];
      newVotes[currentIndex].score += -1;
      setVotes(newVotes);

      if (currentScore <= 0) {
        setAvailableDownvotes(availableDownvotes - 1);
      } else {
        setAvailableUpvotes((prevUpvotes) => prevUpvotes + 1);
      }
    }
  }, [availableDownvotes, currentIndex, votes]);

  const upvote = useCallback(() => {
    if (availableUpvotes > 0) {
      const currentScore = votes[currentIndex].score;
      const newVotes = [...votes];
      newVotes[currentIndex].score += 1;
      setVotes(newVotes);

      if (currentScore >= 0) {
        setAvailableUpvotes(availableUpvotes - 1);
      } else {
        setAvailableDownvotes((prevDownvotes) => prevDownvotes + 1);
      }
    }
  }, [availableUpvotes, currentIndex, votes]);

  const onCommentChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const comment = e.target.value;
      setVotes((prevVotes) => {
        const newVotes = [...prevVotes];
        newVotes[currentIndex].comment = comment;
        return newVotes;
      });
    },
    [currentIndex]
  );

  const onSubmit = useCallback(async () => {
    if (isPlayer(session.user)) {
      const { data, message, error } = await addVotes({
        player: session.user,
        roundId,
        leagueId,
        votedSubmissions: votes,
      });

      if (error) {
        setError(message);
      }

      setIsDone(true);
    }
  }, [session.user, votes, roundId, leagueId]);

  if (!submission) {
    return <div>Loading...</div>;
  }

  const isSubmittable = availableDownvotes + availableUpvotes === 0;

  return (
    <div className='flex flex-col items-center'>
      <blockquote className='max-w-lg p-5'>
        <p>{round.prompt}</p>
      </blockquote>
      {(league == null || error) && (
        <p className='text-red-500'>{error ?? "Game not found"}</p>
      )}
      <div className='border-b w-10 my-5 self-center' />

      <div className='flex flex-col max-w-lg w-screen'>
        <Preview
          title={submission.title}
          words={submission.text}
          isEditable={false}
        />
        <div className='border-b w-10 my-5 self-center' />

        <div className='flex flex-col gap-3'>
          <div className='flex gap-4 justify-center w-full'>
            <button
              className='w-10'
              disabled={isDone || availableDownvotes === 0}
              onClick={downvote}
            >
              -
            </button>
            <p>{votes[currentIndex].score}</p>
            <button
              className='w-10'
              disabled={isDone || availableUpvotes === 0}
              onClick={upvote}
            >
              +
            </button>
          </div>
          {!isDone && (
            <div className='flex gap-4 justify-between w-full'>
              <span>Available downvotes: {availableDownvotes}</span>
              <span>Available upvotes: {availableUpvotes}</span>
            </div>
          )}
          <div className='flex justify-between w-full'>
            <button
              className='disabled:text-transparent'
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
            >
              Previous
            </button>
            <button
              className='disabled:text-transparent'
              disabled={currentIndex === availableSubmissions.length - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              Next
            </button>
          </div>
          <label className='flex gap-1 justify-center w-full '>
            Comments
            <textarea
              onChange={onCommentChange}
              className='w-full border-2 px-2 text-sm resize-none min-h-[100px]'
              maxLength={500}
              value={votes[currentIndex].comment}
              disabled={isDone}
            />
          </label>
          {isSubmittable && !isDone && (
            <div className='flex justify-center w-full'>
              <button
                className='disabled:text-transparent'
                disabled={!isSubmittable}
                onClick={onSubmit}
              >
                Submit
              </button>
            </div>
          )}
        </div>

        {isDone && (
          <div className='w-full text-center pt-5'>
            Votes have been submitted! <br /> Waiting on everyone else
          </div>
        )}
      </div>
    </div>
  );
}

function getVotes(submissions: Submission[]): VotedSubmission[] {
  return submissions.map((item) => ({
    submissionId: item.id,
    score: 0,
    comment: "",
  }));
}
