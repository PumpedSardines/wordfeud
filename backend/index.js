const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const games = new Map();

function shuffle(arr) {
  const result = JSON.parse(JSON.stringify(arr));

  for (let i = 0; i < result.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getRandomLetterPool() {
  const pool = {
    A: 9,
    B: 2,
    C: 2,
    D: 4,
    E: 12,
    F: 2,
    G: 3,
    H: 2,
    I: 9,
    J: 1,
    K: 1,
    L: 4,
    M: 2,
    N: 6,
    O: 8,
    P: 2,
    Q: 1,
    R: 6,
    S: 4,
    T: 6,
    U: 4,
    V: 2,
    W: 2,
    X: 1,
    Y: 2,
    Z: 1,
  };

  return shuffle(
    Object.entries(pool).flatMap(([letter, count]) =>
      new Array(count).fill(letter),
    ),
  );
}

app.get("/api/game/:game", (req, res) => {
  const gameId = req.params.game;

  const letterPool = getRandomLetterPool();
  const player1 = letterPool.splice(0, 7);
  const player2 = letterPool.splice(0, 7);

  if (!games.has(gameId)) {
    games.set(gameId, {
      letters: {},
      lastPlayed: null,
      currentTurn: "1",
      letterPool,
      players: {
        ["1"]: {
          score: 0,
          letters: player1,
        },
        ["2"]: {
          score: 0,
          letters: player2,
        },
      },
    });
  }

  res.send(games.get(gameId));
});

app.post("/api/game/:game", (req, res) => {
  const gameId = req.params.game;
  const { player, letters, score, lettersOnHand } = req.body;

  if (!games.has(gameId)) {
    res.status(400).send("Game not found");
    return;
  }

  const game = JSON.parse(JSON.stringify(games.get(gameId)));

  if (game.currentTurn !== player) {
    res.status(400).send("Not your turn");
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

  res.sendStatus(200);
});

app.listen(3000, "0.0.0.0", (post, host) => {
  console.log(`Server is running at http://${host}:${post}`);
});
