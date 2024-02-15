function randomId() {
  const letters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 256; i++) {
    result += letters[Math.floor(Math.random() * letters.length)];
  }
  return result;
}

export default randomId;
