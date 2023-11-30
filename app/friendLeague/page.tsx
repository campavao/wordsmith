"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";

export default function FriendLeague() {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState<boolean>();
  const [error, setError] = useState<string>()
  const { data: session } = useSession();

  if (!session) {
    redirect("/");
  }

  async function joinOrCreateLeague(leagueId?: string) {
    const response = await fetch("/api/league", {
      method: "POST",
      body: JSON.stringify({ player: session?.user, leagueId }),
    });
    const { data, message, error } = await response.json();
    if (error) {
      setError(message);
      return;
    }
    router.push(`/league/${data.leagueId}`);
  }


  function Join() {
    const [formData, setFormData] = useState({ leagueId: "" });

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
      },
      []
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log("Form Data:", formData);
      setError('')
      joinOrCreateLeague(formData.leagueId);
      // Add your logic for form submission here
    };

    return (
      <form
        className='flex flex-col justify-center items-center gap-4'
        onSubmit={handleSubmit}
      >
        <label htmlFor='league-code'>Enter league code</label>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type='text'
          name='leagueId'
          value={formData.leagueId}
          onChange={handleInputChange}
          className='border rounded-sm p-2 text-center'
          id='league-code'
        />
        <button type='submit'>Join</button>
        <button onClick={() => setIsJoining(false)}>Back</button>
      </form>
    );
  }

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>Fellow Writers</h1>

      {!isJoining ? (
        <>
          <button onClick={() => setIsJoining(true)}>Find</button>
          <button onClick={() => joinOrCreateLeague()}>Create</button>
          <Link href='/'>Back</Link>
        </>
      ) : (
        <Join />
      )}
    </div>
  );
}
