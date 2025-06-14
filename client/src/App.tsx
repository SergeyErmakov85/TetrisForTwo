import React, { useState, useEffect, ChangeEvent } from "react";
import "@fontsource/inter";
import { useAudio } from "./lib/stores/useAudio";
import { useGame, GameMode, GamePhase } from "./lib/stores/useGame";
import { BOARD_WIDTH, BOARD_HEIGHT, TetrominoType } from "./lib/constants";
import GameBoard from "./components/GameBoard";
import CoopGameBoard from "./components/CoopGameBoard";

function App() {
  // Game audio
  const { 
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound, 
    playSuccess, 
    isMuted, 
    toggleMute 
  } = useAudio();
  
  // Game state
  const { 
    mode, 
    setMode, 
    scoreLimit, 
    setScoreLimit, 
    phase, 
    end, 
    restart 
  } = useGame();
  
  // UI state
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [showModeSelect, setShowModeSelect] = useState(true);
  const [showCoopSettings, setShowCoopSettings] = useState(false);
  const [showControlsGuide, setShowControlsGuide] = useState(false);
  const [tempScoreLimit, setTempScoreLimit] = useState(scoreLimit);
  
  // Player state
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1GameOver, setPlayer1GameOver] = useState(false);
  const [player2GameOver, setPlayer2GameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    try {
      const bgMusic = new Audio("/sounds/background.mp3");
      bgMusic.loop = true;
      bgMusic.volume = 0.4;
      setBackgroundMusic(bgMusic);

      const hitSfx = new Audio("/sounds/hit.mp3");
      setHitSound(hitSfx);

      const successSfx = new Audio("/sounds/success.mp3");
      setSuccessSound(successSfx);

      // Return cleanup function
      return () => {
        bgMusic.pause();
        hitSfx.pause();
        successSfx.pause();
      };
    } catch (err) {
      console.error("Failed to load audio:", err);
      return () => {};
    }
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  // Effect to start playing after countdown finishes
  useEffect(() => {
    if (countdown === null && !showModeSelect && !showCoopSettings) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [countdown, showModeSelect, showCoopSettings]);

  // Handle game mode selection
  const handleModeSelect = (selectedMode: GameMode) => {
    setMode(selectedMode);
    
    if (selectedMode === "coop") {
      // Show co-op settings screen before starting
      setShowCoopSettings(true);
    } else {
      startGame();
    }
  };
  
  // Handle score limit change
  const handleScoreLimitChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTempScoreLimit(value);
    }
  };
  
  // Start the game with a countdown
  const startGame = () => {
    setShowModeSelect(false);
    setShowCoopSettings(false);
    
    // Reset scores
    setScore(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1GameOver(false);
    setPlayer2GameOver(false);
    
    // Apply co-op score limit if in co-op mode
    if (mode === "coop") {
      setScoreLimit(tempScoreLimit);
    }
    
    // Start countdown
    let count = 3;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(interval);
        setTimeout(() => setCountdown(null), 1000);
      }
    }, 1000);
  };

  // Handle game over in co-op mode
  const handleCoopGameOver = () => {
    console.log('Co-op game over - returning to main menu');
    setShowModeSelect(true);
    setIsPlaying(false);
    setCountdown(3);
  };

  // Render the controls guide screen
  if (showControlsGuide) {
    return (
      <div style={{ 
        backgroundColor: "#111827", 
        width: "100vw", 
        height: "100vh", 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "'Inter', sans-serif",
        padding: "2rem"
      }}>
        <div style={{ 
          backgroundColor: "#1f2937",
          padding: "2rem",
          borderRadius: "1rem",
          width: "100%",
          maxWidth: "800px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            marginBottom: "2rem", 
            textAlign: "center",
            background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            🎮 Полная схема управления
          </h1>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "2rem",
            marginBottom: "2rem"
          }}>
            {/* Player 1 Controls */}
            <div style={{ 
              backgroundColor: "#374151",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              border: "2px solid #4f46e5"
            }}>
              <h2 style={{ 
                fontSize: "1.5rem", 
                marginBottom: "1rem", 
                color: "#4f46e5",
                textAlign: "center"
              }}>
                👤 Игрок 1 (WASD)
              </h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Влево:</span>
                  <kbd style={{ 
                    backgroundColor: "#4f46e5", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>A</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Вправо:</span>
                  <kbd style={{ 
                    backgroundColor: "#4f46e5", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>D</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Вниз (ускорение):</span>
                  <kbd style={{ 
                    backgroundColor: "#4f46e5", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>S</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Мгновенный сброс:</span>
                  <kbd style={{ 
                    backgroundColor: "#4f46e5", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>W</kbd>
                </div>
                <hr style={{ border: "1px solid #4b5563", margin: "0.5rem 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Поворот влево ↺:</span>
                  <kbd style={{ 
                    backgroundColor: "#059669", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>Q</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Поворот вправо ↻:</span>
                  <kbd style={{ 
                    backgroundColor: "#059669", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>E</kbd>
                </div>
              </div>
            </div>

            {/* Player 2 Controls */}
            <div style={{ 
              backgroundColor: "#374151",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              border: "2px solid #ef4444"
            }}>
              <h2 style={{ 
                fontSize: "1.5rem", 
                marginBottom: "1rem", 
                color: "#ef4444",
                textAlign: "center"
              }}>
                👤 Игрок 2 (Стрелки)
              </h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Влево:</span>
                  <kbd style={{ 
                    backgroundColor: "#ef4444", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>←</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Вправо:</span>
                  <kbd style={{ 
                    backgroundColor: "#ef4444", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>→</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Вниз (ускорение):</span>
                  <kbd style={{ 
                    backgroundColor: "#ef4444", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>↓</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Мгновенный сброс:</span>
                  <kbd style={{ 
                    backgroundColor: "#ef4444", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>↑</kbd>
                </div>
                <hr style={{ border: "1px solid #4b5563", margin: "0.5rem 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Поворот влево ↺:</span>
                  <kbd style={{ 
                    backgroundColor: "#059669", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>.</kbd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Поворот вправо ↻:</span>
                  <kbd style={{ 
                    backgroundColor: "#059669", 
                    color: "white", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "0.25rem",
                    fontWeight: "bold"
                  }}>/</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div style={{ 
            backgroundColor: "#374151",
            padding: "1.5rem",
            borderRadius: "0.75rem",
            marginBottom: "2rem",
            border: "2px solid #059669"
          }}>
            <h3 style={{ 
              fontSize: "1.25rem", 
              marginBottom: "1rem", 
              color: "#059669",
              textAlign: "center"
            }}>
              🔧 Особенности поворота
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>•</span>
                <span><strong>Wall Kicks:</strong> Если поворот невозможен, игра автоматически попробует сдвинуть фигурку влево или вправо</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>•</span>
                <span><strong>Блокировка поворота:</strong> Если поворот невозможен даже с wall kicks, фигурка останется в прежнем положении</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>•</span>
                <span><strong>Универсальность:</strong> Работает в обоих режимах - versus и co-op</span>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div style={{ textAlign: "center" }}>
            <button 
              onClick={() => setShowControlsGuide(false)}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#4f46e5",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "bold",
                transition: "all 0.2s",
                boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.4)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#4338ca";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#4f46e5";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              ← Назад в меню
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the co-op settings screen
  if (showCoopSettings) {
    return (
      <div style={{ 
        backgroundColor: "#111827", 
        width: "100vw", 
        height: "100vh", 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "'Inter', sans-serif"
      }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Co-op Mode Settings</h1>
        
        <div style={{ 
          backgroundColor: "#1f2937",
          padding: "2rem",
          borderRadius: "0.5rem",
          width: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "0.5rem"
          }}>
            <label htmlFor="scoreLimit" style={{ fontSize: "1.2rem" }}>
              Score to Win:
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input 
                id="scoreLimit"
                type="range" 
                min="500" 
                max="10000" 
                step="500" 
                value={tempScoreLimit}
                onChange={handleScoreLimitChange}
                style={{ flex: 1 }}
              />
              <input 
                type="number" 
                value={tempScoreLimit}
                onChange={handleScoreLimitChange}
                style={{ 
                  width: "100px", 
                  padding: "0.5rem",
                  backgroundColor: "#374151",
                  border: "1px solid #4b5563",
                  borderRadius: "0.25rem",
                  color: "white"
                }}
              />
            </div>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
              Work together to reach {tempScoreLimit} points to win!
            </p>
          </div>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            width: "100%",
            marginTop: "1rem"
          }}>
            <button 
              onClick={() => setShowCoopSettings(false)}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#4b5563",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
                cursor: "pointer"
              }}
            >
              Back
            </button>
            
            <button 
              onClick={startGame}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#059669",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
                cursor: "pointer"
              }}
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the mode selection screen
  if (showModeSelect) {
    return (
      <div style={{ 
        backgroundColor: "#111827", 
        width: "100vw", 
        height: "100vh", 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "'Inter', sans-serif"
      }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "3rem" }}>Two Player Tetris</h1>
        
        <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Select Game Mode</h2>
        
        <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          gap: "2rem",
          marginBottom: "2rem"
        }}>
          <button 
            onClick={() => handleModeSelect("versus")}
            style={{
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              backgroundColor: "#4f46e5",
              border: "none",
              borderRadius: "0.5rem",
              color: "white",
              cursor: "pointer"
            }}
          >
            Versus Mode
            <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
              Compete against each other on separate boards
            </div>
          </button>
          
          <button 
            onClick={() => handleModeSelect("coop")}
            style={{
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              backgroundColor: "#059669",
              border: "none",
              borderRadius: "0.5rem",
              color: "white",
              cursor: "pointer"
            }}
          >
            Co-op Mode
            <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
              Work together on the same board
            </div>
          </button>
        </div>

        {/* Controls Guide Button */}
        <button 
          onClick={() => setShowControlsGuide(true)}
          style={{
            padding: "0.5rem 1.5rem",
            fontSize: "0.9rem",
            backgroundColor: "transparent",
            border: "2px solid #6b7280",
            borderRadius: "0.5rem",
            color: "#9ca3af",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "#4f46e5";
            e.currentTarget.style.color = "#4f46e5";
            e.currentTarget.style.backgroundColor = "rgba(79, 70, 229, 0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "#6b7280";
            e.currentTarget.style.color = "#9ca3af";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <span style={{ fontSize: "1rem" }}>🎮</span>
          Полная схема управления
        </button>
      </div>
    );
  }

  // Render the game based on the selected mode
  return (
    <div style={{ 
      backgroundColor: "#111827", 
      width: "100vw", 
      height: "100vh", 
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontFamily: "'Inter', sans-serif"
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>
        Two Player Tetris - {mode === "versus" ? "Versus Mode" : "Co-op Mode"}
      </h1>
      
      {/* Game boards */}
      {mode === "versus" ? (
        // Versus mode with two separate boards
        <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          justifyContent: "center", 
          gap: "4rem" 
        }}>
          {/* Player 1 game board */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 style={{ color: "#4f46e5", marginBottom: "1rem" }}>Player 1</h2>
            <GameBoard 
              player={1}
              isGameOver={player1GameOver}
              setGameOver={setPlayer1GameOver}
              setScore={setPlayer1Score}
              isPlaying={isPlaying}
              width={300}
              height={600}
              boardWidth={BOARD_WIDTH}
              boardHeight={BOARD_HEIGHT}
            />
            <div style={{ marginTop: "1rem" }}>
              <p>Score: {player1Score}</p>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Controls: W,A,S,D + Q,E</p>
            </div>
          </div>
          
          {/* Player 2 game board */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Player 2</h2>
            <GameBoard 
              player={2}
              isGameOver={player2GameOver}
              setGameOver={setPlayer2GameOver}
              setScore={setPlayer2Score}
              isPlaying={isPlaying}
              width={300}
              height={600}
              boardWidth={BOARD_WIDTH}
              boardHeight={BOARD_HEIGHT}
            />
            <div style={{ marginTop: "1rem" }}>
              <p>Score: {player2Score}</p>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Controls: ↑,←,↓,→ + .,/</p>
            </div>
          </div>
        </div>
      ) : (
        // Co-op mode with a single, larger board
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ color: "#059669", marginBottom: "1rem" }}>Cooperative Mode</h2>
          <CoopGameBoard 
            width={400}
            height={600}
            boardWidth={14}
            boardHeight={24}
            isPlaying={isPlaying}
            score={score}
            setScore={setScore}
            onGameOver={handleCoopGameOver}
          />
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: "0.5rem" }}>
              <p>Team Score: <span className="score-change" style={{ color: "#10b981", fontWeight: "bold" }}>{score}</span></p>
              
              {/* Progress bar toward score limit */}
              <div style={{ width: "100%", marginTop: "0.25rem" }}>
                <div style={{ 
                  width: "100%", 
                  height: "0.5rem", 
                  backgroundColor: "#374151", 
                  borderRadius: "0.25rem",
                  overflow: "hidden"
                }}>
                  <div style={{ 
                    width: `${Math.min((score / scoreLimit) * 100, 100)}%`, 
                    height: "100%", 
                    backgroundColor: "#10b981",
                    transition: "width 0.5s ease"
                  }}></div>
                </div>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  fontSize: "0.7rem", 
                  color: "#9ca3af", 
                  marginTop: "0.25rem" 
                }}>
                  <span>{score}</span>
                  <span>Goal: {scoreLimit}</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", gap: "2rem", marginTop: "1rem" }}>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                <span style={{ color: "#4f46e5" }}>Player 1:</span> W,A,S,D + Q,E
              </p>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                <span style={{ color: "#ef4444" }}>Player 2:</span> ↑,←,↓,→ + .,/
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Game controls */}
      <div style={{ 
        marginTop: "2rem", 
        display: "flex",
        gap: "1rem"
      }}>
        <button 
          onClick={toggleMute}
          style={{ 
            cursor: "pointer", 
            padding: "0.5rem 1rem",
            backgroundColor: isMuted ? "#ef4444" : "#059669",
            border: "none",
            borderRadius: "4px",
            color: "white"
          }}
        >
          Sound: {isMuted ? "OFF" : "ON"}
        </button>
        
        <button 
          onClick={() => setShowModeSelect(true)}
          style={{ 
            cursor: "pointer", 
            padding: "0.5rem 1rem",
            backgroundColor: "#2a3145",
            border: "none",
            borderRadius: "4px",
            color: "white"
          }}
        >
          Change Mode
        </button>
        
        {/* Demo button to test scoring and victory condition in co-op mode */}
        {mode === "coop" && (
          <button 
            onClick={() => {
              const newScore = score + 500;
              setScore(newScore);
              playSuccess();
              
              // Check if we've hit the score limit
              if (newScore >= scoreLimit) {
                end(); // Trigger game end and victory screen
              }
            }}
            style={{ 
              cursor: "pointer", 
              padding: "0.5rem 1rem",
              backgroundColor: "#10b981",
              border: "none",
              borderRadius: "4px",
              color: "white"
            }}
          >
            Score +500 (Demo)
          </button>
        )}
      </div>
      
      {/* Countdown overlay */}
      {countdown !== null && (
        <div style={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: "2rem",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "3rem", marginBottom: "1rem" }}>{countdown}</h2>
          <p>Game starting...</p>
        </div>
      )}
      
      {/* Victory screen for co-op mode */}
      {phase === "ended" && mode === "coop" && (
        <div style={{ 
          position: "absolute", 
          top: "0", 
          left: "0",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: "2rem",
          textAlign: "center",
          zIndex: 100
        }}>
          <h2 style={{ 
            fontSize: "4rem", 
            marginBottom: "1rem", 
            color: "#10b981",
            textShadow: "0 0 10px rgba(16, 185, 129, 0.7)"
          }}>
            VICTORY!
          </h2>
          <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
            You reached the score goal of {scoreLimit}!
          </p>
          
          {/* Animated confetti-like elements */}
          <div style={{ position: "relative", width: "100%", height: "200px", marginBottom: "2rem" }}>
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  position: "absolute",
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
                  borderRadius: "50%",
                  animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            ))}
          </div>
          
          <div style={{ display: "flex", gap: "1rem" }}>
            <button 
              onClick={() => {
                restart();
                setShowModeSelect(true);
                setScore(0);
              }}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#4f46e5",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
                cursor: "pointer",
                fontSize: "1.1rem"
              }}
            >
              Change Mode
            </button>
            
            <button 
              onClick={() => {
                restart();
                setShowCoopSettings(true);
                setScore(0);
              }}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#10b981",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
                cursor: "pointer",
                fontSize: "1.1rem"
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {/* Game over screen for versus mode */}
      {(player1GameOver || player2GameOver) && mode === "versus" && (
        <div style={{ 
          position: "absolute", 
          top: "0", 
          left: "0",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: "2rem",
          textAlign: "center",
          zIndex: 100
        }}>
          <h2 style={{ 
            fontSize: "3rem", 
            marginBottom: "1rem", 
            color: "#ef4444"
          }}>
            Game Over!
          </h2>
          
          {player1GameOver && player2GameOver ? (
            <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
              Both players lost!
            </p>
          ) : (
            <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
              {player1GameOver ? "Player 2 Wins!" : "Player 1 Wins!"}
            </p>
          )}
          
          <div style={{ marginBottom: "2rem" }}>
            <p>Player 1 Score: {player1Score}</p>
            <p>Player 2 Score: {player2Score}</p>
          </div>
          
          <div style={{ display: "flex", gap: "1rem" }}>
            <button 
              onClick={() => {
                setShowModeSelect(true);
                setPlayer1GameOver(false);
                setPlayer2GameOver(false);
                setPlayer1Score(0);
                setPlayer2Score(0);
              }}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#4f46e5",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
                cursor: "pointer",
                fontSize: "1.1rem"
              }}
            >
              Main Menu
            </button>
            
            <button 
              onClick={() => {
                setPlayer1GameOver(false);
                setPlayer2GameOver(false);
                setPlayer1Score(0);
                setPlayer2Score(0);
                startGame();
              }}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#10b981",
                border: "none",
                borderRadius: "0.5rem",
                color: "white",
                cursor: "pointer",
                fontSize: "1.1rem"
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;