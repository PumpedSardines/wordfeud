import { useCallback, useRef, useState } from "react";
import DragAndDropBoard, {
  DragAndDropBoardProvider,
  DragAndDropBoardProviderRef,
} from "@/components/partials/DragAndDropBoard";
import Tile from "@/components/ui/Tile";
import { WORDFEUD_BOARD_WIDTH } from "@/consts";
import { Letter } from "@/types";
import { getIdx } from "@/utils/idx";
import randomLetter from "@/utils/randomLetter";

import classes from "./Game.module.scss";
import { MoveType } from "@/components/partials/DragAndDropBoard/context";
import shuffle from "@/utils/shuffle";
import { getScoreForMove } from "@/utils/scoreing";

const TILE_WIDTH = 50;

function Game() {
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

  const handleMove = useCallback(
    (move: MoveType) => {
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
    },
    [lettersOnBoard, letterOnHandMoving, lettersOnHand],
  );

  return (
    <DragAndDropBoardProvider
      ref={dndbpr}
      className={classes.container}
      letters={lettersOnBoard}
      onMove={handleMove}
    >
      <div className={classes.wrapper}>
        <div
          style={{
            width: TILE_WIDTH * WORDFEUD_BOARD_WIDTH + 14,
          }}
          className={classes.dndBoard}
        >
          <DragAndDropBoard fixedLetters={fixedLetters} />
        </div>
        <StatusBar
          onClickShuffle={() => {
            const newLettersOnHand = shuffle(lettersOnHand).map((v, i) => ({
              ...v,
              index: i,
            }));

            setLettersOnHand(newLettersOnHand);
          }}
          onClickPlay={() => {
            console.log(getScoreForMove(lettersOnBoard, fixedLetters));
          }}
        >
          <div
            style={{
              width: TILE_WIDTH * 7 + 6,
            }}
            className={classes.handContainer}
          >
            {new Array(7).fill(0).map((_, i) => {
              const curSpot = lettersOnHand.find((l) => l.index === i);

              return (
                <div
                  key={i}
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
                    letter={
                      letterOnHandMoving === i ? undefined : curSpot?.letter
                    }
                  />
                </div>
              );
            })}
          </div>
        </StatusBar>
      </div>
    </DragAndDropBoardProvider>
  );
}

type StatusBarProps = {
  children: React.ReactNode;
  onClickShuffle?: () => void;
  onClickPlay?: () => void;
};
function StatusBar(props: StatusBarProps) {
  return (
    <div
      className={classes.statusBar}
      style={{
        width: TILE_WIDTH * WORDFEUD_BOARD_WIDTH + 14 + 10,
      }}
    >
      <div className={classes.scoreBar} style={{ height: TILE_WIDTH + 10 }}>
        <p>You: 0</p>
        <p>Them: 0</p>
      </div>
      {props.children}
      <button style={{ height: TILE_WIDTH }} onClick={props.onClickShuffle}>
        <p>Shuffle</p>
      </button>
      <button
        style={{ height: TILE_WIDTH }}
        className={classes.play}
        onClick={props.onClickPlay}
      >
        <p>Play</p>
      </button>
    </div>
  );
}

export default Game;
