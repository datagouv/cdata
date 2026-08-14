import { readFileSync } from 'node:fs'
import * as path from 'node:path'
import type { Page } from '@playwright/test'
import { test, expect } from '../base'
import { createOrganization, deleteDatasets, deleteOrganizations, type ApiOrganization } from '../helpers'

// These tests replay the situation reported in datagouv/data.gouv.fr#2060 with the very
// files it was reported with: a washing machine durability record, exported as CSV
// (comma and semicolon), XLSX and ODS.
//
// The catalog, the schema definitions and Validata are stubbed. What is under test is
// what the wizard does with an answer, not the services producing it, and stubbing lets
// a test state the exact validation report it works against instead of discovering it.

const FIXTURES = path.join(import.meta.dirname, '../fixtures/structured-publication')

const fixture = (name: string) => path.join(FIXTURES, name)

const SCHEMA_HOST = 'https://schema.test.local'

// Column counts are measured against the fixture file, not assumed.
// The names are the real ones: udata validates a resource's schema against its own
// catalog (udata/core/dataset/models.py), so a made-up name fails publication with a 400.
const SCHEMAS = {
  // Every one of the file's 228 columns belongs to it
  durabilite: {
    name: 'etalab/indice-durabilite-lave-linge',
    file: 'schema-durabilite-lave-linge.json',
    title: 'Indice de durabilité - Lave-linge',
  },
  // Shares 190 columns with the file, 38 remain unknown: the schema of the report
  reparabilite: {
    name: 'etalab/schema-indice-reparabilite',
    file: 'schema-reparabilite.json',
    title: 'Indice de réparabilité',
  },
  // Nothing in common at all
  irve: {
    name: 'etalab/schema-irve-statique',
    file: 'schema-irve-statique.json',
    title: 'IRVE statique',
  },
}

type SchemaKey = keyof typeof SCHEMAS

const FILE_COLUMNS = 228
const UNKNOWN_FOR_REPARABILITE = 38

const VALID_REPORT = { report: { valid: true, errors: [], stats: { errors: 0, warnings: 0, rows_processed: 1 } } }

function reportWithErrors(count: number) {
  return {
    report: {
      valid: false,
      stats: { errors: count, warnings: 0, rows_processed: 1 },
      errors: Array.from({ length: count }, (_, index) => ({
        title: 'Valeur incorrecte',
        message: `La valeur de la colonne ${index + 1} est incorrecte`,
        type: 'constraint-error',
        rowNumber: 2,
        fieldName: 'note_id',
      })),
    },
  }
}

/**
 * Stubs every service the wizard talks to. The returned object lets a test change the
 * validation report between two steps, which is how the "wrong schema, then the right
 * one" scenario expresses that the file now validates.
 */
async function stubPublicationApis(page: Page) {
  const state = { validation: VALID_REPORT as unknown }

  await page.route(/\/api\/1\/datasets\/schemas\//, route => route.fulfill({
    json: Object.entries(SCHEMAS).map(([key, schema]) => ({
      name: schema.name,
      title: schema.title,
      description: `Schéma de test ${schema.title}`,
      schema_type: 'tableschema',
      schema_url: `${SCHEMA_HOST}/${key}/schema.json`,
      // `latest` is always accepted by udata, so the stub needs no real version number
      versions: [{ version_name: 'latest', schema_url: `${SCHEMA_HOST}/${key}/schema.json` }],
      labels: [],
      examples: [],
      homepage: '',
      contact: '',
      external_doc: null,
      external_tool: null,
      consolidation_dataset_id: null,
      datapackage_name: null,
      datapackage_title: null,
      datapackage_description: null,
    })),
  }))

  await page.route(new RegExp(`${SCHEMA_HOST}/`), (route) => {
    const key = new URL(route.request().url()).pathname.split('/')[1] as SchemaKey
    return route.fulfill({ body: readFileSync(fixture(SCHEMAS[key].file), 'utf8'), contentType: 'application/json' })
  })

  await page.route(/api\.validata\.etalab\.studio\/validate/, route => route.fulfill({ json: state.validation }))

  return state
}

// --- Wizard navigation

// Publishing with a schema is only offered on behalf of an organization, so each test
// gets its own rather than depending on what the test account happens to belong to
let organization: ApiOrganization

test.beforeEach(async ({ request }) => {
  organization = await createOrganization(request, `Éditeur tableur ${Date.now()}${Math.random().toString(36).slice(2, 8)}`)
})

// A test that goes through to publication creates a real dataset, which has to go too
const createdDatasets: Array<string> = []

test.afterEach(async ({ request }) => {
  await deleteDatasets(request, createdDatasets)
  await deleteOrganizations(request, [organization.id])
})

