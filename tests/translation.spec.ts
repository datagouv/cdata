import { test, expect } from './base'

test.describe('French translation system', () => {
  test('Should show french translations', async ({ page }) => {
    await page.goto('/design/translations')

    // Vérifier que la page s'affiche correctement
    await expect(page.locator('h1')).toContainText('Test du système de traduction')

    // Vérifier la traduction dans le template avec $t
    await expect(page.locator('p').filter({ hasText: 'Test dans le template avec $t' }))
      .toContainText('Bonjour le monde')

    // Vérifier la traduction avec une phrase complète
    await expect(page.locator('p').filter({ hasText: 'Test avec une phrase' }))
      .toContainText('Ceci est un test de traduction')

    // Vérifier la traduction depuis le composable
    await expect(page.locator('p').filter({ hasText: 'Test depuis le composable' }))
      .toContainText('Message depuis le composable')

    // Vérifier les différents cas de pluralisation
    await expect(page.locator('p').filter({ hasText: '0 élément(s)' }))
      .toContainText('1 jeu de données recommandé')

    await expect(page.locator('p').filter({ hasText: '1 élément(s)' }))
      .toContainText('1 jeu de données recommandé')

    await expect(page.locator('p').filter({ hasText: '2 élément(s)' }))
      .toContainText('2 jeux de données recommandés')

    await expect(page.locator('p').filter({ hasText: '5 élément(s)' }))
      .toContainText('5 jeux de données recommandés')

    // Vérifier la syntaxe zero|one|many avec $t() directement
    await expect(page.locator('p').filter({ hasText: 'Test zero|one|many (0) :' }))
      .toContainText('Vous n\'avez pas de message')

    await expect(page.locator('p').filter({ hasText: 'Test zero|one|many (1) :' }))
      .toContainText('Vous avez un message')

    await expect(page.locator('p').filter({ hasText: 'Test zero|one|many (3) :' }))
      .toContainText('Vous avez 3 messages')

    // Vérifier l'interpolation avec plusieurs valeurs
    await expect(page.locator('p').filter({ hasText: 'Bonjour' }).filter({ hasText: 'bienvenue' }))
      .toContainText('Bonjour Jean, bienvenue sur data.gouv.fr')

    // Vérifier l'interpolation simple
    await expect(page.locator('p').filter({ hasText: 'Vous avez 3 message(s)' }))
      .toContainText('Vous avez 3 message(s)')

    // Vérifier le composant TranslationT avec slots HTML
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec slot :' }))
      .toContainText('Cliquez sur')
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec slot :' }))
      .toContainText('pour continuer')
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec slot :' }).locator('a'))
      .toHaveText('ce lien')
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec slot :' }).locator('a'))
      .toHaveClass(/text-blue-600 underline/)

    // Vérifier TranslationT avec zero|one|many (0 messages)
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec zero|one|many (0) :' }))
      .toContainText('vous n\'avez pas de nouveau message')
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec zero|one|many (0) :' }).locator('strong'))
      .toHaveText('Marie')

    // Vérifier TranslationT avec zero|one|many (1 message)
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec zero|one|many (1) :' }))
      .toContainText('vous avez un nouveau message')
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec zero|one|many (1) :' }).locator('strong'))
      .toHaveText('Marie')

    // Vérifier TranslationT avec zero|one|many (10 messages)
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec zero|one|many (10) :' }))
      .toContainText('vous avez 10 nouveaux messages')
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec zero|one|many (10) :' }).locator('strong'))
      .toHaveText('Marie')

    // Vérifier TranslationT avec pluralisation
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec pluralisation :' }))
      .toContainText('10 résultats trouvés')
  })
})

test.describe('English translation system', () => {
  test.use({ locale: 'en-US' })

  test('Should translate to English when Accept-Language is en', async ({ page }) => {
    await page.goto('/design/translations')

    // Verify basic translation via $t
    await expect(page.locator('p').filter({ hasText: 'Test dans le template avec $t' }))
      .toContainText('Hello world')

    // Verify translation via composable
    await expect(page.locator('p').filter({ hasText: 'Test depuis le composable' }))
      .toContainText('Message from composable')

    // Verify TranslationT component
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec slot' }))
      .toContainText('Click on')
    await expect(page.locator('p').filter({ hasText: 'Test TranslationT avec slot' }).locator('a'))
      .toHaveText('this link')
  })
})
