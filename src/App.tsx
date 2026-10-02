/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, CharacterSkin, HoverboardSkin, Mission, Upgrades, PlayerStats, PowerUpType } from './game/types';
import { GameStorage } from './game/storage';
import { soundEngine } from './game/audio';
import { ThreeRunner } from './game/ThreeRunner';
import { StartupLogo } from './components/StartupLogo';
import { MainMenu } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { SkinsModal } from './components/SkinsModal';
import { BoardsModal } from './components/BoardsModal';
import { MissionsModal } from './components/MissionsModal';
import { ShopModal } from './components/ShopModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SPLASH');
  
  // Game Data & Progression
  const [skins, setSkins] = useState<CharacterSkin[]>([]);
  const [boards, setBoards] = useState<HoverboardSkin[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [upgrades, setUpgrades] = useState<Upgrades>(GameStorage.loadUpgrades());
  const [stats, setStats] = useState<PlayerStats>(GameStorage.loadStats());
  const [activeSkinId, setActiveSkinId] = useState<string>('marcus');
  const [activeBoardId, setActiveBoardId] = useState<string>('classic');
  const [boardInventory, setBoardInventory] = useState<number>(3);
  
  // Active In-Game Run State
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [runCoins, setRunCoins] = useState<number>(0);
  const [powerUps, setPowerUps] = useState<{ type: PowerUpType; timeLeft: number; duration: number }[]>([]);
  const [hoverboardActive, setHoverboardActive] = useState<boolean>(false);
  const [hoverboardTimeLeft, setHoverboardTimeLeft] = useState<number>(0);
  const [policeWarning, setPoliceWarning] = useState<'SAFE' | 'WARNING' | 'DANGER'>('SAFE');
  
  // Modals
  const [showSkinsModal, setShowSkinsModal] = useState<boolean>(false);
  const [showBoardsModal, setShowBoardsModal] = useState<boolean>(false);
  const [showMissionsModal, setShowMissionsModal] = useState<boolean>(false);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Game Over Results
  const [gameOverStats, setGameOverStats] = useState<{
    score: number;
    coins: number;
    distance: number;
    vehiclesJumped: number;
    gantriesSlid: number;
    survivalSecs: number;
  }>({ score: 0, coins: 0, distance: 0, vehiclesJumped: 0, gantriesSlid: 0, survivalSecs: 0 });
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [newlyUnlockedSkins, setNewlyUnlockedSkins] = useState<string[]>([]);
  const [newlyUnlockedBoards, setNewlyUnlockedBoards] = useState<string[]>([]);

  // DOM 3D Canvas ref & Engine Instance
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<ThreeRunner | null>(null);

  // Initialize storage state on mount
  useEffect(() => {
    setSkins(GameStorage.loadSkins());
    setBoards(GameStorage.loadBoards());
    setMissions(GameStorage.loadMissions());
    setUpgrades(GameStorage.loadUpgrades());
    setStats(GameStorage.loadStats());
    setActiveSkinId(GameStorage.getActiveSkinId());
    setActiveBoardId(GameStorage.getActiveBoardId());
    setBoardInventory(GameStorage.getBoardInventory());
  }, []);

  const activeSkin = skins.find(s => s.id === activeSkinId) || skins[0] || {
    id: 'marcus',
    name: 'Marcus',
    codename: 'REDLINE RUNNER',
    description: '',
    primaryColor: '#dc2626',
    accentColor: '#1e293b',
    skinTone: '#d4986a',
    hairColor: '#171717',
    unlocked: true,
    unlockCondition: '',
    rarity: 'Common',
    outfitStyle: 'hoodie'
  };

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0] || {
    id: 'classic',
    name: 'Synth Glider',
    description: '',
    color: '#06b6d4',
    trailColor: '#00f0ff',
    unlocked: true,
    unlockCondition: '',
    speedBonus: ''
  };

  // Callback to initialize 3D runner instance when ready
  const initRunner = useCallback(() => {
    if (!canvasContainerRef.current) return;
    if (runnerRef.current) return;

    const runner = new ThreeRunner(
      canvasContainerRef.current,
      activeSkin,
      activeBoard,
      {
        onScoreUpdate: (score) => setCurrentScore(score),
        onCoinsUpdate: (coins) => setRunCoins(coins),
        onPowerUpUpdate: (pups) => setPowerUps(pups),
        onHoverboardUpdate: (active, time) => {
          setHoverboardActive(active);
          setHoverboardTimeLeft(time);
        },
        onPoliceProximityUpdate: (_dist, warning) => setPoliceWarning(warning),
        onGameOver: (finalStats) => {
          handleRunOver(finalStats);
        },
        onMissionEvent: (type, count) => {
          handleMissionProgress(type, count, true);
        }
      }
    );

    runnerRef.current = runner;
  }, [activeSkin, activeBoard]);

  // Handle Game Over
  const handleRunOver = (finalStats: {
    score: number;
    coins: number;
    distance: number;
    vehiclesJumped: number;
    gantriesSlid: number;
    survivalSecs: number;
  }) => {
    setGameOverStats(finalStats);

    // Update Persistent Stats
    const prevStats = GameStorage.loadStats();
    const newRecord = finalStats.score > prevStats.highScore;
    setIsNewRecord(newRecord);

    const updatedStats: PlayerStats = {
      highScore: Math.max(prevStats.highScore, finalStats.score),
      totalCredits: prevStats.totalCredits + finalStats.coins,
      totalRuns: prevStats.totalRuns + 1,
      totalDistance: prevStats.totalDistance + finalStats.distance,
      vehiclesJumped: prevStats.vehiclesJumped + finalStats.vehiclesJumped,
      gantriesSlid: prevStats.gantriesSlid + finalStats.gantriesSlid,
      boardsUsedTotal: prevStats.boardsUsedTotal + (hoverboardActive ? 1 : 0),
      longestSurvivalSecs: Math.max(prevStats.longestSurvivalSecs, finalStats.survivalSecs)
    };

    GameStorage.saveStats(updatedStats);
    setStats(updatedStats);

    // Check Single-Run Missions
    const singleScoreResult = GameStorage.reportMetricProgress('score_single', finalStats.score, false);
    const singleCreditsResult = GameStorage.reportMetricProgress('credits_single', finalStats.coins, false);
    const careerScoreResult = GameStorage.reportMetricProgress('total_score', updatedStats.highScore, false);
    const lifetimeCreditsResult = GameStorage.reportMetricProgress('total_credits', updatedStats.totalCredits, false);
    const surviveResult = GameStorage.reportMetricProgress('survive_time', finalStats.survivalSecs, false);

    const unlockedS = [
      ...singleScoreResult.newlyUnlockedSkins,
      ...singleCreditsResult.newlyUnlockedSkins,
      ...careerScoreResult.newlyUnlockedSkins,
      ...lifetimeCreditsResult.newlyUnlockedSkins,
      ...surviveResult.newlyUnlockedSkins
    ];

    const unlockedB = [
      ...singleScoreResult.newlyUnlockedBoards,
      ...singleCreditsResult.newlyUnlockedBoards,
      ...careerScoreResult.newlyUnlockedBoards,
      ...lifetimeCreditsResult.newlyUnlockedBoards,
      ...surviveResult.newlyUnlockedBoards
    ];

    setNewlyUnlockedSkins(unlockedS);
    setNewlyUnlockedBoards(unlockedB);

    // Refresh state from storage
    setSkins(GameStorage.loadSkins());
    setBoards(GameStorage.loadBoards());
    setMissions(GameStorage.loadMissions());

    setGameState('GAMEOVER');
  };

  // Report real-time mission event (e.g. vehicle jumped, gantry slid)
  const handleMissionProgress = (metric: Mission['metric'], amount: number, isDelta: boolean) => {
    const res = GameStorage.reportMetricProgress(metric, amount, isDelta);
    if (res.newlyUnlockedMissions.length > 0) {
      setMissions(GameStorage.loadMissions());
      setSkins(GameStorage.loadSkins());
      setBoards(GameStorage.loadBoards());
    }
  };

  // Start run
  const startGame = () => {
    soundEngine.playClick();
    if (!runnerRef.current) {
      initRunner();
    }
    setCurrentScore(0);
    setRunCoins(0);
    setPowerUps([]);
    setHoverboardActive(false);
    setPoliceWarning('SAFE');
    runnerRef.current?.startRun();
    setGameState('PLAYING');
  };

  // Toggle Pause
  const togglePause = () => {
    if (gameState === 'PLAYING') {
      runnerRef.current?.setPaused(true);
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      runnerRef.current?.setPaused(false);
      setGameState('PLAYING');
    }
  };

  // Exit from pause or game over to lobby
  const exitToMenu = () => {
    runnerRef.current?.setPaused(false);
    runnerRef.current?.resetRun();
    setGameState('MENU');
  };

  // Deploy Hoverboard
  const handleDeployHoverboard = () => {
    if (boardInventory <= 0) return;
    if (runnerRef.current?.activateHoverboard()) {
      const newCount = boardInventory - 1;
      setBoardInventory(newCount);
      GameStorage.setBoardInventory(newCount);
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'SPLASH') {
        if (e.code === 'Space' || e.code === 'Enter') {
          soundEngine.startMusic();
          setGameState('MENU');
        }
        return;
      }

      if (gameState === 'MENU') {
        if (e.code === 'Space' || e.code === 'Enter') {
          startGame();
        }
        return;
      }

      if (gameState === 'PLAYING') {
        switch (e.code) {
          case 'ArrowLeft':
          case 'KeyA':
            runnerRef.current?.moveLeft();
            break;
          case 'ArrowRight':
          case 'KeyD':
            runnerRef.current?.moveRight();
            break;
          case 'ArrowUp':
          case 'KeyW':
            runnerRef.current?.jump();
            break;
          case 'ArrowDown':
          case 'KeyS':
            runnerRef.current?.slide();
            break;
          case 'Space':
            handleDeployHoverboard();
            break;
          case 'KeyP':
          case 'Escape':
            togglePause();
            break;
        }
      } else if (gameState === 'PAUSED') {
        if (e.code === 'KeyP' || e.code === 'Escape') {
          togglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, boardInventory]);

  // Touch Swipe Gesture detection
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTap = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;

      // Double tap detector for hoverboard
      const now = Date.now();
      if (now - lastTap < 300) {
        if (gameState === 'PLAYING') {
          handleDeployHoverboard();
        }
      }
      lastTap = now;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState !== 'PLAYING') return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      const threshold = 30;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > threshold) {
          runnerRef.current?.moveRight();
        } else if (diffX < -threshold) {
          runnerRef.current?.moveLeft();
        }
      } else {
        // Vertical swipe
        if (diffY < -threshold) {
          runnerRef.current?.jump();
        } else if (diffY > threshold) {
          runnerRef.current?.slide();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, boardInventory]);

  // Initialize runner when entering Menu state
  useEffect(() => {
    if (gameState !== 'SPLASH' && !runnerRef.current) {
      initRunner();
    }
  }, [gameState, initRunner]);

  // Update skin selection
  const handleSelectSkin = (skin: CharacterSkin) => {
    setActiveSkinId(skin.id);
    GameStorage.setActiveSkinId(skin.id);
    runnerRef.current?.updateSkin(skin);
  };

  // Update board selection
  const handleSelectBoard = (board: HoverboardSkin) => {
    setActiveBoardId(board.id);
    GameStorage.setActiveBoardId(board.id);
    runnerRef.current?.updateBoard(board);
  };

  // Upgrade power-up
  const handleUpgrade = (key: keyof Upgrades, cost: number) => {
    const newUpgrades = { ...upgrades, [key]: upgrades[key] + 1 };
    const newCredits = stats.totalCredits - cost;
    const newStats = { ...stats, totalCredits: newCredits };

    setUpgrades(newUpgrades);
    setStats(newStats);
    GameStorage.saveUpgrades(newUpgrades);
    GameStorage.saveStats(newStats);
  };

  // Buy hoverboard pack
  const handleBuyBoards = (amount: number, cost: number) => {
    const newCount = boardInventory + amount;
    const newCredits = stats.totalCredits - cost;
    const newStats = { ...stats, totalCredits: newCredits };

    setBoardInventory(newCount);
    setStats(newStats);
    GameStorage.setBoardInventory(newCount);
    GameStorage.saveStats(newStats);
  };

  const completedMissionsCount = missions.filter(m => m.completed).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 3D WebGL Three.js Canvas Container */}
      <div 
        ref={canvasContainerRef} 
        className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
      />

      {/* Cyberpunk Scanline Effect Overlay */}
      <div className="absolute inset-0 scanlines z-10 pointer-events-none" />

      {/* 1. STARTUP LOGO (Street Runner by Barrystudios) */}
      {gameState === 'SPLASH' && (
        <StartupLogo onEnter={() => setGameState('MENU')} />
      )}

      {/* 2. MAIN MENU / LOBBY */}
      {gameState === 'MENU' && (
        <MainMenu
          highScore={stats.highScore}
          totalCredits={stats.totalCredits}
          activeSkin={activeSkin}
          activeBoard={activeBoard}
          hoverboardInventory={boardInventory}
          completedMissionsCount={completedMissionsCount}
          totalMissionsCount={missions.length}
          onStartGame={startGame}
          onOpenSkins={() => setShowSkinsModal(true)}
          onOpenBoards={() => setShowBoardsModal(true)}
          onOpenMissions={() => setShowMissionsModal(true)}
          onOpenShop={() => setShowShopModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      )}

      {/* 3. IN-GAME HUD & PAUSE SCREEN */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <GameHUD
          score={currentScore}
          highScore={stats.highScore}
          coins={runCoins}
          multiplier={powerUps.some(p => p.type === 'MULTIPLIER') ? 2 : 1}
          powerUps={powerUps}
          hoverboardActive={hoverboardActive}
          hoverboardTimeLeft={hoverboardTimeLeft}
          hoverboardInventory={boardInventory}
          policeWarning={policeWarning}
          isPaused={gameState === 'PAUSED'}
          onPauseToggle={togglePause}
          onActivateHoverboard={handleDeployHoverboard}
          onExitRun={exitToMenu}
          onLeft={() => runnerRef.current?.moveLeft()}
          onRight={() => runnerRef.current?.moveRight()}
          onJump={() => runnerRef.current?.jump()}
          onSlide={() => runnerRef.current?.slide()}
        />
      )}

      {/* 4. GAME OVER RESULTS MODAL */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={gameOverStats}
          highScore={stats.highScore}
          isNewRecord={isNewRecord}
          unlockedSkins={newlyUnlockedSkins}
          unlockedBoards={newlyUnlockedBoards}
          onPlayAgain={startGame}
          onGoToMenu={exitToMenu}
        />
      )}

      {/* MODALS */}
      {showSkinsModal && (
        <SkinsModal
          skins={skins}
          activeSkinId={activeSkinId}
          missions={missions}
          onSelectSkin={handleSelectSkin}
          onClose={() => setShowSkinsModal(false)}
        />
      )}

      {showBoardsModal && (
        <BoardsModal
          boards={boards}
          activeBoardId={activeBoardId}
          missions={missions}
          onSelectBoard={handleSelectBoard}
          onClose={() => setShowBoardsModal(false)}
        />
      )}

      {showMissionsModal && (
        <MissionsModal
          missions={missions}
          onClose={() => setShowMissionsModal(false)}
        />
      )}

      {showShopModal && (
        <ShopModal
          upgrades={upgrades}
          coins={stats.totalCredits}
          hoverboardInventory={boardInventory}
          onUpgrade={handleUpgrade}
          onBuyHoverboards={handleBuyBoards}
          onClose={() => setShowShopModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