function collectCreatedDatasets(page: Page) {
  page.on('response', async (response) => {
    if (response.request().method() !== 'POST') return
    if (!/\/api\/1\/datasets\/$/.test(response.url()) || !response.ok()) return

    createdDatasets.push((await response.json()).id)
  })
}

async function selectSchema(page: Page, schema: SchemaKey) {
  await page.getByRole('searchbox', { name: 'Rechercher un schéma' }).fill(SCHEMAS[schema].title)
  await page.getByRole('option', { name: SCHEMAS[schema].title }).click()
}

async function selectProducer(page: Page) {
  await page.getByTestId('producer-select').click()
  await page.getByRole('option', { name: organization.name, exact: true }).click()
}

async function startWizard(page: Page, schema: SchemaKey) {
  await page.goto('/admin/datasets/structured?step=1')
  await selectProducer(page)
  await selectSchema(page, schema)
  await page.getByRole('button', { name: 'Suivant' }).click()
}

async function uploadAndOpenSpreadsheet(page: Page, fileName: string) {
  await page.locator('input[type="file"]').setInputFiles(fixture(fileName))
  await page.getByRole('button', { name: 'Suivant' }).click()
}

test.describe('choix du schéma', () => {
  test('les résultats de recherche restent visibles après une sélection', async ({ page }) => {
    await stubPublicationApis(page)
    await page.goto('/admin/datasets/structured?step=1')

    await page.getByRole('searchbox', { name: 'Rechercher un schéma' }).fill('test')
    await expect(page.getByRole('option')).toHaveCount(3)

    await page.getByRole('option', { name: SCHEMAS.durabilite.title }).click()

    // Selecting one used to hide the others, leaving "3 résultats trouvés" above an
    // empty list and no way to change one's mind without clearing the search
    await expect(page.getByRole('option')).toHaveCount(3)
    await expect(page.getByRole('option', { name: SCHEMAS.durabilite.title })).toHaveAttribute('aria-selected', 'true')
  })

  test('on peut passer directement d’un schéma à un autre', async ({ page }) => {
    await stubPublicationApis(page)
    await page.goto('/admin/datasets/structured?step=1')

    await page.getByRole('searchbox', { name: 'Rechercher un schéma' }).fill('test')
    await page.getByRole('option', { name: SCHEMAS.durabilite.title }).click()
    await page.getByRole('option', { name: SCHEMAS.irve.title }).click()

    await expect(page.getByRole('option', { name: SCHEMAS.irve.title })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('option', { name: SCHEMAS.durabilite.title })).toHaveAttribute('aria-selected', 'false')
  })

  test('sélectionner un schéma n’affiche jamais l’erreur « vous devez sélectionner un schéma »', async ({ page }) => {
    await stubPublicationApis(page)
    await page.goto('/admin/datasets/structured?step=1')

    await page.getByRole('searchbox', { name: 'Rechercher un schéma' }).fill('test')
    await page.getByRole('option', { name: SCHEMAS.durabilite.title }).click()

    // Leaving the search field used to validate the empty selection before the click
    // was handled, flashing the error and hiding it again
    await expect(page.getByText('Vous devez sélectionner un schéma')).toHaveCount(0)
  })

  test('la recherche ignore les accents et les séparateurs', async ({ page }) => {
    await stubPublicationApis(page)
    await page.goto('/admin/datasets/structured?step=1')

    const search = page.getByRole('searchbox', { name: 'Rechercher un schéma' })

    // « Lave-linge » is written with a hyphen, people type a space
    await search.fill('lave linge')
    await expect(page.getByRole('option')).toHaveCount(1)
    await expect(page.getByRole('option', { name: SCHEMAS.durabilite.title })).toBeVisible()

    // « réparabilité » carries accents, people rarely type them
    await search.fill('reparabilite')
    await expect(page.getByRole('option')).toHaveCount(1)
    await expect(page.getByRole('option', { name: SCHEMAS.reparabilite.title })).toBeVisible()
  })

  test('la recherche accepte un identifiant technique collé', async ({ page }) => {
    await stubPublicationApis(page)
    await page.goto('/admin/datasets/structured?step=1')

    // The identifier as it appears in the catalog, which the title alone never matched
    await page.getByRole('searchbox', { name: 'Rechercher un schéma' }).fill(SCHEMAS.durabilite.name)

    await expect(page.getByRole('option')).toHaveCount(1)
    await expect(page.getByRole('option', { name: SCHEMAS.durabilite.title })).toBeVisible()
  })

  test('une recherche sans rapport ne renvoie rien', async ({ page }) => {
    await stubPublicationApis(page)
    await page.goto('/admin/datasets/structured?step=1')

    await page.getByRole('searchbox', { name: 'Rechercher un schéma' }).fill('zzzz')

    await expect(page.getByRole('option')).toHaveCount(0)
    await expect(page.getByText('Aucun schéma ne correspond à votre recherche.')).toBeVisible()
  })

  test('la liste des schémas se parcourt au clavier', async ({ page }) => {
    await stubPublicationApis(page)
    await page.goto('/admin/datasets/structured?step=1')

    await page.getByRole('searchbox', { name: 'Rechercher un schéma' }).fill('test')
    const listbox = page.getByRole('listbox')
    const options = page.getByRole('option')

    await listbox.focus()
    await expect(listbox).not.toHaveAttribute('aria-activedescendant', /./)

    await page.keyboard.press('ArrowDown')
    const firstId = await options.first().getAttribute('id')
    await expect(listbox).toHaveAttribute('aria-activedescendant', firstId!)

    await page.keyboard.press('ArrowDown')
    const secondId = await options.nth(1).getAttribute('id')
    await expect(listbox).toHaveAttribute('aria-activedescendant', secondId!)

    await page.keyboard.press('Enter')
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true')

    await page.keyboard.press('Escape')
    await expect(listbox).not.toHaveAttribute('aria-activedescendant', /./)
  })

  test('le choix du mode de publication est exclusif', async ({ page }) => {
    await stubPublicationApis(page)
    await page.goto('/admin/datasets/structured?step=1')
    await selectProducer(page)

    const nouveau = page.getByRole('radio', { name: 'Créer un nouveau jeu de données' })
    const existant = page.getByRole('radio', { name: 'Ajouter à un jeu de données existant' })

    await expect(nouveau).toBeChecked()
    // The DSFR label covers its input, so clicking it is what a user actually does
    await page.getByText('Ajouter à un jeu de données existant').click()
    await expect(nouveau).not.toBeChecked()
    await expect(existant).toBeChecked()
  })
})

