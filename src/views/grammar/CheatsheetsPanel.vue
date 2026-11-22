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

const TOPICS = [
  { value: 'formy', label: 'Czasowniki: formy' },
  { value: 'perfectum', label: 'Perfectum' },
  { value: 'imperfectum', label: 'Imperfectum' },
  { value: 'przedimek', label: 'Przedimek i spójnik' },
  { value: 'przyimki', label: 'Przyimki' },
  { value: 'zaimki', label: 'Zaimki' },
  { value: 'rzeczowniki', label: 'Rzeczowniki' },
] as const
type Topic = (typeof TOPICS)[number]['value']

const route = useRoute()
const router = useRouter()

const topic = computed<Topic>({
  get: () => TOPICS.find((t) => t.value === route.query.temat)?.value ?? 'formy',
  set: (value) => void router.replace({ query: { ...route.query, temat: value } }),
})
</script>

<template>
  <div>
    <h2 class="sr-only">Ściągawki z gramatyki</h2>
    <PillRadios v-model="topic" legend="Temat" :options="[...TOPICS]" />
    <VerbFormsSheet v-if="topic === 'formy'" />
    <VerbTenseSheet
      v-else-if="topic === 'perfectum' || topic === 'imperfectum'"
      :key="topic"
      :tense="topic === 'perfectum' ? 'perfect' : 'imperfect'"
    />
    <ArticleSheet v-else-if="topic === 'przedimek'" />
    <PrepositionsSheet v-else-if="topic === 'przyimki'" />
    <PronounsSheet v-else-if="topic === 'zaimki'" />
    <NounsSheet v-else />
  </div>
</template>
