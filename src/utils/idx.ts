import { WORDFEUD_BOARD_WIDTH } from "@/consts";
import { Position } from "@/types";

/**
 * Gets the index of a position on the board.
 */
export function getIdx(pos: Position): number {
  return pos.x + pos.y * WORDFEUD_BOARD_WIDTH;
}
