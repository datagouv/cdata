<template>
  <div lang="fr">
    <div class="container">
      <Breadcrumb>
        <BreadcrumbItem
          :external="true"
          to="/"
        >
          Accueil
        </BreadcrumbItem>
        <BreadcrumbItem>
          Support
        </BreadcrumbItem>
      </Breadcrumb>
    </div>
    <div class="border-b border-gray-lowest">
      <div class="container">
        <h1 class="text-4.5xl font-extrabold pt-10 pb-[3.75rem] !mb-0 w-2xl text-gray-title">
          Bienvenue sur le support de la plateforme data.gouv.fr
        </h1>
      </div>
    </div>
    <div class="container my-15 space-y-8">
      <h2 class="text-4xl font-extrabold text-gray-title mt-15 mb-16">
        Avant de nous contacter, pensez à consulter le forum et nos guides : vous y trouverez peut-être déjà la réponse à votre question !
      </h2>
      <div class="grid gap-5 md:grid-cols-2">
        <SupportCard
          image="/img/forum.svg"
          title="Forum"
          description="Echangez avec la communauté, partagez vos retours sur la plateforme et demandez l'ouverture de données."
        >
          <template #link>
            <BrandedButton
              :href="config.public.supportUrl"
              color="tertiary"
              :icon="RiArrowRightLine"
              :icon-right="true"
            >
              Voir le forum
            </BrandedButton>
          </template>
        </SupportCard>
        <SupportCard
          image="/img/guides.svg"
          title="Guides"
          description="Les guides vous accompagnent pas à pas pour publier, explorer et réutiliser les données ouvertes en toute simplicité."
        >
          <template #link>
            <BrandedButton
              :href="config.public.guidesUrl"
              color="tertiary"
              :icon="RiArrowRightLine"
              :icon-right="true"
            >
              Voir les guides
            </BrandedButton>
          </template>
        </SupportCard>
      </div>
      <h2 class="text-4xl font-extrabold text-gray-title my-16">
        Questions les plus fréquentes
      </h2>
      <AccordionGroup @open="accordionOpened">
        <Accordion
          :show-icon="false"
          title="Vos données sont visibles dans la base Sirene et vous souhaitez les rendre privées ?"
        >
          <p class="m-0">
            Si vous souhaitez rendre privées les données de votre organisation, vous devez en faire la demande auprès de l'Insee qui publie ces données dans le répertoire Sirene. Les étapes de cette demande sont détaillées dans <a
              href="https://www.insee.fr/fr/information/7456564"
              target="_blank"
            >ce guide de l'Insee</a>. Pour les entrepreneurs individuels, voici un lien direct vers la <a href="https://statut-diffusion-sirene.insee.fr/">téléprocédure</a>.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous cherchez votre numéro de SIRET, SIREN ou RNA ?"
        >
          <p>
            Si vous rechercher votre numéro SIRET ou SIREN vous pouvez vous rendre sur le site <a
              href="https://annuaire-entreprises.data.gouv.fr/"
              target="_blank"
            > Annuaire des entreprises</a>.
          </p>
          <p class="m-0">
            Si vous êtes une association et recherchez votre numéro RNA,
            vous pouvez consulter le moteur de recherche des associations du <a
              href="https://www.journal-officiel.gouv.fr/associations/recherche/"
              target="_blank"
            > journal officiel</a> (dont nous ne sommes pas responsables).
            Pour plus d'informations, vous pouvez consulter le site <a
              href="https://www.service-public.fr/associations"
              target="_blank"
            >Service-Public.fr</a>.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question sur le fichier des personnes décédées ?"
        >
          <p class="m-0">
            Les fichiers des personnes décédées disponibles sur data.gouv.fr sont recueillis par l'Insee à partir des informations reçues des communes.
            Pour faire une recherche dans ces fichiers vous pouvez utilisez le service suivant <a
              href="https://deces.matchid.io/search"
              target="_blank"
            > Match_Id</a> (dont nous ne sommes pas responsable).
            Pour plus d'informations, vous pouvez consulter <a
              href="https://www.insee.fr/fr/information/4190491"
              target="_blank"
            >cette page</a>.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question sur l'application DVF (demandes de valeurs foncières) ?"
        >
          <p>
            Vous pouvez consulter la <a
              href="https://explore.data.gouv.fr/fr/immobilier?onglet=faq"
              target="_blank"
            > foire aux questions </a> de l'application. Les bases de données sources, ainsi que le code source sont détaillés <a href="https://explore.data.gouv.fr/fr/immobilier?onglet=sources">ici.</a>
          </p>
          <p class="font-bold mb-1">
            Les jeux de données et API "demandes de valeurs foncière" :
          </p>
          <ul class="list-disc pl-4">
            <li>
              <a href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/">Base de données "Demandes de valeurs foncières"</a> du Ministère de l'Économie, des Finances et de l'Industrie
            </li>
            <li>
              <a href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres-geolocalisees/">Base de données "Demandes de valeurs foncières géolocalisées"</a> de Data.gouv.fr
            </li>
            <li>
              <a href="https://www.data.gouv.fr/fr/dataservices/api-donnees-foncieres/">API données foncières</a> du CEREMA, en accès restreint à certaines administrations, car contenant des données personnelles sur les propriétaires, leur foncier et leurs locaux.
            </li>
          </ul>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question sur la base adresse nationale ? Une adresse est incorrecte ?"
        >
          <p class="mb-0">
            Vous pouvez consulter la <a
              href="https://adresse.data.gouv.fr/nous-contacter"
              target="_blank"
            >foire aux questions dédiée</a>.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question sur le cadastre ?"
        >
          <p class="mb-0">
            Si vous avez une question sur le cadastre (rechercher un propriétaire,
            remonter une erreur dans les données de valeur foncière, s’informer sur la mitoyenneté, etc.), nous vous invitons à consulter notre <a
              href="https://guides.data.gouv.fr/reutiliser-des-donnees/autour-du-cadastre/faq-cadastre"
              target="_blank"
            > « Foire aux questions sur le cadastre »</a>.
            Pour toute question sur l’utilisation et la manipulation des données du cadastre, vous pouvez consulter <a
              href="https://guides.data.gouv.fr/reutiliser-des-donnees/autour-du-cadastre"
              target="_blank"
            >le guide dédié</a>.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question sur les limites d'appels de l’API découpage administratif (API Geo) ?"
        >
          <p class="mb-0">
            Les volumétries d'appel sont décrites dans la <a href="https://www.data.gouv.fr/fr/dataservices/api-decoupage-administratif-api-geo/">fiche de l'API</a>.
          </p>
          <p>
            <strong>Est-il possible de faire lever les limites de l’API ?</strong><br>
            Oui, mais uniquement si vous êtes un service public ou chargé d’une mission de service public.
            Dans le cas contraire, vous pouvez aussi héberger notre API de géocodage chez vous,
            en suivant <a
              href="https://github.com/BaseAdresseNationale/addok-docker"
              target="_blank"
            >ces instructions</a>.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question sur des données relatives au COVID-19 ?"
        >
          <ul class="list-disc pl-4">
            <li>
              Pour toute information sur la COVID-19 vous pouvez consulter le site <a
                href="https://www.gouvernement.fr/info-coronavirus"
                target="_blank"
              > gouvernement.fr</a>.
            </li>
            <li>
              Pour trouver un rendez vous, vous pouvez consulter <a
                href="https://www.sante.fr/"
                target="_blank"
              > sante.fr</a>.
            </li>
            <li>
              Pour récupérer votre attestation, vous pouvez consulter votre appli TousAntiCovid ou votre espace <a
                href="https://www.ameli.fr"
                target="_blank"
              > ameli.fr</a>.
            </li>
          </ul>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous recherchez une API ou une base de données des plaques d'immatriculation, permis de conduire, ou des cartes grises ?"
        >
          <p>
            Les volumétries d'appel sont décrites dans la <a href="https://www.data.gouv.fr/fr/dataservices/api-decoupage-administratif-api-geo/">fiche de l'API</a>.
          </p>
          <p class="mb-0">
            Il existe des API et bases de données, celles-ci ne sont pas référencées sur data.gouv.fr à ce jour. Ces API et bases de données, qui sont opérées par le Ministère de l'Intérieur, sont en accès restreint à un petit nombre d'acteurs institutionnels. Notre support n'est pas en mesure de vous aider à ce sujet.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question sur le répertoire national des infrastructures de recharge pour véhicules électriques (IRVE) ?"
        >
          <p class="mb-0">
            Nous vous invitons à consulter <a
              href="https://doc.transport.data.gouv.fr/producteurs/infrastructures-de-recharge-de-vehicules-electriques-irve"
              target="_blank"
            > la documentation dédiée</a>
            concernant la création et la publication des données de ces données.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          :title="`Vous cherchez l'API Tiers de prestations pour bénéficier du dispositif d'avance immédiate du crédit d'impôt « service à la personne » ?`"
        >
          <p class="mb-0">
            Cette API n'est pas référencée sur data.gouv.fr car il s'agit d'une démarche en ligne. Vous pouvez accéder à cette démarche de l'Urssaf en suivant <a
              href="https://www.demarches-simplifiees.fr/commencer/api-tiers-de-prestations"
              target="_blank"
            >ce lien vers Démarches simplifiées</a>.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question relative à vos données personnelles ?"
        >
          <p class="mb-0">
            L'organisme en mesure de vous aider est <a
              href="https://www.cnil.fr/"
              target="_blank"
            > la Commission nationale de l'informatique et des libertés (CNIL)</a>.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question sur un titre de séjour ?"
        >
          <p class="mb-0">
            Le site data.gouv.fr ne permet pas aux particuliers de remplir des formalités administratives et notre support n'est pas en mesure de vous aider sur ces sujets.
            Vous pouvez vous référer à l'administration compétente ou consulter les liens suivants :
          </p>
          <ul class="list-disc pl-4">
            <li>
              <a
                href="https://www.service-public.fr/particuliers/vosdroits/N110"
                target="_blank"
              > La fiche dédiée sur Service-Public.fr</a>.
            </li>
            <li>
              <a
                href="https://www.refugies.info/demarche/5dc2da982e9859001680b8a2"
                target="_blank"
              > Le site refugies.info</a>.
            </li>
            <li>
              <a
                href="https://administration-etrangers-en-france.interieur.gouv.fr/particuliers/#/contact"
                target="_blank"
              > Contacter le service compétent du Ministère du l'Intérieur</a>.
            </li>
          </ul>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez un doute ou avez été victime de fraude ou d'escroquerie ?"
        >
          <p class="mb-1">
            Notre équipe n'est pas en mesure de vous aider sur ces questions. Vous pouvez vous référez à :
          </p>
          <ul class="list-disc pl-4">
            <li>
              <a
                href="https://www.service-public.fr/particuliers/vosdroits/F1520"
                target="_blank"
              > La fiche pratique escroquerie de Service-Public.fr</a>.
            </li>
            <li>
              <a
                href="https://www.service-public.fr/particuliers/vosdroits/F34800"
                target="_blank"
              > La fiche pratique phishing (hameçonnage) sur Service-Public.fr</a>.
            </li>
            <li>
              <a
                href="https://www.cybermalveillance.gouv.fr/diagnostic/accueil"
                target="_blank"
              > L’outil de diagnostic sur cybermalveillancance.gouv.fr</a>.
            </li>
          </ul>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question sur le compte professionnel de formation (CPF) ?"
        >
          <p class="mb-0">
            Notre équipe n'est pas en mesure de vous aider sur ces questions. Vous pouvez vous référez à
            <a
              href="https://www.service-public.fr/particuliers/vosdroits/F10705"
              target="_blank"
            >
              la fiche pratique sur Service-Public.fr</a>.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous avez une question sur un organisme de formation ou une certification Qualiopi ?"
        >
          <p>
            Notre équipe n'est pas en mesure de vous aider sur ces questions.
            Si vous ne trouvez pas réponse à votre question dans les éléments suivants vous pouvez contacter <a
              href="https://travail-emploi.gouv.fr/ministere/article/nous-contacter"
              target="_blank"
            >
              le Ministère du Travail</a>.
          </p>
          <p>
            <strong>Vous ne trouvez pas votre organismes de formation dans la liste ?</strong><br>
            Retrouvez toutes les informations utiles pour déclarer votre organisme ou transmettre votre Bilan Pédagogique et Financier sur le site du Ministère du travail:
            <a
              href="http://travail-emploi.gouv.fr/formation-professionnelle/organismes-de-formation-fonctionnement/organismes-formation"
              target="_blank"
            >
              les formalités de création et de fonctionnement des organismes de formation </a>.<br>
          </p>
          <p>
            <strong>Vous souhaitez modifier certaines informations ?</strong><br>
            Les informations sont issues des déclarations annuelles effectuées par l'organisme de formation auprès du services régional de contrôle de sa DREETS,
            mais vous pouvez demander à tout moment la modification de certaines informations en contactant votre DREETS ou en accédant à votre espace personnel sur
            <a
              href="https://www.monactiviteformation.emploi.gouv.fr/"
              target="_blank"
            >l'application Mon Activité Formation</a>.<br>
          </p>
          <p class="mb-0">
            <strong>Les informations concernant votre certification QUALIOPI vous semblent erronées ?</strong><br>
            Contactez votre organisme certificateur afin qu'il transmette votre certification. Attention de bien lui fournir votre nouveau NDA si celui-ci a changé récemment.
          </p>
        </Accordion>
        <Accordion
          :show-icon="false"
          title="Vous rencontrez un problème avec DataPass ?"
        >
          <p class="mb-0">
            DataPass est un service permettant aux administrations et collectivités d'être habilitées à accéder à des données en accès restreint. Que vous soyez une administration fournisseur de données ou utilisatrice de données, vous pouvez vous référez à la <a
              href="https://datapass.api.gouv.fr/faq"
              target="_blank"
            >FAQ du service Datapass</a>.
          </p>
        </Accordion>
      </AccordionGroup>
      <h2
        id="support-tree"
        class="text-4xl font-extrabold text-gray-title my-16"
      >
        Vous n’avez pas trouvé ce que vous cherchez ?
      </h2>
      <div
        v-for="(question, index) in questions"
        :key="question.id"
      >
        <SupportTitle
          v-if="question.title"
          :id="question.title"
        >
          {{ question.title }}
        </SupportTitle>
        <SupportChoices
          :question
          :selected="answers[index]"
          @select="(id) => { if (id) select(id, index) }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiArrowRightLine } from '@remixicon/vue'
