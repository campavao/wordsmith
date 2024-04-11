import Link from "next/link";
import { getPlayer, getSubmissions } from "../api/apiUtils";

export default async function Submissions() {
  const player = await getPlayer();
  const submissions = await getSubmissions(player.id);

  if (submissions.length === 0) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
        <span className='italic'>
          Every journey starts with a single step, so take yours already!
        </span>
        <span className='font-bold'>No submissions found</span>
        <Link href='/'>Back home</Link>
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <span>Previous Submissions:</span>
      {submissions.map((sub, index) => (
        <Link key={index} href={`/submissions/${sub.id}`}>
          <span className='text-md font-bold'>{sub.title}</span>
        </Link>
      ))}
      <Link href='/'>Back home</Link>
    </div>
  );
}
