import type { ColumnDefinition } from '@datagouv/components-next'

const X_COLUMN_PATTERN = /région|departement|département|catégorie|categorie|type|année|annee|date/i

function quoteIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`
}

/**
 * Default query so a freshly selected resource renders immediately, mirroring
 * the prototype's first chart. The SQL endpoint addresses the resource in the
 * URL and exposes its rows as the `data` table (convention shared with the
 * assistant, see tests-unit/assistant.spec.ts).
 */
export function buildDefaultQuery(columns: Array<ColumnDefinition>): string {
  if (columns.length === 0) return ''
  const x = columns.find(column => X_COLUMN_PATTERN.test(column.name)) ?? columns[0]!
  const y = columns.find(column => column.type === 'number' && column.name !== x.name)
  if (!y) return 'SELECT * FROM data LIMIT 20'
  return `SELECT ${quoteIdentifier(x.name)}, ${quoteIdentifier(y.name)} FROM data ORDER BY ${quoteIdentifier(y.name)} DESC LIMIT 20`
}
