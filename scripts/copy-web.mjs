// Copies the game's web files into dist/, which is the folder Tauri packs
// into the app. The game itself has no build step: this is a plain copy.
//
// Why copy at all? Tauri bundles ONE folder. Pointing it at the project root
// would also pull in node_modules, src-tauri and the README.
//
//   node scripts/copy-web.mjs      (or: npm run web:copy)
import { cpSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

// Everything the game needs at runtime. Add new top-level files or folders here.
const WEB_FILES = ['index.html', 'css', 'js', 'vendor']

rmSync(dist, { recursive: true, force: true }) // start clean, so deleted files do not linger
mkdirSync(dist)
for (const name of WEB_FILES) cpSync(path.join(root, name), path.join(dist, name), { recursive: true })

console.log(`Copied ${WEB_FILES.join(', ')} to dist/`)
