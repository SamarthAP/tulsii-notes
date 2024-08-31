import Fuse from "fuse.js";

export function fuzzySearch<T>(list: T[], keys: string[], query: string): T[] {
  const options = {
    keys: keys,
    threshold: 0.4,
  };

  const fuse = new Fuse(list, options);
  return fuse.search(query).map((result) => result.item);
}
