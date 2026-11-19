# Ascend · Grandmaster Academy

**Repo:** `Custom-Chess-Game`

A glass, dark-theme 3D chess game that helps you learn chess. It has 40 interactive lessons, a tactics trainer, seven AI opponents with their own personalities, and a live coach that grades every move you make.

### ▶ [Play the live demo](https://builtbymiles.github.io/Custom-Chess-Game/)

[![Deploy to GitHub Pages](https://github.com/builtbymiles/Custom-Chess-Game/actions/workflows/pages.yml/badge.svg)](https://github.com/builtbymiles/Custom-Chess-Game/actions/workflows/pages.yml)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20modules-f7df1e?logo=javascript&logoColor=black)
![three.js](https://img.shields.io/badge/three.js-r160-000000?logo=threedotjs)
![Tauri](https://img.shields.io/badge/Tauri%202-Rust-24c8db?logo=tauri)
![Runtime dependencies](https://img.shields.io/badge/runtime%20dependencies-0-brightgreen)

Runs in any modern browser with WebGL, and as a native macOS app. No install, no account, and no server: your progress saves in your browser.

---

## Screenshots

> Screenshots coming soon. In the meantime, [try the live demo](https://builtbymiles.github.io/Custom-Chess-Game/).

<!--
  Screenshots go in docs/screenshots/. Uncomment this block once the files exist:
  play.png, academy.png, puzzles.png, progress.png, demo.gif

![Gameplay with the live coach and evaluation bar](docs/screenshots/play.png)

| Academy lesson | Puzzle trainer | Progress dashboard |
|---|---|---|
| ![Academy lesson](docs/screenshots/academy.png) | ![Puzzle trainer](docs/screenshots/puzzles.png) | ![Progress dashboard](docs/screenshots/progress.png) |

![Short gameplay demo](docs/screenshots/demo.gif)
-->



---

## Engineering highlights

- **Chess engine written from scratch.** I didn't use chess.js or Stockfish. A **0x88 board representation** handles full legal move generation (castling, en passant, promotion), SAN/FEN parsing, every draw rule, and **Zobrist hashing** for repetition detection.
- **Real search algorithm.** The AI uses iterative-deepening **alpha-beta search (PVS)** with a **transposition table**, **quiescence search**, null-move pruning, and killer/history move ordering. Evaluation is tapered (piece-square tables, passed pawns, bishop pair, endgame king activity).
- **Non-blocking UI with web workers.** The opponent and the coach both search in background **web workers**, using promise-based messaging. Stale replies are discarded with a game token, so the 3D board never freezes.
- **Correctness tested with perft.** The test page checks the move generator against standard **perft** node counts: start position depth 4 = 197,281, Kiwipete depth 3 = 97,862, and others. It also checks that every lesson and puzzle position is legal, that every puzzle solution is the engine's best move or a forced mate, and that all 28 opening-book lines are valid.
- **Zero runtime dependencies.** Plain HTML, CSS and JavaScript ES modules, with no framework, no bundler and no build step. The only third-party code is three.js, kept in `vendor/` so nothing loads from a CDN.
- **One codebase, two platforms.** The same web files ship to **GitHub Pages** (deployed by a GitHub Actions workflow) and to a **native Mac app** built with Tauri 2 (Rust).

---

## Features

- **Play** against 7 AI opponents, from *Pip* (~400) to *ORACLE* (~2050). Each one has its own search depth, error rate, playing style, opening repertoire and in-game dialogue.
- **Live coach** that grades every move (Best · Excellent · Good · Inaccuracy · Mistake · Blunder), explains why, and shows the better move.
- **Academy** with 40 interactive lessons in 7 chapters: foundations, openings, tactics, checkmating technique, strategy, endgames, and calculation.
- **Puzzle trainer** with 23 hand-picked tactics, its own puzzle rating, and per-theme success tracking.
- **Progress dashboard** with game and puzzle ratings, XP and levels, a 7-skill radar, accuracy by game phase, recurring mistakes detected automatically, rating history, and 10 achievements.
- **Game report** after each game, with accuracy, rating change, key mistakes, and links to the lessons that fix them.
- **Hints, takebacks, an evaluation bar** and live opening names (Italian Game, Sicilian Najdorf, London System…).
- **Glassmorphism UI** over an orbitable 3D board, with 6 atmosphere themes, 6 board and piece sets, and 4 camera presets.
- **Responsive layout** that works on phone-sized screens.
- **Native Mac app** built with Tauri 2 / Rust (*MilesChessGame*).
- **Deep links** for quick demos, such as [`#play=kasim`](https://builtbymiles.github.io/Custom-Chess-Game/#play=kasim), [`#lesson=fork`](https://builtbymiles.github.io/Custom-Chess-Game/#lesson=fork) and [`#puzzle=p18`](https://builtbymiles.github.io/Custom-Chess-Game/#puzzle=p18).

---

## Tech stack

| Area | Technology |
|---|---|
| Frontend | HTML, CSS (custom properties, glassmorphism), JavaScript ES modules |
| 3D rendering | [three.js](https://threejs.org) r160 (procedural pieces, physical materials, soft shadows) |
| Chess engine & AI | Custom JavaScript: 0x88 board, alpha-beta PVS, transposition table, quiescence search |
| Concurrency | Web Workers |
| Persistence | Browser `localStorage` |
| Desktop app | [Tauri 2](https://tauri.app) (Rust, system web view) |
| CI/CD & hosting | GitHub Actions → GitHub Pages |
| Testing | Browser self-test page (perft, content validation, engine-verified puzzles) |

---

## Run it locally

**Requirements:** Python 3 and a modern browser with WebGL.

```sh
git clone https://github.com/builtbymiles/Custom-Chess-Game.git
cd Custom-Chess-Game
./start.sh          # serves on http://localhost:8080 and opens your browser
```

The game uses ES modules and web workers, so it has to be served over HTTP. Opening `index.html` straight from the file system won't work. Any static server works (for example `npx serve`).

**Run the tests:** with the server running, open <http://localhost:8080/test.html>. It should print `ALL OK`.

**Build the Mac app** (needs Node.js and [Rust](https://rustup.rs)):

```sh
npm install
npm run app:dev     # run in an app window while developing
npm run app:build   # output: src-tauri/target/release/bundle/macos/MilesChessGame.app
```

### Project structure

```
index.html        page shell and three.js import map
css/style.css     all styles; themes are CSS variables
js/engine.js      chess rules (0x88, move generation, SAN/FEN, Zobrist hashing)
js/ai.js          search and evaluation
js/worker.js      web worker for the opponent and the coach
js/scene.js       three.js 3D scene
js/main.js        app logic: modes, panels, game flow, coach grading
js/lessons.js     40-lesson curriculum (data)
js/puzzles.js     puzzle set (data)
js/data.js        opponents, themes, opening book (data)
js/progress.js    ratings, XP, skills, achievements
vendor/           three.js (third-party)
src-tauri/        native Mac app (Tauri 2 / Rust)
test.html         self-test page
```

---

## How I built it

I built this project with **AI-assisted coding in VS Code**. I set the direction: what the game should teach, how it should feel, and which features mattered. I then broke the work into small steps, reviewed and tested every change, and worked through the bugs. It also became my way to learn chess, by studying the lessons I was designing.

**What I learned:**

- **How chess engines work:** board representations (0x88), legal move generation, alpha-beta pruning, transposition tables, and why quiescence search stops the engine from blundering in the middle of a capture sequence.
- **Testing what you can't eyeball:** perft node counts are a precise way to prove a move generator is correct. A single wrong count points to a real rules bug.
- **Keeping a UI responsive:** moving heavy computation into web workers, and dealing with async results that arrive after the game has moved on.
- **3D in the browser** with three.js: lighting, materials, camera controls and click picking.
- **Shipping:** packaging a web app as a native desktop app with Tauri, and automating deployment with GitHub Actions and GitHub Pages.
- **Working with AI tools effectively:** writing clear specs, breaking problems down, reviewing generated code critically, and checking it with tests instead of trusting it.

---

## Roadmap

- [x] Playable in the browser, with 7 opponents, 40 lessons and 23 puzzles
- [x] Native Mac app (Tauri 2)
- [x] Live demo on GitHub Pages, deployed with GitHub Actions
- [ ] **Planned:** Downloadable Mac app via GitHub Releases
- [ ] **Planned:** AI opponent improvements (stronger search, adaptive difficulty that matches your rating)
- [ ] **Planned:** Deploy on AWS (S3 + CloudFront, with infrastructure as code and CI/CD)
- [ ] **Planned:** More puzzles (100+) and move-by-move game review with the coach

---

## Credits

3D rendering by [three.js](https://threejs.org) (MIT license), included in `vendor/`.
