import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended, // we should move to vueTsConfigs.recommendedTypeChecked or even strictTypeChecked
  {
    rules: {
      // Disabled to allow intentional non-breaking spaces (&nbsp;) in French text strings
      // which are required for proper typography (e.g., spaces before punctuation marks like ?, !, :)
      'no-irregular-whitespace': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },
  skipFormatting,
)
