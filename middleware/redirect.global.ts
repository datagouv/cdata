type SearchRedirect = {
  path: string
  facets: Array<string>
}

// Editorial pages took over /datasets, /reuses and /dataservices, which used to be the
// search pages themselves. A facet in the query means the visitor followed one of those
// old search URLs, which stay indexed and linked from outside. Redirecting from the
// middleware rather than from the pages makes it a real HTTP redirect: clients that run
// no JS (crawlers included) reach the results, and the editorial page is never rendered
// only to be thrown away.
const SEARCH_REDIRECTS: Record<string, SearchRedirect> = {
  '/datasets': {
    path: '/datasets/search',
    facets: ['q', 'tag', 'format', 'license', 'organization', 'organization_badge', 'geozone', 'granularity', 'schema', 'sort', 'page'],
  },
  '/reuses': {
    path: '/reuses/search',
    facets: ['q', 'sort', 'tag', 'topic', 'page'],
  },
  '/dataservices': {
    path: '/dataservices/search',
    facets: ['q', 'sort', 'is_restricted', 'organization', 'page'],
  },
}

export default defineNuxtRouteMiddleware((to, _from) => {
  // Strip locale prefix and redirect to version without it
  if (to.path.startsWith('/fr/') || to.path.startsWith('/en/') || to.path.startsWith('/es/')) {
    return navigateTo(to.path.slice(3), {
      redirectCode: 308,
    })
  }
  // Strip trailing slash and redirect to version without it
  if (to.path.endsWith('/') && to.path.length > 1) {
    const newPath = to.path.replace(/\/+$/, '')
    return navigateTo(to.fullPath.replace(to.path, newPath), {
      redirectCode: 308,
    })
  }

  const searchRedirect = SEARCH_REDIRECTS[to.path]
  if (searchRedirect && Object.keys(to.query).some(key => searchRedirect.facets.includes(key))) {
    return navigateTo({ path: searchRedirect.path, query: to.query }, {
      redirectCode: 308,
    })
  }

  const me = useMaybeMe()

  // logged user shouldn't access to login, register, etc. routes
  if (me.value && isUnloggedSecurityRoute(to.path)) {
    return navigateTo('/')
  }
})
