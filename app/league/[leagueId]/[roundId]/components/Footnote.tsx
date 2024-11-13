import { FriendLeague, Player, Round } from "@/app/types/FriendLeague";
import { useMemo } from "react";
import { RemoveUser } from "../../RemoveUser";

interface Footnote {
  round: Round;
  league: FriendLeague;
  action: string;
  isVoting: boolean;
  isOwner?: boolean;
}

type PlayerMap = Record<string, Player>;

export function Footnote({
  round,
  league,
  action,
  isVoting,
  isOwner,
}: Footnote) {
  const playerMap = useMemo<PlayerMap>(
    () =>
      league.players.reduce(
        (playerObj, currPlayer) => ({
          ...playerObj,
          [currPlayer.id]: currPlayer,
        }),
        {}
      ),
    [league]
  );

  const list = isVoting ? round.votes : round.submissions;

  const waitingOnPlayers = useMemo(() => {
    const doneIds = list.map(({ playerId }) => playerId);
    return league.players.filter(
      ({ id }) => list.length === 0 || !doneIds.includes(id)
    );
  }, [league.players, list]);

  return (
    <div className='min-h-[150px] background:white flex justify-center'>
      <ol className='flex flex-col gap-2 text-sm list-decimal border-t w-full max-w-lg pt-2 mt-4'>
        {list.map(({ playerId }) => {
          const player = playerMap[playerId];
          return (
            <li
              className={`flex flex-center gap-2 ${
                player.isRemoved || player.isSkipped ? "line-through" : ""
              }`}
              key={playerId}
            >
              {player.name} has {action}{" "}
              {isOwner && !player.isRemoved && !player.isSkipped && (
                <RemoveUser
                  playerEmail={player.email}
                  leagueId={league.leagueId}
                  type='skip'
                />
              )}
            </li>
          );
        })}
        {waitingOnPlayers.map(({ name, id, isRemoved, isSkipped, email }) => (
          <li
            className={`flex flex-center gap-2 ${
              isRemoved || isSkipped ? "line-through" : ""
            }`}
            key={id}
          >
            {name} has not {action}{" "}
            {isOwner && !isRemoved && !isSkipped && (
              <RemoveUser
                playerEmail={email}
                leagueId={league.leagueId}
                type='skip'
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