import { id, title, choices } from '~/assets/config/support.toml'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import type { Question } from '~/types/support'

const config = useRuntimeConfig()
const route = useRoute()
const firstQuestion: Question = { id, title, choices }
const questions = ref<Array<Question>>([firstQuestion])
const answers = ref<Array<string>>([])

const { t } = useI18n()

useSeoMeta({
  title: t('Support'),
})

function updateUrl(path: string, hash = '') {
  const params = route.params.path ? (route.params.path as Array<string>).join('/') : ''
  const pathWithoutParams = route.params.path ? route.path.slice(0, route.path.indexOf(params)) : route.path
  const url = new URL(`${window.location.origin}${pathWithoutParams}${path}/`)
  url.hash = hash
  window.history.replaceState(null, '', url)
}

function accordionOpened(id: string) {
  updateUrl(id)
}

function select(id: string, index: number) {
  answers.value[index] = id
  updateUrl(answers.value.join('/'), '#support-tree')
}
onMounted(async () => {
  for (const level in route.params.path as Array<string>) {
    const answer = route.params.path[level]
    if (answer) {
      answers.value[level] = answer
    }
  }
})

watchEffect(async () => {
  questions.value = [firstQuestion]
  for (const step in answers.value) {
    const id = answers.value[step]
    const answer = questions.value[step] && 'choices' in questions.value[step] && questions.value[step].choices.find(choice => choice.id === id)
    if (answer) {
      questions.value.push(answer)
    }
  }
})
</script>
