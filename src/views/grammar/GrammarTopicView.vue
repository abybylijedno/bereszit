<script setup lang="ts">
/**
 * One grammar topic: its cheat sheet or, for topics that have them, its exercises. The topic and
 * the verb form are in the path bar; the choice between sheet and exercises is a setting here.
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PatternVerbPicker from '@/components/PatternVerbPicker.vue'
import PillRadios from '@/components/PillRadios.vue'
import type { WordTopic } from '@/lib/grammar/wordQuiz'
import { formaOf, getSection, grammarMode, type GrammarMode } from '@/lib/navigation'
import ArticleSheet from './ArticleSheet.vue'
import NounsSheet from './NounsSheet.vue'
import OtherFormsSheet from './OtherFormsSheet.vue'
import PrepositionsSheet from './PrepositionsSheet.vue'
import PronounsSheet from './PronounsSheet.vue'
import SuffixesSheet from './SuffixesSheet.vue'
import VerbExercises from './VerbExercises.vue'
import VerbFormsSheet from './VerbFormsSheet.vue'
import VerbTenseSheet from './VerbTenseSheet.vue'
import WordExercises from './WordExercises.vue'

const route = useRoute()
const router = useRouter()

const topic = computed(
  () => getSection('gramatyka').topics.find((t) => t.id === route.params.topic)!,
)
const mode = computed<GrammarMode>({
  get: () => grammarMode(route.query, topic.value),
  set: (value) =>
    void router.replace({
      query: { ...route.query, tryb: value === 'cwiczenia' ? 'cwiczenia' : undefined },
    }),
})
const forma = computed(() => formaOf(route.query, mode.value))
const modeOptions = [
  { value: 'sciagawka' as const, label: 'Ściągawka' },
  { value: 'cwiczenia' as const, label: 'Ćwiczenia' },
]
/** The topics that have word exercises (the template only reaches them for those). */
const wordTopic = computed(() => topic.value.id as WordTopic)
/** The sheets with verb tables and examples; they are made for the chosen pattern verb. */
const usesPattern = computed(() =>
  ['formy', 'perfectum', 'imperfectum', 'rozkaz'].includes(topic.value.id),
)
const tense = computed(() => (topic.value.id === 'imperfectum' ? 'imperfect' : 'perfect'))
</script>

<template>
  <div>
    <h2 class="sr-only">{{ topic.label }}</h2>
    <PillRadios v-if="topic.exercises" v-model="mode" legend="Tryb" :options="modeOptions" />

    <template v-if="mode === 'cwiczenia'">
      <VerbExercises
        v-if="topic.id === 'perfectum' || topic.id === 'imperfectum'"
        :key="topic.id"
        :tense="topic.id"
        :binyan="forma"
      />
      <WordExercises v-else :key="topic.id" :topic="wordTopic" />
    </template>
    <template v-else>
      <PatternVerbPicker v-if="usesPattern" />
      <VerbFormsSheet v-if="topic.id === 'formy'" />
      <VerbTenseSheet
        v-else-if="topic.id === 'perfectum' || topic.id === 'imperfectum'"
        :key="`${topic.id}-${forma}`"
        :tense="tense"
        :binyan="forma === 'wszystkie' ? 'kal' : forma"
      />
      <OtherFormsSheet
        v-else-if="topic.id === 'rozkaz'"
        :binyan="forma === 'wszystkie' ? 'kal' : forma"
      />
      <ArticleSheet v-else-if="topic.id === 'przedimek'" />
      <PrepositionsSheet v-else-if="topic.id === 'przyimki'" />
      <PronounsSheet v-else-if="topic.id === 'zaimki'" />
      <NounsSheet v-else-if="topic.id === 'rzeczowniki'" />
      <SuffixesSheet v-else />
    </template>
  </div>
</template>
