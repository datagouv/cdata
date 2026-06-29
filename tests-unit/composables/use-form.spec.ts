import type { TranslationFunction } from '@datagouv/components-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { email, looksLikeUrl, maxLength, minLength, required, requiredIfFalsy, ruleIf, unique, url, useForm } from '~/composables/useForm'

const t: TranslationFunction = key => key

type Form = { title: string }
const callOn = (form: Form) => (rule: ReturnType<typeof required<Form, 'title', string>>) =>
  rule(form.title, 'title', form, t)

describe('validation rules', () => {
  it('required rejects empty values and accepts filled ones', async () => {
    const call = (value: unknown) => required()(value as never, 'title' as never, {} as never, t)

    expect(await call('')).toEqual('Le champ est requis.')
    expect(await call(null)).toEqual('Le champ est requis.')
    expect(await call(undefined)).toEqual('Le champ est requis.')
    expect(await call([])).toEqual('Le champ est requis.')

    expect(await call('x')).toBeNull()
    expect(await call(['x'])).toBeNull()
    expect(await call({ id: 'x' })).toBeNull()

    // Current contract: 0 and false count as empty. No form validates a
    // numeric or boolean field with required() today — revisit if one does.
    expect(await call(0)).toEqual('Le champ est requis.')
    expect(await call(false)).toEqual('Le champ est requis.')
  })

  it('minLength also acts as required on empty values', async () => {
    const call = (value?: string) => minLength<Form, 'title', string>(3)(value as never, 'title', { title: value ?? '' }, t)

    expect(await call(undefined)).toEqual('Le champ doit être de {min} caractères minimum')
    expect(await call('ab')).toEqual('Le champ doit être de {min} caractères minimum')
    expect(await call('abc')).toBeNull()
  })

  it('maxLength lets empty values through', async () => {
    const call = (value?: string) => maxLength<Form, 'title', string>(3)(value as never, 'title', { title: value ?? '' }, t)

    expect(await call(undefined)).toBeNull()
    expect(await call('abc')).toBeNull()
    expect(await call('abcd')).toEqual('Le champ doit être de {max} caractères maximum')
  })

  it('email validates the shape and skips empty values', async () => {
    const call = (value?: string) => email<Form, 'title', string>()(value as never, 'title', { title: value ?? '' }, t)

    expect(await call(undefined)).toBeNull()
    expect(await call('user@example.com')).toBeNull()
    expect(await call('user+tag@sub.example.com')).toBeNull()
    expect(await call('user@example')).toEqual('Le champ doit être une adresse e-mail valide')
    expect(await call('not an email')).toEqual('Le champ doit être une adresse e-mail valide')
  })

  it('url accepts parseable URLs only, looksLikeUrl warns on them', async () => {
    const callUrl = (value: string) => url<Form, 'title', string>()(value as never, 'title', { title: value }, t)
    const callLooksLike = (value: string) => looksLikeUrl<Form, 'title', string>()(value as never, 'title', { title: value }, t)

    expect(await callUrl('https://example.com')).toBeNull()
    expect(await callUrl('example.com')).toEqual('Le champ doit être une URL valide')

    expect(await callLooksLike('https://example.com')).toEqual('Ce champ semble contenir un lien.')
    expect(await callLooksLike('just a title')).toBeNull()
  })

  it('ruleIf only applies the rule when the condition is true', async () => {
    const condition = ref(false)
    const rule = ruleIf<Form, 'title', string>(condition, required())
    const call = callOn({ title: '' })

    expect(await call(rule)).toBeNull()
    condition.value = true
    expect(await call(rule)).toEqual('Le champ est requis.')
  })

  it('requiredIfFalsy errors only when both fields are empty', async () => {
    type PostForm = { image: string, image_url: string }
    const rule = requiredIfFalsy<PostForm, 'image', string>('image_url')
    const call = (form: PostForm) => rule(form.image as never, 'image', form, t)

    expect(await call({ image: '', image_url: '' })).toEqual('Le champ est requis.')
    expect(await call({ image: '', image_url: 'https://example.com/a.png' })).toBeNull()
    expect(await call({ image: 'something', image_url: '' })).toBeNull()
  })
})

describe('unique', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const callUnique = async (total: number) => {
    vi.stubGlobal('useAPI', async () => ({ data: ref({ total }) }))
    const rule = unique<{ id: string }, Form, 'title', string>(value => `/api/1/organizations/?name=${value}`)
    return await rule('Taken name' as never, 'title', { title: 'Taken name' }, t)
  }

  it('errors when the API finds an existing object', async () => {
    expect(await callUnique(1)).toEqual('\'{value}\' existe déjà')
  })

  it('passes when the API finds nothing', async () => {
    expect(await callUnique(0)).toBeNull()
  })
})

describe('useForm', () => {
  const makeForm = () => useForm(
    { title: '', description: 'too short' },
    { title: [required()] },
    { description: [minLength<{ title: string, description: string }, 'description', string>(200)] },
  )

  it('touch runs error rules and exposes the first error', async () => {
    const { formInfo } = makeForm()

    expect(formInfo.isTouched('title')).toBe(false)
    await formInfo.touch('title')
    expect(formInfo.isTouched('title')).toBe(true)
    expect(formInfo.getFirstError('title')).toEqual('Le champ est requis.')
  })

  it('errors disappear once the value is fixed and touched again', async () => {
    const { form, formInfo } = makeForm()

    await formInfo.touch('title')
    form.value.title = 'A real title'
    await formInfo.touch('title')
    expect(formInfo.getFirstError('title')).toBeNull()
  })

  it('separates errors from warnings', async () => {
    const { formInfo } = makeForm()
    await formInfo.touch('title')
    await formInfo.touch('description')

    expect(formInfo.getFirstError('description')).toBeNull()
    expect(formInfo.getFirstWarning('description')).toEqual('Le champ doit être de 200 caractères minimum')

    // Regression: warningsAsList used to return the errors list
    expect(formInfo.warningsAsList.value).toEqual(['Le champ doit être de 200 caractères minimum'])
    expect(formInfo.errorsAsList.value).toEqual(['Le champ est requis.'])
  })

  it('validate touches every field and fails only on errors', async () => {
    const { form, formInfo } = makeForm()

    // A warning alone (short description) must not block validation
    form.value.title = 'A real title'
    expect(await formInfo.validate()).toBe(true)

    form.value.title = ''
    expect(await formInfo.validate()).toBe(false)
    expect(formInfo.getFirstError('title')).toEqual('Le champ est requis.')
  })

  it('removeErrorsAndWarnings resets the state', async () => {
    const { formInfo } = makeForm()
    await formInfo.validate()
    formInfo.removeErrorsAndWarnings()
    expect(formInfo.getFirstError('title')).toBeNull()
    expect(formInfo.touched.value).toEqual([])
  })
})
