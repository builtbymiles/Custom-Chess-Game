// Search + evaluation: iterative deepening alpha-beta with transposition table,
// null-move pruning, killer/history ordering and quiescence search.
export const MATE = 100000;
const INF = 1e9;
export const VAL = [0, 100, 320, 330, 500, 900, 0];

const T = {
  1: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
  3: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
  4: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
  5: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
  6: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
};
const KE = [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50];

// PSQ[piece*128+sq], signed (white positive), material included
const MG = new Int16Array(16 * 128), EG = new Int16Array(16 * 128);
for (let c = 0; c < 2; c++) for (let t = 1; t <= 6; t++) for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
  const i = (c ? r : 7 - r) * 8 + f, k = ((c << 3 | t) << 7) + r * 16 + f, sg = c ? -1 : 1;
  MG[k] = sg * (VAL[t] + T[t][i]);
  EG[k] = sg * (VAL[t] + (t === 6 ? KE[i] : T[t][i]));
}
const PHASE = [0, 0, 1, 1, 2, 4, 0];
const PASS = [0, 5, 10, 20, 35, 60, 100, 0];
const wMin = new Int8Array(10), bMax = new Int8Array(10);

// static evaluation relative to side to move
export function evaluate(c) {
  const b = c.b;
  let mg = 0, eg = 0, ph = 0, wb = 0, bb = 0, wm = 0, bm = 0;
  wMin.fill(9); bMax.fill(-1);
  for (let r = 0; r < 8; r++) for (let s = r << 4, e = s + 8; s < e; s++) {
    const p = b[s]; if (!p) continue;
    const k = (p << 7) + s; mg += MG[k]; eg += EG[k];
    const t = p & 7; ph += PHASE[t];
    if (p === 1) { const f = (s & 7) + 1; if (r < wMin[f]) wMin[f] = r; wm += 100; }
    else if (p === 9) { const f = (s & 7) + 1; if (r > bMax[f]) bMax[f] = r; bm += 100; }
    else if (p >> 3) { bm += VAL[t]; if (t === 3) bb++; } else { wm += VAL[t]; if (t === 3) wb++; }
  }
  if (wb >= 2) { mg += 30; eg += 40; } if (bb >= 2) { mg -= 30; eg -= 40; }
  // passed pawns
  for (let r = 1; r < 7; r++) for (let s = r << 4, e = s + 8; s < e; s++) {
    const p = b[s]; if ((p & 7) !== 1) continue;
    const f = (s & 7) + 1;
    if (p === 1) { if (bMax[f - 1] <= r && bMax[f] <= r && bMax[f + 1] <= r) { mg += PASS[r] >> 1; eg += PASS[r]; } }
    else if (wMin[f - 1] >= r && wMin[f] >= r && wMin[f + 1] >= r) { mg -= PASS[7 - r] >> 1; eg -= PASS[7 - r]; }
  }
  // mop-up: drive the losing king to the edge, bring our king close
  const d = wm - bm;
  if (d > 300 || d < -300) {
    const win = d > 0 ? 0 : 1, lk = c.king[win ^ 1], wk = c.king[win];
    const lf = lk & 7, lr = lk >> 4;
    const cd = Math.max(3 - lf, lf - 4) + Math.max(3 - lr, lr - 4);
    const kd = Math.abs((wk & 7) - lf) + Math.abs((wk >> 4) - lr);
    const bonus = 12 * cd + 5 * (14 - kd);
    eg += win ? -bonus : bonus;
  }
  if (ph > 24) ph = 24;
  const sc = ((mg * ph + eg * (24 - ph)) / 24) | 0;
  return c.turn ? -sc : sc;
}

const TT_BITS = 18, TT_SIZE = 1 << TT_BITS, TT_MASK = TT_SIZE - 1;
const pack = m => m.from | m.to << 7 | m.promo << 14;

export class Searcher {
  constructor() {
    this.kLo = new Int32Array(TT_SIZE); this.kHi = new Int32Array(TT_SIZE);
    this.tMove = new Int32Array(TT_SIZE); this.tScore = new Int32Array(TT_SIZE);
    this.tDepth = new Int8Array(TT_SIZE); this.tFlag = new Int8Array(TT_SIZE);
    this.hist = new Int32Array(16 * 128); this.killers = [];
  }

  isRep() {
    const c = this.c, st = c.stack, lim = Math.max(0, st.length - c.half);
    for (let i = st.length - 2; i >= lim; i -= 2) if (st[i].lo === c.lo && st[i].hi === c.hi) return true;
    return false;
  }

  hasPieces(col) {
    const b = this.c.b;
    for (let s = 0; s < 120; s++) { const p = b[s]; if (p && (p >> 3) === col && (p & 7) > 1 && (p & 7) < 6) return true; }
    return false;
  }

  order(moves, ttm, ply) {
    const k = this.killers[ply] || [0, 0], h = this.hist;
    for (const m of moves) {
      const pk = pack(m);
      m.o = pk === ttm ? 1e7 : m.cap ? 1e6 + VAL[m.cap & 7] * 10 - VAL[m.p & 7] + (m.promo ? 5000 : 0)
        : m.promo ? 9e5 : pk === k[0] ? 8e5 : pk === k[1] ? 7e5 : h[(m.p << 7) + m.to];
    }
    moves.sort((a, b) => b.o - a.o);
  }

