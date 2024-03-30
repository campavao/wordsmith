import Link from "next/link";

export default function GlobalLeague() {
  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>Global Writers</h1>
      <button>Coming soon</button>
      <Link href='/'>Back home</Link>
    </div>
  );
}
