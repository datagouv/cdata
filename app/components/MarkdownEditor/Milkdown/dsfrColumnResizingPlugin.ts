import { $prose } from '@milkdown/utils'
import { columnResizing } from 'prosemirror-tables'
import { TableView } from '~/components/MarkdownEditor/ProseMirror/DSFRTableView'

export const dsfrColumnResizingPlugin = $prose(() => columnResizing({ View: TableView }))
