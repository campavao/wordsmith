import Link from "next/link";
import { getPlayer, getSubmissions } from "../api/apiUtils";
import { BackButton } from "../components/BackButton";

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
    <div className='flex flex-col justify-center lg:items-center h-[90%] gap-8'>
      <h1 className='font-bold text-4xl'>Personal Works</h1>
      <h2 className='text-lg text-gray-700'>Your past submissions</h2>
      <ul className='flex flex-col items-start gap-4 w-full lg:w-[400px]'>
        {submissions.map((sub, index) => (
          <li key={index} className='w-full'>
            <Link
              href={`/submissions/${sub.id}`}
              className='w-full flex flex-between items-end gap-1'
            >
              {sub.title} <span className='repeating-dots'></span>
              {index + 1}
            </Link>
          </li>
        ))}
      </ul>
      <BackButton />
    </div>
  );
}
