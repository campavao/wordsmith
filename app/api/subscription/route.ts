import { getPlayer } from "../apiUtils";
import addData from "../firebase/addData";
import { v4 as uuid } from "uuid";

// Save subscription
export async function POST(request: Request) {
  const player = await getPlayer();
  const subscription = await request.json();
  const subscriptionId = uuid();

  await addData("subscriptions", subscriptionId, {
    subscription: subscription,
    playerId: player.id,
  });

  return Response.json({ message: "Subscription saved!" });
}
