import { VotingStepClient } from "./VotingStep";
import { SharedStep } from "./WritingStepWrapper";

export async function VotingStep({ roundId, leagueId }: SharedStep) {
  const onSubmit = async () => {
    return;
  };

  return <VotingStepClient onSubmit={onSubmit} />;
}
