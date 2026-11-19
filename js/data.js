// Opponents, environment themes, board sets, opening book.

export const CHARACTERS = [
  { id: 'pip', name: 'Pip', title: 'The Pawnling', rating: 400, glyph: '♟', hue: 140,
    bio: 'Brand new to the game and delighted by everything. Moves fast, forgets to look.',
    skills: ['Leaves pieces hanging', 'Loves early queen adventures', 'Misses simple threats'],
    lesson: 'Practise the basics: take free pieces and keep yours protected.',
    depth: 1, time: 300, blunder: 0.35, noise: 120, margin: 300, style: { queen: 30, push: 20 }, book: [],
    say: { start: 'Ooh, a game! Which way do the horsies go again?', capture: 'Yoink! Is that allowed?', check: 'Check! I think?', lose: 'Wow, you are really good!', win: 'Wait… I won?!', think: 'Hmm hmm hmm…', blunder: 'Ooh, shiny piece for me!' } },
  { id: 'brutus', name: 'Brutus Ironfist', title: 'The Berserker', rating: 700, glyph: '♜', hue: 8,
    bio: 'Attacks first, thinks later. Every capture and every check gets played.',
    skills: ['Grabs every capture', 'Checks whenever possible', 'Ignores defence and development'],
    lesson: 'Stay calm under fire. Defend accurately and punish over-extension.',
    depth: 2, time: 500, blunder: 0.12, noise: 60, margin: 150, style: { capture: 70, check: 80, hunt: 12 }, book: ['King\'s Gambit', 'Vienna Game', 'Scandinavian Defence'],
    say: { start: 'I will smash your king. Begin!', capture: 'CRUSHED!', check: 'CHECK! Run, little king!', lose: 'Grr… you defended well.', win: 'BRUTUS SMASH. As foretold.', think: '*cracks knuckles*', blunder: 'You gave me a gift!' } },
  { id: 'mira', name: 'Sage Mira', title: 'The Fortress', rating: 1000, glyph: '♝', hue: 190,
    bio: 'Patient and solid. Castles early, develops everything, waits for your mistake.',
    skills: ['Always castles', 'Sound development', 'Rarely attacks first'],
    lesson: 'Learn to build a plan: solid opponents do not beat themselves.',
    depth: 3, time: 800, blunder: 0.05, noise: 35, margin: 80, style: { castle: 60, develop: 25, center: 10 }, book: ['Italian Game', 'London System', 'Caro-Kann Defence', 'Queen\'s Gambit Declined'],
    say: { start: 'Breathe. Develop. Castle. Shall we?', capture: 'A fair exchange.', check: 'Mind your king.', lose: 'Well played. You earned that.', win: 'Patience wins games.', think: 'Let me consider…', blunder: 'That piece was undefended.' } },
  { id: 'viktor', name: 'Viktor Vex', title: 'The Trickster', rating: 1300, glyph: '♞', hue: 285,
    bio: 'A tactician who lives for forks, pins and traps. One loose piece and he pounces.',
    skills: ['Sharp tactics', 'Sets opening traps', 'Punishes loose pieces'],
    lesson: 'Sharpen your tactics. Check every move for forks and pins.',
    depth: 3, time: 1200, blunder: 0.02, noise: 25, margin: 60, style: { check: 30, hunt: 8, center: 10 }, book: ['Two Knights Defence', 'Sicilian Dragon', 'Scotch Game', 'King\'s Indian Defence'],
    say: { start: 'Careful… every square is a trap.', capture: 'Did you not see that?', check: 'Check. And there is more coming.', lose: 'You saw through my tricks!', win: 'Tactics flow from a superior position. Mine.', think: 'Now, where is the trick…', blunder: 'Loose pieces drop off!' } },
  { id: 'evelyne', name: 'Lady Evelyne', title: 'The Endgame Empress', rating: 1550, glyph: '♛', hue: 325,
    bio: 'Trades pieces with a smile and then outplays you in the ending.',
    skills: ['Simplifies when ahead', 'Precise endgames', 'Pushes passed pawns'],
    lesson: 'Master endgames: king activity, opposition and passed pawns.',
    depth: 4, time: 1500, blunder: 0, noise: 15, margin: 40, style: { trade: 35, push: 6 }, book: ['Ruy Lopez', 'Queen\'s Gambit Declined', 'French Defence', 'Slav Defence'],
    say: { start: 'Shall we skip to the endgame, darling?', capture: 'One fewer piece. Lovely.', check: 'Check, dear.', lose: 'Exquisite technique. Brava.', win: 'The endgame never lies.', think: 'Hmm, what to trade next…', blunder: 'Oh dear. That was careless.' } },
  { id: 'kasim', name: 'Professor Kasim', title: 'The Strategist', rating: 1800, glyph: '♚', hue: 42,
    bio: 'Positional mastermind. Squeezes small advantages until your position collapses.',
    skills: ['Deep calculation', 'Controls the centre', 'Almost never blunders'],
    lesson: 'Play with a plan: improve your worst piece and create weaknesses.',
    depth: 5, time: 2200, blunder: 0, noise: 8, margin: 20, style: { center: 6, develop: 10 }, book: ['Ruy Lopez', 'Queen\'s Gambit Declined', 'Nimzo-Indian Defence', 'Sicilian Najdorf', 'English Opening'],
    say: { start: 'Every move must have a purpose. Show me yours.', capture: 'As calculated.', check: 'Check.', lose: 'Remarkable. You have studied well.', win: 'Small advantages, accumulated.', think: 'Calculating variations…', blunder: 'A positional error becomes a tactical one.' } },
  { id: 'oracle', name: 'ORACLE', title: 'The Machine', rating: 2050, glyph: '◈', hue: 210,
    bio: 'The full engine with no handicaps. Cold, fast, merciless.',
    skills: ['Maximum search depth', 'No mistakes on purpose', 'Sees every short tactic'],
    lesson: 'The final exam of this academy. Survive the opening, avoid every tactic.',
    depth: 8, time: 3500, blunder: 0, noise: 0, margin: 0, style: {}, book: null,
    say: { start: 'INITIALISING. Your move, human.', capture: 'MATERIAL ACQUIRED.', check: 'CHECK.', lose: 'UNEXPECTED RESULT. Recalibrating.', win: 'OUTCOME AS PREDICTED.', think: 'COMPUTING…', blunder: 'ERROR DETECTED IN HUMAN PLAY.' } },
];

