// Draft Day — Football Player Pool
// All fictional/generic players to avoid IP issues

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DE' | 'DT' | 'LB' | 'CB' | 'S' | 'K' | 'P'

export type AttributeCategory = 'PHYSICAL' | 'MENTAL' | 'SKILL'

export interface PlayerAttribute {
  key: string
  label: string
  category: AttributeCategory
  rating: number // 40–99
}

export interface PoolPlayer {
  id: string
  name: string
  position: Position
  team: string
  archetype: string
  overall: number
  attributes: PlayerAttribute[]
  bodyPart?: 'arm' | 'legs' | 'size' | 'head' | 'core'
}

function grade(r: number): string {
  if (r >= 93) return 'A+'
  if (r >= 87) return 'A'
  if (r >= 83) return 'A-'
  if (r >= 80) return 'B+'
  if (r >= 77) return 'B'
  if (r >= 73) return 'B-'
  if (r >= 70) return 'C+'
  if (r >= 67) return 'C'
  if (r >= 63) return 'C-'
  if (r >= 60) return 'D+'
  if (r >= 57) return 'D'
  if (r >= 50) return 'D-'
  return 'F'
}

export { grade }

function makeQB(id: string, name: string, team: string, arch: string, ovr: number, arm: number, acc: number, mob: number, presnap: number, pocket: number, leadership: number): PoolPlayer {
  return {
    id, name, position: 'QB', team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'arm', label: 'Arm Strength', category: 'PHYSICAL', rating: arm },
      { key: 'legs', label: 'Mobility', category: 'PHYSICAL', rating: mob },
      { key: 'size', label: 'Size & Frame', category: 'PHYSICAL', rating: Math.round((arm + mob) / 2 - 5) },
      { key: 'presnap', label: 'Pre-Snap IQ', category: 'MENTAL', rating: presnap },
      { key: 'leadership', label: 'Leadership', category: 'MENTAL', rating: leadership },
      { key: 'pocket', label: 'Pocket Presence', category: 'SKILL', rating: pocket },
      { key: 'accuracy', label: 'Accuracy', category: 'SKILL', rating: acc },
      { key: 'playmaking', label: 'Playmaking', category: 'SKILL', rating: Math.round((acc + mob) / 2) },
    ]
  }
}

function makeRB(id: string, name: string, team: string, arch: string, ovr: number, speed: number, power: number, agility: number, vision: number, catching: number, stiffarm: number): PoolPlayer {
  return {
    id, name, position: 'RB', team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'legs', label: 'Speed & Burst', category: 'PHYSICAL', rating: speed },
      { key: 'size', label: 'Power & Build', category: 'PHYSICAL', rating: power },
      { key: 'agility', label: 'Agility', category: 'PHYSICAL', rating: agility },
      { key: 'vision', label: 'Vision', category: 'MENTAL', rating: vision },
      { key: 'awareness', label: 'Awareness', category: 'MENTAL', rating: Math.round((vision + catching) / 2) },
      { key: 'catching', label: 'Receiving', category: 'SKILL', rating: catching },
      { key: 'stiffarm', label: 'Stiff Arm', category: 'SKILL', rating: stiffarm },
      { key: 'breakaway', label: 'Breakaway', category: 'SKILL', rating: Math.round((speed + agility) / 2) },
    ]
  }
}

function makeWR(id: string, name: string, team: string, arch: string, ovr: number, speed: number, routes: number, hands: number, rac: number, separation: number, contested: number): PoolPlayer {
  return {
    id, name, position: 'WR', team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'legs', label: 'Speed', category: 'PHYSICAL', rating: speed },
      { key: 'size', label: 'Size & Frame', category: 'PHYSICAL', rating: Math.round((hands + rac) / 2 - 5) },
      { key: 'separation', label: 'Separation', category: 'PHYSICAL', rating: separation },
      { key: 'routes', label: 'Route Running', category: 'MENTAL', rating: routes },
      { key: 'awareness', label: 'Awareness', category: 'MENTAL', rating: Math.round((routes + hands) / 2) },
      { key: 'hands', label: 'Hands', category: 'SKILL', rating: hands },
      { key: 'rac', label: 'YAC Ability', category: 'SKILL', rating: rac },
      { key: 'contested', label: 'Contested Catch', category: 'SKILL', rating: contested },
    ]
  }
}

