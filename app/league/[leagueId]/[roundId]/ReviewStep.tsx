"use client";
import { useState } from "react";
import { Preview } from "./components/Preview";

import { Comment, ReviewSubmissionWithRank } from "./ReviewStepWrapper";

interface ReviewStepClient {
  reviewSubmissions: ReviewSubmissionWithRank[];
}

export function ReviewStepClient({ reviewSubmissions }: ReviewStepClient) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const submission = reviewSubmissions[currentIndex];

  return (
    <div>
      <strong className='flex justify-between'>
        <span>#{submission.rank}</span>
        <span>Total: {submission.totalScore}</span>
      </strong>
      <Preview
        words={submission.text}
        title={submission.title}
        authorName={submission.authorName}
        isEditable={false}
      />
      {submission.comments.map((comment, key) => (
        <CommentDisplay comment={comment} key={key} />
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

function CommentDisplay({ comment }: { comment: Comment }) {
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
