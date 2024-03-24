"use client";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { useGame } from "@/app/hooks/useGame";
import Link from "next/link";
import { Sources } from "quill";
import { UnprivilegedEditor } from "react-quill";

const modules = {
  toolbar: [
    // Specify the toolbar options you want to include
    ["bold", "italic", "underline", "strike"], // Text formatting options
    [{ header: 1 }, { header: 2 }], // Headers
    [{ list: "ordered" }, { list: "bullet" }], // Lists
    [{ indent: "-1" }, { indent: "+1" }], // Indents
    ["clean"],
  ],
};

export default function Round({
  params,
}: {
  params: {
    leagueId: string;
    roundId: string;
  };
}) {
  const { round, error, isLoading } = useGame(params);

  const [words, setWords] = useState<string>();
  const [wordCount, setWordCount] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [readyToSubmit, setReadyToSubmit] = useState<boolean>(false);

  const wordLimit = round?.wordLimit ?? 1000;
  const prompt = round?.prompt;

  const onSubmit = useCallback(() => {
    console.log(title);
  }, [title]);

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

  if (isLoading) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8 '>
        <p className='text-red-500'>{error}</p>
        <Link href='/'>Back</Link>
      </div>
    );
  }

  return (
    <main className='flex flex-col min-h-screen items-center'>
      <h1 className='h1 font-bold text-lg mt-10'>Wordsmith</h1>
      {prompt && (
        <blockquote className='max-w-lg p-5'>
          <p>{prompt}</p>
        </blockquote>
      )}
      <div className='max-w-lg w-screen'>
        <div className='border my-5' />
        {/* Tried to do just one or a conditional, but changing modules is bad I guess and will break the content */}
        {!readyToSubmit && (
          <ReactQuill
            theme='snow'
            placeholder='Compose your story'
            onChange={onTyping}
            modules={modules}
            value={words}
          />
        )}
        {readyToSubmit && <Preview setTitle={setTitle} words={words} />}
        <div className='border my-5' />
        <Footer
          showSubmit={readyToSubmit}
          onSubmit={onSubmit}
          wordCount={wordCount}
          limit={wordLimit}
          setReadyToSubmit={setReadyToSubmit}
          disabled={(readyToSubmit && title === "") || wordCount === 0}
        />
      </div>
    </main>
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

function Preview({
  words,
  setTitle,
}: {
  words?: string;
  setTitle: (title: string) => void;
}) {
  return (
    <div className='flex flex-col gap-4'>
      <input
        className='border-b-[2px] text-center self-center'
        maxLength={20}
        type='text'
        onChange={(e) => setTitle(e.target.value)}
        placeholder='Title'
      />
      <ReactQuill
        readOnly
        theme='snow'
        modules={{ toolbar: false }}
        value={words}
      />
    </div>
  );
}
