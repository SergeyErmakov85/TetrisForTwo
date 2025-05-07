import React, { useEffect, useState, useRef } from 'react';
import { useTetris } from '../hooks/useTetris';
import { TETROMINO_COLORS, PLAYER_CONTROLS, TetrominoType } from '../lib/constants';
import { useAudio } from '../lib/stores/useAudio';
import { useGame } from '../lib/stores/useGame';

interface CoopGameBoardProps {
  width: number;
  height: number;
  boardWidth: number;
  boardHeight: number;
  isPlaying: boolean;
  score: number;
  setScore: (value: number) => void;
}

const CoopGameBoard: React.FC<CoopGameBoardProps> = ({
  width,
  height,
  boardWidth,
  boardHeight,
  isPlaying,
  score,
  setScore
}) => {
  // We'll use player 1's board as the main game board in co-op mode
  const tetrisPlayer1 = useTetris(1);
  const tetrisPlayer2 = useTetris(2);
  
  const { playHit, playSuccess } = useAudio();
  const { phase, end, scoreLimit } = useGame();
  
  // Track if each player's piece is active
  const [player1Active, setPlayer1Active] = useState(true);
  const [player2Active, setPlayer2Active] = useState(true);
  
  // Refs for key input handling
  const lastKeyPressTime = useRef<{[key: string]: number}>({});
  const keyRepeatDelay = 100; // ms delay before repeating a key press
  
  // Game loop refs
  const gameLoopRef = useRef<number | null>(null);
  const p1LastDropTime = useRef<number>(Date.now());
  const p2LastDropTime = useRef<number>(Date.now());
  const dropInterval = useRef<number>(1000); // Start with 1 second between drops
  
  // Total score is the sum of both players' scores
  const totalScore = tetrisPlayer1.score + tetrisPlayer2.score;
  
  // Update the parent's score state
  useEffect(() => {
    setScore(totalScore);
    
    // Check win condition
    if (totalScore >= scoreLimit && phase !== "ended") {
      playSuccess();
      end();
    }
  }, [totalScore, setScore, playSuccess, end, scoreLimit, phase]);
  
  // Reset both players' games when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      tetrisPlayer1.reset();
      tetrisPlayer2.reset();
      setPlayer1Active(true);
      setPlayer2Active(true);
    }
  }, [isPlaying, tetrisPlayer1.reset, tetrisPlayer2.reset]);
  
  // Handle game over conditions
  useEffect(() => {
    if (tetrisPlayer1.gameOver) {
      setPlayer1Active(false);
    }
    
    if (tetrisPlayer2.gameOver) {
      setPlayer2Active(false);
    }
    
    // If both players are game over, end the game
    if (tetrisPlayer1.gameOver && tetrisPlayer2.gameOver && phase !== "ended") {
      end();
    }
  }, [tetrisPlayer1.gameOver, tetrisPlayer2.gameOver, end, phase]);
  
  // Handle keyboard input
  useEffect(() => {
    if (!isPlaying) return;
    
    const p1Controls = PLAYER_CONTROLS[1];
    const p2Controls = PLAYER_CONTROLS[2];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // Don't process repeated keys too quickly (except for hard drop)
      if (
        lastKeyPressTime.current[e.code] && 
        now - lastKeyPressTime.current[e.code] < keyRepeatDelay &&
        !isControlKey(e.code, p1Controls.hardDrop) && 
        !isControlKey(e.code, p2Controls.hardDrop)
      ) {
        return;
      }
      
      lastKeyPressTime.current[e.code] = now;
      
      // Player 1 controls
      if (player1Active) {
        if (isControlKey(e.code, p1Controls.moveLeft)) {
          if (tetrisPlayer1.movePiece(-1, 0)) playHit();
        } else if (isControlKey(e.code, p1Controls.moveRight)) {
          if (tetrisPlayer1.movePiece(1, 0)) playHit();
        } else if (isControlKey(e.code, p1Controls.moveDown)) {
          if (tetrisPlayer1.movePiece(0, -1)) playHit();
        } else if (isControlKey(e.code, p1Controls.rotateLeft)) {
          if (tetrisPlayer1.rotatePiece('left')) playHit();
        } else if (isControlKey(e.code, p1Controls.rotateRight)) {
          if (tetrisPlayer1.rotatePiece('right')) playHit();
        } else if (isControlKey(e.code, p1Controls.hardDrop)) {
          tetrisPlayer1.hardDrop();
          playHit();
        }
      }
      
      // Player 2 controls
      if (player2Active) {
        if (isControlKey(e.code, p2Controls.moveLeft)) {
          if (tetrisPlayer2.movePiece(-1, 0)) playHit();
        } else if (isControlKey(e.code, p2Controls.moveRight)) {
          if (tetrisPlayer2.movePiece(1, 0)) playHit();
        } else if (isControlKey(e.code, p2Controls.moveDown)) {
          if (tetrisPlayer2.movePiece(0, -1)) playHit();
        } else if (isControlKey(e.code, p2Controls.rotateLeft)) {
          if (tetrisPlayer2.rotatePiece('left')) playHit();
        } else if (isControlKey(e.code, p2Controls.rotateRight)) {
          if (tetrisPlayer2.rotatePiece('right')) playHit();
        } else if (isControlKey(e.code, p2Controls.hardDrop)) {
          tetrisPlayer2.hardDrop();
          playHit();
        }
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
  }, [
    isPlaying, 
    player1Active, 
    player2Active, 
    tetrisPlayer1.movePiece, 
    tetrisPlayer1.rotatePiece, 
    tetrisPlayer1.hardDrop,
    tetrisPlayer2.movePiece, 
    tetrisPlayer2.rotatePiece, 
    tetrisPlayer2.hardDrop,
    playHit
  ]);
  
  // Game loop - auto-drop pieces
  useEffect(() => {
    if (!isPlaying) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    const gameLoop = () => {
      const now = Date.now();
      
      // Update drop interval based on score
      dropInterval.current = Math.max(100, 1000 - Math.floor(totalScore / 1000) * 100);
      
      // Auto-drop player 1's piece
      if (player1Active && now - p1LastDropTime.current > dropInterval.current) {
        tetrisPlayer1.movePiece(0, -1);
        p1LastDropTime.current = now;
      }
      
      // Auto-drop player 2's piece
      if (player2Active && now - p2LastDropTime.current > dropInterval.current) {
        tetrisPlayer2.movePiece(0, -1);
        p2LastDropTime.current = now;
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
  }, [isPlaying, player1Active, player2Active, tetrisPlayer1.movePiece, tetrisPlayer2.movePiece, totalScore]);
  
  // Create a combined board from both players' boards
  // For co-op mode, we'll show both players' pieces on the same board
  const p1Board = tetrisPlayer1.board;
  const p2Board = tetrisPlayer2.board;
  
  // Start with empty board of the specified size
  const combinedBoard: (TetrominoType | null)[][] = Array(boardHeight)
    .fill(null)
    .map(() => Array(boardWidth).fill(null));
  
  // Copy player 1's board to the left side of the combined board
  p1Board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell && y < boardHeight && x < boardWidth) {
        combinedBoard[y][x] = cell;
      }
    });
  });
  
  // Copy player 2's board to the right side of the combined board
  p2Board.forEach((row, y) => {
    row.forEach((cell, x) => {
      // Shift player 2's board to the right
      const boardX = x + boardWidth - p2Board[0].length;
      if (cell && y < boardHeight && boardX >= 0 && boardX < boardWidth) {
        combinedBoard[y][boardX] = cell;
      }
    });
  });
  
  // Overlay player 1's active piece on the combined board
  if (player1Active && tetrisPlayer1.activePiece) {
    const piece = tetrisPlayer1.activePiece;
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = y + piece.position.y;
          const boardX = x + piece.position.x;
          if (
            boardY >= 0 && 
            boardY < boardHeight && 
            boardX >= 0 && 
            boardX < boardWidth
          ) {
            combinedBoard[boardY][boardX] = piece.type;
          }
        }
      });
    });
  }
  
  // Overlay player 2's active piece on the combined board
  if (player2Active && tetrisPlayer2.activePiece) {
    const piece = tetrisPlayer2.activePiece;
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = y + piece.position.y;
          // Shift player 2's piece to the right
          const boardX = x + piece.position.x + boardWidth - p2Board[0].length;
          if (
            boardY >= 0 && 
            boardY < boardHeight && 
            boardX >= 0 && 
            boardX < boardWidth
          ) {
            combinedBoard[boardY][boardX] = piece.type;
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
        border: "2px solid #059669",
        display: "grid",
        gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
        gridTemplateRows: `repeat(${boardHeight}, 1fr)`,
        gap: "1px",
        padding: "2px"
      }}
    >
      {/* Render the combined board with both players' pieces */}
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

export default CoopGameBoard;