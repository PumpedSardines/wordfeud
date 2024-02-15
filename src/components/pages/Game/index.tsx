import { useEffect, useRef, useState } from "react";
import DragAndDropBoard, {
  DragAndDropBoardProvider,
  DragAndDropBoardProviderRef,
} from "@/components/partials/DragAndDropBoard";
import { WORDFEUD_BOARD_WIDTH } from "@/consts";
import { Player } from "@/types";

import classes from "./Game.module.scss";
import shuffle from "@/utils/shuffle";
import { BoardScoreError, getScoreForMove } from "@/utils/scoreing";
import ErrorPage from "../Error";
import useServerConnection from "./useServerConnection";
import { useLetterMoveStore } from "./stores";
import { TILE_WIDTH } from "./consts";
import StatusBar from "./StatusBar";

type GameProps = {
  id: string;
  player: Player;
  playerId: string;
};

function Game(props: GameProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dndbpr = useRef<DragAndDropBoardProviderRef>(null);

  const letterMove = useLetterMoveStore((state) => ({
    board: state.board,
    hand: state.hand,
    handMoving: state.handMoving,
    setBoard: state.setBoard,
    setHand: state.setHand,
    setHandMoving: state.setHandMoving,
    handleMove: state.handleMove,
  }));

  const server = useServerConnection({
    gameId: props.id,
    player: props.player,
    playerId: props.playerId,

    setSuccessMessage,
    reset: (newLettersOnHand) => {
      letterMove.setBoard([]);
      letterMove.setHand(newLettersOnHand);
    },
  });

  useEffect(() => {
    setError(null);
  }, [letterMove.board, letterMove.hand]);

  if (server.isLoading) {
    return (
      <ErrorPage
        message="Loading..."
        detail="Fetching game data from the server"
      />
    );
  }

  if (server.isError) {
    return (
      <ErrorPage
        message="Error"
        detail="An error occurred while fetching game data from the server"
      />
    );
  }

  const { fixedLetters, scores, lastPlayed, enabled, spectator } = server.data!;

  return (
    <DragAndDropBoardProvider
      ref={dndbpr}
      className={classes.container}
      letters={letterMove.board}
      onMove={letterMove.handleMove}
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
            letterMove.setHand(shuffle(letterMove.hand).map((v) => v.letter));
          }}
          onClickPlay={async () => {
            const res = await getScoreForMove(letterMove.board, fixedLetters);
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

            await server.makeMove({
              letters: letterMove.board,
              score: res.score,
              lettersOnHand: letterMove.hand.map((l) => l.letter),
            });
          }}
          startMove={(l, i) => {
            if (dndbpr.current) {
              letterMove.setHandMoving(i);
              dndbpr.current.setMove(l, null);
            }
          }}
        />
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

export default Game;
