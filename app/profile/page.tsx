import { getPlayer } from "../api/apiUtils";
import { BackButton } from "../components/BackButton";

export default async function Profile() {
  const player = await getPlayer();

  return (
    <div className='flex flex-col justify-center h-[90%] gap-4'>
      <h1 className='font-bold text-4xl'>Profile</h1>
      <h2 className='text-lg text-gray-700'>About the author</h2>
      <div>Name: {player.name}</div>
      <div>Email: {player.email}</div>
      <BackButton />
    </div>
  );
}
