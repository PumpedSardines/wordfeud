import { useCallback, useEffect, useRef, useState } from "react";
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
import { BoardScoreError, getScoreForMove } from "@/utils/scoreing";

const TILE_WIDTH = 45;

type GameProps = {
  id: string;
  player: "1" | "2";
};

function Game(props: GameProps) {
  const [fixedLetters, setFixedLetters] = useState<Record<number, Letter>>({});

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dndbpr = useRef<DragAndDropBoardProviderRef>(null);

  const [lettersOnHand, setLettersOnHand] = useState<
    { letter: Letter; index: number }[]
  >(new Array(7).fill(0).map((_, i) => ({ letter: randomLetter(), index: i })));

  const [lettersOnBoard, setLettersOnBoard] = useState<Record<number, Letter>>(
    {},
  );
  const [letterOnHandMoving, setLetterOnHandMoving] = useState<number | null>();

  useEffect(() => {
    setError(null);
  }, [lettersOnBoard, lettersOnHand]);

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
        <p
          style={{
            width: TILE_WIDTH * WORDFEUD_BOARD_WIDTH + 14,
          }}
          className={classes.successMessage}
        >
          {successMessage}
        </p>
        <div
          style={{
            width: TILE_WIDTH * WORDFEUD_BOARD_WIDTH + 14,
          }}
          className={classes.dndBoard}
        >
          <DragAndDropBoard fixedLetters={fixedLetters} />
        </div>
        <StatusBar
          error={error}
          onClickShuffle={() => {
            const newLettersOnHand = shuffle(lettersOnHand).map((v, i) => ({
              ...v,
              index: i,
            }));

            setLettersOnHand(newLettersOnHand);
          }}
          onClickPlay={() => {
            const res = getScoreForMove(lettersOnBoard, fixedLetters);
            if (res.type === "error") {
              switch (res.reason) {
                case BoardScoreError.NoLettersPlaced:
                  setError("You need to place some letters");
                  break;
                case BoardScoreError.FirstMoveMustCoverCenter:
                  setError("First move must cover the center tile");
                  break;
                case BoardScoreError.WordsNotConnected:
                  setError("Words must be connected to words placed before");
                  break;
                case BoardScoreError.WordsNotInDictionary:
                  setError(`"${res.wordsAffected?.[0]}" is not a valid word`);
                  break;
                case BoardScoreError.LettersNotOnSameLine:
                  setError("Letters must be placed on the same line");
                  break;
              }
              return;
            }
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
        <p
          style={{
            width: TILE_WIDTH * WORDFEUD_BOARD_WIDTH + 14,
          }}
          className={classes.errorMessage}
        >
          {error}
        </p>
      </div>
    </DragAndDropBoardProvider>
  );
}

type StatusBarProps = {
  children: React.ReactNode;
  error: string | null;
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
        disabled={props.error != null}
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
