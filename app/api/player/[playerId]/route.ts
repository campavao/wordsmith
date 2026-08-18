import getDocument from "../../firebase/getData";

// Get player
export async function GET(_request: Request, props: { params: Promise<{ playerId: string }> }) {
  const params = await props.params;
  // Your server-side logic here
  console.log("getting player");
  const player = await getDocument("users", params.playerId);
  const playerData = player.data();

  return Response.json({
    message: "getting player",
    data: playerData,
  });
}
