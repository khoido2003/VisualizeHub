"use client";

import Info from "./info";
import Participants from "./participants";
import ToolBar from "./toolbar";

export interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  return (
    <main className="relative h-full w-full touch-none bg-neutral-100">
      <Info />
      <Participants />
      <ToolBar />
    </main>
  );
};