function makeTE(id: string, name: string, team: string, arch: string, ovr: number, size: number, blocking: number, routes: number, hands: number, speed: number, strength: number): PoolPlayer {
  return {
    id, name, position: 'TE', team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'size', label: 'Size & Strength', category: 'PHYSICAL', rating: size },
      { key: 'legs', label: 'Speed', category: 'PHYSICAL', rating: speed },
      { key: 'strength', label: 'Physical Power', category: 'PHYSICAL', rating: strength },
      { key: 'routes', label: 'Route Running', category: 'MENTAL', rating: routes },
      { key: 'awareness', label: 'Awareness', category: 'MENTAL', rating: Math.round((routes + hands) / 2) },
      { key: 'blocking', label: 'Blocking', category: 'SKILL', rating: blocking },
      { key: 'hands', label: 'Hands', category: 'SKILL', rating: hands },
      { key: 'redzone', label: 'Red Zone Threat', category: 'SKILL', rating: Math.round((size + hands) / 2) },
    ]
  }
}

function makeOL(id: string, name: string, team: string, arch: string, ovr: number, size: number, strength: number, passBlock: number, runBlock: number, awareness: number, footwork: number): PoolPlayer {
  return {
    id, name, position: 'OL', team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'size', label: 'Size & Frame', category: 'PHYSICAL', rating: size },
      { key: 'strength', label: 'Strength', category: 'PHYSICAL', rating: strength },
      { key: 'footwork', label: 'Footwork', category: 'PHYSICAL', rating: footwork },
      { key: 'awareness', label: 'Awareness', category: 'MENTAL', rating: awareness },
      { key: 'assignment', label: 'Assignment IQ', category: 'MENTAL', rating: Math.round((awareness + passBlock) / 2) },
      { key: 'passblock', label: 'Pass Block', category: 'SKILL', rating: passBlock },
      { key: 'runblock', label: 'Run Block', category: 'SKILL', rating: runBlock },
      { key: 'anchor', label: 'Anchor', category: 'SKILL', rating: Math.round((strength + size) / 2) },
    ]
  }
}

function makeDL(id: string, name: string, pos: 'DE' | 'DT', team: string, arch: string, ovr: number, size: number, speed: number, motor: number, power: number, awareness: number, passrush: number): PoolPlayer {
  return {
    id, name, position: pos, team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'size', label: 'Size & Build', category: 'PHYSICAL', rating: size },
      { key: 'legs', label: 'First Step', category: 'PHYSICAL', rating: speed },
      { key: 'motor', label: 'Motor & Effort', category: 'PHYSICAL', rating: motor },
      { key: 'awareness', label: 'Awareness', category: 'MENTAL', rating: awareness },
      { key: 'assignment', label: 'Assignment IQ', category: 'MENTAL', rating: Math.round(awareness * 0.9) },
      { key: 'power', label: 'Power Moves', category: 'SKILL', rating: power },
      { key: 'passrush', label: 'Pass Rush', category: 'SKILL', rating: passrush },
      { key: 'shedding', label: 'Block Shed', category: 'SKILL', rating: Math.round((power + speed) / 2) },
    ]
  }
}

function makeLB(id: string, name: string, team: string, arch: string, ovr: number, speed: number, size: number, tackle: number, coverage: number, blitz: number, awareness: number): PoolPlayer {
  return {
    id, name, position: 'LB', team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'legs', label: 'Speed & Range', category: 'PHYSICAL', rating: speed },
      { key: 'size', label: 'Physicality', category: 'PHYSICAL', rating: size },
      { key: 'motor', label: 'Motor', category: 'PHYSICAL', rating: Math.round((speed + tackle) / 2) },
      { key: 'awareness', label: 'Awareness', category: 'MENTAL', rating: awareness },
      { key: 'assignment', label: 'Assignment IQ', category: 'MENTAL', rating: Math.round(awareness * 0.9 + blitz * 0.1) },
      { key: 'tackle', label: 'Tackling', category: 'SKILL', rating: tackle },
      { key: 'coverage', label: 'Coverage', category: 'SKILL', rating: coverage },
      { key: 'blitz', label: 'Blitz', category: 'SKILL', rating: blitz },
    ]
  }
}

