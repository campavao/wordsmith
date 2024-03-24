"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { joinGame } from "../utils/leagueUtils";
import { isPlayer, LeagueId } from "../types/FriendLeague";
import { CreateGame } from "./CreateGame";
import { Session } from "next-auth";

export default function FriendLeague() {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const { data: session } = useSession();

  const cancelCreate = useCallback(() => setIsCreating(false), []);
  const cancelJoin = useCallback(() => setIsJoining(false), []);

  if (!session) {
    redirect("/");
  }

  if (isJoining) {
    return <Join session={session} cancel={cancelJoin} />;
  }

  if (isCreating) {
    return <CreateGame session={session} cancel={cancelCreate} />;
  }

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>Fellow Writers</h1>
      <button onClick={() => setIsJoining(true)}>Find</button>
      <button onClick={() => setIsCreating(true)}>Create</button>
      <Link href='/'>Back</Link>
    </div>
  );
}

export interface CreateOrJoinGame {
  cancel: () => void;
  session: Session;
}

function Join({ cancel, session }: CreateOrJoinGame) {
  const router = useRouter();
  const [error, setError] = useState<string>();

  const [formData, setFormData] = useState<{ leagueId: LeagueId }>({
    leagueId: "",
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (session == null || !isPlayer(session.user)) {
      setError("User not found");
      return;
    }

    try {
      const { data, error, message } = await joinGame({
        player: session.user,
        leagueId: formData.leagueId,
      });
      if (error) {
        setError(message);
        return;
      }
      router.push(`/league/${data.leagueId}`);
    } catch (err: any) {
      throw new Error(err);
    }
  };

  return (
    <form
      className='flex flex-col justify-center items-center h-[90%] gap-4'
      onSubmit={handleSubmit}
    >
      <label htmlFor='league-code'>Enter league code</label>
      {error && <p className='text-red-500'>{error}</p>}
      <input
        type='text'
        name='leagueId'
        value={formData.leagueId}
        onChange={handleInputChange}
        className='border rounded-sm p-2 text-center text-black'
        id='league-code'
      />
      <button type='submit'>Join</button>
      <button onClick={cancel}>Back</button>
    </form>
  );
}
