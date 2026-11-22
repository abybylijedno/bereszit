<script setup lang="ts">
/**
 * A Hebrew word with the part that was added to it (a prefix or an ending) in the
 * highlight colour. Colour only, as in RootWord; the legend on the sheet explains it.
 */
import { computed } from 'vue'

const props = defineProps<{ word: string; prefix?: string; suffix?: string }>()

const parts = computed(() => {
  const { word, prefix, suffix } = props
  if (prefix && word.startsWith(prefix))
    return [
      { text: prefix, affix: true },
      { text: word.slice(prefix.length), affix: false },
    ]
  if (suffix && word.endsWith(suffix))
    return [
      { text: word.slice(0, word.length - suffix.length), affix: false },
      { text: suffix, affix: true },
    ]
  return [{ text: word, affix: false }]
})
</script>

<template>
  <span lang="he" dir="rtl"
    ><template v-for="(part, i) in parts" :key="i"
      ><span v-if="part.affix" class="affix">{{ part.text }}</span
      ><template v-else>{{ part.text }}</template></template
    ></span
  >
</template>

<style scoped>
.affix {
  color: var(--affix);
}
</style>
