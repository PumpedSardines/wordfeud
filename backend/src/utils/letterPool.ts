function shuffle<T>(arr: T[]): T[] {
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

export default getRandomLetterPool;
