// Game board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Keyboard controls map for KeyboardControls from drei
export const CONTROLS = [
  // Player 1 controls (WASD + Q/E)
  { name: 'player1MoveLeft', keys: ['KeyA'] },
  { name: 'player1MoveRight', keys: ['KeyD'] },
  { name: 'player1MoveDown', keys: ['KeyS'] },
  { name: 'player1RotateLeft', keys: ['KeyQ'] },
  { name: 'player1RotateRight', keys: ['KeyE'] },
  { name: 'player1HardDrop', keys: ['KeyW'] },
  
  // Player 2 controls (Arrow keys + period/slash)
  { name: 'player2MoveLeft', keys: ['ArrowLeft'] },
  { name: 'player2MoveRight', keys: ['ArrowRight'] },
  { name: 'player2MoveDown', keys: ['ArrowDown'] },
  { name: 'player2RotateLeft', keys: ['Period'] },
  { name: 'player2RotateRight', keys: ['Slash'] },
  { name: 'player2HardDrop', keys: ['ArrowUp'] },
];

// Map of player-specific controls
export const PLAYER_CONTROLS = {
  1: {
    moveLeft: 'player1MoveLeft',
    moveRight: 'player1MoveRight',
    moveDown: 'player1MoveDown',
    rotateLeft: 'player1RotateLeft',
    rotateRight: 'player1RotateRight',
    hardDrop: 'player1HardDrop',
  },
  2: {
    moveLeft: 'player2MoveLeft',
    moveRight: 'player2MoveRight',
    moveDown: 'player2MoveDown',
    rotateLeft: 'player2RotateLeft',
    rotateRight: 'player2RotateRight',
    hardDrop: 'player2HardDrop',
  }
};

// Tetromino types
export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

// Tetromino shapes represented as 2D arrays (0 = empty, 1 = filled)
export const TETROMINOES: Record<TetrominoType, number[][]> = {
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  'J': [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  'L': [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],
  'O': [
    [1, 1],
    [1, 1]
  ],
  'S': [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  'T': [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  'Z': [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ]
};

// Tetromino colors
export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  'I': '#06b6d4', // cyan
  'J': '#3b82f6', // blue
  'L': '#f97316', // orange
  'O': '#facc15', // yellow
  'S': '#22c55e', // green
  'T': '#a855f7', // purple
  'Z': '#ef4444'  // red
};
