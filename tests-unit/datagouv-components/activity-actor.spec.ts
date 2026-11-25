import { describe, expect, it } from 'vitest'
import { renderToString } from 'vue/server-renderer'
import { createSSRApp, h } from 'vue'
import ActivityActor from '~/datagouv-components/src/components/ActivityList/ActivityActor.vue'
import { configKey } from '~/datagouv-components/src/config'
import type { ActivityActor as Actor } from '~/datagouv-components/src/types/activity'
import type { UserReference } from '~/datagouv-components/src/types/users'

const owner: UserReference = {
  class: 'User',
  id: 'u1',
  first_name: 'Jeanne',
  last_name: 'Martin',
  slug: 'jeanne-martin',
  uri: 'http://api.test/api/1/users/jeanne-martin/',
  page: 'http://www.test/users/jeanne-martin/',
  avatar: '',
  avatar_thumbnail: '',
}

async function render(actor: Actor) {
  const app = createSSRApp({ render: () => h(ActivityActor, { actor, withLink: false }) })
  app.provide(configKey, { name: 'data.gouv.fr', baseUrl: 'http://www.test', apiBase: 'http://api.test' })
  return renderToString(app)
}

describe('an API token actor', () => {
  it('shows its owner and the name of the key', async () => {
    const html = await render({ class: 'ApiToken', id: 't1', owner, name: 'CI prod' })
    expect(html).toContain('Jeanne Martin')
    expect(html).toContain('via la clé d&#39;API « CI prod »')
  })

  it('shows its owner alone when the name is hidden or missing', async () => {
    const html = await render({ class: 'ApiToken', id: 't1', owner, name: null })
    expect(html).toContain('Jeanne Martin')
    expect(html).toContain('via une clé d&#39;API')
  })
})

describe('an OAuth2 token actor', () => {
  it('shows its owner and the application it acted through', async () => {
    const html = await render({
      class: 'OAuth2Token',
      id: 't2',
      owner,
      client: { class: 'OAuth2Client', id: 'c1', name: 'Mon appli' },
    })
    expect(html).toContain('Jeanne Martin')
    expect(html).toContain('via Mon appli')
  })
})

describe('a harvest source actor', () => {
  it('shows the name of the source', async () => {
    const html = await render({ class: 'HarvestSource', id: 's1', name: 'Géo IDE' })
    expect(html).toContain('Géo IDE')
    expect(html).not.toContain('Moissonnage supprimé')
  })

  it('says the source is gone once it has been purged', async () => {
    const html = await render({ class: 'HarvestSource', id: 's1', name: null })
    expect(html).toContain('Moissonnage supprimé')
  })
})
