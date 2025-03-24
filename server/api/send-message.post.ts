import { Crisp } from 'crisp-api'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const CrispClient = new Crisp()

  const config = useRuntimeConfig(event)
  const websiteId = '60fe27e1-7f04-45c9-8b0d-833e95f10c79'
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
    })
  }
  try {
    const { session_id: sessionId } = await CrispClient.website.createNewConversation(websiteId)
    await CrispClient.website.updateConversationMetas(websiteId, sessionId, {
      email,
    })
    CrispClient.website.sendMessageInConversation(websiteId, sessionId, message)
  }
  catch (e) {
    console.log(e)
  }
})
