/**
 * Keep a combined sort value only if it still exists among the available options.
 * Returns an empty string when the value is missing or already empty.
 */
export function keepValidSortCombined<T extends string>(currentSortCombined: T, availableValues: Array<T>): T {
  if (!currentSortCombined) {
    return '' as T
  }
  return availableValues.includes(currentSortCombined) ? currentSortCombined : '' as T
}
