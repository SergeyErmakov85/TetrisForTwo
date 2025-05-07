import { useEffect, useState, useCallback } from "react";
import { Text } from "@react-three/drei";
import GameBoard from "./GameBoard";
import GameUI from "./GameUI";
import GameControls from "./GameControls";
import { useAudio } from "../lib/stores/useAudio";
import { useGame } from "../lib/stores/useGame";

const TetrisGame = () => {
  const { backgroundMusic, toggleMute, isMuted } = useAudio();
  const { phase, start, restart } = useGame();
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1GameOver, setPlayer1GameOver] = useState(false);
  const [player2GameOver, setPlayer2GameOver] = useState(false);
  const [startCountdown, setStartCountdown] = useState(3);

  // Callback functions to avoid re-renders
  const handlePlayer1GameOver = useCallback((isOver: boolean) => {
    setPlayer1GameOver(isOver);
  }, []);

  const handlePlayer2GameOver = useCallback((isOver: boolean) => {
    setPlayer2GameOver(isOver);
  }, []);

  const handlePlayer1Score = useCallback((score: number) => {
    setPlayer1Score(score);
  }, []);

  const handlePlayer2Score = useCallback((score: number) => {
    setPlayer2Score(score);
  }, []);

  // Auto-start the game after a countdown
  useEffect(() => {
    if (phase === "ready") {
      const countdownInterval = setInterval(() => {
        setStartCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            start();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [phase, start]);

  // Handle music playback
  useEffect(() => {
    if (backgroundMusic && phase === "playing" && !isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }

    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [backgroundMusic, phase, isMuted]);

  // Check for game over condition
  useEffect(() => {
    if (player1GameOver && player2GameOver && phase === "playing") {
      // End the game when both players are done
      restart();
      setStartCountdown(3);
      // Reset game over states - will be picked up by the GameBoards through isPlaying prop
      setPlayer1GameOver(false);
      setPlayer2GameOver(false);
    }
  }, [player1GameOver, player2GameOver, phase, restart]);

  return (
    <group>
      {/* Game title */}
      <Text
        position={[0, 9, 0]}
        fontSize={1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        TWO PLAYER TETRIS
      </Text>
      
      {/* Player 1 Board (Left) */}
      <group position={[-6, 0, 0]}>
        <Text
          position={[0, 8, 0]}
          fontSize={0.7}
          color="#4f46e5"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          PLAYER 1
        </Text>
        <GameBoard 
          player={1}
          position={[0, 0, 0]} 
          isGameOver={player1GameOver}
          setGameOver={handlePlayer1GameOver}
          setScore={handlePlayer1Score}
          isPlaying={phase === "playing"}
        />
        <GameUI 
          player={1} 
          score={player1Score} 
          isGameOver={player1GameOver}
          position={[0, -8, 0]}
        />
      </group>

      {/* Player 2 Board (Right) */}
      <group position={[6, 0, 0]}>
        <Text
          position={[0, 8, 0]}
          fontSize={0.7}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          PLAYER 2
        </Text>
        <GameBoard 
          player={2}
          position={[0, 0, 0]} 
          isGameOver={player2GameOver}
          setGameOver={handlePlayer2GameOver}
          setScore={handlePlayer2Score}
          isPlaying={phase === "playing"}
        />
        <GameUI 
          player={2} 
          score={player2Score} 
          isGameOver={player2GameOver}
          position={[0, -8, 0]}
        />
      </group>

      {/* Controls instructions */}
      <group position={[0, -10, 0]}>
        <Text
          position={[-6, 0, 0]}
          fontSize={0.4}
          color="#9ca3af"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          Controls: W,A,S,D + Q,E
        </Text>
        <Text
          position={[6, 0, 0]}
          fontSize={0.4}
          color="#9ca3af"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          Controls: ↑,←,↓,→ + .,/
        </Text>
      </group>

      {/* Sound toggle */}
      <group position={[0, -8.5, 0]} onClick={() => toggleMute()}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="#9ca3af"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          Sound: {isMuted ? "OFF" : "ON"}
        </Text>
      </group>

      {/* Countdown overlay */}
      {phase === "ready" && startCountdown > 0 && (
        <Text
          position={[0, 0, 5]}
          fontSize={3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          {startCountdown}
        </Text>
      )}

      {/* Controls component to handle keyboard input */}
      <GameControls />
    </group>
  );
};

export default TetrisGame;
