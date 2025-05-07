import React, { useEffect, useState, useRef } from 'react';
import { useTetris } from '../hooks/useTetris';
import { TETROMINO_COLORS, PLAYER_CONTROLS, TetrominoType } from '../lib/constants';
import { useAudio } from '../lib/stores/useAudio';

interface GameBoardProps {
  player: 1 | 2;
  position?: [number, number, number]; // Used for 3D positioning (not used in 2D mode)
  isGameOver: boolean;
  setGameOver: (value: boolean) => void;
  setScore: (value: number) => void;
  isPlaying: boolean;
  width: number;
  height: number;
  boardWidth: number;
  boardHeight: number;
}

const GameBoard: React.FC<GameBoardProps> = ({
  player,
  isGameOver,
  setGameOver,
  setScore,
  isPlaying,
  width,
  height,
  boardWidth,
  boardHeight
}) => {
  // Initialize Tetris game logic
  const {
    board,
    activePiece,
    nextPiece,
    score,
    gameOver,
    movePiece,
    rotatePiece,
    hardDrop,
    reset
  } = useTetris(player);
  
  const { playHit } = useAudio();
  const lastKeyPressTime = useRef<{[key: string]: number}>({});
  const keyRepeatDelay = 100; // ms delay before repeating a key press
  const gameLoopRef = useRef<number | null>(null);
  const lastDropTime = useRef<number>(Date.now());
  const dropInterval = useRef<number>(1000); // Start with 1 second between drops
  
  // Copy the gameOver state to parent component
  useEffect(() => {
    if (gameOver !== isGameOver) {
      setGameOver(gameOver);
    }
  }, [gameOver, isGameOver, setGameOver]);
  
  // Update parent score
  useEffect(() => {
    setScore(score);
  }, [score, setScore]);
  
  // Reset the game when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      reset();
    }
  }, [isPlaying, reset]);
  
  // Handle keyboard input
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    
    // Get the controls for this player
    const controls = PLAYER_CONTROLS[player];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      // Don't process repeated keys too quickly (except for hard drop)
      if (
        lastKeyPressTime.current[e.code] && 
        now - lastKeyPressTime.current[e.code] < keyRepeatDelay &&
        !isControlKey(e.code, controls.hardDrop)
      ) {
        return;
      }
      
      lastKeyPressTime.current[e.code] = now;
      
      // Check which control was pressed
      if (isControlKey(e.code, controls.moveLeft)) {
        if (movePiece(-1, 0)) playHit();
      } else if (isControlKey(e.code, controls.moveRight)) {
        if (movePiece(1, 0)) playHit();
      } else if (isControlKey(e.code, controls.moveDown)) {
        if (movePiece(0, -1)) playHit();
      } else if (isControlKey(e.code, controls.rotateLeft)) {
        if (rotatePiece('left')) playHit();
      } else if (isControlKey(e.code, controls.rotateRight)) {
        if (rotatePiece('right')) playHit();
      } else if (isControlKey(e.code, controls.hardDrop)) {
        hardDrop();
        playHit();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Reset the key press time when key is released
      delete lastKeyPressTime.current[e.code];
    };
    
    // Helper to check if a key matches a control
    function isControlKey(keyCode: string, controlName: string): boolean {
      // Map control names to their key codes
      const controlMap: Record<string, string[]> = {
        'player1MoveLeft': ['KeyA'],
        'player1MoveRight': ['KeyD'],
        'player1MoveDown': ['KeyS'],
        'player1RotateLeft': ['KeyQ'],
        'player1RotateRight': ['KeyE'],
        'player1HardDrop': ['KeyW'],
        'player2MoveLeft': ['ArrowLeft'],
        'player2MoveRight': ['ArrowRight'],
        'player2MoveDown': ['ArrowDown'],
        'player2RotateLeft': ['Period'],
        'player2RotateRight': ['Slash'],
        'player2HardDrop': ['ArrowUp']
      };
      
      return controlMap[controlName]?.includes(keyCode) || false;
    }
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver, player, movePiece, rotatePiece, hardDrop, playHit]);
  
  // Game loop - auto-drop pieces
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    const gameLoop = () => {
      const now = Date.now();
      
      // Auto-drop the active piece
      if (now - lastDropTime.current > dropInterval.current) {
        movePiece(0, -1);
        lastDropTime.current = now;
        
        // Gradually increase the drop speed as score increases
        dropInterval.current = Math.max(100, 1000 - Math.floor(score / 500) * 100);
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    // Clean up the game loop
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [isPlaying, isGameOver, movePiece, score]);
  
  // Render the combined state - board with active piece overlaid
  const combinedBoard = board.map(row => [...row]);
  
  // Overlay the active piece on the board
  if (activePiece) {
    activePiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = y + activePiece.position.y;
          const boardX = x + activePiece.position.x;
          if (
            boardY >= 0 && 
            boardY < boardHeight && 
            boardX >= 0 && 
            boardX < boardWidth
          ) {
            combinedBoard[boardY][boardX] = activePiece.type;
          }
        }
      });
    });
  }
  
  return (
    <div 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`, 
        backgroundColor: "#1f2937", 
        border: `2px solid ${player === 1 ? "#4f46e5" : "#ef4444"}`,
        display: "grid",
        gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
        gridTemplateRows: `repeat(${boardHeight}, 1fr)`,
        gap: "1px",
        padding: "2px"
      }}
    >
      {/* Render the combined board with active pieces */}
      {combinedBoard.flat().map((cell, i) => (
        <div 
          key={i} 
          style={{ 
            backgroundColor: cell ? TETROMINO_COLORS[cell] : "#374151",
            boxShadow: cell ? "inset 0 0 5px rgba(255,255,255,0.5)" : "none",
            borderRadius: cell ? "2px" : "0"
          }}
        />
      ))}
    </div>
  );
};

export default GameBoard;