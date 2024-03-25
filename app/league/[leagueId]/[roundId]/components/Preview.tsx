import { ReactQuill, readingModules } from "./Quill";

export function Preview({
  isEditable = true,
  words,
  title,
  setTitle,
}: {
  isEditable?: boolean;
  words?: string;
  title?: string;
  setTitle?: (title: string) => void;
}) {
  return (
    <div className='flex flex-col gap-4 min-h-[300px] w-full'>
      <input
        className={`border-b-[2px] text-center self-center disabled:bg-transparent disabled:border-b-0 ${
          isEditable ? "" : "font-bold"
        }`}
        maxLength={50}
        type='text'
        onChange={(e) => setTitle?.(e.target.value)}
        placeholder='Title'
        value={title}
        disabled={!isEditable}
      />
      <ReactQuill
        readOnly
        theme='snow'
        modules={readingModules}
        value={words}
      />
    </div>
  );
}
