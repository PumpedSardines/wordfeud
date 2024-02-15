import { MoveType } from "@/components/partials/DragAndDropBoard/context";
import { Letter } from "@/types";
import { getIdx } from "@/utils/idx";
import { create } from "zustand";

type LettersOnBoard = Record<number, Letter>;
type LettersOnHand = { letter: Letter; index: number }[];

function intoLettersOnHand(letters: Letter[]): LettersOnHand {
  return letters.map((l, i) => ({
    letter: l,
    index: i,
  }));
}

type LetterMoveStoreState = {
  board: LettersOnBoard;
  hand: LettersOnHand;
  handMoving: number | null;
  setBoard: (board: LettersOnBoard) => void;
  setHand: (hand: Letter[]) => void;
  setHandMoving: (hm: number | null) => void;
  handleMove: (move: MoveType) => void;
};

export const useLetterMoveStore = create<LetterMoveStoreState>((set) => ({
  board: {},
  hand: intoLettersOnHand(new Array(7).fill("A")),
  handMoving: null,
  setBoard: (v) => set(() => ({ board: v })),
  setHand: (v) => set(() => ({ hand: intoLettersOnHand(v) })),
  setHandMoving: (hm) => set(() => ({ handMoving: hm })),
  handleMove: (move: MoveType) =>
    set((state) => {
      switch (move.type) {
        case "place":
          const newBoard = structuredClone(state.board);

          if (state.handMoving === null && move.from != null) {
            delete newBoard[getIdx(move.from)];
            newBoard[getIdx(move.to)] = move.letter;
            return { board: newBoard };
          } else {
            console.log(state);
            newBoard[getIdx(move.to)] = move.letter;
            return {
              hand: state.hand.filter(
                ({ index }) => index !== state.handMoving,
              ),
              handMoving: null,
              board: newBoard,
            };
          }
        case "swap":
          if (state.handMoving == null) {
            const newBoard = structuredClone(state.board);
            const tmp = newBoard[getIdx(move.a)];
            newBoard[getIdx(move.a)] = newBoard[getIdx(move.b)];
            newBoard[getIdx(move.b)] = tmp;
            return {
              handMoving: null,
              board: newBoard,
            };
          } else {
            return {
              handMoving: null,
            };
          }
        case "oob":
          if (state.handMoving == null && move.from != null) {
            const freeIndex = new Array(7)
              .fill(0)
              .map((_, i) => i)
              .findIndex((i) => state.hand.every((l) => l.index !== i));

            const newHand = [
              ...state.hand,
              { letter: move.letter, index: freeIndex },
            ];
            const newBoard = structuredClone(state.board);
            delete newBoard[getIdx(move.from)];
            return {
              hand: newHand,
              board: newBoard,
            };
          } else {
            return {
              handMoving: null,
            };
          }
      }

      return {
        handMoving: null,
      };
    }),
}));
