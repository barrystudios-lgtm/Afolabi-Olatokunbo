// Storage & Progression Manager for Street Runner by Barrystudios
// Realistic Daylight Urban City Chase

import { CharacterSkin, HoverboardSkin, Mission, Upgrades, PlayerStats } from './types';

export const INITIAL_SKINS: CharacterSkin[] = [
  {
    id: 'marcus',
    name: 'Marcus',
    codename: 'REDLINE RUNNER',
    description: 'Agile street sprinter wearing a bold crimson athletic hoodie, cargo joggers, and high-top running kicks.',
    primaryColor: '#dc2626', // Bold Crimson Red Hoodie
    accentColor: '#1e293b',  // Dark Slate Jeans
    skinTone: '#d4986a',     // Natural Skin Tone
    hairColor: '#171717',
    unlocked: true,
    unlockCondition: 'Unlocked by default',
    rarity: 'Common',
    outfitStyle: 'hoodie'
  },
  {
    id: 'aria',
    name: 'Aria',
    codename: 'URBAN VIPER',
    description: 'Parkour athlete equipped with a sleek teal windbreaker, reflective running leggings, and responsive trail trainers.',
    primaryColor: '#0d9488', // Bold Teal
    accentColor: '#0f172a',  // Black Tactical Pants
    skinTone: '#eec29a',
    hairColor: '#331800',
    unlocked: false,
    unlockCondition: 'Slide under 5 highway gantries',
    missionId: 'm_slide_gantries',
    rarity: 'Rare',
    outfitStyle: 'athlete'
  },
  {
    id: 'dante',
    name: 'Dante',
    codename: 'TRACK CHAMPION',
    description: 'Elite urban track sprinter wearing a dynamic golden-yellow varsity jacket with navy blue track accents.',
    primaryColor: '#eab308', // Bold Golden Yellow
    accentColor: '#1e3a8a',  // Deep Navy Blue
    skinTone: '#a26a42',
    hairColor: '#0a0a0a',
    unlocked: false,
    unlockCondition: 'Score 3,000 points in a single run',
    missionId: 'm_score_3000',
    rarity: 'Epic',
    outfitStyle: 'track'
  },
  {
    id: 'valkyrie',
    name: 'Maya',
    codename: 'SKYLINK AERO',
    description: 'Freerunning specialist in a pristine arctic-white flight jacket, tactical harness, and reinforced shock boots.',
    primaryColor: '#f8fafc', // Crisp White
    accentColor: '#0284c7',  // Sky Blue
    skinTone: '#f2cdb3',
    hairColor: '#ca8a04',
    unlocked: false,
    unlockCondition: 'Jump over 12 traffic vehicles',
    missionId: 'm_jump_vehicles',
    rarity: 'Epic',
    outfitStyle: 'tactical'
  },
  {
    id: 'enforcer',
    name: 'Officer Vance',
    codename: 'PATROL ENFORCER',
    description: 'Reprogrammed humanoid tactical android officer wearing navy highway patrol ballistic armor and gold badge.',
    primaryColor: '#1e3a5f', // Police Navy Blue
    accentColor: '#f59e0b',  // Gold Police Trim
    skinTone: '#94a3b8',     // Tactical Android Chrome / Synthetic
    hairColor: '#0f172a',
    unlocked: false,
    unlockCondition: 'Survive 60 seconds with Police in pursuit',
    missionId: 'm_survive_police',
    rarity: 'Legendary',
    outfitStyle: 'enforcer'
  },
  {
    id: 'rex',
    name: 'Rex',
    codename: 'HIGHWAY OVERDRIVE',
    description: 'Veteran street racer in a heavy black leather motorcycle jacket, reinforced carbon shoulder pads, and leather boots.',
    primaryColor: '#18181b', // Matte Black Leather
    accentColor: '#ea580c',  // Racing Orange
    skinTone: '#c68642',
    hairColor: '#262626',
    unlocked: false,
    unlockCondition: 'Collect 250 Coins in one run',
    missionId: 'm_credits_single',
    rarity: 'Legendary',
    outfitStyle: 'biker'
  }
];

