import dns, { type LookupAddress } from 'node:dns'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { fetchDocumentationContent } from '~/server/routes/nuxt-api/albert/utils/fetch-documentation'
import { publicOnlyLookup } from '~/server/utils/public-fetch'

const DISALLOWED_URL_MESSAGE = 'Documentation URL is not allowed. Use a public http(s) URL.'
const PUBLIC_ADDRESS = '203.0.113.10'

// Hoisted above the declarations, hence the literal instead of PUBLIC_ADDRESS.
vi.mock('node:dns/promises', () => ({ lookup: async () => [{ address: '203.0.113.10', family: 4 }] }))

type LookupCallback = (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void

/** Makes every callback-style `dns.lookup` (the one sockets use) answer `addresses`. */
function stubSocketDns(addresses: LookupAddress[]) {
  vi.spyOn(dns, 'lookup').mockImplementation(((_hostname: string, options: dns.LookupOptions, callback: LookupCallback) => {
    if (options.all) {
      callback(null, addresses)
    }
    else {
      callback(null, addresses[0].address, addresses[0].family)
    }
  }) as typeof dns.lookup)
}

describe('fetchDocumentationContent', () => {
  let server: Server
  let port: number
  let hits = 0

  beforeAll(async () => {
    server = createServer((_req, res) => {
      hits++
      res.end('internal secret')
    })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    port = (server.address() as AddressInfo).port
  })

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    hits = 0
  })

  it('refuses a hostname that rebinds to loopback between the check and the connection', async () => {
    // DNS rebinding: any resolution done apart from the socket (see the `node:dns/promises`
    // mock) sees a public address, the socket's own resolution sees loopback.
    stubSocketDns([{ address: '127.0.0.1', family: 4 }])

    await expect(fetchDocumentationContent(`http://rebind.test:${port}/`)).rejects.toThrow(DISALLOWED_URL_MESSAGE)
    expect(hits).toBe(0)
  })

  it('refuses a hostname when one of its addresses is private', async () => {
    stubSocketDns([{ address: PUBLIC_ADDRESS, family: 4 }, { address: '127.0.0.1', family: 4 }])

    await expect(fetchDocumentationContent(`http://mixed.test:${port}/`)).rejects.toThrow(DISALLOWED_URL_MESSAGE)
    expect(hits).toBe(0)
  })

  it.each([
    'http://127.0.0.1:{port}/',
    'http://[::1]:{port}/',
    'http://[::ffff:127.0.0.1]:{port}/',
    'http://169.254.169.254/latest/meta-data/',
  ])('refuses the private IP literal %s', async (url) => {
    await expect(fetchDocumentationContent(url.replace('{port}', String(port)))).rejects.toThrow(DISALLOWED_URL_MESSAGE)
    expect(hits).toBe(0)
  })
})

describe('publicOnlyLookup', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('hands public addresses to the socket, in both lookup shapes', async () => {
    stubSocketDns([{ address: PUBLIC_ADDRESS, family: 4 }, { address: '2001:db8::1', family: 6 }])

    const all = await new Promise((resolve, reject) => {
      publicOnlyLookup('public.test', { all: true }, (err, addresses) => err ? reject(err) : resolve(addresses))
    })
    expect(all).toEqual([{ address: PUBLIC_ADDRESS, family: 4 }, { address: '2001:db8::1', family: 6 }])

    const single = await new Promise((resolve, reject) => {
      publicOnlyLookup('public.test', {}, (err, address, family) => err ? reject(err) : resolve({ address, family }))
    })
    expect(single).toEqual({ address: PUBLIC_ADDRESS, family: 4 })
  })

  it.each(['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '169.254.169.254', '0.0.0.0'])('refuses %s', async (address) => {
    stubSocketDns([{ address, family: 4 }])

    const error = await new Promise((resolve) => {
      publicOnlyLookup('private.test', { all: true }, err => resolve(err))
    })
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).name).toBe('ForbiddenFetchHostError')
  })
})
