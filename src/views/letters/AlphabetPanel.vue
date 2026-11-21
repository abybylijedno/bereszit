<script setup lang="ts">
import { getLetterDetails } from '@/lib/letterData'

const details = getLetterDetails()
const regular = details.filter((l) => !l.isFinal)
const finals = details.filter((l) => l.isFinal)
</script>

<template>
  <div>
    <h2 class="sr-only">Alfabet hebrajski</h2>
    <p>
      Hebrajski alfabet ma 22 litery i 5 form końcowych. Litery zapisują same spółgłoski.
      Samogłoski dodają znaczki zwane nikud, dlatego litera bez nikudu często jest cicha albo
      jej wymowa zależy od otoczenia. Samogłoski poćwiczysz w trybie „Litery z nikudem".
    </p>

    <h3>Litery</h3>
    <ul class="letter-grid">
      <li v-for="letter in regular" :key="letter.hebrew" class="card letter">
        <span class="glyph" lang="he" dir="rtl">{{ letter.hebrew }}</span>
        <strong>{{ letter.name }}</strong>
        <span>Wymowa: {{ letter.phonetics || 'cicha' }}</span>
        <span v-for="v in letter.variants" :key="v.label" class="variant">
          {{ v.label }}: {{ v.phonetics }}
        </span>
      </li>
    </ul>

    <h3>Formy końcowe</h3>
    <p>Pięć liter zapisuje się inaczej, gdy stoją na końcu wyrazu.</p>
    <ul class="letter-grid">
      <li v-for="letter in finals" :key="letter.hebrew" class="card letter">
        <span class="glyph" lang="he" dir="rtl">{{ letter.hebrew }}</span>
        <strong>{{ letter.name }}</strong>
        <span>Wymowa: {{ letter.phonetics || 'cicha' }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.letter-grid {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
}
.letter {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.15rem;
}
.glyph {
  font-size: 3rem;
  line-height: 1.3;
}
.variant {
  font-size: 0.9rem;
  color: var(--muted);
}
</style>
