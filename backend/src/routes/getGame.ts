import express from "express";

import client from "@/database";
import { Responses } from "@/types";
import getRandomLetterPool from "@/utils/letterPool";
import { validateGameId, validatePlayer } from "@/utils/validate";

function getGameRoute(app: express.Application) {
  app.get("/api/game/:game", async (req, res) => {
    const db = await client();

    const gameId = req.params.game;
    const name = req.headers["x-wordfeud-name"];
    const player = req.query["player"];
    const auth = req.headers.authorization;

    if (!validateGameId(gameId)) {
      res.status(400).send("Invalid game ID");
      return;
    }

    if (typeof name !== "string") {
      res.status(400).send("Invalid name");
      return;
    }

    if (typeof auth !== "string") {
      res.status(401).send("Unauthorized");
      return;
    }

    if (!validatePlayer(player)) {
      res.status(400).send("Invalid player");
      return;
    }

    const letterPool = getRandomLetterPool();
    const player1 = letterPool.splice(0, 7);
    const player2 = letterPool.splice(0, 7);

    let game = await db.game.get(gameId);

    if (game == null) {
      game = {
        letters: {},
        prevPlayed: [],
        currentTurn: "1",
        letterPool,
        players: {
          ["1"]: {
            score: 0,
            letters: player1,
            auth: null,
            name,
          },
          ["2"]: {
            score: 0,
            letters: player2,
            auth: null,
            name,
          },
        },
      };

      await db.game.set(gameId, game);
    }

    if (game.players[player].auth == null) {
      game.players[player].auth = auth;
      await db.game.set(gameId, game);
    }

    let authenticated = false;
    if (game.players[player].auth === auth) {
      authenticated = true;
    }

    const response: Responses.GetGame = {
      authenticated,
      letters: game.letters,
      prevPlayed: game.prevPlayed,
      lettersOnHand: (() => {
        if (!authenticated) {
          return [];
        }

        return game.players[player].letters;
      })(),
      currentTurn: game.currentTurn,
      players: {
        "1": {
          score: game.players["1"].score,
        },
        "2": {
          score: game.players["2"].score,
        },
      },
    };

    res.send(response);
    await db.close();
  });
}

export default getGameRoute;
