import { api } from "@/convex/_generated/api";
import { auth, currentUser } from "@clerk/nextjs";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
  secret:
    "sk_dev_SZ_HUvYCZjhV76TwNwr_JEkQp8HR8evDqFGmLRd7iKLQqGyXovTRVGStZrLAfA2G",
});

export async function POST(request: Request) {
  const authorization = await auth();
  const user = await currentUser();

  // console.log("AUTH_INFO", {
  //   authorization,
  //   user,
  // });

  if (!authorization || !user) {
    return new Response("Unathorized", { status: 403 });
  }

  const { room } = await request.json();
  const board = await convex.query(api.board.get, { id: room });

  // console.log("AUTH_INFO", {
  //   room,
  //   board,
  //   boardOrgId: board?.orgId,
  //   userOrgId: authorization.orgId,
  // });

  if (board?.orgId !== authorization.orgId) {
    return new Response("Unathorized", { status: 403 });
  }

  const userInfo = {
    name: user.firstName || "Teamate",
    picture: user.imageUrl,
  };
  // console.log({ userInfo });

  const session = liveblocks.prepareSession(user.id, { userInfo });

  if (room) {
    session.allow(room, session.FULL_ACCESS);
  }

  const { status, body } = await session.authorize();
  // console.log({ status, body });

  return new Response(body, { status });
}
