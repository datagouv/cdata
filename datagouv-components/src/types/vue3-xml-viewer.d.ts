declare module 'vue3-xml-viewer' {
  import type { Component } from 'vue'

  export interface XmlViewerProps {
    xml: string
    theme?: 'light' | 'dark'
    indentWidth?: number
    showLineNumbers?: boolean
    showAttributes?: boolean
    showComments?: boolean
    showCdata?: boolean
    showDoctype?: boolean
    showProcessingInstructions?: boolean
    showTextNodes?: boolean
    showWhitespace?: boolean
    expandAll?: boolean
    maxDepth?: number
    expandDepth?: number
  }

  export const XmlViewer: Component<XmlViewerProps>
}
