<script setup lang="ts">
/** Exercises: the section picker (verbs or one of the small-word topics) and the chosen exercise. */
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PillRadios from '@/components/PillRadios.vue'
import { WORD_TOPIC_LABELS, type WordTopic } from '@/lib/grammar/wordQuiz'
import VerbExercises from './VerbExercises.vue'
import WordExercises from './WordExercises.vue'

type Section = 'czasowniki' | WordTopic
const SECTIONS: { value: Section; label: string }[] = [
  { value: 'czasowniki', label: 'Czasowniki' },
  ...(Object.keys(WORD_TOPIC_LABELS) as WordTopic[]).map((value) => ({
    value,
    label: WORD_TOPIC_LABELS[value],
  })),
]

const route = useRoute()
const router = useRouter()

const section = computed<Section>({
  get: () => SECTIONS.find((s) => s.value === route.query.dzial)?.value ?? 'czasowniki',
  set: (value) => void router.replace({ query: { ...route.query, dzial: value } }),
})

/** True while a session runs: the picker is hidden, so a stray click cannot end it. */
const active = ref(false)
</script>

<template>
  <div>
    <h2 class="sr-only">Ćwiczenia z gramatyki</h2>
    <PillRadios v-if="!active" v-model="section" legend="Dział" :options="SECTIONS" />
    <VerbExercises v-if="section === 'czasowniki'" @active="active = $event" />
    <WordExercises v-else :key="section" :topic="section" @active="active = $event" />
  </div>
</template>
