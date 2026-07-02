// Grist returns list-typed cells (Reference List, Choice List…) as
// ["L", val1, val2, ...] where "L" is a leading type marker. Strip it to get
// the actual values; non-list cells yield an empty list.
export function unwrapList(value: unknown): Array<unknown> {
  if (!Array.isArray(value)) return []
  if (value[0] === 'L') return value.slice(1)
  return value
}
