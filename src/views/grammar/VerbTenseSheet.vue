<script setup lang="ts">
import { computed } from 'vue'
import { analyze } from '@/lib/converter'
import RootWord from '@/components/RootWord.vue'
import { usePatternVerb } from '@/composables/usePatternVerb'
import { BINYAN_NAMES, type BinyanId } from '@/lib/grammar/binyanParadigms'
import { formInfo, patternForms, patternRows } from '@/lib/grammar/patternVerb'
import { personLabel, type Tense, type VerbForm } from '@/lib/grammar/verbParadigm'

const props = withDefaults(defineProps<{ tense: Tense; binyan?: BinyanId }>(), { binyan: 'kal' })

const { root } = usePatternVerb()
const rows = computed(() => patternRows(props.binyan, props.tense, root.value))
const forms = computed(() => patternForms(props.binyan, props.tense, root.value))
const info = computed(() => formInfo(props.binyan, root.value))
/** Pronunciation of the example, with its meaning when we know it ("pisać" only). */
const exampleNote = computed(
  () => `${phonetics(info.value.he)}${info.value.meaning ? `, „${info.value.meaning}”` : ''}`,
)
const name = computed(() => BINYAN_NAMES[props.binyan])
const phonetics = (he: string) => analyze(he)[0]?.phonetics ?? ''
const sameAsLabel = (form: VerbForm) => {
  const other = form.sameAs ? forms.value.find((x) => x.id === form.sameAs) : undefined
  return other ? personLabel(other.person, other.gender) : ''
}
</script>

<template>
  <div>
    <template v-if="tense === 'perfect'">
      <h3>Perfectum (forma {{ name.toLowerCase() }})</h3>
      <p>
        Perfectum zazwyczaj odpowiada polskiemu czasowi przeszłemu. Wzorcem jest czasownik mocny
        <span lang="he" dir="rtl">{{ root.he }}</span> ({{ root.pl }}) w formie
        {{ name.toLowerCase() }}. Perfectum dodaje końcówki na końcu rdzenia.
      </p>
    </template>
    <template v-else>
      <h3>Imperfectum, czyli futurum (forma {{ name.toLowerCase() }})</h3>
      <p>
        Imperfectum zazwyczaj odpowiada polskiemu czasowi przyszłemu. Wzorcem jest czasownik mocny
        <span lang="he" dir="rtl">{{ root.he }}</span> ({{ root.pl }}) w formie
        {{ name.toLowerCase() }}. Imperfectum dodaje przedrostki na początku rdzenia, a czasem też
        końcówki.
      </p>
    </template>
    <section class="form-info" :aria-label="`Forma ${name.toLowerCase()}`">
      <p>
        <strong>Forma {{ name.toLowerCase() }}:</strong> {{ info.description.toLowerCase() }}.
        Przykład: <RootWord class="example-he" :word="info.he" :root="root.letters" /> ({{
          exampleNote
        }}).
      </p>
    </section>
    <p class="note">
      Pierwszy wiersz (3 os. r. męski, liczba pojedyncza) to forma podstawowa, tak podaje się
      czasownik w słowniku.
    </p>

    <p class="legend">
      <span class="affix-sample">Ten kolor</span> oznacza dodatki: przedrostki, końcówki i litery
      wstawione w środku. Rdzeń (spółgłoski <span lang="he" dir="rtl">{{ root.he }}</span
      >) ma zwykły kolor.
    </p>

    <table class="paradigm" role="table">
      <caption class="sr-only">
        Odmiana czasownika
        <span lang="he" dir="rtl">{{ root.he }}</span>
        w
        {{
          tense === 'perfect' ? 'perfectum' : 'imperfectum'
        }}, forma
        {{
          name.toLowerCase()
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
            <RootWord class="he" :word="form.he" :root="root.letters" />
            <span class="ph">{{ phonetics(form.he) }}</span>
            <span v-if="form.sameAs" class="same">tak samo jak: {{ sameAsLabel(form) }}</span>
            <span v-else-if="form.gender === 'c' && form.person === 3" class="same">
              tak samo dla r. męskiego i żeńskiego
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <template v-if="binyan === 'kal'">
      <h3>Melodia samogłosek</h3>
      <p v-if="tense === 'perfect'">
        Każdy czas ma swój charakterystyczny dźwięk samogłosek. Perfectum to melodia
        <strong>A-A</strong>, na przykład szAmArtA, kAtAwtA.
      </p>
      <p v-else>
        Każdy czas ma swój charakterystyczny dźwięk samogłosek. Imperfectum to melodia
        <strong>I-O</strong>, na przykład I-ktO-w, tI-szmOr. Samogłoska „o" to klucz do przyszłości.
      </p>
    </template>
    <p v-else class="note">
      W każdej formie czasownik ma inne przedrostki i samogłoski. Po nich poznajesz, w jakiej formie
      jest słowo.
    </p>
    <template v-if="tense === 'imperfect'">
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
.form-info {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  margin: 0 0 1rem;
}
.form-info p {
  margin: 0;
}
.example-he {
  font-size: 1.6rem;
}
.affix-sample {
  color: var(--affix);
  /* Large text (>= 24px) needs only 4.5:1 for AAA, as the highlighted Hebrew affixes do. */
  font-size: 1.5rem;
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
