import React, { useMemo } from "react";

import cx from "@/utils/cx";
import { Letter, Nullable, Position, TileType } from "@/types";
import { getTileType } from "@/utils/tileType";
import { getLetterScore } from "@/utils/scoreing";

import classes from "./Tile.module.scss";

type TileProps = {
  /** The position on the wordfeud board */
  pos?: Nullable<Position>;
  /** The letter that is placed on the tile */
  letter?: Nullable<Letter>;
  highlight?: boolean;
  grey?: boolean;
} & React.ComponentPropsWithoutRef<"div">;

/**
 * A wordfeud tile
 */
function Tile(props: TileProps) {
  const tileType: Nullable<TileType> = useMemo(() => {
    if (!props.pos) {
      return null;
    }

    return getTileType(props.pos);
  }, [props.pos]);

  const score = props.letter && getLetterScore(props.letter);

  const { text, className } = useMemo(() => {
    if (!tileType) {
      return { text: null, className: null };
    }

    return {
      [TileType.DoubleLetter]: { text: "DL", className: classes.doubleLetter },
      [TileType.TripleLetter]: { text: "TL", className: classes.tripleLetter },
      [TileType.DoubleWord]: { text: "DW", className: classes.doubleWord },
      [TileType.TripleWord]: { text: "TW", className: classes.tripleWord },
    }[tileType];
  }, [props.letter, tileType]);

  return (
    <div
      className={cx([
        classes.tile,
        props.className,
        className,
        props.highlight && classes.highlight,
      ])}
    >
      {text && (props.letter ? null : <p>{text}</p>)}
      {props.letter && (
        <div
          className={cx([
            classes.letter,
            props.grey && classes.grey,
            props.highlight && classes.highlight,
            className,
          ])}
        >
          {text && <p className={classes.multiplier}>{text}</p>}
          <p>{props.letter}</p>
          {score && <p className={classes.score}>{score}</p>}
        </div>
      )}
    </div>
  );
}

export default Tile;
