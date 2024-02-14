import { API_URL } from "./consts";
import { Letter } from "./types";

export type GameData = {
  letters: Record<number, string>;
  lastPlayed: number[];
  currentTurn: "1" | "2";
  players: {
    "1": {
      letters: Letter[];
      score: number;
    };
    "2": {
      letters: Letter[];
      score: number;
    };
  };
};

export type MakeMove = {
  player: "1" | "2";
  letters: Record<number, string>;
  score: number;
  lettersOnHand: Letter[];
};

function api() {
  return {
    getGame: async (gameId: string) => {
      const data = (await fetch(API_URL + `/api/game/${gameId}`).then((res) =>
        res.json(),
      )) as GameData;

      return {
        ...data,
        letters: Object.fromEntries(
          Object.entries(data.letters).map(([key, value]) => [
            parseInt(key),
            value as Letter,
          ]),
        ),
      };
    },
    makeMove: async (gameId: string, move: MakeMove) => {
      await fetch(API_URL + `/api/game/${gameId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...move,
          letters: Object.fromEntries(
            Object.entries(move.letters).map(([key, value]) => [
              String(key),
              value as string,
            ]),
          ),
        }),
      });
    },
  };
}

export default api;
