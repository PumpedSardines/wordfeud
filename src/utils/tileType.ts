import {
  DOUBLE_LETTER_POSITIONS,
  DOUBLE_WORD_POSITIONS,
  TRIPLE_LETTER_POSITIONS,
  TRIPLE_WORD_POSITIONS,
} from "@/consts";
import { Nullable, Position, TileType } from "@/types";
import { getIdx } from "./idx";

export function getTileType(pos: Position): Nullable<TileType> {
  const idx = getIdx(pos);

  if (TRIPLE_WORD_POSITIONS.has(idx)) {
    return TileType.TripleWord;
  }

  if (DOUBLE_WORD_POSITIONS.has(idx)) {
    return TileType.DoubleWord;
  }

  if (TRIPLE_LETTER_POSITIONS.has(idx)) {
    return TileType.TripleLetter;
  }

  if (DOUBLE_LETTER_POSITIONS.has(idx)) {
    return TileType.DoubleLetter;
  }

  return null;
}
