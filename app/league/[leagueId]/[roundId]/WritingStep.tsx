"use client";
import { useState, useCallback, useEffect } from "react";
import { Preview } from "./components/Preview";
import { ReactQuill, writingModules } from "./components/Quill";
import { addSubmission } from "@/app/utils/leagueUtils";
import {
  FriendLeague,
  isPlayer,
  Round,
  Submission,
} from "@/app/types/FriendLeague";
import { Sources } from "quill";
import { UnprivilegedEditor } from "react-quill";
import { Session } from "next-auth";
import { v4 as uuid } from "uuid";

export interface SharedStep {
  roundId: string;
  leagueId: string;
  round: Round;
  session: Session;
  league: FriendLeague;
}

export function WritingStep({ leagueId, roundId, round, session }: SharedStep) {
  const [readyToSubmit, setReadyToSubmit] = useState<boolean>(false);
  const [submission, setSubmission] = useState<Submission | undefined>();
  const [words, setWords] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const wordLimit = round?.wordLimit ?? 1000;
  const prompt = round?.prompt;

  const onSubmit = useCallback(async () => {
    if (session && isPlayer(session.user)) {
      try {
        const id = uuid();
        await addSubmission({
          player: session.user,
          roundId: roundId,
          text: words,
          title,
          leagueId: leagueId,
          id,
        });

        setSubmission({
          roundId: roundId,
          playerId: session.user.id,
          text: words,
          title,
          id,
        });
      } catch (e: any) {
        throw new Error(e);
      }
    }
  }, [leagueId, roundId, session, title, words]);

  const onTyping = useCallback(
    (
      text: string,
      _delta: unknown,
      _source: Sources,
      editor: UnprivilegedEditor
    ) => {
      setWords(text);

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

  useEffect(() => {
    const player = session?.user;
    if (!submission && isPlayer(player)) {
      const foundSubmission = round?.submissions.find(
        (item) => item.playerId === player.id && item.roundId === roundId
      );
      if (foundSubmission) {
        setSubmission(foundSubmission);
        setTitle(foundSubmission.title);
        setWords(foundSubmission.text);
      }
    }
  }, [roundId, submission, session?.user, round?.submissions]);

  if (submission) {
    return (
      <div className='flex flex-col min-h-screen items-center'>
        {prompt && (
          <blockquote className='max-w-lg p-5'>
            <p>{prompt}</p>
          </blockquote>
        )}
        <div className='border-b w-10 my-5 self-center' />

        <div className='flex flex-col max-w-lg w-screen'>
          <Preview title={title} words={words} isEditable={false} />
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
    <div className='flex flex-col min-h-screen items-center'>
      {prompt && (
        <blockquote className='max-w-lg p-5'>
          <p>{prompt}</p>
        </blockquote>
      )}
      <div className='border-b w-10 my-5 self-center' />

      {/* Tried to do just one or a conditional, but changing modules is bad I guess and will break the content */}
      {!readyToSubmit && (
        <ReactQuill
          theme='snow'
          placeholder='Compose your story'
          onChange={onTyping}
          modules={writingModules}
          value={words}
        />
      )}
      {readyToSubmit && <Preview setTitle={setTitle} words={words} />}
      <div className='border-b w-10 my-5 self-center' />
      <Footer
        showSubmit={readyToSubmit}
        onSubmit={onSubmit}
        wordCount={wordCount}
        limit={wordLimit}
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
    <div className='flex justify-between'>
      {!showSubmit ? (
        <p className={`text-sm ${overLimit && "text-red-500"}`}>
          Word count: {wordCount} {overLimit && `(${limit - wordCount})`}
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
