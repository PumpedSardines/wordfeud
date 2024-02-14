import Game from "./components/pages/Game";

function App() {
  const url = new URL(window.location.href);

  const gameId = url.searchParams.get("gameid");
  const player = url.searchParams.get("player");
  const validPlayer = player === "1" || player === "2";

  if (gameId && validPlayer) {
    return <Game id={gameId} player={player} />;
  }

  return <h1>Invalid URL</h1>;
}

export default App;
