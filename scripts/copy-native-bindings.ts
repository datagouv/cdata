import { cpSync, existsSync, readFileSync } from 'node:fs'

// @takumi-rs/core (used by nuxt-og-image) loads platform-specific NAPI bindings
// via conditional require() (e.g. require('@takumi-rs/core-linux-x64-gnu')).
// Nitro's @vercel/nft tracer can't follow these because they're optional
// dependencies never directly imported in source code — Rollup's resolver
// doesn't find them (nitro.externals.traceInclude fails with "File does not exist").
// We copy them manually into .output after build.
// If Nitro fixes this, the check below will make the build fail so we can remove
// this workaround.

const dest = '.output/server/node_modules/@takumi-rs'
const pkgJson = JSON.parse(readFileSync('node_modules/@takumi-rs/core/package.json', 'utf-8'))
const bindings = Object.keys(pkgJson.optionalDependencies ?? {})

let copied = 0
for (const binding of bindings) {
  const name = binding.replace('@takumi-rs/', '')
  const src = `node_modules/@takumi-rs/${name}`

  if (!existsSync(src)) continue

  if (existsSync(`${dest}/${name}`)) {
    console.error(
      `ERROR: Nitro now traces ${binding} automatically — remove this workaround (scripts/copy-native-bindings.ts and the build script in package.json)`,
    )
    process.exit(1)
  }

  cpSync(src, `${dest}/${name}`, { recursive: true })
  console.log(`Copied ${binding} into .output`)
  copied++
}

if (copied === 0) {
  console.error('ERROR: No @takumi-rs native binding found for this platform')
  process.exit(1)
}
