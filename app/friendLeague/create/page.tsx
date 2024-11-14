import { BackButton } from "@/app/components/BackButton";
import { CreateGame } from "../CreateGame";

export default function CreatePage() {
  return (
    <div className='flex flex-col justify-center items-start h-[90%] gap-8'>
      <CreateGame />
      <BackButton />
    </div>
  );
}
