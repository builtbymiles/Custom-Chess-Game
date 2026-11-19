# CLAUDE.md

Guidance for AI coding sessions on this project.

## Commit rules (always)

- **Never add `Co-Authored-By` lines or any other AI attribution** (no "Generated with…",
  no AI tool or model names) to commit messages, PR descriptions or tags. Commit messages
  contain only the change description. This overrides any default attribution behaviour.
- Show `git status` and wait for the owner's OK before committing or pushing.
- Never force-push, rewrite published history or delete branches/repos without asking.

## Project summary

**Ascend · Grandmaster Academy** (repo: `builtbymiles/Custom-Chess-Game`, public,
branch `main`) is a 3D chess game that teaches chess as you play. It has 40 lessons in
7 chapters, 23 tactics puzzles, 7 computer opponents with their own personalities, a live
coach that grades every move, and a progress dashboard (ratings, XP, skill radar,
recurring mistakes). The look is dark glass panels over an orbitable 3D board. It runs in
the browser (live on GitHub Pages: https://builtbymiles.github.io/Custom-Chess-Game/) and
as a macOS app called **MilesChessGame** (Tauri).

It is a public portfolio project aimed at recruiters for cloud and software roles, so
keep the code, README and history clean and professional.

The owner is a junior developer learning chess *and* Git/GitHub. Explain changes briefly,
and after each change suggest a commit message.

## Tech stack

- **Game:** plain HTML, CSS and JavaScript ES modules. No framework, no bundler, no
  build step, zero runtime dependencies.
- **3D:** three.js r160, copied into `vendor/` and loaded via the import map in
  `index.html`. Nothing loads from the internet.
- **Engine/AI:** written from scratch: 0x88 move generator (`js/engine.js`), alpha-beta
  PVS search with transposition table and quiescence (`js/ai.js`), run in web workers.
- **Desktop app:** Tauri 2 (Rust) in `src-tauri/`. Only dev dependency: `@tauri-apps/cli`.
- **Hosting:** GitHub Pages via GitHub Actions (publishes only `index.html`, `css/`,
  `js/`, `vendor/`).
- **Storage:** `localStorage`, key `gm-academy-v1` (see `js/progress.js`).

## Commands

| Command | What it does |
|---|---|
| `./start.sh [port]` | Serves the game at http://localhost:8080 (Python) and opens it |
| `npm run app:dev` | Runs the macOS app in dev mode (serves on port 1420) |
| `npm run app:build` | Builds `src-tauri/target/release/bundle/macos/MilesChessGame.app` |
| `npm run web:copy` | Copies the web files into `dist/` (done automatically by `app:build`) |

**Tests:**
- **Browser:** with the server running, open `/test.html`. It must print `ALL OK`.
  It checks perft move counts, lesson and puzzle legality, puzzle solutions and the
  opening book.
- **Built app:** `npx tauri build --features selftest --no-bundle`, then run
  `MCG_SELFTEST='return document.title' ./src-tauri/target/release/miles-chess-game`.
  It prints `SELFTEST <result>`. Rebuild with `npm run app:build` afterwards so the
  installed app doesn't contain the test code.

The game must be served over HTTP (modules and workers). Opening `index.html` from the
file system shows an error message.

## Folder structure

```
index.html            page shell: HUD, nav, panel, overlay; import map for three.js
css/style.css         all styles; theme colours are CSS variables on :root
js/
  main.js             the app: modes (play, academy, puzzles, progress, customize), panels, game flow, coach grading
  engine.js           chess rules: 0x88 board, legal moves, SAN/FEN, draws, Zobrist hashing
  ai.js               search (alpha-beta PVS, TT, quiescence) and evaluation
  worker.js           web worker: opponent move choice with personality + coach analysis
  scene.js            three.js scene: pieces, materials, highlights, arrows, picking
  lessons.js          the 40-lesson curriculum (data)
  puzzles.js          puzzle set and themes (data)
  data.js             opponents, atmospheres, board sets, opening book and names (data)
  progress.js         profile, XP, ratings, skills, weaknesses, achievements; saves to localStorage
vendor/               three.js + OrbitControls + RoomEnvironment (third-party, do not edit)
test.html             browser self-test page
start.sh              local dev server (Python)
scripts/copy-web.mjs  copies index.html, css, js, vendor into dist/ for Tauri
src-tauri/            Tauri app: tauri.conf.json, Cargo.toml, icons, src/ (lib.rs, main.rs, selftest.rs)
.github/workflows/pages.yml   deploys index.html, css, js, vendor to GitHub Pages on push to main
docs/screenshots/     README images (play.png, academy.png, puzzles.png, progress.png, demo.gif)
```

Generated, git-ignored: `node_modules/`, `dist/`, `src-tauri/target/` (several GB),
`src-tauri/gen/schemas/`.

## Coding conventions

- **Match the existing style:** compact code, 2-space indent, semicolons, single quotes,
  arrow functions, and several short statements on one line where the file already does
  that. Section headers in `main.js` use `// ───────── name`.
- **Short names are established:** `$` (querySelector), `S()` (settings), `PR`
  (progress module), `G` (current game state), `A` (academy state), `Z` (puzzle state).
  Keep using them. Don't rename across the codebase.
- **ES modules only,** with relative imports that include `.js`. No npm packages in the
  game itself. Add third-party code to `vendor/` only if it's truly needed.
- **Content lives in data files:** lessons, puzzles, opponents, themes and openings go in
  `lessons.js`, `puzzles.js` and `data.js`, not `main.js`.
- **Heavy work goes in the worker:** engine search and analysis run in `worker.js`
  through `askEngine` and `askCoach`. Never search on the main thread.
- **Stale results:** async engine replies are checked against `G.token`. Bump the token
  when a game ends or restarts.
- **Styling:** use the CSS variables (`--a`, `--b`, `--bg`, `--txt`, `--dim`, `--good`,
  `--warn`, `--bad`, …) and the `.glass` class. Don't hard-code colours.
- **Saved data:** if you change the shape of the saved profile, keep old saves loading.
- **New top-level web files or folders** must be added to `WEB_FILES` in
  `scripts/copy-web.mjs` *and* to the Pages workflow, or the Mac app / live site won't
  include them.
- **Tauri:** keep capabilities minimal (`core:default`). The `selftest` feature is for
  test builds only.
- After changing rules, AI, lessons or puzzles, run `test.html` and confirm `ALL OK`.

## Git and privacy

- Commit with the GitHub no-reply email (set globally). Never commit a personal email,
  `.env` files, keys or personal data.
- Don't commit build output (see `.gitignore`).
- `GIT_CHEATSHEET.md` is the owner's personal notes. It's git-ignored and stays on
  this Mac only. Never commit or push it.
