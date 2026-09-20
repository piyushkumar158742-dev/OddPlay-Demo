# OddPlay-Demo

A small browser arcade built around one idea: **open it, find something interesting, and play immediately.**

## Games

| Page | Game | Type |
|---|---|---|
| `game1.html` | Cosmic Calendar | Interactive timeline |
| `game2.html` | Block Market | Shopping/simulation |
| `game3.html` | Stop at 5.000 | Timing |
| `game4.html` | A is Z Typer | Typing |
| `game5.html` | DVD Game | Arcade |

## How it works

- `index.html` is the premium loading/entry screen and sends the player to a random game.
- `games.json` documents the live game catalog used by the loader.
- `shared.css` contains the shared OddPlay visual shell.
- `shared.js` contains shared settings, soundtrack state, music-position persistence, and desktop/mobile game navigation.
- `Sunday_Morning_Level_Up.mp3` is the shared arcade soundtrack.
- Every game keeps its own game logic in its root HTML file so each page remains directly playable on GitHub Pages.

## Navigation

Back/Next are direct page links, while Random is handled by the shared runtime. This keeps navigation working even if the game registry request or another optional network resource is unavailable.

On mobile, the game navigation is always visible as a compact bottom control instead of requiring a hidden expansion gesture.

## Design goals

- Fast startup and low friction.
- Mobile-safe controls.
- No account or progression requirement.
- Small, focused games rather than an oversized platform.
- Shared visual language without forcing every game to look identical.

## GitHub Pages

The project is designed to work as a static site: no server or build step is required.
