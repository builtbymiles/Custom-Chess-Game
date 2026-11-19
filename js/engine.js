// Chess rules engine (0x88 board). Full legal move generation, castling, en passant,
// promotion, check / mate / stalemate / draw detection, SAN + FEN.
export const WHITE = 0, BLACK = 1;
export const PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6;
export const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export const F_EP = 1, F_DP = 2, F_KS = 4, F_QS = 8;
const PCH = ' pnbrqk';
const N_OFF = [-33, -31, -18, -14, 14, 18, 31, 33];
const K_OFF = [-17, -16, -15, -1, 1, 15, 16, 17];
const B_OFF = [-17, -15, 15, 17];
const R_OFF = [-16, -1, 1, 16];
const CM = new Uint8Array(128).fill(15);
CM[0] = 13; CM[7] = 14; CM[4] = 12; CM[112] = 7; CM[119] = 11; CM[116] = 3;

// Zobrist keys (two 32-bit halves)
let seed = 0x9e3779b9;
function rnd() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return (t ^ (t >>> 14)) | 0;
}
const ZL = new Int32Array(16 * 128).map(rnd), ZH = new Int32Array(16 * 128).map(rnd);
const ZCL = new Int32Array(16).map(rnd), ZCH = new Int32Array(16).map(rnd);
const ZEL = new Int32Array(128).map(rnd), ZEH = new Int32Array(128).map(rnd);
const ZSL = rnd(), ZSH = rnd();

export const sqName = s => 'abcdefgh'[s & 7] + ((s >> 4) + 1);
export const sqIdx = n => (n.charCodeAt(1) - 49) * 16 + (n.charCodeAt(0) - 97);
export const pieceChar = p => { const c = PCH[p & 7]; return p >> 3 ? c : c.toUpperCase(); };
export const uci = m => sqName(m.from) + sqName(m.to) + (m.promo ? PCH[m.promo] : '');

export class Chess {
  constructor(fen = START) { this.load(fen); }

  load(fen) {
    const b = this.b = new Uint8Array(128);
    this.stack = []; this.king = [-1, -1];
    const [pos, turn, cas, ep, half, full] = fen.trim().split(/\s+/);
    let r = 7, f = 0;
    for (const ch of pos) {
      if (ch === '/') { r--; f = 0; }
      else if (ch >= '1' && ch <= '8') f += +ch;
      else {
        const lower = ch.toLowerCase(), t = PCH.indexOf(lower), c = ch === lower ? 1 : 0, s = r * 16 + f;
        b[s] = c << 3 | t; if (t === 6) this.king[c] = s; f++;
      }
    }
    this.turn = turn === 'b' ? 1 : 0;
    this.castle = 0;
    for (const ch of cas || '') { const i = 'KQkq'.indexOf(ch); if (i >= 0) this.castle |= 1 << i; }
    this.ep = ep && ep !== '-' ? sqIdx(ep) : -1;
    this.half = +half || 0; this.full = +full || 1;
    this.lo = 0; this.hi = 0;
    for (let s = 0; s < 128; s++) if (b[s]) this.hx(b[s], s);
    this.lo ^= ZCL[this.castle]; this.hi ^= ZCH[this.castle];
    if (this.ep >= 0) { this.lo ^= ZEL[this.ep]; this.hi ^= ZEH[this.ep]; }
    if (this.turn) { this.lo ^= ZSL; this.hi ^= ZSH; }
    return this;
  }

  hx(pc, sq) { const i = (pc << 7) + sq; this.lo ^= ZL[i]; this.hi ^= ZH[i]; }

  fen() {
    let s = '';
    for (let r = 7; r >= 0; r--) {
      let e = 0;
      for (let f = 0; f < 8; f++) {
        const p = this.b[r * 16 + f];
        if (!p) e++; else { if (e) { s += e; e = 0; } s += pieceChar(p); }
      }
      if (e) s += e; if (r) s += '/';
    }
    let c = ''; for (let i = 0; i < 4; i++) if (this.castle & (1 << i)) c += 'KQkq'[i];
    return `${s} ${this.turn ? 'b' : 'w'} ${c || '-'} ${this.ep >= 0 ? sqName(this.ep) : '-'} ${this.half} ${this.full}`;
  }

  attacked(sq, by) {
    const b = this.b, base = by << 3;
    if (by === 0) { if (b[sq - 15] === 1 || b[sq - 17] === 1) return true; }
    else if (b[sq + 15] === 9 || b[sq + 17] === 9) return true;
    const n = base | 2, k = base | 6, bi = base | 3, ro = base | 4, q = base | 5;
    for (let i = 0; i < 8; i++) {
      if (b[sq + N_OFF[i]] === n) return true;
      if (b[sq + K_OFF[i]] === k) return true;
    }
    for (let i = 0; i < 4; i++) {
      let d = B_OFF[i], t = sq + d;
      while (!(t & 0x88)) { const p = b[t]; if (p) { if (p === bi || p === q) return true; break; } t += d; }
      d = R_OFF[i]; t = sq + d;
      while (!(t & 0x88)) { const p = b[t]; if (p) { if (p === ro || p === q) return true; break; } t += d; }
    }
    return false;
  }

