/**
 * The worst database you've ever seen 😎
 *
 * The database is written in this weird way to later be able to swap it out with a real database.
 */

import fs from "fs/promises";
import path from "path";

import clone from "@/utils/clone";
import { Game } from "@/types";

const root = path.join(__dirname, "../../db");

const inMemCache = new Map<string, Game>();

async function client() {
  const gameMapPromise = fs
    .readFile(path.join(root, "game_map.json"), "utf8")
    .catch(() => "[]")
    .then((v) => {
      try {
        const map = JSON.parse(v);
        if (!Array.isArray(map)) {
          return [];
        }
        return map as string[];
      } catch {
        return [];
      }
    });

  return {
    game: {
      get: async (gameId: string): Promise<Game | null> => {
        const inMemGame = inMemCache.get(gameId);

        if (inMemGame) {
          return clone(inMemGame);
        }

        const gameMap = await gameMapPromise;

        if (!gameMap.includes(gameId)) {
          return null;
        }

        try {
          const game = await fs.readFile(
            path.join(root, "games", `${gameId}.json`),
            "utf8",
          );
          return JSON.parse(game) as Game;
        } catch {
          return null;
        }
      },
      set: async (gameId: string, game: Game): Promise<void> => {
        const gameMap = await gameMapPromise;
        const newGameMap = [...new Set([...gameMap, gameId])];
        await fs.writeFile(
          path.join(root, `games/${gameId}.json`),
          JSON.stringify(game),
        );
        await fs.writeFile(
          path.join(root, "game_map.json"),
          JSON.stringify(newGameMap),
        );
        inMemCache.set(gameId, game);
      },
    },
    close: async () => {
      /* noop */
    },
  };
}

export default client;
