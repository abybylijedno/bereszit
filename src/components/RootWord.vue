<script setup lang="ts">
/**
 * A Hebrew word with what was added to its root (prefixes and endings) highlighted by colour
 * only. No bold: it changes the look of the letters. Known exception to WCAG 1.4.1, see CLAUDE.md.
 * The root keeps the normal style.
 */
import { computed } from 'vue'
import { splitRoot } from '@/lib/grammar/rootHighlight'

const props = defineProps<{ word: string; root: string }>()
const parts = computed(() => splitRoot(props.word, props.root))
</script>

<template>
  <span lang="he" dir="rtl"
    ><template v-for="(part, i) in parts" :key="i"
      ><template v-if="part.isRoot">{{ part.text }}</template
      ><span v-else class="affix">{{ part.text }}</span></template
    ></span
  >
</template>

<style scoped>
.affix {
  color: var(--affix);
}
</style>
