<script setup lang="ts">
/**
 * Hebrew search keyboard in a modal, like the keyboard of a car navigation:
 * only letters that still lead to some word are active. The modal stays open after
 * each letter and closes by itself when the search is narrow enough
 * (verbs: a whole three-letter root; nouns: at most 3 matching words).
 * Typed letters are reported live, so the list behind the modal follows them.
 */
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import {
  filterWords,
  getKeyboardLetters,
  isKeyboardDone,
  KEYBOARD_MAX_RESULTS,
  nextLetters,
  VERB_ROOT_LENGTH,
  type WordEntry,
  type WordKind,
} from '@/lib/wordList'

const props = defineProps<{ entries: WordEntry[]; kind: WordKind }>()
const emit = defineEmits<{
  /** The typed letters changed. */
  change: [typed: string]
  /** The search is narrow enough; the modal closed. */
  done: []
  /** The user gave up; the modal closed. */
  cancel: []
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const typed = ref('')
const keys = getKeyboardLetters()

const enabled = computed(() => nextLetters(props.entries, typed.value))
const matchCount = computed(() => filterWords(props.entries, typed.value).length)
const unit = computed(() => (props.kind === 'verbs' ? 'czasowników' : 'rzeczowników'))
const hint = computed(() =>
  props.kind === 'verbs'
    ? `Wybierz ${VERB_ROOT_LENGTH} litery rdzenia.`
    : `Wybieraj litery, aż zostaną najwyżej ${KEYBOARD_MAX_RESULTS} słowa.`,
)

const focusKey = async (preferred?: string) => {
  await nextTick()
  const buttons = [...(dialog.value?.querySelectorAll<HTMLButtonElement>('button.key') ?? [])]
  const target =
    buttons.find((b) => b.dataset.letter === preferred && !b.disabled) ??
    buttons.find((b) => !b.disabled)
  target?.focus()
}

const open = () => {
  typed.value = ''
  dialog.value?.showModal()
  void focusKey()
}

const press = (letter: string) => {
  typed.value += letter
  emit('change', typed.value)
  if (isKeyboardDone(props.kind, typed.value, matchCount.value, enabled.value.size)) {
    dialog.value?.close()
    emit('done')
  } else {
    void focusKey(letter)
  }
}

const back = () => {
  typed.value = typed.value.slice(0, -1)
  emit('change', typed.value)
  void focusKey()
}

const cancel = () => {
  dialog.value?.close()
  emit('cancel')
}

defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="kbd" aria-labelledby="kbd-title" @cancel.prevent="cancel">
    <div class="head">
      <h2 id="kbd-title">Klawiatura hebrajska</h2>
      <p class="hint">{{ hint }} Nieaktywne litery nie prowadzą do żadnego słowa.</p>
      <p class="typed" lang="he" dir="rtl" aria-hidden="true">{{ typed || '…' }}</p>
      <p role="status" class="status">
        <span class="sr-only">Wpisane litery: {{ typed ? [...typed].join(' ') : 'brak' }}. </span>
        Pasuje {{ unit }}: {{ matchCount }}
      </p>
    </div>

    <div class="body">
      <div class="keys" dir="rtl">
        <button
          v-for="key in keys"
          :key="key.hebrew"
          type="button"
          class="key"
          :data-letter="key.hebrew"
          :disabled="!enabled.has(key.hebrew)"
          @click="press(key.hebrew)"
        >
          <span class="glyph" lang="he">{{ key.hebrew }}</span>
          <span class="name">{{ key.name }}</span>
        </button>
      </div>

      <p class="actions">
        <button type="button" class="btn" :disabled="!typed" @click="back">Cofnij</button>
        <button type="button" class="btn" @click="cancel">Anuluj</button>
      </p>
    </div>
  </dialog>
</template>

<style scoped>
.kbd {
  width: min(28rem, calc(100vw - 1rem));
  max-height: calc(100dvh - 1rem);
  overflow: auto;
  padding: 0;
  border: 2px solid var(--border);
  border-radius: 0.75rem;
  background: var(--surface);
  color: var(--text);
}
.kbd::backdrop {
  background: rgb(0 0 0 / 0.55);
}
/* The typed letters and the counter stay visible while the keys scroll. */
.head {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0.75rem 0.75rem 0.25rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.body {
  padding: 0.75rem;
}
h2 {
  margin: 0 0 0.25rem;
  font-size: 1.2rem;
}
.hint {
  margin: 0;
  font-size: 0.9rem;
}
.typed {
  margin: 0.25rem 0 0;
  min-height: 2.6rem;
  font-size: 1.9rem;
  line-height: 1.4;
  text-align: center;
  overflow-wrap: anywhere;
}
.status {
  margin: 0 0 0.25rem;
  font-weight: 600;
  text-align: center;
}
.keys {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.3rem;
}
.key {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: 0;
  min-height: 3.4rem;
  padding: 0.15rem 0;
  font: inherit;
  color: var(--text);
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
}
.key:hover:not(:disabled) {
  border-color: var(--primary);
}
.key:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  border-style: dashed;
}
.glyph {
  font-size: 1.5rem;
  line-height: 1.2;
}
.name {
  max-width: 100%;
  font-size: 0.65rem;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
@media (max-width: 22rem) {
  .name {
    font-size: 0.6rem;
  }
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0.75rem 0 0;
}
</style>
