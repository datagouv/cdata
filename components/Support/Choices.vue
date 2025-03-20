<template>
  <div
    class="flex flex-wrap gap-2"
    role="listbox"
    :aria-labelledby="question.title"
    tabindex="0"
    :aria-activedescendant="active"
    @keydown="handleKeyPressForActiveDescendant"
    @keydown.space.prevent="$emit('select', active)"
    @keydown.enter.prevent="$emit('select', active)"
    @focusout="focusOut"
  >
    <template v-if="'choices' in question">
      <SupportChoice
        v-for="choice in question.choices"
        :key="choice.id"
        :active="isActive(choice.id)"
        :selected="choice.id === selected"
        @select="$emit('select', choice.id)"
      >
        {{ choice.label }}
      </SupportChoice>
    </template>
    <template v-else-if="'recipient' in question">
      <form
        class="w-4xl"
        @submit="submit(question)"
      >
        <InputGroup
          v-model="form.email"
          label="Votre adresse email"
          type="email"
          :required="true"
          :has-error="!!getFirstError('email')"
          :error-text="getFirstError('email')"
          @input="touch('email')"
        />
        <InputGroup
          v-model="form.subject"
          label="Le sujet de votre question"
          type="text"
          :required="true"
          :has-error="!!getFirstError('subject')"
          :error-text="getFirstError('subject')"
          @input="touch('subject')"
        />
        <InputGroup
          v-model="form.body"
          label="Votre question"
          type="textarea"
          :required="true"
          :has-error="!!getFirstError('body')"
          :error-text="getFirstError('body')"
          @input="touch('body')"
        />
        <BrandedButton type="submit">
          Envoyer
        </BrandedButton>
      </form>
    </template>
    <template v-else-if="'answer' in question">
      <SimpleBanner
        type="gray"
        class="p-8"
      >
        <h4 class="font-extrabold mb-3 text-lg">
          Explication
        </h4>
        <MarkdownViewer
          v-if="answerResponse"
          :content="answerResponse"
        />
        <div
          v-if="'button_link' in question"
          class="mt-2 text-center"
        >
          <BrandedButton
            :href="question.button_link"
          >
            {{ question.button_text }}
          </BrandedButton>
        </div>
      </SimpleBanner>
    </template>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import MarkdownViewer from '~/components/MarkdownViewer/MarkdownViewer.vue'
import useActiveDescendant from '~/datagouv-components/src/composables/useActiveDescendant'
import type { Question, QuestionWithRecipient } from '~/types/support'

defineEmits<{
  select: [id: string | undefined]
}>()

const props = defineProps<{
  question: Question
  selected: string | undefined
}>()

const answerResponse = ref('')

const { isActive, active, focusOut, handleKeyPressForActiveDescendant } = useActiveDescendant('choices' in props.question ? props.question.choices : [], 'horizontal')

const { form, touch, getFirstError, validate } = useForm({
  email: '',
  subject: '',
  body: '',
}, {
  email: [required(), email()],
  subject: [required()],
  body: [required()],
}, {
})

watchEffect(async () => {
  if (props.question && 'answer' in props.question) {
    const module = await import(`~/assets/config/answers/${props.question.answer}.md?raw`)
    answerResponse.value = module.default
  }
})

function submit(question: QuestionWithRecipient) {
  if (!validate()) {
    return
  }
}
</script>
