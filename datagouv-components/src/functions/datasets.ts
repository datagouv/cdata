import { useComponentsConfig } from '../config'

function constructUrl(baseUrl: string, path: string): string {
  const url = new URL(baseUrl)
  url.pathname = `${url.pathname}${path}`
  return url.toString()
}

export function getDatasetOEmbedHtml(type: string, id: string): string {
  const config = useComponentsConfig()

  const staticUrl = constructUrl(config.baseUrl, 'oembed.js')
  return `<div data-udata-${type}="${id}"></div><script data-udata="${config.baseUrl}" src="${staticUrl}" async defer></script>`
}
