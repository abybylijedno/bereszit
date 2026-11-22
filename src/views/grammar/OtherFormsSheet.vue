<script setup lang="ts">
/** Imperative, infinitive and participle of the strong verb (only kal and nifal are known). */
import { computed } from 'vue'
import RootWord from '@/components/RootWord.vue'
import { analyze } from '@/lib/converter'
import { BINYAN_NAMES, otherForms, type BinyanId } from '@/lib/grammar/binyanParadigms'
import { PARADIGM_ROOT } from '@/lib/grammar/verbParadigm'

const props = defineProps<{ binyan: BinyanId }>()

const forms = computed(() => otherForms[props.binyan])
const name = computed(() => BINYAN_NAMES[props.binyan])
const phonetics = (he: string) => analyze(he)[0]?.phonetics ?? ''
</script>

<template>
  <div>
    <h3>Rozkaźnik, bezokolicznik, imiesłów (forma {{ name.toLowerCase() }})</h3>

    <p v-if="!forms" class="note">
      Tych form nie ma jeszcze w materiałach dla formy {{ name.toLowerCase() }}. Na razie są tylko
      dla formy kal i nifal.
    </p>
    <template v-else>
      <p>
        Wzorzec to czasownik mocny <span lang="he" dir="rtl">{{ PARADIGM_ROOT }}</span> (zabijać).
      </p>
      <p class="legend">
        <span class="affix-sample">Ten kolor</span> oznacza dodatki: przedrostki, końcówki i litery
        wstawione w środku.
      </p>

      <section
        v-for="group in [
          { id: 'imperative', title: 'Tryb rozkazujący (imperativus)', items: forms.imperative },
          { id: 'infinitive', title: 'Bezokolicznik (inf.)', items: forms.infinitive },
          { id: 'participle', title: 'Imiesłów (part.)', items: forms.participle },
        ]"
        :key="group.id"
      >
        <h4>{{ group.title }}</h4>
        <ul class="forms" :aria-label="group.title">
          <li v-for="f in group.items" :key="f.label" class="card">
            <RootWord class="he" :word="f.he" :root="PARADIGM_ROOT" />
            <span class="text">
              <span class="ph">{{ phonetics(f.he) }}</span>
              <span class="label">{{ f.label }}</span>
            </span>
          </li>
        </ul>
      </section>
    </template>
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
  margin: 0 0 1rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}
.card {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
}
.text {
  min-width: 0;
  overflow-wrap: anywhere;
}
.he {
  font-size: 2rem;
  line-height: 1.4;
}
.ph {
  display: block;
  font-weight: 600;
}
.label {
  display: block;
  color: var(--muted);
}
</style>
