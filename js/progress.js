// Persistent player profile, skill model and recommendations.
import { LESSONS, CHAPTERS } from './lessons.js';
import { PUZZLES, THEMES } from './puzzles.js';
import { CHARACTERS } from './data.js';

const KEY = 'gm-academy-v1';
const DEF = () => ({
  xp: 0, rating: 600, puzzleRating: 600, ratingHist: [600],
  stats: { w: 0, l: 0, d: 0 }, beaten: {}, games: [],
  lessons: {}, puzzles: {}, themes: {},
  moves: { best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 },
  phase: { opening: { n: 0, acc: 0 }, middlegame: { n: 0, acc: 0 }, endgame: { n: 0, acc: 0 } },
  weak: { hanging: 0, missedTactic: 0, missedMate: 0, kingSafety: 0, opening: 0, positional: 0 },
  streak: { days: 0, last: null }, hints: 0,
  settings: { env: 'aurora', board: 'obsidian', sound: true, coach: true, dots: true, evalBar: true, danger: false, char: 'pip', color: 'w' },
});

export let P = DEF();
try {
  const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (raw) { const d = DEF(); P = { ...d, ...raw, settings: { ...d.settings, ...raw.settings }, weak: { ...d.weak, ...raw.weak }, phase: { ...d.phase, ...raw.phase }, moves: { ...d.moves, ...raw.moves } }; }
} catch { /* fresh profile */ }

export function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch { /* storage unavailable */ } }
export function reset() { const s = P.settings; P = DEF(); P.settings = s; save(); }

export function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (P.streak.last === today) return;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  P.streak.days = P.streak.last === y ? P.streak.days + 1 : 1; P.streak.last = today; save();
}

export const level = () => Math.floor(Math.sqrt(P.xp / 60)) + 1;
export const levelSpan = () => { const l = level(); return [60 * (l - 1) ** 2, 60 * l ** 2]; };
export function addXp(n) { const before = level(); P.xp += Math.round(n); save(); return level() > before; }

export function rank(r = P.rating) {
  const t = [[0, 'Novice'], [700, 'Beginner'], [900, 'Improver'], [1100, 'Club Player'], [1300, 'Strong Club Player'], [1500, 'Tournament Player'], [1700, 'Class A'], [1900, 'Expert'], [2100, 'Candidate Master']];
  let name = t[0][1], next = null;
  for (let i = 0; i < t.length; i++) if (r >= t[i][0]) { name = t[i][1]; next = t[i + 1] || null; }
  return { name, next };
}

export const elo = (r, opp, score, k = 32) => Math.round(r + k * (score - 1 / (1 + 10 ** ((opp - r) / 400))));

const pct = (a, b) => b ? Math.round(100 * a / b) : null;
export const chapterPct = i => { const ls = LESSONS.filter(l => l.ch === i); return pct(ls.filter(l => P.lessons[l.id]).length, ls.length); };
export const lessonsPct = () => pct(LESSONS.filter(l => P.lessons[l.id]).length, LESSONS.length);
export const phaseAcc = k => P.phase[k].n ? Math.round(P.phase[k].acc / P.phase[k].n) : null;
export function accuracy() { const n = P.phase.opening.n + P.phase.middlegame.n + P.phase.endgame.n; return n ? Math.round((P.phase.opening.acc + P.phase.middlegame.acc + P.phase.endgame.acc) / n) : null; }
export function themeAcc(t) { const x = P.themes[t]; return x ? pct(x.ok, x.ok + x.fail) : null; }

const mix = (...parts) => { const have = parts.filter(([v]) => v != null); const w = have.reduce((s, [, k]) => s + k, 0); return w ? Math.round(have.reduce((s, [v, k]) => s + v * k, 0) / w) : 0; };

export function skills() {
  const pz = Object.values(P.themes).reduce((a, x) => [a[0] + x.ok, a[1] + x.fail], [0, 0]);
  const pzAcc = pz[0] + pz[1] ? pct(pz[0], pz[0] + pz[1]) : null;
  const games = P.stats.w + P.stats.l + P.stats.d;
  const totalMoves = Object.values(P.moves).reduce((a, b) => a + b, 0);
  const safe = totalMoves >= 10 ? Math.max(0, Math.round(100 - 400 * (P.moves.blunder + 0.5 * P.moves.mistake) / totalMoves)) : null;
  return [
    { id: 'fundamentals', name: 'Fundamentals', v: mix([chapterPct(0), 1]) },
    { id: 'openings', name: 'Openings', v: mix([chapterPct(1), 1], [phaseAcc('opening'), 1.2]) },
    { id: 'tactics', name: 'Tactics', v: mix([chapterPct(2), 1], [pzAcc, 1.5]) },
    { id: 'strategy', name: 'Strategy', v: mix([chapterPct(4), 1], [phaseAcc('middlegame'), 1.2]) },
    { id: 'endgames', name: 'Endgames', v: mix([mix([chapterPct(3), 1], [chapterPct(5), 1]), 1], [phaseAcc('endgame'), 1.2]) },
    { id: 'calculation', name: 'Calculation', v: mix([chapterPct(6), 1], [pz[0] + pz[1] ? Math.max(0, Math.min(100, (P.puzzleRating - 400) / 12)) : null, 1.5]) },
    { id: 'safety', name: 'Blunder control', v: mix([safe, 1], [games ? null : 0, 1]) },
  ];
}

