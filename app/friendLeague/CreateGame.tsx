import { v4 as uuid } from "uuid";
import {
  ChangeEvent,
  useCallback,
  useState,
  FormEvent,
  MouseEvent,
  useRef,
  useMemo,
} from "react";
import Image from "next/image";
import {
  createGame,
  CreateGamePayload,
  createLeagueId,
} from "../utils/leagueUtils";
import { DEFAULT_PROMPTS, isPlayer } from "../types/FriendLeague";
import { useRouter } from "next/navigation";
import { CreateOrJoinGame } from "./FriendLeagueClient";

interface CreateGameForm {
  leagueName: { value: string };
  maxPlayers: { value: number };
  picture: { files: File[] };
  prompts: HTMLInputElement[];
}

export function CreateGame({ cancel }: CreateOrJoinGame) {
  const router = useRouter();
  const imageRef = useRef<HTMLImageElement>(null);
  const leagueId = useMemo(() => createLeagueId(5), []);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.target as HTMLFormElement & CreateGameForm;

      const prompts: HTMLInputElement[] =
        form.prompts.length != null
          ? Array.from(form.prompts)
          : Array.isArray(form.prompts)
          ? form.prompts
          : [form.prompts];

      const payload: CreateGamePayload = {
        leagueId,
        leagueName: form.leagueName.value,
        maxPlayers: form.maxPlayers.value,
        numberOfUpvotes: form.numberOfUpvotes.value,
        numberOfDownvotes: form.numberOfDownvotes.value,
        // picture: form.picture.files[0],
        prompts: prompts.map<Prompt>((item) => ({
          id: item.id,
          text: item.value,
          wordLimit: Number(item.dataset.limit ?? 200),
        })),
      };

      const { error, message } = await createGame({ payload });

      if (error) {
        console.error(message);
      }

      router.push(`/league/${leagueId}`);
    },
    [leagueId, router]
  );

  const onImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files == null) {
      console.error("No files uploaded");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      if (imageRef.current) {
        imageRef.current.src = event.target?.result as any;
        imageRef.current.style.display = "block";
      }
    });
    reader.readAsDataURL(files[0]);
  }, []);

  return (
    <div className='flex flex-col justify-center items-center w-full h-[90%] gap-8'>
      Create game
      {/* <Image
        style={{ display: "none" }}
        alt=''
        ref={imageRef}
        src=''
        width={200}
        height={200}
      /> */}
      <form className='flex flex-col sm:w-[60%] gap-6' onSubmit={onSubmit}>
        <label className='flex place-content-between'>
          Name
          <input
            name='leagueName'
            className='border-b'
            autoComplete='off'
            autoFocus
            required
          />
        </label>
        <label className='flex place-content-between'>
          Max players
          <input
            name='maxPlayers'
            type='number'
            className='border-b w-8'
            min={3}
            max={8}
            required
            defaultValue={8}
            aria-describedby='two-player-warning'
          />
        </label>
        <label className='flex place-content-between'>
          Required upvotes
          <input
            name='numberOfUpvotes'
            type='number'
            className='border-b w-8'
            min={0}
            max={8}
            required
            defaultValue={2}
          />
        </label>
        <label className='flex place-content-between'>
          Required downvotes
          <input
            name='numberOfDownvotes'
            type='number'
            className='border-b w-8'
            min={0}
            max={8}
            required
            defaultValue={1}
          />
        </label>
        {/* <label className='flex place-content-between'>
          Picture
          <input
            name='picture'
            type='file'
            className='border-b'
            onChange={onImageUpload}
          />
        </label> */}
        <PromptSetup />
        <button className='w-28 self-center' type='submit'>
          Submit
        </button>
        <button className='w-28 self-center' onClick={cancel}>
          Back
        </button>
      </form>
    </div>
  );
}

export type Prompt = {
  id: string;
  text: string;
  wordLimit: number;
};

function getNewPrompt(): Prompt {
  return { id: uuid(), text: "", wordLimit: 200 };
}

function PromptSetup() {
  const [prompts, setPrompts] = useState<Prompt[]>([getNewPrompt()]);

  const addPrompt = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const newPrompts = [...prompts, getNewPrompt()];
      setPrompts(newPrompts);
    },
    [prompts]
  );

  const updatePrompt = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      const id = e.target.id;
      const newPrompts = prompts.map((item) =>
        item.id === id ? { ...item, text } : item
      );

      setPrompts(newPrompts);
    },
    [prompts]
  );

  const updateWordLimit = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const wordLimit = Number(e.target.value);
      const id = e.target.id.replace("word-limit-", "");
      const newPrompts = prompts.map((item) =>
        item.id === id ? { ...item, wordLimit } : item
      );

      setPrompts(newPrompts);
    },
    [prompts]
  );

  const removePrompt = useCallback(
    (e: MouseEvent<HTMLButtonElement> & { target: { id: string } }) => {
      e.preventDefault();
      const id = e.target.id.replace("delete-", "");
      const newPrompts = prompts.filter((item) => item.id !== id);

      setPrompts(newPrompts);
    },
    [prompts]
  );

  return (
    <label className='flex flex-col gap-4'>
      Prompts
      {prompts.map((item, key) => (
        <div key={key}>
          <label className='flex flex-col sm:flex-row gap-4 w-full'>
            {key + 1}
            <textarea
              id={item.id}
              name='prompts'
              value={item.text}
              onChange={updatePrompt}
              className='w-full min-w-[200px] border-b resize-none h-24 rounded-lg'
              required
              autoFocus={key > 0}
              rows={2}
              wrap='hard'
              maxLength={200}
              placeholder={getPlaceholder(key)}
              data-limit={item.wordLimit}
            />
            <div className='flex self-center sm:self-auto sm:flex-col place-content-between w-full sm:w-28 p-1 border-b'>
              <label className='text-center'>
                Word limit:
                <input
                  id={`word-limit-${item.id}`}
                  type='number'
                  max={1000}
                  value={item.wordLimit}
                  onChange={updateWordLimit}
                  className='w-28 text-center'
                />
              </label>
              {key > 0 && (
                <button id={`delete-${item.id}`} onClick={removePrompt}>
                  Delete
                </button>
              )}
            </div>
          </label>
        </div>
      ))}
      <button className='w-28 self-center' onClick={addPrompt}>
        Add prompt
      </button>
    </label>
  );
}

const getPlaceholder = (index: number) => {
  return DEFAULT_PROMPTS.length > index
    ? DEFAULT_PROMPTS[index]
    : DEFAULT_PROMPTS[0];
};
