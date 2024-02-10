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
import { SelectionTools } from "./selection-tool";

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

  const unselectedLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

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

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasStateProps.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: point.x - canvasStateProps.current.x,
        y: point.y - canvasStateProps.current.y,
      };

      const liveLayers = storage.get("layers");

      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);

        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }

      setCanvasStateProps({ mode: CanvasMode.Translating, current: point });
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

      if (canvasStateProps.mode === CanvasMode.Translating) {
        translateSelectedLayers(current);
      }

      if (canvasStateProps.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      }

      setMyPresence({ cursor: current });
    },
    [camera, canvasStateProps, resizeSelectedLayer, translateSelectedLayers],
  );

  // --------------------------------------------

  // Pointer leave
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  //--------------------------------------------

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasStateProps.mode === CanvasMode.Inserting) {
        return;
      }
      // TODO: Add drawing state
      setCanvasStateProps({ mode: CanvasMode.Pressing, origin: point });
    },
    [camera, canvasStateProps.mode, setCanvasStateProps],
  );

  // ---------------------------------------------

  // Pointer up
  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (
        canvasStateProps.mode === CanvasMode.None ||
        canvasStateProps.mode === CanvasMode.Pressing
      ) {
        unselectedLayers();
        setCanvasStateProps({ mode: CanvasMode.None });
      } else if (canvasStateProps.mode === CanvasMode.Inserting) {
        insertLayer(canvasStateProps.layerType, point);
      } else {
        setCanvasStateProps({ mode: CanvasMode.None });
      }

      history.resume();
    },
    [history, canvasStateProps, camera, insertLayer, unselectedLayers],
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

      <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />

      <svg
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerUp={onPointerUp}
        onPointerDown={onPointerDown}
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
