import React, { useState, useEffect } from "react";
import "@fontsource/inter";
import { useAudio } from "./lib/stores/useAudio";
import { useGame, GameMode } from "./lib/stores/useGame";

// Simple 2D version of the game for testing display
function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const { mode, setMode } = useGame();
  const [countdown, setCountdown] = useState<number | null>(3);
  const [showModeSelect, setShowModeSelect] = useState(true);

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
    setShowModeSelect(false);
    
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
              {/* Grid cells */}
              {Array.from({ length: 200 }).map((_, i) => (
                <div key={i} style={{ backgroundColor: "#374151" }}></div>
              ))}
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
              {/* Grid cells */}
              {Array.from({ length: 200 }).map((_, i) => (
                <div key={i} style={{ backgroundColor: "#374151" }}></div>
              ))}
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
            {/* Grid cells for co-op mode (larger grid) */}
            {Array.from({ length: 336 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: "#374151" }}></div>
            ))}
          </div>
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <p>Team Score: 0</p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "2rem", marginTop: "0.5rem" }}>
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
    </div>
  );
}

export default App;
