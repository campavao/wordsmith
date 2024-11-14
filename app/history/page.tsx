import { BackButton } from "../components/BackButton";
import { History } from "../components/History";

export default function HistoryPage() {
  return (
    <div className='flex flex-col justify-center h-[90%] gap-8'>
      <History />
      <BackButton />
    </div>
  );
}