export const INITIAL_BOARDS: HoverboardSkin[] = [
  {
    id: 'classic',
    name: 'Aero Deck',
    description: 'Commercial magnetic hoverboard with brushed aluminum deck and dual high-speed repulsors.',
    color: '#0284c7',
    accentColor: '#38bdf8',
    unlocked: true,
    unlockCondition: 'Unlocked by default',
    speedBonus: '+10% Glide Stability'
  },
  {
    id: 'vortex',
    name: 'Vortex Sport',
    description: 'High-torque aerodynamic board in racing crimson with dual anti-gravity rotors.',
    color: '#e11d48',
    accentColor: '#fda4af',
    unlocked: false,
    unlockCondition: 'Deploy Hoverboard 3 times in runs',
    missionId: 'm_boards_deploy',
    speedBonus: '+15% Crash Absorption'
  },
  {
    id: 'cyberblade',
    name: 'Carbon Edge',
    description: 'Ultra-lightweight matte carbon-fiber racing wing engineered for lightning-fast lane shifts.',
    color: '#27272a',
    accentColor: '#10b981',
    unlocked: false,
    unlockCondition: 'Reach 5,000 total career score',
    missionId: 'm_score_career',
    speedBonus: '+20% Lane Shift Speed'
  },
  {
    id: 'chrono',
    name: 'Apex Gold',
    description: 'Custom luxury mag-lev deck finished in mirror gold with magnetic coin attractor field.',
    color: '#d97706',
    accentColor: '#fef08a',
    unlocked: false,
    unlockCondition: 'Collect 500 total lifetime credits',
    missionId: 'm_lifetime_credits',
    speedBonus: '+25% Coin Pull Radius'
  }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm_slide_gantries',
    title: 'Gantry Low Rider',
    description: 'Slide under 5 overhead highway road signs',
    target: 5,
    progress: 0,
    completed: false,
    rewardType: 'skin',
    rewardId: 'aria',
    rewardName: 'Aria (Urban Viper) Skin',
    metric: 'slides_gantry'
  },
  {
    id: 'm_score_3000',
    title: 'High Velocity',
    description: 'Score 3,000 points in a single daylight highway run',
    target: 3000,
    progress: 0,
    completed: false,
    rewardType: 'skin',
    rewardId: 'dante',
    rewardName: 'Dante (Track Champion) Skin',
    metric: 'score_single'
  },
  {
    id: 'm_jump_vehicles',
    title: 'Traffic Leaper',
    description: 'Jump cleanly over 12 cars or highway trucks',
    target: 12,
    progress: 0,
    completed: false,
    rewardType: 'skin',
    rewardId: 'valkyrie',
    rewardName: 'Maya (Skylink Aero) Skin',
    metric: 'jumps_vehicle'
  },
  {
    id: 'm_survive_police',
    title: 'Highway Fugitive',
    description: 'Survive for 60 seconds with Police in pursuit',
    target: 60,
    progress: 0,
    completed: false,
    rewardType: 'skin',
    rewardId: 'enforcer',
    rewardName: 'Officer Vance Skin',
    metric: 'survive_time'
  },
  {
    id: 'm_credits_single',
    title: 'Cash Haul',
    description: 'Collect 250 Coins in a single highway run',
    target: 250,
    progress: 0,
    completed: false,
    rewardType: 'skin',
    rewardId: 'rex',
    rewardName: 'Rex (Highway Overdrive) Skin',
    metric: 'credits_single'
  },
  {
    id: 'm_boards_deploy',
    title: 'Hoverboard Ace',
    description: 'Deploy your Hoverboard 3 times during runs',
    target: 3,
    progress: 0,
    completed: false,
    rewardType: 'board',
    rewardId: 'vortex',
    rewardName: 'Vortex Sport Board',
    metric: 'boards_used'
  },
  {
    id: 'm_score_career',
    title: 'Highway Legend',
    description: 'Amass 5,000 total career points across all runs',
    target: 5000,
    progress: 0,
    completed: false,
    rewardType: 'board',
    rewardId: 'cyberblade',
    rewardName: 'Carbon Edge Board',
    metric: 'total_score'
  },
  {
    id: 'm_lifetime_credits',
    title: 'Coin Collector',
    description: 'Collect 500 total lifetime coins from traffic',
    target: 500,
    progress: 0,
    completed: false,
    rewardType: 'board',
    rewardId: 'chrono',
    rewardName: 'Apex Gold Board',
    metric: 'total_credits'
  }
];

export const INITIAL_UPGRADES: Upgrades = {
  magnetLevel: 1,
  jetpackLevel: 1,
  sneakersLevel: 1,
  multiplierLevel: 1
};

export const INITIAL_STATS: PlayerStats = {
  highScore: 0,
  totalCredits: 0,
  totalRuns: 0,
  totalDistance: 0,
  vehiclesJumped: 0,
  gantriesSlid: 0,
  boardsUsedTotal: 0,
  longestSurvivalSecs: 0
};

const STORAGE_KEYS = {
  SKINS: 'street_runner_skins_v2',
  BOARDS: 'street_runner_boards_v2',
  MISSIONS: 'street_runner_missions_v2',
  UPGRADES: 'street_runner_upgrades_v2',
  STATS: 'street_runner_stats_v2',
  ACTIVE_SKIN: 'street_runner_active_skin_v2',
  ACTIVE_BOARD: 'street_runner_active_board_v2',
  BOARD_INVENTORY: 'street_runner_board_count_v2'
};