function makeCB(id: string, name: string, team: string, arch: string, ovr: number, speed: number, man: number, zone: number, ball: number, press: number, awareness: number): PoolPlayer {
  return {
    id, name, position: 'CB', team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'legs', label: 'Speed', category: 'PHYSICAL', rating: speed },
      { key: 'agility', label: 'Agility', category: 'PHYSICAL', rating: Math.round((speed + man) / 2) },
      { key: 'size', label: 'Physicality', category: 'PHYSICAL', rating: Math.round((man + press) / 2 - 5) },
      { key: 'awareness', label: 'Awareness', category: 'MENTAL', rating: awareness },
      { key: 'anticipation', label: 'Ball Anticipation', category: 'MENTAL', rating: Math.round((awareness + ball) / 2) },
      { key: 'man', label: 'Man Coverage', category: 'SKILL', rating: man },
      { key: 'zone', label: 'Zone Coverage', category: 'SKILL', rating: zone },
      { key: 'press', label: 'Press Coverage', category: 'SKILL', rating: press },
      { key: 'ballhawk', label: 'Ball Hawk', category: 'SKILL', rating: ball },
    ]
  }
}

function makeS(id: string, name: string, team: string, arch: string, ovr: number, speed: number, rangeRating: number, tackle: number, coverage: number, ballhawk: number, leadership: number): PoolPlayer {
  return {
    id, name, position: 'S', team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'legs', label: 'Speed & Range', category: 'PHYSICAL', rating: speed },
      { key: 'size', label: 'Physicality', category: 'PHYSICAL', rating: tackle },
      { key: 'range', label: 'Range', category: 'PHYSICAL', rating: rangeRating },
      { key: 'awareness', label: 'Awareness', category: 'MENTAL', rating: leadership },
      { key: 'assignment', label: 'Assignment IQ', category: 'MENTAL', rating: Math.round((leadership + coverage) / 2) },
      { key: 'tackle', label: 'Tackling', category: 'SKILL', rating: tackle },
      { key: 'coverage', label: 'Coverage', category: 'SKILL', rating: coverage },
      { key: 'ballhawk', label: 'Ball Hawk', category: 'SKILL', rating: ballhawk },
    ]
  }
}

function makeK(id: string, name: string, team: string, arch: string, ovr: number, power: number, accuracy: number, consistency: number, clutch: number, kickoff: number): PoolPlayer {
  return {
    id, name, position: 'K', team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'legs', label: 'Leg Power', category: 'PHYSICAL', rating: power },
      { key: 'size', label: 'Athleticism', category: 'PHYSICAL', rating: Math.round((power + accuracy) / 2 - 10) },
      { key: 'kickoff', label: 'Kickoff Power', category: 'PHYSICAL', rating: kickoff },
      { key: 'awareness', label: 'Composure', category: 'MENTAL', rating: consistency },
      { key: 'clutch', label: 'Clutch Factor', category: 'MENTAL', rating: clutch },
      { key: 'accuracy', label: 'FG Accuracy', category: 'SKILL', rating: accuracy },
      { key: 'range', label: 'FG Range', category: 'SKILL', rating: Math.round((power + accuracy) / 2) },
      { key: 'consistency', label: 'Consistency', category: 'SKILL', rating: consistency },
    ]
  }
}

function makeP(id: string, name: string, team: string, arch: string, ovr: number, power: number, accuracy: number, hangtime: number, directional: number, consistency: number): PoolPlayer {
  return {
    id, name, position: 'P', team, archetype: arch, overall: ovr,
    attributes: [
      { key: 'legs', label: 'Leg Power', category: 'PHYSICAL', rating: power },
      { key: 'size', label: 'Athleticism', category: 'PHYSICAL', rating: Math.round((power + hangtime) / 2 - 10) },
      { key: 'hangtime', label: 'Hang Time', category: 'PHYSICAL', rating: hangtime },
      { key: 'awareness', label: 'Composure', category: 'MENTAL', rating: consistency },
      { key: 'directional', label: 'Field Awareness', category: 'MENTAL', rating: directional },
      { key: 'accuracy', label: 'Punt Accuracy', category: 'SKILL', rating: accuracy },
      { key: 'coffin', label: 'Coffin Corner', category: 'SKILL', rating: directional },
      { key: 'consistency', label: 'Consistency', category: 'SKILL', rating: consistency },
    ]
  }
}

// ============================================================
// PLAYER POOL — 8+ players per position
// ============================================================

