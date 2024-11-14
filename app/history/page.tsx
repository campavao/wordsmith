import Link from "next/link";
import { History } from "../components/History";

export default function HistoryPage() {
  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <History />
      <Link href='/'>Back home</Link>
    </div>
  );
}
