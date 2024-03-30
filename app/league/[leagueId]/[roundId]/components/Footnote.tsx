import { FriendLeague, Player, Round } from "@/app/types/FriendLeague";
import { useMemo } from "react";

interface Footnote {
  round: Round;
  league: FriendLeague;
  action: string;
  isVoting: boolean;
}

type PlayerMap = Record<string, Player>;

export function Footnote({ round, league, action, isVoting }: Footnote) {
  const list = isVoting ? round.votes : round.submissions;

  const waitingOnPlayers = useMemo(() => {
    const doneIds = list.map(({ playerId }) => playerId);
    return Object.entries(league.players)
      .filter(([id]) => list.length === 0 || !doneIds.includes(id))
      .map(([, player]) => player);
  }, [league.players, list]);

  return (
    <div className='min-h-[150px] background:white flex justify-center'>
      <ol className='flex flex-col gap-2 text-sm list-decimal border-t w-full max-w-lg pt-2 mt-4'>
        {list.map(({ playerId }) => {
          const player = league.players[playerId];
          return (
            <li key={playerId}>
              {player.name} has {action}
            </li>
          );
        })}
        {waitingOnPlayers.map(({ name, id }) => (
          <li key={id}>
            {name} has not {action}
          </li>
        ))}
      </ol>
    </div>
  );
}
