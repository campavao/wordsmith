"use client";
import {
  FormEvent,
  MouseEventHandler,
  Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { v4 as uuid } from "uuid";
import { Preview } from "./components/Preview";
import { ReactQuill, writingModules } from "./components/Quill";

import { SubmitButton } from "@/app/components/SubmitButton";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { addSubmission } from "@/app/utils/leagueUtils";
import { useRouter } from "next/navigation";
import { Sources } from "quill";
import { UnprivilegedEditor } from "react-quill";
import Error from "../error";

interface WritingStepClient {
  limit: number;
  prompt: string;
  isLastPlayer: boolean;
  leagueId: string;
  roundId: string;
  foundText?: string;
  foundTitle?: string;
}

export function WritingStepClient({
  limit,
  prompt,
  roundId,
  leagueId,
  isLastPlayer,
  foundText,
  foundTitle,
}: WritingStepClient) {
  const [storedText, setStoredText] = useLocalStorage(
    `writing.submission.${roundId}`,
    foundText ?? ""
  );
  const [readyToSubmit, setReadyToSubmit] = useState<boolean>(false);
  const [text, setText] = useState<string>(storedText ?? foundText ?? "");
  const [title, setTitle] = useState<string>(foundTitle ?? "");
  const [isDone, setIsDone] = useState<boolean>(!!foundText && !!foundTitle);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState();
  const [wordCount, setWordCount] = useState<number>(0);

  const escapeButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const id = uuid();
        await addSubmission({
          roundId,
          text: text,
          title,
          leagueId,
          id,
        });

        setIsDone(true);
        setStoredText(null);

        if (isLastPlayer) {
          router.refresh();
        }
      } catch (e: any) {
        setSubmitting(false);
        console.error(e);
        setError(e.message);
      }
    },
    [roundId, text, title, leagueId, setStoredText, isLastPlayer, router]
  );

  const onTyping = useCallback(
    (
      text: string,
      _delta: unknown,
      _source: Sources,
      _editor: UnprivilegedEditor
    ) => {
      setText(text);
      setStoredText(text);
    },
    [setStoredText]
  );

  useEffect(() => {
    setWordCount(getWordCount(text));
  }, [text]);

  if (isDone) {
    return (
      <div className='flex flex-col items-center'>
        {prompt && (
          <blockquote className='max-w-lg'>
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
        <blockquote className='max-w-lg italic text-sm'>
          <p>{prompt}</p>
        </blockquote>
      )}
      <div className='border-b w-10 my-5 self-center' />
      {error && <Error message={error} />}

      {/* Tried to do just one or a conditional, but changing modules is bad I guess and will break the content */}
      {!readyToSubmit && (
        <ReactQuill
          theme='snow'
          className='w-full min-h-[300px]'
          placeholder='Compose your story'
          onChange={onTyping}
          modules={writingModules}
          value={text}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              console.log(escapeButtonRef);
              escapeButtonRef.current?.focus();
            }
          }}
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
        escapeButtonRef={escapeButtonRef}
        isSubmitting={isSubmitting}
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
  escapeButtonRef,
  isSubmitting,
}: {
  showSubmit: boolean;
  wordCount: number;
  limit: number;
  onSubmit: MouseEventHandler<HTMLButtonElement>;
  setReadyToSubmit: (value: boolean) => void;
  disabled: boolean;
  escapeButtonRef: Ref<HTMLButtonElement>;
  isSubmitting: boolean;
}) {
  const overLimit = wordCount > limit;
  return (
    <div className='flex w-full justify-between'>
      {!showSubmit ? (
        <p className={`text-sm ${overLimit && "text-red-500"}`}>
          Words left: {limit - wordCount}
        </p>
      ) : (
        <button onClick={() => setReadyToSubmit(false)} disabled={isSubmitting}>
          Back
        </button>
      )}
      <SubmitButton
        disabled={disabled || overLimit}
        loading={isSubmitting}
        onClick={(e) => (showSubmit ? onSubmit(e) : setReadyToSubmit(true))}
        ref={escapeButtonRef}
      >
        {showSubmit ? "Submit" : "Next"}
      </SubmitButton>
    </div>
  );
}

function getWordCount(text: string) {
  return text
    .split(" ") // remove spaces
    .flatMap((word) => word.split("\n")) // remove new lines
    .flatMap((word) => word.split("\t")) // remove tabs
    .filter((word) => word !== "" && word !== "\n").length;
}