export const ENVS = [
  { id: 'aurora', name: 'Midnight Aurora', a: '#7aa2ff', b: '#a78bfa', bg: '#05070f', bg2: '#0c1230' },
  { id: 'ember', name: 'Crimson Ember', a: '#ff6b5e', b: '#ffa94d', bg: '#0b0506', bg2: '#2a0d0f' },
  { id: 'cyber', name: 'Cyber Neon', a: '#00e5ff', b: '#ff2bd6', bg: '#04040c', bg2: '#150a2e' },
  { id: 'abyss', name: 'Emerald Abyss', a: '#34d399', b: '#22d3ee', bg: '#030a09', bg2: '#06241f' },
  { id: 'royal', name: 'Royal Gold', a: '#f5c451', b: '#f59e0b', bg: '#090705', bg2: '#261a08' },
  { id: 'arctic', name: 'Arctic Glass', a: '#bfe3ff', b: '#7dd3fc', bg: '#060a10', bg2: '#12202e' },
];

// piece/board materials: [color, roughness, metalness, transmission, emissive]
export const BOARDS = [
  { id: 'obsidian', name: 'Obsidian Glass', light: '#a9bde0', dark: '#1a2238', frame: '#0b0f1a', sq: [0.12, 0.1],
    w: ['#e6eeff', 0.12, 0, 0.55, null], k: ['#232a44', 0.1, 0.3, 0.25, null] },
  { id: 'walnut', name: 'Grand Walnut', light: '#e0c08f', dark: '#7a4a2b', frame: '#3b2414', sq: [0.55, 0],
    w: ['#f3e8d2', 0.4, 0, 0, null], k: ['#2b1b12', 0.35, 0.05, 0, null] },
  { id: 'marble', name: 'Carrara Marble', light: '#eceef2', dark: '#667085', frame: '#22262e', sq: [0.2, 0.05],
    w: ['#ffffff', 0.18, 0, 0, null], k: ['#14161b', 0.15, 0.2, 0, null] },
  { id: 'neon', name: 'Neon Grid', light: '#1b2550', dark: '#080b1c', frame: '#04050d', sq: [0.3, 0.4],
    w: ['#0ff0ff', 0.3, 0.2, 0, '#00b7c7'], k: ['#ff2bd6', 0.3, 0.2, 0, '#b3138f'] },
  { id: 'emerald', name: 'Emerald Tournament', light: '#eeeed2', dark: '#3d8b5a', frame: '#1c3325', sq: [0.6, 0],
    w: ['#f7f7f2', 0.5, 0, 0, null], k: ['#26282b', 0.45, 0, 0, null] },
  { id: 'aurum', name: 'Aurum & Steel', light: '#cdb887', dark: '#2d2f38', frame: '#15161b', sq: [0.3, 0.6],
    w: ['#f0c75e', 0.22, 1, 0, null], k: ['#6b7486', 0.25, 1, 0, null] },
];

