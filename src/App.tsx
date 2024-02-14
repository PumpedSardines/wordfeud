import { useRef, useState } from "react";
import DragAndDropBoard, {
  DragAndDropBoardProvider,
  DragAndDropBoardProviderRef,
} from "./components/partials/DragAndDropBoard";
import Tile from "./components/ui/Tile";
import { WORDFEUD_BOARD_WIDTH } from "./consts";
import { Letter } from "./types";
import { getIdx } from "./utils/idx";
import randomLetter from "./utils/randomLetter";

const TILE_WIDTH = 50;

function App() {
  const [fixedLetters, setFixedLetters] = useState<Record<number, Letter>>({
    [getIdx({ x: 6, y: 7 })]: "W",
    [getIdx({ x: 7, y: 7 })]: "E",
    [getIdx({ x: 8, y: 7 })]: "S",
    [getIdx({ x: 9, y: 7 })]: "T",

    [getIdx({ x: 9, y: 4 })]: "N",
    [getIdx({ x: 9, y: 5 })]: "O",
    [getIdx({ x: 9, y: 6 })]: "R",
    [getIdx({ x: 9, y: 7 })]: "T",
    [getIdx({ x: 9, y: 8 })]: "H",
  });

  const dndbpr = useRef<DragAndDropBoardProviderRef>(null);

  const [lettersOnHand, setLettersOnHand] = useState<
    { letter: Letter; index: number }[]
  >(new Array(7).fill(0).map((_, i) => ({ letter: randomLetter(), index: i })));
  const [lettersOnBoard, setLettersOnBoard] = useState<Record<number, Letter>>(
    {},
  );
  const [letterOnHandMoving, setLetterOnHandMoving] = useState<number | null>();

  return (
    <DragAndDropBoardProvider
      ref={dndbpr}
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        flexDirection: "column",
        backgroundColor: "var(--background-tertiary)",
      }}
      letters={lettersOnBoard}
      onMove={(move) => {
        console.log(move);
        switch (move.type) {
          case "place":
            if (letterOnHandMoving === null && move.from != null) {
              const newLetters = structuredClone(lettersOnBoard);
              delete newLetters[getIdx(move.from)];
              newLetters[getIdx(move.to)] = move.letter;
              setLettersOnBoard(newLetters);
            } else {
              setLettersOnHand((letters) =>
                letters.filter(({ index }) => index !== letterOnHandMoving),
              );
              setLetterOnHandMoving(null);

              lettersOnBoard[getIdx(move.to)] = move.letter;
            }
            break;
          case "swap":
            if (letterOnHandMoving === null) {
              const newLetters = structuredClone(lettersOnBoard);
              const tmp = newLetters[getIdx(move.a)];
              newLetters[getIdx(move.a)] = newLetters[getIdx(move.b)];
              newLetters[getIdx(move.b)] = tmp;
              setLettersOnBoard(newLetters);
            }
            setLetterOnHandMoving(null);
            break;

          case "oob":
            if (letterOnHandMoving === null && move.from != null) {
              const freeIndex = new Array(7)
                .fill(0)
                .map((_, i) => i)
                .findIndex((i) => lettersOnHand.every((l) => l.index !== i));

              setLettersOnHand((letters) => [
                ...letters,
                { letter: move.letter, index: freeIndex },
              ]);

              const newLetters = structuredClone(lettersOnBoard);
              delete newLetters[getIdx(move.from)];
              setLettersOnBoard(newLetters);
            }
            setLetterOnHandMoving(null);
            break;

          default:
            setLetterOnHandMoving(null);
            break;
        }
      }}
    >
      <div
        style={{
          width: TILE_WIDTH * WORDFEUD_BOARD_WIDTH + 14,
          border: "solid 5px var(--background)",
          borderRadius: 5,
        }}
      >
        <DragAndDropBoard fixedLetters={fixedLetters} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 1,
          width: TILE_WIDTH * 7 + 6,
          border: "solid 5px var(--background)",
          borderRadius: 5,
          backgroundColor: "var(--background)",
        }}
      >
        {new Array(7).fill(0).map((_, i) => {
          const curSpot = lettersOnHand.find((l) => l.index === i);

          return (
            <div
              style={{
                width: TILE_WIDTH,
              }}
              onMouseDown={() => {
                if (dndbpr.current && curSpot) {
                  const { letter, index } = curSpot;

                  setLetterOnHandMoving(index);
                  dndbpr.current.setMove(letter, null);
                }
              }}
            >
              <Tile
                key={i}
                letter={letterOnHandMoving === i ? undefined : curSpot?.letter}
              />
            </div>
          );
        })}
      </div>
    </DragAndDropBoardProvider>
  );
}

export default App;
