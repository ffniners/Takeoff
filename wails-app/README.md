# Takeoff Desktop Prototype (Wails + Vue)

This directory contains a standalone Wails v2 application that pairs a Go backend with a Vue 3 + TypeScript + Pinia frontend. It renders as a native macOS window and ships with seeded data so you can explore the calendar immediately.

## Project layout

```
wails-app/
├── backend/        # Go domain logic, in-memory storage + JSON persistence
├── data/           # JSON files created on first run (events & settings)
├── frontend/       # Vue 3 SPA (Vite, Tailwind, Pinia, Vue Router)
├── main.go         # Wails bootstrap
├── wails.json      # Wails build & dev configuration
└── README.md       # This file
```

## Requirements (first time setup)

```bash
brew install go
xcode-select --install
go install github.com/wailsapp/wails/v2/cmd/wails@latest
# Node 18+ recommended
```

## Development workflow (hot reload in a native window)

```bash
cd wails-app
cd frontend && npm install && cd ..
wails generate          # create TS bindings (re-run when Go signatures change)
wails dev               # launches native macOS window
```

## Build a distributable macOS app

```bash
cd wails-app
wails build             # outputs to build/bin/Takeoff.app
```

## Troubleshooting

- If TypeScript cannot find Wails bindings (`@wailsjs/...`), run `wails generate` again.
- Tailwind styles are injected by Vite during development. If they appear missing, stop `wails dev` and restart it.
- Event and settings data persist to `wails-app/data/*.json`. Delete those files to reset back to the seeded demo state.

## Features snapshot

- **Calendar** — Two-week grid, day agenda, event drawer, keyboard shortcuts (`N` for new, `T` for today).
- **Inbox** — Approval queue with mock diff preview for action plans.
- **Settings** — Working hours, slot length, maximum focus hours, and deep work preference stored via Go backend.
