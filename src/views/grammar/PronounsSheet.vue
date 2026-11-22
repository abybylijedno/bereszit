<script setup lang="ts">
import { analyze } from '@/lib/converter'
import { demonstrative, interrogative, personal, type Pronoun } from '@/lib/grammar/sheets'

const phonetics = (he: string) => analyze(he)[0]?.phonetics ?? ''
const groups: { title: string; items: Pronoun[] }[] = [
  { title: 'Zaimki wskazujące', items: demonstrative },
  { title: 'Zaimki pytające', items: interrogative },
]
</script>

<template>
  <div>
    <h3>Zaimki</h3>

    <template v-for="group in groups" :key="group.title">
      <h4>{{ group.title }}</h4>
      <ul class="pronouns" :aria-label="group.title">
        <li v-for="p in group.items" :key="p.he[0]" class="card">
          <span class="he" lang="he" dir="rtl">{{ p.he[0] }}</span>
          <span class="text">
            <span class="ph">{{ phonetics(p.he[0]!) }}</span>
            <span class="pl">{{ p.pl }}</span>
          </span>
        </li>
      </ul>
    </template>

    <h4>Zaimki osobowe</h4>
    <p>Niektóre zaimki mają dwie formy. Obie znaczą to samo.</p>
    <table class="paradigm" role="table">
      <caption class="sr-only">
        Zaimki osobowe
      </caption>
      <thead role="rowgroup">
        <tr role="row">
          <th scope="col">Osoba</th>
          <th scope="col">Liczba pojedyncza</th>
          <th scope="col">Liczba mnoga</th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        <tr v-for="row in personal" :key="row.label" role="row">
          <th scope="row" role="rowheader">{{ row.label }}</th>
          <td
            v-for="(cell, i) in [row.singular, row.plural]"
            :key="i"
            role="cell"
            :data-label="i === 0 ? 'Liczba pojedyncza' : 'Liczba mnoga'"
          >
            <span v-for="(he, j) in cell.he" :key="he" class="variant">
              <span v-if="j > 0" class="or">lub</span>
              <span class="he" lang="he" dir="rtl">{{ he }}</span>
              <span class="ph">{{ phonetics(he) }}</span>
            </span>
            <span class="pl">{{ cell.pl }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.pronouns {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
}
.card {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.he {
  font-size: 1.8rem;
  line-height: 1.4;
}
.ph {
  display: block;
  font-weight: 600;
}
.pl {
  display: block;
  color: var(--muted);
}
.or {
  display: block;
  font-size: 0.9rem;
  color: var(--muted);
}
.variant {
  display: block;
  margin-bottom: 0.4rem;
}
.paradigm {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}
.paradigm th,
.paradigm td {
  border: 1px solid var(--border);
  padding: 0.5rem 0.75rem;
  text-align: start;
  vertical-align: top;
}
@media (max-width: 40rem) {
  .paradigm,
  .paradigm tbody,
  .paradigm tr,
  .paradigm th,
  .paradigm td {
    display: block;
  }
  .paradigm thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .paradigm tr {
    border: 1px solid var(--border);
    margin-bottom: 0.75rem;
  }
  .paradigm th[scope='row'] {
    border: 0;
    font-size: 1.1rem;
  }
  .paradigm td {
    border: 0;
    border-top: 1px solid var(--border);
  }
  .paradigm td::before {
    content: attr(data-label);
    display: block;
    font-size: 0.9rem;
    color: var(--muted);
  }
}
</style>
