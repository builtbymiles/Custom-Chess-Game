// 3D board: procedural pieces, themes, highlights, arrows, move animation, picking.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { F_EP, F_KS, F_QS, sqIdx } from './engine.js';

const V2 = (x, y) => new THREE.Vector2(x, y);
const arc = (cy, rx, ry, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return V2(Math.max(0, rx * Math.cos(a)), cy + ry * Math.sin(a)); });
const base = r => [V2(0, 0), V2(r, 0), V2(r, 0.05), V2(r * 0.92, 0.09), V2(r * 0.76, 0.12), V2(r * 0.6, 0.17)];
const lathe = pts => new THREE.LatheGeometry(pts, 36);

function buildGeoms() {
  const g = {};
  g[1] = [lathe([...base(0.3), V2(0.11, 0.38), V2(0.19, 0.42), V2(0.19, 0.45), V2(0.1, 0.48), ...arc(0.62, 0.16, 0.16, -1.0, Math.PI / 2)])];
  g[4] = [lathe([...base(0.33), V2(0.2, 0.25), V2(0.18, 0.6), V2(0.26, 0.65), V2(0.26, 0.84), V2(0.19, 0.84), V2(0.19, 0.74), V2(0, 0.74)])];
  const ball = (r, y) => new THREE.SphereGeometry(r, 16, 12).translate(0, y, 0);
  g[3] = [lathe([...base(0.32), V2(0.12, 0.5), V2(0.2, 0.55), V2(0.2, 0.59), V2(0.11, 0.62), ...arc(0.82, 0.16, 0.22, -1.1, Math.PI / 2)]), ball(0.05, 1.07)];
  g[5] = [lathe([...base(0.35), V2(0.13, 0.72), V2(0.22, 0.77), V2(0.22, 0.81), V2(0.13, 0.85), V2(0.25, 1.1), V2(0.19, 1.1), V2(0.1, 1.02), V2(0, 1.02)]), ball(0.08, 1.1)];
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g[5].push(new THREE.SphereGeometry(0.045, 10, 8).translate(Math.cos(a) * 0.22, 1.13, Math.sin(a) * 0.22)); }
  g[6] = [lathe([...base(0.36), V2(0.14, 0.8), V2(0.23, 0.85), V2(0.23, 0.89), V2(0.14, 0.93), V2(0.25, 1.15), V2(0.2, 1.2), V2(0, 1.2)]),
    new THREE.BoxGeometry(0.07, 0.3, 0.07).translate(0, 1.34, 0), new THREE.BoxGeometry(0.22, 0.07, 0.07).translate(0, 1.37, 0)];
  const s = new THREE.Shape();
  s.moveTo(-0.2, 0.16); s.lineTo(0.22, 0.16); s.lineTo(0.2, 0.32); s.quadraticCurveTo(0.06, 0.42, 0.1, 0.54);
  s.lineTo(0.3, 0.48); s.lineTo(0.36, 0.58); s.quadraticCurveTo(0.3, 0.74, 0.16, 0.82); s.lineTo(0.12, 0.94); s.lineTo(0.03, 0.84);
  s.quadraticCurveTo(-0.2, 0.78, -0.24, 0.5); s.lineTo(-0.2, 0.16);
  const head = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 3, curveSegments: 10 }).translate(0, 0, -0.1);
  g[2] = [lathe([...base(0.33), V2(0.24, 0.2), V2(0, 0.22)]), head];
  return g;
}

