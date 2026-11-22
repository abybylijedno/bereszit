<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PillRadios from '@/components/PillRadios.vue'
import VerbFormsSheet from './VerbFormsSheet.vue'
import VerbTenseSheet from './VerbTenseSheet.vue'
import ArticleSheet from './ArticleSheet.vue'
import PrepositionsSheet from './PrepositionsSheet.vue'
import PronounsSheet from './PronounsSheet.vue'
import NounsSheet from './NounsSheet.vue'
import SuffixesSheet from './SuffixesSheet.vue'
import OtherFormsSheet from './OtherFormsSheet.vue'
import { BINYAN_IDS, BINYAN_NAMES, type BinyanId } from '@/lib/grammar/binyanParadigms'

const TOPICS = [
  { value: 'formy', label: 'Czasowniki: formy' },
  { value: 'perfectum', label: 'Perfectum' },
  { value: 'imperfectum', label: 'Imperfectum' },
  { value: 'inne', label: 'Rozkaz, bezokolicznik, imiesłów' },
  { value: 'przedimek', label: 'Przedimek i spójnik' },
  { value: 'przyimki', label: 'Przyimki' },
  { value: 'zaimki', label: 'Zaimki' },
  { value: 'rzeczowniki', label: 'Rzeczowniki' },
  { value: 'przyrostki', label: 'Przyrostki zaimkowe' },
] as const
type Topic = (typeof TOPICS)[number]['value']

const FORMS = BINYAN_IDS.map((value) => ({ value, label: BINYAN_NAMES[value] }))
/** Topics that depend on the chosen verb form. */
const PER_FORM: Topic[] = ['perfectum', 'imperfectum', 'inne']

const route = useRoute()
const router = useRouter()

const topic = computed<Topic>({
  get: () => TOPICS.find((t) => t.value === route.query.temat)?.value ?? 'formy',
  set: (value) => void router.replace({ query: { ...route.query, temat: value } }),
})

const binyan = computed<BinyanId>({
  get: () => BINYAN_IDS.find((id) => id === route.query.forma) ?? 'kal',
  set: (value) => void router.replace({ query: { ...route.query, forma: value } }),
})
</script>

<template>
  <div>
    <h2 class="sr-only">Ściągawki z gramatyki</h2>
    <PillRadios v-model="topic" legend="Temat" :options="[...TOPICS]" />
    <PillRadios
      v-if="PER_FORM.includes(topic)"
      v-model="binyan"
      legend="Forma czasownika"
      :options="FORMS"
    />
    <VerbFormsSheet v-if="topic === 'formy'" />
    <VerbTenseSheet
      v-else-if="topic === 'perfectum' || topic === 'imperfectum'"
      :key="`${topic}-${binyan}`"
      :tense="topic === 'perfectum' ? 'perfect' : 'imperfect'"
      :binyan="binyan"
    />
    <OtherFormsSheet v-else-if="topic === 'inne'" :binyan="binyan" />
    <ArticleSheet v-else-if="topic === 'przedimek'" />
    <PrepositionsSheet v-else-if="topic === 'przyimki'" />
    <PronounsSheet v-else-if="topic === 'zaimki'" />
    <NounsSheet v-else-if="topic === 'rzeczowniki'" />
    <SuffixesSheet v-else />
  </div>
</template>