  inCheck() { return this.attacked(this.king[this.turn], this.turn ^ 1); }

  // pseudo-legal moves
  gen(capsOnly = false) {
    const b = this.b, us = this.turn, them = us ^ 1, out = [];
    const add = (from, to, p, cap, fl = 0, promo = 0) => out.push({ from, to, p, cap, promo, fl });
    for (let r = 0; r < 8; r++) for (let s = r << 4, e = s + 8; s < e; s++) {
      const p = b[s]; if (!p || (p >> 3) !== us) continue;
      const t = p & 7;
      if (t === 1) {
        const d = us ? -16 : 16, last = us ? 0 : 7;
        let to = s + d;
        if (!b[to]) {
          if ((to >> 4) === last) { add(s, to, p, 0, 0, 5); if (!capsOnly) { add(s, to, p, 0, 0, 2); add(s, to, p, 0, 0, 4); add(s, to, p, 0, 0, 3); } }
          else if (!capsOnly) { add(s, to, p, 0); if (r === (us ? 6 : 1) && !b[to + d]) add(s, to + d, p, 0, F_DP); }
        }
        for (let dx = -1; dx <= 1; dx += 2) {
          to = s + d + dx; if (to & 0x88) continue;
          const c = b[to];
          if (c) {
            if ((c >> 3) === them) {
              if ((to >> 4) === last) { add(s, to, p, c, 0, 5); add(s, to, p, c, 0, 2); add(s, to, p, c, 0, 4); add(s, to, p, c, 0, 3); }
              else add(s, to, p, c);
            }
          } else if (to === this.ep) add(s, to, p, them << 3 | 1, F_EP);
        }
      } else if (t === 2 || t === 6) {
        const offs = t === 2 ? N_OFF : K_OFF;
        for (let i = 0; i < 8; i++) {
          const to = s + offs[i]; if (to & 0x88) continue;
          const c = b[to];
          if (!c) { if (!capsOnly) add(s, to, p, 0); } else if ((c >> 3) === them) add(s, to, p, c);
        }
      } else {
        const offs = t === 3 ? B_OFF : t === 4 ? R_OFF : K_OFF;
        for (let i = 0; i < offs.length; i++) {
          const d = offs[i]; let to = s + d;
          while (!(to & 0x88)) {
            const c = b[to];
            if (!c) { if (!capsOnly) add(s, to, p, 0); }
            else { if ((c >> 3) === them) add(s, to, p, c); break; }
            to += d;
          }
        }
      }
    }
    if (!capsOnly) {
      const o = us ? 112 : 0, K = us << 3 | 6, R = us << 3 | 4, ks = us ? 4 : 1, qs = us ? 8 : 2;
      if (b[o + 4] === K) {
        if ((this.castle & ks) && !b[o + 5] && !b[o + 6] && b[o + 7] === R &&
          !this.attacked(o + 4, them) && !this.attacked(o + 5, them) && !this.attacked(o + 6, them)) add(o + 4, o + 6, K, 0, F_KS);
        if ((this.castle & qs) && !b[o + 1] && !b[o + 2] && !b[o + 3] && b[o] === R &&
          !this.attacked(o + 4, them) && !this.attacked(o + 3, them) && !this.attacked(o + 2, them)) add(o + 4, o + 2, K, 0, F_QS);
      }
    }
    return out;
  }

  moves() {
    const us = this.turn;
    return this.gen().filter(m => { this.make(m); const ok = !this.attacked(this.king[us], us ^ 1); this.undo(); return ok; });
  }

  make(m) {
    const b = this.b, us = this.turn;
    this.stack.push({ m, c: this.castle, ep: this.ep, half: this.half, lo: this.lo, hi: this.hi });
    this.lo ^= ZCL[this.castle]; this.hi ^= ZCH[this.castle];
    if (this.ep >= 0) { this.lo ^= ZEL[this.ep]; this.hi ^= ZEH[this.ep]; }
    this.hx(m.p, m.from); b[m.from] = 0;
    if (m.cap) {
      if (m.fl & F_EP) { const cs = m.to + (us ? 16 : -16); b[cs] = 0; this.hx(m.cap, cs); }
      else this.hx(m.cap, m.to);
    }
    const placed = m.promo ? (us << 3 | m.promo) : m.p;
    b[m.to] = placed; this.hx(placed, m.to);
    if ((m.p & 7) === 6) {
      this.king[us] = m.to;
      if (m.fl & F_KS) { const rk = b[m.to + 1]; b[m.to + 1] = 0; b[m.to - 1] = rk; this.hx(rk, m.to + 1); this.hx(rk, m.to - 1); }
      else if (m.fl & F_QS) { const rk = b[m.to - 2]; b[m.to - 2] = 0; b[m.to + 1] = rk; this.hx(rk, m.to - 2); this.hx(rk, m.to + 1); }
    }
    this.castle &= CM[m.from] & CM[m.to];
    this.ep = (m.fl & F_DP) ? (m.from + m.to) >> 1 : -1;
    this.half = ((m.p & 7) === 1 || m.cap) ? 0 : this.half + 1;
    if (us) this.full++;
    this.turn = us ^ 1;
    this.lo ^= ZCL[this.castle] ^ ZSL; this.hi ^= ZCH[this.castle] ^ ZSH;
    if (this.ep >= 0) { this.lo ^= ZEL[this.ep]; this.hi ^= ZEH[this.ep]; }
  }

