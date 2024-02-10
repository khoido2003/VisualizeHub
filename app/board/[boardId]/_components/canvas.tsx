"use client";
import { nanoid } from "nanoid";
import { useCallback, useMemo, useState } from "react";

import {
  connectionIdToColor,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";
import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  LayerType,
  Point,
  Side,
  XYWH,
} from "@/types/canvas";

import Info from "./info";
import Participants from "./participants";
import ToolBar from "./toolbar";
import { CursorPresence } from "./cursor-presence";

import {
  useHistory,
  useMutation,
  useCanUndo,
  useCanRedo,
  useStorage,
  useOthersMapped,
} from "@/liveblocks.config";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";

///////////////////////////////////////////////////////////////

export interface CanvasProps {
  boardId: string;
}

///////////////////////////////////////////////////////////////

const MAX_LAYERS = 100;

///////////////////////////////////////////////////////////

export const Canvas = ({ boardId }: CanvasProps) => {
  // -------------------------------

  const layerIds = useStorage((root) => root.layerIds);

  const [canvasStateProps, setCanvasStateProps] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 255,
    g: 255,
    b: 255,
  });

  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // ----------------------------------------

  // INSERT NEW LAYER
  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note,
      position: Point,
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }

      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();

      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasStateProps({ mode: CanvasMode.None });
    },
    [lastUsedColor],
  );

  //--------------------------------------------
  // RESIZE
  const onResizeHanldePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setCanvasStateProps({
        mode: CanvasMode.Resizing,
        corner,
        initialBounds,
      });
    },
    [history],
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasStateProps.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasStateProps.initialBounds,
        canvasStateProps.corner,
        point,
      );

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(self.presence.selection[0]);

      if (layer) {
        layer.update(bounds);
      }
    },
    [canvasStateProps],
  );

  // -----------------------------------------

  // OnWheel events
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  // -----------------------------------------

  // Pointer move
  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();

      const current = pointerEventToCanvasPoint(e, camera);

      if (canvasStateProps.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      }

      setMyPresence({ cursor: current });
    },
    [camera, canvasStateProps, resizeSelectedLayer],
  );

  // --------------------------------------------

  // Pointer leave
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  // ---------------------------------------------

  // Pointer up
  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasStateProps.mode === CanvasMode.Inserting) {
        // console.log("Up: ", {
        //   point,
        //   mode: canvasStateProps.mode,
        //   layerType: canvasStateProps.layerType,
        // });

        insertLayer(canvasStateProps.layerType, point);
      } else {
        setCanvasStateProps({ mode: CanvasMode.None });
      }

      history.resume();
    },
    [history, canvasStateProps, camera, insertLayer],
  );

  // ----------------------------

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasStateProps.mode === CanvasMode.Pencil ||
        canvasStateProps.mode === CanvasMode.Inserting
      ) {
        return;
      }

      history.pause();
      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }

      setCanvasStateProps({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasStateProps, camera, history, canvasStateProps.mode],
  );

  //--------------------------------

  const selections = useOthersMapped((other) => other.presence.selection);

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {};

    for (const user of selections) {
      const [connectionId, selection] = user;

      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
      }
    }

    return layerIdsToColorSelection;
  }, [selections]);

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
        onPointerUp={onPointerUp}
      >
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}
        >
          {layerIds.map((layerId) => {
            return (
              <LayerPreview
                key={layerId}
                id={layerId}
                onLayerPointerDown={onLayerPointerDown}
                selectionColor={layerIdsToColorSelection[layerId]}
              />
            );
          })}

          <SelectionBox onResizeHandlePointerDown={onResizeHanldePointerDown} />

          <CursorPresence />
        </g>
      </svg>
    </main>
  );
};
