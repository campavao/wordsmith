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
import { useRouter } from "next/navigation";

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [downvotes, setDownvotes] = useState<number>(0);
  const [upvotes, setUpvotes] = useState<number>(0);
  const router = useRouter();

  const availableSubmissions = useMemo(
    () => round.submissions.filter((item) => item.playerId !== playerId),
    [playerId, round.submissions]
  );

  const [votes, setVotes] = useState<VotedSubmission[]>(
    getVotes(availableSubmissions)
  );

  useEffect(() => {
    if (!isLoaded && availableSubmissions) {
      setIsLoaded(true);
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
  }, [
    availableSubmissions,
    playerId,
    round.votes,
    league.config,
    votes,
    isLoaded,
  ]);

  const submission = useMemo(
    () => availableSubmissions.at(currentIndex),
    [availableSubmissions, currentIndex]
  );

  const downvote = useCallback(() => {
    const currentScore = votes[currentIndex].score;
    const newVotes = [...votes];
    newVotes[currentIndex].score += -1;
    setVotes(newVotes);

    if (currentScore <= 0) {
      setDownvotes(downvotes + 1);
    } else {
      setUpvotes((prevUpvotes) => prevUpvotes - 1);
    }
  }, [downvotes, currentIndex, votes]);

  const upvote = useCallback(() => {
    const currentScore = votes[currentIndex].score;
    const newVotes = [...votes];
    newVotes[currentIndex].score += 1;
    setVotes(newVotes);

    if (currentScore >= 0) {
      setUpvotes(upvotes + 1);
    } else {
      setDownvotes((prevDownvotes) => prevDownvotes - 1);
    }
  }, [upvotes, currentIndex, votes]);

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
      const { message, error } = await addVotes({
        player: session.user,
        roundId,
        leagueId,
        votedSubmissions: votes,
      });

      if (error) {
        setError(message);
      }

      setIsDone(true);

      const isLastPlayer = league.players.length - round.votes.length <= 1;
      if (isLastPlayer) {
        router.refresh();
      }
    }
  }, [
    session.user,
    votes,
    roundId,
    leagueId,
    router,
    league,
    round.votes.length,
  ]);

  const { numberOfDownvotes, numberOfUpvotes } = league.config;

  const remainingDownvotes = numberOfDownvotes - downvotes;
  const remainingUpvotes = numberOfUpvotes - upvotes;

  const isValid = remainingDownvotes === 0 && remainingUpvotes === 0;

  const isTwoPlayerValid = useMemo(
    () =>
      remainingDownvotes >= 0 &&
      remainingUpvotes >= 0 &&
      (remainingDownvotes !== numberOfDownvotes ||
        remainingUpvotes !== numberOfUpvotes),
    [remainingDownvotes, remainingUpvotes, numberOfDownvotes, numberOfUpvotes]
  );

  if (!submission) {
    return <div>Loading...</div>;
  }

  const isSubmittable =
    round.submissions.length <= 2 ? isTwoPlayerValid : isValid;

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
            <button className='w-10' disabled={isDone} onClick={downvote}>
              -
            </button>
            <p>{votes[currentIndex].score}</p>
            <button className='w-10' disabled={isDone} onClick={upvote}>
              +
            </button>
          </div>
          {!isDone && (
            <div className='flex gap-4 justify-between w-full'>
              <span className={`${remainingDownvotes < 0 && "text-red-500"}`}>
                Available downvotes: {remainingDownvotes}
              </span>
              <span className={`${remainingUpvotes < 0 && "text-red-500"}`}>
                Available upvotes: {remainingUpvotes}
              </span>
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
          <label className='flex flex-col gap-1 justify-center w-full '>
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
