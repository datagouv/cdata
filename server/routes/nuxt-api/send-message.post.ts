import { Crisp } from 'crisp-api'

export function getNicknameFromEmail(email: string) {
  const nicknameParts = email.split('@')[0].split('.')
  return nicknameParts.map(part => part.toLowerCase()).join(' ')
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
  const CrispClient = new Crisp()

  const config = useRuntimeConfig(event)
  const websiteId = config.crispWebsiteId as string
  CrispClient.authenticateTier('plugin', config.crispIdentifier as string, config.crispKey as string)

  const message = {
    type: 'text' as const,
    from: 'user' as const,
    origin: 'email' as const,
    content: `**${body.subject}**\n\n${body.body}`,
  }

  const email = body.email

  let newPeople = false
  try {
    await CrispClient.website.checkPeopleProfileExists(websiteId, email)
  }
  catch {
    newPeople = true
  }
  if (newPeople) {
    CrispClient.website.addNewPeopleProfile(websiteId, {
      email,
      person: {
        nickname: getNicknameFromEmail(email),
      },
    })
  }
  try {
    const { session_id: sessionId } = await CrispClient.website.createNewConversation(websiteId)
    if (!sessionId) throw new Error('Crisp conversation creation returned no session_id')
    await CrispClient.website.updateConversationMetas(websiteId, sessionId, {
      email,
      nickname: getNicknameFromEmail(email),
      segments: ['support.data.gouv.fr', body.segment],
    })
    CrispClient.website.sendMessageInConversation(websiteId, sessionId, message)
  }
  catch (e) {
    console.error(e)
  }
})
