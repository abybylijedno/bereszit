<script setup lang="ts">
import { analyze } from '@/lib/converter'
import RootWord from '@/components/RootWord.vue'
import { binyanim, EXAMPLE_ROOT, EXAMPLE_ROOT_MEANING } from '@/lib/grammar/binyanim'

const phonetics = (he: string) => analyze(he)[0]?.phonetics ?? ''
</script>

<template>
  <div>
    <h3>Czasownik: formy (koniugacje)</h3>
    <p>
      Hebrajski czasownik ma 7 form. Każda zmienia znaczenie rdzenia. Poniżej wszystkie formy
      czasownika <span lang="he" dir="rtl">{{ EXAMPLE_ROOT }}</span> ({{ EXAMPLE_ROOT_MEANING }}), w
      3 osobie liczby pojedynczej rodzaju męskiego.
    </p>
    <p>
      <span class="affix-sample">Ten kolor</span> oznacza dodatki: przedrostki dodane do rdzenia.
      Rdzeń ma zwykły kolor.
    </p>
    <ul class="forms">
      <li v-for="b in binyanim" :key="b.name" class="card">
        <h4>{{ b.name }}</h4>
        <p class="desc">{{ b.description }}</p>
        <p class="example">
          <RootWord class="he" :word="b.he" :root="EXAMPLE_ROOT" />
          <span>
            <span class="ph">{{ phonetics(b.he) }}</span>
            <span class="meaning">{{ b.meaning }}</span>
          </span>
        </p>
      </li>
    </ul>
    <p class="note">
      Nie trzymaj się tego schematu zbyt ściśle. Dokładne znaczenie czasownika w danej formie
      sprawdź w słowniku.
    </p>

    <h3>Jak rozpoznać formę po wymowie</h3>
    <p>
      Wymowa odmienionego czasownika często zdradza nazwę formy. Na przykład
      <span lang="he" dir="rtl">נִכְתָב</span> czytamy „niktaw", a to prowadzi do nazwy „Nifal".
      Podobnie <span lang="he" dir="rtl">הִתְכַּתֵּב</span> czytamy „hitkatew", czyli „Hitpael".
    </p>

    <h3>Rodzaje czasowników</h3>
    <p>
      Czasowniki dzielimy na dwa sposoby. Każdy czasownik należy do jednej grupy z każdego podziału.
    </p>
    <div class="splits">
      <section class="split" aria-labelledby="split-roots">
        <h4 id="split-roots">Podział 1: spółgłoski rdzenne</h4>
        <dl class="pair">
          <div>
            <dt>Mocny</dt>
            <dd>Zachowuje spółgłoski rdzenne we wszystkich koniugacjach.</dd>
          </div>
          <div>
            <dt>Słaby</dt>
            <dd>Czasem niektóre spółgłoski rdzenne znikają.</dd>
          </div>
        </dl>
      </section>
      <section class="split" aria-labelledby="split-meaning">
        <h4 id="split-meaning">Podział 2: znaczenie</h4>
        <dl class="pair">
          <div>
            <dt>Aktywny</dt>
            <dd>Opisuje czynność.</dd>
          </div>
          <div>
            <dt>Statyczny</dt>
            <dd>Opisuje stan (taki nasz przymiotnik).</dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>

<style scoped>
.affix-sample {
  color: var(--affix);
  /* Large text (>= 24px) needs only 4.5:1 for AAA, as the highlighted Hebrew affixes do. */
  font-size: 1.5rem;
}
.forms {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}
h4 {
  margin: 0 0 0.25rem;
}
.desc {
  margin: 0 0 0.5rem;
}
.example {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 0;
}
.he {
  font-size: 2rem;
  line-height: 1.4;
}
.ph {
  display: block;
  font-weight: 600;
}
.meaning {
  display: block;
  color: var(--muted);
}
.splits {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
}
.split h4 {
  margin: 0 0 0.4rem;
}
/* Two halves that always sit side by side, so it is clear they are one division. */
.pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  margin: 0;
  border: 2px solid var(--border);
  border-radius: 2rem;
  overflow: hidden;
  background: var(--surface);
}
.pair > div {
  padding: 0.75rem 1rem;
}
.pair > div:first-child {
  border-inline-end: 2px solid var(--border);
  padding-inline-start: 1.25rem;
}
.pair > div:last-child {
  padding-inline-end: 1.25rem;
}
dt {
  font-weight: 700;
  font-size: 1.1rem;
}
dd {
  margin: 0.25rem 0 0;
}
</style>
