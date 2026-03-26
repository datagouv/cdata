const CRISP_API_BASE = 'https://api.crisp.chat/v1'

export function getNicknameFromEmail(email: string) {
  const nicknameParts = email.split('@')[0].split('.')
  return nicknameParts.map(part => part.toLowerCase()).join(' ')
}

function crispFetch(path: string, { identifier, key, method = 'GET', body }: {
  identifier: string
  key: string
  method?: 'GET' | 'POST' | 'PATCH' | 'HEAD'
  body?: unknown
}) {
  return $fetch(`${CRISP_API_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Basic ${Buffer.from(`${identifier}:${key}`).toString('base64')}`,
      'X-Crisp-Tier': 'plugin',
    },
    body: body ?? undefined,
  })
}

export default defineEventHandler(async (event) => {
  // Prevents the use of `application/x-www-form-urlencoded` which is subject to CSRF request
  if (event.headers.get('Content-Type') !== 'application/json') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Content type should be application/json',
    })
  }
  const body = await readBody(event)

  const config = useRuntimeConfig(event)
  const websiteId = config.crispWebsiteId as string
  const auth = { identifier: config.crispIdentifier as string, key: config.crispKey as string }

  const message = {
    type: 'text' as const,
    from: 'user' as const,
    origin: 'email' as const,
    content: `**${body.subject}**\n\n${body.body}`,
  }

  const email = body.email

  let newPeople = false
  try {
    await crispFetch(`/website/${websiteId}/people/profile/${email}`, { ...auth, method: 'HEAD' })
  }
  catch {
    newPeople = true
  }
  if (newPeople) {
    await crispFetch(`/website/${websiteId}/people/profile`, {
      ...auth,
      method: 'POST',
      body: {
        email,
        person: {
          nickname: getNicknameFromEmail(email),
        },
      },
    })
  }
  try {
    const { data } = await crispFetch(`/website/${websiteId}/conversation`, { ...auth, method: 'POST' }) as { data: { session_id?: string } }
    const sessionId = data.session_id
    if (!sessionId) throw new Error('Crisp conversation creation returned no session_id')
    await crispFetch(`/website/${websiteId}/conversation/${sessionId}/meta`, {
      ...auth,
      method: 'PATCH',
      body: {
        email,
        nickname: getNicknameFromEmail(email),
        segments: ['support.data.gouv.fr', body.segment],
      },
    })
    await crispFetch(`/website/${websiteId}/conversation/${sessionId}/message`, {
      ...auth,
      method: 'POST',
      body: message,
    })
  }
  catch (e) {
    console.error(e)
  }
})
