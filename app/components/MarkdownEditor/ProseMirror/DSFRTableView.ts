import type { Node } from 'prosemirror-model'
import { TableView as ProseTableView } from 'prosemirror-tables'
import type { ViewMutationRecord } from 'prosemirror-view'

/**
 * This extended class is necessary to customize the `className` of the table wrapper
 * It's set to `.tableWrapper` in the Prose Mirror but we want it to be the DSFR class
 */
export class TableView extends ProseTableView {
  constructor(node: Node, cellMinWidth: number) {
    super(node, cellMinWidth)
    this.dom.className = 'fr-table fr-table--no-caption fr-table--layout-fixed'
  }

  override ignoreMutation(record: ViewMutationRecord): boolean {
    if (record.type === 'selection') return true
    return super.ignoreMutation(record) || (record.type === 'attributes' && record.target === this.dom)
  }
}
