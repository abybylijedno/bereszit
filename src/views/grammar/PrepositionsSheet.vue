<script setup lang="ts">
import { prepositions } from '@/lib/grammar/sheets'
import ExampleList from './ExampleList.vue'
import LegendAffix from './LegendAffix.vue'
</script>

<template>
  <div>
    <h3>Przyimki</h3>
    <p>
      Przyimki <span lang="he" dir="rtl">בְּ</span>, <span lang="he" dir="rtl">לְ</span> i
      <span lang="he" dir="rtl">כְּ</span> pisze się razem ze słowem, jako jego pierwszą literę.
    </p>
    <LegendAffix what="przyimek dołączony do początku słowa" />
    <section v-for="p in prepositions" :key="p.letter" class="prep">
      <h4>
        <span lang="he" dir="rtl">{{ p.name }}</span> – {{ p.meaning }}
      </h4>
      <ExampleList :items="p.examples" :label="`Przykłady: ${p.meaning}`" />
    </section>
  </div>
</template>
