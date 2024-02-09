"use client";

import { CanvasMode, CanvasState } from "@/types/canvas";

import Info from "./info";
import Participants from "./participants";
import ToolBar from "./toolbar";

import { useState } from "react";
import {
  useHistory,
  useSelf,
  useCanUndo,
  useCanRedo,
} from "@/liveblocks.config";

export interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  const [canvasStateProps, setCanvasStateProps] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return (
    <main className="relative h-full w-full touch-none bg-neutral-100">
      <Info boardId={boardId} />
      <Participants />
      <ToolBar
        canvasState={canvasStateProps}
        setCanvasState={setCanvasStateProps}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo}
        redo={history.redo}
      />
    </main>
  );
};
