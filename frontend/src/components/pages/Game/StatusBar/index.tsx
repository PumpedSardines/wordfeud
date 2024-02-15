import { WORDFEUD_BOARD_WIDTH } from "@/consts";
import { Letter, Player } from "@/types";
import { TILE_WIDTH } from "../consts";
import DragAndDropTile from "./DragAndDropTile";
import classes from "./StatusBar.module.scss";

type StatusBarProps = {
  spectating?: boolean;
  enabled?: boolean;
  error: string | null;
  player: Player;
  scores: {
    playerOne: number;
    playerTwo: number;
  };
  onClickShuffle?: () => void;
  onClickPlay?: () => void;
  startMove: (l: Letter, i: number) => void;
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
        <div
          style={{
            width: TILE_WIDTH * 7 + 6,
          }}
          className={classes.handContainer}
        >
          {new Array(7).fill(0).map((_, i) => {
            return (
              <DragAndDropTile
                key={i}
                enabled={!!props.enabled}
                index={i}
                startMove={props.startMove}
              />
            );
          })}
        </div>
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

export default StatusBar;
