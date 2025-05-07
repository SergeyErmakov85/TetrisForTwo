import { useRef, useState, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import Piece from "./Piece";
import { useTetris } from "../hooks/useTetris";
import { 
  BOARD_WIDTH, 
  BOARD_HEIGHT, 
  PLAYER_CONTROLS,
  TETROMINO_COLORS
} from "../lib/constants";
import { useAudio } from "../lib/stores/useAudio";

interface GameBoardProps {
  player: 1 | 2;
  position: [number, number, number];
  isGameOver: boolean;
  setGameOver: (value: boolean) => void;
  setScore: (value: number) => void;
  isPlaying: boolean;
}

const GameBoard = ({ 
  player, 
  position, 
  isGameOver, 
  setGameOver, 
  setScore,
  isPlaying
}: GameBoardProps) => {
  const boardRef = useRef<THREE.Group>(null);
  const { 
    board, 
    activePiece, 
    nextPiece,
    movePiece,
    rotatePiece,
    hardDrop,
    score,
    gameOver,
    reset
  } = useTetris(player);
  
  const { playHit, playSuccess } = useAudio();
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [dropInterval, setDropInterval] = useState(1000); // 1 second per drop
  const [lastSuccessfulDrop, setLastSuccessfulDrop] = useState(0);
  
  // Get player-specific controls based on player number
  const controlMapping = PLAYER_CONTROLS[player];
  
  // Get keyboard state without causing rerenders
  const moveLeft = useKeyboardControls(state => state[controlMapping.moveLeft]);
  const moveRight = useKeyboardControls(state => state[controlMapping.moveRight]);
  const moveDown = useKeyboardControls(state => state[controlMapping.moveDown]);
  const rotateLeft = useKeyboardControls(state => state[controlMapping.rotateLeft]);
  const rotateRight = useKeyboardControls(state => state[controlMapping.rotateRight]);
  const drop = useKeyboardControls(state => state[controlMapping.hardDrop]);

  // Update parent component with game over state
  useEffect(() => {
    if (gameOver !== isGameOver) {
      setGameOver(gameOver);
    }
  }, [gameOver, setGameOver, isGameOver]);

  // Update parent component with score
  useEffect(() => {
    setScore(score);
  }, [score, setScore]);

  // Reset the game when isPlaying changes to true
  useEffect(() => {
    if (isPlaying) {
      reset();
    }
  }, [isPlaying, reset]);

  // Process a game frame
  const processGameFrame = useCallback((currentTime: number) => {
    if (isGameOver || !isPlaying) return false;
    
    // Handle automatic dropping
    if (currentTime - lastSuccessfulDrop > dropInterval) {
      const success = movePiece(0, -1);
      if (success) {
        setLastSuccessfulDrop(currentTime);
      }
    }
    
    // Adjust keyboard input rate to prevent too rapid movement
    if (currentTime - lastMoveTime > 100) { // 100ms rate limit on key presses
      let moved = false;
      
      if (moveLeft) {
        moved = movePiece(-1, 0);
        if (moved) playHit();
      }
      
      if (moveRight) {
        moved = movePiece(1, 0);
        if (moved) playHit();
      }
      
      if (moveDown) {
        moved = movePiece(0, -1);
        if (moved) {
          // Reset the drop timer when manually moving down
          setLastSuccessfulDrop(currentTime);
        }
      }
      
      if (rotateLeft) {
        moved = rotatePiece('left');
        if (moved) playHit();
      }
      
      if (rotateRight) {
        moved = rotatePiece('right');
        if (moved) playHit();
      }
      
      if (drop) {
        const linesCleared = hardDrop();
        if (linesCleared > 0) {
          playSuccess();
          
          // Make the game slightly faster after clearing lines
          setDropInterval(prev => Math.max(100, prev - 20));
        }
      }
      
      if (moved) {
        setLastMoveTime(currentTime);
        return true;
      }
    }
    
    return false;
  }, [isGameOver, isPlaying, lastSuccessfulDrop, dropInterval, lastMoveTime, 
      moveLeft, moveRight, moveDown, rotateLeft, rotateRight, drop, 
      movePiece, rotatePiece, hardDrop, playHit, playSuccess]);

  // Handle the automatic dropping of pieces and keyboard input
  useFrame(() => {
    const currentTime = Date.now();
    processGameFrame(currentTime);
  });

  return (
    <group ref={boardRef} position={position}>
      {/* Game board background */}
      <mesh position={[0, 0, -0.1]} receiveShadow>
        <planeGeometry args={[BOARD_WIDTH + 0.2, BOARD_HEIGHT + 0.2]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      
      {/* Board grid lines for visual clarity */}
      {Array.from({ length: BOARD_WIDTH + 1 }).map((_, i) => (
        <mesh key={`vline-${i}`} position={[i - BOARD_WIDTH / 2, 0, 0]}>
          <boxGeometry args={[0.02, BOARD_HEIGHT, 0.01]} />
          <meshStandardMaterial color="#4b5563" transparent opacity={0.3} />
        </mesh>
      ))}
      {Array.from({ length: BOARD_HEIGHT + 1 }).map((_, i) => (
        <mesh key={`hline-${i}`} position={[0, i - BOARD_HEIGHT / 2, 0]}>
          <boxGeometry args={[BOARD_WIDTH, 0.02, 0.01]} />
          <meshStandardMaterial color="#4b5563" transparent opacity={0.3} />
        </mesh>
      ))}
      
      {/* Render the active falling piece */}
      {activePiece && activePiece.shape.map((row, y) => 
        row.map((cell, x) => {
          if (cell) {
            const worldX = x + activePiece.position.x - BOARD_WIDTH / 2 + 0.5;
            const worldY = y + activePiece.position.y - BOARD_HEIGHT / 2 + 0.5;
            return (
              <Piece 
                key={`active-${x}-${y}`} 
                position={[worldX, worldY, 0]}
                color={TETROMINO_COLORS[activePiece.type]}
              />
            );
          }
          return null;
        })
      )}
      
      {/* Render the static board pieces */}
      {board.map((row, y) => 
        row.map((cell, x) => {
          if (cell) {
            const worldX = x - BOARD_WIDTH / 2 + 0.5;
            const worldY = y - BOARD_HEIGHT / 2 + 0.5;
            return (
              <Piece 
                key={`board-${x}-${y}`} 
                position={[worldX, worldY, 0]}
                color={TETROMINO_COLORS[cell]}
              />
            );
          }
          return null;
        })
      )}
      
      {/* Next piece preview (top right of the board) */}
      <group position={[0, BOARD_HEIGHT / 2 + 2, 0]}>
        {nextPiece && nextPiece.shape.map((row, y) => 
          row.map((cell, x) => {
            if (cell) {
              return (
                <Piece 
                  key={`next-${x}-${y}`} 
                  position={[x - 1.5, -y - 0.5, 0]}
                  color={TETROMINO_COLORS[nextPiece.type]}
                  scale={0.8}
                />
              );
            }
            return null;
          })
        )}
      </group>
      
      {/* Game Over Overlay */}
      {isGameOver && (
        <mesh position={[0, 0, 0.5]}>
          <planeGeometry args={[BOARD_WIDTH, BOARD_HEIGHT]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};

export default GameBoard;
