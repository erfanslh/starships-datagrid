# Star Wars Fleet

**Live Demo:** https://erfanslh.github.io/starships-datagrid/

An Angular SPA that displays Star Wars starships in a data grid with infinite scroll, search, sorting, and inline editing.

## Installation and Setup

```bash
npm install
npm start
```

Open `http://localhost:4200` in your browser.

To run tests:

```bash
npm test
```

## SWAPI Resource

This app uses the **starships** endpoint from SWAPI.

The task specifies `swapi.dev` as the data source. At the time of development, `swapi.dev` has an expired SSL certificate making it inaccessible from both browsers and Angular's HttpClient. I used `swapi.py4e.com` — a well-known official SWAPI mirror with identical endpoints and response format.

Migrating back to `swapi.dev` requires changing a single line in `SwapiService`:

```typescript
private baseUrl = 'https://swapi.dev/api';
```

## Architecture

```
src/app/
├── core/
│   ├── models/        
│   └── services/     
└── features/
    └── starship-grid/
        ├── config/        
        ├── utils/        
        └── components/    
```

The app follows a smart/dumb component pattern and is organized into two layers. `core` holds shared infrastructure — `models` defines the data interfaces, and `services` contains the `SwapiService` that wraps API access and caches pages. `features` holds the UI features; the `starship-grid` is split by responsibility: `config` holds static configuration (column definitions, theme), `utils` holds pure helper functions (sorting), and `components` holds the presentational child components.

`StarshipGridComponent` is the smart component — it contains the business logic and coordinates the dumb child components, which communicate via `@Input` and `@Output`. State is managed with Angular signals.

## Infinite Scroll

AG Grid's `InfiniteRowModelModule` is used with a custom datasource. The datasource converts AG Grid's row index into a SWAPI page number:

```
row 0  → page 1
row 10 → page 2
row 20 → page 3
```

Each page is fetched from the API only when the user scrolls to it. Once fetched, pages are cached in a `Map<number, Starship[]>` inside `SwapiService` and never re-fetched.

**No loader while scrolling** is achieved by two mechanisms:

- The loading spinner is only shown once — during the very first data fetch on app start. After that, it stays off during scrolling.
- `rowBuffer` is set to `0` which prevents AG Grid from pre-fetching the next page before the user actually scrolls there.

New rows appear seamlessly as the user scrolls — no spinner, no skeleton, no "loading more" indicator.

## Search
 
A search input filters starships by name. The input is **debounced** (300 ms) using RxJS — the filter runs only after the user stops typing, avoiding a cache purge and re-render on every keystroke.
 
Search filters across pages **already loaded** into the cache. As the user scrolls and more pages load, the searchable set grows. This is a deliberate trade-off — see Limitations.

## Sorting
 
A custom sort comparator (`utils/sort.utils.ts`) handles three behaviors AG Grid's default sort does not:
 
- **Unknown values go to the bottom**, regardless of sort direction. SWAPI returns `'unknown'` or `'n/a'` for missing fields.
- **Numeric detection with comma stripping** — values like `'47,060'` are compared as numbers, not strings.
- **String fallback** uses `localeCompare` for proper alphabetical sorting.

Sorting runs across all cached pages combined, so the order is globally correct.

## Editable Column

The **Notes** column is editable. It is highlighted with a yellow background to signal to the user that it can be edited. Double-click any cell in the Notes column to start editing. Press `Enter` or click away to confirm. Press `Escape` to cancel and clear the cell.

Edited values are stored in AG Grid's in-memory row data — never sent to the API. The `notes` field is injected client-side when pages are fetched:

```typescript
const starships = response.results.map(s => ({ ...s, notes: '' }));
```

To replace client-side storage with API writes, add a `saveNote()` method to `SwapiService` and handle the `(cellValueChanged)` event in the grid component.

## Column Resizing and Reordering

All columns except the row number column support resizing and column reordering. Resizing is enabled via `resizable: true` on each column definition and `resizable: true` on `defaultColDef`. Column reordering is handled natively by AG Grid — users can drag any column header to reposition it.

## Third-Party Packages

| Package | Purpose |
|---|---|
| `ag-grid-community` | Data grid with infinite scroll, sorting, resizing and editing |
| `ag-grid-angular` | Angular wrapper for AG Grid |
| `tailwindcss` | Configured via Angular's built-in Tailwind support |

## Trade-offs and Limitations

**Search and sort are client-side.** They operate on already-cached pages because SWAPI exposes no search or sort parameters. In a production backend, both would be pushed server-side so the API returns pre-filtered, pre-sorted, paginated results.
 
**Search only covers cached pages.** If the user searches before scrolling through all pages, results from unloaded pages will not appear. Pre-fetching all pages on every keystroke would cause unnecessary API calls.

**The Consumables column sorts as text.** SWAPI returns this field as a free-text duration (e.g. "1 year", "2 months"). Proper duration-based sorting would require a separate numeric field from the API.

**Notes are not persisted.** Edited notes exist only in memory and are lost on page refresh. Persistence would require either a backend API or localStorage.

## Future Improvements

- **Server-side search and sort** once a backend supporting those parameters is available.
- **Column visibility toggle** — allow users to show/hide columns based on their preference.
- **Export to CSV** — let users download the current grid data as a CSV file.
- **Multi-column sorting** — extend sorting to support multiple columns simultaneously.
- **Starship detail view** — clicking a row opens a detail panel showing additional data including films and pilots from the SWAPI API.
