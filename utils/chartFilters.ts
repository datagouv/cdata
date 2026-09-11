import type { AndFilters, Filter, GenericFilter, OrFilters } from '@datagouv/components-next'

export type FilterGroupCombinator = 'and' | 'or'

export type FilterGroupsState = {
  rootCombinator: FilterGroupCombinator
  groups: Array<Array<Filter>>
}

function isFilter(f: GenericFilter | null): f is Filter {
  return f?._cls === 'Filter'
}

/**
 * Convert a persisted filter tree into the UI model: a root combinator plus a
 * list of groups, each group being a flat list of conditions combined with the
 * opposite operator (`or` groups under an `and` root, and vice versa).
 * The returned groups hold references to the original Filter objects, so
 * in-place edits to a filter stay visible in `form.filter` (the configurator
 * relies on its deep watcher for preview refresh).
 * The default root is `or`: conditions inside a group are `and`-combined by
 * default (a new rule is an `and`), so a single group serializes as
 * `AndFilters` and several groups as `OrFilters` of `AndFilters`.
 */
export function toFilterGroups(filter: GenericFilter | null): FilterGroupsState {
  if (!filter) return { rootCombinator: 'or', groups: [] }
  if (isFilter(filter)) return { rootCombinator: 'or', groups: [[filter]] }

  // A combined node whose children are all bare Filters is a single group without
  // a root wrapper (how fromFilterGroups persists one group with several rules):
  // the node's own combinator applies inside the group, so the root is its opposite.
  if (filter.filters.every(isFilter)) {
    return {
      rootCombinator: filter._cls === 'AndFilters' ? 'or' : 'and',
      groups: [filter.filters.filter(isFilter)],
    }
  }

  const rootCombinator: FilterGroupCombinator = filter._cls === 'AndFilters' ? 'and' : 'or'
  const groups = filter.filters.map((child) => {
    if (isFilter(child)) return [child]
    // Defensive: unexpected nesting depth is flattened to its Filter list.
    return child.filters.filter(isFilter)
  })
  return { rootCombinator, groups }
}

/**
 * Build the persisted filter tree from the UI model. Empty groups are dropped,
 * single-condition groups collapse to a bare Filter, and a single group needs
 * no root wrapper.
 */
export function fromFilterGroups(state: FilterGroupsState): GenericFilter | null {
  const groups = state.groups.filter(group => group.length > 0)
  if (groups.length === 0) return null

  const innerCls = state.rootCombinator === 'and' ? 'OrFilters' : 'AndFilters'
  const toNode = (group: Array<Filter>): Filter | AndFilters | OrFilters =>
    group.length === 1 ? group[0] : { _cls: innerCls, filters: group } as AndFilters | OrFilters

  if (groups.length === 1) return toNode(groups[0])

  const rootCls = state.rootCombinator === 'and' ? 'AndFilters' : 'OrFilters'
  return { _cls: rootCls, filters: groups.map(toNode) } as AndFilters | OrFilters
}
