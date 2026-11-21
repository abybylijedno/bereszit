# Bereszit

Aplikacja (PWA) do nauki czytania starohebrajskiego (hebrajski biblijny) z nikudem.
Fonetyka jest **polska**, zgodna z systemem nauczyciela autora (np. bet bez dagesza = `w`, kamacz = `a`, szin = `sz`).
Autor: Marek Sierociński. Hosting: GitHub Pages (`base: /bereszit/`), deploy z `master` przez GitHub Actions.

## Stack

Vue 3 (`<script setup>`, TypeScript), Vite (rolldown-vite), vue-router, `diff` (diffChars), tslog.
Własny, lekki CSS (bez frameworków; Pure.css z CDN jest do usunięcia). Playwright + Vitest do testów.
Node wg `.nvmrc`. Komendy: `npm run dev | build | type-check | lint | format`.

## Stan obecny vs. plan

Zrobione (krok 1): dolne menu / pasek boczny (>= 56rem), router hash-history, 4 zakładki, własny CSS z motywem jasnym/ciemnym
(`src/styles/main.css`, tokeny), Quiz jako karty, PWA (vite-plugin-pwa, `registerType: 'prompt'`; baner aktualizacji jeszcze **niezrobiony**),
Vitest + Playwright. Krok 2 zrobiony: Konwerter (układ międzywierszowy, rozbiór litera po literze, kopiowanie) i wspólny `components/TextSource.vue`
(na razie tylko „Wklej"; wybór/losowanie dojdą tu w kroku 4). `analyze()` w `lib/converter.ts` zwraca rozbiór słów.
Krok 3 zrobiony: Litery (podtrasy `/litery`, `/litery/nazwy`, `/litery/nikud`; dane z konwertera w `lib/letterData.ts`,
losowanie ważone błędami w `lib/quiz.ts`, statystyki w `lib/stats.ts` -> localStorage, sesja w `composables/useQuizSession.ts`).
Ustawienia: na razie czyszczenie postępów i opis (księgi dojdą w kroku 4).
Reguła „patach furtivum" (Het + Patach = `aH`) działa tylko na końcu wielowyrazowego słowa.
Testy quizów są deterministyczne dzięki `Math.random = () => 0` w `page.addInitScript` (pierwsze elementy puli po kolei).
Plan jest uzgodniony z autorem i opisany niżej. Nie odbiegaj od niego bez pytania.

Komendy testów: `npm test` (Vitest), `npm run test:e2e` (Playwright; sam buduje i startuje `vite preview`), `npm run icons` (PNG z `icon.svg`).
Node: `.nvmrc` (24); w tym środowisku `export PATH=$HOME/.nvm/versions/node/v24.14.1/bin:$PATH`.

## Architektura docelowa

Dolne menu (na desktopie może być paskiem bocznym), 4 zakładki, routing **hash-history** (`/#/quiz`), bo GitHub Pages nie ma fallbacku SPA:

| Zakładka | Zawartość |
|---|---|
| **Quiz** | Źródło tekstu -> lista kart (słowo he, pole na fonetykę, wynik po `blur`), „Pokaż odpowiedź", podsumowanie. |
| **Litery** | (1) Alfabet: siatka 27 liter (22 + 5 końcowych) jako ściągawka; (2) quiz **nazw liter** (alef, bet...), odpowiedź z 4 przycisków; (3) quiz **litera + nikud -> fonetyka** (tu dagesz, szwa, szin/sin; litera bez nikudu np. alef jest nieme, więc fonetykę sprawdzamy tylko z nikudem). Sesje po 10 pytań. |
| **Konwerter** | Źródło tekstu + wynik na żywo, układ międzywierszowy (he nad fonetyką, RTL), dotknięcie słowa = rozbiór litera po literze, „Kopiuj fonetykę". Bez quizu. |
| **Ustawienia** | Zarządzanie pobranymi księgami, (opcjonalnie) rozmiar czcionki, o aplikacji, licencje i atrybucja Mechon-Mamre. Motyw podąża za systemem (`prefers-color-scheme`). |

**Wspólny komponent „Źródło tekstu"** (Quiz i Konwerter): zakładki *Wklej* / *Wybierz fragment* (księga -> rozdział -> werset od-do) / *Losuj*.
Liczba wersetów: `<select>` 1-5.

### Teksty biblijne (Mechon-Mamre)

- Mechon-Mamre **nie wysyła CORS**, więc przeglądarka nie pobierze go na żywo. Dane generujemy **w buildzie**
  (rozszerzenie skryptu z `sandbox/books/convert_htm_to_json.py`) do statycznych JSON-ów.
- Jeden plik JSON na księgę + mały `index.json` (lista ksiąg, plik, mapa rozdział -> liczba wersetów). Indeks jest w precache.
- Księgi ładowane **na żądanie** z GitHub Pages i trzymane w **Cache API** (`caches.open('bereszit-books')`), nie w IndexedDB.
  Status „pobrana" = `cache.match(url)`; „Pobierz wszystko" = pętla po indeksie; usuwanie = `cache.delete`.
  Wołamy `navigator.storage.persist()` (iOS czyści dane po ok. 7 dniach nieużywania).
- Start od Tory, architektura ma pozwolić dodać resztę Tanachu bez zmian w kodzie aplikacji.
- Licencja: autor zweryfikował warunki Mechon-Mamre (tekst biblijny jest własnością publiczną, tłumaczenia Mamre NIE używamy). Mimo to podaj źródło w Ustawieniach.

### PWA

`vite-plugin-pwa`: manifest, ikony PNG 192/512 + maskable (generowane z `public/icon.svg`), service worker, działanie offline,
baner „Nowa wersja, odśwież". Wszystkie zasoby lokalnie (czcionki hebrajskie self-hosted: Noto Serif Hebrew lub Frank Ruhl Libre; żadnych CDN).

### Postępy

Statystyki (np. najsłabsze litery) w **localStorage**, każdy dostęp w try/catch (może być niedostępny). Brak backendu i kont.
Quiz liter powtarza częściej litery z błędami.

## Kod

- `src/lib/converter.ts` + `letters/*` + `nikud/*` + `Word.ts`: **konwerter hebrajski -> fonetyka**. To serce aplikacji.
  Każda litera to klasa po `AbstractLetter` (`toWordString` ma kontekst: pozycja, poprzednia głoska, poprzedni nikud).
  Przy zmianach reguł uruchom testy; zmiana wyniku istniejącego testu musi być świadoma i zatwierdzona przez autora.
- Konwerter uznajemy za poprawny (referencja = jego obecne zachowanie).
- Znaki kończące słowo: `FINISH_WORD` w `constants.ts`.
- Kod i komentarze po angielsku, **UI po polsku**, proste słownictwo (WCAG 3.1.5). Terminy (szwa, dagesz) wyjaśnione w aplikacji.
- Alias `@` -> `src/`. Formatowanie: Prettier, lint: ESLint.

## Dostępność: cel WCAG 2.2 **AAA** (minimum AA tam, gdzie AAA niemożliwe; odstępstwa dokumentuj niżej)

- Kontrast tekstu >= 7:1 (jasny i ciemny motyw), kolory jako tokeny CSS na `:root`; UI/ikony >= 3:1.
- Wynik nigdy tylko kolorem (ikona + tekst „poprawnie"/„błąd").
- Cele dotykowe >= 44x44 px (2.5.5). Widoczny fokus (2.4.7/2.4.13). Pełna obsługa klawiaturą.
- `lang="pl"` na stronie, `lang="he" dir="rtl"` na każdym hebrajskim tekście.
- Brak limitów czasowych (2.2.3), `prefers-reduced-motion`, bez migotania.
- Tekst: linie <= 80 znaków, bez justowania, skalowanie do 200% bez utraty funkcji, reflow od 320 px.
- Etykiety pól (`<label>`), komunikaty wyników w `aria-live="polite"`, sensowna hierarchia nagłówków, nawigacja jako `<nav>` z `aria-current`.
- Znane odstępstwa od AAA: (uzupełniaj tutaj)

## Testy

- **Vitest** (`src/**/*.test.ts`): jednostkowe dla `lib/`. Przypadki oparte na słowach z Księgi Rodzaju; oczekiwane wartości
  wygenerowane obecnym konwerterem (snapshot-like, zatwierdzone przez autora) - chronią przed regresją przy zmianie reguł.
- **Playwright** (`e2e/`): projekty desktop (chromium) i mobile (Pixel 7); przepływy Quiz/Litery/Konwerter/Ustawienia,
  nawigacja dolna, `@axe-core/playwright` (tagi wcag2a, wcag2aa, wcag21aa, wcag22aa + `color-contrast-enhanced`),
  PWA (manifest, SW, offline). Dane biblijne w testach mockowane małym fixture, nie pełnym korpusem.
  Axe nie pokrywa całego AAA, reszta wg listy powyżej (ręcznie). **Uwaga:** axe 4.14 uznawał kontrast 3,2:1 za zaliczony dla
  `color-contrast-enhanced`, więc `e2e/helpers.ts` ma własną asercję 7:1 (`expectEnhancedContrast`); `expectAccessible()` wywołuje obie.
  Nowy widok = dodaj go do pętli axe w `e2e/navigation.spec.ts` (jasny i ciemny motyw).
- CI (`.github/workflows/deploy.yaml`) uruchamia lint, type-check, Vitest i Playwright przed deployem.

## Kolejność prac

1. Fundamenty: nawigacja, router, własny CSS + motywy, a11y, PWA, testy obecnego Quizu i konwertera.
2. Konwerter (+ wspólny komponent źródła tekstu z samym „Wklej").
3. Litery.
4. Teksty biblijne: skrypt buildowy, indeks, Cache API, „Wybierz/Losuj", Ustawienia -> księgi.

## Zasady pracy

- Nie wdrażaj funkcji spoza tego dokumentu bez uzgodnienia.
- **Commity:** format Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:` ...), opis po polsku, krótko.
  Autorem commita jest zawsze Claude: `git commit --author="Claude <noreply@anthropic.com>"` (committer zostaje użytkownik).
  Na końcu wiadomości trailer `Co-Authored-By` zgodny z bieżącą instrukcją środowiska. Commituj tylko na prośbę, nie pushuj bez polecenia
  (push na `master` uruchamia deploy).
- Nie wysyłaj danych użytkownika do usług zewnętrznych; aplikacja ma działać w pełni offline po pobraniu.
