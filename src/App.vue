<script setup lang="ts">
import { ref } from 'vue'
import EnterHebrewTextView from './views/EnterHebrewTextView.vue'
import CheckKnowledgeView from './views/CheckKnowledgeView.vue'

enum Step {
  EnterHebrew = 'enterHebrew',
  CheckKnowledge = 'checkKnowledge',
}

const currentStep = ref<Step>(Step.EnterHebrew)
const hebrewText = ref('')

function handleNext(inputHebrewText: string) {
  hebrewText.value = inputHebrewText
  currentStep.value = Step.CheckKnowledge
}
</script>

<template>
  <main>
    <header>
      <h1>
        <img src="/icon.svg" alt="Bereszit" style="height: 1em; margin-bottom: -0.1em" /> Bereszit
      </h1>
      <p>Pomocnik przy nauce czytania hebrajskiego</p>
    </header>

    <div id="content">
      <EnterHebrewTextView v-if="currentStep === Step.EnterHebrew" @next="handleNext" />
      <CheckKnowledgeView
        v-else-if="currentStep === Step.CheckKnowledge"
        :hebrewText="hebrewText"
        @reset="currentStep = Step.EnterHebrew"
      />
    </div>

    <footer>Marek Sierociński, 2025</footer>
  </main>
</template>

<style scoped>
main {
  max-width: 960px;
  margin: auto;
  padding: 1rem;
}

header {
  border-bottom: 1px solid #ccc;
  margin-bottom: 2rem;
}

textarea {
  min-height: 6rem;
  resize: vertical;
  font-size: 1.6rem;
  padding: 0.1rem;
}

footer {
  margin-top: 5rem;
  font-size: 0.8rem;
  text-align: left;
  color: #ccc;
}
</style>
