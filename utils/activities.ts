import type { Activity } from '~/types/activity'

export function getActivityTranslation(activity: Activity) {
  const { t } = useI18n()
  return {
    'dataset:created': t('Dataset creation'),
    'dataset:updated': t('Dataset update'),
    'dataset:deleted': t('Dataset deletion'),
    'dataset:discussed': t('Dataset discussion'),
    'dataset:followed': t('Dataset follow'),
    'dataset:resource:added': t('Resource addition'),
    'dataset:resource:updated': t('Resource update'),
    'dataset:resource:deleted': t('Resource deletion'),
    'dataservice:created': t('Dataservice creation'),
    'dataservice:updated': t('Dataservice update'),
    'dataservice:deleted': t('Dataservice deletion'),
    'dataservice:discussed': t('Dataservice discussion'),
    'dataservice:followed': t('Dataservice follow'),
    'organization:created': t('Organization creation'),
    'organization:updated': t('Organization update'),
    'organization:followed': t('Organization follow'),
    'reuse:created': t('Reuse creation'),
    'reuse:updated': t('Reuse update'),
    'reuse:deleted': t('Reuse deletion'),
    'reuse:discussed': t('Reuse discussion'),
    'reuse:followed': t('Reuse follow'),
    'user:followed': t('User follow'),
  }[activity.key] ?? activity.label
}
