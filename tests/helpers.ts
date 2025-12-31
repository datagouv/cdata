import type { Page } from '@playwright/test'

// When clicking "Suivant" we execute the validation of the frequency input
// because we blur outside the select. This validation create a warning (because
// "Inconnu" is not recommanded), and the warning make the "Suivant" button
// move a little bit down so the click is miss. We want to fix this one day!
// (it also happens in a regular browser with a human, so it's really not ideal)
export const clickOutside = async (page: Page) => {
  await page.mouse.click(1, 1)
}
