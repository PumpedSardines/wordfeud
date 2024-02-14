import ErrorPage from "./components/pages/Error";
import Game from "./components/pages/Game";
import randomId from "./utils/randomId";

function App() {
  const url = new URL(window.location.href);

  const gameId = url.searchParams.get("gameid");
  const player = url.searchParams.get("player");
  const validPlayer = player === "1" || player === "2";
  const playerId = (() => {
    const playerId = localStorage.getItem("id");
    if (playerId) return playerId;
    const newId = randomId();
    localStorage.setItem("id", newId);
    return newId;
  })();

  if (gameId && validPlayer) {
    return <Game id={gameId} player={player} playerId={playerId} />;
  }

  return (
    <ErrorPage
      message="Invalid URL"
      detail="The URL is missing the gameid or player query parameter"
    />
  );
}

export default App;