const WEAK = {
  hanging: ['Hanging pieces', 'You often leave pieces undefended or move them onto attacked squares.', 'blunder'],
  missedTactic: ['Missed tactics', 'You overlook winning captures and checks that are available to you.', 'calc'],
  missedMate: ['Missed checkmates', 'You had forced mates and did not play them. Drill mating patterns.', 'backrank'],
  kingSafety: ['King safety', 'You walk into mating attacks. Castle early and keep your pawn shield.', 'attack'],
  opening: ['Opening play', 'You lose ground in the first ten moves. Review the golden rules.', 'rules'],
  positional: ['Positional play', 'Quiet-move inaccuracies add up. Work on plans and piece activity.', 'plan'],
};
export const weakInfo = k => WEAK[k];

// ordered list of what to do next: {title, why, action:{type,id}}
export function recommendations() {
  const out = [];
  const next = LESSONS.find(l => !P.lessons[l.id]);
  if (chapterPct(0) < 100) { const l = LESSONS.find(x => x.ch === 0 && !P.lessons[x.id]); out.push({ title: `Lesson: ${l.title}`, why: 'Finish the Foundations chapter first. Everything else builds on it.', action: { type: 'lesson', id: l.id } }); }
  const wk = Object.entries(P.weak).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 2);
  for (const [k, n] of wk) {
    const [name, why, lid] = WEAK[k]; const l = LESSONS.find(x => x.id === lid);
    out.push({ title: `Fix: ${name} (${n}×)`, why, action: { type: 'lesson', id: l.id }, label: P.lessons[l.id] ? 'Review lesson' : 'Open lesson' });
  }
  const th = Object.keys(THEMES).map(t => [t, themeAcc(t)]).filter(([, a]) => a != null && a < 70).sort((a, b) => a[1] - b[1])[0];
  if (th) out.push({ title: `Puzzles: ${THEMES[th[0]]} (${th[1]}% solved first try)`, why: 'Your weakest tactical theme. Repeat these until the pattern is automatic.', action: { type: 'puzzles', id: th[0] } });
  const sk = skills().filter(s => s.id !== 'fundamentals' && s.id !== 'safety').sort((a, b) => a.v - b.v)[0];
  const chFor = { openings: 1, tactics: 2, strategy: 4, endgames: 5, calculation: 6 }[sk.id];
  const l2 = LESSONS.find(x => x.ch === chFor && !P.lessons[x.id]) || LESSONS.find(x => x.ch === 3 && !P.lessons[x.id] && sk.id === 'endgames');
  if (l2 && !out.some(o => o.action.id === l2.id)) out.push({ title: `Lesson: ${l2.title}`, why: `${sk.name} is currently your lowest skill (${sk.v}/100).`, action: { type: 'lesson', id: l2.id } });
  const unsolved = PUZZLES.filter(p => !P.puzzles[p.id]?.solved).length;
  if (unsolved && !th) out.push({ title: `Solve puzzles (${unsolved} unsolved)`, why: 'Daily tactics are the fastest way to gain rating.', action: { type: 'puzzles' } });
  const opp = CHARACTERS.find(c => !P.beaten[c.id]);
  if (opp) out.push({ title: `Beat ${opp.name} (${opp.rating})`, why: opp.lesson, action: { type: 'play', id: opp.id } });
  if (next && !out.some(o => o.action.id === next.id) && out.length < 5) out.push({ title: `Lesson: ${next.title}`, why: `Next in ${CHAPTERS[next.ch].name}.`, action: { type: 'lesson', id: next.id } });
  return out.slice(0, 5);
}

export const ACH = [
  ['first', 'First Blood', 'Win your first game', () => P.stats.w >= 1],
  ['found', 'Solid Foundations', 'Complete the Foundations chapter', () => chapterPct(0) === 100],
  ['scholar', 'Scholar', 'Complete 20 lessons', () => Object.keys(P.lessons).length >= 20],
  ['grad', 'Graduate', 'Complete every lesson', () => lessonsPct() === 100],
  ['tact', 'Tactician', 'Solve 15 puzzles', () => Object.values(P.puzzles).filter(x => x.solved).length >= 15],
  ['sharp', 'Sharp Eye', 'Reach 1200 puzzle rating', () => P.puzzleRating >= 1200],
  ['clean', 'Clean Game', 'Finish a game with 85%+ accuracy', () => P.games.some(g => g.acc >= 85)],
  ['streak', 'Dedicated', '3-day training streak', () => P.streak.days >= 3],
  ['giant', 'Giant Slayer', 'Beat Professor Kasim', () => !!P.beaten.kasim],
  ['machine', 'Deus Ex Machina', 'Beat ORACLE', () => !!P.beaten.oracle],
];
