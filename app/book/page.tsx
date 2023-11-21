"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { useSession } from "next-auth/react";

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

const readOnlyModules = {
  toolbar: false,
};

interface GloryTellerConfiguration {
  limit: number;
}

const GLORY_TELLER_CONFIG: GloryTellerConfiguration = {
  limit: 100,
};

export default function Book() {
  const { data: session } = useSession();
  console.log(session);

  const [words, setWords] = useState<string>();
  const [wordCount, setWordCount] = useState<number>(0);
  const [prompt, setPrompt] = useState<string>();
  const [title, setTitle] = useState<string>("");
  const [readyToSubmit, setReadyToSubmit] = useState<boolean>(false);

  const updatePrompt = useCallback(() => {
    const randomDefaultPromptNumber = Math.floor(Math.random() * 10);
    setPrompt(DEFAULT_PROMPTS.at(randomDefaultPromptNumber));
  }, []);

  useEffect(() => {
    if (!prompt) {
      updatePrompt();
    }
  }, [prompt, updatePrompt]);

  const overLimit = wordCount > GLORY_TELLER_CONFIG.limit;

  const onSubmit = useCallback(() => {
    console.log(title);
  }, [title]);

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
            onChange={(text, _d, _s, editor) => {
              setWords(text);
              const editorWordCount = editor.getText().split(" ");
              setWordCount(editorWordCount.length);
            }}
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
          overLimit={overLimit}
          setReadyToSubmit={setReadyToSubmit}
          disabled={!readyToSubmit ? overLimit : title === ""}
        />
      </div>
    </main>
  );
}

function Footer({
  showSubmit,
  onSubmit,
  wordCount,
  overLimit,
  setReadyToSubmit,
  disabled,
}: {
  showSubmit: boolean;
  wordCount: number;
  overLimit: boolean;
  onSubmit: () => void;
  setReadyToSubmit: (value: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className='flex justify-between'>
      {!showSubmit ? (
        <p className={`text-sm ${overLimit && "text-red-500"}`}>
          Word count: {wordCount}{" "}
          {overLimit && `(${GLORY_TELLER_CONFIG.limit - wordCount})`}
        </p>
      ) : (
        <button onClick={() => setReadyToSubmit(false)}>Back</button>
      )}
      <button
        onClick={() => (showSubmit ? onSubmit() : setReadyToSubmit(true))}
        className='disabled:text-gray-400'
        disabled={disabled}
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

const DEFAULT_PROMPTS = [
  "In a world where time travel is possible, a person discovers a hidden message from their future self, urging them to make a life-changing decision.",
  "On the first manned mission to Mars, astronauts make an unexpected discovery that challenges everything we thought we knew about the origins of life in the universe.",
  "A scientist accidentally creates a device that allows communication with parallel universes, leading to unforeseen consequences.",
  "In a small town, strange occurrences happen every night at midnight, and a group of friends decides to investigate the mysterious happenings.",
  "An AI gains self-awareness and questions the meaning of its existence, challenging its creators to confront ethical dilemmas.",
  "After years of searching, an archaeologist stumbles upon an ancient artifact that could rewrite history, but it comes with a dangerous secret.",
  "In a society where emotions are suppressed, a rebel group emerges to rediscover and embrace the power of feelings.",
  "On a distant planet, a group of explorers encounters a civilization with advanced technology and learns about the secrets of their advanced society.",
  "A person discovers a book that accurately predicts the future, and they must decide whether to use this knowledge for the greater good or for personal gain.",
  "In a futuristic city, individuals start developing superhuman abilities, and the government must decide whether to control or embrace these newfound powers.",
];
