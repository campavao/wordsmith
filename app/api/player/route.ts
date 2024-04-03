import webpush from "web-push";

import { getPlayer, sendNotification } from "../apiUtils";

webpush.setVapidDetails(
  "mailto:cam9548@gmail.com",
  process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? "",
  process.env.WEB_PUSH_PRIVATE_KEY ?? ""
);

/** Only used as a way to test notifications rn */
export async function GET(_request: Request) {
  const player = await getPlayer();
  await sendNotification(player.id, "This is a test");

  return Response.json({
    message: "Notifications sent.",
  });
}
