import { useState, useCallback, useEffect, useRef } from 'react';
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
  isHardDropping: boolean;
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
  
  // Hard drop state
  const [isHardDropping, setIsHardDropping] = useState(false);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  const boardRef = useRef(board);
  const activePieceRef = useRef(activePiece);
  
  // Initialize game
  const reset = useCallback(() => {
    setBoard(generateEmptyBoard());
    setActivePiece(null);
    setNextPiece(null);
    setScore(0);
    setGameOver(false);
    setIsHardDropping(false);
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  }, []);
  
  // Check if the top rows are blocked (game over condition)
  const checkGameOver = useCallback((currentBoard: (TetrominoType | null)[][]) => {
    // Check if any of the top 2 rows have pieces (spawn area is blocked)
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (currentBoard[y][x] !== null) {
          return true;
        }
      }
    }
    return false;
  }, []);
  
  // Lock piece in place and check for completed lines
  const lockPiece = useCallback((pieceOverride?: ActivePiece | null) => {
    const pieceToLock = pieceOverride ?? activePieceRef.current;
    if (!pieceToLock) return;
    
    // Clear hard drop timer if it exists
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    setIsHardDropping(false);
    
    // Create new board with active piece locked in place
    const baseBoard = boardRef.current;
    const newBoard = [...baseBoard];
    
    pieceToLock.shape.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value) {
          const y = pieceToLock.position.y + rowIndex;
          const x = pieceToLock.position.x + colIndex;
          
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            newBoard[y][x] = pieceToLock.type;
          }
        }
      });
    });
    
    // Check for game over condition after placing the piece
    if (checkGameOver(newBoard)) {
      console.log(`Player ${player} - Game Over! Board is full after piece placement.`);
      setGameOver(true);
      setBoard(newBoard);
      return;
    }
    
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
  }, [checkGameOver, player]);

  // Start or reset the lock timer
  const startLockTimer = useCallback(() => {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
    }
    
    lockTimerRef.current = setTimeout(() => {
      setIsHardDropping(false);
      lockPiece();
    }, 1000); // 1 second control time
  }, [lockPiece]);
  
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
      console.log(`Player ${player} - Game Over! Board is full.`);
      setGameOver(true);
      return false;
    }
    
    // Set the new active piece
    setActivePiece(newActivePiece);
    
    // Generate next piece
    setNextPiece(getRandomTetromino());
    
    return true;
  }, [board, nextPiece, player]);
  
  // Initialize game
  useEffect(() => {
    if (!activePiece && !gameOver) {
      spawnPiece();
    }
  }, [activePiece, gameOver, spawnPiece]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    activePieceRef.current = activePiece;
  }, [activePiece]);
  
  // Check if piece can fall further
  const canFallFurther = useCallback((piece: ActivePiece): boolean => {
    const testPiece = {
      ...piece,
      position: {
        x: piece.position.x,
        y: piece.position.y + 1
      }
    };
    return !checkCollision(board, testPiece);
  }, [board]);
  
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
    
    // If we're in hard drop mode and moved horizontally, check if piece can fall further
    if (isHardDropping && dx !== 0) {
      // Check if the piece can fall further from its new position
      if (canFallFurther(newActivePiece)) {
        // Continue falling
        let fallingPiece = { ...newActivePiece };
        while (canFallFurther(fallingPiece)) {
          fallingPiece.position.y++;
        }
        setActivePiece(fallingPiece);
      }
      
      // Reset the lock timer on successful move during hard drop
      startLockTimer();
    }
    
    return true;
  }, [activePiece, board, gameOver, isHardDropping, canFallFurther, startLockTimer, lockPiece]);
  
  // Rotate a piece
  const rotatePiece = useCallback((direction: 'left' | 'right'): boolean => {
    if (!activePiece || gameOver || isHardDropping) return false;
    
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
  }, [activePiece, board, gameOver, isHardDropping]);
  
  // Hard drop - move piece all the way down with control time
  const hardDrop = useCallback((): number => {
    if (!activePiece || gameOver || isHardDropping) return 0;
    
    let dropDistance = 0;
    let currentPiece = { ...activePiece };
    
    // Find the lowest possible position
    while (true) {
      const testPosition = {
        x: currentPiece.position.x,
        y: currentPiece.position.y + 1
      };
      
      const testPiece = {
        ...currentPiece,
        position: testPosition
      };
      
      if (checkCollision(board, testPiece)) {
        break;
      } else {
        currentPiece.position.y++;
        dropDistance++;
      }
    }
    
    // Update the active piece to the dropped position
    setActivePiece(currentPiece);
    
    // Start hard drop mode with timer
    setIsHardDropping(true);
    startLockTimer();
    
    return dropDistance;
  }, [activePiece, board, gameOver, isHardDropping, startLockTimer]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
      }
    };
  }, []);
  
  return {
    board,
    activePiece,
    nextPiece,
    score,
    gameOver,
    isHardDropping,
    movePiece,
    rotatePiece,
    hardDrop,
    reset
  };
};
