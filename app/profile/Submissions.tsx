"use client";
import { useState } from "react";
import { ServerSubmission } from "./page";
import { Preview } from "../league/[leagueId]/[roundId]/components/Preview";

export function Submissions({
  submissions,
}: {
  submissions: Omit<ServerSubmission, "playerId" | "roundId">[];
}) {
  const [isViewing, setIsViewing] = useState(false);
  const [currIndex, setCurrIndex] = useState(0);
  const maxIndex = submissions.length - 1;
  const submission = submissions[currIndex];

  if (isViewing) {
    return (
      <div className='w-full'>
        <blockquote className='max-w-lg text-italic p-5'>
          <p>{submission.config.roundPrompt}</p>
        </blockquote>
        <Preview words={submission.text} title={submission.title} />
        <div className='flex justify-between'>
          <button
            disabled={currIndex === 0}
            onClick={() => setCurrIndex(currIndex - 1)}
          >
            Previous
          </button>
          <button
            disabled={currIndex === maxIndex}
            onClick={() => setCurrIndex(currIndex + 1)}
          >
            Next
          </button>
        </div>
        <button onClick={() => setIsViewing(false)}>Back</button>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {submissions.map((sub, index) => (
        <button
          key={index}
          onClick={() => {
            setCurrIndex(index);
            setIsViewing(true);
          }}
          className='flex flex-col text-left'
        >
          <span className='text-xs font-bold'>{sub.config.leagueName}</span>
          <span>{sub.config.roundPrompt}</span>
        </button>
      ))}
    </div>
  );
}
