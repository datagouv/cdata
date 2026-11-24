import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useTranslation } from '@datagouv/components-next'
import type { ColumnDefinition, TranslationFunction } from '@datagouv/components-next'

// Whole words of the name only: `nombre_refus` or `montant_numeraire` are measures.
const IDENTIFIER_NAME = /(?:^|[._\s-])(?:id|ref|reference|référence|num|numero|numéro)(?:$|[._\s-])/i
// A ColumnDefinition carries no distinct-value count (nb_distinct): free text is told by its name.
const FREE_TEXT_NAME = /(?:url|uri|description|comment|adresse|address|geometry|geojson|wkt|libell?e_long|libellé_long|(?:^|[._\s-])(?:title|titre)(?:$|[._\s-]))/i

function isUsefulDimension(column: ColumnDefinition) {
  return ['categorical', 'text', 'boolean'].includes(column.type)
    && !IDENTIFIER_NAME.test(column.name)
    && !FREE_TEXT_NAME.test(column.name)
}

function isUsefulMeasure(column: ColumnDefinition) {
  return column.type === 'number'
    && !IDENTIFIER_NAME.test(column.name)
    && !/(?:code|year|annee|année|latitude|longitude|\blat\b|\blon\b|\blng\b)/i.test(column.name)
}

/**
 * Suggestions of the empty assistant, built from the resource schema. They ask
 * for charts the assistant can build (histogram or line, count or aggregate),
 * not for data exploration: the assistant only creates charts.
 */
export function useStarterQuestions(columns: MaybeRefOrGetter<Array<ColumnDefinition>>) {
  const { t } = useTranslation()
  return computed(() => starterQuestions(toValue(columns), t))
}

function starterQuestions(columns: Array<ColumnDefinition>, t: TranslationFunction): Array<string> {
  // csv-detective marks the columns with few distinct values as categorical.
  const [dimension, secondDimension] = columns.filter(isUsefulDimension)
    .sort((a, b) => Number(b.type === 'categorical') - Number(a.type === 'categorical'))
  const measure = columns.find(isUsefulMeasure)
  const date = columns.find(column => column.type === 'date')
  const suggestions = [t('Quel graphique peut-on faire avec ces données ?')]

  if (dimension && measure) {
    suggestions.push(t('Fais un histogramme de la somme de « {measure} » par « {dimension} »', { measure: measure.name, dimension: dimension.name }))
  }
  if (dimension) {
    // No « top 10 »: the chart ranks only the first CHART_PAGE_SIZE groups in X order.
    suggestions.push(t('Compte les lignes par « {column} »', { column: dimension.name }))
  }
  if (date) {
    suggestions.push(measure
      ? t('Trace l’évolution de « {measure} » selon « {date} »', { measure: measure.name, date: date.name })
      : t('Trace l’évolution du nombre de lignes selon « {date} »', { date: date.name }))
  }
  else if (dimension && measure) {
    suggestions.push(t('Montre la moyenne de « {measure} » par « {dimension} »', { dimension: dimension.name, measure: measure.name }))
  }
  else if (secondDimension) {
    suggestions.push(t('Compare le nombre de lignes par « {column} »', { column: secondDimension.name }))
  }
  if (suggestions.length < 3) {
    suggestions.push(t('Propose-moi un graphique pertinent pour cette ressource'))
  }
  return suggestions
}
