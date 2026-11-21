<script setup lang="ts">
import { ref } from 'vue'
import { stats } from '@/lib/stats'

const message = ref('')

const clear = () => {
  stats.clear()
  message.value = 'Postępy zostały wyczyszczone.'
}
</script>

<template>
  <section>
    <h1>Ustawienia</h1>

    <h2>Postępy w ćwiczeniach</h2>
    <p>
      Aplikacja zapamiętuje w tej przeglądarce, które litery sprawiają Ci kłopot, i częściej je
      powtarza. Te dane nie opuszczają Twojego urządzenia.
    </p>
    <p><button type="button" class="btn" @click="clear">Wyczyść postępy</button></p>
    <p role="status">{{ message }}</p>

    <h2>O aplikacji</h2>
    <p>
      Bereszit to pomocnik w nauce czytania starohebrajskiego z nikudem. Wymowa jest zapisywana
      polskimi literami według zasad z lekcji hebrajskiego.
    </p>
  </section>
</template>
