import { getPlayer } from "../apiUtils";
import addData from "../firebase/addData";

// Save subscription
export async function POST(request: Request) {
  const player = await getPlayer();
  const { subscription, id } = await request.json();

  await addData("subscriptions", id, {
    subscription: subscription,
    playerId: player.id,
  });

  return Response.json({ message: "Subscription saved!" });
}
