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
    if (props.letter) {
      return { text: props.letter, className: classes.letter };
    }

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
        props.grey && classes.grey,
        props.highlight && classes.highlight,
      ])}
    >
      {text && <p>{text}</p>}
      {score && <p className={classes.score}>{score}</p>}
    </div>
  );
}

export default Tile;
