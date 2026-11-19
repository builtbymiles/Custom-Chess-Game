// Engine worker: opponent move selection (with personality) and coach analysis.
import { Chess, uci } from './engine.js';
import { Searcher, MATE, VAL } from './ai.js';

const S = new Searcher();
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 1.15;

function styleBonus(c, m, st) {
  let v = 0; const t = m.p & 7, us = c.turn;
  if (m.cap) { v += st.capture || 0; if (VAL[m.cap & 7] >= VAL[t]) v += st.trade || 0; }
  if (t === 1) v += st.push || 0;
  if (t === 5) v += st.queen || 0;
  if (m.fl & 12) v += st.castle || 0;
  if ((t === 2 || t === 3) && (m.from >> 4) === (us ? 7 : 0)) v += st.develop || 0;
  const f = m.to & 7, r = m.to >> 4;
  if (f >= 2 && f <= 5 && r >= 2 && r <= 5) v += st.center || 0;
  if (st.hunt && t !== 6) {
    const k = c.king[us ^ 1], d = Math.max(Math.abs((k & 7) - f), Math.abs((k >> 4) - r));
    const d0 = Math.max(Math.abs((k & 7) - (m.from & 7)), Math.abs((k >> 4) - (m.from >> 4)));
    v += (d0 - d) * st.hunt;
  }
  if (st.check) { c.make(m); if (c.inCheck()) v += st.check; c.undo(); }
  return v;
}

function pickMove({ fen, ch }) {
  const c = new Chess(fen), legal = c.moves();
  if (!legal.length) return { uci: null };
  if (Math.random() < (ch.blunder || 0)) {
    // a careless move: random, slightly biased toward "tempting" captures and checks
    const w = legal.map(m => 1 + (m.cap ? 1.5 : 0));
    let x = Math.random() * w.reduce((a, b) => a + b, 0), i = 0;
    while ((x -= w[i]) > 0) i++;
    return { uci: uci(legal[i]), score: 0, careless: true };
  }
  const r = S.search(c, { depth: ch.depth, time: ch.time, margin: ch.margin || 0 });
  let pick = r.best;
  if (Math.abs(r.score) < MATE - 1000 && r.list.length > 1) {
    let bv = -1e9;
    for (const x of r.list) {
      const v = x.score + styleBonus(c, x.m, ch.style || {}) + gauss() * (ch.noise || 0);
      if (v > bv) { bv = v; pick = x.m; }
    }
  }
  return { uci: uci(pick), score: r.score, depth: r.depth };
}

function analyze({ fen, played, depth = 5, time = 900 }) {
  const c = new Chess(fen);
  const r = S.search(c, { depth, time });
  if (!r.best) return {};
  const out = { best: uci(r.best), bestSan: c.san(r.best), bestScore: r.score, bestCap: !!r.best.cap, depth: r.depth };
  c.make(r.best); out.bestCheck = c.inCheck(); c.undo();
  if (played) {
    const m = c.moveFromUci(played);
    c.make(m);
    const r2 = S.search(c, { depth: Math.max(1, r.depth - 1), time });
    out.playedScore = played === out.best ? Math.max(r.score, -r2.score) : Math.min(r.score, -r2.score);
    if (played === out.best) out.bestScore = out.playedScore;
    if (r2.best) { out.reply = uci(r2.best); out.replySan = c.san(r2.best); out.replyCap = r2.best.cap & 7; }
    out.mover = c.turn ^ 1;
  }
  return out;
}

self.onmessage = e => {
  const d = e.data; let out;
  try { out = d.type === 'move' ? pickMove(d) : analyze(d); }
  catch (err) { out = { error: String(err && err.stack || err) }; }
  self.postMessage({ id: d.id, ...out });
};
