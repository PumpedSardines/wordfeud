import { Player } from "@/types";

export function validateGameId(gameId: string): boolean {
  return /[A-Za-z]+/.test(gameId);
}

export function validatePlayer(player: unknown): player is Player {
  return player === "1" || player === "2";
}
