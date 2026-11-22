<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PillRadios from '@/components/PillRadios.vue'
import VerbFormsSheet from './VerbFormsSheet.vue'
import VerbTenseSheet from './VerbTenseSheet.vue'

const TOPICS = [
  { value: 'formy', label: 'Czasowniki: formy' },
  { value: 'perfectum', label: 'Perfectum' },
  { value: 'imperfectum', label: 'Imperfectum' },
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
    <VerbTenseSheet v-else :key="topic" :tense="topic === 'perfectum' ? 'perfect' : 'imperfect'" />
  </div>
</template>
