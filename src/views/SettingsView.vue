<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  downloadedBookIds,
  loadBook,
  loadIndex,
  removeBook,
  requestPersistence,
  type BookIndex,
  type BookMeta,
} from '@/lib/bible'
import { stats } from '@/lib/stats'

const message = ref('')
const clear = () => {
  stats.clear()
  message.value = 'Postępy zostały wyczyszczone.'
}

const index = ref<BookIndex | null>(null)
const downloaded = ref<Set<string>>(new Set())
const working = ref<string | null>(null)
const bookMessage = ref('')
const bookError = ref('')

const books = computed(() => index.value?.books ?? [])
const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`
const allDownloaded = computed(
  () => books.value.length > 0 && downloaded.value.size === books.value.length,
)

const refresh = async () => {
  if (index.value) downloaded.value = await downloadedBookIds(index.value)
}

onMounted(async () => {
  try {
    index.value = await loadIndex()
    await refresh()
  } catch {
    bookError.value = 'Nie udało się wczytać listy ksiąg.'
  }
})

const download = async (book: BookMeta) => {
  working.value = book.id
  bookError.value = ''
  try {
    await loadBook(book)
    await requestPersistence()
    bookMessage.value = `Pobrano: ${book.name}.`
  } catch {
    bookError.value = `Nie udało się pobrać księgi ${book.name}. Sprawdź połączenie z internetem.`
  } finally {
    working.value = null
    await refresh()
  }
}

const remove = async (book: BookMeta) => {
  await removeBook(book)
  bookMessage.value = `Usunięto: ${book.name}.`
  await refresh()
}

const downloadAll = async () => {
  for (const book of books.value) {
    if (!downloaded.value.has(book.id)) await download(book)
    if (bookError.value) return
  }
  bookMessage.value = 'Pobrano wszystkie księgi. Aplikacja działa teraz w pełni offline.'
}
</script>

<template>
  <section>
    <h1>Ustawienia</h1>

    <h2>Teksty biblijne</h2>
    <p>
      Księgi pobierają się same, gdy ich użyjesz. Tutaj możesz pobrać je wszystkie z góry, żeby
      pracować bez internetu, albo usunąć te, których nie potrzebujesz.
    </p>

    <p v-if="!index && !bookError" role="status">Wczytywanie listy ksiąg…</p>
    <ul v-if="index" class="books">
      <li v-for="book in books" :key="book.id" class="card book">
        <div>
          <strong>{{ book.name }}</strong> ({{ book.polishName }})<br />
          <span class="status-text">
            {{ downloaded.has(book.id) ? 'Pobrana' : 'Nie pobrana' }}, {{ kb(book.bytes) }}
          </span>
        </div>
        <button
          v-if="downloaded.has(book.id)"
          type="button"
          class="btn"
          :aria-label="`Usuń ${book.name}`"
          @click="remove(book)"
        >
          Usuń
        </button>
        <button
          v-else
          type="button"
          class="btn"
          :disabled="working !== null"
          :aria-label="`Pobierz ${book.name}`"
          @click="download(book)"
        >
          {{ working === book.id ? 'Pobieranie…' : 'Pobierz' }}
        </button>
      </li>
    </ul>
    <p v-if="index">
      <button
        type="button"
        class="btn btn-primary"
        :disabled="working !== null || allDownloaded"
        @click="downloadAll"
      >
        Pobierz wszystkie
      </button>
    </p>
    <p role="status">{{ bookMessage }}</p>
    <p v-if="bookError" class="error" role="alert">{{ bookError }}</p>
    <p v-if="index" class="source">
      Źródło tekstu hebrajskiego:
      <a :href="index.source.url" rel="noopener">{{ index.source.name }}</a
      >. Używamy samego tekstu hebrajskiego, bez tłumaczeń.
    </p>

    <h2>Listy słów</h2>
    <p>
      Zakładka „Słowa" korzysta z list frekwencyjnych Biblii hebrajskiej. Rdzenie czasowników,
      rzeczowniki i liczby wystąpień pochodzą z listy G. Brooke'a Lestera („Frequency List for
      Biblical Hebrew", 2011). Nikud rzeczowników sprawdziliśmy z listą prof. Marcina Majewskiego
      (Codex Leningradensis). Polskie znaczenia opracowaliśmy sami, dlatego mogą się różnić od
      Twojego słownika.
    </p>

    <h2>Postępy w ćwiczeniach</h2>
    <p>
      Aplikacja zapamiętuje w tej przeglądarce, które litery sprawiają Ci kłopot, i częściej je
      powtarza. Te dane nie opuszczają Twojego urządzenia.
    </p>
    <p><button type="button" class="btn" @click="clear">Wyczyść postępy</button></p>
    <p role="status">{{ message }}</p>

    <h2>O aplikacji</h2>
    <header class="app-header">
      <img src="/icon.svg" alt="" width="48" height="48" />
      <div>
        <p class="brand">Bereszit</p>
        <p class="tagline">Pomocnik przy nauce czytania biblijnego hebrajskiego</p>
        <p class="author">Autor: Marek Sierociński, 2025</p>
      </div>
    </header>
    <p>
      Bereszit to aplikacja, która ma pomóc przy nauce języka starohebrajskiego używanego w Biblii.
      Wymowa jest zapisywana polskimi literami według zasad z lekcji hebrajskiego na SIB.
    </p>
  </section>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: start;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.app-header p {
  margin: 0;
}
.brand {
  font-size: 1.6rem;
  font-weight: 700;
}
.tagline {
  color: var(--muted);
}
.author {
  margin-top: 2rem;
  color: var(--muted);
}
.books {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}
.book {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.status-text {
  color: var(--muted);
}
.error {
  color: var(--bad-text);
  background: var(--bad-bg);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
}
a {
  color: var(--primary);
}
</style>
