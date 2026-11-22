<script setup lang="ts">
import AffixWord from '@/components/AffixWord.vue'
import { analyze } from '@/lib/converter'
import { feminineNouns, pluralRules } from '@/lib/grammar/sheets'
import ExampleList from './ExampleList.vue'
import LegendAffix from './LegendAffix.vue'

const phonetics = (he: string) => analyze(he)[0]?.phonetics ?? ''
</script>

<template>
  <div>
    <h3>Rzeczowniki</h3>
    <LegendAffix what="końcówkę rzeczownika" />

    <h4>Rzeczowniki rodzaju żeńskiego</h4>
    <p>
      Rzeczowniki rodzaju żeńskiego mają na końcu <span lang="he" dir="rtl">ה</span> lub
      <span lang="he" dir="rtl">ת</span>.
    </p>
    <ExampleList :items="feminineNouns" label="Rzeczowniki rodzaju żeńskiego" />

    <h4>Rzeczowniki w liczbie mnogiej</h4>
    <ul class="plural" aria-label="Tworzenie liczby mnogiej">
      <li v-for="rule in pluralRules" :key="rule.gender" class="card">
        <h5>
          {{ rule.label }}: dodajemy
          <span lang="he" dir="rtl" class="he">{{ rule.ending }}</span>
        </h5>
        <p class="equation">
          <AffixWord class="he" :word="rule.plural.he" :suffix="rule.plural.suffix" />
          <span aria-hidden="true"> = </span>
          <span class="sr-only">to to samo co</span>
          <span lang="he" dir="rtl" class="he affix">{{ rule.ending }}</span>
          <span aria-hidden="true"> + </span>
          <span class="sr-only">plus</span>
          <span lang="he" dir="rtl" class="he">{{ rule.base }}</span>
        </p>
        <p class="ph">{{ phonetics(rule.plural.he) }}: {{ rule.plural.pl }}</p>
      </li>
    </ul>
    <p class="note">
      Przy rodzaju żeńskim końcowe <span lang="he" dir="rtl">ה</span> znika:
      <span lang="he" dir="rtl">סוּסָה</span> + <span lang="he" dir="rtl">וֹת</span> daje
      <span lang="he" dir="rtl">סוּסוֹת</span>.
    </p>
  </div>
</template>

<style scoped>
.plural {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
}
h5 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}
.he {
  font-size: 1.8rem;
  line-height: 1.4;
}
.affix {
  color: var(--affix);
}
.equation {
  margin: 0;
}
.ph {
  margin: 0.25rem 0 0;
  font-weight: 600;
}
</style>
