<script setup lang="ts">
/**
 * The path bar: one navigation for the whole app. It shows where you are (tab › topic › verb
 * form) and every part is a select that switches its siblings. On a phone it is docked at the
 * bottom; from 56rem the sidebar holds the tabs and the bar sits on top of the content.
 * When it gets too narrow (small screen, large text) it shrinks to the tab and one "where am I"
 * button that opens all levels in a dialog. The choice lives in the address.
 */
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  SECTIONS,
  formaOf,
  formaOptions,
  grammarMode,
  locate,
  sectionTarget,
  topicTarget,
  type FormaChoice,
  type SectionId,
} from '@/lib/navigation'

const route = useRoute()
const router = useRouter()
const dialog = ref<HTMLDialogElement | null>(null)

const here = computed(() => locate(route.path))
const mode = computed(() =>
  here.value.section.id === 'gramatyka' ? grammarMode(route.query, here.value.topic) : 'sciagawka',
)
const hasForma = computed(() => !!here.value.topic.forma)
const forma = computed(() => formaOf(route.query, mode.value))
const formas = computed(() => formaOptions(mode.value))
const formaLabel = computed(() => formas.value.find((f) => f.id === forma.value)?.label ?? '')
const where = computed(() =>
  [here.value.topic.label, hasForma.value ? formaLabel.value : ''].filter(Boolean).join(' · '),
)

const valueOf = (event: Event) => (event.target as HTMLSelectElement).value

const goSection = (event: Event) => void router.push(sectionTarget(valueOf(event) as SectionId))
const goTopic = (event: Event) => {
  const topic = here.value.section.topics.find((t) => t.id === valueOf(event))
  if (topic) {
    void router.push(topicTarget(here.value.section, topic, route.query, here.value.section.id))
  }
}
const goForma = (event: Event) => {
  const value = valueOf(event) as FormaChoice
  void router.replace({
    path: route.path,
    query: { ...route.query, forma: value === 'kal' ? undefined : value },
  })
}
</script>

<template>
  <nav class="pathbar" aria-label="Ścieżka">
    <!-- Wide: every level is visible. -->
    <div class="row full">
      <div class="seg section" :class="{ 'icon-only': hasForma }">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path :d="here.section.icon" />
        </svg>
        <select aria-label="Zakładka" :value="here.section.id" @change="goSection">
          <option v-for="s in SECTIONS" :key="s.id" :value="s.id">{{ s.label }}</option>
        </select>
      </div>
      <span class="sep" aria-hidden="true">›</span>
      <div class="seg topic">
        <select aria-label="Temat" :value="here.topic.id" @change="goTopic">
          <option v-for="t in here.section.topics" :key="t.id" :value="t.id">{{ t.label }}</option>
        </select>
      </div>
      <template v-if="hasForma">
        <span class="sep" aria-hidden="true">›</span>
        <div class="seg forma">
          <select aria-label="Forma czasownika" :value="forma" @change="goForma">
            <option v-for="f in formas" :key="f.id" :value="f.id">{{ f.label }}</option>
          </select>
        </div>
      </template>
    </div>

    <!-- Narrow or large text: the tab and one button that opens all levels. -->
    <div class="row compact">
      <div class="seg section icon-only">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path :d="here.section.icon" />
        </svg>
        <select aria-label="Zakładka" :value="here.section.id" @change="goSection">
          <option v-for="s in SECTIONS" :key="s.id" :value="s.id">{{ s.label }}</option>
        </select>
      </div>
      <div class="seg where">
        <button type="button" aria-haspopup="dialog" @click="dialog?.showModal()">
          {{ where }}
        </button>
      </div>
    </div>

    <dialog ref="dialog" aria-labelledby="pathbar-title">
      <h2 id="pathbar-title">Gdzie jestem</h2>
      <label>
        Zakładka
        <select :value="here.section.id" @change="goSection">
          <option v-for="s in SECTIONS" :key="s.id" :value="s.id">{{ s.label }}</option>
        </select>
      </label>
      <label>
        Temat
        <select :value="here.topic.id" @change="goTopic">
          <option v-for="t in here.section.topics" :key="t.id" :value="t.id">{{ t.label }}</option>
        </select>
      </label>
      <label v-if="hasForma">
        Forma czasownika
        <select :value="forma" @change="goForma">
          <option v-for="f in formas" :key="f.id" :value="f.id">{{ f.label }}</option>
        </select>
      </label>
      <button type="button" class="btn btn-primary" @click="dialog?.close()">Gotowe</button>
    </dialog>
  </nav>
