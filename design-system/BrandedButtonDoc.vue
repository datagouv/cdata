<template>
  <div class="space-y-14">
    <DocSection
      id="tailles"
      title="Tailles"
      description="sm est la taille par défaut, alignée sur les champs de formulaire. xs sert aux actions secondaires et à l'admin, 2xs aux barres d'outils denses, lg aux cas exceptionnels. Les hauteurs sont des minimums."
      :code="codes.sizes"
    >
      <div
        data-capture="sizes-row"
        class="flex flex-wrap items-center gap-4"
      >
        <BrandedButton
          v-for="size in sizes"
          :key="size"
          :size
        >
          Publier ({{ size }})
        </BrandedButton>
      </div>
      <div class="overflow-x-auto mt-6">
        <table class="text-sm border-collapse">
          <thead>
            <tr class="text-left text-gray-medium whitespace-nowrap">
              <th class="font-normal pr-6 pb-1">
                Taille
              </th>
              <th class="font-normal pr-6 pb-1">
                Hauteur min.
              </th>
              <th class="font-normal pr-6 pb-1">
                Texte
              </th>
              <th class="font-normal pr-6 pb-1">
                Padding texte / icône
              </th>
              <th class="font-normal pr-6 pb-1">
                Icône
              </th>
              <th class="font-normal pb-1">
                Usage
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in sizeRules"
              :key="row.size"
              class="border-t border-gray-default"
            >
              <td class="pr-6 py-1 whitespace-nowrap">
                <code>{{ row.size }}</code>
              </td>
              <td class="pr-6 py-1 whitespace-nowrap">
                {{ row.height }}
              </td>
              <td class="pr-6 py-1 whitespace-nowrap">
                {{ row.text }}
              </td>
              <td class="pr-6 py-1 whitespace-nowrap">
                {{ row.padding }}
              </td>
              <td class="pr-6 py-1 whitespace-nowrap">
                {{ row.icon }}
              </td>
              <td class="py-1 min-w-56">
                {{ row.usage }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocSection>

    <DocSection
      id="couleurs"
      title="Couleurs"
      description="Une seule action primary par groupe. secondary pour l'alternative, tertiary pour une action discrète, danger pour une action destructive, warning pour une action d'administration, white-flat sur un fond foncé ou illustré."
      :code="codes.colors"
    >
      <div class="flex flex-wrap items-center gap-4">
        <BrandedButton
          v-for="color in colors"
          :key="color"
          :color
        >
          {{ colorLabels[color] }}
        </BrandedButton>
        <span class="bg-new-blue-illustration p-3">
          <BrandedButton color="white-flat">
            Sur fond illustré
          </BrandedButton>
        </span>
      </div>
    </DocSection>

    <DocSection
      id="comparaison"
      title="Toutes les couleurs et tailles"
      description="Comparaison de chaque couleur recommandée dans chaque taille."
    >
      <table
        data-capture="sizes"
        class="border-separate border-spacing-3"
      >
        <thead>
          <tr>
            <th />
            <th
              v-for="size in sizes"
              :key="size"
              class="text-left text-xs font-normal text-gray-medium"
            >
              {{ size }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="color in colors"
            :key="color"
          >
            <th class="text-left text-xs font-normal text-gray-medium pr-2">
              {{ color }}
            </th>
            <td
              v-for="size in sizes"
              :key="size"
              class="align-middle"
            >
              <BrandedButton
                :color
                :size
              >
                Publier
              </BrandedButton>
            </td>
          </tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection
      id="icones"
      title="Icônes"
      description="À gauche, l'icône d'une action (ajouter, télécharger, modifier). À droite avec icon-right, l'icône d'une destination (flèche vers une autre page, chevron d'un menu, croix de fermeture). Le padding est réduit du côté de l'icône pour équilibrer optiquement le bouton."
      :code="codes.icons"
    >
      <div class="flex flex-wrap items-center gap-4">
        <BrandedButton :icon="RiAddLine">
          Ajouter une ressource
        </BrandedButton>
        <BrandedButton
          color="secondary"
          :icon="RiDownloadLine"
        >
          Télécharger
        </BrandedButton>
        <BrandedButton
          color="tertiary"
          :icon="RiArrowRightLine"
          icon-right
          href="/datasets"
        >
          Voir les jeux de données
        </BrandedButton>
        <BrandedButton
          color="secondary"
          :icon="RiArrowDownSLine"
          icon-right
        >
          Swagger
        </BrandedButton>
      </div>
    </DocSection>

    <DocSection
      id="iconique"
      title="Bouton iconique"
      description="Carré, à la hauteur de sa taille. Le slot nomme l'action et sa cible : il est lu par les technologies d'assistance. Ajouter un title pour l'infobulle."
      :code="codes.iconOnly"
    >
      <table
        data-capture="icon-sizes"
        class="border-separate border-spacing-3"
      >
        <tbody>
          <tr
            v-for="color in ['primary', 'secondary', 'tertiary'] as const"
            :key="color"
          >
            <th class="text-left text-xs font-normal text-gray-medium pr-2">
              {{ color }}
            </th>
            <td
              v-for="size in sizes"
              :key="size"
              class="align-middle"
            >
              <div class="flex items-center gap-2">
                <BrandedButton
                  :color
                  :size
                  :icon="RiAddLine"
                >
                  Ajouter
                </BrandedButton>
                <BrandedButton
                  :color
                  :size
                  :icon="RiAddLine"
                  icon-only
                  title="Ajouter une ressource"
                >
                  Ajouter une ressource
                </BrandedButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection
      id="chargement"
      title="Chargement"
      description="loading garde le libellé, pose aria-busy et bloque les clics comme la soumission du formulaire. Le bouton reste focalisable. Le témoin devient statique quand le mouvement est réduit."
      :code="codes.loading"
    >
      <form
        data-capture="form-guard"
        class="flex flex-wrap items-center gap-3"
        @submit.prevent="submitCount++"
      >
        <input
          class="fr-input w-60"
          aria-label="Champ de test"
          placeholder="Entrée ici ne doit pas soumettre"
        >
        <BrandedButton
          type="submit"
          :loading="formLoading"
        >
          Enregistrer
        </BrandedButton>
        <BrandedButton
          color="secondary"
          :icon="RiAddLine"
          loading
        >
          Ajouter
        </BrandedButton>
        <BrandedButton
          color="tertiary"
          @click="formLoading = !formLoading"
        >
          {{ formLoading ? 'Arrêter le chargement' : 'Lancer le chargement' }}
        </BrandedButton>
        <span
          data-testid="submit-count"
          class="text-sm text-gray-medium"
        >Soumissions : {{ submitCount }}</span>
      </form>
    </DocSection>

    <DocSection
      id="desactive"
      title="Désactivé"
      description="Même gris pour toutes les couleurs. Le bouton reste focalisable. Expliquer la condition de déblocage dans le contenu voisin, pas seulement dans une infobulle."
      :code="codes.disabled"
    >
      <div class="flex flex-wrap items-center gap-4">
        <BrandedButton
          v-for="color in colors"
          :key="color"
          :color
          disabled
        >
          {{ colorLabels[color] }}
        </BrandedButton>
      </div>
    </DocSection>

    <DocSection
      id="lien"
      title="Lien"
      description="Avec href, le bouton devient un lien : à utiliser pour naviguer. new-tab ajoute l'icône de lien externe et la mention « nouvel onglet ». Un lien désactivé est rendu sans lien et sort de la tabulation."
      :code="codes.link"
    >
      <div class="flex flex-wrap items-center gap-4">
        <BrandedButton href="/datasets">
          Voir les jeux de données
        </BrandedButton>
        <BrandedButton
          color="secondary"
          href="https://guides.data.gouv.fr"
          new-tab
        >
          Consulter le guide
        </BrandedButton>
        <BrandedButton
          color="tertiary"
          href="/datasets"
          disabled
        >
          Lien désactivé
        </BrandedButton>
      </div>
    </DocSection>

    <DocSection
      id="etats"
      title="Tous les états en comparaison"
      description="Chaque couleur recommandée avec icône, icône à droite, iconique, chargement, désactivé, lien, nouvel onglet et lien désactivé."
    >
      <table
        data-capture="states"
        class="border-separate border-spacing-3"
      >
        <thead>
          <tr>
            <th />
            <th
              v-for="state in states"
              :key="state.label"
              class="text-left text-xs font-normal text-gray-medium"
            >
              {{ state.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="color in colors"
            :key="color"
          >
            <th class="text-left text-xs font-normal text-gray-medium pr-2">
              {{ color }}
            </th>
            <td
              v-for="state in states"
              :key="state.label"
              class="align-middle"
            >
              <BrandedButton
                :color
                v-bind="state.props"
              >
                {{ state.text }}
              </BrandedButton>
            </td>
          </tr>
        </tbody>
      </table>
    </DocSection>

    <DocSection
      id="banniere"
      title="Dans une BannerAction"
      description="Sans taille ni couleur précisées, le bouton prend la taille xs et une couleur dérivée du type de la bannière."
      :code="codes.banner"
    >
      <div
        data-capture="banners"
        class="space-y-3 max-w-3xl"
      >
        <BannerAction
          v-for="type in (['primary', 'warning', 'danger'] as const)"
          :key="type"
          :type
          title="Ce jeu de données n'a pas de licence"
        >
          Choisissez une licence pour permettre sa réutilisation.
          <template #button>
            <BrandedButton :icon="RiPencilLine">
              Modifier
            </BrandedButton>
          </template>
        </BannerAction>
      </div>
    </DocSection>

    <DocSection
      id="libelles-longs"
      title="Libellés longs et mobile"
      description="Un libellé long revient à la ligne entre les mots. icon-only-on-mobile masque le texte sous 576 px, seulement si le bouton a une icône. Sur écran tactile, une zone invisible de 44 px entoure le bouton sans changer sa taille."
      :code="codes.long"
    >
      <div class="flex flex-wrap items-start gap-6">
        <div
          data-capture="long"
          class="w-60 space-y-3 border border-dashed border-gray-silver p-2"
        >
          <BrandedButton>
            Télécharger toutes les ressources de ce jeu de données au format CSV
          </BrandedButton>
          <BrandedButton
            color="secondary"
            size="xs"
            :icon="RiDownloadLine"
          >
            Télécharger toutes les ressources de ce jeu de données
          </BrandedButton>
        </div>
        <div
          data-capture="mobile"
          class="flex gap-3"
        >
          <BrandedButton
            :icon="RiAddLine"
            icon-only-on-mobile
          >
            Publier sur data.gouv.fr
          </BrandedButton>
          <BrandedButton
            color="secondary"
            icon-only-on-mobile
          >
            Sans icône, le texte reste
          </BrandedButton>
        </div>
      </div>
    </DocSection>

    <DocSection
      id="alignement"
      title="Alignement et classes du parent"
      description="Un tertiaire n'a pas de marges négatives. Pour aligner son texte sur le bord du contenu, le parent ajoute un décalage égal au padding du côté concerné. Les classes de marge, de largeur ou d'affichage du parent s'appliquent toujours."
      :code="codes.alignment"
    >
      <div
        data-capture="parents"
        class="space-y-4 max-w-xl"
      >
        <div class="border-l-2 border-gray-default pl-4">
          <p class="text-sm mb-1">
            Ce jeu de données n'a pas de DOI.
          </p>
          <BrandedButton
            color="tertiary"
            size="xs"
            :icon="RiChatNewLine"
            class="-ms-2"
          >
            Demander un DOI
          </BrandedButton>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <BrandedButton class="w-full sm:w-auto">
            Découvrez les jeux de données
          </BrandedButton>
          <BrandedButton
            color="secondary"
            class="w-full sm:w-auto"
          >
            Explorez les réutilisations
          </BrandedButton>
        </div>
      </div>
    </DocSection>

    <DocSection
      id="compatibilite"
      title="Conservés pour compatibilité"
      description="Encore acceptés pour ne pas casser les projets qui utilisent le paquet, mais à ne plus utiliser : tertiary-blue (utiliser tertiary), brown-illustration et green-illustration (utiliser primary), la taille xl (utiliser lg), keep-margins-even-without-borders (sans effet)."
    >
      <div
        data-capture="legacy"
        class="flex flex-wrap items-center gap-4"
      >
        <BrandedButton
          v-for="color in legacyColors"
          :key="color"
          :color
        >
          {{ color }}
        </BrandedButton>
        <BrandedButton size="xl">
          xl
        </BrandedButton>
      </div>
    </DocSection>

    <section
      id="bonnes-pratiques"
      class="scroll-mt-4"
    >
      <h2 class="text-xl font-bold mb-4">
        <a
          href="#bonnes-pratiques"
          class="bg-none text-inherit no-underline hover:underline"
        >Bonnes pratiques</a>
      </h2>
      <ul class="space-y-3 text-sm max-w-3xl list-disc pl-5">
        <li
          v-for="(practice, index) in practices"
          :key="index"
        >
          {{ practice }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiArrowDownSLine, RiArrowRightLine, RiChatNewLine, RiDownloadLine, RiPencilLine } from '@remixicon/vue'
import { ref } from 'vue'
import DocSection from '~/design-system/DocSection.vue'

const formLoading = ref(true)
const submitCount = ref(0)

const colors = ['primary', 'secondary', 'tertiary', 'danger', 'warning', 'white-flat'] as const
const sizes = ['2xs', 'xs', 'sm', 'lg'] as const
// Kept for backward compatibility only
const legacyColors = ['tertiary-blue', 'brown-illustration', 'green-illustration'] as const

const colorLabels: Record<typeof colors[number], string> = {
  'primary': 'Publier le jeu de données',
  'secondary': 'Sauvegarder le brouillon',
  'tertiary': 'Annuler',
  'danger': 'Supprimer la ressource',
  'warning': 'Marquer comme non spam',
  'white-flat': 'Découvrir',
}

const sizeRules = [
  { size: '2xs', height: '28 px', text: '12 px', padding: '8 / 4 px', icon: '16 px', usage: 'barres d\'outils et menus denses (explorateur tabulaire)' },
  { size: 'xs', height: '32 px', text: '14 px', padding: '12 / 8 px', icon: '16 px', usage: 'actions secondaires, admin, BannerAction' },
  { size: 'sm', height: '40 px', text: '14 px', padding: '16 / 12 px', icon: '16 px', usage: 'standard, alignée sur les champs de formulaire' },
  { size: 'lg', height: '48 px', text: '16 px', padding: '20 / 16 px', icon: '20 px', usage: 'menu mobile, recherche, page d\'erreur' },
]

const states = [
  { label: 'Défaut', text: 'Publier', props: {} },
  { label: 'Icône', text: 'Ajouter', props: { icon: RiAddLine } },
  { label: 'Icône à droite', text: 'Ajouter', props: { icon: RiAddLine, iconRight: true } },
  { label: 'Iconique', text: 'Ajouter', props: { icon: RiAddLine, iconOnly: true } },
  { label: 'Chargement', text: 'Publier', props: { loading: true } },
  { label: 'Désactivé', text: 'Publier', props: { disabled: true } },
  { label: 'Lien', text: 'Voir', props: { href: '/datasets' } },
  { label: 'Nouvel onglet', text: 'Voir', props: { href: 'https://www.data.gouv.fr', newTab: true } },
  { label: 'Lien désactivé', text: 'Voir', props: { href: '/datasets', disabled: true } },
]

const codes = {
  sizes: `<BrandedButton size="2xs">Publier</BrandedButton>
<BrandedButton size="xs">Publier</BrandedButton>
<BrandedButton>Publier</BrandedButton> <!-- sm par défaut -->
<BrandedButton size="lg">Publier</BrandedButton>`,
  colors: `<BrandedButton>Publier le jeu de données</BrandedButton> <!-- primary par défaut -->
<BrandedButton color="secondary">Sauvegarder le brouillon</BrandedButton>
<BrandedButton color="tertiary">Annuler</BrandedButton>
<BrandedButton color="danger">Supprimer la ressource</BrandedButton>
<BrandedButton color="warning">Marquer comme non spam</BrandedButton>
<BrandedButton color="white-flat">Découvrir</BrandedButton>`,
  icons: `<BrandedButton :icon="RiAddLine">Ajouter une ressource</BrandedButton>
<BrandedButton color="tertiary" href="/datasets" :icon="RiArrowRightLine" icon-right>
  Voir les jeux de données
</BrandedButton>`,
  iconOnly: `<BrandedButton :icon="RiAddLine" icon-only title="Ajouter une ressource">
  Ajouter une ressource
</BrandedButton>`,
  loading: `<form @submit.prevent="save">
  <BrandedButton type="submit" :loading="saving">Enregistrer</BrandedButton>
</form>`,
  disabled: `<BrandedButton :disabled="!form.license">Publier le jeu de données</BrandedButton>
<p>Choisissez une licence pour publier.</p>`,
  link: `<BrandedButton href="/datasets">Voir les jeux de données</BrandedButton>
<BrandedButton color="secondary" href="https://guides.data.gouv.fr" new-tab>
  Consulter le guide
</BrandedButton>`,
  banner: `<BannerAction type="warning" title="Ce jeu de données n'a pas de licence">
  <template #button>
    <BrandedButton :icon="RiPencilLine">Modifier</BrandedButton>
  </template>
</BannerAction>`,
  long: `<BrandedButton :icon="RiAddLine" icon-only-on-mobile>Publier sur data.gouv.fr</BrandedButton>`,
  alignment: `<!-- -ms-2 : padding côté icône en xs (8 px) -->
<BrandedButton color="tertiary" size="xs" :icon="RiChatNewLine" class="-ms-2">
  Demander un DOI
</BrandedButton>`,
}

const practices = [
  'Un bouton déclenche une action (enregistrer, publier, supprimer) ; un lien navigue. Pour naviguer, passer href : le bouton est alors rendu comme un lien. Quand plusieurs actions liées partagent une ligne, les regrouper dans un menu, comme le menu « Télécharger » des ressources.',
  'Une seule action primary par groupe. secondary pour l\'alternative, tertiary pour une action discrète, danger pour une confirmation destructive. warning est réservé aux actions d\'administration visibles sur les pages publiques.',
  'Dans un formulaire, utiliser type="submit" et écouter l\'événement submit du formulaire, plutôt qu\'un clic : la touche Entrée dans un champ fonctionne alors aussi.',
  'Passer loading plutôt qu\'ajouter un indicateur maison : le libellé et le focus restent, aria-busy est posé et la double soumission est bloquée. Ne pas annoncer la réussite avant la réponse du serveur.',
  'Désactiver seulement quand l\'action est impossible maintenant (champ obligatoire vide, droits insuffisants), et dire pourquoi dans le contenu voisin : une infobulle au survol n\'est lue ni au clavier ni sur mobile.',
  'Rédiger le libellé avec un verbe à l\'infinitif et son objet, une seule majuscule en début : « Publier le jeu de données », « Ajouter une ressource », « Inviter un membre ». Éviter les verbes seuls et les confirmations vagues (« Valider », « OK », « Cliquez ici »).',
  'Pour une action destructive, nommer l\'objet (« Supprimer la ressource ») et confirmer avec un message qui reprend les mêmes mots (« Ressource supprimée »). La couleur ne suffit pas à signaler le danger.',
  'Un bouton iconique garde un libellé dans son slot, qui nomme l\'action et sa cible (« Modifier la ressource »), pas l\'icône (« Crayon »). Ajouter le même texte en title pour l\'infobulle.',
  'Ne pas poser d\'aria-label sur un bouton qui a déjà un texte visible : il remplace ce texte pour les lecteurs d\'écran, qui n\'entendent plus ce qui est affiché.',
  'Pour un lien externe, utiliser new-tab plutôt que target="_blank" : l\'icône et la mention « nouvel onglet » sont ajoutées automatiquement.',
  'Icône à gauche pour une action, à droite pour une destination. Ne pas ajouter d\'icône décorative qui n\'apporte pas de sens.',
  'Garder la même taille dans un même groupe de boutons. sm par défaut, xs dans l\'admin et pour les actions secondaires, 2xs seulement dans les barres d\'outils denses.',
  'Les classes du parent servent à placer le bouton (marges, largeur, affichage). Passer par les props pour la couleur, la taille ou l\'état, plutôt que par des classes qui les écraseraient.',
]
</script>
