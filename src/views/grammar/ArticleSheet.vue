<script setup lang="ts">
import { analyze } from '@/lib/converter'
import {
  accusativeSentence,
  article,
  conjunction,
  conjunctionExceptions,
  questionParticle,
} from '@/lib/grammar/sheets'
import ExampleList from './ExampleList.vue'
import LegendAffix from './LegendAffix.vue'

const phonetics = (he: string) => analyze(he)[0]?.phonetics ?? ''
</script>

<template>
  <div>
    <h3>Przedimek i spójnik</h3>
    <LegendAffix what="dodatek dołączony do początku słowa" />

    <h4>Przedimek <span lang="he" dir="rtl">הַ</span></h4>
    <p>Odpowiada angielskiemu „the". Po polsku tłumaczymy go jako „ten", „ta", „to", „te".</p>
    <ExampleList :items="article" label="Przykłady przedimka" />

    <h4>Partykuła pytająca <span lang="he" dir="rtl">הֲ</span></h4>
    <p>Zamienia zdanie w pytanie, na przykład „Czy będzie ryczał?".</p>
    <ExampleList :items="questionParticle" label="Przykład partykuły pytającej" />
    <p>
      Jak ją odróżnić od przedimka? Głównie trzeba zrozumieć kontekst. Pomocniczo: jeżeli po
      <span lang="he" dir="rtl">ה</span> występuje dagesz, to jest to przedimek.
    </p>

    <h4>Spójnik <span lang="he" dir="rtl">וְ</span> („i", „a")</h4>
    <ExampleList :items="conjunction" label="Przykład spójnika" />
    <p>
      Wyjątki: te słowa zaczynają się od <span lang="he" dir="rtl">ו</span>, ale to nie spójnik.
    </p>
    <ExampleList :items="conjunctionExceptions" label="Słowa zaczynające się od waw" />

    <h4>Nota accusativi <span lang="he" dir="rtl">אֶת</span></h4>
    <p>
      Wskazuje na dopełnienie bliższe (biernik). Odpowiada na pytanie „kogo? co?". Po polsku się jej
      nie tłumaczy.
    </p>
    <p class="sentence">
      <span lang="he" dir="rtl">{{ accusativeSentence.he }}</span>
      <span class="ph">{{ phonetics(accusativeSentence.he) }}</span>
    </p>
    <ul class="parts" aria-label="Części zdania">
      <li v-for="part in accusativeSentence.parts" :key="part.he">
        <span lang="he" dir="rtl" class="he">{{ part.he }}</span> – {{ part.pl }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sentence {
  font-size: 2rem;
  line-height: 1.5;
  margin: 0;
}
.sentence .ph {
  display: block;
  font-size: 1rem;
  font-weight: 600;
}
.parts {
  padding-inline-start: 1.25rem;
}
.he {
  font-size: 1.5rem;
}
</style>
