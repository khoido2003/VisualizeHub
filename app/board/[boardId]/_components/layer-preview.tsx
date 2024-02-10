"use client";

import { useStorage } from "@/liveblocks.config";
import { LayerType } from "@/types/canvas";
import { memo } from "react";
import { Rectangle } from "./rectangle";

interface LayerPreviewProps {
  id: string;
  onLayerPointerdown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
}

export const LayerPreview = memo(
  ({ id, onLayerPointerdown, selectionColor }: LayerPreviewProps) => {
    const layer = useStorage((root) => root.layers.get(id));

    if (!layer || typeof layer.type === "undefined") {
      return null;
    }

    switch (layer.type) {
      case LayerType.Rectangle:
        return (
          <Rectangle
            id={id}
            layer={layer}
            onPointerDown={onLayerPointerdown}
            selectionColor={selectionColor}
          />
        );
      default:
        console.warn("Unknown layer type: " + layer.type);
        return null;
    }
  },
);

LayerPreview.displayName = "LayerPreview";
