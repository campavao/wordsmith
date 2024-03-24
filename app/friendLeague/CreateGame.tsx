import { v4 as uuid } from "uuid";
import {
  ChangeEvent,
  useCallback,
  useState,
  FormEvent,
  MouseEvent,
  useRef,
} from "react";
import { CreateOrJoinGame } from "./page";
import Image from "next/image";
import { createGame, CreateGamePayload } from "../utils/leagueUtils";
import { isPlayer } from "../types/FriendLeague";
import { useRouter } from "next/navigation";

interface CreateGameForm {
  leagueName: { value: string };
  maxPlayers: { value: number };
  picture: { files: File[] };
  prompts: HTMLInputElement[];
}

export function CreateGame({ session, cancel }: CreateOrJoinGame) {
  const router = useRouter();
  const imageRef = useRef<HTMLImageElement>(null);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.target as HTMLFormElement & CreateGameForm;
      const payload: CreateGamePayload = {
        leagueName: form.leagueName.value,
        maxPlayers: form.maxPlayers.value,
        picture: form.picture.files[0],
        prompts: Array.from(form.prompts).map<Prompt>((item) => ({
          id: item.id,
          text: item.value,
        })),
      };

      if (session == null || !isPlayer(session.user)) {
        console.error("User not found");
        return;
      }

      const { data } = await createGame({ player: session.user, payload });
      router.push(`/league/${data.leagueId}`);
    },
    [router, session]
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
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      Create game
      <Image
        style={{ display: "none" }}
        alt=''
        ref={imageRef}
        src=''
        width={200}
        height={200}
      />
      <form className='flex flex-col w-[50%] gap-6' onSubmit={onSubmit}>
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
            className='border-b'
            min={2}
            max={8}
            required
          />
        </label>
        <label className='flex place-content-between'>
          Picture
          <input
            name='picture'
            type='file'
            className='border-b'
            onChange={onImageUpload}
          />
        </label>
        <PromptSetup />
        <button type='submit'>Submit</button>
        <button onClick={cancel}>Back</button>
      </form>
    </div>
  );
}

export type Prompt = {
  id: string;
  text: string;
};

function getNewPrompt(): Prompt {
  return { id: uuid(), text: "" };
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
    (e: ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      const id = e.target.id;
      const newPrompts = prompts.map((item) =>
        item.id === id ? { id, text } : item
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
    <label className='flex flex-col gap-2'>
      Prompts
      {prompts.map((item, key) => (
        <label className='flex gap-4 w-full' key={key}>
          <input
            name='prompts'
            id={item.id}
            value={item.text}
            onChange={updatePrompt}
            className='w-full border-b'
            required
            autoFocus
          />
          {key > 0 && (
            <button id={`delete-${item.id}`} onClick={removePrompt}>
              Delete
            </button>
          )}
        </label>
      ))}
      <button onClick={addPrompt}>Add prompt</button>
    </label>
  );
}