// [name, SAN line]. Used for the opponents' opening book and to name the opening being played.
export const OPENINGS = [
  ['Italian Game', 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O'],
  ['Two Knights Defence', 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O'],
  ['Ruy Lopez', 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O'],
  ['Scotch Game', 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nc3 Bb4'],
  ['Petrov Defence', 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5'],
  ['King\'s Gambit', 'e4 e5 f4 exf4 Nf3 g5'],
  ['Vienna Game', 'e4 e5 Nc3 Nf6 f4 d5'],
  ['Sicilian Najdorf', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6'],
  ['Sicilian Dragon', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6'],
  ['Sicilian Sveshnikov', 'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5'],
  ['Sicilian Alapin', 'e4 c5 c3 Nf6 e5 Nd5 d4 cxd4'],
  ['French Defence', 'e4 e6 d4 d5 Nc3 Nf6 Bg5 Be7 e5 Nfd7'],
  ['French Advance', 'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6'],
  ['Caro-Kann Defence', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6'],
  ['Caro-Kann Advance', 'e4 c6 d4 d5 e5 Bf5 Nf3 e6'],
  ['Scandinavian Defence', 'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6'],
  ['Pirc Defence', 'e4 d6 d4 Nf6 Nc3 g6'],
  ['Alekhine Defence', 'e4 Nf6 e5 Nd5 d4 d6'],
  ['Queen\'s Gambit Declined', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3'],
  ['Queen\'s Gambit Accepted', 'd4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5'],
  ['Slav Defence', 'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5'],
  ['London System', 'd4 d5 Nf3 Nf6 Bf4 e6 e3 c5 c3 Nc6'],
  ['King\'s Indian Defence', 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5'],
  ['Nimzo-Indian Defence', 'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O'],
  ['Grünfeld Defence', 'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7'],
  ['Dutch Defence', 'd4 f5 g3 Nf6 Bg2 e6'],
  ['English Opening', 'c4 e5 Nc3 Nf6 g3 d5 cxd5 Nxd5'],
  ['Réti Opening', 'Nf3 d5 c4 e6 g3 Nf6'],
];

const NAMES = [
  ['e4', 'King\'s Pawn Opening'], ['d4', 'Queen\'s Pawn Opening'], ['e4 e5', 'Open Game'], ['e4 c5', 'Sicilian Defence'],
  ['e4 e6', 'French Defence'], ['e4 c6', 'Caro-Kann Defence'], ['e4 d5', 'Scandinavian Defence'], ['d4 d5 c4', 'Queen\'s Gambit'],
  ['d4 Nf6', 'Indian Defence'], ['c4', 'English Opening'], ['Nf3', 'Réti Opening'], ['e4 e5 Nf3 Nc6 Bb5', 'Ruy Lopez'],
  ['e4 e5 Nf3 Nc6 Bc4', 'Italian Game'], ['e4 e5 Nf3 Nc6 d4', 'Scotch Game'], ['e4 e5 Nf3 Nf6', 'Petrov Defence'],
  ['e4 e5 f4', 'King\'s Gambit'], ['e4 e5 Qh5', 'Wayward Queen Attack'], ['d4 d5 Nf3 Nf6 Bf4', 'London System'], ['d4 d5 Bf4', 'London System'],
  ['d4 d5 c4 e6', 'Queen\'s Gambit Declined'], ['d4 d5 c4 dxc4', 'Queen\'s Gambit Accepted'], ['d4 d5 c4 c6', 'Slav Defence'],
  ['d4 Nf6 c4 g6', 'King\'s Indian Defence'], ['d4 Nf6 c4 e6 Nc3 Bb4', 'Nimzo-Indian Defence'], ['d4 f5', 'Dutch Defence'],
  ...OPENINGS.map(([n, l]) => [l.split(' ').slice(0, 10).join(' '), n]),
].sort((x, y) => y[0].length - x[0].length);

export function openingName(sans) {
  const h = sans.join(' ') + ' ';
  for (const [p, n] of NAMES) if (h.startsWith(p + ' ')) return n;
  return null;
}

// next book move (SAN) for a character, or null
export function bookMove(sans, ch) {
  if (ch.book && !ch.book.length) return null;
  const h = sans.join(' ');
  const fits = OPENINGS.filter(([, l]) => (h === '' || l.startsWith(h + ' ')) && l.length > h.length);
  if (!fits.length) return null;
  const pref = ch.book ? fits.filter(([n]) => ch.book.includes(n)) : fits;
  const pool = pref.length ? pref : (sans.length < 2 ? fits : []);
  if (!pool.length) return null;
  const line = pool[Math.floor(Math.random() * pool.length)][1].split(' ');
  return line[sans.length] || null;
}
