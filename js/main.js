import { Chess, START, uci, sqIdx, sqName } from './engine.js';
import { MATE } from './ai.js';
import { Scene3D } from './scene.js';
import { CHARACTERS, ENVS, BOARDS, openingName, bookMove } from './data.js';
import { LESSONS, CHAPTERS } from './lessons.js';
import { PUZZLES, THEMES } from './puzzles.js';
import * as PR from './progress.js';

const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const S = () => PR.P.settings;
const scene = new Scene3D($('#stage'));
const chess = new Chess();
let ctl = null, sel = null, lastMove = null, marks = [], legal = [], mode = 'play';

// ───────────────────────── engine workers
function mkWorker() {
  const w = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }), pend = new Map(); let id = 0;
  w.onmessage = e => { const r = pend.get(e.data.id); pend.delete(e.data.id); if (e.data.error) console.error(e.data.error); r && r(e.data); };
  return msg => new Promise(res => { pend.set(++id, res); w.postMessage({ ...msg, id }); });
}
const askEngine = mkWorker(), askCoach = mkWorker();

// ───────────────────────── sound
let actx;
function beep(f, d = 0.08, type = 'sine', vol = 0.08, at = 0) {
  if (!S().sound) return;
  try {
    actx = actx || new AudioContext(); const t = actx.currentTime + at, o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d);
  } catch { /* audio unavailable */ }
}
const sfx = {
  move: () => beep(196, 0.09, 'triangle', 0.16), capture: () => { beep(130, 0.12, 'square', 0.06); beep(98, 0.14, 'triangle', 0.14, 0.03); },
  check: () => { beep(587, 0.1, 'sine', 0.09); beep(880, 0.14, 'sine', 0.07, 0.08); },
  good: () => { beep(523, 0.1); beep(659, 0.1, 'sine', 0.08, 0.09); beep(784, 0.18, 'sine', 0.08, 0.18); },
  bad: () => beep(104, 0.25, 'sawtooth', 0.05), win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.22, 'triangle', 0.1, i * 0.13)),
};

// ───────────────────────── board glue
function refresh() {
  legal = chess.moves();
  const seen = new Set();
  scene.highlight({
    last: lastMove ? [lastMove.from, lastMove.to] : [], marks, selected: sel,
    moves: sel != null && S().dots ? legal.filter(m => m.from === sel && !seen.has(m.to) && seen.add(m.to)) : [],
    check: chess.inCheck() ? chess.king[chess.turn] : null, danger: ctl?.danger?.() || [],
  });
}
function setPosition(c, animate = true) {
  chess.load(typeof c === 'string' ? c : c.fen());
  lastMove = typeof c !== 'string' && c.stack.length ? c.stack[c.stack.length - 1].m : null;
  sel = null; scene.arrows([]); scene.sync(chess, animate); refresh();
}
async function play(m, fast) {
  const san = chess.san(m); chess.make(m); lastMove = m; sel = null; marks = []; scene.arrows([]);
  await scene.animateMove(m, chess, fast);
  /[+#]/.test(san) ? sfx.check() : m.cap ? sfx.capture() : sfx.move();
  refresh(); return san;
}
scene.onSquare = async sq => {
  if (!ctl || !ctl.canMove()) return;
  if (sel != null) {
    const c = legal.filter(m => m.from === sel && m.to === sq);
    if (c.length) {
      let m = c[0];
      if (c.length > 1) { const pr = await askPromo(chess.turn); if (!pr) return; m = c.find(x => x.promo === pr); }
      sel = null; ctl.onMove(m); return;
    }
  }
  const p = chess.b[sq]; sel = p && (p >> 3) === chess.turn ? sq : null; refresh();
};

function askPromo(color) {
  const g = color ? ['♛', '♜', '♝', '♞'] : ['♕', '♖', '♗', '♘'], t = [5, 4, 3, 2];
  return new Promise(res => {
    modal(`<h1>Promote to…</h1><div class="promo">${g.map((x, i) => `<button data-p="${t[i]}">${x}</button>`).join('')}</div>`);
    $('#overlay').onclick = e => { const b = e.target.closest('[data-p]'); $('#overlay').onclick = null; closeModal(); res(b ? +b.dataset.p : null); };
  });
}
function modal(html, wide) { const o = $('#overlay'); o.innerHTML = `<div class="modal glass ${wide ? 'wide' : ''}">${html}</div>`; o.hidden = false; }
function closeModal() { $('#overlay').hidden = true; $('#overlay').onclick = null; }
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = msg; $('#toasts').append(t); setTimeout(() => t.remove(), 3200); }
function xp(n, why) { const up = PR.addXp(n); toast(`+${Math.round(n)} XP${why ? ' · ' + why : ''}`); if (up) { setTimeout(() => { toast(`★ Level ${PR.level()} reached!`); sfx.win(); }, 700); } checkAch(); hud(); }
function checkAch() {
  PR.P.ach = PR.P.ach || {};
  for (const [id, name, , test] of PR.ACH) if (!PR.P.ach[id] && test()) { PR.P.ach[id] = true; setTimeout(() => toast(`🏆 Achievement: ${name}`), 1400); }
  PR.save();
}

// ───────────────────────── top HUD
function hud() {
  const P = PR.P, [a, b] = PR.levelSpan(), acc = PR.accuracy(), rk = PR.rank();
  $('#hud').innerHTML = `
    <div class="logo">ASCEND<small>GRANDMASTER ACADEMY</small></div>
    <div class="lvl"><div class="ring" style="--p:${100 * (P.xp - a) / (b - a)}"><span>${PR.level()}</span></div>
      <div class="meta"><div>${rk.name}${rk.next ? ` <span class="dim">→ ${rk.next[1]} at ${rk.next[0]}</span>` : ''}</div><div class="bar"><i style="width:${100 * (P.xp - a) / (b - a)}%"></i></div></div></div>
    <div class="stats">
      <div class="stat"><b>${P.rating}</b><small>Rating</small></div>
      <div class="stat"><b>${P.puzzleRating}</b><small>Puzzles</small></div>
      <div class="stat"><b>${acc == null ? '–' : acc + '%'}</b><small>Accuracy</small></div>
      <div class="stat"><b>${PR.lessonsPct()}%</b><small>Academy</small></div>
      <div class="stat"><b>${P.stats.w}/${P.stats.d}/${P.stats.l}</b><small>W / D / L</small></div>
      <div class="stat"><b>🔥 ${P.streak.days}</b><small>Day streak</small></div>
    </div>`;
}