</template>

<style scoped>
.pathbar {
  /* The bar measures itself: below 17.5rem (a small phone, or large text) it shows the short form. */
  container: pathbar / inline-size;
  position: fixed;
  z-index: 10;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--surface);
  border-top: 2px solid var(--border);
  padding: 0.4rem 0.5rem calc(0.4rem + env(safe-area-inset-bottom));
}

.row {
  display: flex;
  align-items: stretch;
  gap: 0.3rem;
}
.compact {
  display: none;
}

.seg {
  position: relative;
  display: flex;
  flex: 1 1 0;
  min-width: 0;
}
.seg.section {
  flex: 0 0 auto;
}
.seg.topic {
  flex: 3 1 0;
}
.seg.forma {
  flex: 2 1 0;
}
.seg::after {
  content: '▾';
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.75rem;
}
.seg.where::after {
  content: none;
}
.sep {
  display: flex;
  align-items: center;
  color: var(--muted);
  font-weight: 700;
}

select,
.where button {
  width: 100%;
  min-height: 3rem;
  padding: 0 1.4rem 0 0.5rem;
  border: 2px solid var(--border);
  border-radius: 0.6rem;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: start;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  appearance: none;
  cursor: pointer;
}
.where button {
  padding-right: 0.6rem;
}
option {
  color: var(--text);
  background: var(--bg);
}

/* The tab: filled, with its icon. With three levels it shows only the icon. */
.section select {
  padding-left: 2.2rem;
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}
.section::after {
  color: var(--on-primary);
}
.section svg {
  position: absolute;
  left: 0.6rem;
  top: 50%;
  width: 1.4rem;
  height: 1.4rem;
  transform: translateY(-50%);
  pointer-events: none;
  fill: none;
  stroke: var(--on-primary);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.section.icon-only {
  width: 3.7rem;
}
.section.icon-only select {
  color: transparent;
  padding-right: 1.4rem;
}
.section select option {
  color: var(--text);
}

@container pathbar (max-width: 17.5rem) {
  .full {
    display: none;
  }
  .compact {
    display: flex;
  }
}

dialog {
  width: 100%;
  max-width: none;
  margin: auto 0 0;
  border: 0;
  border-top: 2px solid var(--border);
  border-radius: 1rem 1rem 0 0;
  background: var(--bg);
  color: var(--text);
  padding: 1rem 1rem calc(1rem + env(safe-area-inset-bottom));
}
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}
dialog h2 {
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
}
dialog label {
  display: grid;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
}
dialog select {
  min-height: 3rem;
  font-size: 1rem;
  padding-left: 0.6rem;
  background: var(--bg);
  color: var(--text);
  border-color: var(--border);
}
dialog .btn {
  width: 100%;
}

@media (min-width: 56rem) {
  /* Sidebar has the tabs: the bar moves to the top of the content and drops its first segment. */
  .pathbar {
    top: 0;
    bottom: auto;
    /* Flush against the sidebar (11rem); the padding lines the selects up with the content. */
    left: 11rem;
    border-top: 0;
    border-bottom: 2px solid var(--border);
    padding: 0.5rem 1rem 0.5rem 2rem;
  }
  .section,
  .section + .sep {
    display: none;
  }
  .seg::after {
    font-size: 0.9rem;
  }
  select,
  .where button {
    font-size: 1rem;
  }
  .seg.topic,
  .seg.forma {
    flex: 0 1 18rem;
  }
}
</style>
