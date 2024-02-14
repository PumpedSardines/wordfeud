import { useCallback, useEffect, useRef, useState } from "react";
import DragAndDropBoard, {
  DragAndDropBoardProvider,
  DragAndDropBoardProviderRef,
} from "@/components/partials/DragAndDropBoard";
import Tile from "@/components/ui/Tile";
import { API_URL, WORDFEUD_BOARD_WIDTH } from "@/consts";
import { Letter } from "@/types";
import { getIdx } from "@/utils/idx";
import randomLetter from "@/utils/randomLetter";

import classes from "./Game.module.scss";
import { MoveType } from "@/components/partials/DragAndDropBoard/context";
import shuffle from "@/utils/shuffle";
import { BoardScoreError, getScoreForMove } from "@/utils/scoreing";
import { useQuery } from "@tanstack/react-query";
import getApi from "@/api";
import ErrorPage from "../Error";
import { io } from "socket.io-client";

const TILE_WIDTH = 45;

type GameProps = {
  id: string;
  player: "1" | "2";
  playerId: string;
};

function Game(props: GameProps) {
  const [enabled, setEnabled] = useState(false);
  const [spectator, setSpectator] = useState(false);

  const [currentPlayer, setCurrentPlayer] = useState<"1" | "2" | null>(null);
  const [lettersOnHand, setLettersOnHand] = useState<
    { letter: Letter; index: number }[]
  >(new Array(7).fill(0).map((_, i) => ({ letter: randomLetter(), index: i })));

  const api = getApi({ auth: props.playerId, player: props.player });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dndbpr = useRef<DragAndDropBoardProviderRef>(null);

  const [lettersOnBoard, setLettersOnBoard] = useState<Record<number, Letter>>(
    {},
  );
  const [letterOnHandMoving, setLetterOnHandMoving] = useState<number | null>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["game", props.id],
    queryFn: async () => {
      const game = await api.getGame(props.id);

      if (!game.authenticated) {
        setSpectator(true);
        setSuccessMessage("You're in spectator mode");
        setEnabled(false);
      } else {
        if (currentPlayer === null || game.currentTurn !== currentPlayer) {
          setLettersOnHand(
            game.players[props.player].letters.map((l, i) => ({
              letter: l,
              index: i,
            })),
          );
          setLettersOnBoard([]);
          setCurrentPlayer(game.currentTurn);
        }

        if (game.currentTurn !== props.player) {
          setEnabled(false);
          setSuccessMessage("Waiting for the other player to make a move");
        } else {
          setEnabled(true);
          setSuccessMessage(null);
        }
      }

      return {
        fixedLetters: game.letters,
        lastPlayed: game.lastPlayed,
        scores: {
          playerOne: game.players["1"].score,
          playerTwo: game.players["2"].score,
        },
      };
    },
  });

  useEffect(() => {
    const socket = io(API_URL);
    socket.on("update", (id) => {
      if (id === props.id) {
        refetch();
      }
    });
    return () => void socket.disconnect();
  }, []);

  useEffect(() => {
    setError(null);
  }, [lettersOnBoard, lettersOnHand]);

  const handleMove = useCallback(
    (move: MoveType) => {
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
    },
    [lettersOnBoard, letterOnHandMoving, lettersOnHand],
  );

  if (isLoading) {
    return (
      <ErrorPage
        message="Loading..."
        detail="Fetching game data from the server"
      />
    );
  }

  if (isError) {
    return (
      <ErrorPage
        message="Error"
        detail="An error occurred while fetching game data from the server"
      />
    );
  }

  const { fixedLetters, scores, lastPlayed } = data!;

  return (
    <DragAndDropBoardProvider
      ref={dndbpr}
      className={classes.container}
      letters={lettersOnBoard}
      onMove={handleMove}
      enabled={enabled}
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
          <DragAndDropBoard
            highlight={lastPlayed}
            fixedLetters={fixedLetters}
          />
        </div>
        <StatusBar
          player={props.player}
          scores={scores}
          error={error}
          spectating={spectator}
          onClickShuffle={() => {
            const newLettersOnHand = shuffle(lettersOnHand).map((v, i) => ({
              ...v,
              index: i,
            }));

            setLettersOnHand(newLettersOnHand);
          }}
          onClickPlay={async () => {
            const res = await getScoreForMove(lettersOnBoard, fixedLetters);
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

            await api
              .makeMove(props.id, {
                player: props.player,
                letters: lettersOnBoard,
                score: res.score,
                lettersOnHand: lettersOnHand.map((l) => l.letter),
              })
              .then(() => refetch());
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
                    if (!enabled) return;

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
  spectating?: boolean;
  player: "1" | "2";
  scores: {
    playerOne: number;
    playerTwo: number;
  };
  onClickShuffle?: () => void;
  onClickPlay?: () => void;
};
function StatusBar(props: StatusBarProps) {
  const you =
    props.player === "1" ? props.scores.playerOne : props.scores.playerTwo;
  const them =
    props.player === "1" ? props.scores.playerTwo : props.scores.playerOne;

  return (
    <div
      className={classes.statusBar}
      style={{
        width: TILE_WIDTH * WORDFEUD_BOARD_WIDTH + 14 + 10,
      }}
    >
      <div className={classes.scoreBar} style={{ height: TILE_WIDTH + 10 }}>
        {(() => {
          if (props.spectating) {
            return (
              <>
                <p>Player 1 - {props.scores.playerOne}</p>
                <p>Player 2 - {props.scores.playerTwo}</p>
              </>
            );
          } else {
            return (
              <>
                <p>You - {you}</p>
                <p>Them - {them}</p>
              </>
            );
          }
        })()}
      </div>
      <div
        style={{
          all: "inherit",
          display: props.spectating ? "none" : undefined,
        }}
      >
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
    </div>
  );
}

export default Game;
