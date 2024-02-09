"use client";

import { pointerEventToCanvasPoint } from "@/lib/utils";
import { Camera, CanvasMode, CanvasState } from "@/types/canvas";

import Info from "./info";
import Participants from "./participants";
import ToolBar from "./toolbar";

import { useCallback, useState } from "react";
import {
  useHistory,
  useMutation,
  useCanUndo,
  useCanRedo,
} from "@/liveblocks.config";
import { CursorPresence } from "./cursor-presence";

export interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  const [canvasStateProps, setCanvasStateProps] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const onWheel = useCallback((e: React.WheelEvent) => {
    // console.log("Wheel: ", {
    //   x: e.deltaX,
    //   y: e.deltaY,
    // });

    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();

      const current = pointerEventToCanvasPoint(e, camera);

      // console.log("current: ", current);

      setMyPresence({ cursor: current });
    },
    [],
  );

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

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

      <svg
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <g>
          <CursorPresence />
        </g>
      </svg>
    </main>
  );
};
