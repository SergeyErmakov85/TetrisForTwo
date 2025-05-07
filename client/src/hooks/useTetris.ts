import { useState, useCallback, useEffect } from 'react';
import { 
  TETROMINOES, 
  TetrominoType,
  BOARD_WIDTH,
  BOARD_HEIGHT
} from '../lib/constants';
import {
  generateEmptyBoard,
  getRandomTetromino,
  checkCollision,
  rotateMatrix
} from '../lib/tetrisHelpers';

interface ActivePiece {
  shape: number[][];
  type: TetrominoType;
  position: { x: number; y: number };
}

interface Tetromino {
  shape: number[][];
  type: TetrominoType;
}

interface TetrisHook {
  board: (TetrominoType | null)[][];
  activePiece: ActivePiece | null;
  nextPiece: Tetromino | null;
  score: number;
  gameOver: boolean;
  movePiece: (dx: number, dy: number) => boolean;
  rotatePiece: (direction: 'left' | 'right') => boolean;
  hardDrop: () => number;
  reset: () => void;
}

export const useTetris = (player: 1 | 2): TetrisHook => {
  // Core game state
  const [board, setBoard] = useState<(TetrominoType | null)[][]>(
    generateEmptyBoard()
  );
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Initialize game
  const reset = useCallback(() => {
    setBoard(generateEmptyBoard());
    setActivePiece(null);
    setNextPiece(null);
    setScore(0);
    setGameOver(false);
  }, []);
  
  // Spawn a new piece
  const spawnPiece = useCallback(() => {
    // If there's a next piece, use that, otherwise generate a new one
    const newPiece = nextPiece || getRandomTetromino();
    
    // Create new active piece
    const newActivePiece: ActivePiece = {
      ...newPiece,
      position: {
        x: Math.floor((BOARD_WIDTH - newPiece.shape[0].length) / 2),
        y: 0
      }
    };
    
    // Check if the new piece collides with existing pieces
    if (checkCollision(board, newActivePiece)) {
      // Game over - no space for new piece
      setGameOver(true);
      return false;
    }
    
    // Set the new active piece
    setActivePiece(newActivePiece);
    
    // Generate next piece
    setNextPiece(getRandomTetromino());
    
    return true;
  }, [board, nextPiece]);
  
  // Initialize game
  useEffect(() => {
    if (!activePiece && !gameOver) {
      spawnPiece();
    }
  }, [activePiece, gameOver, spawnPiece]);
  
  // Move a piece
  const movePiece = useCallback((dx: number, dy: number): boolean => {
    if (!activePiece || gameOver) return false;
    
    const newPosition = {
      x: activePiece.position.x + dx,
      y: activePiece.position.y + dy
    };
    
    const newActivePiece = {
      ...activePiece,
      position: newPosition
    };
    
    // Check if the move is valid
    if (checkCollision(board, newActivePiece)) {
      // If moving down causes collision, place the piece
      if (dy > 0) {
        lockPiece();
      }
      return false;
    }
    
    // Update the active piece
    setActivePiece(newActivePiece);
    return true;
  }, [activePiece, board, gameOver]);
  
  // Rotate a piece
  const rotatePiece = useCallback((direction: 'left' | 'right'): boolean => {
    if (!activePiece || gameOver) return false;
    
    // Create a rotated shape
    const rotatedShape = rotateMatrix(activePiece.shape, direction);
    
    const newActivePiece = {
      ...activePiece,
      shape: rotatedShape
    };
    
    // Check for collision
    if (checkCollision(board, newActivePiece)) {
      // If rotation causes collision, try wall kicks
      const originalX = activePiece.position.x;
      
      // Try moving left
      for (let offset = 1; offset <= 2; offset++) {
        const testPiece = {
          ...newActivePiece,
          position: {
            ...newActivePiece.position,
            x: originalX - offset
          }
        };
        
        if (!checkCollision(board, testPiece)) {
          setActivePiece(testPiece);
          return true;
        }
      }
      
      // Try moving right
      for (let offset = 1; offset <= 2; offset++) {
        const testPiece = {
          ...newActivePiece,
          position: {
            ...newActivePiece.position,
            x: originalX + offset
          }
        };
        
        if (!checkCollision(board, testPiece)) {
          setActivePiece(testPiece);
          return true;
        }
      }
      
      // If no kick works, rotation fails
      return false;
    }
    
    // Update the active piece with the rotated shape
    setActivePiece(newActivePiece);
    return true;
  }, [activePiece, board, gameOver]);
  
  // Hard drop - move piece all the way down
  const hardDrop = useCallback((): number => {
    if (!activePiece || gameOver) return 0;
    
    let dropDistance = 0;
    let canDrop = true;
    
    while (canDrop) {
      const newPosition = {
        x: activePiece.position.x,
        y: activePiece.position.y + 1
      };
      
      const newActivePiece = {
        ...activePiece,
        position: newPosition
      };
      
      if (checkCollision(board, newActivePiece)) {
        canDrop = false;
      } else {
        setActivePiece(newActivePiece);
        dropDistance++;
      }
    }
    
    // Lock the piece in place
    lockPiece();
    
    return dropDistance;
  }, [activePiece, board, gameOver]);
  
  // Lock piece in place and check for completed lines
  const lockPiece = useCallback(() => {
    if (!activePiece) return;
    
    // Create new board with active piece locked in place
    const newBoard = [...board];
    
    activePiece.shape.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value) {
          const y = activePiece.position.y + rowIndex;
          const x = activePiece.position.x + colIndex;
          
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            newBoard[y][x] = activePiece.type;
          }
        }
      });
    });
    
    // Check for completed lines
    let completedLines = 0;
    const updatedBoard = newBoard.filter(row => {
      const isRowComplete = row.every(cell => cell !== null);
      if (isRowComplete) {
        completedLines++;
        return false;
      }
      return true;
    });
    
    // Add empty rows at the top
    while (updatedBoard.length < BOARD_HEIGHT) {
      updatedBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }
    
    // Update score based on completed lines
    let additionalScore = 0;
    switch (completedLines) {
      case 1:
        additionalScore = 100;
        break;
      case 2:
        additionalScore = 300;
        break;
      case 3:
        additionalScore = 500;
        break;
      case 4:
        additionalScore = 800; // Tetris!
        break;
      default:
        additionalScore = 0;
    }
    
    // Update game state
    setBoard(updatedBoard);
    setActivePiece(null); // Clear active piece to trigger new piece spawn
    setScore(prevScore => prevScore + additionalScore);
  }, [activePiece, board]);
  
  return {
    board,
    activePiece,
    nextPiece,
    score,
    gameOver,
    movePiece,
    rotatePiece,
    hardDrop,
    reset
  };
};