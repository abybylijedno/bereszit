# Bereszit

Aplikacja (PWA) do nauki czytania starohebrajskiego (hebrajski biblijny) z nikudem.
Fonetyka jest **polska**, zgodna z systemem nauczyciela autora (np. bet bez dagesza = `w`, kamacz = `a`, szin = `sz`).
Autor: Marek Sierociński. Hosting: GitHub Pages (`base: /bereszit/`), deploy z `master` przez GitHub Actions.

## Stack

Vue 3 (`<script setup>`, TypeScript), Vite (rolldown-vite), vue-router, `diff` (diffChars), tslog.
Własny, lekki CSS (bez frameworków; Pure.css z CDN jest do usunięcia). Playwright + Vitest do testów.
Node wg `.nvmrc`. Komendy: `npm run dev | build | type-check | lint | format`.

## Stan obecny vs. plan

Zrobione (krok 1): dolne menu / pasek boczny (>= 56rem), router hash-history, zakładki, własny CSS z motywem jasnym/ciemnym
(`src/styles/main.css`, tokeny), Quiz jako karty, PWA (vite-plugin-pwa, `registerType: 'prompt'`; baner aktualizacji jeszcze **niezrobiony**),
Vitest + Playwright. Krok 2 zrobiony: Konwerter (obecnie tryb zakładki Fonetyka; układ międzywierszowy, rozbiór litera po literze, kopiowanie) i wspólny `components/TextSource.vue`
(na razie tylko „Wklej"; wybór/losowanie dojdą tu w kroku 4). `analyze()` w `lib/converter.ts` zwraca rozbiór słów.
Krok 3 zrobiony: Litery (obecnie część zakładki Fonetyka: `/fonetyka/alfabet`, `/fonetyka/nazwy`, `/fonetyka/nikud`; dane z konwertera w `lib/letterData.ts`,
losowanie ważone błędami w `lib/quiz.ts`, statystyki w `lib/stats.ts` -> localStorage, sesja w `composables/useQuizSession.ts`).
Krok 4 zrobiony: Tora (5 ksiąg) w `public/books`, `TextSource` ma tryby Wklej / Wybierz fragment / Losuj (1-5 wersetów),
Ustawienia zarządzają księgami i postępami, baner aktualizacji PWA (`components/UpdateBanner.vue`; **nie ma testu e2e** - wymaga dwóch buildów,
sprawdź ręcznie po zmianie SW). Reszta Tanachu: patrz „Teksty biblijne".
Menu (4 zakładki): **Fonetyka** (scalone Litery + Quiz + Konwerter; `views/PhoneticsView.vue` z podmenu, panele w `views/phonetics/`), **Gramatyka** (podmenu Ściągawki / Ćwiczenia, `views/GrammarView.vue`, panele w `views/grammar/`; patrz niżej), **Słowa**, **Ustawienia**. Aplikacja startuje na `/fonetyka/alfabet`. Stare adresy `/litery*`, `/quiz`, `/konwerter` przekierowują. Wspólne przyciski trybu: `components/PillRadios.vue`, podmenu: klasy `.subnav`.
Zakładka **Słowa** (podtrasy `/slowa/czasowniki`, `/slowa/rzeczowniki`): listy frekwencyjne z wyszukiwaniem i sortowaniem
(`lib/wordList.ts`, widoki `views/WordsView.vue` + `views/words/WordListPanel.vue`), dane w `src/data/verbs.json` (629 rdzeni) i `src/data/nouns.json`
(700 rzeczowników z nikudem). Dane zrobiono **jednorazowo** z dostarczonych przez autora PDF-ów (lista G. B. Lestera + lista M. Majewskiego); skryptu importu
w repo nie ma i nie będzie. Polskie znaczenia i nikud rzeczowników są opracowane ręcznie (nikud sprawdzony z listą Majewskiego). Bez ćwiczeń gramatycznych
(rodzaj, liczba) - autor ich na razie nie chce. Atrybucja list jest w Ustawieniach.
Wyszukiwanie po hebrajsku bez klawiatury hebrajskiej: przycisk `א` przy polu „Szukaj” otwiera `components/HebrewKeyboard.vue` (modal `<dialog>` jak w
nawigacji samochodowej): aktywne są tylko litery prowadzące do jakiegoś słowa (`nextLetters` w `lib/wordList.ts`, 22 litery, końcowe traktowane jak zwykłe).
Modal zostaje otwarty po każdej literze i zamyka się sam: czasowniki po 3 literach (rdzeń), rzeczowniki gdy zostają ≤ 3 słowa (`isKeyboardDone`).
Start czyści pole; „Cofnij” kasuje ostatnią literę, „Anuluj” / Esc przywraca poprzednie wyszukiwanie.

Licencje bibliotek: link w Ustawieniach > „O aplikacji” prowadzi do `/ustawienia/licencje` (`views/LicensesView.vue`). Dane w `src/data/licenses.json`
generuje `npm run licenses` (`scripts/licenses.mjs`): paczki faktycznie wchodzące do aplikacji (zależności produkcyjne + workbox z service workera +
runtime Vue), każda z pełnym tekstem licencji; pomija typy, kompilator Vue i `@vue/devtools-api` (wycinany z buildu). Po zmianie zależności uruchom
`npm run licenses`; test w `scripts/licenses.test.mjs` pada, gdy plik jest nieaktualny. Nowa biblioteka w kodzie aplikacji spoza `dependencies` -> dopisz do `SHIPPED_EXTRAS`.
Reguła „patach furtivum" (Het + Patach = `aH`) działa tylko na końcu wielowyrazowego słowa.
Testy quizów są deterministyczne dzięki `Math.random = () => 0` w `page.addInitScript` (pierwsze elementy puli po kolei).
Gramatyka (w toku, uzgodniona z autorem): **Ściągawki** (wybór tematu `?temat=`: formy, perfectum, imperfectum; dalej przedimek/spójnik, przyimki,
zaimki, rzeczowniki, przyrostki zaimkowe) i **Ćwiczenia** (`views/grammar/ExercisesPanel.vue`; temat: perfectum / imperfectum / oba czasy; pula = forma × rodzaj pytania („jaka to forma?” i „które słowo to…?”), sesje po 10 pytań, statystyki w buckecie `grammar`, przełącznik „Zaznacz dodatki kolorem”; logika w `lib/grammar/verbQuiz.ts`; kolejne tematy dojdą po ściągawkach). Dane ręcznie przepisane z ściągawek autora
(PDF-y w `input/`, gitignore) i slajdów z lekcji: `lib/grammar/verbParadigm.ts` (kal perfectum/imperfectum wzorca `קטל`), `lib/grammar/binyanim.ts`.
Tylko czasownik mocny; słabych jeszcze nie było na lekcjach. Każdą tabelę autor sprawdza po przepisaniu.
Plan jest uzgodniony z autorem i opisany niżej. Nie odbiegaj od niego bez pytania.

Komendy testów: `npm test` (Vitest), `npm run test:e2e` (Playwright; sam buduje i startuje `vite preview`), `npm run icons` (PNG z `icon.svg`).
Node: `.nvmrc` (24); w tym środowisku `export PATH=$HOME/.nvm/versions/node/v24.14.1/bin:$PATH`.

## Architektura docelowa

Dolne menu (na desktopie może być paskiem bocznym), 4 zakładki, routing **hash-history** (`/#/fonetyka`), bo GitHub Pages nie ma fallbacku SPA:

| Zakładka | Zawartość |
|---|---|
| **Fonetyka** | Podmenu: **Alfabet** (domyślna podstrona) \| **Nazwy liter** \| **Litery z nikudem** \| **Teksty**. *Alfabet*: siatka 27 liter (22 + 5 końcowych) jako ściągawka. *Nazwy liter*: quiz nazw (alef, bet...), odpowiedź z 4 przycisków. *Litery z nikudem*: quiz litera + nikud -> fonetyka (tu dagesz, szwa, szin/sin; litera bez nikudu np. alef jest nieme, więc fonetykę sprawdzamy tylko z nikudem); sesje po 10 pytań. *Teksty*: wybór **Trybu** (przed „Źródłem tekstu"): *Quiz* albo *Konwerter*; tryb jest w URL (`?tryb=quiz\|konwerter`), oba panele żyją pod `<KeepAlive>` (wklejony tekst i postęp quizu nie giną przy przełączaniu). Quiz tekstu: źródło tekstu -> lista kart (słowo he, pole na fonetykę, wynik po `blur`), „Pokaż odpowiedź", podsumowanie. Konwerter: źródło tekstu + wynik na żywo, układ międzywierszowy (he nad fonetyką, RTL), dotknięcie słowa = rozbiór litera po literze, „Kopiuj wymowę". |
| **Gramatyka** | Podmenu **Ściągawki** (domyślna) \| **Ćwiczenia**. Ściągawki tematyczne (czasowniki: formy/perfectum/imperfectum, przedimek i spójnik, przyimki, zaimki, rzeczowniki, przyrostki zaimkowe); ćwiczenia z wyborem tematu. Czasy: na lekcjach tylko perfectum i imperfectum; „forma" = binjan, na razie zawsze kal. Bez ćwiczeń z rzeczownikami. |
| **Słowa** | Listy frekwencyjne: najczęstsze czasowniki (rdzeń + znaczenie w bezokoliczniku) i rzeczowniki (z nikudem i wymową). Wyszukiwanie po polsku, wymowie lub hebrajskich literach; sortowanie. Na razie tylko przeglądanie. |
| **Ustawienia** | Zarządzanie pobranymi księgami, (opcjonalnie) rozmiar czcionki, o aplikacji, licencje i atrybucja Mechon-Mamre. Motyw podąża za systemem (`prefers-color-scheme`). |

**Wspólny komponent „Źródło tekstu"** (Fonetyka > Teksty: Quiz i Konwerter): zakładki *Wklej* / *Wybierz fragment* (księga -> rozdział -> werset od-do) / *Losuj*.
Liczba wersetów: `<select>` 1-5.

### Teksty biblijne (Mechon-Mamre)

- Mechon-Mamre **nie wysyła CORS**, więc przeglądarka nie pobierze go na żywo. Dane generuje **`npm run books`**
  (`scripts/fetch-books.mjs`, Node): pobiera strony rozdziałów po kolei z przerwą, buforuje je w `.cache/` (gitignore),
  waliduje (numeracja wersetów, zgodność z numeracją angielską, dozwolone znaki) i zapisuje `public/books/<id>.json` + `index.json`.
  **Wygenerowane JSON-y są w repo** (build jest deterministyczny, CI nie odpytuje cudzego serwera). Odśwież je ręcznie
  (`npm run books -- --refresh`) tylko gdy trzeba. Nowe księgi: dopisz do `scripts/books/config.mjs` (Samuel, Królewska,
  Kronik i Ezdrasz/Nehemiasz to po dwie księgi w jednym pliku Mamre, wymagają osobnej obsługi).
- Numeracja wersetów jest taka jak na stronie (żydowska, np. Wj ma 1209 wersetów).
- Strona używa form prezentacyjnych Unicode (np. U+FB4A) i znaczników (`{פ}`, odwrócone nuny U+05C6): generator i
  `normalizeHebrew()` w `lib/words.ts` je rozbijają/usuwają. Konwerter normalizuje też tekst wklejony przez użytkownika.
- Do SW trafia tylko `books/index.json` (precache); pliki ksiąg lecą na żądanie do **Cache API** (`lib/bible.ts`), nie w IndexedDB.
  Status „pobrana" = `cache.match(url)`; w Ustawieniach można pobrać/usunąć księgę lub wszystkie; `navigator.storage.persist()`.
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
- **Jedna czcionka dla hebrajskiego wszędzie** (Noto Serif Hebrew, token `--font-he`), także w przyciskach, polach i tabelach: zmiana kroju utrudnia naukę liter. Reguła `:root [lang='he']` w `main.css` ma podwyższoną specyficzność, żeby `font: inherit` jej nie nadpisało; `e2e/hebrew-font.spec.ts` sprawdza każdy widok (krój i `lang="he"`). Nowy widok z hebrajskim = dodaj go tam.
- Brak limitów czasowych (2.2.3), `prefers-reduced-motion`, bez migotania.
- Tekst: linie <= 80 znaków, bez justowania, skalowanie do 200% bez utraty funkcji, reflow od 320 px.
- Etykiety pól (`<label>`), komunikaty wyników w `aria-live="polite"`, sensowna hierarchia nagłówków, nawigacja jako `<nav>` z `aria-current`.
- Znane odstępstwa od AAA: token `--affix` (kolor dodatków do rdzenia: przedrostków i końcówek, `#bd21c0` / `#ec83f1`) ma kontrast ok. 4,6-8:1, czyli AAA tylko dla dużego pogrubionego tekstu (>= 14 pt, 1.4.6). Używaj go wyłącznie tak (hebrajskie dodatki w `RootWord`, próbka w legendzie); `e2e/helpers.ts` to egzekwuje.

## Testy

- **Vitest** (`src/**/*.test.ts`): jednostkowe dla `lib/`. Przypadki oparte na słowach z Księgi Rodzaju; oczekiwane wartości
  wygenerowane obecnym konwerterem (snapshot-like, zatwierdzone przez autora) - chronią przed regresją przy zmianie reguł.
- **Playwright** (`e2e/`): projekty desktop (chromium) i mobile (Pixel 7); przepływy Fonetyka (Alfabet/Litery/Teksty)/Słowa/Ustawienia,
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