const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export class Scene3D {
  constructor(el) {
    this.el = el;
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    el.appendChild(r.domElement);
    const sc = this.scene = new THREE.Scene();
    sc.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 300);
    this.camera.position.set(0, 12, 13);
    const c = this.controls = new OrbitControls(this.camera, r.domElement);
    c.enablePan = false; c.enableDamping = true; c.dampingFactor = 0.08; c.minDistance = 8; c.maxDistance = 32;
    c.maxPolarAngle = 1.42; c.target.set(0, 0, 0);
    this.inset = { l: 0, r: 0, t: 0, b: 0 };

    sc.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.5));
    const key = this.key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(5, 12, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 }); key.shadow.bias = -0.0004; key.shadow.radius = 4;
    sc.add(key);
    this.rimA = new THREE.PointLight(0xffffff, 90, 50); this.rimA.position.set(-12, 6, -9); sc.add(this.rimA);
    this.rimB = new THREE.PointLight(0xffffff, 90, 50); this.rimB.position.set(12, 6, -9); sc.add(this.rimB);

    // stars + floor glow
    const n = 900, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, rad = 45 + Math.random() * 50, q = Math.sqrt(1 - u * u);
      pos[i * 3] = rad * q * Math.cos(a); pos[i * 3 + 1] = rad * u * 0.8 + 6; pos[i * 3 + 2] = rad * q * Math.sin(a);
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.35, transparent: true, opacity: 0.8, sizeAttenuation: true, depthWrite: false }));
    sc.add(this.stars);
    const gc = document.createElement('canvas'); gc.width = gc.height = 256;
    const gx = gc.getContext('2d'), gr = gx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(0.45, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    gx.fillStyle = gr; gx.fillRect(0, 0, 256, 256);
    this.glow = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.glow.rotation.x = -Math.PI / 2; this.glow.position.y = -0.6; sc.add(this.glow);

    this.boardG = new THREE.Group(); this.pieceG = new THREE.Group(); this.hlG = new THREE.Group(); this.arG = new THREE.Group();
    sc.add(this.boardG, this.hlG, this.arG, this.pieceG);
    this.geoms = buildGeoms(); this.meshes = new Map(); this.tweens = []; this.accent = new THREE.Color('#7aa2ff'); this.accent2 = new THREE.Color('#a78bfa');
    this.pickPlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    this.pickPlane.rotation.x = -Math.PI / 2; sc.add(this.pickPlane);
    this.ray = new THREE.Raycaster(); this.onSquare = null;

    let down = null;
    const dom = r.domElement;
    dom.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
    dom.addEventListener('pointerup', e => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
      const sq = this.pick(e.clientX, e.clientY); if (sq != null && this.onSquare) this.onSquare(sq);
    });
    dom.addEventListener('pointermove', e => { if (e.buttons) return; dom.style.cursor = this.pick(e.clientX, e.clientY) != null ? 'pointer' : 'grab'; });
    addEventListener('resize', () => this.resize());
    this.resize();
    const loop = () => { requestAnimationFrame(loop); this.frame(); };
    loop();
  }

  pick(x, y) {
    const rc = this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(V2((x - rc.left) / rc.width * 2 - 1, -(y - rc.top) / rc.height * 2 + 1), this.camera);
    const hit = this.ray.intersectObjects([this.pieceG, this.pickPlane], true)[0];
    if (!hit) return null;
    let o = hit.object;
    while (o && o.userData.sq == null) o = o.parent;
    if (o) return o.userData.sq;
    const f = Math.floor(hit.point.x + 4), rk = Math.floor(4 - hit.point.z);
    return f < 0 || f > 7 || rk < 0 || rk > 7 ? null : rk * 16 + f;
  }

  setInset(i) { Object.assign(this.inset, i); this.resize(); }

  resize() {
    const w = this.el.clientWidth || innerWidth, h = this.el.clientHeight || innerHeight, i = this.inset;
    this.renderer.setSize(w, h);
    const cam = this.camera; cam.aspect = w / h;
    // keep the board fully visible in the free area between the panels
    const fw = Math.max(200, w - i.l - i.r), fh = Math.max(200, h - i.t - i.b);
    cam.zoom = Math.min(1.05, fw / (1.02 * h), fh / (0.8 * h));
    cam.setViewOffset(w, h, (i.r - i.l) / 2, (i.b - i.t) / 2, w, h);
    cam.updateProjectionMatrix();
  }

  tween(ms, fn) {
    return new Promise(res => this.tweens.push({ t0: performance.now(), ms, fn, res }));
  }

  frame() {
    const now = performance.now();
    this.tweens = this.tweens.filter(t => {
      const k = Math.min(1, (now - t.t0) / t.ms); t.fn(ease(k), k);
      if (k >= 1) { t.res(); return false; } return true;
    });
    this.stars.rotation.y += 0.00012;
    for (const m of this.hlG.children) if (m.userData.pulse) m.material.opacity = m.userData.pulse * (0.75 + 0.25 * Math.sin(now / 260));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // ── themes
  setEnv(env) {
    this.accent.set(env.a); this.accent2.set(env.b);
    this.rimA.color.set(env.a); this.rimB.color.set(env.b);
    this.stars.material.color.set(env.a).lerp(new THREE.Color('#ffffff'), 0.5);
    this.glow.material.color.set(env.a).lerp(new THREE.Color(env.b), 0.4);
    if (this.hlState) this.highlight(this.hlState);
  }

  mat([color, rough, metal, trans, emis]) {
    const m = new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: metal, clearcoat: 0.6, clearcoatRoughness: 0.2, envMapIntensity: 1.1 });
    if (trans) { m.transmission = trans; m.thickness = 0.6; m.ior = 1.45; m.attenuationColor = new THREE.Color(color); m.attenuationDistance = 1.2; }
    if (emis) { m.emissive = new THREE.Color(emis); m.emissiveIntensity = 0.9; }
    return m;
  }

  setBoard(bt) {
    this.bt = bt;
    this.mats = [this.mat(bt.w), this.mat(bt.k)];
    for (const g of this.meshes.values()) g.children.forEach(ch => { ch.material = this.mats[g.userData.piece >> 3]; });
    const G = this.boardG; G.clear();
    const [rough, metal] = bt.sq;
    const ml = new THREE.MeshPhysicalMaterial({ color: bt.light, roughness: Math.max(rough, 0.3), metalness: metal, clearcoat: 0.25, clearcoatRoughness: 0.45, envMapIntensity: 0.35 });
    const md = new THREE.MeshPhysicalMaterial({ color: bt.dark, roughness: Math.max(rough, 0.3), metalness: metal, clearcoat: 0.25, clearcoatRoughness: 0.45, envMapIntensity: 0.35 });
    if (bt.id === 'neon') { md.emissive = new THREE.Color('#1a1050'); ml.emissive = new THREE.Color('#2a3a9a'); ml.emissiveIntensity = md.emissiveIntensity = 0.5; }
    const tile = new THREE.BoxGeometry(0.985, 0.12, 0.985);
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
      const t = new THREE.Mesh(tile, (r + f) % 2 ? ml : md); t.position.set(f - 3.5, -0.06, 3.5 - r); t.receiveShadow = true; G.add(t);
    }
    const under = new THREE.Mesh(new THREE.BoxGeometry(8.02, 0.1, 8.02), new THREE.MeshBasicMaterial({ color: bt.id === 'neon' ? '#5ad1ff' : '#000000' }));
    under.position.y = -0.08; G.add(under);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(9.3, 0.34, 9.3), new THREE.MeshPhysicalMaterial({ color: bt.frame, roughness: 0.5, metalness: 0.3, clearcoat: 0.3, envMapIntensity: 0.3 }));
    frame.position.y = -0.19; frame.receiveShadow = true; G.add(frame);
    const cv = document.createElement('canvas'); cv.width = cv.height = 1024;
    const x = cv.getContext('2d'), u = 1024 / 9.3, m = 0.65;
    x.fillStyle = 'rgba(255,255,255,.62)'; x.font = '600 30px -apple-system,Segoe UI,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const put = (txt, cx, cy, flip) => { x.save(); x.translate(cx, cy); if (flip) x.rotate(Math.PI); x.fillText(txt, 0, 0); x.restore(); };
    for (let i = 0; i < 8; i++) {
      put('abcdefgh'[i], (m + i + 0.5) * u, (m + 8 + 0.33) * u); put('abcdefgh'[i], (m + i + 0.5) * u, (m - 0.33) * u, true);
      put(8 - i, (m - 0.33) * u, (m + i + 0.5) * u); put(8 - i, (m + 8 + 0.33) * u, (m + i + 0.5) * u, true);
    }
    const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 8;
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(9.3, 9.3), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    lab.rotation.x = -Math.PI / 2; lab.position.y = -0.018; G.add(lab);
  }

  // ── pieces
  pos(sq) { return new THREE.Vector3((sq & 7) - 3.5, 0, 3.5 - (sq >> 4)); }

  makePiece(p, sq) {
    const g = new THREE.Group(), m = this.mats[p >> 3];
    for (const geo of this.geoms[p & 7]) { const me = new THREE.Mesh(geo, m); me.castShadow = true; g.add(me); }
    if ((p & 7) === 2) g.rotation.y = (p >> 3) ? -Math.PI / 2 + 0.9 : Math.PI / 2 + 0.9;
    g.userData = { piece: p, sq }; g.position.copy(this.pos(sq));
    this.pieceG.add(g); this.meshes.set(sq, g);
    return g;
  }

  // make meshes match the position exactly
  sync(chess, animateIn = false) {
    for (const [sq, g] of [...this.meshes]) if (chess.b[sq] !== g.userData.piece) { this.pieceG.remove(g); this.meshes.delete(sq); }
    for (let s = 0; s < 120; s++) {
      if (s & 0x88 || !chess.b[s] || this.meshes.has(s)) continue;
      const g = this.makePiece(chess.b[s], s);
      if (animateIn) { g.scale.setScalar(0.01); this.tween(380 + Math.random() * 200, t => g.scale.setScalar(Math.max(0.01, t))); }
    }
  }

  async animateMove(m, chess, fast = false) {
    const g = this.meshes.get(m.from), ms = fast ? 160 : 330;
    if (!g) { this.sync(chess); return; }
    const capSq = m.fl & F_EP ? m.to + ((m.p >> 3) ? 16 : -16) : m.to, victim = m.cap ? this.meshes.get(capSq) : null;
    if (victim) {
      this.meshes.delete(capSq);
      this.tween(ms, t => { victim.scale.setScalar(Math.max(0.01, 1 - t)); victim.position.y = t * 0.6; }).then(() => this.pieceG.remove(victim));
    }
    const slide = (mesh, from, to, hop) => {
      const a = this.pos(from), b = this.pos(to);
      this.meshes.delete(from); this.meshes.set(to, mesh); mesh.userData.sq = to;
      return this.tween(ms, t => { mesh.position.lerpVectors(a, b, t); mesh.position.y = Math.sin(t * Math.PI) * hop; });
    };
    const jobs = [slide(g, m.from, m.to, (m.p & 7) === 2 ? 0.9 : 0.22)];
    if (m.fl & F_KS) jobs.push(slide(this.meshes.get(m.to + 1), m.to + 1, m.to - 1, 0.5));
    if (m.fl & F_QS) jobs.push(slide(this.meshes.get(m.to - 2), m.to - 2, m.to + 1, 0.5));
    await Promise.all(jobs);
    this.sync(chess);
  }

  // ── camera
  orient(color, instant = false) {
    this.side = color;
    const cam = this.camera, a0 = Math.atan2(cam.position.x, cam.position.z), a1 = color ? Math.PI : 0;
    let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const y0 = cam.position.y, rad0 = Math.hypot(cam.position.x, cam.position.z);
    const set = t => { const a = a0 + d * t, rad = rad0 + (13 - rad0) * t; cam.position.set(Math.sin(a) * rad, y0 + (12 - y0) * t, Math.cos(a) * rad); };
    if (instant) set(1); else return this.tween(900, set);
  }

  view(name) {
    const cam = this.camera, s = this.side ? -1 : 1, from = cam.position.clone();
    const to = name === 'top' ? new THREE.Vector3(0, 19, 0.01 * s) : name === 'low' ? new THREE.Vector3(0, 5.5, 17 * s) : name === 'side' ? new THREE.Vector3(14 * s, 9, 7 * s) : new THREE.Vector3(0, 12, 13 * s);
    return this.tween(800, t => cam.position.lerpVectors(from, to, t));
  }

  // ── highlights & arrows
  highlight(st) {
    this.hlState = st; const G = this.hlG; G.clear();
    const flat = (sq, color, op, geo, pulse) => {
      const me = new THREE.Mesh(geo || new THREE.PlaneGeometry(0.985, 0.985), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false }));
      me.rotation.x = -Math.PI / 2; me.position.copy(this.pos(sq)); me.position.y = geo ? 0.012 : 0.006; if (pulse) me.userData.pulse = op; G.add(me);
    };
    for (const s of st.last || []) flat(s, '#ffd166', 0.3);
    for (const s of st.marks || []) flat(s, this.accent2, 0.42, null, true);
    for (const s of st.danger || []) flat(s, '#ff4d6d', 0.38, null, true);
    if (st.check != null) flat(st.check, '#ff2e4d', 0.6, null, true);
    if (st.selected != null) flat(st.selected, this.accent, 0.55);
    for (const m of st.moves || []) flat(m.to, this.accent, 0.8, m.cap ? new THREE.RingGeometry(0.36, 0.47, 32) : new THREE.CircleGeometry(0.15, 24));
  }

  arrows(list) {
    const G = this.arG; G.clear();
    for (const [a, b, col] of list || []) {
      const p = this.pos(typeof a === 'string' ? sqIdx(a) : a), q = this.pos(typeof b === 'string' ? sqIdx(b) : b);
      const color = col === 'red' ? '#ff4d6d' : col === 'gold' ? '#ffd166' : this.accent;
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthTest: false });
      const d = q.clone().sub(p), len = d.length(), g = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.03, Math.max(0.1, len - 0.55)), mat); shaft.position.z = (len - 0.55) / 2 + 0.1;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 3), mat); tip.rotation.x = Math.PI / 2; tip.scale.z = 0.25; tip.position.z = len - 0.26;
      g.add(shaft, tip); g.position.copy(p); g.position.y = 0.05; g.rotation.y = Math.atan2(d.x, d.z); g.renderOrder = 5; G.add(g);
    }
  }
}
