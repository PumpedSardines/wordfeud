import { WORDFEUD_BOARD_WIDTH } from "@/consts";
import { Position } from "@/types";

/**
 * Gets the index of a position on the board.
 */
export function getIdx(pos: Position): number {
  return pos.x + pos.y * WORDFEUD_BOARD_WIDTH;
}

/**
 * Gets the position from an index on the board.
 */
export function fromIdx(idx: number): Position {
  return {
    x: idx % WORDFEUD_BOARD_WIDTH,
    y: Math.floor(idx / WORDFEUD_BOARD_WIDTH),
  };
}
