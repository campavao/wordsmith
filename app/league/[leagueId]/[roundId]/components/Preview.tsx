"use client";
import { ReactQuill, readingModules } from "./Quill";

export function Preview({
  className,
  isEditable = true,
  words,
  title,
  setTitle,
  authorName,
}: {
  className?: string;
  isEditable?: boolean;
  words?: string;
  title?: string;
  setTitle?: (title: string) => void;
  authorName?: string;
}) {
  return (
    <div className={`${className} flex flex-col gap-4 min-h-[300px] w-full`}>
      <input
        className={`border-b-[2px] text-center self-center w-96 disabled:bg-inherit disabled:border-b-0 ${
          isEditable ? "" : "font-bold"
        }`}
        maxLength={50}
        type='text'
        onChange={(e) => setTitle?.(e.target.value)}
        placeholder='Title'
        value={title}
        disabled={!isEditable}
      />
      {authorName && (
        <p className='w-full text-center text-sm'>By: {authorName}</p>
      )}
      <ReactQuill
        readOnly
        theme='snow'
        modules={readingModules}
        value={words}
      />
    </div>
  );
}
