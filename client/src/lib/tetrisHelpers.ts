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
      if (boardY >= 0 && board[boardY][boardX] !== null) {
        return true; // Collision with placed piece
      }
      
      return false;
    });
  });
}

// Rotate a matrix (shape) either left or right
export function rotateMatrix(matrix: number[][], direction: 'left' | 'right'): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  
  if (direction === 'right') {
    // Rotate 90 degrees clockwise
    const rotated: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = matrix[i][j];
      }
    }
    return rotated;
  } else {
    // Rotate 90 degrees counter-clockwise
    const rotated: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[cols - 1 - j][i] = matrix[i][j];
      }
    }
    return rotated;
  }
}