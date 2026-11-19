/**
 * Keeps server-initiated HTTP(S) fetches of user-supplied URLs on public hosts (SSRF mitigation).
 *
 * Two independent concerns, mirroring udata's `udata/ssrf.py`:
 * - when: the address is checked by the socket's own DNS lookup, so the checked address is the
 *   connected one (no DNS rebinding window, every redirect hop checked);
 * - what: only globally reachable addresses pass. Anything the IANA special-purpose registries
 *   do not mark as global is refused, rather than enumerating the ranges known to be dangerous.
 */

import dns from 'node:dns'
import net, { BlockList, type LookupFunction } from 'node:net'
import { Agent, buildConnector } from 'undici'

/** IPv4 ranges that are not globally reachable (IANA IPv4 special-purpose registry), plus multicast. */
const NON_GLOBAL_IPV4 = new BlockList()
for (const [network, prefix] of [
  ['0.0.0.0', 8], // "this network", 0.0.0.0 reaches localhost
  ['10.0.0.0', 8], // private
  ['100.64.0.0', 10], // shared address space (CGNAT)
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local, cloud instance metadata (169.254.169.254)
  ['172.16.0.0', 12], // private
  ['192.0.0.0', 24], // IETF protocol assignments
  ['192.0.2.0', 24], // documentation (TEST-NET-1)
  ['192.168.0.0', 16], // private
  ['198.18.0.0', 15], // benchmarking
  ['198.51.100.0', 24], // documentation (TEST-NET-2)
  ['203.0.113.0', 24], // documentation (TEST-NET-3)
  ['224.0.0.0', 4], // multicast
  ['240.0.0.0', 4], // reserved, broadcast
] as const) {
  NON_GLOBAL_IPV4.addSubnet(network, prefix, 'ipv4')
}

/**
 * IPv6 is checked the other way around: only global unicast (2000::/3) can be public, which
 * rules out ::, ::1, IPv4-compatible ::/96, ULA, link-local, site-local and multicast at once.
 */
const GLOBAL_UNICAST_IPV6 = new BlockList()
GLOBAL_UNICAST_IPV6.addSubnet('2000::', 3, 'ipv6')

/** Non-global ranges inside 2000::/3 (IANA IPv6 special-purpose registry). */
const NON_GLOBAL_IPV6 = new BlockList()
for (const [network, prefix] of [
  ['2001::', 23], // IETF protocol assignments (Teredo, benchmarking, ORCHID…)
  ['2001:db8::', 32], // documentation
  ['3fff::', 20], // documentation
] as const) {
  NON_GLOBAL_IPV6.addSubnet(network, prefix, 'ipv6')
}

/** The eight 16-bit groups of a valid IPv6 address. */
function ipv6Hextets(address: string): number[] {
  let text = address.toLowerCase()
  const dottedTail = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(text)
  if (dottedTail) {
    const [o1, o2, o3, o4] = dottedTail.slice(1).map(Number)
    text = `${text.slice(0, dottedTail.index)}${((o1 << 8) | o2).toString(16)}:${((o3 << 8) | o4).toString(16)}`
  }
  const [head, tail] = text.split('::')
  const headGroups = head ? head.split(':') : []
  const tailGroups = tail ? tail.split(':') : []
  const zeros = tail === undefined ? [] : Array(8 - headGroups.length - tailGroups.length).fill('0')
  return [...headGroups, ...zeros, ...tailGroups].map(group => Number.parseInt(group, 16))
}

function ipv4FromHextets(high: number, low: number): string {
  return `${high >> 8}.${high & 0xFF}.${low >> 8}.${low & 0xFF}`
}

/**
 * The IPv4 address an IPv6 address routes to, if any: `::ffff:7f00:1`, `2002:7f00:1::` and
 * `64:ff9b::7f00:1` all reach 127.0.0.1. Unwrapping keeps them from smuggling a private target,
 * and keeps a NAT64 address standing for a public IPv4 reachable.
 */
function embeddedIpv4(address: string): string | null {
  const h = ipv6Hextets(address)
  const firstFiveZero = h.slice(0, 5).every(group => group === 0)
  // ::ffff:0:0/96 — IPv4-mapped
  if (firstFiveZero && h[5] === 0xFFFF) {
    return ipv4FromHextets(h[6], h[7])
  }
  // 2002::/16 — 6to4
  if (h[0] === 0x2002) {
    return ipv4FromHextets(h[1], h[2])
  }
  // 64:ff9b::/96 — NAT64 well-known prefix
  if (h[0] === 0x64 && h[1] === 0xFF9B && h.slice(2, 6).every(group => group === 0)) {
    return ipv4FromHextets(h[6], h[7])
  }
  return null
}

/** Whether `address` (a valid IPv4 or IPv6 address, no brackets) must not be fetched. */
export function isForbiddenAddress(addressWithZone: string): boolean {
  // A zone index (fe80::1%eth0) only scopes a link-local address, it never makes one public.
  const address = addressWithZone.split('%')[0]
  const family = net.isIP(address)
  if (family === 4) {
    return NON_GLOBAL_IPV4.check(address, 'ipv4')
  }
  if (family !== 6) {
    return true
  }
  const ipv4 = embeddedIpv4(address)
  if (ipv4) {
    return NON_GLOBAL_IPV4.check(ipv4, 'ipv4')
  }
  return !GLOBAL_UNICAST_IPV6.check(address, 'ipv6') || NON_GLOBAL_IPV6.check(address, 'ipv6')
}

export class ForbiddenFetchHostError extends Error {
  constructor(hostname: string) {
    super(`Refusing to connect to non-public host ${hostname}`)
    this.name = 'ForbiddenFetchHostError'
  }
}

/**
 * DNS lookup used by the socket itself: the addresses it validates are the ones the connection
 * uses. Checking a hostname in a separate lookup before fetching is not enough, since a
 * DNS-rebinding name can answer a public IP to the check and a private one to the connection.
 *
 * Unlike udata, which only rules out the blocked candidates, a host with any non-public address
 * is refused as a whole: a legitimate documentation host has no reason to publish one.
 */
export const publicOnlyLookup: LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) {
      callback(err, '')
      return
    }
    if (!addresses.length || addresses.some(a => isForbiddenAddress(a.address))) {
      callback(new ForbiddenFetchHostError(hostname), '')
      return
    }
    if (options.all) {
      callback(null, addresses)
      return
    }
    callback(null, addresses[0].address, addresses[0].family)
  })
}

const connectThroughPublicOnlyLookup = buildConnector({ lookup: publicOnlyLookup })

/**
 * Dispatcher for fetches of user-supplied URLs: every connection, redirects included, is to a
 * public address. Sockets skip the DNS lookup for IP literals, so `publicOnlyLookup` never sees
 * them: the connector checks them itself.
 */
export const publicFetchDispatcher = new Agent({
  connect: (options, callback) => {
    if (net.isIP(options.hostname) && isForbiddenAddress(options.hostname)) {
      callback(new ForbiddenFetchHostError(options.hostname), null)
      return
    }
    connectThroughPublicOnlyLookup(options, callback)
  },
})

/**
 * Whether `error` (a fetch failure) was caused by `publicOnlyLookup` refusing the host.
 */
export function isForbiddenFetchHostError(error: unknown): boolean {
  let current: unknown = error
  while (current instanceof Error) {
    if (current instanceof ForbiddenFetchHostError) {
      return true
    }
    current = current.cause
  }
  return false
}
