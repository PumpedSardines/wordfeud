import getApi from "@/api";
import { API_URL } from "@/consts";
import { Letter, Player } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type ServerConnectionOpts = {
  gameId: string;
  playerId: string;
  player: Player;
  setSuccessMessage: (msg: string | null) => void;
  reset: (lettersOnHand: Letter[]) => void;
};

function useServerConnection(opts: ServerConnectionOpts) {
  const api = getApi({ auth: opts.playerId, player: opts.player });
  const [currentTurn, setCurrentTurn] = useState<Player | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["game", opts.gameId],
    queryFn: async () => {
      const game = await api.getGame(opts.gameId);

      let enabled = false;
      let spectator = false;

      if (!game.authenticated) {
        opts.setSuccessMessage("You're in spectator mode");

        spectator = true;
        enabled = false;
      } else {
        if (currentTurn === null || game.currentTurn !== currentTurn) {
          opts.reset(game.lettersOnHand);
        }

        if (game.currentTurn !== opts.player) {
          enabled = false;
          opts.setSuccessMessage("Waiting for the other player to make a move");
        } else {
          enabled = true;
          opts.setSuccessMessage(null);
        }
      }

      if (game.currentTurn !== currentTurn) setCurrentTurn(game.currentTurn);

      return {
        enabled,
        spectator,
        fixedLetters: game.letters,
        lastPlayed: game.prevPlayed,
        currentTurn: game.currentTurn,
        scores: {
          playerOne: game.players["1"].score,
          playerTwo: game.players["2"].score,
        },
      };
    },
  });

  useEffect(() => {
    const socket = io(API_URL || undefined);
    socket.on("update", (gameId) => {
      if (gameId === opts.gameId) {
        refetch();
      }
    });
    return () => void socket.disconnect();
  }, []);

  return {
    data,
    isLoading,
    isError,
    makeMove: async (data: {
      letters: Record<number, string>;
      score: number;
      lettersOnHand: Letter[];
    }): Promise<void> => {
      await api
        .makeMove(opts.gameId, {
          player: opts.player,
          ...data,
        })
        .then(() => refetch());
    },
  };
}

export default useServerConnection;
