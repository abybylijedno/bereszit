<script setup lang="ts">
/** Tells the user that a new version of the app is ready (service worker registerType: 'prompt'). */
import { ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, updateServiceWorker } = useRegisterSW()
const dismissed = ref(false)
</script>

<template>
  <div v-if="needRefresh && !dismissed" class="banner" role="status">
    <span>Dostępna jest nowa wersja aplikacji.</span>
    <button type="button" class="btn btn-primary" @click="updateServiceWorker(true)">
      Odśwież
    </button>
    <button type="button" class="btn" @click="dismissed = true">Później</button>
  </div>
</template>

<style scoped>
.banner {
  position: fixed;
  z-index: 20;
  left: 0.75rem;
  right: 0.75rem;
  bottom: calc(0.75rem + env(safe-area-inset-bottom));
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--primary);
  border-radius: 0.75rem;
}
@media (min-width: 56rem) {
  .banner {
    left: 12.75rem;
    bottom: 1rem;
    max-width: 36rem;
  }
}
</style>
