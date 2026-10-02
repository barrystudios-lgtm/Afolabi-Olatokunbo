export type GameState = 'SPLASH' | 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type PowerUpType = 'MAGNET' | 'JETPACK' | 'SNEAKERS' | 'MULTIPLIER';

export interface PowerUpActive {
  type: PowerUpType;
  timeLeft: number;
  duration: number;
}

export interface CharacterSkin {
  id: string;
  name: string;
  codename: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  skinTone: string;
  hairColor: string;
  unlocked: boolean;
  unlockCondition: string;
  missionId?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  outfitStyle: 'hoodie' | 'track' | 'tactical' | 'biker' | 'athlete' | 'enforcer';
}

export interface HoverboardSkin {
  id: string;
  name: string;
  description: string;
  color: string;
  accentColor: string;
  unlocked: boolean;
  unlockCondition: string;
  missionId?: string;
  speedBonus: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  rewardType: 'skin' | 'board' | 'credits';
  rewardId?: string;
  rewardAmount?: number;
  rewardName: string;
  metric: 'score_single' | 'credits_single' | 'slides_gantry' | 'jumps_vehicle' | 'boards_used' | 'survive_time' | 'total_credits' | 'total_score';
}

export interface Upgrades {
  magnetLevel: number;    // 1 - 5
  jetpackLevel: number;   // 1 - 5
  sneakersLevel: number;  // 1 - 5
  multiplierLevel: number;// 1 - 5
}

export interface PlayerStats {
  highScore: number;
  totalCredits: number;
  totalRuns: number;
  totalDistance: number;
  vehiclesJumped: number;
  gantriesSlid: number;
  boardsUsedTotal: number;
  longestSurvivalSecs: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  style: string;
}

export interface AudioSettings {
  musicMuted: boolean;
  sfxMuted: boolean;
  musicVolume: number;
  sfxVolume: number;
  currentTrackId: string;
}
