import { useTranslation } from '@datagouv/components-next'
import type { TranslationFunction } from '@datagouv/components-next'
import { answerTexts, displayedToolCalls, toolCalls } from './toolCalls'
import type { ToolCall } from './toolCalls'

type TimelineStep = { label: string, status: 'active' | 'complete' | 'failed' }
export type TurnTimeline = { title: string, steps: TimelineStep[] }

// Translated when built: the catalog may still be loading when the composable starts.
type StepLabels = { running: (t: TranslationFunction) => string, done: (t: TranslationFunction) => string, failed: (t: TranslationFunction) => string }

const adjustLabel = (t: TranslationFunction) => t('Une étape doit être ajustée avant de poursuivre')

const STEP_LABELS: Record<string, StepLabels> = {
  'tool-query_data': {
    running: t => t('Je calcule la réponse à partir des données'),
    done: t => t('Calcul effectué sur les données'),
    failed: t => t('Un calcul doit être corrigé avant de poursuivre'),
  },
  'tool-create_chart': {
    running: t => t('Je prépare le graphique à partir des résultats'),
    done: t => t('Graphique préparé'),
    failed: adjustLabel,
  },
  'tool-update_chart': {
    running: t => t('J’applique les modifications au graphique'),
    done: t => t('Graphique modifié'),
    failed: adjustLabel,
  },
}
const OTHER_LABELS: StepLabels = {
  running: t => t('Je poursuis l’analyse'),
  done: t => t('Étape terminée'),
  failed: adjustLabel,
}

export function useTurnTimeline() {
  const { t } = useTranslation()

  // A failure is worded as a step to correct, never as an error: the model is still working on it.
  function toStep(call: ToolCall): TimelineStep {
    const labels = STEP_LABELS[call.type] ?? OTHER_LABELS
    if (call.status === 'running') return { label: labels.running(t), status: 'active' }
    if (call.status === 'failed') return { label: labels.failed(t), status: 'failed' }
    return { label: labels.done(t), status: 'complete' }
  }

  return function buildTurnTimeline(parts: unknown[]): TurnTimeline {
    const calls = displayedToolCalls(toolCalls(parts))
    const answering = answerTexts(parts).length > 0

    if (!calls.length && !answering) {
      return { title: t('Analyse en cours'), steps: [{ label: t('Planification de la réponse…'), status: 'active' }] }
    }

    const running = calls.some(call => call.status === 'running')
    const steps = calls.map(toStep)
    if (!running) {
      steps.push({ label: answering ? t('Je rédige la réponse') : t('J’interprète les résultats obtenus'), status: 'active' })
    }

    const title = running ? t('Analyse en cours') : answering ? t('Réponse en cours') : t('Analyse des résultats')
    return { title, steps }
  }
}
