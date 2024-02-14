import searchWord from "@/lib/words";
import { Letter } from "@/types";
import { fromIdx, getIdx } from "./idx";

const letterScoreMap: Record<Letter, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

export function getLetterScore(letter: Letter): number {
  return letterScoreMap[letter];
}

export const enum BoardScoreError {
  NoLettersPlaced = 1,
  FirstMoveMustCoverCenter = 2,
  WordsNotConnected = 3,
  WordsNotInDictionary = 4,
}

export function getScoreForMove(
  letters: Record<number, Letter>,
  fixedLetters: Record<number, Letter>,
):
  | { type: "score"; score: number; words: string[] }
  | { type: "error"; reason: BoardScoreError; wordsAffected?: string[] } {
  if (Object.values(letters).length === 0) {
    return { type: "error", reason: BoardScoreError.NoLettersPlaced };
  }

  if (
    Object.values(fixedLetters).length === 0 &&
    getIdx({ x: 7, y: 7 }) in letters
  ) {
    return { type: "error", reason: BoardScoreError.FirstMoveMustCoverCenter };
  }

  const seenVertical = new Set<number>();
  const seenHorizontal = new Set<number>();
  const hasBeenUsed = new Set<number>();

  const words: {
    word: { letter: Letter; multiplier: number }[];
    hasGoneThroughFixedLetter: boolean;
    multiplier: number;
  }[] = [];

  for (const type of ["vertical", "horizontal"]) {
    for (const idx of Object.keys(letters).map(Number)) {
      if (type === "vertical" && seenVertical.has(idx)) {
        continue;
      }
      if (type === "horizontal" && seenHorizontal.has(idx)) {
        continue;
      }

      const pos = fromIdx(idx);
      let startPos = type === "vertical" ? pos.y : pos.x;

      while (startX > 0) {
        const currIdx = getIdx({ x: startX - 1, y: pos.y });
        if (currIdx in fixedLetters || currIdx in letters) {
          startX--;
        } else {
          break;
        }
      }

      let currentWord: { letter: Letter; multiplier: 1 }[] = [];
      let wordMultiplier = 1;
      let hasGoneThroughFixedLetter = false;
      const currentHasBeenUsed = [];

      for (let i = startX; i < 15; i++) {
        const curIdx = getIdx({ x: i, y: pos.y });
        const letter = letters[curIdx];
        const fixedLetter = fixedLetters[curIdx];

        if (letter && fixedLetter) {
          throw new Error("BOTH LETTER AND FIXED LETTER OCCUPIED");
        }

        if (letter) {
          // TODO: Add letter multiplier
          // TODO: Add word multiplier
          currentWord.push({ letter, multiplier: 1 });
          seenHorizontal.add(curIdx);
          currentHasBeenUsed.push(curIdx);
          continue;
        }

        if (fixedLetter) {
          currentWord.push({ letter: fixedLetter, multiplier: 1 });
          hasGoneThroughFixedLetter = true;
          continue;
        }

        break;
      }

      if (currentWord.length <= 1) {
        continue;
      }

      currentHasBeenUsed.forEach((v) => hasBeenUsed.add(v));

      words.push({
        word: currentWord,
        hasGoneThroughFixedLetter,
        multiplier: wordMultiplier,
      });
    }
  }

  if (
    Object.keys(letters)
      .map(Number)
      .some((v) => !hasBeenUsed.has(v))
  ) {
    return { type: "error", reason: BoardScoreError.WordsNotConnected };
  }

  if (words.some((word) => !word.hasGoneThroughFixedLetter)) {
    return { type: "error", reason: BoardScoreError.WordsNotConnected };
  }

  if (
    words
      .map((word) => word.word.map((l) => l.letter).join(""))
      .map((word) => {
        console.log(word);
        return word;
      })
      .some((word) => !searchWord(word))
  ) {
    return { type: "error", reason: BoardScoreError.WordsNotInDictionary };
  }

  return {
    type: "score",
    score: words
      .map(
        (v) =>
          v.word
            .map((l) => getLetterScore(l.letter) * l.multiplier)
            .reduce((a, b) => a + b) * v.multiplier,
      )
      .reduce((a, b) => a + b),
    words: words.map((word) => word.word.map((l) => l.letter).join("")),
  };
}
