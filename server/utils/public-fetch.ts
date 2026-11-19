/**
 * Keeps server-initiated HTTP(S) fetches of user-supplied URLs on public hosts (SSRF mitigation).
 *
 * Two independent concerns, mirroring udata's `udata/ssrf.py`:
 * - when: the address is checked by the socket's own DNS lookup, so the checked address is the
 *   connected one (no DNS rebinding window, every redirect hop checked);
 * - what: only plain unicast addresses pass. Anything ipaddr.js classifies in a special-purpose
 *   range is refused, IPv6 addresses carrying an IPv4 (IPv4-mapped, 6to4, NAT64) included:
 *   blocking a reachable host is fixable on report, letting a private one through is not.
 */

import dns from 'node:dns'
import net, { type LookupFunction } from 'node:net'
import ipaddr from 'ipaddr.js'
import { Agent, buildConnector } from 'undici'

// ipaddr.js calls "unicast" any IPv6 address outside its special ranges, IPv4-compatible
// ::/96 included: only global unicast can be public.
const GLOBAL_UNICAST_IPV6 = ipaddr.IPv6.parseCIDR('2000::/3')

/**
 * Whether the IP address `addressWithZone` (no brackets, zone index allowed) must not be fetched.
 * Anything that is not an IP address is refused.
 */
export function isForbiddenAddress(addressWithZone: string): boolean {
  // A zone index (fe80::1%eth0) only scopes a link-local address, it never makes one public.
  const address = addressWithZone.split('%')[0]
  // net.isIP first: ipaddr.parse also reads the shorthand IPv4 forms (127.1, 0x7f.0.0.1).
  if (!net.isIP(address)) {
    return true
  }
  const parsed = ipaddr.parse(address)
  if (parsed.range() !== 'unicast') {
    return true
  }
  return parsed.kind() === 'ipv6' && !parsed.match(GLOBAL_UNICAST_IPV6)
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
    // A name that does not resolve is refused like a private one: told apart, the two answers
    // would let anyone list the internal names the server's resolver knows.
    if (err || !addresses.length || addresses.some(a => isForbiddenAddress(a.address))) {
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
