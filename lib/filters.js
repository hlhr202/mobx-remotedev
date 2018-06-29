"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isFiltered(action, filter) {
    if (!filter)
        return false;
    var whitelist = filter.whitelist, blacklist = filter.blacklist;
    return (whitelist && !action.type.match(whitelist) ||
        blacklist && action.type.match(blacklist));
}
exports.isFiltered = isFiltered;
