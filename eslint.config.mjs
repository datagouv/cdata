// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      // Disabled to allow intentional non-breaking spaces (&nbsp;) in French text strings
      // which are required for proper typography (e.g., spaces before punctuation marks like ?, !, :)
      'no-irregular-whitespace': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },
)
