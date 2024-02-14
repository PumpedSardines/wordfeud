import { Letter, Nullable, Position } from "@/types";
import React from "react";

export type MoveType =
  | { type: "swap"; a: Position; b: Position }
  | { type: "place"; letter: Letter; to: Position; from: Nullable<Position> }
  | { type: "oob"; letter: Letter; from: Nullable<Position> }
  | { type: "invalid" };

export type Move = {
  from: Nullable<Position>;
  letter: Letter;
};

export type DragAndDropBoardContextData = {
  enabled: boolean;

  tileWidth: number;
  setTileWidth: (width: number) => void;

  isHoveringBoard: boolean;
  setIsHoveringBoard: (isHovering: boolean) => void;

  move: Nullable<Move>;
  setMove: (move: Nullable<Move>) => void;

  letters: Record<number, Letter>;

  onMove: (move: MoveType) => void;
};

export const DragAndDropContext =
  React.createContext<DragAndDropBoardContextData>(
    null as any as DragAndDropBoardContextData,
  );