  qs(a, b, ply) {
    const c = this.c;
    if ((++this.nodes & 2047) === 0 && this.canStop && Date.now() > this.deadline) { this.stop = true; return 0; }
    const stand = evaluate(c);
    if (stand >= b || ply > 40) return stand;
    if (stand > a) a = stand;
    const us = c.turn, moves = c.gen(true);
    for (const m of moves) m.o = VAL[m.cap & 7] * 10 - VAL[m.p & 7] + (m.promo ? 9000 : 0);
    moves.sort((x, y) => y.o - x.o);
    for (const m of moves) {
      if (stand + VAL[m.cap & 7] + 200 < a && !m.promo) continue;
      c.make(m);
      if (c.attacked(c.king[us], us ^ 1)) { c.undo(); continue; }
      const s = -this.qs(-b, -a, ply + 1);
      c.undo();
      if (this.stop) return 0;
      if (s > a) { a = s; if (a >= b) break; }
    }
    return a;
  }

  nm(d, a, b, ply, nullOk) {
    const c = this.c;
    if (ply > 0 && (c.half >= 100 || this.isRep())) return 0;
    const inCheck = c.inCheck();
    if (inCheck && ply < 30) d++;
    if (d <= 0) return this.qs(a, b, ply);
    if ((++this.nodes & 2047) === 0 && this.canStop && Date.now() > this.deadline) { this.stop = true; return 0; }
    const idx = c.lo & TT_MASK;
    let ttm = 0;
    if (this.kLo[idx] === c.lo && this.kHi[idx] === c.hi) {
      ttm = this.tMove[idx];
      if (this.tDepth[idx] >= d && ply > 0) {
        let s = this.tScore[idx]; const fl = this.tFlag[idx];
        if (s > MATE - 1000) s -= ply; else if (s < -MATE + 1000) s += ply;
        if (fl === 0 || (fl === 1 && s >= b) || (fl === 2 && s <= a)) return s;
      }
    }
    const us = c.turn;
    if (nullOk && !inCheck && d >= 3 && ply > 0 && b < MATE - 1000 && this.hasPieces(us) && evaluate(c) >= b) {
      c.makeNull();
      const s = -this.nm(d - 3, -b, -b + 1, ply + 1, false);
      c.undo();
      if (this.stop) return 0;
      if (s >= b) return b;
    }
    const moves = c.gen(); this.order(moves, ttm, ply);
    let best = -INF, bestMove = 0, legal = 0; const a0 = a;
    for (const m of moves) {
      c.make(m);
      if (c.attacked(c.king[us], us ^ 1)) { c.undo(); continue; }
      legal++;
      let s;
      if (legal === 1) s = -this.nm(d - 1, -b, -a, ply + 1, true);
      else { s = -this.nm(d - 1, -a - 1, -a, ply + 1, true); if (s > a && s < b && !this.stop) s = -this.nm(d - 1, -b, -a, ply + 1, true); }
      c.undo();
      if (this.stop) return 0;
      if (s > best) {
        best = s; bestMove = pack(m);
        if (s > a) {
          a = s;
          if (a >= b) {
            if (!m.cap) {
              const k = this.killers[ply] || (this.killers[ply] = [0, 0]);
              if (k[0] !== bestMove) { k[1] = k[0]; k[0] = bestMove; }
              this.hist[(m.p << 7) + m.to] += d * d;
            }
            break;
          }
        }
      }
    }
    if (!legal) return inCheck ? -MATE + ply : 0;
    let st = best; if (st > MATE - 1000) st += ply; else if (st < -MATE + 1000) st -= ply;
    this.kLo[idx] = c.lo; this.kHi[idx] = c.hi; this.tMove[idx] = bestMove; this.tScore[idx] = st;
    this.tDepth[idx] = d; this.tFlag[idx] = best <= a0 ? 2 : best >= b ? 1 : 0;
    return best;
  }

  // margin: also return exact scores for every root move within `margin` cp of the best
  search(chess, { depth = 4, time = 1000, margin = 0 } = {}) {
    this.c = chess; this.stop = false; this.nodes = 0; this.killers = []; this.hist.fill(0);
    const start = Date.now(); this.deadline = start + time;
    const root = chess.moves();
    if (!root.length) return { best: null, score: chess.inCheck() ? -MATE : 0, depth: 0, list: [] };
    for (const m of root) m.score = (m.cap ? VAL[m.cap & 7] : 0);
    let result = null;
    for (let d = 1; d <= depth; d++) {
      this.canStop = d > 1;
      root.sort((x, y) => y.score - x.score);
      let best = -INF; const scored = [];
      for (const m of root) {
        chess.make(m);
        const a = best - margin - 1;
        const s = -this.nm(d - 1, -INF, -a, 1, true);
        chess.undo();
        if (this.stop) break;
        scored.push({ m, score: s, exact: s > a });
        if (s > best) best = s;
      }
      if (this.stop) break;
      for (const x of scored) x.m.score = x.score;
      scored.sort((x, y) => y.score - x.score);
      result = { best: scored[0].m, score: best, depth: d, list: scored.filter(x => x.exact && x.score >= best - margin) };
      if (Math.abs(best) > MATE - 200 || Date.now() - start > time * 0.55) break;
    }
    result.nodes = this.nodes;
    return result;
  }
}
