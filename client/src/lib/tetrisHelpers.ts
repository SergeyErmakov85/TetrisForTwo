import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES, TetrominoType } from './constants';

// Generate an empty Tetris board grid
export function generateEmptyBoard(): (TetrominoType | null)[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() => 
    Array(BOARD_WIDTH).fill(null)
  );
}

// Get a random Tetromino piece
export function getRandomTetromino() {
  const tetrominoTypes = Object.keys(TETROMINOES) as TetrominoType[];
  const randomType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
  return {
    shape: TETROMINOES[randomType],
    type: randomType
  };
}

// Check if a piece collides with the board boundaries or other pieces
export function checkCollision(
  board: (TetrominoType | null)[][],
  shape: number[][],
  offsetX: number,
  offsetY: number
): boolean {
  // Check each cell of the piece
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // Only check filled cells
      if (shape[y][x]) {
        const boardX = x + offsetX;
        const boardY = y + offsetY;
        
        // Check if out of bounds
        const isOutOfBounds = 
          boardX < 0 || 
          boardX >= BOARD_WIDTH || 
          boardY < 0 || 
          boardY >= BOARD_HEIGHT;
        
        // Check if there's already a piece at this position
        const hasCollision = 
          !isOutOfBounds && 
          board[boardY][boardX] !== null;
        
        if (isOutOfBounds || hasCollision) {
          return true; // Collision detected
        }
      }
    }
  }
  
  return false; // No collision
}

// Rotate a matrix (for piece rotation)
export function rotateMatrix(matrix: number[][], direction: 'left' | 'right'): number[][] {
  const height = matrix.length;
  const width = matrix[0].length;
  const result = Array(width).fill(0).map(() => Array(height).fill(0));
  
  if (direction === 'right') {
    // Rotate 90 degrees clockwise
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        result[x][height - 1 - y] = matrix[y][x];
      }
    }
  } else {
    // Rotate 90 degrees counter-clockwise
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        result[width - 1 - x][y] = matrix[y][x];
      }
    }
  }
  
  return result;
}
