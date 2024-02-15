import express from "express";
import Ajv from "ajv";

import client from "@/database";
import { io } from "@/server";
import getRandomLetterPool from "@/utils/letterPool";
import { validateGameId, validatePlayer } from "@/utils/validate";

const ajv = new Ajv();

const validateBody = ajv.compile<{
  player: string;
  letters: Record<string, string>;
  score: number;
  lettersOnHand: string[];
}>({
  type: "object",
  properties: {
    player: { type: "string" },
    score: { type: "integer" },
    letters: {
      type: "object",
      patternProperties: {
        "^[0-9]+$": { type: "string" },
      },
      additionalProperties: false,
    },
    lettersOnHand: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["player", "letters", "score", "lettersOnHand"],
  additionalProperties: false,
});

function makeMoveRoute(app: express.Application) {
  app.post("/api/game/:game/move", async (req, res) => {
    const db = await client();

    const body = req.body;

    if (!validateBody(body)) {
      res.status(400).send("Invalid body");
      return;
    }

    const { player, letters, score, lettersOnHand } = body;
    const gameId = req.params.game;
    const auth = req.headers.authorization;

    if (!validateGameId(gameId)) {
      res.status(400).send("Invalid game ID");
      return;
    }

    const game = await db.game.get(gameId);

    if (!game) {
      res.status(400).send("Game not found");
      return;
    }

    if (!validatePlayer(player)) {
      res.status(400).send("Invalid player");
      return;
    }

    if (game.currentTurn !== player) {
      res.status(400).send("Not your turn");
      return;
    }

    if (game.players[player].auth !== auth) {
      res.status(401).send("Unauthorized");
      return;
    }

    game.currentTurn = player === "1" ? "2" : "1";

    for (const [idx, letter] of Object.entries(letters)) {
      game.letters[String(idx)] = letter;
    }
    game.prevPlayed = Object.keys(letters).map(Number);

    const letterPool = JSON.parse(JSON.stringify(game.letterPool));

    game.players[player].score += score;
    game.players[player].letters = [
      ...letterPool.splice(0, 7 - lettersOnHand.length),
      ...lettersOnHand,
    ];

    game.letterPool = letterPool;
    if (game.letterPool.length <= 10) {
      game.letterPool.push(...getRandomLetterPool());
    }

    io.emit("update", gameId);
    res.sendStatus(200);
    await db.game.set(gameId, game);
  });
}

export default makeMoveRoute;
