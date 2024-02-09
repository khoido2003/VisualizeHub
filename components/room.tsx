"use client";

import { ReactNode } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "@/liveblocks.config";
import { Loading } from "@/app/board/[boardId]/_components/loading";

interface RoomProps {
  children: ReactNode;
  roomId: string;
  fallback: NonNullable<ReactNode> | null;
}

export const Room = ({ children, roomId }: RoomProps) => {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
      }}
    >
      <ClientSideSuspense fallback={<Loading />}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
};
