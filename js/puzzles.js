// Tactics trainer. sol alternates your move / opponent reply; an entry may be an array of accepted moves.
export const THEMES = {
  mate1: 'Mate in 1', mate2: 'Mate in 2', fork: 'Forks', pin: 'Pins', skewer: 'Skewers',
  discovery: 'Discovered attacks', trap: 'Opening tactics', promotion: 'Promotion', endgame: 'Endgame technique',
};

const P = (id, title, theme, rating, pos, sol, extra = {}) => ({ id, title, theme, rating, ...(pos.includes('/') ? { fen: pos } : { san: pos }), sol, ...extra });

export const PUZZLES = [
  P('p1', 'The corridor', 'mate1', 600, '6k1/5ppp/8/8/8/8/r4PPP/3R2K1 w - - 0 1', ['Rd8#'], { mate: true }),
  P('p2', 'Scholar\'s finish', 'mate1', 600, 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', ['Qxf7#'], { mate: true }),
  P('p3', 'Fool\'s punishment', 'mate1', 600, 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2', ['Qh4#'], { mate: true }),
  P('p4', 'Two rooks', 'mate1', 650, '7k/R7/8/8/8/8/8/1R4K1 w - - 0 1', ['Rb8#'], { mate: true }),
  P('p5', 'Royal escort', 'mate1', 700, '7k/1Q6/5K2/8/8/8/8/8 w - - 0 1', ['Qg7#'], { mate: true }),
  P('p6', 'Edge of the board', 'mate1', 700, '1k6/8/1K6/8/8/8/8/7R w - - 0 1', ['Rh8#'], { mate: true }),
  P('p7', 'No air', 'mate1', 800, '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', ['Nf7#'], { mate: true }),
  P('p8', 'Arabian nights', 'mate1', 900, '7k/R7/5N2/8/8/8/8/6K1 w - - 0 1', ['Rh7#'], { mate: true }),
  P('p9', 'The shilling trap', 'mate1', 1000, 'e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5 Qg5 Nxf7 Qxg2 Rf1 Qxe4+ Be2', ['Nf3#'], { mate: true }),
  P('p10', 'Royal fork', 'fork', 800, 'r3k3/ppp2ppp/8/1N6/8/8/PPP2PPP/4K3 w - - 0 1', ['Nxc7+', 'Kd7', 'Nxa8']),
  P('p11', 'Queen\'s reach', 'fork', 850, '6k1/5pp1/7p/r7/8/8/5PPP/3Q2K1 w - - 0 1', ['Qd8+', 'Kh7', 'Qxa5']),
  P('p12', 'Little giant', 'fork', 900, '4k3/ppp3pp/8/2n1b3/8/2PP4/PP4PP/6K1 w - - 0 1', ['d4']),
  P('p13', 'Nailed down', 'pin', 950, '4k3/4q3/8/8/8/8/5PPP/R2R2K1 w - - 0 1', ['Re1']),
  P('p14', 'Through the king', 'skewer', 950, '8/5ppp/8/3k3q/8/8/R4PPP/6K1 w - - 0 1', ['Ra5+', 'Kd6', 'Rxh5']),
  P('p15', 'Unmasked', 'discovery', 1050, '1q2k3/5ppp/8/4N3/8/8/5PPP/4R1K1 w - - 0 1', ['Nc6+', 'Kf8', 'Nxb8']),
  P('p16', 'A knight is enough', 'promotion', 1100, '8/k1P1q3/8/8/8/8/PPP5/1K6 w - - 0 1', ['c8=N+', 'Kb7', 'Nxe7']),
  P('p17', 'Légal\'s legacy', 'mate2', 1200, 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1', ['Bxf7+', 'Ke7', 'Nd5#'], { mate: true }),
  P('p18', 'Philidor\'s legacy', 'mate2', 1300, '5r1k/6pp/7N/8/2Q5/8/8/6K1 w - - 0 1', ['Qg8+', 'Rxg8', 'Nf7#'], { mate: true }),
  P('p19', 'Anastasia', 'mate2', 1300, '5r1k/4N1pp/8/8/R7/3Q4/8/6K1 w - - 0 1', ['Qxh7+', 'Kxh7', 'Rh4#'], { mate: true }),
  P('p20', 'Take the opposition', 'endgame', 1300, '8/3k4/8/2K5/3P4/8/8/8 w - - 0 1', ['Kd5'], { noVerify: true }),
  P('p21', 'Boden\'s cross', 'mate2', 1400, '2kr4/1p1n4/2p5/8/5B2/5Q2/4B3/6K1 w - - 0 1', ['Qxc6+', 'bxc6', 'Ba6#'], { mate: true }),
  P('p22', 'A night at the opera', 'mate2', 1400, 'e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7', ['Qb8+', 'Nxb8', 'Rd8#'], { mate: true }),
  P('p23', 'The elephant trap', 'trap', 1500, 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5', ['Nxd5', 'Bxd8', 'Bb4+', 'Qd2', 'Bxd2+', 'Kxd2', 'Kxd8']),
];
