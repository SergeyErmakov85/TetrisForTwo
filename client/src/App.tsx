import React, { useState, useEffect, ChangeEvent } from "react";
import "@fontsource/inter";
import { useAudio } from "./lib/stores/useAudio";
import { useGame, GameMode, GamePhase } from "./lib/stores/useGame";
import { TETROMINOES, TETROMINO_COLORS, TetrominoType } from "./lib/constants";

// Simple 2D version of the game for testing display
function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound, playSuccess } = useAudio();
  const { mode, setMode, scoreLimit, setScoreLimit, phase, end, restart } = useGame();
  const [score, setScore] = useState(0);
  
  // For demo: displaying sample Tetris pieces
  const [player1Board, setPlayer1Board] = useState<(TetrominoType | null)[][]>(
    Array(20).fill(null).map(() => Array(10).fill(null))
  );
  const [player2Board, setPlayer2Board] = useState<(TetrominoType | null)[][]>(
    Array(20).fill(null).map(() => Array(10).fill(null))
  );
  const [coopBoard, setCoopBoard] = useState<(TetrominoType | null)[][]>(
    Array(24).fill(null).map(() => Array(14).fill(null))
  );
  const [countdown, setCountdown] = useState<number | null>(3);
  const [showModeSelect, setShowModeSelect] = useState(true);
  const [showCoopSettings, setShowCoopSettings] = useState(false);
  const [tempScoreLimit, setTempScoreLimit] = useState(scoreLimit);

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
  
  // Create sample tetris pieces for visualization
  useEffect(() => {
    if (countdown === null && !showModeSelect && !showCoopSettings) {
      // Sample pieces for the boards after countdown ends
      const tetrisTypes: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
      
      // Create sample pieces for player 1 board
      const p1Board = Array(20).fill(null).map(() => Array(10).fill(null));
      // Add some blocks at the bottom for player 1
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 10; x++) {
          if (Math.random() > 0.5) {
            p1Board[19-y][x] = tetrisTypes[Math.floor(Math.random() * tetrisTypes.length)];
          }
        }
      }
      // Add active piece for player 1 (T shape at top)
      p1Board[0][4] = 'T';
      p1Board[1][3] = 'T';
      p1Board[1][4] = 'T';
      p1Board[1][5] = 'T';
      setPlayer1Board(p1Board);
      
      // Create sample pieces for player 2 board
      const p2Board = Array(20).fill(null).map(() => Array(10).fill(null));
      // Add some blocks at the bottom for player 2
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 10; x++) {
          if (Math.random() > 0.4) {
            p2Board[19-y][x] = tetrisTypes[Math.floor(Math.random() * tetrisTypes.length)];
          }
        }
      }
      // Add active piece for player 2 (I shape at top)
      p2Board[0][3] = 'I';
      p2Board[0][4] = 'I';
      p2Board[0][5] = 'I';
      p2Board[0][6] = 'I';
      setPlayer2Board(p2Board);
      
      // Create sample pieces for coop board
      const cBoard = Array(24).fill(null).map(() => Array(14).fill(null));
      // Add some blocks at the bottom
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 14; x++) {
          if (Math.random() > 0.5) {
            cBoard[23-y][x] = tetrisTypes[Math.floor(Math.random() * tetrisTypes.length)];
          }
        }
      }
      // Add player 1 piece (L shape on left)
      cBoard[5][3] = 'L';
      cBoard[6][3] = 'L';
      cBoard[7][3] = 'L';
      cBoard[7][4] = 'L';
      
      // Add player 2 piece (S shape on right)
      cBoard[4][10] = 'S';
      cBoard[4][11] = 'S';
      cBoard[5][9] = 'S';
      cBoard[5][10] = 'S';
      setCoopBoard(cBoard);
    }
  }, [countdown, showModeSelect, showCoopSettings]);

  // Start the game with a countdown
  const startGame = () => {
    setShowModeSelect(false);
    setShowCoopSettings(false);
    
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
          gap: "2rem"
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
            <div style={{ 
              width: "300px", 
              height: "600px", 
              backgroundColor: "#1f2937", 
              border: "2px solid #4f46e5",
              display: "grid",
              gridTemplateColumns: "repeat(10, 1fr)",
              gridTemplateRows: "repeat(20, 1fr)",
              gap: "1px",
              padding: "2px"
            }}>
              {/* Grid cells with Tetris pieces */}
              {player1Board.flat().map((cell, i) => {
                const x = i % 10;
                const y = Math.floor(i / 10);
                return (
                  <div 
                    key={i} 
                    style={{ 
                      backgroundColor: cell ? TETROMINO_COLORS[cell] : "#374151",
                      boxShadow: cell ? "inset 0 0 5px rgba(255,255,255,0.5)" : "none",
                      borderRadius: cell ? "2px" : "0"
                    }}
                  />
                );
              })}
            </div>
            <div style={{ marginTop: "1rem" }}>
              <p>Score: 0</p>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Controls: W,A,S,D + Q,E</p>
            </div>
          </div>
          
          {/* Player 2 game board */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Player 2</h2>
            <div style={{ 
              width: "300px", 
              height: "600px", 
              backgroundColor: "#1f2937", 
              border: "2px solid #ef4444",
              display: "grid",
              gridTemplateColumns: "repeat(10, 1fr)",
              gridTemplateRows: "repeat(20, 1fr)",
              gap: "1px",
              padding: "2px"
            }}>
              {/* Grid cells with Tetris pieces */}
              {player2Board.flat().map((cell, i) => {
                const x = i % 10;
                const y = Math.floor(i / 10);
                return (
                  <div 
                    key={i} 
                    style={{ 
                      backgroundColor: cell ? TETROMINO_COLORS[cell] : "#374151",
                      boxShadow: cell ? "inset 0 0 5px rgba(255,255,255,0.5)" : "none",
                      borderRadius: cell ? "2px" : "0"
                    }}
                  />
                );
              })}
            </div>
            <div style={{ marginTop: "1rem" }}>
              <p>Score: 0</p>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Controls: ↑,←,↓,→ + .,/</p>
            </div>
          </div>
        </div>
      ) : (
        // Co-op mode with a single, larger board
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ color: "#059669", marginBottom: "1rem" }}>Cooperative Mode</h2>
          <div style={{ 
            width: "400px", 
            height: "600px", 
            backgroundColor: "#1f2937", 
            border: "2px solid #059669",
            display: "grid",
            gridTemplateColumns: "repeat(14, 1fr)",
            gridTemplateRows: "repeat(24, 1fr)",
            gap: "1px",
            padding: "2px"
          }}>
            {/* Grid cells with Tetris pieces for co-op mode */}
            {coopBoard.flat().map((cell, i) => {
              const x = i % 14;
              const y = Math.floor(i / 14);
              return (
                <div 
                  key={i} 
                  style={{ 
                    backgroundColor: cell ? TETROMINO_COLORS[cell] : "#374151",
                    boxShadow: cell ? "inset 0 0 5px rgba(255,255,255,0.5)" : "none",
                    borderRadius: cell ? "2px" : "0"
                  }}
                />
              );
            })}
          </div>
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
          style={{ 
            cursor: "pointer", 
            padding: "0.5rem 1rem",
            backgroundColor: "#2a3145",
            border: "none",
            borderRadius: "4px",
            color: "white"
          }}
        >
          Sound: ON
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
    </div>
  );
}

export default App;
