import type { Position, CareerStage, GameplayMode } from './database'

export type { Position, CareerStage, GameplayMode }

// ---- Stats interfaces (position-specific) ----

export interface QBStats {
  passing_yards: number
  passing_tds: number
  completions: number
  attempts: number
  completion_pct: number
  interceptions: number
  passer_rating: number
  sacks_taken: number
  rushing_yards: number
  rushing_tds: number
}

export interface RBStats {
  rushing_yards: number
  rushing_tds: number
  carries: number
  yards_per_carry: number
  fumbles: number
  longest_run: number
  receptions: number
  receiving_yards: number
  receiving_tds: number
}

export interface WRStats {
  receptions: number
  receiving_yards: number
  receiving_tds: number
  targets: number
  drops: number
  yards_per_reception: number
  longest_reception: number
}

export interface TEStats extends WRStats {
  blocking_grade: number
}

export interface OLStats {
  pass_blocks: number
  run_blocks: number
  sacks_allowed: number
  penalties: number
  blocking_grade: number
}

export interface DefensiveStats {
  tackles: number
  solo_tackles: number
  assisted_tackles: number
  sacks: number
  interceptions: number
  forced_fumbles: number
  pass_deflections: number
  defensive_tds: number
  fumble_recoveries: number
  tfl: number  // tackles for loss
}

export interface KickerStats {
  fg_made: number
  fg_attempted: number
  fg_pct: number
  longest_fg: number
  xp_made: number
  xp_attempted: number
}

export interface PunterStats {
  punts: number
  punting_yards: number
  avg_yards: number
  touchbacks: number
  inside_20: number
  longest_punt: number
}

export type GameStats = QBStats | RBStats | WRStats | TEStats | OLStats | DefensiveStats | KickerStats | PunterStats

// ---- Player creation types ----

export interface PlayerBuild {
  name: string
  nickname?: string
  position: Position
  skin_tone: string
  hair_style: string
  hair_color: string
  face_style: string
  body_build: 'slim' | 'athletic' | 'power' | 'big'
  height_inches: number
  weight_lbs: number
  jersey_number: number
  helmet_style: string
  visor?: string
  gloves?: string
  cleats?: string
  sleeve?: string
  accessories: string[]
  primary_color: string
  secondary_color: string
  uniform_style: string
  celebration: string
}

// ---- Career story event types ----

export interface StoryChoice {
  id: string
  text: string
  reputation_change: number
  outcome: string
  unlocks?: string[]
}

export interface StoryEvent {
  id: string
  event_type: string
  title: string
  description: string
  choices: StoryChoice[]
  position_specific?: Position[]
  stage: CareerStage
}

// ---- NFL Teams ----

export const NFL_TEAMS = [
  { abbr: 'ARI', name: 'Arizona Cardinals', city: 'Arizona', conference: 'NFC', division: 'West' },
  { abbr: 'ATL', name: 'Atlanta Falcons', city: 'Atlanta', conference: 'NFC', division: 'South' },
  { abbr: 'BAL', name: 'Baltimore Ravens', city: 'Baltimore', conference: 'AFC', division: 'North' },
  { abbr: 'BUF', name: 'Buffalo Bills', city: 'Buffalo', conference: 'AFC', division: 'East' },
  { abbr: 'CAR', name: 'Carolina Panthers', city: 'Carolina', conference: 'NFC', division: 'South' },
  { abbr: 'CHI', name: 'Chicago Bears', city: 'Chicago', conference: 'NFC', division: 'North' },
  { abbr: 'CIN', name: 'Cincinnati Bengals', city: 'Cincinnati', conference: 'AFC', division: 'North' },
  { abbr: 'CLE', name: 'Cleveland Browns', city: 'Cleveland', conference: 'AFC', division: 'North' },
  { abbr: 'DAL', name: 'Dallas Cowboys', city: 'Dallas', conference: 'NFC', division: 'East' },
  { abbr: 'DEN', name: 'Denver Broncos', city: 'Denver', conference: 'AFC', division: 'West' },
  { abbr: 'DET', name: 'Detroit Lions', city: 'Detroit', conference: 'NFC', division: 'North' },
  { abbr: 'GB',  name: 'Green Bay Packers', city: 'Green Bay', conference: 'NFC', division: 'North' },
  { abbr: 'HOU', name: 'Houston Texans', city: 'Houston', conference: 'AFC', division: 'South' },
  { abbr: 'IND', name: 'Indianapolis Colts', city: 'Indianapolis', conference: 'AFC', division: 'South' },
  { abbr: 'JAX', name: 'Jacksonville Jaguars', city: 'Jacksonville', conference: 'AFC', division: 'South' },
  { abbr: 'KC',  name: 'Kansas City Chiefs', city: 'Kansas City', conference: 'AFC', division: 'West' },
  { abbr: 'LV',  name: 'Las Vegas Raiders', city: 'Las Vegas', conference: 'AFC', division: 'West' },
  { abbr: 'LAC', name: 'Los Angeles Chargers', city: 'Los Angeles', conference: 'AFC', division: 'West' },
  { abbr: 'LAR', name: 'Los Angeles Rams', city: 'Los Angeles', conference: 'NFC', division: 'West' },
  { abbr: 'MIA', name: 'Miami Dolphins', city: 'Miami', conference: 'AFC', division: 'East' },
  { abbr: 'MIN', name: 'Minnesota Vikings', city: 'Minnesota', conference: 'NFC', division: 'North' },
  { abbr: 'NE',  name: 'New England Patriots', city: 'New England', conference: 'AFC', division: 'East' },
  { abbr: 'NO',  name: 'New Orleans Saints', city: 'New Orleans', conference: 'NFC', division: 'South' },
  { abbr: 'NYG', name: 'New York Giants', city: 'New York', conference: 'NFC', division: 'East' },
  { abbr: 'NYJ', name: 'New York Jets', city: 'New York', conference: 'AFC', division: 'East' },
  { abbr: 'PHI', name: 'Philadelphia Eagles', city: 'Philadelphia', conference: 'NFC', division: 'East' },
  { abbr: 'PIT', name: 'Pittsburgh Steelers', city: 'Pittsburgh', conference: 'AFC', division: 'North' },
  { abbr: 'SF',  name: 'San Francisco 49ers', city: 'San Francisco', conference: 'NFC', division: 'West' },
  { abbr: 'SEA', name: 'Seattle Seahawks', city: 'Seattle', conference: 'NFC', division: 'West' },
  { abbr: 'TB',  name: 'Tampa Bay Buccaneers', city: 'Tampa Bay', conference: 'NFC', division: 'South' },
  { abbr: 'TEN', name: 'Tennessee Titans', city: 'Tennessee', conference: 'AFC', division: 'South' },
  { abbr: 'WAS', name: 'Washington Commanders', city: 'Washington', conference: 'NFC', division: 'East' },
] as const

export const COLLEGES = [
  'Alabama', 'Ohio State', 'Georgia', 'Michigan', 'LSU', 'Clemson', 'Notre Dame', 'Oklahoma',
  'Texas', 'Penn State', 'Oregon', 'USC', 'Florida', 'Tennessee', 'Florida State', 'Miami',
  'Auburn', 'Texas A&M', 'Wisconsin', 'Iowa', 'Nebraska', 'Kansas City', 'Washington', 'Utah',
  'Baylor', 'TCU', 'Cincinnati', 'UCF', 'BYU', 'Coastal Carolina', 'Ole Miss', 'Mississippi State'
] as const

export const HS_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
] as const