export class GameStorage {
  public static loadSkins(): CharacterSkin[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SKINS);
      if (data) {
        const stored: CharacterSkin[] = JSON.parse(data);
        return INITIAL_SKINS.map(s => {
          const match = stored.find(x => x.id === s.id);
          return match ? { ...s, unlocked: match.unlocked || s.unlocked } : s;
        });
      }
    } catch {
      // fallback
    }
    return INITIAL_SKINS;
  }

  public static saveSkins(skins: CharacterSkin[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SKINS, JSON.stringify(skins));
    } catch {
      // ignore
    }
  }

  public static loadBoards(): HoverboardSkin[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOARDS);
      if (data) {
        const stored: HoverboardSkin[] = JSON.parse(data);
        return INITIAL_BOARDS.map(b => {
          const match = stored.find(x => x.id === b.id);
          return match ? { ...b, unlocked: match.unlocked || b.unlocked } : b;
        });
      }
    } catch {
      // fallback
    }
    return INITIAL_BOARDS;
  }

  public static saveBoards(boards: HoverboardSkin[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
    } catch {
      // ignore
    }
  }

  public static loadMissions(): Mission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      if (data) {
        const stored: Mission[] = JSON.parse(data);
        return INITIAL_MISSIONS.map(m => {
          const match = stored.find(x => x.id === m.id);
          return match ? { ...m, progress: match.progress, completed: match.completed } : m;
        });
      }
    } catch {
      // fallback
    }
    return INITIAL_MISSIONS;
  }

  public static saveMissions(missions: Mission[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
    } catch {
      // ignore
    }
  }

  public static loadUpgrades(): Upgrades {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UPGRADES);
      if (data) return { ...INITIAL_UPGRADES, ...JSON.parse(data) };
    } catch {
      // fallback
    }
    return INITIAL_UPGRADES;
  }

  public static saveUpgrades(upgrades: Upgrades) {
    try {
      localStorage.setItem(STORAGE_KEYS.UPGRADES, JSON.stringify(upgrades));
    } catch {
      // ignore
    }
  }

  public static loadStats(): PlayerStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (data) return { ...INITIAL_STATS, ...JSON.parse(data) };
    } catch {
      // fallback
    }
    return INITIAL_STATS;
  }

  public static saveStats(stats: PlayerStats) {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }

  public static getActiveSkinId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SKIN) || 'marcus';
  }

  public static setActiveSkinId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SKIN, id);
  }

  public static getActiveBoardId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BOARD) || 'classic';
  }

  public static setActiveBoardId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BOARD, id);
  }

  public static getBoardInventory(): number {
    const val = localStorage.getItem(STORAGE_KEYS.BOARD_INVENTORY);
    return val ? parseInt(val, 10) : 3;
  }

  public static setBoardInventory(count: number) {
    localStorage.setItem(STORAGE_KEYS.BOARD_INVENTORY, count.toString());
  }

  public static reportMetricProgress(
    metric: Mission['metric'],
    amount: number,
    isDelta = true
  ): { newlyUnlockedMissions: Mission[]; newlyUnlockedSkins: string[]; newlyUnlockedBoards: string[] } {
    const missions = this.loadMissions();
    const skins = this.loadSkins();
    const boards = this.loadBoards();
    
    const newlyUnlockedMissions: Mission[] = [];
    const newlyUnlockedSkins: string[] = [];
    const newlyUnlockedBoards: string[] = [];

    missions.forEach(mission => {
      if (mission.metric === metric && !mission.completed) {
        if (isDelta) {
          mission.progress = Math.min(mission.target, mission.progress + amount);
        } else {
          mission.progress = Math.min(mission.target, Math.max(mission.progress, amount));
        }

        if (mission.progress >= mission.target && !mission.completed) {
          mission.completed = true;
          newlyUnlockedMissions.push(mission);

          if (mission.rewardType === 'skin' && mission.rewardId) {
            const skin = skins.find(s => s.id === mission.rewardId);
            if (skin && !skin.unlocked) {
              skin.unlocked = true;
              newlyUnlockedSkins.push(skin.name);
            }
          } else if (mission.rewardType === 'board' && mission.rewardId) {
            const board = boards.find(b => b.id === mission.rewardId);
            if (board && !board.unlocked) {
              board.unlocked = true;
              newlyUnlockedBoards.push(board.name);
            }
          }
        }
      }
    });

    if (newlyUnlockedMissions.length > 0) {
      this.saveMissions(missions);
      this.saveSkins(skins);
      this.saveBoards(boards);
    }

    return { newlyUnlockedMissions, newlyUnlockedSkins, newlyUnlockedBoards };
  }
}