export const PLAYER_POOL: Record<Position, PoolPlayer[]> = {
  QB: [
    makeQB('qb1',  'Marcus "Iron Arm" Reeves',   'KC',  'Gunslinger',       94, 96, 92, 72, 91, 89, 93),
    makeQB('qb2',  'Darius Stone',                'BUF', 'Dual Threat',      91, 84, 88, 93, 87, 83, 86),
    makeQB('qb3',  'Chase Whitfield',             'PHI', 'West Coast',       89, 88, 90, 78, 90, 91, 85),
    makeQB('qb4',  'Jordan "Flash" Vega',         'LAR', 'Scrambler',        87, 80, 85, 95, 82, 78, 80),
    makeQB('qb5',  'Tyler Blackwood',             'DEN', 'Pocket Passer',    85, 92, 87, 65, 88, 93, 87),
    makeQB('qb6',  'Elijah Hart',                 'MIN', 'Game Manager',     82, 85, 84, 70, 86, 85, 88),
    makeQB('qb7',  'Brendan Cole',                'CLE', 'Wildcat',          79, 78, 80, 88, 76, 74, 76),
    makeQB('qb8',  'Victor Nunez',                'ATL', 'Strong Arm',       83, 94, 83, 68, 85, 84, 82),
    makeQB('qb9',  'Ray "The General" McKnight',  'NO',  'Field General',    90, 87, 91, 73, 93, 90, 95),
    makeQB('qb10', 'Devon Ashford',               'TEN', 'Mobile Cannon',    86, 90, 86, 85, 84, 82, 83),
  ],
  RB: [
    makeRB('rb1',  'Javion Rivers',          'KC',  'Speed Back',   95, 97, 72, 95, 88, 82, 76),
    makeRB('rb2',  'Marcus "Tank" Coleman', 'PIT', 'Power Back',   91, 84, 90, 76, 82, 72, 88),
    makeRB('rb3',  'Deon Sparks',           'PHI', 'Receiving RB', 89, 90, 68, 90, 86, 91, 72),
    makeRB('rb4',  'Leroy Jackson',         'DAL', 'Workhorse',    88, 88, 82, 83, 88, 76, 83),
    makeRB('rb5',  'Caleb "Ghost" Monroe',  'SF',  'Elusive',      87, 93, 65, 92, 84, 80, 70),
    makeRB('rb6',  'Darius Holt',           'BAL', 'Three-Down',   85, 85, 80, 82, 85, 83, 80),
    makeRB('rb7',  'Antoine Cross',         'NO',  'Speed Demon',  83, 95, 68, 94, 80, 78, 72),
    makeRB('rb8',  'Myles "Bull" Garrett',  'TEN', 'Power House',  86, 80, 93, 72, 83, 70, 92),
    makeRB('rb9',  'Zach Patterson',        'DEN', 'All-Purpose',  84, 87, 76, 85, 87, 85, 76),
    makeRB('rb10', 'Tyreek Houston',        'BUF', 'Burst Back',   90, 95, 70, 92, 85, 78, 74),
  ],
  WR: [
    makeWR('wr1',  '"Silky" Smooth Williams', 'LAR', 'Route Runner',  96, 92, 97, 94, 90, 93, 85),
    makeWR('wr2',  'Andre "Thunder" Davis',   'CIN', 'Deep Threat',   93, 97, 85, 90, 92, 94, 82),
    makeWR('wr3',  'Malik Torres',            'KC',  'Slot Receiver', 90, 90, 93, 92, 88, 90, 80),
    makeWR('wr4',  'Deon "Freight Train" Webb','PHI', 'Physical WR',  88, 86, 88, 90, 84, 82, 92),
    makeWR('wr5',  'Rashad Kinley',           'MIN', 'Possession',    87, 85, 90, 91, 86, 88, 90),
    makeWR('wr6',  'Tyrell Carter',           'SF',  'YAC Machine',   89, 93, 86, 93, 90, 87, 82),
    makeWR('wr7',  'Jayceon Pope',            'ATL', 'Speed Demon',   85, 97, 82, 86, 90, 88, 76),
    makeWR('wr8',  'Bryce Whitmore',          'SEA', 'Red Zone',      84, 82, 88, 85, 80, 82, 93),
    makeWR('wr9',  'Jordan "Quick" Okafor',   'DET', 'Slot Specialist',86, 88, 92, 90, 90, 89, 83),
    makeWR('wr10', 'Dante Calloway',          'TB',  'Contested Catch',88, 86, 87, 86, 83, 82, 94),
  ],
  TE: [
    makeTE('te1',  '"Big Red" Thorne',         'KC',  'Receiving TE', 94, 90, 80, 86, 93, 83, 85),
    makeTE('te2',  'Marcus Everett',           'SF',  'All-Around',   91, 88, 85, 84, 90, 82, 86),
    makeTE('te3',  'Devon "Mountain" Shaw',    'PIT', 'Blocking TE',  88, 93, 92, 76, 84, 76, 88),
    makeTE('te4',  'Caleb Nicholson',          'MIN', 'Route Runner', 87, 84, 76, 88, 90, 85, 83),
    makeTE('te5',  'Jordan "Tank" Harris',     'BAL', 'Red Zone',     86, 92, 85, 78, 88, 78, 90),
    makeTE('te6',  'Antonio Bell',             'NO',  'Speed TE',     85, 83, 76, 85, 87, 88, 82),
    makeTE('te7',  'Shaun "Bulldozer" Cross',  'TEN', 'Power TE',     84, 94, 90, 74, 84, 76, 88),
    makeTE('te8',  'Rico Dominguez',           'LAR', 'Mismatch',     89, 86, 78, 88, 92, 86, 87),
  ],
  OL: [
    makeOL('ol1',  '"Wall Street" Monroe',    'PHI', 'Pass Protector', 94, 92, 90, 95, 86, 92, 88),
    makeOL('ol2',  'Darius "Bull" Thompson',  'KC',  'Run Blocker',    91, 95, 94, 83, 92, 86, 85),
    makeOL('ol3',  'Victor Langford',         'DAL', 'Mauler',         88, 93, 93, 82, 88, 84, 84),
    makeOL('ol4',  'Marco Reyes',             'SF',  'Technician',     90, 88, 88, 92, 84, 92, 87),
    makeOL('ol5',  'Blake "Tank" Watkins',    'PIT', 'Road Grader',    86, 94, 91, 80, 85, 82, 86),
    makeOL('ol6',  'Lorenzo King',            'NO',  'Zone Blocker',   85, 88, 87, 85, 88, 90, 83),
    makeOL('ol7',  'Andre Mitchell',          'GBK', 'Guard',          84, 90, 89, 83, 86, 85, 82),
    makeOL('ol8',  'Cedric Webb',             'CLE', 'Balanced',       83, 87, 86, 83, 84, 84, 83),
  ],
  DE: [
    makeDL('de1',  '"Hurricane" Hayes',      'DE', 'PHI', 'Edge Rusher',    95, 88, 93, 95, 88, 90, 94),
    makeDL('de2',  'Marcus "Wreck" Willis',  'DE', 'PIT', 'Power Rusher',   92, 92, 86, 90, 90, 92, 89),
    makeDL('de3',  'Devon Clash',            'DE', 'SF',  'Speed Rusher',   90, 84, 95, 92, 86, 85, 92),
    makeDL('de4',  'Tyrell "Hammer" Price',  'DE', 'KC',  'Run Stuffer',    87, 93, 84, 85, 88, 93, 86),
    makeDL('de5',  'Antoine Jordan',         'DE', 'DET', 'Hybrid',         88, 86, 90, 88, 87, 87, 90),
    makeDL('de6',  'Kareem Finch',           'DE', 'BAL', 'Finesse',        86, 83, 93, 90, 85, 83, 91),
    makeDL('de7',  'Darius Lane',            'DE', 'MIN', 'Bull Rusher',    85, 90, 86, 85, 86, 90, 85),
    makeDL('de8',  '"Motor" Mitchell',       'DE', 'ATL', 'Non-Stop Motor', 83, 86, 88, 90, 84, 84, 86),
  ],
  DT: [
    makeDL('dt1',  '"Earthquake" Odom',     'DT', 'PIT', 'Space Eater',   94, 97, 80, 92, 93, 97, 90),
    makeDL('dt2',  'Marcus "Wall" Jackson', 'DT', 'PHI', 'Penetrator',    91, 93, 87, 90, 90, 93, 91),
    makeDL('dt3',  'Devon Colossus',        'DT', 'KC',  'Disruptor',     89, 94, 85, 88, 88, 92, 89),
    makeDL('dt4',  'Leroy "Big Train" Webb','DT', 'NO',  'Run Defender',  87, 95, 80, 85, 86, 95, 85),
    makeDL('dt5',  'Kareem "Chaos" Price',  'DT', 'SF',  'Pass Rusher',   88, 90, 88, 87, 87, 90, 90),
    makeDL('dt6',  'Dante Colossus',        'DT', 'DAL', 'Three-Tech',    85, 91, 86, 86, 85, 89, 88),
    makeDL('dt7',  'Antoine "Tank" Cross',  'DT', 'MIN', 'Nose Tackle',   84, 96, 78, 83, 84, 95, 82),
    makeDL('dt8',  'Victor Stone',          'DT', 'CLE', 'Balanced DT',   83, 90, 83, 84, 83, 87, 85),
  ],
  LB: [
    makeLB('lb1',  '"Missile" Morrison',    'BAL', 'Blitzer',       94, 90, 88, 93, 84, 97, 95),
    makeLB('lb2',  'Marcus "Brain" Stone',  'KC',  'Field General', 92, 85, 90, 90, 90, 88, 97),
    makeLB('lb3',  'Deon "Freight" Holt',   'PIT', 'Run Stopper',   90, 86, 95, 92, 82, 90, 90),
    makeLB('lb4',  'Caleb "Coverage" Adams','SF',  'Coverage LB',   88, 88, 83, 86, 93, 85, 88),
    makeLB('lb5',  'Tyrell Jackson',        'MIN', 'Three-Down',    87, 87, 87, 88, 87, 87, 87),
    makeLB('lb6',  'Andre "Savage" Webb',   'NO',  'Physical',      86, 83, 92, 90, 84, 92, 86),
    makeLB('lb7',  'Jordan "Seek" Kinley',  'DET', 'Pursuit',       85, 92, 84, 86, 86, 85, 85),
    makeLB('lb8',  'Devon Chambers',        'ATL', 'Hybrid',        84, 86, 85, 85, 86, 84, 84),
  ],
  CB: [
    makeCB('cb1',  '"Lockdown" Louis',      'PHI', 'Shutdown CB',   96, 93, 95, 90, 92, 97, 94),
    makeCB('cb2',  'Marcus "Shadow" Reeves','SF',  'Press Corner',  93, 91, 92, 88, 90, 94, 90),
    makeCB('cb3',  'Devon "Eraser" Cross',  'KC',  'Ball Hawk',     91, 90, 90, 92, 95, 88, 88),
    makeCB('cb4',  'Tyrell Williams',       'MIN', 'Zone Corner',   89, 88, 86, 93, 91, 87, 86),
    makeCB('cb5',  'Caleb "Quick" Jones',   'DET', 'Speed Corner',  88, 95, 89, 87, 90, 90, 83),
    makeCB('cb6',  'Jordan Finch',          'NO',  'Physical',      86, 86, 88, 87, 88, 90, 88),
    makeCB('cb7',  'Jayceon "Hawk" Davis',  'ATL', 'Nickel Back',   85, 90, 87, 89, 88, 86, 85),
    makeCB('cb8',  'Antonio Morrow',        'TEN', 'Press Specialist',84, 84, 92, 85, 87, 93, 84),
  ],
  S: [
    makeS('s1',  '"Sheriff" Santos',         'SF',  'Field General', 94, 88, 92, 86, 88, 92, 97),
    makeS('s2',  'Marcus "Hawk" Morrison',   'BAL', 'Ball Hawk',     92, 90, 93, 85, 95, 88, 92),
    makeS('s3',  'Deon "Boom" Coleman',      'KC',  'Hard Hitter',   90, 86, 89, 92, 86, 94, 88),
    makeS('s4',  'Devon "Cover 2" Raines',   'MIN', 'Zone S',        89, 88, 90, 83, 90, 86, 86),
    makeS('s5',  'Kareem Harrison',          'PHI', 'Range',         88, 92, 93, 82, 88, 84, 86),
    makeS('s6',  'Dante "Clutch" Parker',    'NO',  'Clutch',        86, 86, 88, 85, 87, 86, 90),
    makeS('s7',  'Victor "Lock" Lawrence',   'DET', 'Coverage',      85, 87, 87, 83, 90, 83, 87),
    makeS('s8',  'Antoine "Tank" Wells',     'TEN', 'Box Safety',    84, 83, 86, 90, 84, 92, 83),
  ],
  K: [
    makeK('k1',  '"Money" Martínez',         'KC',  'Clutch Kicker',  95, 88, 97, 97, 98, 90),
    makeK('k2',  'Aleksei "Boot" Volkov',    'PHI', 'Power Kicker',   92, 95, 88, 88, 88, 97),
    makeK('k3',  'Marco "Perfect" Rossi',    'SF',  'Accurate',       90, 85, 96, 95, 92, 88),
    makeK('k4',  'Tyler "Clutch" Webb',      'DAL', 'Dependable',     88, 90, 90, 92, 93, 90),
    makeK('k5',  'Brandon Long',             'NO',  'Long Range',     86, 94, 88, 86, 85, 94),
    makeK('k6',  'Jordan "Ice" Frost',       'DEN', 'Cold Weather',   84, 86, 92, 90, 91, 86),
    makeK('k7',  'Andre Precision',          'ATL', 'Technical',      83, 83, 94, 92, 89, 83),
    makeK('k8',  'Caleb Fieldgoal',          'CLE', 'Workhorse',      82, 87, 88, 86, 86, 87),
  ],
  P: [
    makeP('p1',  '"Boomer" Richardson',      'KC',  'Power Punter',  93, 96, 86, 95, 85, 90),
    makeP('p2',  'Aussie "Thunder" Scott',   'PHI', 'Rugby Style',   91, 94, 88, 94, 88, 89),
    makeP('p3',  'Marco "Coffin" Reyes',     'SF',  'Directional',   90, 86, 95, 86, 97, 92),
    makeP('p4',  'Tyler "Spin" Anderson',    'NO',  'Trick Punter',  87, 90, 87, 90, 86, 86),
    makeP('p5',  'Devon "Big Leg" Miles',    'DEN', 'Altitude',      85, 93, 85, 92, 83, 85),
    makeP('p6',  'Andre Consistency',        'ATL', 'Reliable',      84, 86, 90, 88, 88, 90),
    makeP('p7',  'Jordan "Clutch" Webb',     'MIN', 'High Pressure', 83, 84, 88, 86, 87, 88),
    makeP('p8',  'Caleb "Hang" Stratton',    'CLE', 'Hang Time',     82, 86, 86, 93, 83, 83),
  ],
}

