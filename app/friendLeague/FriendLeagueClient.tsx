"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Player, LeagueId } from "../types/FriendLeague";
import { joinGame } from "../utils/leagueUtils";
import { CreateGame } from "./CreateGame";

export function FriendLeagueClient({ player }: { player: Player }) {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const cancelCreate = useCallback(() => setIsCreating(false), []);
  const cancelJoin = useCallback(() => setIsJoining(false), []);

  if (isJoining) {
    return <Join player={player} cancel={cancelJoin} />;
  }

  if (isCreating) {
    return <CreateGame player={player} cancel={cancelCreate} />;
  }

  return (
    <>
      <button onClick={() => setIsJoining(true)}>Find</button>
      <button onClick={() => setIsCreating(true)}>Create</button>
    </>
  );
}

export interface CreateOrJoinGame {
  cancel: () => void;
  player: Player;
}

function Join({ cancel, player }: CreateOrJoinGame) {
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

    try {
      const { data, error, message } = await joinGame({
        player,
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
      className='flex flex-col justify-center items-center w-full h-[90%] gap-4'
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
