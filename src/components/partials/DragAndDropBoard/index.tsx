import Board from "@/components/container/Board";
import Tile from "@/components/ui/Tile";
import { WORDFEUD_BOARD_WIDTH } from "@/consts";
import useMousePosition from "@/hooks/useMousePosition";
import useResize from "@/hooks/useResize";
import { Letter, Nullable, Position } from "@/types";
import { getIdx } from "@/utils/idx";
import React, {
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { DragAndDropContext, Move, MoveType } from "./context";
import classes from "./DragAndDropBoard.module.scss";

type DragAndDropBoardProps = {
  fixedLetters?: Nullable<Record<number, Letter>>;
};

function DragAndDropBoard(props: DragAndDropBoardProps) {
  const ctx = useContext(DragAndDropContext);
  const ref = useRef<HTMLDivElement>(null);

  useResize(ref, () => {
    if (!ref.current) return;

    // - 14 to account for the gap
    const width = (ref.current.clientWidth - 14) / WORDFEUD_BOARD_WIDTH;
    ctx.setTileWidth(width);
  });

  // If dragging and dropping, don't show the letter that is being dragged
  const showLetters = useMemo(() => {
    const newLetters = structuredClone(ctx.letters);
    if (ctx.move?.from) {
      delete newLetters[getIdx(ctx.move.from)];
    }
    return newLetters;
  }, [ctx.letters, ctx.move]);

  const [mouseTile, setMouseTile] = useState<Nullable<Position>>(null);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <Board
        fixedLetters={props.fixedLetters}
        letters={showLetters}
        onMouseOver={() => {
          ctx.setIsHoveringBoard(true);
        }}
        onMouseOut={() => {
          ctx.setIsHoveringBoard(false);
        }}
        onMouseDown={(e) => {
          if (!ctx.enabled) return;

          if (e.button === 0 && mouseTile && ctx.letters[getIdx(mouseTile)]) {
            ctx.setMove({
              from: mouseTile,
              letter: ctx.letters[getIdx(mouseTile)],
            });
          }

          if (e.button === 2) {
            if (ctx.move == null && mouseTile) {
              const idx = getIdx(mouseTile);

              if (idx in ctx.letters) {
                ctx.onMove({
                  type: "oob",
                  from: mouseTile,
                  letter: ctx.letters[idx],
                });
              }
              return;
            }
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        onMouseUp={() => {
          if (!ctx.enabled) return;
          if (!ctx.move) return;

          if (!mouseTile) {
            ctx.setMove(null);
            return;
          }

          if (props.fixedLetters && getIdx(mouseTile) in props.fixedLetters) {
            ctx.onMove({ type: "invalid" });
            ctx.setMove(null);
            return;
          }

          if (getIdx(mouseTile) in ctx.letters) {
            if (ctx.move.from) {
              ctx.onMove({
                type: "swap",
                a: ctx.move.from,
                b: mouseTile,
              });
              ctx.setMove(null);
            }

            ctx.onMove({ type: "invalid" });
            ctx.setMove(null);
            return;
          }

          ctx.onMove({
            type: "place",
            letter: ctx.move.letter,
            to: mouseTile,
            from: ctx.move.from,
          });
          ctx.setMove(null);
        }}
        onTileHover={(pos) => {
          setMouseTile(pos);
        }}
      />
    </div>
  );
}

type DragAndDropBoardProviderProps = {
  children: React.ReactNode;
  enabled?: boolean;
  onMove: (type: MoveType) => void;
  letters: Record<number, Letter>;
} & React.ComponentPropsWithoutRef<"div">;

export type DragAndDropBoardProviderRef = {
  setMove: (letter: Letter, from: Nullable<Position>) => void;
};

const DragAndDropBoardProvider = React.forwardRef(
  function DragAndDropBoardProvider(
    props: DragAndDropBoardProviderProps,
    forwardRef: React.Ref<DragAndDropBoardProviderRef>,
  ) {
    const { children, letters, onMove, ...rest } = props;

    const [tileWidth, setTileWidth] = useState(0);
    const [move, setMove] = useState<Nullable<Move>>(null);
    const [isHoveringBoard, setIsHoveringBoard] = useState(false);
    const { x: mouseX, y: mouseY } = useMousePosition();

    useImperativeHandle(
      forwardRef,
      () => {
        return {
          setMove: (letter, from) => {
            setMove({ letter, from });
          },
        };
      },
      [],
    );

    return (
      <DragAndDropContext.Provider
        value={{
          enabled: props.enabled ?? true,
          tileWidth,
          setTileWidth,
          letters,
          move,
          setMove,
          isHoveringBoard,
          setIsHoveringBoard,
          onMove,
        }}
      >
        <div
          {...rest}
          onMouseLeave={(e) => {
            props.onMouseLeave?.(e);

            if (move) {
              onMove({ type: "oob", letter: move.letter, from: move.from });
              setMove(null);
            }
          }}
          onMouseUp={(e) => {
            props.onMouseUp?.(e);

            if (move && !isHoveringBoard) {
              onMove({ type: "oob", letter: move.letter, from: move.from });
              setMove(null);
            }
          }}
        >
          <div
            style={{
              display: move ? "block" : "none",
              width: tileWidth,
              left: mouseX,
              top: mouseY,
            }}
            className={classes.ghostTile}
          >
            {move?.letter && <Tile letter={move.letter} />}
          </div>
          {children}
        </div>
      </DragAndDropContext.Provider>
    );
  },
);

export default DragAndDropBoard;
export { DragAndDropBoardProvider };
