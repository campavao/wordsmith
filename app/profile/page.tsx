import Link from "next/link";
import { getPlayer } from "../api/apiUtils";

export default async function Profile() {
  const player = await getPlayer();

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <h1 className='font-bold text-lg'>Author</h1>
      <div>Name: {player.name}</div>
      <div>Email: {player.email}</div>
      <Link href='/'>Back home</Link>
    </div>
  );
}
