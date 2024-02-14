import {
  DOUBLE_LETTER_POSITIONS,
  DOUBLE_WORD_POSITIONS,
  TRIPLE_LETTER_POSITIONS,
  TRIPLE_WORD_POSITIONS,
} from "@/consts";
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
  LettersNotOnSameLine = 5,
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
    Object.values(letters).length === 0 &&
    getIdx({ x: 7, y: 7 }) in letters
  ) {
    return { type: "error", reason: BoardScoreError.FirstMoveMustCoverCenter };
  }

  const seenVertical = new Set<number>();
  const seenHorizontal = new Set<number>();
  const hasBeenUsed = new Set<number>();
  let someWordHasAllLetters = false;

  const words: {
    word: { letter: Letter; multiplier: number }[];
    multiplier: number;
  }[] = [];

  for (const type of ["vertical", "horizontal"]) {
    const isVertical = type === "vertical";

    for (const idx of Object.keys(letters).map(Number)) {
      if (isVertical && seenVertical.has(idx)) {
        continue;
      }
      if (!isVertical && seenHorizontal.has(idx)) {
        continue;
      }

      const pos = fromIdx(idx);
      let startPos = isVertical ? pos.y : pos.x;

      while (startPos > 0) {
        const currIdx = isVertical
          ? getIdx({ x: pos.x, y: startPos - 1 })
          : getIdx({ x: startPos - 1, y: pos.y });

        if (currIdx in fixedLetters || currIdx in letters) {
          startPos--;
        } else {
          break;
        }
      }

      let currentWord: { letter: Letter; multiplier: number }[] = [];
      let wordMultiplier = 1;
      let hasGoneThroughFixedLetter = false;
      const currentHasBeenUsed = [];

      for (let i = startPos; i < 15; i++) {
        const curIdx = isVertical
          ? getIdx({ x: pos.x, y: i })
          : getIdx({ x: i, y: pos.y });
        const letter = letters[curIdx];
        const fixedLetter = fixedLetters[curIdx];

        if (letter && fixedLetter) {
          throw new Error("BOTH LETTER AND FIXED LETTER OCCUPIED");
        }

        if (letter) {
          if (TRIPLE_WORD_POSITIONS.has(curIdx)) {
            wordMultiplier *= 3;
          }

          if (DOUBLE_WORD_POSITIONS.has(curIdx)) {
            wordMultiplier *= 2;
          }

          currentWord.push({
            letter,
            multiplier: (() => {
              if (TRIPLE_LETTER_POSITIONS.has(curIdx)) {
                return 3;
              } else if (DOUBLE_LETTER_POSITIONS.has(curIdx)) {
                return 2;
              }

              return 1;
            })(),
          });
          if (isVertical) {
            seenVertical.add(curIdx);
          } else {
            seenHorizontal.add(curIdx);
          }
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

      if (hasGoneThroughFixedLetter) {
        currentHasBeenUsed.forEach((v) => hasBeenUsed.add(v));
      }

      const idxsInWord = currentHasBeenUsed.filter(
        (idx) => !(idx in fixedLetters),
      );

      if (
        Object.keys(letters)
          .map(Number)
          .every((v) => idxsInWord.includes(v))
      ) {
        someWordHasAllLetters = true;
      }

      words.push({
        word: currentWord,
        multiplier: wordMultiplier,
      });
    }
  }

  if (
    Object.keys(letters)
      .map(Number)
      .some((v) => !hasBeenUsed.has(v)) &&
    Object.keys(fixedLetters).length !== 0
  ) {
    return { type: "error", reason: BoardScoreError.WordsNotConnected };
  }

  if (!someWordHasAllLetters) {
    return { type: "error", reason: BoardScoreError.LettersNotOnSameLine };
  }

  if (
    words
      .map((word) => word.word.map((l) => l.letter).join(""))
      .some((word) => !searchWord(word))
  ) {
    return {
      type: "error",
      reason: BoardScoreError.WordsNotInDictionary,
      wordsAffected: words
        .map((word) => word.word.map((l) => l.letter).join(""))
        .filter((word) => !searchWord(word)),
    };
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
