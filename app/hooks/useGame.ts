import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { FriendLeague, isPlayer, Round } from "../types/FriendLeague";
import { getGame } from "../utils/leagueUtils";

interface useGameProps {
  leagueId: string;
  roundId: string;
}

interface useGameState {
  league?: FriendLeague;
  round?: Round;
  isLoading: boolean;
  error: string;
}

export function useGame({ leagueId, roundId }: useGameProps): useGameState {
  const { data: session } = useSession();
  const [league, setLeague] = useState<FriendLeague>();
  const [isFetched, setIsFetched] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchLeague = useCallback(async () => {
    if (!session || !isPlayer(session?.user)) {
      setIsFetched(true);
      return;
    }
    const { data, message, error } = await getGame({
      leagueId: leagueId,
      player: session.user,
    });

    if (error) {
      setError(message);
    } else {
      setLeague(data);
    }
  }, [leagueId, session]);

  useEffect(() => {
    if (!isFetched) {
      (async () => {
        await fetchLeague();
        setIsFetched(true);
      })();
    }
  }, [fetchLeague, isFetched]);

  const round = useMemo(() => {
    if (league && roundId) {
      return league.rounds.find((round) => round.id === roundId);
    }
  }, [league, roundId]);

  return {
    league,
    round,
    error,
    isLoading: !isFetched,
  };
}
