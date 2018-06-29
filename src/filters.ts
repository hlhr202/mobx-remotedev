import { IFilter } from "./dev";

export function isFiltered(action: any, filter: IFilter) {
  if (!filter) return false;

  const { whitelist, blacklist } = filter;
  return (
    whitelist && !action.type.match(whitelist) ||
    blacklist && action.type.match(blacklist)
  );
}
