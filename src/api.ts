import { API_URL } from "./consts";
import { Letter } from "./types";

export type GameData = {
  authenticated: boolean;
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

function getApi(options: { auth: string; player: "1" | "2" }) {
  const params = new URLSearchParams();
  params.append("player", options.player);

  return {
    getGame: async (gameId: string) => {
      const data = (await fetch(API_URL + `/api/game/${gameId}?${params}`, {
        method: "GET",
        headers: {
          Authorization: options.auth,
        },
      }).then((res) => res.json())) as GameData;

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
      await fetch(API_URL + `/api/game/${gameId}?${params}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: options.auth,
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

export default getApi;
