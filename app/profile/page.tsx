import Link from "next/link";
import { getPlayer, getSubmissions } from "../api/apiUtils";
import { LeagueId, Submission } from "../types/FriendLeague";
import { Submissions } from "./Submissions";

export interface ServerSubmission extends Submission {
  config: {
    leagueId: LeagueId;
    leagueName: string;
    roundPrompt: string;
  };
}

export default async function Profile() {
  const player = await getPlayer();
  const submissions = await getSubmissions(player.id);

  const submissionsScrubbed = submissions.map((sub) => ({
    config: sub.config,
    id: sub.id,
    text: sub.text,
    title: sub.title,
  }));

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>Author</h1>
      <div>Name: {player.name}</div>
      <div>Email: {player.email}</div>
      <div className='flex flex-col gap-4'>
        <span>Previous Submissions:</span>
        <Submissions submissions={submissionsScrubbed} />
      </div>
      <Link href='/'>Back home</Link>
    </div>
  );
}
