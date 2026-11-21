<script setup lang="ts">
/**
 * Shared "source of Hebrew text" used by Quiz and Converter.
 * Three ways to get text: paste/type it, pick a passage of a book, or draw a random one.
 * Picked and drawn passages are placed in the (still editable) text field.
 */
import { computed, ref, useId, watch } from 'vue'
import {
  getPassage,
  loadIndex,
  MAX_VERSES,
  randomPassage,
  versesLabel,
  type BookIndex,
  type Passage,
} from '@/lib/bible'

const text = defineModel<string>({ required: true })

defineProps<{
  label?: string
  /** Validation message; when set the field is marked invalid. */
  error?: string
  rows?: number
}>()

const id = useId()

type Mode = 'paste' | 'pick' | 'random'
const modes: { value: Mode; label: string }[] = [
  { value: 'paste', label: 'Wklej' },
  { value: 'pick', label: 'Wybierz fragment' },
  { value: 'random', label: 'Losuj' },
]
const mode = ref<Mode>('paste')

const index = ref<BookIndex | null>(null)
const busy = ref(false)
const loadError = ref('')
const reference = ref('')

const bookId = ref('')
const chapter = ref(1)
const from = ref(1)
const count = ref(1)

const book = computed(() => index.value?.books.find((b) => b.id === bookId.value))
const chapterCount = computed(() => book.value?.verses.length ?? 0)
const verseCount = computed(() => book.value?.verses[chapter.value - 1] ?? 0)

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

const OFFLINE_HINT =
  'Nie udało się pobrać tekstu. Sprawdź połączenie z internetem albo pobierz księgi wcześniej w Ustawieniach.'

const ensureIndex = async () => {
  if (index.value) return
  try {
    index.value = await loadIndex()
    bookId.value ||= index.value.books[0]?.id ?? ''
  } catch {
    loadError.value = OFFLINE_HINT
  }
}

watch(mode, (value) => {
  loadError.value = ''
  if (value !== 'paste') ensureIndex()
})
watch(bookId, () => {
  chapter.value = 1
})
watch(chapter, () => {
  from.value = 1
})

const show = (passage: Passage) => {
  text.value = passage.text
  reference.value = passage.reference
}

const run = async (action: () => Promise<Passage>) => {
  busy.value = true
  loadError.value = ''
  try {
    show(await action())
  } catch {
    loadError.value = OFFLINE_HINT
  } finally {
    busy.value = false
  }
}

const pick = () => {
  const b = book.value
  if (b) run(() => getPassage(b, chapter.value, from.value, count.value))
}

const draw = () => {
  if (index.value) run(() => randomPassage(index.value!, count.value))
}
</script>

<template>
  <div class="text-source">
    <fieldset class="modes">
      <legend>Źródło tekstu</legend>
      <label v-for="m in modes" :key="m.value" class="mode">
        <input v-model="mode" type="radio" :name="`${id}-mode`" :value="m.value" />
        <span>{{ m.label }}</span>
      </label>
    </fieldset>

    <div v-if="mode !== 'paste'" class="panel card">
      <p v-if="!index && !loadError" role="status">Wczytywanie listy ksiąg…</p>

      <form v-else-if="index && mode === 'pick'" class="grid" @submit.prevent="pick">
        <div>
          <label :for="`${id}-book`">Księga</label>
          <select :id="`${id}-book`" v-model="bookId" class="field">
            <option v-for="b in index.books" :key="b.id" :value="b.id">
              {{ b.name }} ({{ b.polishName }})
            </option>
          </select>
        </div>
        <div>
          <label :for="`${id}-chapter`">Rozdział</label>
          <select :id="`${id}-chapter`" v-model.number="chapter" class="field">
            <option v-for="n in range(chapterCount)" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <div>
          <label :for="`${id}-from`">Od wersetu</label>
          <select :id="`${id}-from`" v-model.number="from" class="field">
            <option v-for="n in range(verseCount)" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <div>
          <label :for="`${id}-count`">Liczba wersetów</label>
          <select :id="`${id}-count`" v-model.number="count" class="field">
            <option v-for="n in range(MAX_VERSES)" :key="n" :value="n">{{ versesLabel(n) }}</option>
          </select>
        </div>
        <p class="submit">
          <button type="submit" class="btn btn-primary" :aria-busy="busy">Pokaż fragment</button>
        </p>
      </form>

      <form v-else-if="index && mode === 'random'" class="grid" @submit.prevent="draw">
        <div>
          <label :for="`${id}-rcount`">Liczba wersetów</label>
          <select :id="`${id}-rcount`" v-model.number="count" class="field">
            <option v-for="n in range(MAX_VERSES)" :key="n" :value="n">{{ versesLabel(n) }}</option>
          </select>
        </div>
        <p class="submit">
          <button type="submit" class="btn btn-primary" :aria-busy="busy">Losuj fragment</button>
        </p>
      </form>

      <p v-if="loadError" class="error" role="alert">{{ loadError }}</p>
      <p class="reference" role="status">
        <template v-if="reference">Wstawiono: {{ reference }}</template>
      </p>
    </div>

    <label :for="id">{{ label ?? 'Hebrajski tekst' }}</label>
    <textarea
      :id="id"
      v-model="text"
      class="field he-input"
      lang="he"
      dir="rtl"
      :rows="rows ?? 5"
      :aria-describedby="error ? `${id}-error` : undefined"
      :aria-invalid="error ? 'true' : undefined"
      @input="reference = ''"
    />
    <p v-if="error" :id="`${id}-error`" class="error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
label {
  display: block;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
}

fieldset.modes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border: 0;
  padding: 0;
  margin: 0 0 1rem;
}
.modes legend {
  font-weight: 600;
  padding: 0;
  margin-bottom: 0.4rem;
}

.mode {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin: 0;
  padding: 0.4rem 1rem;
  border: 2px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  cursor: pointer;
}
.mode input {
  position: absolute;
  opacity: 0;
  inset: 0;
  margin: 0;
  cursor: pointer;
}
.mode:has(input:checked) {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}
.mode:has(input:focus-visible) {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}

.panel {
  margin-bottom: 1rem;
}
.grid {
  display: grid;
  gap: 0.25rem 1rem;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  align-items: end;
}
.submit {
  margin: 0.5rem 0 0;
}
.reference {
  margin: 0.5rem 0 0;
  min-height: 1.6em;
  font-weight: 600;
}

.he-input {
  font-size: 1.6rem;
  min-height: 8rem;
  resize: vertical;
}

.error {
  color: var(--bad-text);
  background: var(--bad-bg);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
}
</style>
