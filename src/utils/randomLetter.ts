import { Letter } from "@/types";

function randomLetter(): Letter {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  return alphabet[
    Math.floor(Math.random() * alphabet.length)
  ].toUpperCase() as Letter;
}

export default randomLetter;
