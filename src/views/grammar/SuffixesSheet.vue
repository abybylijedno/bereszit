<script setup lang="ts">
import AffixWord from '@/components/AffixWord.vue'
import { analyze } from '@/lib/converter'
import {
  NOUN,
  NOUN_MEANING,
  NOUN_PLURAL_MEANING,
  pluralNoun,
  prepositionSuffixes,
  singularNoun,
  type SuffixRow,
} from '@/lib/grammar/suffixes'
import LegendAffix from './LegendAffix.vue'

const phonetics = (he: string) => analyze(he)[0]?.phonetics ?? ''
const tables: { id: string; title: string; rows: SuffixRow[] }[] = [
  { id: 'singular', title: `Jeden ${NOUN_MEANING} (liczba pojedyncza)`, rows: singularNoun },
  {
    id: 'plural',
    title: `Wiele ${NOUN_PLURAL_MEANING} (liczba mnoga)`,
    rows: pluralNoun,
  },
]
</script>

<template>
  <div>
    <h3>Przyrostki zaimkowe</h3>
    <p>
      Przyrostek zaimkowy dopisany na końcu rzeczownika mówi, do kogo coś należy: „mój koń", „jego
      konie". Wzorcem jest rzeczownik <span lang="he" dir="rtl">{{ NOUN }}</span> ({{
        NOUN_MEANING
      }}).
    </p>
    <p>
      Znak <span class="carrier" aria-hidden="true">◌</span><span class="sr-only">kółko</span> w
      przyrostku oznacza ostatnią literę rzeczownika. Samogłoska pod nim jest częścią przyrostka.
    </p>
    <LegendAffix what="przyrostek dopisany do rzeczownika" />

    <section v-for="t in tables" :key="t.id">
      <h4>{{ t.title }}</h4>
      <table class="data-table" role="table">
        <caption class="sr-only">
          Przyrostki zaimkowe:
          {{
            t.title
          }}
        </caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col">Należy do</th>
            <th scope="col">Przyrostek</th>
            <th scope="col">Przykład</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          <tr v-for="r in t.rows" :key="r.owner" role="row">
            <th scope="row" role="rowheader">{{ r.owner }}</th>
            <td role="cell" data-label="Przyrostek">
              <span v-for="(ending, i) in r.endings" :key="ending" class="ending">
                <span v-if="i > 0" class="or">lub</span>
                <span class="he affix" lang="he" dir="rtl">{{ ending }}</span>
              </span>
            </td>
            <td role="cell" data-label="Przykład">
              <AffixWord class="he" :word="r.he" :suffix="r.suffix" />
              <span class="ph">{{ phonetics(r.he) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="t.id === 'plural'" class="note">
        Przy liczbie mnogiej przyrostki są prawie takie same jak przy pojedynczej. Dochodzi tylko
        <span lang="he" dir="rtl">י</span> przed literami przyrostka.
      </p>
    </section>

    <h4>Przyrostki przy przyimkach</h4>
    <p>Takie same przyrostki dopisujemy też do przyimków.</p>
    <ul class="prep" aria-label="Przyrostki przy przyimkach">
      <li v-for="p in prepositionSuffixes" :key="p.he" class="card">
        <p class="sum">
          <span class="he affix" lang="he" dir="rtl">{{ p.ending }}</span>
          <span aria-hidden="true"> + </span><span class="sr-only">plus</span>
          <span class="he" lang="he" dir="rtl">{{ p.base }}</span>
          <span v-if="p.baseMeaning" class="note"> ({{ p.baseMeaning }})</span>
        </p>
        <p class="result">
          <AffixWord class="he" :word="p.he" :suffix="p.suffix" />
          <span class="ph">{{ phonetics(p.he) }}</span>
          <span class="pl">{{ p.pl }}</span>
        </p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.he {
  font-size: 1.8rem;
  line-height: 1.4;
}
.affix {
  color: var(--affix);
}
.carrier {
  font-size: 1.3rem;
}
.ph {
  display: block;
  font-weight: 600;
}
.or {
  display: block;
  font-size: 0.9rem;
  color: var(--muted);
}
.ending {
  display: block;
}
.prep {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
}
.sum,
.result {
  margin: 0;
}
.pl {
  display: block;
  color: var(--muted);
}
</style>
