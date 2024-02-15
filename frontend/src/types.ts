export type Letter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export type Player = "1" | "2";
export type Nullable<T> = T | null | undefined;
export type Position = { x: number; y: number };
export const enum TileType {
  TripleWord = 1,
  DoubleWord = 2,
  TripleLetter = 3,
  DoubleLetter = 4,
}
