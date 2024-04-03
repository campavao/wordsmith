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
  const result = useSession();
  const { data: session, update } = result;
  const [league, setLeague] = useState<FriendLeague>();
  const [isFetched, setIsFetched] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchLeague = useCallback(async () => {
    if (!session || !isPlayer(session?.user)) {
      // update the session for some reason
      await update();
      return;
    }

    const { data, message, error } = await getGame({
      leagueId: leagueId,
    });

    if (error) {
      setError(message);
      console.error(error);
    } else {
      setLeague(data);
      setIsFetched(true);
    }
  }, [leagueId, session, update]);

  useEffect(() => {
    if (!isFetched) {
      (async () => {
        await fetchLeague();
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
