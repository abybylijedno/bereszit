<script setup lang="ts">
/**
 * Fonetyka > Teksty: two ways of working with a whole Hebrew text.
 * "Quiz" - the user types the pronunciation; "Konwerter" - the app shows it.
 * The mode lives in the URL (?tryb=...), and both panels stay alive while switching,
 * so pasted text and quiz progress are not lost.
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PillRadios from '@/components/PillRadios.vue'
import QuizPanel from '@/views/phonetics/QuizPanel.vue'
import ConverterPanel from '@/views/phonetics/ConverterPanel.vue'

type Mode = 'quiz' | 'konwerter'
const modes: { value: Mode; label: string }[] = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'konwerter', label: 'Konwerter' },
]

const route = useRoute()
const router = useRouter()

const mode = computed<Mode>({
  get: () => (route.query.tryb === 'konwerter' ? 'konwerter' : 'quiz'),
  set: (value) => {
    void router.replace({ query: { ...route.query, tryb: value } })
  },
})
</script>

<template>
  <div>
    <h2 class="sr-only">Teksty</h2>
    <PillRadios v-model="mode" legend="Tryb" :options="modes" />
    <KeepAlive>
      <component :is="mode === 'quiz' ? QuizPanel : ConverterPanel" />
    </KeepAlive>
  </div>
</template>
