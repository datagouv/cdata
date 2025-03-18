import { parse } from 'smol-toml'

import { dataToEsm } from '@rollup/pluginutils'

const ext = /\.toml$/

module.exports = {
  name: 'toml',
  transform(toml: string, id: string) {
    if (!ext.test(id)) return null
    const data = parse(toml)
    return dataToEsm(data, {
      preferConst: true,
      objectShorthand: true,
    })
  },
}
