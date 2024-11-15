"use client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SubmitButton } from "../components/SubmitButton";
import { LeagueId } from "../types/FriendLeague";
import { joinGame } from "../utils/leagueUtils";

export function FriendLeagueClient() {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const cancelCreate = useCallback(() => setIsCreating(false), []);
  const cancelJoin = useCallback(() => setIsJoining(false), []);

  return (
    <>
      <button onClick={() => setIsJoining(true)}>Find</button>
      <button onClick={() => setIsCreating(true)}>Create</button>
    </>
  );
}

export function Join() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isSubmitting, setSubmitting] = useState(false);

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
    setSubmitting(true);

    try {
      const { error, message } = await joinGame({
        leagueId: formData.leagueId,
      });
      if (error) {
        setError(message);
        setSubmitting(false);
        return;
      }
      router.push(`/league/${formData.leagueId}`);
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message);
      console.error(err);
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
      <SubmitButton
        className='w-28 self-center'
        type='submit'
        disabled={formData.leagueId === ""}
        loading={isSubmitting}
      >
        Join
      </SubmitButton>
    </form>
  );
}
