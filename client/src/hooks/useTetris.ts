import { useState, useCallback, useEffect, useRef } from 'react';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINOES,
  TetrominoType
} from '../lib/constants';
import {
  generateEmptyBoard,
  getRandomTetromino,
  checkCollision,
  rotateMatrix
} from '../lib/tetrisHelpers';

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

interface Tetromino {
  shape: number[][];
  type: TetrominoType;
}

interface ActivePiece extends Tetromino {
  position: { x: number; y: number };
}

export const useTetris = (player: 1 | 2): TetrisHook => {
  const [board, setBoard] = useState<(TetrominoType | null)[][]>(generateEmptyBoard());
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  
  // Use refs to prevent infinite loops with dependencies
  const boardRef = useRef(board);
  const activePieceRef = useRef(activePiece);
  const gameOverRef = useRef(gameOver);
  
  // Update refs when state changes
  useEffect(() => {
    boardRef.current = board;
  }, [board]);
  
  useEffect(() => {
    activePieceRef.current = activePiece;
  }, [activePiece]);
  
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  // Helper to spawn a new piece
  const spawnNewPiece = useCallback(() => {
    if (gameOverRef.current) return;

    // Use the next piece as the active piece or generate a new one if there is no next piece
    const newActivePiece = nextPiece || getRandomTetromino();
    
    // Generate the next piece
    const newNextPiece = getRandomTetromino();
    
    // Position the piece at the top center of the board
    const newPosition = {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newActivePiece.shape[0].length / 2),
      y: BOARD_HEIGHT - 1
    };
    
    // Check if the new piece can be placed
    if (checkCollision(boardRef.current, newActivePiece.shape, newPosition.x, newPosition.y)) {
      // Game over if the piece can't be placed
      console.log(`Player ${player} - Game Over!`);
      setGameOver(true);
      return;
    }
    
    setActivePiece({
      ...newActivePiece,
      position: newPosition
    });
    
    setNextPiece(newNextPiece);
  }, [nextPiece, player]);

  // Initialize the game or reset it
  const reset = useCallback(() => {
    const emptyBoard = generateEmptyBoard();
    setBoard(emptyBoard);
    boardRef.current = emptyBoard;
    
    setActivePiece(null);
    activePieceRef.current = null;
    
    setNextPiece(getRandomTetromino());
    setScore(0);
    
    setGameOver(false);
    gameOverRef.current = false;
    
    // Delay spawning the first piece
    setTimeout(() => {
      spawnNewPiece();
    }, 50);
  }, [spawnNewPiece]);

  // Initialize the game on first render
  useEffect(() => {
    // Set the initial state directly for player to avoid infinite loops
    const emptyBoard = generateEmptyBoard();
    setBoard(emptyBoard);
    boardRef.current = emptyBoard;
    
    setActivePiece(null);
    activePieceRef.current = null;
    
    setNextPiece(getRandomTetromino());
    setScore(0);
    
    setGameOver(false);
    gameOverRef.current = false;
    
    // Delay spawning the first piece
    const timer = setTimeout(() => {
      spawnNewPiece();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [player]);

  // Move the active piece
  const movePiece = useCallback((dx: number, dy: number): boolean => {
    if (!activePieceRef.current || gameOverRef.current) return false;
    
    const newX = activePieceRef.current.position.x + dx;
    const newY = activePieceRef.current.position.y + dy;
    
    // Check if the move is valid
    if (checkCollision(boardRef.current, activePieceRef.current.shape, newX, newY)) {
      // If we're trying to move down and hit something, lock the piece
      if (dy < 0) {
        // Lock the current piece into the board
        const newBoard = [...boardRef.current];
        activePieceRef.current.shape.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              const boardY = y + activePieceRef.current!.position.y;
              const boardX = x + activePieceRef.current!.position.x;
              if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                newBoard[boardY][boardX] = activePieceRef.current!.type;
              }
            }
          });
        });
        
        // Check for completed rows and clear them
        const completedRows: number[] = [];
        newBoard.forEach((row, index) => {
          if (row.every(cell => cell !== null)) {
            completedRows.push(index);
          }
        });
        
        // Clear completed rows and update the score
        if (completedRows.length > 0) {
          completedRows.forEach(rowIndex => {
            newBoard.splice(rowIndex, 1);
            newBoard.push(Array(BOARD_WIDTH).fill(null));
          });
          
          // Update score based on the number of rows cleared
          // Using standard Tetris scoring: 1 row = 100, 2 rows = 300, 3 rows = 500, 4 rows = 800
          const points = [0, 100, 300, 500, 800][completedRows.length] || 1000;
          setScore(prevScore => prevScore + points);
        }
        
        setBoard(newBoard);
        
        // Spawn a new piece
        setTimeout(() => {
          spawnNewPiece();
        }, 0);
        
        return true;
      }
      return false;
    }
    
    // Move the piece
    setActivePiece({
      ...activePieceRef.current,
      position: { x: newX, y: newY }
    });
    
    return true;
  }, [spawnNewPiece]);

  // Rotate the active piece
  const rotatePiece = useCallback((direction: 'left' | 'right'): boolean => {
    if (!activePieceRef.current || gameOverRef.current) return false;
    
    // Create a deep copy of the active piece shape
    const newShape = activePieceRef.current.shape.map(row => [...row]);
    
    // Rotate the shape
    const rotatedShape = rotateMatrix(newShape, direction);
    
    // Try standard rotation first
    if (!checkCollision(boardRef.current, rotatedShape, activePieceRef.current.position.x, activePieceRef.current.position.y)) {
      setActivePiece({
        ...activePieceRef.current,
        shape: rotatedShape
      });
      return true;
    }
    
    // Wall kick: try shifting left, right, and up
    const offsets = [
      { x: -1, y: 0 }, // try shifting left
      { x: 1, y: 0 },  // try shifting right
      { x: 0, y: 1 },  // try shifting up
      { x: -2, y: 0 }, // try shifting two blocks left
      { x: 2, y: 0 },  // try shifting two blocks right
    ];
    
    for (const offset of offsets) {
      const newX = activePieceRef.current.position.x + offset.x;
      const newY = activePieceRef.current.position.y + offset.y;
      
      if (!checkCollision(boardRef.current, rotatedShape, newX, newY)) {
        setActivePiece({
          ...activePieceRef.current,
          shape: rotatedShape,
          position: { x: newX, y: newY }
        });
        return true;
      }
    }
    
    // Rotation not possible
    return false;
  }, []);

  // Hard drop - move the piece all the way down
  const hardDrop = useCallback((): number => {
    if (!activePieceRef.current || gameOverRef.current) return 0;
    
    let dropDistance = 0;
    let newY = activePieceRef.current.position.y;
    
    // Find the maximum drop distance
    while (!checkCollision(boardRef.current, activePieceRef.current.shape, activePieceRef.current.position.x, newY - 1)) {
      newY--;
      dropDistance++;
    }
    
    // Move the piece to the bottom-most valid position
    setActivePiece({
      ...activePieceRef.current,
      position: { ...activePieceRef.current.position, y: newY }
    });
    
    // Force the piece to lock immediately (after state update)
    setTimeout(() => {
      movePiece(0, -1);
    }, 0);
    
    // Return lines cleared (for scoring)
    return dropDistance > 0 ? 1 : 0;
  }, [movePiece]);

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