  undo() {
    const h = this.stack.pop(); if (!h) return null;
    const m = h.m, b = this.b, us = this.turn ^ 1;
    this.turn = us;
    if (m) {
      b[m.from] = m.p;
      if (m.fl & F_EP) { b[m.to] = 0; b[m.to + (us ? 16 : -16)] = m.cap; } else b[m.to] = m.cap;
      if ((m.p & 7) === 6) {
        this.king[us] = m.from;
        if (m.fl & F_KS) { b[m.to + 1] = b[m.to - 1]; b[m.to - 1] = 0; }
        else if (m.fl & F_QS) { b[m.to - 2] = b[m.to + 1]; b[m.to + 1] = 0; }
      }
      if (us) this.full--;
    }
    this.castle = h.c; this.ep = h.ep; this.half = h.half; this.lo = h.lo; this.hi = h.hi;
    return m;
  }

  makeNull() {
    this.stack.push({ m: null, c: this.castle, ep: this.ep, half: this.half, lo: this.lo, hi: this.hi });
    if (this.ep >= 0) { this.lo ^= ZEL[this.ep]; this.hi ^= ZEH[this.ep]; }
    this.ep = -1; this.turn ^= 1; this.lo ^= ZSL; this.hi ^= ZSH;
  }

  san(m, legal) {
    legal = legal || this.moves();
    let s;
    if (m.fl & F_KS) s = 'O-O'; else if (m.fl & F_QS) s = 'O-O-O';
    else {
      const t = m.p & 7; s = '';
      if (t !== 1) {
        s = PCH[t].toUpperCase();
        const others = legal.filter(o => o.p === m.p && o.to === m.to && o.from !== m.from);
        if (others.length) {
          if (!others.some(o => (o.from & 7) === (m.from & 7))) s += sqName(m.from)[0];
          else if (!others.some(o => (o.from >> 4) === (m.from >> 4))) s += sqName(m.from)[1];
          else s += sqName(m.from);
        }
      }
      if (m.cap) { if (t === 1) s += sqName(m.from)[0]; s += 'x'; }
      s += sqName(m.to);
      if (m.promo) s += '=' + PCH[m.promo].toUpperCase();
    }
    this.make(m);
    if (this.inCheck()) s += this.moves().length ? '+' : '#';
    this.undo();
    return s;
  }

  moveFromSan(str) {
    const norm = x => x.replace(/[+#!?=]/g, '').replace(/^0-0-0$/, 'O-O-O').replace(/^0-0$/, 'O-O');
    const legal = this.moves(), want = norm(str);
    return legal.find(m => norm(this.san(m, legal)) === want) || null;
  }

  moveFromUci(u) {
    const from = sqIdx(u.slice(0, 2)), to = sqIdx(u.slice(2, 4)), pr = u[4] ? PCH.indexOf(u[4]) : 0;
    return this.moves().find(m => m.from === from && m.to === to && (m.promo || 0) === pr) || null;
  }

  playSan(list) {
    for (const s of (typeof list === 'string' ? list.trim().split(/\s+/) : list)) {
      if (!s) continue;
      const m = this.moveFromSan(s); if (!m) throw new Error('Illegal SAN ' + s + ' in ' + this.fen());
      this.make(m);
    }
    return this;
  }

  repetitions() {
    let n = 1;
    for (let i = this.stack.length - 1; i >= 0; i--) { const h = this.stack[i]; if (h.lo === this.lo && h.hi === this.hi) n++; }
    return n;
  }

  insufficient() {
    let minors = 0;
    for (let s = 0; s < 120; s++) {
      if (s & 0x88) continue; const t = this.b[s] & 7;
      if (t === 1 || t === 4 || t === 5) return false;
      if (t === 2 || t === 3) minors++;
    }
    return minors <= 1;
  }

  // null while the game continues
  status() {
    if (!this.moves().length) return this.inCheck() ? 'checkmate' : 'stalemate';
    if (this.half >= 100) return 'fifty';
    if (this.insufficient()) return 'material';
    if (this.repetitions() >= 3) return 'repetition';
    return null;
  }

  perft(d) {
    if (!d) return 1;
    let n = 0; const us = this.turn;
    for (const m of this.gen()) {
      this.make(m);
      if (!this.attacked(this.king[us], us ^ 1)) n += this.perft(d - 1);
      this.undo();
    }
    return n;
  }
}
