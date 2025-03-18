<template>
  <div>
    <div class="container">
      <Breadcrumb>
        <BreadcrumbItem
          :external="true"
          to="/"
        >
          {{ $t('Home') }}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {{ $t('Support') }}
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
    <div class="container my-16 space-y-8">
      <h2 class="text-4xl font-extrabold text-gray-title my-16">
        Vous n’avez pas trouvé ce que vous cherchez ?
      </h2>
      <div
        v-for="(question, index) in questions"
        :key="question.title"
      >
        <SupportTitle :id="question.id">
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
import { id, title, choices } from '~/assets/config/support.toml'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import type { Question } from '~/types/support'

const firstQuestion: Question = { id, title, choices }
const questions = ref([firstQuestion])
const answers = ref<Array<string>>([])

function select(id: string, index: number) {
  answers.value[index] = id
}

watchEffect(() => {
  console.log(choices)
  questions.value = [firstQuestion]
  for (const step in answers.value) {
    const id = answers.value[step]
    const answer = questions.value[step].choices?.find(choice => choice.id === id)
    if (answer) {
      questions.value.push(answer)
    }
    console.log(step, answer)
  }
})
</script>
