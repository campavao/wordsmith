"use client";
import { FriendLeague, isPlayer, Round } from "@/app/types/FriendLeague";
import { getGame } from "@/app/utils/leagueUtils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function League({ params }: { params: { leagueId: string } }) {
  const { data: session } = useSession();
  const [league, setLeague] = useState<FriendLeague>();
  const [isFetched, setIsFetched] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchLeague = useCallback(async () => {
    if (!session || !isPlayer(session?.user)) {
      return;
    }
    const { data, message, error } = await getGame({
      leagueId: params.leagueId,
      player: session.user,
    });

    if (error) {
      setError(message);
    } else {
      setLeague(data);
    }
  }, [params.leagueId, session]);

  useEffect(() => {
    if (!isFetched) {
      (async () => {
        await fetchLeague();
        setIsFetched(true);
      })();
    }
  }, [fetchLeague, isFetched]);

  const copyLeagueId = useCallback(() => {
    // Copy the text inside the text field
    navigator.clipboard.writeText(params.leagueId);

    // Alert the copied text
    alert("Copied the text: " + params.leagueId);
  }, [params.leagueId]);

  if (!isFetched) {
    return (
      <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
        Loading...
      </div>
    );
  }

  return (
    <div className='flex flex-col justify-center items-center h-[90%] gap-8'>
      <p>
        League ID:{" "}
        <button className='text-bold flex gap-2' onClick={copyLeagueId}>
          {params.leagueId} <CopyIcon />
        </button>
      </p>
      {league == null || error ? (
        <p className='text-red-500'>{error ?? "Game not found"}</p>
      ) : (
        <div className='flex flex-col justify-center items-center gap-8'>
          <h1 className='font-bold text-lg underline'>{league.config.name}</h1>
          {league.rounds.map((round) => (
            <RoundCard round={round} key={round.id} />
          ))}
        </div>
      )}
      <Link href='/'>Back</Link>
    </div>
  );
}

function RoundCard({ round }: { round: Round }) {
  const [isOpened, setIsOpened] = useState(false);

  if (!isOpened) {
    return <button onClick={() => setIsOpened(true)}>{round.prompt}</button>;
  }

  return (
    <button
      onClick={() => setIsOpened(false)}
      className='flex flex-col justify-center items-center gap-8 border-4 p-4 rounded border-black'
    >
      <div>{round.id}</div>
      <div>{round.prompt}</div>
      <div>{round.status}</div>
    </button>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='#000000'
      height='20px'
      width='20px'
      version='1.1'
      id='Layer_1'
      viewBox='0 0 64 64'
    >
      <g id='Text-files'>
        <path d='M53.9791489,9.1429005H50.010849c-0.0826988,0-0.1562004,0.0283995-0.2331009,0.0469999V5.0228   C49.7777481,2.253,47.4731483,0,44.6398468,0h-34.422596C7.3839517,0,5.0793519,2.253,5.0793519,5.0228v46.8432999   c0,2.7697983,2.3045998,5.0228004,5.1378999,5.0228004h6.0367002v2.2678986C16.253952,61.8274002,18.4702511,64,21.1954517,64   h32.783699c2.7252007,0,4.9414978-2.1725998,4.9414978-4.8432007V13.9861002   C58.9206467,11.3155003,56.7043495,9.1429005,53.9791489,9.1429005z M7.1110516,51.8661003V5.0228   c0-1.6487999,1.3938999-2.9909999,3.1062002-2.9909999h34.422596c1.7123032,0,3.1062012,1.3422,3.1062012,2.9909999v46.8432999   c0,1.6487999-1.393898,2.9911003-3.1062012,2.9911003h-34.422596C8.5049515,54.8572006,7.1110516,53.5149002,7.1110516,51.8661003z    M56.8888474,59.1567993c0,1.550602-1.3055,2.8115005-2.9096985,2.8115005h-32.783699   c-1.6042004,0-2.9097996-1.2608986-2.9097996-2.8115005v-2.2678986h26.3541946   c2.8333015,0,5.1379013-2.2530022,5.1379013-5.0228004V11.1275997c0.0769005,0.0186005,0.1504021,0.0469999,0.2331009,0.0469999   h3.9682999c1.6041985,0,2.9096985,1.2609005,2.9096985,2.8115005V59.1567993z' />
        <path d='M38.6031494,13.2063999H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0158005   c0,0.5615997,0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4542999,1.0158997-1.0158997   C39.6190491,13.6606998,39.16465,13.2063999,38.6031494,13.2063999z' />
        <path d='M38.6031494,21.3334007H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0157986   c0,0.5615005,0.4544001,1.0159016,1.0159006,1.0159016h22.3491974c0.5615005,0,1.0158997-0.454401,1.0158997-1.0159016   C39.6190491,21.7877007,39.16465,21.3334007,38.6031494,21.3334007z' />
        <path d='M38.6031494,29.4603004H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997   s0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4543991,1.0158997-1.0158997   S39.16465,29.4603004,38.6031494,29.4603004z' />
        <path d='M28.4444485,37.5872993H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997   s0.4544001,1.0158997,1.0159006,1.0158997h12.1904964c0.5615025,0,1.0158005-0.4543991,1.0158005-1.0158997   S29.0059509,37.5872993,28.4444485,37.5872993z' />
      </g>
    </svg>
  );
}
