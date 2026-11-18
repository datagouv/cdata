import { config } from 'zod'

// zod, which the AI SDK brings, probes eval with `new Function('')` whenever it builds an
// object schema, unless jitless. The site's CSP has no 'unsafe-eval': Firefox reports the
// probe as a violation. Imported before the SDK, so the option is set when its schemas are built.
config({ jitless: true })
