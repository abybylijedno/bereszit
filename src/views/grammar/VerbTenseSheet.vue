<script setup lang="ts">
import { analyze } from '@/lib/converter'
import RootWord from '@/components/RootWord.vue'
import {
  getForm,
  getRows,
  personLabel,
  PARADIGM_ROOT,
  type Tense,
  type VerbForm,
} from '@/lib/grammar/verbParadigm'

const props = defineProps<{ tense: Tense }>()

const rows = getRows(props.tense)
const phonetics = (he: string) => analyze(he)[0]?.phonetics ?? ''
const sameAsLabel = (form: VerbForm) => {
  const other = form.sameAs ? getForm(props.tense, form.sameAs) : undefined
  return other ? personLabel(other.person, other.gender) : ''
}
</script>

<template>
  <div>
    <template v-if="tense === 'perfect'">
      <h3>Perfectum (forma kal)</h3>
      <p>
        Perfectum zazwyczaj odpowiada polskiemu czasowi przeszłemu. Wzorzec to czasownik mocny
        <span lang="he" dir="rtl">{{ PARADIGM_ROOT }}</span> (zabijać). Perfectum dodaje końcówki na
        końcu rdzenia.
      </p>
    </template>
    <template v-else>
      <h3>Imperfectum, czyli futurum (forma kal)</h3>
      <p>
        Imperfectum zazwyczaj odpowiada polskiemu czasowi przyszłemu. Wzorzec to czasownik mocny
        <span lang="he" dir="rtl">{{ PARADIGM_ROOT }}</span> (zabijać). Imperfectum dodaje
        przedrostki na początku rdzenia, a czasem też końcówki.
      </p>
    </template>
    <p class="note">
      Pierwszy wiersz (3 os. r. męski, liczba pojedyncza) to forma podstawowa, tak podaje się
      czasownik w słowniku.
    </p>

    <p class="legend">
      <span class="affix-sample">Kolor i pogrubienie</span> oznaczają dodatki: przedrostki i
      końcówki dodane do rdzenia. Rdzeń (spółgłoski
      <span lang="he" dir="rtl">{{ PARADIGM_ROOT }}</span
      >) ma zwykły kolor.
    </p>

    <table class="paradigm" role="table">
      <caption class="sr-only">
        Odmiana czasownika
        <span lang="he" dir="rtl">{{ PARADIGM_ROOT }}</span>
        w
        {{
          tense === 'perfect' ? 'perfectum' : 'imperfectum'
        }}
      </caption>
      <thead role="rowgroup">
        <tr role="row">
          <th scope="col">Osoba</th>
          <th scope="col">Liczba pojedyncza</th>
          <th scope="col">Liczba mnoga</th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        <tr v-for="row in rows" :key="row.label" role="row">
          <th scope="row" role="rowheader">{{ row.label }}</th>
          <td
            v-for="(form, i) in [row.singular, row.plural]"
            :key="form.id"
            role="cell"
            :data-label="i === 0 ? 'Liczba pojedyncza' : 'Liczba mnoga'"
          >
            <RootWord class="he" :word="form.he" :root="PARADIGM_ROOT" />
            <span class="ph">{{ phonetics(form.he) }}</span>
            <span v-if="form.sameAs" class="same">tak samo jak: {{ sameAsLabel(form) }}</span>
            <span v-else-if="form.gender === 'c' && form.person === 3" class="same">
              tak samo dla r. męskiego i żeńskiego
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <h3>Melodia samogłosek</h3>
    <template v-if="tense === 'perfect'">
      <p>
        Każdy czas ma swój charakterystyczny dźwięk samogłosek. Perfectum to melodia
        <strong>A-A</strong>, na przykład szAmArtA, kAtAwtA.
      </p>
    </template>
    <template v-else>
      <p>
        Każdy czas ma swój charakterystyczny dźwięk samogłosek. Imperfectum to melodia
        <strong>I-O</strong>, na przykład I-ktO-w, tI-szmOr. Samogłoska „o" to klucz do przyszłości.
      </p>
      <h3>Akronim E-I-T-A-N</h3>
      <p>
        Imię <span lang="he" dir="rtl">אֵיתָן</span> (Etan) przypomina o literach
        <span lang="he" dir="rtl">א י ת נ</span>. Jeśli słowo zaczyna się od jednej z nich, a pod
        nią jest krótka samogłoska (najczęściej hirik), to bardzo prawdopodobnie jest to czas
        przyszły.
      </p>
    </template>
  </div>
</template>

<style scoped>
.affix-sample {
  color: var(--affix);
  font-weight: 700;
  /* Large bold text (>= 14pt) needs only 4.5:1 for AAA, as the highlighted Hebrew affixes do. */
  font-size: 1.2rem;
}
.paradigm {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}
.paradigm th,
.paradigm td {
  border: 1px solid var(--border, currentColor);
  padding: 0.5rem 0.75rem;
  text-align: start;
  vertical-align: top;
}
.he {
  display: block;
  font-size: 1.8rem;
  line-height: 1.4;
}
.ph {
  display: block;
  font-weight: 600;
}
.same {
  display: block;
  font-size: 0.9rem;
  color: var(--muted);
}

@media (max-width: 40rem) {
  /* Stack each person as a block so nothing scrolls sideways; roles keep the table semantics. */
  .paradigm,
  .paradigm tbody,
  .paradigm tr,
  .paradigm th,
  .paradigm td {
    display: block;
  }
  .paradigm thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .paradigm tr {
    border: 1px solid var(--border);
    margin-bottom: 0.75rem;
  }
  .paradigm th[scope='row'] {
    border: 0;
    font-size: 1.1rem;
  }
  .paradigm td {
    border: 0;
    border-top: 1px solid var(--border);
  }
  .paradigm td::before {
    content: attr(data-label);
    display: block;
    font-size: 0.9rem;
    color: var(--muted);
  }
}
</style>
