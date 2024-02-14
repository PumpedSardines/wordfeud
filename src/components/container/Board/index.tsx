import Tile from "@/components/ui/Tile";
import { WORDFEUD_BOARD_HEIGHT, WORDFEUD_BOARD_WIDTH } from "@/consts";
import { Letter, Nullable, Position } from "@/types";
import cx from "@/utils/cx";
import { getIdx } from "@/utils/idx";
import React from "react";

import classes from "./Board.module.scss";

type BoardProps = {
  fixedLetters?: Nullable<Record<number, Letter>>;
  letters?: Nullable<Record<number, Letter>>;
  onTileHover?: Nullable<(pos: Nullable<Position>) => void>;
} & React.HTMLAttributes<HTMLDivElement>;

function Board(props: BoardProps) {
  const { fixedLetters, letters, onTileHover, ...rest } = props;

  const tiles = new Array(WORDFEUD_BOARD_WIDTH * WORDFEUD_BOARD_HEIGHT)
    .fill(0)
    .map(
      (_, i): Position => ({
        x: i % 15,
        y: ~~(i / 15),
      }),
    );

  return (
    <div
      {...rest}
      className={cx([props.className, classes.root])}
      onMouseLeave={(e) => {
        props.onMouseLeave?.(e);
        props.onTileHover?.(null);
      }}
      onMouseMove={(e) => {
        props.onMouseMove?.(e);

        const target = e.target as HTMLDivElement;
        const rect = target.getBoundingClientRect();

        const x = Math.floor(
          ((e.clientX - rect.left) / rect.width) * WORDFEUD_BOARD_WIDTH,
        );
        const y = Math.floor(
          ((e.clientY - rect.top) / rect.height) * WORDFEUD_BOARD_HEIGHT,
        );

        onTileHover?.({ x, y });
      }}
    >
      {tiles.map((pos) => {
        const idx = getIdx(pos);
        const grey = !!(letters && idx in letters);
        const letter = fixedLetters?.[idx] ?? letters?.[idx];

        return <Tile key={idx} pos={pos} letter={letter} grey={grey} />;
      })}
    </div>
  );
}

export default Board;
