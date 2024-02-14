async function createWordSearch() {
  const raw = await fetch("/words.txt").then((res) => res.text());
  const words = raw
    .split("\n")
    .map((word) => word.trim())
    .sort();

  return (search: string) => {
    let start = 0;
    let end = words.length;
    let partition = ~~(words.length / 2);

    while (start < end) {
      const word = words[partition];
      if (word === search) return true;
      if (word < search) {
        start = partition + 1;
      } else {
        end = partition;
      }
      partition = ~~((start + end) / 2);
    }

    return false;
  };
}

const searchWord = await createWordSearch();

export default searchWord;
