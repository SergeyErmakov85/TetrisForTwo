import React from "react";
import "@fontsource/inter";
import { useAudio } from "./lib/stores/useAudio";
import { useEffect } from "react";

// Simple 2D version of the game for testing display
function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

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
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Two Player Tetris</h1>
      
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
      
      <p style={{ 
        marginTop: "2rem", 
        cursor: "pointer", 
        padding: "0.5rem 1rem",
        backgroundColor: "#2a3145",
        borderRadius: "4px"
      }}>
        Sound: ON
      </p>
      
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
        <h2 style={{ fontSize: "3rem", marginBottom: "1rem" }}>3</h2>
        <p>Game starting...</p>
      </div>
    </div>
  );
}

export default App;