function applyTheme() {
  const env = ENVS.find(e => e.id === S().env) || ENVS[0], bt = BOARDS.find(b => b.id === S().board) || BOARDS[0];
  const st = document.documentElement.style;
  st.setProperty('--a', env.a); st.setProperty('--b', env.b); st.setProperty('--bg', env.bg); st.setProperty('--bg2', env.bg2);
  scene.setBoard(bt); scene.setEnv(env);
}
function layout() {
  const mob = matchMedia('(max-width: 860px)').matches, p = $('#panel').getBoundingClientRect();
  scene.setInset(mob ? { l: 0, r: 0, t: 60, b: innerHeight - p.top } : { l: 96, r: innerWidth - p.left, t: 76, b: 0 });
}
addEventListener('resize', layout);

// ───────────────────────── PLAY
let G = { active: false };
const GRADES = ['best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'];
const PN = ['', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
const wp = cp => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * Math.max(-2500, Math.min(2500, cp)))) - 1);
const ava = (c, extra = '', cls = '') => `<div class="ava ${cls}" style="--h:${c.hue}" ${extra}>${c.glyph}</div>`;

function phaseOf() {
  if (chess.full <= 10) return 'opening';
  let n = 0; for (let s = 0; s < 120; s++) if (!(s & 0x88)) n += [0, 0, 3, 3, 5, 9, 0][chess.b[s] & 7];
  return n <= 26 ? 'endgame' : 'middlegame';
}