test.describe('chargement du schéma', () => {
  // The failing fetch is logged by `computedAsync`'s default error handler
  test.use({ allowedConsoleMessages: ['Failed to load resource', 'schema.test.local'] })

  test('un schéma injoignable est signalé comme tel', async ({ page }) => {
    await stubPublicationApis(page)
    // Only the schema definition fails; the catalog still answers so the wizard runs
    await page.route(new RegExp(`${SCHEMA_HOST}/`), route => route.fulfill({ status: 500 }))

    await startWizard(page, 'durabilite')
    await page.getByRole('group', { name: 'Saisir vos données' }).getByRole('button', { name: `Utiliser l'outil tableur` }).click()

    await expect(page.getByText(`Le schéma sélectionné n'a pas pu être chargé.`)).toBeVisible()
    // The banner that used to show during loading claimed no schema had been selected
    await expect(page.getByText(`Aucun schéma n'a été sélectionné`)).toHaveCount(0)
  })
})

test.describe('import de fichiers', () => {
  test('un CSV séparé par des virgules ouvre le tableur avec ses valeurs', async ({ page }) => {
    await stubPublicationApis(page)

    await startWizard(page, 'durabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-virgule.csv')

    await expect(page.getByText('Vos données sont conformes au schéma.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Suivant' })).toBeEnabled()
    await expect(page.getByText('8690842902635-FR001088_05WVDO-2026-07-31', { exact: true })).toBeVisible()
    await expect(page.getByText('8690842902635', { exact: true })).toBeVisible()
  })

  test('un CSV séparé par des points-virgules est lu comme tel', async ({ page }) => {
    await stubPublicationApis(page)

    // The file as the manufacturer's tool exports it
    await startWizard(page, 'durabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-point-virgule.csv')

    await expect(page.getByText('Vos données sont conformes au schéma.')).toBeVisible()
    await expect(page.getByText('8690842902635', { exact: true })).toBeVisible()
    // A missed delimiter would leave one column holding the whole line
    await expect(page.getByText('colonnes de votre fichier sont inconnues')).toHaveCount(0)
  })

  test('un CSV séparé par des tabulations est lu comme tel', async ({ page }) => {
    await stubPublicationApis(page)

    // The delimiter guess used to be thrown off by the trailing newline and fell back
    // to the comma, which splits the values that hold one
    await startWizard(page, 'durabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-tabulation.csv')

    await expect(page.getByText('Vos données sont conformes au schéma.')).toBeVisible()
    await expect(page.getByText('8690842902635', { exact: true })).toBeVisible()
    await expect(page.getByText('colonnes de votre fichier sont inconnues')).toHaveCount(0)
  })

  test('un XLSX garde ses identifiants longs et ses dates', async ({ page }) => {
    await stubPublicationApis(page)

    await startWizard(page, 'durabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge.xlsx')

    // The General format renders this 13 digit identifier as 8.69084E+12
    await expect(page.getByText('8690842902635', { exact: true })).toBeVisible()
    await expect(page.getByText('2026-07-31', { exact: true })).toBeVisible()
  })

  test('un ODS garde ses identifiants longs et ses dates', async ({ page }) => {
    await stubPublicationApis(page)

    await startWizard(page, 'durabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge.ods')

    await expect(page.getByText('8690842902635', { exact: true })).toBeVisible()
    await expect(page.getByText('2026-07-31', { exact: true })).toBeVisible()
  })
})

