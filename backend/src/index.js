const express = require("express");
const fs = require("fs");
const clone = require("./utils/clone.js");
const getRandomLetterPool = require("./utils/letterPool.js");

const PORT = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const games = new Map();

app.get("/api/game/:game", (req, res) => {
  const gameId = req.params.game;
  const player = req.query.player;
  const auth = req.headers.authorization;

  if (player !== "1" && player !== "2") {
    res.status(400).send("Invalid player");
    return;
  }

  const letterPool = getRandomLetterPool();
  const player1 = letterPool.splice(0, 7);
  const player2 = letterPool.splice(0, 7);

  if (!games.has(gameId)) {
    const game = {
      letters: {},
      lastPlayed: null,
      currentTurn: "1",
      letterPool,
      players: {
        ["1"]: {
          score: 0,
          letters: player1,
          auth: null,
        },
        ["2"]: {
          score: 0,
          letters: player2,
          auth: null,
        },
      },
    };

    games.set(gameId, game);
  }

  {
    const game = clone(games.get(gameId));

    if (player === "1") {
      game.players["1"].auth = game.players["1"].auth ?? auth;
    } else {
      game.players["2"].auth = game.players["2"].auth ?? auth;
    }

    games.set(gameId, game);
  }

  const game = clone(games.get(gameId));

  let authenticated = false;
  if (player === "1") {
    delete game.players["2"].letters;

    if (game.players["1"].auth !== auth) {
      delete game.players["1"].letters;
    } else {
      authenticated = true;
    }
  } else if (player === "2") {
    delete game.players["1"].letters;

    if (game.players["2"].auth !== auth) {
      delete game.players["2"].letters;
    } else {
      authenticated = true;
    }
  }
  console.log(game);

  delete game.letterPool;
  delete game.players["1"].auth;
  delete game.players["2"].auth;

  game.authenticated = authenticated;

  res.send(game);
});

app.post("/api/game/:game", (req, res) => {
  const gameId = req.params.game;
  const { player, letters, score, lettersOnHand } = req.body;
  const auth = req.headers.authorization;

  if (!games.has(gameId)) {
    res.status(400).send("Game not found");
    return;
  }

  const game = JSON.parse(JSON.stringify(games.get(gameId)));

  if (player !== "1" && player !== "2") {
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
  game.lastPlayed = Object.keys(letters).map(Number);

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

  games.set(gameId, game);
  io.emit("update", gameId);

  res.sendStatus(200);
});

(async () => {
  server.listen(PORT, "0.0.0.0");
  console.log(`Server running on port ${PORT}`);
})();
