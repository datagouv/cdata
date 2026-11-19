import dns, { type LookupAddress } from 'node:dns'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { fetch } from 'undici'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { fetchDocumentationContent } from '~/server/routes/nuxt-api/albert/utils/fetch-documentation'
import { ForbiddenFetchHostError, isForbiddenAddress, publicFetchDispatcher, publicOnlyLookup } from '~/server/utils/public-fetch'

const DISALLOWED_URL_MESSAGE = 'Documentation URL is not allowed. Use a public http(s) URL.'
const PUBLIC_ADDRESS = '1.1.1.1'
const PUBLIC_IPV6_ADDRESS = '2606:4700:4700::1111'

// The attacker's resolver for any resolution done apart from the socket: a host check made in a
// separate lookup sees a public address, while the socket (see `stubSocketDns`) sees a private one.
// Hoisted above the declarations, hence the literal instead of PUBLIC_ADDRESS.
vi.mock('node:dns/promises', () => ({ lookup: async () => [{ address: '1.1.1.1', family: 4 }] }))

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
    // Dual-stack, like a server bound to every interface: reachable through 127.0.0.1, ::1 and ::.
    await new Promise<void>(resolve => server.listen(0, '::', resolve))
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
    stubSocketDns([{ address: '127.0.0.1', family: 4 }])

    await expect(fetchDocumentationContent(`http://rebind.test:${port}/`)).rejects.toThrow(DISALLOWED_URL_MESSAGE)
    expect(hits).toBe(0)
  })

  it('refuses a hostname resolving to loopback over https too', async () => {
    // The lookup reaches TLS sockets through a different Node call than plain ones.
    stubSocketDns([{ address: '127.0.0.1', family: 4 }])

    await expect(fetchDocumentationContent(`https://rebind.test:${port}/`)).rejects.toThrow(DISALLOWED_URL_MESSAGE)
    expect(hits).toBe(0)
  })

  it('refuses a hostname resolving to the unspecified IPv6 address', async () => {
    stubSocketDns([{ address: '::', family: 6 }])

    await expect(fetchDocumentationContent(`http://unspecified.test:${port}/`)).rejects.toThrow(DISALLOWED_URL_MESSAGE)
    expect(hits).toBe(0)
  })

  it('refuses a hostname when one of its addresses is private', async () => {
    stubSocketDns([{ address: PUBLIC_ADDRESS, family: 4 }, { address: '127.0.0.1', family: 4 }])

    await expect(fetchDocumentationContent(`http://mixed.test:${port}/`)).rejects.toThrow(DISALLOWED_URL_MESSAGE)
    expect(hits).toBe(0)
  })

  it('answers an unresolvable hostname as it answers a private one', async () => {
    vi.spyOn(dns, 'lookup').mockImplementation(((hostname: string, _options: dns.LookupOptions, callback: LookupCallback) => {
      callback(Object.assign(new Error(`getaddrinfo ENOTFOUND ${hostname}`), { code: 'ENOTFOUND' }), '')
    }) as typeof dns.lookup)

    await expect(fetchDocumentationContent(`http://missing.test:${port}/`)).rejects.toThrow(DISALLOWED_URL_MESSAGE)
  })

  it.each([
    'http://127.0.0.1:{port}/',
    'http://0.0.0.0:{port}/',
    'http://[::1]:{port}/',
    'http://[::]:{port}/',
    'http://[::ffff:127.0.0.1]:{port}/',
    'http://169.254.169.254/latest/meta-data/',
  ])('refuses the private IP literal %s', async (url) => {
    await expect(fetchDocumentationContent(url.replace('{port}', String(port)))).rejects.toThrow(DISALLOWED_URL_MESSAGE)
    expect(hits).toBe(0)
  })
})

describe('publicFetchDispatcher', () => {
  let server: Server
  let port: number
  let hits = 0

  beforeAll(async () => {
    server = createServer((_req, res) => {
      hits++
      res.end('internal secret')
    })
    await new Promise<void>(resolve => server.listen(0, '::', resolve))
    port = (server.address() as AddressInfo).port
  })

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve))
  })

  afterEach(() => {
    hits = 0
  })

  it.each(['127.0.0.1', '[::1]'])('refuses the private IP literal %s on its own, without the caller checking the URL', async (host) => {
    const error = await fetch(`http://${host}:${port}/`, { dispatcher: publicFetchDispatcher }).catch(err => err)

    expect(error).toBeInstanceOf(TypeError)
    expect((error as TypeError).cause).toBeInstanceOf(ForbiddenFetchHostError)
    expect(hits).toBe(0)
  })
})

describe('isForbiddenAddress', () => {
  it.each([
    '0.0.0.0',
    '10.0.0.1',
    '100.64.0.1', // CGNAT
    '127.0.0.1',
    '169.254.169.254', // cloud metadata
    '172.16.0.1',
    '192.0.0.1',
    '192.0.2.1',
    '192.168.1.1',
    '198.18.0.1',
    '198.51.100.1',
    '203.0.113.1',
    '224.0.0.1',
    '255.255.255.255',
    '::',
    '::1',
    '::7f00:1', // IPv4-compatible
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    '::ffff:a9fe:a9fe',
    '64:ff9b::7f00:1', // NAT64 of 127.0.0.1
    '64:ff9b::a9fe:a9fe', // NAT64 of 169.254.169.254
    '2002:7f00:1::', // 6to4 of 127.0.0.1
    '2002:a9fe:a9fe::1',
    '100::1', // discard-only
    '2001::1', // Teredo
    '2001:db8::1',
    '3fff::1',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    'fe80::1%eth0',
    'fec0::1', // site-local
    'ff02::1',
    // An IPv6 address carrying an IPv4 is refused whatever the IPv4, public ones included.
    '::ffff:1.1.1.1',
    '64:ff9b::101:101', // NAT64 of 1.1.1.1
    '2002:101:101::1', // 6to4 of 1.1.1.1
  ])('refuses %s', (address) => {
    expect(isForbiddenAddress(address)).toBe(true)
  })

  it.each([
    PUBLIC_ADDRESS,
    '8.8.8.8',
    PUBLIC_IPV6_ADDRESS,
  ])('accepts %s', (address) => {
    expect(isForbiddenAddress(address)).toBe(false)
  })
})

describe('publicOnlyLookup', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('hands public addresses to the socket, in both lookup shapes', async () => {
    stubSocketDns([{ address: PUBLIC_ADDRESS, family: 4 }, { address: PUBLIC_IPV6_ADDRESS, family: 6 }])

    const all = await new Promise((resolve, reject) => {
      publicOnlyLookup('public.test', { all: true }, (err, addresses) => err ? reject(err) : resolve(addresses))
    })
    expect(all).toEqual([{ address: PUBLIC_ADDRESS, family: 4 }, { address: PUBLIC_IPV6_ADDRESS, family: 6 }])

    const single = await new Promise((resolve, reject) => {
      publicOnlyLookup('public.test', {}, (err, address, family) => err ? reject(err) : resolve({ address, family }))
    })
    expect(single).toEqual({ address: PUBLIC_ADDRESS, family: 4 })
  })

  it.each([
    { address: '127.0.0.1', family: 4 },
    { address: '169.254.169.254', family: 4 },
    { address: '::', family: 6 },
    { address: '64:ff9b::a9fe:a9fe', family: 6 },
  ])('refuses $address', async (record) => {
    stubSocketDns([record])

    const error = await new Promise((resolve) => {
      publicOnlyLookup('private.test', { all: true }, err => resolve(err))
    })
    expect(error).toBeInstanceOf(ForbiddenFetchHostError)
  })
})