function renderPlay() {
  const P = PR.P;
  if (!G.char) {
    const cur = CHARACTERS.find(c => c.id === S().char) || CHARACTERS[0];
    $('#panel').innerHTML = `
      <div class="ph"><h2>Choose your opponent<small>Climb the ladder from Pip to ORACLE</small></h2></div>
      <div class="pb">
        ${CHARACTERS.map(c => `<button class="opp ${c.id === cur.id ? 'on' : ''}" data-act="char" data-id="${c.id}">${ava(c)}
          <div class="grow"><b>${c.name}</b><div class="dim sm">${c.title}</div></div><div class="elo">${c.rating}<small>${P.beaten[c.id] ? '✓ beaten' : ''}</small></div></button>`).join('')}
        <div class="card"><h4>${cur.name} · playing style</h4><p class="sm" style="margin-bottom:8px">${cur.bio}</p><ul class="sk">${cur.skills.map(s => `<li>${s}</li>`).join('')}</ul>
          <p class="sm dim" style="margin-top:8px">What you will learn: ${cur.lesson}</p></div>
        <div><div class="dim sm" style="margin-bottom:5px">Play as</div><div class="seg">${[['w', 'White'], ['b', 'Black'], ['r', 'Random']].map(([k, n]) => `<button data-act="color" data-c="${k}" class="${S().color === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
      </div>
      <div class="pf"><button class="btn pri big" data-act="start">Start game vs ${cur.name}</button></div>`;
    return;
  }
  const c = G.char, last = [...G.recs].reverse().find(r => r.msg), cnt = Object.fromEntries(GRADES.map(g => [g, G.recs.filter(r => r.grade === g).length]));
  const graded = G.recs.filter(r => r.acc != null), acc = graded.length ? Math.round(graded.reduce((s, r) => s + r.acc, 0) / graded.length) : null;
  const sym = { best: '★', excellent: '!', good: '', inaccuracy: '?!', mistake: '?', blunder: '??' };
  let rows = '';
  for (let i = 0; i < G.sans.length; i += 2) {
    const cell = j => { if (G.sans[j] == null) return '<span></span>'; const mine = (j % 2) === G.color, r = mine ? G.recs.find(x => x.ply === j) : null;
      return `<span class="${mine ? 'me' : ''}">${G.sans[j]}${r?.grade ? `<i class="grade g-${r.grade}" style="padding:0 4px">${sym[r.grade] || '✓'}</i>` : ''}</span>`; };
    rows += `<span class="n">${i / 2 + 1}.</span>${cell(i)}${cell(i + 1)}`;
  }
  const status = G.over ? `<b>${G.over.title}</b> <span class="dim">· ${G.over.reason}</span>` : G.thinking ? `<span class="think"><i></i><i></i><i></i></span> ${c.name} is thinking` : `<b>Your move</b> <span class="dim">· you are ${G.color ? 'Black' : 'White'}</span>`;
  $('#panel').innerHTML = `
    <div class="ph">${ava(c)}<h2>${c.name}<small>${c.title} · ${c.rating}</small></h2>${G.opening ? `<span class="chip">${G.opening}</span>` : ''}</div>
    <div class="pb">
      <div class="bubble">“${G.say}”</div>
      <div class="row sm">${status}</div>
      ${S().coach ? `<div class="card"><h4>Coach</h4>${G.coach || (last?.msg ? `<span class="grade g-${last.grade}">${last.grade}</span> <span class="sm">${last.msg}</span>` : '<span class="sm dim">I grade every move you make. Play your first move.</span>')}</div>` : ''}
      <div class="card"><h4>This game · accuracy ${acc == null ? '–' : acc + '%'}</h4>
        <div class="counts">${GRADES.map(g => `<div class="g-${g}"><b>${cnt[g]}</b>${g.slice(0, 5)}</div>`).join('')}</div></div>
      <div class="card"><h4>Moves</h4><div class="moves" id="moves">${rows || '<span class="dim sm" style="grid-column:1/-1">No moves yet</span>'}</div></div>
    </div>
    <div class="pf">${G.over
      ? `<button class="btn pri" data-act="start">Rematch</button><button class="btn" data-act="lobby">Change opponent</button><button class="btn" data-act="summary">Game report</button>`
      : `<button class="btn" data-act="hint" ${G.thinking ? 'disabled' : ''}>💡 Hint</button><button class="btn" data-act="undo" ${G.thinking || G.sans.length < 2 ? 'disabled' : ''}>↶ Takeback</button><button class="btn" data-act="resign">⚑ Resign</button><button class="btn ghost" data-act="lobby">Exit</button>`}</div>`;
  const mv = $('#moves'); if (mv) mv.scrollTop = mv.scrollHeight;
  evalBar();
}
function evalBar() {
  const show = mode === 'play' && G.char && S().evalBar; $('#evalbar').hidden = !show; if (!show) return;
  const e = G.evalW || 0;
  $('#evalfill').style.height = wp(e) + '%';
  $('#evalnum').textContent = Math.abs(e) > MATE - 1000 ? '#' : (e > 0 ? '+' : '') + (e / 100).toFixed(1);
}
function say(k) { const s = G.char.say[k]; if (s) G.say = s; }

function startGame() {
  const c = CHARACTERS.find(x => x.id === S().char) || CHARACTERS[0];
  G = { active: true, char: c, color: S().color === 'r' ? (Math.random() < 0.5 ? 0 : 1) : S().color === 'b' ? 1 : 0, token: (G.token || 0) + 1, sans: [], recs: [], pend: [], thinking: false, evalW: 0, over: null, say: c.say.start, coach: null, hints: 0 };
  marks = []; setPosition(START); scene.orient(G.color);
  ctl = { canMove: () => G.active && !G.thinking && chess.turn === G.color, onMove: playerMove, danger: dangerSquares };
  renderPlay(); PR.touchStreak(); hud();
  if (chess.turn !== G.color) engineTurn();
}
function dangerSquares() {
  if (!S().danger || !G.active) return [];
  const out = [], us = G.color;
  for (let s = 0; s < 120; s++) { const p = chess.b[s]; if (s & 0x88 || !p || (p >> 3) !== us || (p & 7) === 6) continue; if (chess.attacked(s, us ^ 1) && !chess.attacked(s, us)) out.push(s); }
  return out;
}

async function playerMove(m) {
  const fen = chess.fen(), token = G.token, rec = { ply: G.sans.length, phase: phaseOf(), grade: null };
  G.coach = null; G.thinking = true;
  const san = await play(m); rec.san = san; G.sans.push(san); G.recs.push(rec); G.opening = openingName(G.sans) || G.opening;
  G.pend.push(askCoach({ type: 'analyze', fen, played: uci(m), depth: 5, time: 650 }).then(r => { if (token === G.token && G.recs.includes(rec)) gradeMove(rec, r); }));
  if (checkOver()) return;
  engineTurn();
}

function gradeMove(rec, r) {
  if (r.bestScore == null) return;
  const loss = Math.max(0, wp(r.bestScore) - wp(r.playedScore)), cp = r.bestScore - r.playedScore, same = r.best && r.bestSan === rec.san;
  rec.acc = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * loss) - 3.1669));
  rec.grade = same || loss < 0.6 ? 'best' : loss < 2.5 ? 'excellent' : loss < 6 ? 'good' : loss < 12 ? 'inaccuracy' : loss < 22 ? 'mistake' : 'blunder';
  const bad = GRADES.indexOf(rec.grade) >= 3, B = `<b>${r.bestSan}</b>`;
  const missedMate = r.bestScore > MATE - 1000 && r.playedScore < MATE - 1000 && !same;
  if (missedMate) { rec.cat = 'missedMate'; rec.msg = `You had a forced checkmate starting with ${B}.`; if (!bad) rec.grade = 'inaccuracy'; }
  else if (!bad) rec.msg = rec.grade === 'best' ? `${rec.san} is the strongest move here.` : rec.grade === 'excellent' ? `${rec.san} is nearly perfect.` : `${rec.san} is fine. Slightly stronger was ${B}.`;
  else if (r.playedScore < -MATE + 1000) { rec.cat = 'kingSafety'; rec.msg = `${rec.san} allows a forced checkmate starting with <b>${r.replySan}</b>. ${B} was needed.`; }
  else if (r.replyCap && cp >= 90) { rec.cat = 'hanging'; rec.msg = `${rec.san} loses material: <b>${r.replySan}</b> wins ${r.replyCap === 1 ? 'a pawn' : 'your ' + PN[r.replyCap]}. Better was ${B}. Run the blunder check before every move.`; }
  else if (r.bestCap || r.bestCheck) { rec.cat = 'missedTactic'; rec.msg = `You missed ${B}${r.bestCap ? ', which won material' : ', a strong forcing check'}. Always scan checks and captures first.`; }
  else if (rec.phase === 'opening') { rec.cat = 'opening'; rec.msg = `${rec.san} drifts from opening principles. ${B} developed with more purpose.`; }
  else { rec.cat = 'positional'; rec.msg = `${rec.san} lets your advantage slip. ${B} kept your pieces more active.`; }
  if (rec === G.recs[G.recs.length - 1]) {
    G.evalW = G.color ? -r.playedScore : r.playedScore;
    if (rec.grade === 'blunder' && G.active) say('blunder');
    if (mode === 'play') renderPlay();
  }
}

async function engineTurn() {
  G.thinking = true; const token = G.token, t0 = Date.now(), c = G.char;
  if (mode === 'play') renderPlay();
  let m = null, score = null;
  const bm = G.sans.length < 18 ? bookMove(G.sans, c) : null; if (bm) m = chess.moveFromSan(bm);
  if (!m) {
    const r = await askEngine({ type: 'move', fen: chess.fen(), ch: { depth: c.depth, time: c.time, blunder: c.blunder, noise: c.noise, margin: c.margin, style: c.style } });
    if (token !== G.token) return;
    m = chess.moveFromUci(r.uci); if (!r.careless) score = r.score;
  }
  await sleep(Math.max(0, 650 - (Date.now() - t0)));
  if (token !== G.token) return;
  const san = await play(m); G.sans.push(san); G.opening = openingName(G.sans) || G.opening;
  if (score != null) G.evalW = G.color ? score : -score;
  G.thinking = false;
  if (san.includes('+')) say('check'); else if (m.cap && (m.cap & 7) > 1) say('capture'); else if (Math.random() < 0.12) say('think');
  if (checkOver()) return;
  if (mode === 'play') renderPlay(); refresh();
}

function checkOver() {
  const st = chess.status(); if (!st) return false;
  const names = { checkmate: 'checkmate', stalemate: 'stalemate', fifty: 'fifty-move rule', material: 'insufficient material', repetition: 'threefold repetition' };
  finish(st === 'checkmate' ? (chess.turn === G.color ? 'loss' : 'win') : 'draw', names[st]); return true;
}

async function finish(result, reason) {
  if (!G.active) return;
  G.active = false; G.thinking = false; const g = G, c = g.char, P = PR.P;
  g.over = { result, reason, title: result === 'win' ? 'You won!' : result === 'loss' ? `${c.name} wins` : 'Draw' };
  G.say = c.say[result === 'win' ? 'lose' : result === 'loss' ? 'win' : 'think'];
  if (result === 'win') { sfx.win(); G.evalW = g.color ? -MATE : MATE; } else if (result === 'loss') { sfx.bad(); if (reason === 'checkmate') G.evalW = g.color ? MATE : -MATE; }
  renderPlay();
  await Promise.race([Promise.all(g.pend), sleep(4000)]);
  if (g !== G) return;
  const recs = g.recs.filter(r => r.grade), acc = recs.length ? Math.round(recs.reduce((s, r) => s + r.acc, 0) / recs.length) : null;
  for (const r of recs) { P.moves[r.grade]++; P.phase[r.phase].n++; P.phase[r.phase].acc += r.acc; if (r.cat) P.weak[r.cat]++; }
  const before = P.rating, score = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
  if (g.sans.length >= 4) {
    P.rating = Math.max(100, PR.elo(P.rating, c.rating, score)); P.ratingHist.push(P.rating); if (P.ratingHist.length > 60) P.ratingHist.shift();
    P.stats[result === 'win' ? 'w' : result === 'draw' ? 'd' : 'l']++;
    if (result === 'win') P.beaten[c.id] = true;
    P.games.unshift({ d: Date.now(), char: c.id, result, acc, opening: g.opening, moves: Math.ceil(g.sans.length / 2) }); P.games.length = Math.min(P.games.length, 30);
  }
  g.over.acc = acc; g.over.delta = P.rating - before; PR.save();
  if (g.sans.length >= 4) xp((result === 'win' ? 120 : result === 'draw' ? 60 : 30) + (acc || 0) / 2, result === 'win' ? 'victory' : 'game completed');
  hud(); renderPlay(); if (mode === 'play') summary();
}

function summary() {
  const g = G, o = g.over; if (!o) return;
  const cnt = Object.fromEntries(GRADES.map(k => [k, g.recs.filter(r => r.grade === k).length]));
  const worst = g.recs.filter(r => r.cat).sort((a, b) => a.acc - b.acc).slice(0, 3);
  const rec = PR.recommendations().slice(0, 2);
  modal(`
    <div class="row">${ava(g.char)}<div class="grow"><h1><em>${o.title}</em></h1><div class="dim">by ${o.reason} · vs ${g.char.name} (${g.char.rating}) · ${g.opening || 'Unknown opening'}</div></div></div>
    <div class="kpis"><div class="kpi"><b>${o.acc == null ? '–' : o.acc + '%'}</b><small>Accuracy</small></div><div class="kpi"><b>${o.delta > 0 ? '+' : ''}${o.delta || 0}</b><small>Rating</small></div>
      <div class="kpi"><b>${cnt.best + cnt.excellent}</b><small>Top moves</small></div><div class="kpi"><b>${cnt.mistake + cnt.blunder}</b><small>Errors</small></div></div>
    <div class="counts">${GRADES.map(k => `<div class="g-${k}"><b>${cnt[k]}</b>${k.slice(0, 5)}</div>`).join('')}</div>
    ${worst.length ? `<div class="card"><h4>Key moments to learn from</h4>${worst.map(r => `<p class="sm" style="margin:6px 0"><span class="grade g-${r.grade}">${Math.floor(r.ply / 2) + 1}${r.ply % 2 ? '…' : '.'} ${r.san}</span> ${r.msg}</p>`).join('')}</div>` : '<div class="card sm">No serious errors found at this analysis depth. Clean game!</div>'}
    <div class="card"><h4>Train next</h4>${rec.map((r, i) => `<div class="rec"><div class="n">${i + 1}</div><div class="grow"><b>${r.title}</b><div class="dim sm">${r.why}</div></div><button class="btn" data-act="rec" data-i="${i}">Go</button></div>`).join('')}</div>
    <div class="row"><button class="btn pri big" data-act="start">Rematch</button><button class="btn big" data-act="close">Review board</button></div>`);
}

async function hint() {
  if (!G.active || G.thinking) return;
  G.coach = '<span class="sm dim">Thinking about a hint…</span>'; renderPlay();
  const token = G.token, r = await askCoach({ type: 'analyze', fen: chess.fen(), depth: 5, time: 700 });
  if (token !== G.token || !r.best || chess.turn !== G.color) return;
  G.hints++; PR.P.hints++;
  scene.arrows([[sqIdx(r.best.slice(0, 2)), sqIdx(r.best.slice(2, 4)), 'gold']]);
  const m = chess.moveFromUci(r.best), why = r.bestScore > MATE - 1000 ? 'It leads to forced checkmate.' : m.cap ? 'It wins or trades material favourably.' : r.bestCheck ? 'A forcing check.' : chess.full <= 10 ? 'It follows opening principles: centre, development, king safety.' : 'It improves your position the most.';
  G.coach = `<span class="grade g-book">Hint</span> <span class="sm">Consider <b>${r.bestSan}</b>. ${why}</span>`; renderPlay();
}
function takeback() {
  if (!G.active || G.thinking || G.sans.length < 2 || chess.turn !== G.color) return;
  chess.undo(); chess.undo(); G.sans.length -= 2; G.recs.pop(); G.coach = null; G.token++;
  lastMove = chess.stack.length ? chess.stack[chess.stack.length - 1].m : null; sel = null; scene.arrows([]); scene.sync(chess); refresh(); renderPlay();
}

// ───────────────────────── ACADEMY
let A = { lesson: null, step: 0, solved: false, fb: null, fails: 0 };
function renderAcademy() {
  if (!A.lesson) {
    const nextId = LESSONS.find(l => !PR.P.lessons[l.id])?.id;
    $('#panel').innerHTML = `<div class="ph"><h2>Academy<small>${Object.keys(PR.P.lessons).length} of ${LESSONS.length} lessons complete</small></h2>${nextId ? `<button class="btn pri" data-act="lesson" data-id="${nextId}">Continue</button>` : ''}</div>
      <div class="pb">${CHAPTERS.map((c, i) => `<div class="chap"><header><div class="grow"><b>${i + 1}. ${c.name}</b><small>${c.desc}</small></div><span class="chip">${PR.chapterPct(i)}%</span></header>
        ${LESSONS.filter(l => l.ch === i).map(l => `<button class="les ${PR.P.lessons[l.id] ? 'done' : l.id === nextId ? 'next' : ''}" data-act="lesson" data-id="${l.id}"><span class="dot">${PR.P.lessons[l.id] ? '✓' : ''}</span><span class="grow">${l.title}</span><span class="dim sm">${l.steps.length} steps</span></button>`).join('')}</div>`).join('')}</div>`;
    return;
  }
  const L = A.lesson, s = L.steps[A.step], lastStep = A.step === L.steps.length - 1, locked = s.task && !A.solved;
  $('#panel').innerHTML = `<div class="ph"><button class="btn ghost" data-act="lessons">←</button><h2>${L.title}<small>${CHAPTERS[L.ch].name} · step ${A.step + 1} of ${L.steps.length}</small></h2></div>
    <div class="pb"><div class="dots">${L.steps.map((_, i) => `<i class="${i <= A.step ? 'on' : ''}"></i>`).join('')}</div>
      <div class="lesson-text">${s.t}</div>
      ${s.task ? `<div class="task ${A.solved ? 'ok' : A.fb ? 'no' : ''}">${A.solved ? '✓ ' + (s.ok || 'Correct!') : (A.fb ? A.fb + '<br>' : '') + '<b>Your turn:</b> ' + s.task.prompt}</div>` : ''}
      ${locked && A.fails >= 2 ? '<button class="btn" data-act="showme">Show me the move</button>' : ''}
    </div>
    <div class="pf"><button class="btn" data-act="step" data-d="-1" ${A.step ? '' : 'disabled'}>Back</button>
      <button class="btn pri big" data-act="step" data-d="1" ${locked ? 'disabled' : ''}>${lastStep ? 'Complete lesson ✓' : 'Next'}</button></div>`;
}
function openLesson(id) { A = { lesson: LESSONS.find(l => l.id === id), step: 0 }; showStep(); PR.touchStreak(); }
function showStep() {
  const s = A.lesson.steps[A.step]; A.solved = false; A.fb = null; A.fails = 0;
  const c = s.san ? new Chess().playSan(s.san) : new Chess(s.fen || START);
  marks = (s.hl || '').split(' ').filter(Boolean).map(sqIdx);
  setPosition(c); scene.arrows(s.ar || []);
  const side = s.task ? chess.turn : 0; if (scene.side !== side) scene.orient(side);
  ctl = { canMove: () => mode === 'academy' && !!s.task && !A.solved, onMove: lessonMove };
  renderAcademy();
}
async function lessonMove(m) {
  const s = A.lesson.steps[A.step], san = chess.san(m);
  if ((s.task.accept || []).includes(san) || (s.task.mate && san.endsWith('#'))) { A.solved = true; await play(m); sfx.good(); }
  else { A.fails++; A.fb = `${san} is not the move we are looking for. Try again.`; sfx.bad(); sel = null; refresh(); }
  renderAcademy();
}
function lessonStep(d) {
  const L = A.lesson;
  if (d > 0 && A.step === L.steps.length - 1) {
    const first = !PR.P.lessons[L.id]; PR.P.lessons[L.id] = true; PR.save();
    if (first) xp(40, 'lesson complete'); else hud();
    sfx.good(); A.lesson = null; marks = []; scene.arrows([]); ctl = null; refresh(); renderAcademy(); return;
  }
  A.step = Math.max(0, A.step + d); showStep();
}
function showMe() {
  const s = A.lesson.steps[A.step], ms = chess.moves();
  const m = s.task.accept ? chess.moveFromSan(s.task.accept[0]) : ms.find(x => chess.san(x, ms).endsWith('#'));
  if (m) scene.arrows([[m.from, m.to, 'gold']]);
}

// ───────────────────────── PUZZLES
let Z = { p: null, filter: null };
function renderPuzzles() {
  const P = PR.P;
  if (!Z.p) {
    const list = PUZZLES.filter(p => !Z.filter || p.theme === Z.filter), solved = PUZZLES.filter(p => P.puzzles[p.id]?.solved).length;
    $('#panel').innerHTML = `<div class="ph"><h2>Tactics Trainer<small>${solved} of ${PUZZLES.length} solved · puzzle rating ${P.puzzleRating}</small></h2><button class="btn pri" data-act="pznext">Train</button></div>
      <div class="pb"><div class="chips"><button class="chip ${Z.filter ? '' : 'on'}" data-act="pzfilter" data-t="">All</button>${Object.entries(THEMES).map(([k, n]) => { const a = PR.themeAcc(k); return `<button class="chip ${Z.filter === k ? 'on' : ''}" data-act="pzfilter" data-t="${k}">${n}${a == null ? '' : ` · ${a}%`}</button>`; }).join('')}</div>
        <div class="pz">${list.map(p => `<button class="${P.puzzles[p.id]?.solved ? 'solved' : ''}" data-act="puzzle" data-id="${p.id}"><b>${p.title}</b><small>${THEMES[p.theme]} · ${p.rating}</small></button>`).join('')}</div></div>`;
    return;
  }
  const p = Z.p;
  $('#panel').innerHTML = `<div class="ph"><button class="btn ghost" data-act="pzlist">←</button><h2>${p.title}<small>${THEMES[p.theme]} · rated ${p.rating}</small></h2></div>
    <div class="pb"><div class="lesson-text">${Z.side ? 'Black' : 'White'} to move. ${p.mate ? `Find the forced checkmate (${THEMES[p.theme].toLowerCase()}).` : 'Find the strongest continuation.'}</div>
      <div class="task ${Z.done ? 'ok' : Z.fb ? 'no' : ''}">${Z.done ? `✓ Solved${Z.failed ? '' : ' on the first try'}! <span class="dim">${Z.line}</span>` : Z.fb || 'Calculate the whole line before you touch a piece.'}</div>
      ${Z.done && Z.delta != null ? `<div class="card sm">Puzzle rating <b>${PR.P.puzzleRating}</b> (${Z.delta >= 0 ? '+' : ''}${Z.delta})</div>` : ''}
    </div>
    <div class="pf">${Z.done ? '<button class="btn pri big" data-act="pznext">Next puzzle</button>' : '<button class="btn" data-act="pzhint">Show next move</button>'}<button class="btn" data-act="pzretry">Restart</button></div>`;
}
function openPuzzle(id) {
  const p = PUZZLES.find(x => x.id === id), c = p.san ? new Chess().playSan(p.san) : new Chess(p.fen);
  Z = { p, i: 0, failed: false, done: false, fb: null, filter: Z.filter, side: c.turn, busy: false, line: p.sol.map(s => [].concat(s)[0]).join(' ') };
  marks = []; setPosition(c); scene.orient(c.turn);
  ctl = { canMove: () => mode === 'puzzles' && !Z.done && !Z.busy && chess.turn === Z.side, onMove: puzzleMove };
  renderPuzzles(); PR.touchStreak();
}
async function puzzleMove(m) {
  const p = Z.p, san = chess.san(m), final = Z.i === p.sol.length - 1;
  if ([].concat(p.sol[Z.i]).includes(san) || (p.mate && final && san.endsWith('#'))) {
    Z.busy = true; Z.fb = null; await play(m); Z.i++;
    if (Z.i < p.sol.length) { renderPuzzles(); await sleep(450); await play(chess.moveFromSan(p.sol[Z.i])); Z.i++; }
    Z.busy = false;
    if (Z.i >= p.sol.length) puzzleDone(); else { Z.fb = 'Correct! Keep going.'; renderPuzzles(); }
  } else { puzzleFail(`${san} is not it. Look for checks, captures and threats.`); sel = null; refresh(); }
}
function puzzleFail(msg) {
  const p = Z.p, P = PR.P;
  if (!Z.failed) { Z.failed = true; const t = P.themes[p.theme] = P.themes[p.theme] || { ok: 0, fail: 0 }; t.fail++; PR.save(); }
  Z.fb = msg; sfx.bad(); renderPuzzles();
}
function puzzleDone() {
  const p = Z.p, P = PR.P, st = P.puzzles[p.id] = P.puzzles[p.id] || { solved: false, tries: 0 }; st.tries++;
  if (!Z.failed) { const t = P.themes[p.theme] = P.themes[p.theme] || { ok: 0, fail: 0 }; t.ok++; }
  if (!st.solved) { const b = P.puzzleRating; P.puzzleRating = PR.elo(b, p.rating, Z.failed ? 0 : 1, 40); Z.delta = P.puzzleRating - b; }
  const first = !st.solved; st.solved = true; Z.done = true; PR.save(); sfx.good();
  xp(first ? (Z.failed ? 12 : 25) : 4, 'puzzle solved'); renderPuzzles();
}
function nextPuzzle() {
  const P = PR.P, pool = PUZZLES.filter(p => !Z.filter || p.theme === Z.filter), un = pool.filter(p => !P.puzzles[p.id]?.solved);
  const pick = un.length ? un.sort((a, b) => Math.abs(a.rating - P.puzzleRating) - Math.abs(b.rating - P.puzzleRating))[0] : pool.filter(p => p !== Z.p)[Math.floor(Math.random() * Math.max(1, pool.length - 1))] || pool[0];
  openPuzzle(pick.id);
}

// ───────────────────────── PROGRESS dashboard
function radar(sk) {
  const n = sk.length, R = 100, cx = 160, cy = 138, pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
  const ring = v => sk.map((_, i) => pt(i, v).join(',')).join(' ');
  return `<svg viewBox="0 0 320 276" width="100%">${[0.25, 0.5, 0.75, 1].map(v => `<polygon points="${ring(v)}" fill="none" stroke="rgba(255,255,255,.12)"/>`).join('')}
    ${sk.map((_, i) => { const [x, y] = pt(i, 1); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.1)"/>`; }).join('')}
    <polygon points="${sk.map((s, i) => pt(i, Math.max(0.04, s.v / 100)).join(',')).join(' ')}" fill="var(--a)" fill-opacity=".28" stroke="var(--a)" stroke-width="2"/>
    ${sk.map((s, i) => { const [x, y] = pt(i, 1.2); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${s.name}</text><text x="${x}" y="${y + 12}" text-anchor="middle" dominant-baseline="middle" style="fill:#fff;font-weight:700">${s.v}</text>`; }).join('')}</svg>`;
}
function spark(h) {
  if (h.length < 2) return '<div class="dim sm">Play rated games to chart your rating.</div>';
  const lo = Math.min(...h) - 20, hi = Math.max(...h) + 20, x = i => 4 + i * 292 / (h.length - 1), y = v => 66 - (v - lo) / (hi - lo) * 60;
  return `<svg viewBox="0 0 300 72" width="100%"><polyline fill="none" stroke="var(--a)" stroke-width="2" points="${h.map((v, i) => x(i) + ',' + y(v)).join(' ')}"/><circle cx="${x(h.length - 1)}" cy="${y(h[h.length - 1])}" r="3.5" fill="var(--b)"/></svg>`;
}
let recs = [];
function renderProgress() {
  const P = PR.P, sk = PR.skills(), rk = PR.rank(), tot = Object.values(P.moves).reduce((a, b) => a + b, 0) || 1;
  recs = PR.recommendations();
  const weak = Object.entries(P.weak).sort((a, b) => b[1] - a[1]), wmax = Math.max(1, ...weak.map(w => w[1]));
  const m = (name, v) => `<div class="meter"><span>${name}</span><div class="bar"><i style="width:${v ?? 0}%"></i></div><b>${v == null ? '–' : v + '%'}</b></div>`;
  modal(`
    <div class="row"><div class="grow"><h1>Your <em>progress</em></h1><div class="dim">Level ${PR.level()} · ${rk.name}${rk.next ? ` · ${rk.next[0] - P.rating > 0 ? rk.next[0] - P.rating : 0} rating points to ${rk.next[1]}` : ''}</div></div><button class="btn" data-act="close">Close ✕</button></div>
    <div class="dash">
      <div class="card"><h4>Skill radar</h4>${radar(sk)}</div>
      <div class="card span2"><h4>What to work on next</h4>${recs.map((r, i) => `<div class="rec"><div class="n">${i + 1}</div><div class="grow"><b>${r.title}</b><div class="dim sm">${r.why}</div></div><button class="btn pri" data-act="rec" data-i="${i}">${r.label || 'Start'}</button></div>`).join('')}</div>
      <div class="card span3"><div class="kpis"><div class="kpi"><b>${P.rating}</b><small>Game rating</small></div><div class="kpi"><b>${P.puzzleRating}</b><small>Puzzle rating</small></div><div class="kpi"><b>${PR.accuracy() ?? '–'}${PR.accuracy() == null ? '' : '%'}</b><small>Avg accuracy</small></div><div class="kpi"><b>${P.stats.w}–${P.stats.d}–${P.stats.l}</b><small>Win–Draw–Loss</small></div></div></div>
      <div class="card"><h4>Accuracy by phase</h4>${m('Opening', PR.phaseAcc('opening'))}${m('Middlegame', PR.phaseAcc('middlegame'))}${m('Endgame', PR.phaseAcc('endgame'))}
        <h4 style="margin-top:12px">Move quality (${tot === 1 && !P.moves.best ? 0 : tot} graded)</h4><div class="counts">${GRADES.map(g => `<div class="g-${g}"><b>${P.moves[g]}</b>${g.slice(0, 5)}</div>`).join('')}</div>
        <h4 style="margin-top:12px">Rating history</h4>${spark(P.ratingHist)}</div>
      <div class="card"><h4>Recurring mistakes</h4>${weak.map(([k, n]) => `<div class="meter"><span>${PR.weakInfo(k)[0]}</span><div class="bar red"><i style="width:${100 * n / wmax * (n ? 1 : 0)}%"></i></div><b>${n}</b></div>`).join('')}
        <p class="dim sm" style="margin-top:8px">${weak[0][1] ? PR.weakInfo(weak[0][0])[1] : 'Play games against the opponents and the coach will classify every error here.'}</p>
        <h4 style="margin-top:12px">Tactical themes (first-try %)</h4>${Object.entries(THEMES).map(([k, n]) => m(n, PR.themeAcc(k))).join('')}</div>
      <div class="card"><h4>Curriculum</h4>${CHAPTERS.map((c, i) => m(c.name, PR.chapterPct(i))).join('')}
        <h4 style="margin-top:12px">Opponent ladder</h4><div class="ladder">${CHARACTERS.map(c => ava(c, `title="${c.name} (${c.rating})"`, P.beaten[c.id] ? '' : 'off')).join('')}</div>
        <h4 style="margin-top:12px">Recent games</h4>${P.games.slice(0, 5).map(g => `<div class="row sm" style="padding:2px 0"><span class="grade g-${g.result === 'win' ? 'excellent' : g.result === 'loss' ? 'blunder' : 'book'}">${g.result}</span><span class="grow">vs ${CHARACTERS.find(c => c.id === g.char)?.name}</span><span class="dim">${g.acc ?? '–'}% · ${g.moves} moves</span></div>`).join('') || '<div class="dim sm">No games yet.</div>'}</div>
      <div class="card span3"><h4>Achievements</h4><div class="achs">${PR.ACH.map(([id, n, d]) => `<div class="ach ${P.ach?.[id] ? 'on' : ''}"><i>${P.ach?.[id] ? '🏆' : '🔒'}</i><b>${n}</b>${d}</div>`).join('')}</div></div>
    </div>`, true);
}
function doRec(i) {
  const a = (recs[i] || PR.recommendations()[i]).action; closeModal();
  if (a.type === 'lesson') { setMode('academy'); openLesson(a.id); }
  else if (a.type === 'puzzles') { Z = { p: null, filter: a.id || null }; setMode('puzzles'); nextPuzzle(); }
  else { S().char = a.id; PR.save(); G = { token: G.token }; setMode('play'); }
}

// ───────────────────────── CUSTOMIZE
function renderCustomize() {
  const s = S(), tg = (k, n, d) => `<button class="tog ${s[k] ? 'on' : ''}" data-act="toggle" data-k="${k}"><i></i><span class="grow"><b>${n}</b><div class="dim sm">${d}</div></span></button>`;
  $('#panel').innerHTML = `<div class="ph"><h2>Style & settings<small>Make the academy yours</small></h2></div><div class="pb">
    <div class="card"><h4>Atmosphere</h4><div class="grid2">${ENVS.map(e => `<button class="sw ${s.env === e.id ? 'on' : ''}" data-act="env" data-id="${e.id}"><div class="pv" style="background:radial-gradient(circle at 30% 20%, ${e.a}, transparent 60%), radial-gradient(circle at 80% 90%, ${e.b}, ${e.bg} 70%)"></div>${e.name}</button>`).join('')}</div></div>
    <div class="card"><h4>Board & pieces</h4><div class="grid2">${BOARDS.map(b => `<button class="sw ${s.board === b.id ? 'on' : ''}" data-act="board" data-id="${b.id}"><div class="pv bd" style="--l:${b.light};--d:${b.dark};--pw:${b.w[0]};--pk:${b.k[0]}"></div>${b.name}</button>`).join('')}</div></div>
    <div class="card"><h4>Training aids</h4>${tg('coach', 'Live coach', 'Grade and explain every move you play')}${tg('dots', 'Legal move markers', 'Show where the selected piece can go')}${tg('danger', 'Danger highlights', 'Pulse your pieces that are attacked and undefended')}${tg('evalBar', 'Evaluation bar', 'Show who is winning during games')}${tg('sound', 'Sound', 'Move, capture and success sounds')}</div>
    <div class="card"><h4>Camera</h4><p class="sm dim">Drag to orbit, scroll to zoom. Use the view buttons at the bottom-left for presets.</p></div>
    <button class="btn" data-act="reset">Reset all progress</button></div>`;
}

// ───────────────────────── modes & actions
function setMode(m) {
  if (m === 'progress') { renderProgress(); return; }
  mode = m; document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  closeModal(); sel = null; marks = []; scene.arrows([]);
  if (m === 'play') {
    if (G.char) { setPositionFromGame(); ctl = { canMove: () => G.active && !G.thinking && chess.turn === G.color, onMove: playerMove, danger: dangerSquares }; }
    else { ctl = null; setPosition(START, false); if (scene.side) scene.orient(0); }
    renderPlay();
  } else if (m === 'academy') { if (A.lesson) showStep(); else { ctl = null; renderAcademy(); } }
  else if (m === 'puzzles') { if (Z.p && !Z.done) openPuzzle(Z.p.id); else { Z.p = null; ctl = null; renderPuzzles(); } }
  else if (m === 'customize') { renderCustomize(); }
  evalBar(); refresh();
}
// the live game keeps its own history; rebuild the shared board from it when returning to Play
function setPositionFromGame() {
  const c = new Chess().playSan(G.sans); chess.load(START); for (const h of c.stack) chess.make(h.m);
  lastMove = chess.stack.length ? chess.stack[chess.stack.length - 1].m : null; scene.sync(chess, true); if (scene.side !== G.color) scene.orient(G.color);
}

const ACT = {
  mode: d => { if (mode === 'play' && G.thinking && d.mode !== 'play' && d.mode !== 'progress') return toast('Wait for your opponent to move first'); setMode(d.mode); },
  view: d => scene.view(d.v),
  char: d => { S().char = d.id; PR.save(); renderPlay(); }, color: d => { S().color = d.c; PR.save(); renderPlay(); },
  start: () => { closeModal(); startGame(); }, lobby: () => { if (G.active) { G.token++; G.active = false; } G = { token: G.token }; setMode('play'); },
  hint, undo: takeback, resign: () => finish('loss', 'resignation'), summary, close: closeModal,
  lesson: d => openLesson(d.id), lessons: () => { A.lesson = null; marks = []; scene.arrows([]); ctl = null; refresh(); renderAcademy(); }, step: d => lessonStep(+d.d), showme: showMe,
  puzzle: d => openPuzzle(d.id), pzlist: () => { Z = { p: null, filter: Z.filter }; ctl = null; renderPuzzles(); }, pznext: nextPuzzle, pzretry: () => openPuzzle(Z.p.id),
  pzfilter: d => { Z.filter = d.t || null; renderPuzzles(); },
  pzhint: () => { const m = chess.moveFromSan([].concat(Z.p.sol[Z.i])[0]); if (m) { scene.arrows([[m.from, m.to, 'gold']]); puzzleFail('The arrow shows the move. Work out why it wins.'); } },
  rec: d => doRec(+d.i),
  env: d => { S().env = d.id; PR.save(); applyTheme(); renderCustomize(); }, board: d => { S().board = d.id; PR.save(); applyTheme(); renderCustomize(); },
  toggle: d => { S()[d.k] = !S()[d.k]; PR.save(); renderCustomize(); refresh(); evalBar(); },
  reset: () => { if (confirm('Erase all progress, ratings and statistics?')) { PR.reset(); A = { lesson: null }; Z = { p: null }; G = { token: G.token }; hud(); renderCustomize(); toast('Progress reset'); } },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  if (el.closest('#overlay') && $('#overlay').onclick) return;
  ACT[el.dataset.act]?.(el.dataset);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#overlay').onclick) closeModal(); });

// ───────────────────────── boot
applyTheme(); scene.orient(0, true); setPosition(START); hud(); setMode('play'); layout(); checkAch();
window.__booted = true;
window.__app = { chess, scene, get G() { return G; }, ACT, PR, setMode, openLesson, openPuzzle };
// deep links: #lesson=fork  #puzzle=p18  #play=mira  #progress  #skip
const H = Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map(x => x.split('=')));
if (H.env) { S().env = H.env; applyTheme(); } if (H.board) { S().board = H.board; applyTheme(); }
if (H.lesson) { setMode('academy'); openLesson(H.lesson); if (H.step) { A.step = +H.step; showStep(); } }
else if (H.puzzle) { setMode('puzzles'); openPuzzle(H.puzzle); }
else if (H.play) { S().char = H.play; startGame(); }
else if (H.demo) (async () => { // self-running demo game: #demo=mira&n=8&end
  S().char = H.demo; startGame();
  for (let i = 0; i < (+H.n || 6) && G.active; i++) {
    while (G.active && (G.thinking || chess.turn !== G.color)) await sleep(100);
    if (!G.active) break;
    const r = await askCoach({ type: 'analyze', fen: chess.fen(), depth: 3, time: 200 }), ms = chess.moves();
    await playerMove(i % 3 === 2 ? ms[Math.floor(Math.random() * ms.length)] : chess.moveFromUci(r.best));
  }
  while (G.thinking) await sleep(100);
  if ('end' in H) finish('loss', 'resignation');
})();
else if ('progress' in H) renderProgress();
else if (H.mode) setMode(H.mode);
else if ('skip' in H) { /* no welcome */ }
else if (!Object.keys(PR.P.lessons).length && !PR.P.games.length) {
  modal(`<h1>Welcome to <em>Ascend</em></h1>
    <p class="lesson-text">A complete chess academy on a 3D board. Three ways to train, one profile that tracks everything:</p>
    <div class="card"><b>✦ Academy</b><div class="dim sm">40 interactive lessons from how the pieces move to the Lucena position and grandmaster thinking.</div></div>
    <div class="card"><b>♞ Play</b><div class="dim sm">Seven opponents with their own personalities, from Pip (400) to ORACLE (2000+). A coach grades every move you make.</div></div>
    <div class="card"><b>◆ Puzzles</b><div class="dim sm">Tactics trainer with its own rating, tracked by theme.</div></div>
    <div class="card"><b>◔ Progress</b><div class="dim sm">Skill radar, recurring mistakes, and exactly what to study next.</div></div>
    <div class="row"><button class="btn pri big" data-act="lesson" data-id="board" id="go1">Start lesson 1</button><button class="btn big" data-act="close">Explore first</button></div>`);
  $('#go1').addEventListener('click', () => setMode('academy'), { capture: true });
}
