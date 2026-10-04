# Flipify

Polski asystent do nauki słówek zintegrowany z przeglądarką i web app. Projekt łączy wtyczkę do zapisywania słów z aplikacją do nauki fiszek, dzięki czemu użytkownik może zbierać nowe wyrazy podczas czytania, a następnie powtarzać je w uporządkowany sposób.

## Opis projektu

Zorx pomaga użytkownikowi:

- zapisywać słowa i wyrażenia z dowolnej strony internetowej,
- dodawać własne definicje i tłumaczenia,
- grupować fiszki w kategorie,
- ćwiczyć słownictwo w kilku trybach nauki,
- synchronizować dane pomiędzy rozszerzeniem a aplikacją web.

Projekt został zbudowany jako pełny ekosystem:

- rozszerzenie do przeglądarki Chrome/Chromium,
- backend API w NestJS,
- baza danych PostgreSQL przez Prisma,
- frontend React + Vite.

## Główne funkcje

### Wtyczka do przeglądarki

- zapis słowa po zaznaczeniu tekstu,
- szybkie tłumaczenie i dodanie do bazy,
- obsługa kontekstu i własnych definicji,
- synchronizacja z kontem użytkownika.

### Aplikacja web

- zarządzanie fiszkami,
- kategorie i grupowanie słownictwa,
- tryby ćwiczeń / nauki,
- edycja i usuwanie fiszek,
- logowanie i rejestracja użytkownika.

### Backend i dane

- autoryzacja JWT,
- REST API z dokumentacją Swagger,
- warstwa Prisma do pracy z PostgreSQL,
- struktura oparta na użytkownikach, kategoriach i fiszkach.

## Stack technologiczny

- Frontend: React, TypeScript, Vite
- Backend: NestJS, TypeScript
- Baza danych: PostgreSQL
- ORM: Prisma
- Rozszerzenie: Chrome Manifest V3
- Dokumentacja API: Swagger / OpenAPI

## Struktura repozytorium

```text
zorx/
├── backend/              # API NestJS + Prisma + PostgreSQL
│   ├── prisma/           # schemat bazy i migracje
│   ├── src/              # aplikacja backendowa
│   ├── package.json
│   └── .env.example
├── frontend/             # aplikacja React
│   ├── src/
│   ├── package.json
│   └── vite.config.*
├── extension/            # rozszerzenie Chrome
│   ├── manifest.json
│   ├── background.js
│   └── popup.html
├── README.md             # ten plik
└── .gitignore
```

## Wymagania

- Node.js >= 20
- npm lub pnpm
- PostgreSQL >= 15
- przeglądarka Chromium / Chrome do testów wtyczki

## Konfiguracja środowiska

W katalogu backend utwórz plik `.env` na podstawie przykładu:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/zorx?schema=public"
JWT_SECRET="twoj_tajny_klucz"
PORT=3000
```

## Uruchomienie lokalne

### 1) Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

API będzie dostępne pod adresem:

- http://localhost:3000
- Swagger: http://localhost:3000/api

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikacja web będzie dostępna pod adresem:

- http://localhost:5173

### 3) Rozszerzenie Chrome

1. Otwórz `chrome://extensions/`
2. Włącz "Tryb dewelopera"
3. Kliknij "Załaduj rozszerzenie bez pakietu"
4. Wskaż katalog `extension/`

## Jak działa projekt

1. Użytkownik zaznacza słowo na stronie w przeglądarce.
2. Rozszerzenie zapisuje je i wysyła do backendu.
3. Backend zapisuje fiszkę powiązaną z użytkownikiem.
4. W aplikacji web użytkownik przegląda swoje słówka, grupuje je i uczy się.
5. Fiszki mogą być edytowane, filtrowane według kategorii i powtarzane w różnych trybach.

## Model danych

Główne encje to:

- `User` — użytkownik,
- `Category` — kategoria fiszek,
- `Flashcard` — słówko, tłumaczenie i dodatkowe dane.

## Rozwój i testy

### Backend

```bash
cd backend
npm run test
npm run build
```

### Frontend

```bash
cd frontend
npm run build
npm run lint
```

## API

Backend udostępnia API do:

- rejestracji i logowania użytkowników,
- zarządzania kategoriami,
- dodawania, pobierania, edycji i usuwania fiszek.

Pełna dokumentacja jest dostępna w Swaggerze po uruchomieniu backendu.

