<script setup lang="ts">
/**
 * A searchable, sortable list of the most frequent Hebrew verbs or nouns.
 * Verbs are listed as roots (three consonants); nouns as vocalized words with phonetics.
 */
import { computed, ref, useTemplateRef } from 'vue'
import HebrewKeyboard from '@/components/HebrewKeyboard.vue'
import { filterWords, getWords, sortWords, type WordKind, type WordSort } from '@/lib/wordList'

const props = defineProps<{ kind: WordKind }>()

const query = ref('')
const sort = ref<WordSort>('count')

const all = getWords(props.kind)
const visible = computed(() => sortWords(filterWords(all, query.value), sort.value))

const keyboard = useTemplateRef<InstanceType<typeof HebrewKeyboard>>('keyboard')
let queryBeforeKeyboard = ''

// Like a car navigation: the keyboard starts from an empty search and narrows it letter by letter.
const openKeyboard = () => {
  queryBeforeKeyboard = query.value
  query.value = ''
  keyboard.value?.open()
}
const cancelKeyboard = () => {
  query.value = queryBeforeKeyboard
}

const isVerbs = props.kind === 'verbs'
const title = isVerbs ? 'Czasowniki' : 'Rzeczowniki'
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <p v-if="isVerbs">
      Lista zawiera {{ all.length }} najczęstszych czasowników Biblii hebrajskiej. Czasownik
      podajemy jako rdzeń, czyli trzy spółgłoski, od których tworzy się wszystkie jego formy.
      Znaczenie podajemy w bezokoliczniku.
    </p>
    <p v-else>
      Lista zawiera {{ all.length }} najczęstszych rzeczowników Biblii hebrajskiej. Każde słowo jest
      zapisane z nikudem, a obok widzisz jego wymowę.
    </p>

    <div class="controls">
      <div>
        <label for="word-search">Szukaj</label>
        <div class="search-row">
          <input
            id="word-search"
            v-model="query"
            type="search"
            class="field"
            dir="auto"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
            aria-describedby="word-search-hint"
          />
          <button
            type="button"
            class="kbd-button"
            aria-label="Otwórz klawiaturę hebrajską"
            @click="openKeyboard"
          >
            <span lang="he" aria-hidden="true">א</span>
          </button>
        </div>
        <p id="word-search-hint" class="hint">
          Wpisz polskie znaczenie, wymowę albo hebrajskie litery. Przycisk z literą alef otwiera
          klawiaturę hebrajską.
        </p>
      </div>
      <div>
        <label for="word-sort">Kolejność</label>
        <select id="word-sort" v-model="sort" class="field">
          <option value="count">Od najczęstszych</option>
          <option value="pl">Alfabetycznie po polsku</option>
        </select>
      </div>
    </div>

    <HebrewKeyboard
      ref="keyboard"
      :entries="all"
      :kind="kind"
      @change="query = $event"
      @cancel="cancelKeyboard"
    />

    <p role="status" class="count">
      <template v-if="visible.length === 0">Brak wyników. Spróbuj innego słowa.</template>
      <template v-else>Pokazano {{ visible.length }} z {{ all.length }}.</template>
    </p>

    <ul class="entries">
      <li v-for="entry in visible" :key="entry.id" class="card entry">
        <span class="he" lang="he" dir="rtl">{{ entry.he }}</span>
        <span class="info">
          <strong>{{ entry.pl }}</strong>
          <span v-if="entry.phonetics" class="meta">Wymowa: {{ entry.phonetics }}</span>
          <span class="meta">Występuje {{ entry.count }} razy</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.controls {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  margin-bottom: 0.5rem;
}
label {
  display: block;
  font-weight: 600;
  margin: 0 0 0.25rem;
}
.search-row {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}
.search-row .field {
  flex: 1;
  min-width: 0;
}
.kbd-button {
  flex: none;
  width: 48px;
  min-height: 48px;
  font-size: 1.6rem;
  line-height: 1;
  color: var(--on-primary);
  background: var(--primary);
  border: 2px solid var(--primary);
  border-radius: 0.5rem;
  cursor: pointer;
}
.hint {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}
.count {
  font-weight: 600;
}
.entries {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
}
.entry {
  display: grid;
  grid-template-columns: minmax(4.5rem, 7rem) 1fr;
  align-items: center;
  gap: 0.75rem;
}
.he {
  font-size: 2rem;
  line-height: 1.4;
  text-align: right;
  overflow-wrap: anywhere;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  overflow-wrap: anywhere;
}
.meta {
  color: var(--muted);
  font-size: 0.9rem;
}
</style>
