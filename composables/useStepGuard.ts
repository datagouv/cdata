import type { Ref } from 'vue'

/**
 * Leaves a wizard step that cannot be shown, e.g. reached by a reload once the form
 * kept in `useState` is gone.
 *
 * Checked on arriving at a step only: a wizard empties its form on purpose once the
 * object is created, and reacting to that would send the user back to the first step
 * while they are on their way to the next page.
 */
export function useStepGuard(currentStep: Ref<unknown>, isCurrentStepValid: Ref<boolean>, onInvalid: () => unknown) {
  watch(currentStep, () => {
    if (!isCurrentStepValid.value) {
      onInvalid()
    }
  }, { immediate: true })
}
