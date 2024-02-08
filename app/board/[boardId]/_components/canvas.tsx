import Info from "./info";
import Participants from "./participants";
import ToolBar from "./toolbar";
import { useSelf } from "@/liveblocks.config";

export interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  return (
    <main className="relative h-full w-full touch-none bg-neutral-100">
      <Info boardId={boardId} />
      <Participants />
      <ToolBar />
    </main>
  );
};
