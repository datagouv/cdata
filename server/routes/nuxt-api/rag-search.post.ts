export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const config = useRuntimeConfig(event)
    const response = await fetch('https://albert.api.etalab.gouv.fr/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.albertApiKey
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (err) {
    return createError({
      statusCode: 500,
      statusMessage: JSON.stringify(body),
    })
  }
})
