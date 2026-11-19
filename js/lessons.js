// Academy curriculum. Each step: t (text), fen | san (moves from the start position),
// hl (highlighted squares), ar (arrows), task { accept:[SAN], mate:true, prompt }, ok (success text).
import { START } from './engine.js';

export const CHAPTERS = [
  { id: 'found', name: 'Foundations', skill: 'fundamentals', desc: 'The board, every piece, every rule.' },
  { id: 'open', name: 'Opening Mastery', skill: 'openings', desc: 'Principles first, then the great openings.' },
  { id: 'tact', name: 'Tactics', skill: 'tactics', desc: 'Forks, pins, skewers and the patterns that win games.' },
  { id: 'mate', name: 'Checkmating Technique', skill: 'endgames', desc: 'Convert a won game without stalemating.' },
  { id: 'strat', name: 'Strategy', skill: 'strategy', desc: 'Pawn structure, piece activity and planning.' },
  { id: 'end', name: 'Endgames', skill: 'endgames', desc: 'The positions every master knows by heart.' },
  { id: 'gm', name: 'Grandmaster Thinking', skill: 'calculation', desc: 'How strong players actually choose a move.' },
];

const L = (id, ch, title, steps) => ({ id, ch, title, steps });

export const LESSONS = [
  // ───────────── Foundations
  L('board', 0, 'The Board & Notation', [
    { fen: START, t: 'Chess is played on 64 squares. The columns are <b>files</b> (a–h) and the rows are <b>ranks</b> (1–8). Every square has a name: file letter + rank number. White always starts on ranks 1–2, Black on 7–8. A light square is always in each player\'s right-hand corner.' },
    { fen: START, hl: 'e4 d4 e5 d5', t: 'These four squares are the <b>centre</b>. Pieces placed in or aimed at the centre reach every part of the board quickly. Nearly all opening strategy is a fight for these squares.' },
    { fen: START, t: 'Moves are written with a piece letter and the destination square: <b>N</b>f3 (knight to f3), <b>B</b>c4, <b>R</b>, <b>Q</b>, <b>K</b>. Pawn moves have no letter: just <b>e4</b>. "x" means captures, "+" check, "#" checkmate, "O-O" castling.', task: { accept: ['e4'], prompt: 'Play the move <b>e4</b>: click the pawn on e2, then the e4 square.' }, ok: 'That is 1.e4, the most popular first move in chess history. You just claimed the centre and opened lines for your bishop and queen.' },
  ]),
  L('pawn', 0, 'The Pawn', [
    { fen: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1', ar: [['e2', 'e3'], ['e2', 'e4']], t: 'Pawns move <b>straight forward</b> one square. From its starting square a pawn may move two. Pawns never move backwards, so every pawn move is a permanent decision.' },
    { fen: '4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1', t: 'Pawns are the only piece that captures differently from how it moves: <b>one square diagonally forward</b>.', task: { accept: ['exd5'], prompt: 'Capture the black pawn.' }, ok: 'Correct. A pawn attacks the two squares diagonally in front of it.' },
    { fen: '4k3/8/8/4p3/4P3/8/8/4K3 w - - 0 1', hl: 'e4 e5', t: 'These two pawns are <b>blocked</b>. Neither can move forward and neither can capture the other. Locked pawn chains like this define the character of whole games.' },
  ]),
  L('knight', 0, 'The Knight', [
    { fen: '4k3/8/8/8/3N4/8/8/4K3 w - - 0 1', hl: 'b3 b5 c2 c6 e2 e6 f3 f5', t: 'The knight moves in an <b>L-shape</b>: two squares in one direction, then one to the side. From the centre it reaches 8 squares; from a corner only 2. "A knight on the rim is dim."' },
    { fen: '4k3/8/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1', t: 'The knight is the only piece that can <b>jump over</b> others. That is why knights are usually developed before bishops.', task: { accept: ['Nf3', 'Nc3', 'Na3', 'Nh3'], prompt: 'Jump a knight out over your pawns.' }, ok: 'Knights belong on f3 and c3 (f6 and c6 for Black), pointing at the centre.' },
    { fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1', t: 'Because of its odd move, a knight can attack two pieces at once without being attacked back. That is a <b>fork</b>.', task: { accept: ['Nc7+'], prompt: 'Find the knight move that attacks the king and the rook together.' }, ok: 'A royal fork! The king must move out of check and the rook falls.' },
  ]),
  L('bishop', 0, 'The Bishop', [
    { fen: '4k3/8/8/8/3B4/8/8/4K3 w - - 0 1', hl: 'a1 b2 c3 e5 f6 g7 h8 a7 b6 c5 e3 f2 g1', t: 'The bishop moves any distance <b>diagonally</b>. It can never change the colour of square it stands on, so you have one light-squared and one dark-squared bishop.' },
    { fen: '4k3/8/1r6/8/3B4/8/8/4K3 w - - 0 1', t: 'Bishops love long open diagonals.', task: { accept: ['Bxb6'], prompt: 'Capture the rook.' }, ok: 'A rook (5 points) for free. Long-range pieces punish undefended targets from across the board.' },
    { fen: '4k3/8/8/8/3B4/8/8/4K3 w - - 0 1', t: 'Two bishops together cover both colours. This <b>bishop pair</b> is a real advantage in open positions, worth roughly half a pawn. A bishop blocked by its own pawns is called a <b>bad bishop</b>.' },
  ]),
  L('rook', 0, 'The Rook', [
    { fen: '4k3/8/8/8/3R4/8/8/4K3 w - - 0 1', hl: 'd1 d2 d3 d5 d6 d7 d8 a4 b4 c4 e4 f4 g4 h4', t: 'The rook moves any distance along <b>files and ranks</b>. It always controls 14 squares on an empty board, wherever it stands. Rooks need <b>open files</b> (files with no pawns) to become active.' },
    { fen: '3qk3/8/8/8/3R4/8/8/4K3 w - - 0 1', t: 'Rooks are worth 5 points, a queen 9.', task: { accept: ['Rxd8+'], prompt: 'Win the queen.' }, ok: 'Even after the king recaptures, you gained 9 points for 5. Always count the value of what you take and what you lose.' },
  ]),
  L('queen', 0, 'The Queen', [
    { fen: '4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1', hl: 'd1 d2 d3 d5 d6 d7 d8 a4 b4 c4 e4 f4 g4 h4 a1 b2 c3 e5 f6 g7 h8 a7 b6 c5 e3 f2 g1', t: 'The queen combines rook and bishop: any distance in <b>any straight line</b>. She is the most powerful piece (9 points), which also makes her a target. Bring her out too early and the opponent develops pieces by attacking her.' },
    { fen: '6k1/5ppp/8/8/8/8/8/3Q2K1 w - - 0 1', t: 'The black king is trapped behind its own pawns.', task: { mate: true, prompt: 'Deliver checkmate in one move.' }, ok: 'Checkmate! The king is attacked and has no escape. This pattern is the <b>back-rank mate</b>.' },
  ]),
  L('king', 0, 'The King', [
    { fen: '4k3/8/8/8/3K4/8/8/8 w - - 0 1', hl: 'c3 d3 e3 c4 e4 c5 d5 e5', t: 'The king moves <b>one square in any direction</b>. He is slow but priceless: lose him and you lose the game. In the opening and middlegame, hide him. In the endgame he becomes a strong fighting piece.' },
    { fen: '4k3/8/8/8/8/8/r7/4K3 w - - 0 1', hl: 'd2 e2 f2', t: 'A king may <b>never move onto an attacked square</b>. The rook controls the whole second rank.', task: { accept: ['Kd1', 'Kf1'], prompt: 'Make a legal king move.' }, ok: 'Right. Those were the only legal squares. The two kings can also never stand next to each other.' },
  ]),
  L('check', 0, 'Check, Checkmate & Stalemate', [
    { fen: '4k3/8/8/8/8/8/8/4RK2 b - - 0 1', t: 'When the king is attacked it is in <b>check</b> and you must deal with it at once. There are only three ways: <b>move</b> the king, <b>block</b> the line, or <b>capture</b> the attacker.', task: { accept: ['Kd7', 'Kd8', 'Kf7', 'Kf8'], prompt: 'You are Black. Get out of check.' }, ok: 'Good. With nothing to block with or capture, moving was the only option.' },
    { fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', t: '<b>Checkmate</b>: the king is in check and none of the three escapes works. The game ends immediately.', task: { mate: true, prompt: 'Checkmate the black king.' }, ok: 'Rd8#. No king move, no block, no capture.' },
    { fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', hl: 'g8 g7 h7', t: '<b>Stalemate</b>: Black to move is NOT in check but has no legal move. The game is a <b>draw</b>. Throwing away a won game this way is the most common beginner disaster.' },
    { fen: '7k/8/4Q1K1/8/8/8/8/8 w - - 0 1', t: 'Careful now. One queen move here stalemates, two give mate.', task: { mate: true, prompt: 'Find a checkmate (not a stalemate!).' }, ok: 'Mate. Before every move in a winning endgame ask: "does my opponent still have a legal move?"' },
  ]),
  L('castle', 0, 'Castling', [
    { fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', ar: [['e1', 'g1'], ['h1', 'f1']], t: '<b>Castling</b> is the only move where two pieces move: the king slides two squares toward a rook and the rook hops over. It tucks the king away and activates the rook in one move.', task: { accept: ['O-O'], prompt: 'Castle kingside: move the king from e1 to g1.' }, ok: 'Castled short (O-O). Your king is safe behind three pawns.' },
    { fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', t: 'You can also castle on the queenside.', task: { accept: ['O-O-O'], prompt: 'Castle queenside: move the king from e1 to c1.' }, ok: 'Castled long (O-O-O). The rook lands on the central d-file.' },
    { fen: 'r3k2r/pppp1ppp/8/8/1b6/8/PPP2PPP/R3K2R w KQkq - 0 1', ar: [['b4', 'e1', 'red']], t: 'You may <b>not</b> castle if: the king or that rook has already moved, there are pieces in between, the king is <b>in check</b>, or the king would pass through or land on an attacked square.', task: { accept: ['c3'], prompt: 'You are in check so you cannot castle. Block the check with a pawn.' }, ok: 'Blocked, and the bishop must retreat. You can castle next move.' },
  ]),
  L('ep', 0, 'En Passant', [
    { fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', ar: [['e5', 'd6']], t: 'Black just played the pawn two squares, d7–d5, landing beside your pawn. For <b>one move only</b> you may capture it as if it had moved a single square. This is <b>en passant</b> ("in passing").', task: { accept: ['exd6'], prompt: 'Capture en passant: move the e5 pawn to d6.' }, ok: 'The black pawn on d5 disappears. If you do not take en passant immediately, the right is gone.' },
  ]),
  L('promo', 0, 'Promotion', [
    { fen: '8/4P1k1/8/8/8/8/8/4K3 w - - 0 1', t: 'A pawn reaching the last rank <b>promotes</b> to a queen, rook, bishop or knight of your choice. This is why a single extra pawn can decide a game.', task: { accept: ['e8=Q'], prompt: 'Push the pawn and choose a queen.' }, ok: 'A new queen. You can have as many queens as you can promote pawns.' },
    { fen: '8/3q1P1k/8/8/8/8/5PPP/6K1 w - - 0 1', t: 'Almost always you want a queen. But not always! Look for a promotion that gives check and attacks the queen.', task: { accept: ['f8=N+'], prompt: 'Find the winning underpromotion.' }, ok: 'A knight fork: check on h7 and the queen on d7 is lost. That is called <b>underpromotion</b>.' },
  ]),
  L('values', 0, 'Piece Values & Trades', [
    { fen: START, t: 'Rough values: <b>Pawn 1 · Knight 3 · Bishop 3 · Rook 5 · Queen 9</b>. The king is priceless. Use these numbers to judge every exchange: giving a knight (3) for a rook (5) "wins the exchange".' },
    { fen: '4k3/8/8/3r4/4B3/8/8/4K3 w - - 0 1', t: 'Count before you capture.', task: { accept: ['Bxd5'], prompt: 'Is there something free? Take it.' }, ok: '+5. Most games below master level are decided by pieces left undefended ("hanging"). Before every move, check what is attacked.' },
    { fen: START, t: 'Three trade rules: <b>1)</b> When ahead in material, trade pieces (not pawns) to simplify. <b>2)</b> When behind, avoid trades and keep things complicated. <b>3)</b> Trade your bad pieces for the opponent\'s good ones.' },
  ]),

  // ───────────── Openings
  L('rules', 1, 'The Three Golden Rules', [
    { san: 'e4', hl: 'd5 f5 e4', t: '<b>Rule 1: Control the centre.</b> A centre pawn claims space and opens lines for the bishop and queen. Start with 1.e4 or 1.d4.' },
    { san: 'e4 e5 Nf3 Nc6 Bc4', ar: [['c4', 'f7', 'red']], t: '<b>Rule 2: Develop your pieces.</b> Knights and bishops come out quickly, each to a good square, each moved once. Here every white move developed a piece AND did something: Nf3 attacked e5, Bc4 eyes f7, the weakest point in Black\'s camp.' },
    { san: 'e4 e5 Nf3 Nc6 Bc4 Bc5', t: '<b>Rule 3: Castle early.</b> Get the king out of the centre before the position opens.', task: { accept: ['O-O'], prompt: 'Castle.' }, ok: 'Four moves, three pieces developed, king safe. That is a model opening.' },
    { san: 'e4 e5 Nf3 Nc6 Bc4 Bc5 O-O', t: 'Avoid the classic errors: moving the same piece twice, bringing the queen out early, making lots of pawn moves, and grabbing pawns while behind in development. Finish by <b>connecting your rooks</b> (clearing the back rank between them).' },
  ]),
  L('italian', 1, 'The Italian Game', [
    { san: 'e4 e5 Nf3 Nc6', t: 'The Italian Game is the perfect first opening: natural, logical developing moves.', task: { accept: ['Bc4'], prompt: 'Develop the bishop to its most active diagonal.' }, ok: '3.Bc4. The bishop points at f7, which is defended only by the black king.' },
    { san: 'e4 e5 Nf3 Nc6 Bc4 Bc5', t: 'Black mirrors with 3…Bc5, the <b>Giuoco Piano</b> ("quiet game"). White\'s main plan is to build a big centre with c3 followed by d4.', task: { accept: ['c3'], prompt: 'Prepare the d4 push.' }, ok: '4.c3 supports d4. After …Nf6 White often plays the slower d3, castles, and manoeuvres.' },
    { san: 'e4 e5 Nf3 Nc6 Bc4 Nf6', ar: [['f3', 'g5'], ['c4', 'f7', 'red']], t: 'If Black plays 3…Nf6 instead (the <b>Two Knights</b>), White can go straight for f7 with 4.Ng5. Black must know the answer 4…d5! Know the ideas behind your opening, not just the moves.' },
  ]),
  L('ruy', 1, 'The Ruy Lopez', [
    { san: 'e4 e5 Nf3 Nc6', t: 'The Ruy Lopez (Spanish) is the opening of world champions. Instead of f7, White puts pressure on the knight that defends e5.', task: { accept: ['Bb5'], prompt: 'Play the Spanish bishop move.' }, ok: '3.Bb5. A long-term pressure opening.' },
    { san: 'e4 e5 Nf3 Nc6 Bb5 a6', t: 'Black asks the bishop a question with 3…a6. Taking on c6 and then e5 does not win a pawn: after Bxc6 dxc6 Nxe5 Black plays …Qd4! and regains it.', task: { accept: ['Ba4'], prompt: 'Keep the bishop and retreat.' }, ok: '4.Ba4 keeps the pressure.' },
    { san: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O', hl: 'd4 c3', t: 'The main line. White has castled, protected e4 with the rook, kept the bishop on the a2–g8 diagonal, and is ready for <b>h3 and d4</b>. Rich manoeuvring positions arise that reward understanding over memorisation.' },
  ]),
  L('sicilian', 1, 'The Sicilian Defence', [
    { san: 'e4 c5', hl: 'd4', t: '1…c5 is the most popular and highest-scoring reply to 1.e4. Black fights for d4 with a flank pawn, creating an <b>unbalanced</b> game: White gets development and space, Black gets an extra centre pawn.' },
    { san: 'e4 c5 Nf3 d6', t: 'The Open Sicilian.', task: { accept: ['d4'], prompt: 'Open the centre.' }, ok: 'After 3…cxd4 4.Nxd4 White has active pieces; Black has the half-open c-file and two centre pawns against one.' },
    { san: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6', hl: 'a6 b5', t: 'The <b>Najdorf</b>, favourite of Fischer and Kasparov. The modest …a6 stops pieces landing on b5 and prepares …b5 and …e5. Typical plans: White attacks on the kingside, Black counterattacks on the queenside and down the c-file.' },
  ]),
  L('qg', 1, 'The Queen\'s Gambit', [
    { san: 'd4 d5', t: '1.d4 games are usually slower and more strategic than 1.e4 games.', task: { accept: ['c4'], prompt: 'Offer the Queen\'s Gambit.' }, ok: '2.c4 attacks d5. White wants to trade a flank pawn for Black\'s centre pawn.' },
    { san: 'd4 d5 c4 dxc4', t: 'If Black takes (<b>Queen\'s Gambit Accepted</b>), it is not a real gambit: White regains the pawn with e3 and Bxc4, or Qa4+. Black should not cling to the pawn with …b5.' },
    { san: 'd4 d5 c4 e6 Nc3 Nf6 Bg5', ar: [['g5', 'd8', 'red']], t: 'The <b>Queen\'s Gambit Declined</b>. Black holds d5 solidly. White pins the f6 knight to the queen. Black\'s long-term problem is the bishop on c8, shut in behind the e6 pawn.' },
    { san: 'd4 d5 c4 c6', t: 'The <b>Slav</b> supports d5 with the c-pawn instead, keeping the c8 bishop\'s diagonal open. Solid and popular at every level.' },
  ]),
  L('french', 1, 'French & Caro-Kann', [
    { san: 'e4 e6 d4 d5', t: 'The <b>French Defence</b>: Black lets White have the centre, then attacks it immediately with …d5.', task: { accept: ['e5'], prompt: 'Play the Advance Variation: push past.' }, ok: 'A locked centre. Black now attacks the base of your pawn chain with …c5 and …Qb6. Rule: <b>attack a pawn chain at its base</b>.' },
    { san: 'e4 c6 d4 d5', hl: 'c8', t: 'The <b>Caro-Kann</b> has the same idea but with …c6. The big difference: the c8 bishop is not locked in and usually develops to f5. The price is that …c6 takes the knight\'s natural square.' },
  ]),
  L('kid', 1, 'King\'s Indian & London', [
    { san: 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6', hl: 'g7', t: 'The <b>King\'s Indian</b> is a "hypermodern" defence: Black lets White build a huge centre and plans to attack it later with …e5 or …c5. The g7 bishop on its long diagonal (a <b>fianchetto</b>) is Black\'s pride.' },
    { san: 'd4 d5 Nf3 Nf6 Bf4 e6', t: 'The <b>London System</b> is a set-up you can play against almost anything: d4, Nf3, Bf4, e3, c3, Bd3, Nbd2. Low on theory, high on understanding.', task: { accept: ['e3'], prompt: 'Continue the London set-up.' }, ok: 'Note the bishop came out to f4 <b>before</b> e3 locked it in.' },
  ]),
  L('traps', 1, 'Opening Traps', [
    { san: 'e4 e5 Qh5 Nc6 Bc4', ar: [['h5', 'f7', 'red'], ['c4', 'f7', 'red']], t: '<b>Scholar\'s Mate</b>: White threatens Qxf7#. Every beginner tries this. You must stop the threat and then punish the early queen.', task: { accept: ['g6', 'Qe7', 'Qf6'], prompt: 'You are Black. Stop the mate.' }, ok: 'Defended. Next you develop with tempo by attacking the queen (…Nf6), and White\'s attack has only wasted time.' },
    { san: 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6', t: '<b>Légal\'s Mate</b>. The f3 knight looks pinned to the queen, but a pin against the queen is not absolute.', task: { accept: ['Nxe5'], prompt: 'Break the pin with a queen sacrifice.' }, ok: 'If Black takes the queen…' },
    { san: 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1', task: { accept: ['Bxf7+'], prompt: 'Continue the attack.' }, t: 'Black grabbed the queen.', ok: 'The king has only one square.' },
    { san: 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1 Bxf7+ Ke7', task: { mate: true, prompt: 'Finish it.' }, t: 'Three minor pieces against a lone king.', ok: 'Nd5#. Development beats material when the enemy king is stuck in the centre.' },
  ]),

  // ───────────── Tactics
  L('fork', 2, 'Forks', [
    { fen: '4k3/5ppp/8/1q1N4/8/8/5PPP/6K1 w - - 0 1', t: 'A <b>fork</b> is one piece attacking two or more targets at once. The opponent can only save one. Knights are the best forkers.', task: { accept: ['Nc7+'], prompt: 'Fork the king and queen.' }, ok: 'The king must move, then Nxb5 wins the queen.' },
    { fen: '4k3/ppp3pp/8/2b1n3/8/2PP4/PP4PP/7K w - - 0 1', t: 'The humble pawn forks too, and since it is worth least, the attacked pieces cannot simply trade themselves for it.', task: { accept: ['d4'], prompt: 'Fork two pieces with a pawn.' }, ok: 'The pawn is protected by c3, so one black piece is lost.' },
    { fen: '4k3/5ppp/8/8/7n/8/5PPP/3Q2K1 w - - 0 1', t: 'The queen forks along any line. The key is a <b>check</b> that also hits a loose piece.', task: { accept: ['Qa4+'], prompt: 'Check the king and attack the knight together.' }, ok: 'Loose pieces drop off! Whenever the enemy has an undefended piece, look for a double attack.' },
  ]),
  L('pin', 2, 'Pins', [
    { san: 'e4 e5 Nf3 Nc6 Bb5 d6', ar: [['b5', 'e8', 'red']], t: 'A <b>pin</b> freezes a piece because moving it would expose something more valuable behind it. The c6 knight is pinned to the king: this is an <b>absolute pin</b>; the knight legally cannot move. That means it no longer really defends e5.', task: { accept: ['d4'], prompt: 'Attack the e5 pawn whose defender is pinned.' }, ok: 'Pressure on a pinned piece and on what it "defends" is the essence of exploiting pins.' },
    { fen: '4k3/3q1ppp/8/8/P7/8/4BPPP/6K1 w - - 0 1', t: 'Pinning a piece to its king often simply wins it.', task: { accept: ['Bb5'], prompt: 'Pin the queen to the king.' }, ok: 'The queen cannot leave the diagonal. She can take the bishop, but the a4 pawn recaptures: a queen for a bishop.' },
    { fen: 'r2qkb1r/ppp2ppp/2np1n2/4p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2QK2R w KQkq - 0 1', ar: [['g5', 'd8', 'red']], t: 'The f6 knight is pinned to the queen: a <b>relative pin</b> (it may move, but it would cost the queen). The classic method: <b>pile up</b> on the pinned piece with more attackers than it has defenders.', task: { accept: ['Nd5'], prompt: 'Bring a second attacker against the pinned knight.' }, ok: 'Now f6 is attacked twice. Black will have to accept a wrecked kingside pawn structure.' },
  ]),
  L('skewer', 2, 'Skewers', [
    { fen: '8/8/8/8/q3k3/8/8/4K2R w - - 0 1', t: 'A <b>skewer</b> is a reversed pin: you attack the more valuable piece, it must move, and you capture what stood behind it.', task: { accept: ['Rh4+'], prompt: 'Skewer the king and queen.' }, ok: 'The king steps aside and Rxa4 wins the queen.' },
    { fen: '1q6/8/8/4k3/8/8/8/4K1B1 w - - 0 1', t: 'Bishops skewer on diagonals.', task: { accept: ['Bh2+'], prompt: 'Find the diagonal skewer.' }, ok: 'Any time the enemy king and queen (or king and rook) stand on the same line, look for a skewer.' },
  ]),
  L('disc', 2, 'Discovered Attacks & Double Check', [
    { fen: '3q2k1/5ppp/8/8/8/3B4/5PPP/3R2K1 w - - 0 1', ar: [['d1', 'd8', 'red']], t: 'A <b>discovered attack</b>: one piece moves away and unmasks an attack from the piece behind it. If the moving piece also makes a threat (best of all, a check), the opponent cannot answer both.', task: { accept: ['Bxh7+'], prompt: 'Move the bishop with check to uncover the rook.' }, ok: 'Black must deal with the check and then Rxd8 wins the queen.' },
    { fen: '4k3/8/8/8/4N3/8/8/4RK2 w - - 0 1', t: 'When both the moving piece and the unmasked piece give check, it is a <b>double check</b>. It cannot be blocked or answered by a capture: the king <b>must</b> move. It is the most forcing move in chess.', task: { accept: ['Nf6+', 'Nd6+'], prompt: 'Give a double check.' }, ok: 'Two checks at once. Many brilliant mating attacks end with a double check.' },
  ]),
  L('defender', 2, 'Removing the Defender', [
    { fen: 'r5k1/5ppp/5n2/3b2B1/8/8/5PPP/3R2K1 w - - 0 1', ar: [['f6', 'd5']], t: 'The bishop on d5 is attacked by your rook and defended only by the f6 knight. If a piece depends on one defender, <b>eliminate the defender</b>.', task: { accept: ['Bxf6'], prompt: 'Remove the guard.' }, ok: 'After …gxf6 you play Rxd5 and win a piece.' },
    { fen: '3r2k1/5ppp/8/3n4/8/8/5PPP/3RR1K1 w - - 0 1', t: 'An <b>overloaded</b> piece has two jobs. The d8 rook defends the knight AND guards the back rank against mate. It cannot do both.', task: { accept: ['Rxd5', 'Re8+'], prompt: 'Exploit the overloaded rook.' }, ok: 'If …Rxd5 then Re8 is checkmate, so the knight is simply lost.' },
  ]),
  L('backrank', 2, 'Back-Rank & Smothered Mates', [
    { fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', t: 'The most common checkmate in practical chess: the castled king is boxed in by its own pawns.', task: { mate: true, prompt: 'Deliver the back-rank mate.' }, ok: 'Re8#.' },
    { fen: '6k1/5pp1/7p/8/8/8/5PPP/4R1K1 w - - 0 1', hl: 'h7', t: 'The cure is <b>luft</b> ("air"): a quiet pawn move like …h6 gives the king an escape square. Now Re8+ is harmless because of …Kh7. Make luft before you need it.' },
    { fen: '6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1', t: 'A <b>smothered mate</b>: the king is completely hemmed in by its own pieces and a knight delivers the blow.', task: { mate: true, prompt: 'Find the smothered mate.' }, ok: 'Nf7#. Nothing can capture the knight and the king cannot breathe.' },
  ]),

  // ───────────── Mating technique
  L('ladder', 3, 'The Ladder Mate', [
    { fen: '4k3/8/8/8/8/8/R7/1R4K1 w - - 0 1', hl: 'a7 b7 c7 d7 e7 f7 g7 h7', t: 'With two rooks (or queen and rook) you mate by the <b>ladder</b>: one rook cuts off a rank so the king cannot step forward, the other gives check on the next rank.', task: { accept: ['Ra7'], prompt: 'Cut the king off along the 7th rank.' }, ok: 'The king is confined to the back rank.' },
    { fen: '3k4/R7/8/8/8/8/8/1R4K1 w - - 0 1', task: { mate: true, prompt: 'Climb the last rung.' }, t: 'Now the other rook delivers mate.', ok: 'Rb8#. If the king ever attacks a rook, just swing it to the far side of the board and continue.' },
  ]),
  L('kq', 3, 'King & Queen vs King', [
    { fen: '8/8/4k3/8/3Q4/8/8/6K1 w - - 0 1', t: 'Technique: put your queen a <b>knight\'s move away</b> from the enemy king and then copy his every move. This shrinks his box until he is on the edge. Then stop, bring your own king up, and mate.' },
    { fen: '7k/5Q2/8/8/8/8/8/6K1 b - - 0 1', hl: 'g8 g7 h7', t: 'The danger: with the king in the corner and your queen a knight\'s move away, it is <b>stalemate</b> if he is to move. Once the king is on the edge, leave the queen alone and walk your king over.' },
    { fen: '7k/8/5K2/8/8/8/6Q1/8 w - - 0 1', task: { mate: true, prompt: 'Your king has arrived. Deliver mate.' }, t: 'The king supports the queen for the final blow.', ok: 'Qg7#. The queen is protected by the king and covers every escape square.' },
  ]),
  L('kr', 3, 'King & Rook vs King', [
    { fen: '8/8/8/3k4/8/8/4R3/4K3 w - - 0 1', hl: 'e3 e4 e5 e6 e7 e8', t: 'The rook builds a <b>box</b>; the king does the heavy lifting. The rook alone cannot force the king back: your king must face his directly (the <b>opposition</b>), and then a rook check pushes him back one rank.' },
    { fen: '7k/8/5K2/8/8/8/8/R7 w - - 0 1', t: 'The enemy king is on the edge. Place your king a knight\'s move from the corner so that he has only one move.', task: { accept: ['Kg6'], prompt: 'Play the precise king move.' }, ok: 'Now Black has only …Kg8, walking into the opposition.' },
    { fen: '6k1/8/6K1/8/8/8/8/R7 w - - 0 1', task: { mate: true, prompt: 'Kings face each other. Finish.' }, t: 'The kings are in opposition, so your king covers all the escape squares.', ok: 'Ra8#. This is the pattern at the end of every K+R mate.' },
  ]),

  // ───────────── Strategy
  L('structure', 4, 'Pawn Structure', [
    { fen: '4k3/pp3ppp/4p3/8/3P4/8/PP3PPP/4K3 w - - 0 1', hl: 'd4', t: '"Pawns are the soul of chess." An <b>isolated pawn</b> has no friendly pawns on neighbouring files, so it can only be defended by pieces. The square in front of it (d5) is a perfect home for an enemy piece.' },
    { fen: '4k3/ppp2ppp/8/8/8/2P5/P1P2PPP/4K3 w - - 0 1', hl: 'c2 c3', t: '<b>Doubled pawns</b> stand on the same file. They cannot protect each other and are hard to advance. A <b>backward pawn</b> has fallen behind its neighbours and sits on a half-open file as a target.' },
    { fen: '6k1/5ppp/8/3P4/8/8/5PPP/6K1 w - - 0 1', hl: 'd5', t: 'A <b>passed pawn</b> has no enemy pawns in front of it or on adjacent files. Nothing but pieces can stop it. "Passed pawns must be pushed!"', task: { accept: ['d6'], prompt: 'Advance the passed pawn.' }, ok: 'The closer it gets to promotion, the more enemy pieces it ties down.' },
  ]),
  L('outpost', 4, 'Outposts & Good Bishops', [
    { fen: 'r4rk1/pp3ppp/3p4/4p3/4P3/2N5/PPP2PPP/R4RK1 w - - 0 1', hl: 'd5', t: 'An <b>outpost</b> is a square in enemy territory that no enemy pawn can ever attack. Black\'s c- and e-pawns are gone from the files that could guard d5.', task: { accept: ['Nd5'], prompt: 'Occupy the outpost.' }, ok: 'A knight on a central outpost can be worth as much as a rook. It can never be chased away by a pawn.' },
    { fen: '6k1/5p2/4p1p1/3pP1Pp/3P1P1P/3B4/8/6K1 w - - 0 1', hl: 'd5 e6 f7 g6 h5', t: 'A bishop is <b>good</b> when your pawns stand on the other colour: it is not blocked, and enemy pawns fixed on its colour are permanent targets. Here every black pawn sits on a light square in the bishop\'s sights. Rule: put your pawns on the opposite colour to your bishop.' },
  ]),
  L('files', 4, 'Open Files & the 7th Rank', [
    { fen: '6k1/pp3pp1/7p/8/8/8/PP3PPP/3R2K1 w - - 0 1', hl: 'd7', t: 'Rooks belong on <b>open files</b>, and the goal of an open file is the <b>7th rank</b>. A rook there attacks pawns from the side and traps the king on the back rank.', task: { accept: ['Rd7'], prompt: 'Invade the 7th rank.' }, ok: 'The rook attacks b7 and f7 at once. Two rooks on the 7th ("pigs on the seventh") are usually decisive.' },
    { fen: '6k1/pp3pp1/7p/8/8/8/PP3PPP/3R2K1 w - - 0 1', t: 'To win an open file, <b>double</b> your rooks on it. If the opponent contests it, the side with more heavy pieces on the file wins it. Half-open files (only an enemy pawn on them) are roads to attack that pawn.' },
  ]),
  L('attack', 4, 'King Safety & Attack', [
    { san: 'e4 e5 Nf3 Nc6 Bc4 Bc5 O-O Nf6 d3 O-O', hl: 'f2 g2 h2 f7 g7 h7', t: 'The three pawns in front of a castled king are its <b>shield</b>. Every pawn move there creates permanent weak squares. Do not push them without a concrete reason.' },
    { fen: '6k1/5p1p/5Qp1/8/8/8/3B4/6K1 w - - 0 1', hl: 'f6 g7 h6', t: 'Black has pushed …g6 and no longer has a dark-squared bishop. The dark squares around the king (f6, g7, h6) are fatally weak.', task: { accept: ['Bh6'], prompt: 'Use the weak dark squares to create an unstoppable mate threat.' }, ok: 'Qg7# cannot be prevented. Attack on the colour complex your opponent has weakened.' },
    { fen: START, t: 'Rules of attack: <b>1)</b> Attack where you have more pieces than the defender. <b>2)</b> Open lines toward the king with pawn breaks. <b>3)</b> Bring every piece ("invite everyone to the party"). <b>4)</b> With kings castled on opposite sides, launch your pawns: speed matters more than material.' },
  ]),
  L('plan', 4, 'Planning & Prophylaxis', [
    { san: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O', t: 'When there are no tactics you need a <b>plan</b>. The simplest method, from the great trainers: find your <b>worst-placed piece</b> and improve it. Here White\'s b1 knight will travel d2–f1–g3 to join the kingside.' },
    { san: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O', hl: 'g4', t: '<b>Prophylaxis</b>: before your own plan, ask "what does my opponent want?" Black would like …Bg4, pinning the knight that supports d4.', task: { accept: ['h3'], prompt: 'Stop Black\'s idea before it happens.' }, ok: '9.h3! One of the most famous prophylactic moves in opening theory. Now d4 comes under ideal conditions.' },
    { fen: START, t: 'More strategic rules to play by: <b>the principle of two weaknesses</b> (one weakness can be defended; stretch the defence by creating a second on the other wing); <b>trade when ahead</b>; <b>space</b> gives your pieces room, so avoid trades when you have more of it; and <b>do not hurry</b> in a winning position.' },
  ]),

  // ───────────── Endgames
  L('opposition', 5, 'Opposition & Key Squares', [
    { fen: '8/8/4k3/8/4K3/8/8/8 w - - 0 1', hl: 'e5', t: 'Two kings facing each other with one square between them are in <b>opposition</b>. Whoever must move has to give way. Having the opposition (the other side to move) is the key to almost all pawn endings.' },
    { fen: '8/4k3/8/5K2/4P3/8/8/8 w - - 0 1', hl: 'd6 e6 f6', t: 'Golden rule: lead with the <b>king in front of the pawn</b>, not the pawn. If your king reaches one of the pawn\'s <b>key squares</b> (highlighted), the pawn promotes by force.', task: { accept: ['Ke5'], prompt: 'Take the opposition.' }, ok: 'Black must step aside and your king goes to d6 or f6, a key square. Pushing the pawn first would only draw.' },
    { fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1', t: 'Rule of thumb: <b>king on the 6th rank in front of its pawn always wins</b> (except rook pawns), no matter who moves. King and pawn knowledge is the foundation of every other endgame.' },
  ]),
  L('square', 5, 'The Rule of the Square', [
    { fen: '8/8/8/8/P6k/8/8/7K w - - 0 1', hl: 'a5 b5 c5 d5 a6 b6 c6 d6 a7 b7 c7 d7 a8 b8 c8 d8', t: 'Can the king catch a passed pawn? Do not calculate; draw a <b>square</b> from the pawn to the promotion rank. If the defending king can step into the square, he catches the pawn. If not, it queens.', task: { accept: ['a5'], prompt: 'The black king is far outside. Run!' }, ok: 'The king cannot enter the square. The pawn promotes.' },
    { fen: '8/8/8/3k4/P7/8/8/7K w - - 0 1', hl: 'a4 b4 c4 d4 e4 a5 b5 c5 d5 e5 a6 b6 c6 d6 e6 a7 b7 c7 d7 e7 a8 b8 c8 d8 e8', t: 'Here the black king is already <b>inside</b> the square of the a4 pawn, so he will catch it. Count squares, not moves.' },
  ]),
  L('lucena', 5, 'The Lucena Position', [
    { fen: '6K1/4k1P1/8/8/8/8/7r/5R2 w - - 0 1', t: 'Rook endings are the most common of all. The <b>Lucena position</b> is the winning method: your king is in front of your pawn on the 7th, the enemy king is cut off. But your king has no shelter from checks when it steps out.', task: { accept: ['Rf4'], prompt: '"Build a bridge": lift the rook to the 4th rank.' }, ok: 'The idea: your king walks out to f7, g6, f6, g5 under a hail of checks, and then the rook blocks on g4. The bridge is built and the pawn queens.' },
  ]),
  L('philidor', 5, 'The Philidor Position', [
    { fen: '4k3/7R/r7/3KP3/8/8/8/8 b - - 0 1', hl: 'a6 b6 c6 d6 e6 f6 g6 h6', t: 'The <b>Philidor position</b> is how the defender draws a rook ending a pawn down. Your king stands on the queening square and your rook guards the <b>6th rank</b>, so the enemy king cannot advance.' },
    { fen: '4k3/7R/r3P3/3K4/8/8/8/8 b - - 0 1', t: 'White has pushed the pawn to e6 to dislodge your rook. Now the white king has lost its shelter from checks from behind.', task: { accept: ['Ra1'], prompt: 'You are Black. Drop the rook back to give checks from the rear.' }, ok: 'Black will check on the d-, e- and c-files forever. The king cannot hide: draw. Lucena to win, Philidor to draw: know both cold.' },
  ]),

  // ───────────── GM thinking
  L('calc', 6, 'Calculation: Checks, Captures, Threats', [
    { fen: '3r2k1/5ppp/8/8/8/8/4QPPP/4R1K1 w - - 0 1', t: 'Strong players do not look at random moves. They scan <b>forcing moves</b> in order: <b>Checks → Captures → Threats</b>. Forcing moves limit the replies, so you can calculate them to the end. Even "impossible" checks deserve a look.', task: { accept: ['Qe8+'], prompt: 'Examine every check. One of them wins.' }, ok: 'A queen sacrifice! Only one reply…' },
    { fen: '4r1k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1', t: 'Black had to capture.', task: { mate: true, prompt: 'Complete the combination.' }, ok: 'Rxe8#. You would never find this by looking for "safe" moves.' },
    { fen: START, t: 'The calculation routine: <b>1)</b> List 2–3 <b>candidate moves</b> before analysing any. <b>2)</b> Calculate each line to a quiet position ("and then what?"). <b>3)</b> Evaluate the final position, not the moves. <b>4)</b> Compare and choose. Train by solving puzzles without moving the pieces until you see the whole line.' },
  ]),
  L('blunder', 6, 'The Blunder Check & Your Training Plan', [
    { fen: START, t: 'Before you release any piece, run the <b>blunder check</b>: <b>1)</b> What did my opponent\'s last move threaten? <b>2)</b> After my move, what are their checks, captures and threats? <b>3)</b> Is the piece I am moving safe on its new square, and what did it stop defending? Ten seconds of this is worth hundreds of rating points.' },
    { fen: START, t: 'How strong players are made: <b>Tactics daily</b> (the Puzzles tab), <b>play longer games and review every one</b> (the coach grades each of your moves), <b>study endgames</b> early, and learn openings as <b>ideas</b>, not memorised lines. Analyse your losses hardest: they show exactly what to fix.' },
    { fen: START, t: 'Your <b>Progress</b> screen tracks all of this: accuracy by game phase, blunder types, puzzle themes, and a skill radar. It always shows your weakest area and the lesson or puzzle set that fixes it. Climb the ladder of opponents from Pip to ORACLE, and keep going beyond this academy with rated games against humans. Good luck!' },
  ]),
];
