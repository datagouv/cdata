declare module 'vue3-xml-viewer' {
  import type { Component } from 'vue'

  export interface XmlViewerProps {
    xml: string
    theme?: 'light' | 'dark'
  }

  export const XmlViewer: Component<XmlViewerProps>
}
