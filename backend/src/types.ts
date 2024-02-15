export type Player = "1" | "2";

export type Game = {
  /** The letter on the board, { [idx]: letter } */
  letters: Record<string, string>;
  /** The last played letters idx's */
  prevPlayed: number[];
  currentTurn: Player;
  letterPool: string[];
  players: {
    [key in Player]: {
      /** The 7 letters the player has on hand */
      letters: string[];
      score: number;
      auth: string | null;
      name: string;
    };
  };
};

// Used for the copy and paste to work
// @ts-ignore
type Letter = string;

// Copy and paste this into api.ts on the frontend
export namespace Responses {
  export type GetGame = {
    authenticated: boolean;
    letters: Record<number, string>;
    prevPlayed: number[];
    lettersOnHand: string[];
    currentTurn: "1" | "2";
    players: {
      "1": {
        score: number;
      };
      "2": {
        score: number;
      };
    };
  };
}
