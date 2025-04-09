import { Crisp } from 'crisp-api'

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
  const websiteId = config.crispWebsiteId
  CrispClient.authenticateTier('plugin', config.crispIdentifier, config.crispKey)

  const message = {
    type: 'text',
    from: 'user',
    origin: 'email',
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
        nickname: 'Visiteur',
      },
    })
  }
  try {
    const { session_id: sessionId } = await CrispClient.website.createNewConversation(websiteId)
    await CrispClient.website.updateConversationMetas(websiteId, sessionId, {
      email,
      segments: ['support.data.gouv.fr', body.segment],
    })
    CrispClient.website.sendMessageInConversation(websiteId, sessionId, message)
  }
  catch (e) {
    console.error(e)
  }
})
