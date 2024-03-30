"use client";
import { useState, useCallback } from "react";
import { Preview } from "./components/Preview";
import { ReactQuill, writingModules } from "./components/Quill";
import { v4 as uuid } from "uuid";

import { Sources } from "quill";
import { UnprivilegedEditor } from "react-quill";
import { addSubmission } from "@/app/utils/leagueUtils";
import { useRouter } from "next/navigation";

interface WritingStepClient {
  limit: number;
  prompt: string;
  isLastPlayer: boolean;
  playerId: string;
  leagueId: string;
  roundId: string;
  foundText?: string;
  foundTitle?: string;
}

export function WritingStepClient({
  limit,
  prompt,
  playerId,
  roundId,
  leagueId,
  isLastPlayer,
  foundText,
  foundTitle,
}: WritingStepClient) {
  const [readyToSubmit, setReadyToSubmit] = useState<boolean>(false);
  const [text, setText] = useState<string>(foundText ?? "");
  const [wordCount, setWordCount] = useState<number>(0);
  const [title, setTitle] = useState<string>(foundTitle ?? "");
  const [isDone, setIsDone] = useState<boolean>(!!foundText && !!foundTitle);
  const router = useRouter();

  const onSubmit = useCallback(async () => {
    try {
      const id = uuid();
      await addSubmission({
        playerId,
        roundId,
        text: text,
        title,
        leagueId,
        id,
      });

      setIsDone(true);

      if (isLastPlayer) {
        router.refresh();
      }
    } catch (e: any) {
      throw new Error(e);
    }
  }, [playerId, roundId, text, title, leagueId, isLastPlayer, router]);

  const onTyping = useCallback(
    (
      text: string,
      _delta: unknown,
      _source: Sources,
      editor: UnprivilegedEditor
    ) => {
      setText(text);

      const editorWordCount = editor
        .getText()
        .split(" ") // remove spaces
        .flatMap((word) => word.split("\n")) // remove new lines
        .flatMap((word) => word.split("\t")) // remove tabs
        .filter((word) => word !== "" && word !== "\n");

      setWordCount(editorWordCount.length);
    },
    []
  );

  if (isDone) {
    return (
      <div className='flex flex-col items-center'>
        {prompt && (
          <blockquote className='max-w-lg p-5'>
            <p>{prompt}</p>
          </blockquote>
        )}
        <div className='border-b w-10 my-5 self-center' />

        <div className='flex flex-col max-w-lg w-full'>
          <Preview title={title} words={text} isEditable={false} />
          <div className='border-b w-10 my-5 self-center' />
          <p className='text-center'>
            You have submitted. <br /> Waiting on everyone else to do the
            same...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center'>
      {prompt && (
        <blockquote className='max-w-lg p-5 italic text-sm'>
          <p>{prompt}</p>
        </blockquote>
      )}
      <div className='border-b w-10 my-5 self-center' />

      {/* Tried to do just one or a conditional, but changing modules is bad I guess and will break the content */}
      {!readyToSubmit && (
        <ReactQuill
          theme='snow'
          className='w-full min-h-[300px]'
          placeholder='Compose your story'
          onChange={onTyping}
          modules={writingModules}
          value={text}
        />
      )}
      {readyToSubmit && <Preview setTitle={setTitle} words={text} />}
      <div className='border-b w-10 my-5 self-center' />
      <Footer
        showSubmit={readyToSubmit}
        onSubmit={onSubmit}
        wordCount={wordCount}
        limit={limit}
        setReadyToSubmit={setReadyToSubmit}
        disabled={(readyToSubmit && title === "") || wordCount === 0}
      />
    </div>
  );
}

function Footer({
  showSubmit,
  onSubmit,
  wordCount,
  limit,
  setReadyToSubmit,
  disabled,
}: {
  showSubmit: boolean;
  wordCount: number;
  limit: number;
  onSubmit: () => void;
  setReadyToSubmit: (value: boolean) => void;
  disabled: boolean;
}) {
  const overLimit = wordCount > limit;
  return (
    <div className='flex w-full justify-between'>
      {!showSubmit ? (
        <p className={`text-sm ${overLimit && "text-red-500"}`}>
          Words left: {limit - wordCount}
        </p>
      ) : (
        <button onClick={() => setReadyToSubmit(false)}>Back</button>
      )}
      <button
        onClick={() => (showSubmit ? onSubmit() : setReadyToSubmit(true))}
        className='disabled:text-gray-400'
        disabled={disabled || overLimit}
      >
        {showSubmit ? "Submit" : "Next"}
      </button>
    </div>
  );
}
