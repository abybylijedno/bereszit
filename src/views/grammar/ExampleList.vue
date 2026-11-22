<script setup lang="ts">
/** Examples of a rule: the Hebrew word (added part highlighted), its pronunciation and meaning. */
import AffixWord from '@/components/AffixWord.vue'
import { analyze } from '@/lib/converter'
import type { Example } from '@/lib/grammar/sheets'

defineProps<{ items: Example[]; label: string }>()

const phonetics = (he: string) =>
  analyze(he)
    .map((w) => w.phonetics)
    .join(' ')
</script>

<template>
  <ul class="examples" :aria-label="label">
    <li v-for="item in items" :key="item.he" class="card">
      <AffixWord class="he" :word="item.he" :prefix="item.prefix" :suffix="item.suffix" />
      <span class="text">
        <span class="ph">{{ phonetics(item.he) }}</span>
        <span class="pl">{{ item.pl }}</span>
      </span>
    </li>
  </ul>
</template>

<style scoped>
.examples {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}
.card {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.he {
  font-size: 2rem;
  line-height: 1.4;
}
.ph {
  display: block;
  font-weight: 600;
}
.pl {
  display: block;
  color: var(--muted);
}
</style>