test.describe('fichier illisible', () => {
  // The component logs the underlying parsing error on purpose
  test.use({ allowedConsoleMessages: ['Erreur lors du chargement du fichier'] })

  test('un fichier illisible est signalé au lieu de produire un tableau incohérent', async ({ page }) => {
    await stubPublicationApis(page)

    await startWizard(page, 'durabilite')
    // An image renamed to .xlsx, the shape of the mistake a user actually makes.
    // A plain text file would not do: it is read as a CSV, which is a fair fallback.
    await page.locator('input[type="file"]').setInputFiles({
      name: 'donnees.xlsx',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13]),
    })
    await page.getByRole('button', { name: 'Suivant' }).click()

    await expect(page.getByText('Ce fichier n’a pas pu être lu.')).toBeVisible()
  })
})

test.describe('fichier qui ne correspond pas au schéma', () => {
  test('aucune colonne commune : le tableur s’ouvre vide et le schéma reste changeable', async ({ page }) => {
    await stubPublicationApis(page)

    await startWizard(page, 'irve')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-virgule.csv')

    await expect(page.getByText(
      `${FILE_COLUMNS} colonnes de votre fichier sur ${FILE_COLUMNS} sont inconnues du schéma « ${SCHEMAS.irve.title} »`,
    )).toBeVisible()
    await expect(page.getByRole('button', { name: 'Changer de schéma' })).toBeVisible()

    // The table is shown like in any other case, only its rows are dropped: keeping
    // them would add as many blank lines as the file had
    await expect(page.getByRole('button', { name: 'Ajouter une ligne' })).toBeVisible()
    await expect(page.getByText('8690842902635-FR001088_05WVDO-2026-07-31')).toHaveCount(0)
  })

  test('colonnes partiellement inconnues : le compte est donné et le schéma reste changeable', async ({ page }) => {
    const apis = await stubPublicationApis(page)
    apis.validation = reportWithErrors(1)

    // The exact situation of the report: 190 of the 228 columns exist in both schemas,
    // so the file looks close enough to be loaded but 38 columns are silently dropped
    await startWizard(page, 'reparabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-virgule.csv')

    await expect(page.getByText(
      `${UNKNOWN_FOR_REPARABILITE} colonnes de votre fichier sur ${FILE_COLUMNS} sont inconnues du schéma « ${SCHEMAS.reparabilite.title} »`,
    )).toBeVisible()
    await expect(page.getByRole('button', { name: 'Changer de schéma' })).toBeVisible()
  })

  test('changer de schéma depuis le tableur puis revenir supprime les erreurs', async ({ page }) => {
    const apis = await stubPublicationApis(page)
    apis.validation = reportWithErrors(3)

    await startWizard(page, 'reparabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-virgule.csv')
    await expect(page.getByText('3 erreurs sur 1 ligne à corriger pour pouvoir continuer.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Suivant' })).toBeDisabled()

    // Back to the first step through the banner's own action
    await page.getByRole('button', { name: 'Changer de schéma' }).click()
    await expect(page).toHaveURL(/step=1/)

    await selectSchema(page, 'durabilite')
    await page.getByRole('button', { name: 'Suivant' }).click()

    // The file uploaded earlier is still part of the wizard, so the upload area is gone
    // and "Suivant" reopens the spreadsheet with it, now against the right schema
    apis.validation = VALID_REPORT
    await expect(page.locator('input[type="file"]')).toHaveCount(0)
    await page.getByRole('button', { name: 'Suivant' }).click()

    await expect(page.getByText('Vos données sont conformes au schéma.')).toBeVisible()
    await expect(page.getByText('à corriger pour pouvoir continuer')).toHaveCount(0)
    await expect(page.getByText('colonnes de votre fichier sont inconnues')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Suivant' })).toBeEnabled()
  })
})