// Get players for a given position
export function getPlayersForPosition(position: Position): PoolPlayer[] {
  return PLAYER_POOL[position] || []
}

// Get a random player from a position pool
export function getRandomPlayer(position: Position): PoolPlayer {
  const pool = getPlayersForPosition(position)
  return pool[Math.floor(Math.random() * pool.length)]
}

// Map position labels
export const POSITION_LABELS: Record<Position, string> = {
  QB: 'Quarterback',
  RB: 'Running Back',
  WR: 'Wide Receiver',
  TE: 'Tight End',
  OL: 'Offensive Lineman',
  DE: 'Defensive End',
  DT: 'Defensive Tackle',
  LB: 'Linebacker',
  CB: 'Cornerback',
  S: 'Safety',
  K: 'Kicker',
  P: 'Punter',
}

// Which attributes are "primary" for each position (shown prominently in wheel reveal)
export const POSITION_PRIMARY_ATTRS: Record<Position, string[]> = {
  QB: ['arm', 'accuracy', 'pocket'],
  RB: ['legs', 'agility', 'vision'],
  WR: ['legs', 'hands', 'routes'],
  TE: ['size', 'hands', 'blocking'],
  OL: ['size', 'passblock', 'runblock'],
  DE: ['legs', 'passrush', 'motor'],
  DT: ['size', 'power', 'passrush'],
  LB: ['tackle', 'awareness', 'blitz'],
  CB: ['man', 'zone', 'press'],
  S: ['coverage', 'ballhawk', 'range'],
  K: ['accuracy', 'legs', 'clutch'],
  P: ['accuracy', 'legs', 'hangtime'],
}

// Position groups for the selector
export const POSITION_GROUPS = [
  { label: 'Offense', positions: ['QB', 'RB', 'WR', 'TE', 'OL'] as Position[] },
  { label: 'Defense', positions: ['DE', 'DT', 'LB', 'CB', 'S'] as Position[] },
  { label: 'Special', positions: ['K', 'P'] as Position[] },
]
