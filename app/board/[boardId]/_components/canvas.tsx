"use client";
import { nanoid } from "nanoid";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  colorToCss,
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer,
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
  useSelf,
} from "@/liveblocks.config";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tool";
import { Path } from "./path";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { useDeleteLayers } from "@/hooks/use-delete-layer";

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
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);

  const [canvasStateProps, setCanvasStateProps] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });

  // Prevent scrolling when other user has larger screen size than yours
  useDisableScrollBounce();

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

  //---------------------------------------

  // Update selection net

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const layers = storage.get("layers").toImmutable();
      setCanvasStateProps({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });

      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        origin,
        current,
      );

      setMyPresence({ selection: ids });
    },
    [layerIds],
  );

  // --------------------------------------

  // Multiple selection
  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setCanvasStateProps({
        mode: CanvasMode.SelectionNet,
        current,
        origin,
      });
    }
  }, []);

  //--------------------------------------

  //Drawing
  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor],
  );

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;

      if (
        canvasStateProps.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      ) {
        return;
      }

      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft.length === 1 &&
          pencilDraft[0][0] === point.x &&
          pencilDraft[0][1] === point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasStateProps.mode],
  );

  const insertPath = useMutation(
    ({ self, storage, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const { pencilDraft } = self.presence;
      console.log("Insert");
      if (
        pencilDraft === null ||
        pencilDraft.length < 2 ||
        liveLayers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null });
        return;
      }

      const id = nanoid();
      liveLayers.set(
        id,
        new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor)),
      );

      const liveLayerIds = storage.get("layerIds");
      liveLayerIds.push(id);

      setMyPresence({ pencilDraft: null });
      setCanvasStateProps({ mode: CanvasMode.Pencil });
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

      if (canvasStateProps.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasStateProps.origin);
      }

      if (canvasStateProps.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasStateProps.origin);
      }

      if (canvasStateProps.mode === CanvasMode.Translating) {
        translateSelectedLayers(current);
      }

      if (canvasStateProps.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      }

      if (canvasStateProps.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      }

      setMyPresence({ cursor: current });
    },
    [
      camera,
      canvasStateProps,
      resizeSelectedLayer,
      translateSelectedLayers,
      startMultiSelection,
      updateSelectionNet,
      continueDrawing,
    ],
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
      if (canvasStateProps.mode === CanvasMode.Pencil) {
        console.log("Drawing");
        startDrawing(point, e.pressure);
        return;
      }

      setCanvasStateProps({ mode: CanvasMode.Pressing, origin: point });
    },
    [camera, canvasStateProps.mode, setCanvasStateProps, startDrawing],
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
      } else if (canvasStateProps.mode === CanvasMode.Pencil) {
        insertPath();
      } else if (canvasStateProps.mode === CanvasMode.Inserting) {
        insertLayer(canvasStateProps.layerType, point);
      } else {
        setCanvasStateProps({ mode: CanvasMode.None });
      }

      history.resume();
    },
    [
      setCanvasStateProps,
      history,
      canvasStateProps,
      camera,
      insertLayer,
      unselectedLayers,
      insertPath,
    ],
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

  // Handle when user use keyboard to undo an action
  const deleteLayers = useDeleteLayers();
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      switch (e.key) {
        // case "Backspace":
        //   deleteLayers();
        //   break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            history.undo();
            break;
          }
        case "y":
          if (e.ctrlKey || e.metaKey) {
            history.redo();
            break;
          }
      }
    }

    document.addEventListener("keydown", onKeydown);

    return () => {
      document.removeEventListener("keydown", onKeydown);
    };
  }, [deleteLayers, history]);

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

          {canvasStateProps.mode === CanvasMode.SelectionNet &&
            canvasStateProps.current !== null && (
              <rect
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                x={Math.min(
                  canvasStateProps.origin.x,
                  canvasStateProps.current!.x,
                )}
                y={Math.min(
                  canvasStateProps.origin.y,
                  canvasStateProps.current!.y,
                )}
                width={Math.abs(
                  canvasStateProps.origin.x - canvasStateProps.current!.x,
                )}
                height={Math.abs(
                  canvasStateProps.origin.y - canvasStateProps.current!.y,
                )}
              ></rect>
            )}
          <CursorPresence />

          {pencilDraft !== null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCss(lastUsedColor)}
              x={0}
              y={0}
            />
          )}
        </g>
      </svg>
    </main>
  );
};
