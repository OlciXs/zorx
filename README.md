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

<<<<<<< HEAD
## Licencja

Projekt jest udostępniany na licencji określonej w repozytorium. Jeśli chcesz, możesz dodać własną licencję, np. MIT, w osobnym pliku `LICENSE`.

## Status projektu

To jest wersja MVP / demonstracyjna z podstawowymi funkcjami nauki słówek. Można ją rozwijać o:

- integrację z AI do generowania definicji i zdań,
- lepszą analizę kontekstu,
- system powtórek spaced repetition,
- synchronizację offline i eksport danych.

---

Jeśli chcesz, mogę od razu przygotować również wersję README bardziej "produkcyjną" (bardziej premium / startupowa), albo wersję w języku angielskim.

## English version

# Zorx

Polish vocabulary learning assistant integrated with a browser extension and web app. The project combines a browser extension for saving words with a web application for learning flashcards, allowing users to collect new vocabulary while reading and then review it in a structured way.

## Project overview

Zorx helps users:

- save words and phrases from any website,
- add their own definitions and translations,
- group flashcards into categories,
- practice vocabulary in multiple learning modes,
- sync data between the extension and the web app.

The project was built as a complete ecosystem:

- browser extension for Chrome/Chromium,
- backend API in NestJS,
- PostgreSQL database via Prisma,
- frontend in React + Vite.

## Main features

### Browser extension

- save a word by selecting text,
- quick translation and insertion into the database,
- support for context and custom definitions,
- synchronization with the user account.

### Web application

- manage flashcards,
- categories and word grouping,
- learning/exercise modes,
- edit and delete flashcards,
- user login and registration.

### Backend and data layer

- JWT authentication,
- REST API with Swagger docs,
- Prisma layer for PostgreSQL,
- structured around users, categories, and flashcards.

## Tech stack

- Frontend: React, TypeScript, Vite
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Extension: Chrome Manifest V3
- API docs: Swagger / OpenAPI

## Repository structure

```text
zorx/
├── backend/              # NestJS API + Prisma + PostgreSQL
│   ├── prisma/           # database schema and migrations
│   ├── src/              # backend application
│   ├── package.json
│   └── .env.example
├── frontend/             # React application
│   ├── src/
│   ├── package.json
│   └── vite.config.*
├── extension/            # Chrome extension
│   ├── manifest.json
│   ├── background.js
│   └── popup.html
├── README.md             # this file
└── .gitignore
```

## Requirements

- Node.js >= 20
- npm or pnpm
- PostgreSQL >= 15
- Chromium / Chrome browser for extension testing

## Environment configuration

In the backend directory, create a `.env` file based on the example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/zorx?schema=public"
JWT_SECRET="your_secret_key"
PORT=3000
```

## Local setup

### 1) Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

The API will be available at:

- http://localhost:3000
- Swagger: http://localhost:3000/api

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

The web app will be available at:

- http://localhost:5173

### 3) Chrome extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder

## How the project works

1. The user selects a word on a website in the browser.
2. The extension saves it and sends it to the backend.
3. The backend stores the flashcard associated with the user.
4. In the web app, the user browses their words, groups them, and studies them.
5. Flashcards can be edited, filtered by category, and reviewed in different modes.

## Data model

The main entities are:

- `User` — user,
- `Category` — flashcard category,
- `Flashcard` — word, translation, and extra data.

## Development and tests

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

The backend exposes APIs for:

- user registration and login,
- category management,
- adding, fetching, editing, and deleting flashcards.

Full documentation is available in Swagger once the backend is running.

## License

The project is distributed under the license specified in the repository. You can add your own license, such as MIT, in a separate `LICENSE` file.

## Project status

This is an MVP / demo version with core vocabulary-learning features. It can be extended with:

- AI integration for generating definitions and example sentences,
- better context analysis,
- spaced repetition system,
- offline sync and data export.

---

If you want, I can also prepare a more premium startup-style README or a fully English-only version.
=======
>>>>>>> 4ee0c9a9c5fc8a4fa61d92cb306b1b3d28278ac7
