import Tile from "@/components/ui/Tile";
import { Letter } from "@/types";

import { TILE_WIDTH } from "../consts";
import { useLetterMoveStore } from "../stores";

type DragAndDropTileProps = {
  enabled: boolean;
  index: number;
  startMove: (l: Letter, i: number) => void;
};

function DragAndDropTile(props: DragAndDropTileProps) {
  const { enabled, startMove } = props;

  const letterMove = useLetterMoveStore((state) => ({
    hand: state.hand,
    handMoving: state.handMoving,
  }));

  const curLetter = letterMove.hand.find(({ index: i }) => i === props.index);

  return (
    <div
      style={{
        width: TILE_WIDTH,
      }}
      onMouseDown={() => {
        if (!enabled || curLetter == null) return;
        startMove(curLetter.letter, props.index);
      }}
    >
      <Tile
        letter={
          letterMove.handMoving === curLetter?.index
            ? undefined
            : curLetter?.letter
        }
      />
    </div>
  );
}

export default DragAndDropTile;
