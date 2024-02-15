export default function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
