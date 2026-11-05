import type { Ref } from 'vue'

// Checked on arriving at a step only: emptying the form once published must not pull the user back to step 1
export function useStepGuard(currentStep: Ref<unknown>, isCurrentStepValid: Ref<boolean>, onInvalid: () => unknown) {
  watch(currentStep, () => {
    if (!isCurrentStepValid.value) {
      onInvalid()
    }
  }, { immediate: true })
}
