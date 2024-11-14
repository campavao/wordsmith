import { BackButton } from "@/app/components/BackButton";
import { Join } from "../FriendLeagueClient";

export default function JoinPage() {
  return (
    <div className='flex flex-col justify-center items-start h-[90%] gap-8'>
      <Join />
      <BackButton />
    </div>
  );
}
