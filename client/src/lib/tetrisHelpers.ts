import { TETROMINOES, TetrominoType, BOARD_WIDTH, BOARD_HEIGHT } from './constants';

// Generate an empty board filled with null values
export function generateEmptyBoard(): (TetrominoType | null)[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
}

// Get a random tetromino shape and type
export function getRandomTetromino() {
  const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    shape: TETROMINOES[type],
    type
  };
}

// Check if a piece collides with the board boundaries or placed pieces
export function checkCollision(
  board: (TetrominoType | null)[][],
  piece: {
    shape: number[][];
    position: { x: number; y: number };
  }
): boolean {
  return piece.shape.some((row, rowIndex) => {
    return row.some((value, colIndex) => {
      // Skip empty cells
      if (!value) return false;
      
      const boardX = piece.position.x + colIndex;
      const boardY = piece.position.y + rowIndex;
      
      // Check board boundaries
      if (
        boardX < 0 || 
        boardX >= BOARD_WIDTH || 
        boardY < 0 || 
        boardY >= BOARD_HEIGHT
      ) {
        return true; // Out of bounds
      }
      
      // Check collision with existing pieces
      if (board[boardY][boardX] !== null) {
        return true; // Collision with placed piece
      }
      
      return false;
    });
  });
}

// Rotate a matrix (shape) either left or right
export function rotateMatrix(matrix: number[][], direction: 'left' | 'right'): number[][] {
  const rotated = [];
  const n = matrix.length;
  
  if (direction === 'right') {
    // Rotate 90 degrees clockwise
    for (let i = 0; i < n; i++) {
      rotated.push([]);
      for (let j = 0; j < n; j++) {
        rotated[i][j] = matrix[n - j - 1][i];
      }
    }
  } else {
    // Rotate 90 degrees counter-clockwise
    for (let i = 0; i < n; i++) {
      rotated.push([]);
      for (let j = 0; j < n; j++) {
        rotated[i][j] = matrix[j][n - i - 1];
      }
    }
  }
  
  return rotated;
}