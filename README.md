# Medical App — Web Frontend

A React single-page application for a small medical practice. Patients can
browse the doctor's catalog of services, read informational content pages,
book and manage appointments through a three-step flow, and switch the
interface between English and Turkish.

The app is built with React 19, TypeScript, Vite and Ant Design, and talks to
a Spring Boot backend over a thin Axios-based HTTP client.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Available Scripts](#available-scripts)
4. [Project Structure](#project-structure)
5. [Routing](#routing)
6. [API Layer](#api-layer)
7. [Type System](#type-system)
8. [Internationalization (i18n)](#internationalization-i18n)
9. [Authentication](#authentication)
10. [Error Handling](#error-handling)
11. [Pages & Features](#pages--features)
12. [Components](#components)
13. [Development Notes](#development-notes)
14. [Build & Deployment](#build--deployment)

---

## Tech Stack

| Area           | Library / Tool                              |
| -------------- | ------------------------------------------- |
| Framework      | React 19                                    |
| Language       | TypeScript 5.6 (strict mode)                |
| Build Tool     | Vite 6                                      |
| UI Kit         | Ant Design 5 (`antd`, `@ant-design/icons`)  |
| Routing        | `react-router-dom` v7                       |
| HTTP Client    | `axios`                                     |
| Date Handling  | `dayjs` (with `en` and `tr` locales)        |
| i18n           | Custom `LocaleContext` + dictionary files   |

TypeScript is configured in `tsconfig.app.json` with `strict`, `noUnusedLocals`,
`noUnusedParameters`, and a `@/*` path alias that points to `src/*`.

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node 20 LTS or newer)
- npm (or any compatible package manager)
- The Spring Boot backend running at `http://localhost:8080` (see below)

### Install & Run

```bash
npm install
npm run dev
```

The dev server starts on **http://localhost:3000**. All requests to `/api/*`
are transparently proxied to `http://localhost:8080` (see `vite.config.ts`),
so no CORS configuration is required for local development.

---

## Available Scripts

| Script            | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server on port 3000 with API proxy enabled. |
| `npm run build`   | Type-check the project (`tsc -b`) and produce a production build in `dist/`. |
| `npm run preview` | Serve the built `dist/` folder locally for a production smoke test. |

---

## Project Structure

```
web/
├── index.html                Vite entry HTML
├── package.json              Scripts & dependencies
├── vite.config.ts            Vite config + /api proxy
├── tsconfig*.json            TypeScript configs
└── src/
    ├── main.tsx              App bootstrap (React root, ConfigProvider, LocaleProvider)
    ├── App.tsx               Router setup
    ├── api/                  Thin axios-based API modules
    │   ├── client.ts             Shared axios instance + error translation
    │   ├── appointments.ts       /api/appointments/*
    │   ├── catalog.ts            /api/catalog/*
    │   ├── content.ts            /api/content/*
    │   └── doctor.ts             /api/doctor
    ├── components/
    │   ├── AsyncState.tsx        Shared loading/error wrapper
    │   ├── Layout.tsx            App shell: header, navigation, language switcher
    │   └── LockCountdown.tsx     Live timer for reserved appointment slots
    ├── hooks/
    │   └── useAsyncData.ts       Generic data-fetching hook (loading/error/reload)
    ├── i18n/
    │   ├── LocaleContext.tsx     Locale provider + useLocale hook
    │   └── locales.ts            EN/TR translation dictionaries
    ├── pages/
    │   ├── HomePage.tsx          Doctor info + content pages
    │   ├── CatalogPage.tsx       Paginated catalog with category filter
    │   ├── AppointmentsPage.tsx  3-step booking wizard (useBookingWizard hook)
    │   └── MyAppointmentsPage.tsx List of the patient's appointments
    └── types/
        └── index.ts              DTOs shared across api + pages
```

---

## Routing

Routing is handled by `react-router-dom` v7. All routes render inside the
shared `Layout` component (header + navigation + footer).

| Path               | Component             | Purpose                                   |
| ------------------ | --------------------- | ----------------------------------------- |
| `/`                | `HomePage`            | Doctor card + informational content pages |
| `/catalog`         | `CatalogPage`         | Services & products catalog               |
| `/appointments`    | `AppointmentsPage`    | Book an appointment (3-step wizard)       |
| `/my-appointments` | `MyAppointmentsPage`  | List of the logged-in patient's bookings  |
| `*`                | `Navigate to="/"`     | Fallback redirect to home                 |

See `src/App.tsx`.

---

## API Layer

All backend calls go through a single axios instance defined in
`src/api/client.ts`. Every feature area (appointments, catalog, content,
doctor) exposes a small typed module that wraps these calls and unwraps the
standard `ApiResponse<T>` envelope.

### `client.ts` — shared axios instance

- `baseURL` is `/api`; requests are proxied to the backend in dev and expected
  to be proxied (or co-hosted) in production.
- A request interceptor reads `sessionToken` from `localStorage` and attaches
  it as the `X-Session-Token` header on every outgoing request.
- A response interceptor translates any axios error into a plain `Error` whose
  `message` is end-user friendly. Backend-supplied messages are preferred for
  4xx responses; 5xx responses always use generic copy so internal errors
  never leak to the UI. See [Error Handling](#error-handling).

### Endpoint modules

| Module             | Endpoint(s)                                   | Description                            |
| ------------------ | --------------------------------------------- | -------------------------------------- |
| `appointmentsApi`  | `GET /appointments/slots?date=YYYY-MM-DD`     | Free slots for a given day             |
|                    | `POST /appointments/reserve`                  | Lock a slot for 10 minutes             |
|                    | `POST /appointments/{id}/confirm`             | Confirm a previously locked slot       |
|                    | `PATCH /appointments/{id}/cancel`             | Cancel an appointment                  |
|                    | `GET /appointments`                           | Patient's own appointment list         |
| `catalogApi`       | `GET /catalog?category&page&size`             | Paginated catalog                      |
|                    | `GET /catalog/{id}`                           | Single catalog item                    |
| `contentApi`       | `GET /content?locale`                         | All content pages for a locale         |
|                    | `GET /content/slug?slug&locale`               | Single content page by slug            |
| `doctorApi`        | `GET /doctor`                                 | Doctor profile (single-doctor app)     |

All responses are wrapped by the backend in the following envelope:

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

The API modules always `.then((r) => r.data.data)` so callers only see `T`.

---

## Type System

Shared DTOs live in `src/types/index.ts`. They mirror the backend response
shapes exactly — keep both sides in sync whenever an endpoint changes.

Key types:

- `ApiResponse<T>` — the envelope returned by every endpoint.
- `PagedResponse<T>` — `{ content, page, size, totalElements, totalPages, last }`.
- `AppointmentStatus` — `'LOCKED' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'`.
- `AppointmentResponse` — includes `scheduledAt`, `status`, `durationMinutes`,
  and `lockedUntil` (only set while the status is `LOCKED`).
- `AvailableSlotResponse` — `{ date, time, durationMinutes }`.
- `LockSlotRequest` — booking payload: `{ scheduledAt, doctorId, notes? }`.
- `CatalogItemResponse`, `ContentPageResponse`, `DoctorResponse`.

---

## Internationalization (i18n)

The app ships with English (`en`) and Turkish (`tr`) translations.

### How it works

- `src/i18n/locales.ts` defines the `en` dictionary and a `tr` dictionary
  constrained to the same keys via `Record<Keys, string>` so missing keys
  become a TypeScript error.
- `src/i18n/LocaleContext.tsx` exposes a `LocaleProvider` and a `useLocale`
  hook returning:
  - `locale` — the active locale (`'en' | 'tr'`)
  - `setLocale(next)` — change & persist to `localStorage['appLocale']`
  - `t(key, vars?)` — translate with `{placeholder}` interpolation
  - `antdLocale` — the matching Ant Design locale, fed into `ConfigProvider`
- On first load the locale is resolved from `localStorage`, falling back to
  `navigator.language` (`tr*` → `tr`), then to `en`.
- `dayjs.locale(locale)` is updated whenever the locale changes so dates
  format in the correct language, and `document.documentElement.lang` is
  kept in sync for accessibility.

### Adding a new translation key

1. Add the key and English copy to `en` in `src/i18n/locales.ts`.
2. TypeScript will flag the missing key in `tr` — add the Turkish string.
3. Use it in components with `const { t } = useLocale(); t('my.new.key')`.

### Adding a new locale

1. Add the new code to the `Locale` union and `SUPPORTED_LOCALES` array.
2. Import its Ant Design and dayjs locales in `LocaleContext.tsx` and add
   them to `ANTD_LOCALES`.
3. Add a dictionary for the new locale in `locales.ts` and register it in
   `dictionaries`.

---

## Authentication

The web app does not implement its own login flow. It assumes an external
gateway (or a sibling app) writes a `sessionToken` into `localStorage` before
the user lands on the SPA. The axios request interceptor in `client.ts`
forwards that token on every request as `X-Session-Token`.

If the backend returns `401`, the user sees _"Your session has expired.
Please sign in again to continue."_ — the app does not auto-redirect; that
behavior can be added to the response interceptor when needed.

---

## Error Handling

All network/API errors are normalized by the response interceptor in
`client.ts` into `Error` instances with user-safe messages:

- **`ECONNABORTED`** → timeout message.
- **No response** (network/DNS) → generic network message.
- **5xx** → friendly status-specific copy; backend bodies are intentionally
  ignored to avoid leaking stack traces.
- **4xx** → backend `message` if present, otherwise a friendly status-specific
  copy, otherwise a generic fallback.

Pages use this in two ways:

```ts
.catch((err: Error) => setError(err.message))   // render an <Alert>
message.error((err as Error).message)           // antd toast
```

---

## Pages & Features

### HomePage (`/`)

- Loads the doctor profile and all content pages for the current locale in
  parallel.
- Renders a highlighted doctor card with email and slot duration.
- Auto-formats each content page body:
  - Detects numbered lists (`1. ... 2. ...`) → renders as a styled ordered list.
  - Detects labeled fields (`Phone: ... — Email: ...`) → renders as an Ant
    `Descriptions` block with contextual icons.
  - Falls back to a plain `<Paragraph>` preserving newlines.
- Adds a "Jump to:" quick-nav bar that smooth-scrolls to each section by a
  generated, URL-safe id.
- Picks an icon and accent color for each card based on keywords in the
  page title (booking, policy, contact, …).

### CatalogPage (`/catalog`)

- Paginated listing (`PAGE_SIZE = 12`) backed by `catalogApi.getItems`.
- Category filter derived from the loaded items.
- Flags unavailable items with a red `Unavailable` tag.
- Prices are rendered via `Number(item.price).toFixed(2)` — the formatting
  currency is USD (`$`). Localize this string when expanding to more markets.

### AppointmentsPage (`/appointments`)

Three-step wizard implemented with `Steps` + conditional cards:

1. **Pick a date** — `DatePicker` with past dates disabled.
2. **Choose a slot** — loads free slots for the chosen date, hides any slots
   before "now" if the user picked today, shows appropriate empty-state copy.
3. **Confirm** — reserves the slot (`reserve`) then shows a `LockCountdown`
   while awaiting `confirm`. If the 10-minute lock expires, the wizard jumps
   back to step 2 with an "appt.lockExpired" alert.

On success, a full-screen `Result` is rendered with a button to navigate to
`/my-appointments`.

> The `DOCTOR_ID_PLACEHOLDER` in `AppointmentsPage.tsx` is a defensive
> fallback. The doctor's real id is fetched from `doctorApi.get()` before
> every reservation.

### MyAppointmentsPage (`/my-appointments`)

- Loads all appointments for the current patient.
- Sortable by date/time (descending by default), filterable by status.
- Each status has a consistent tag color (`LOCKED`=orange, `PENDING`=blue,
  `CONFIRMED`=green, `CANCELLED`=red, `COMPLETED`=default).
- Appointments in `LOCKED`, `PENDING` or `CONFIRMED` can be cancelled via a
  `Popconfirm` → `appointmentsApi.cancel(id)`.

---

## Components

### `Layout`

The shared app shell. Renders a sticky header with the logo, a horizontal
menu bound to the router, and a language switcher (globe icon + compact
`Select`). Highlights the currently active route via `selectedKeys={[pathname]}`.

### `LockCountdown`

A small presentational timer used on the confirmation step. Given a
`lockedUntil` ISO timestamp and an `onExpired` callback:

- Computes remaining seconds and ticks every second.
- Turns red (`type="danger"`) in the last minute.
- Calls `onExpired` exactly once when the timer hits zero.

---

## Development Notes

### Styling

Ant Design components are used almost exclusively. Theming is configured
once in `main.tsx` via `ConfigProvider`:

```ts
theme={{ token: { colorPrimary: '#1677ff', borderRadius: 8 } }}
```

Ad-hoc styling is kept inline to avoid CSS sprawl; for larger visual changes
prefer extending the Ant Design theme tokens over adding global CSS.

### Coding Conventions

- **camelCase** naming for variables, functions and hooks.
- **DTO-first API contracts** — endpoint params and responses are declared as
  interfaces in `src/types/index.ts`; helper functions with more than three
  parameters should accept a single DTO argument instead.
- Validate inputs at the boundary before firing an API request (e.g. the
  booking wizard won't let the user advance until `selectedDate` is set).
- No side-narrating comments. Comments are reserved for _why_, not _what_.

### Shared data-fetching pattern

Pages that fetch data should use `useAsyncData` + `AsyncState` instead of
re-implementing their own `loading` / `error` / `useEffect` bookkeeping:

```tsx
const { data, loading, error, reload } = useAsyncData<MyResult>(
  () => api.fetchSomething(param),
  [param],
);

return (
  <AsyncState loading={loading} error={error}>
    {data && <MyContent data={data} />}
  </AsyncState>
);
```

`useAsyncData` handles stale-response suppression (newer requests always win),
exposes a manual `reload()` for mutations (see `MyAppointmentsPage` cancel
flow), and `setData` for optimistic updates.

### Page composition

Pages should be small orchestrators: pull state out of the page component
into a local hook (see `useBookingWizard` in `AppointmentsPage.tsx`), and
split large JSX trees into named subcomponents at the bottom of the same
file (e.g. `PickDateStep`, `PickSlotStep`, `ConfirmStep`). A page's default
export should read top-to-bottom like a table of contents for the feature.

### Adding a new API endpoint

1. Add request/response DTOs to `src/types/index.ts`.
2. Add a function to the relevant module in `src/api/` that calls `client`
   and unwraps `r.data.data`.
3. Consume it from a page/component; errors will already be user-friendly
   thanks to the response interceptor.

### Adding a new page

1. Create the component in `src/pages/NewPage.tsx`.
2. Add the route in `src/App.tsx` inside the `<Route element={<Layout />}>` tree.
3. Add a nav item (icon + i18n key) in `src/components/Layout.tsx`.
4. Add the translation keys in `src/i18n/locales.ts`.

---

## Build & Deployment

```bash
npm run build
```

This runs `tsc -b` for a full project type check and then `vite build`,
emitting static assets into `dist/`.

Deployment considerations:

- Any static host will do (Nginx, S3 + CloudFront, Vercel, Netlify, …).
- The app calls `/api/*` — in production you must ensure the host routes
  `/api` to the Spring Boot backend (reverse proxy, API gateway, etc.).
- `react-router-dom` uses `BrowserRouter`; the host must rewrite unknown
  paths back to `index.html` so deep links like `/my-appointments` work on
  hard refresh.

To sanity-check a production build locally:

```bash
npm run build
npm run preview
```

---

## License

Private / internal project — no license specified.