test.describe('validation', () => {
  test('les erreurs bloquent la suite et le rapport se déplie dans le bandeau', async ({ page }) => {
    const apis = await stubPublicationApis(page)
    apis.validation = reportWithErrors(2)

    await startWizard(page, 'durabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-virgule.csv')

    await expect(page.getByText('2 erreurs sur 1 ligne à corriger pour pouvoir continuer.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Suivant' })).toBeDisabled()

    // The detail is collapsed until the banner's title is used as a toggle
    await expect(page.getByText('La valeur de la colonne 1 est incorrecte')).toHaveCount(0)
    await page.getByRole('button', { name: /erreurs sur 1 ligne/ }).click()
    await expect(page.getByText('La valeur de la colonne 1 est incorrecte')).toBeVisible()
    await expect(page.getByText('La valeur de la colonne 2 est incorrecte')).toBeVisible()
  })

  test('une erreur unique sur une ligne unique accorde les deux comptes au singulier', async ({ page }) => {
    const apis = await stubPublicationApis(page)
    apis.validation = reportWithErrors(1)

    await startWizard(page, 'durabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-virgule.csv')

    await expect(page.getByText('1 erreur sur 1 ligne à corriger pour pouvoir continuer.')).toBeVisible()
  })

  test('revalider sans erreur referme le rapport laissé ouvert', async ({ page }) => {
    const apis = await stubPublicationApis(page)
    apis.validation = reportWithErrors(2)

    // A schema with unknown columns keeps the banner up once the errors are gone, which is
    // what leaves the report on screen with nothing to show and no way to collapse it
    await startWizard(page, 'reparabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-virgule.csv')

    await page.getByRole('button', { name: /erreurs sur 1 ligne/ }).click()
    await expect(page.getByText('La valeur de la colonne 1 est incorrecte')).toBeVisible()

    apis.validation = VALID_REPORT
    await page.getByRole('button', { name: 'Valider les données' }).click()

    await expect(page.getByText('Vos données sont conformes au schéma.')).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Erreur' })).toHaveCount(0)
  })

  test('la saisie manuelle explique pourquoi « Suivant » est grisé', async ({ page }) => {
    await stubPublicationApis(page)

    await startWizard(page, 'durabilite')
    await page.getByRole('group', { name: 'Saisir vos données' }).getByRole('button', { name: `Utiliser l'outil tableur` }).click()

    await expect(page.getByText('Validez vos données pour pouvoir continuer.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Suivant' })).toBeDisabled()
  })
})

test.describe('navigation', () => {
  test('« Retour » depuis le tableur ramène au chargement des données', async ({ page }) => {
    await stubPublicationApis(page)

    await startWizard(page, 'durabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-virgule.csv')
    await page.getByRole('button', { name: 'Retour' }).click()

    await expect(page).toHaveURL(/step=2/)
    await expect(page.getByRole('group', { name: 'Saisir vos données' }).getByRole('button', { name: `Utiliser l'outil tableur` })).toBeVisible()
  })

  test('l’étape finale reste affichée après la publication', async ({ page }) => {
    const apis = await stubPublicationApis(page)
    apis.validation = VALID_REPORT
    collectCreatedDatasets(page)

    await startWizard(page, 'durabilite')
    await uploadAndOpenSpreadsheet(page, 'lave-linge-virgule.csv')
    await expect(page.getByText('Vos données sont conformes au schéma.')).toBeVisible()
    await page.getByRole('button', { name: 'Suivant' }).click()

    // The title and the description are prefilled from the schema, only the frequency
    // is left to choose
    await expect(page).toHaveURL(/step=3/)
    await page.getByTestId('searchable-select-fr-quence-de-mise-jour').click()
    await page.getByRole('option', { name: 'Inconnu' }).click()
    await page.getByRole('button', { name: 'Suivant' }).click()

    // Publishing empties the wizard form on purpose. That must not send the user back
    // to the first step, which would make the last screen unreachable and wipe the
    // dataset just created.
    await expect(page).toHaveURL(/step=4/)
    await expect(page.getByRole('button', { name: 'Publier le jeu de données' })).toBeVisible()
  })

  test('recharger une étape avancée renvoie au début plutôt qu’à un écran amputé', async ({ page }) => {
    await stubPublicationApis(page)

    await startWizard(page, 'durabilite')
    await expect(page).toHaveURL(/step=2/)

    // The wizard state only lives in memory, so a reload has nothing to show
    await page.reload()

    await expect(page).toHaveURL(/step=1/)
    await expect(page.getByRole('searchbox', { name: 'Rechercher un schéma' })).toBeVisible()
  })
})
