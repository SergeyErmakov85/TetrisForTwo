import React, { useEffect, useRef } from 'react';
import { TETROMINO_COLORS, KEYBOARD_CONTROLS, TETROMINOES } from '../lib/constants';
import { useAudio } from '../lib/stores/useAudio';
import { useGame } from '../lib/stores/useGame';

// Create a dummy board for cooperative play
const generateEmptyBoard = (width: number, height: number) => 
  Array(height).fill(null).map(() => Array(width).fill(null));

// Simple Tetromino shape for demonstration
type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

interface CoopGameBoardProps {
  width: number;
  height: number;
  boardWidth: number;
  boardHeight: number;
  isPlaying: boolean;
  score: number;
  setScore: (value: number) => void;
  onGameOver?: () => void; // Add callback for game over
}

const CoopGameBoard: React.FC<CoopGameBoardProps> = ({
  width,
  height,
  boardWidth,
  boardHeight,
  isPlaying,
  score,
  setScore,
  onGameOver
}) => {
  const { playHit, playSuccess } = useAudio();
  const { scoreLimit, end, checkWinCondition } = useGame();
  
  // Create a board state
  const [board, setBoard] = React.useState<(TetrominoType | null)[][]>(
    generateEmptyBoard(boardWidth, boardHeight)
  );
  
  // Player 1 piece
  const [player1Piece, setPlayer1Piece] = React.useState<{
    type: TetrominoType;
    shape: number[][];
    position: { x: number; y: number };
  } | null>(null);
  
  // Player 2 piece
  const [player2Piece, setPlayer2Piece] = React.useState<{
    type: TetrominoType;
    shape: number[][];
    position: { x: number; y: number };
  } | null>(null);
  
  // Game over state
  const [gameOver, setGameOver] = React.useState(false);
  
  // Victory state
  const [showVictory, setShowVictory] = React.useState(false);
  
  // Hard drop states
  const [player1HardDropping, setPlayer1HardDropping] = React.useState(false);
  const [player2HardDropping, setPlayer2HardDropping] = React.useState(false);
  const [hardDropTimers, setHardDropTimers] = React.useState<{
    player1: NodeJS.Timeout | null;
    player2: NodeJS.Timeout | null;
  }>({ player1: null, player2: null });
  
  // Reset board when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      setBoard(generateEmptyBoard(boardWidth, boardHeight));
      setGameOver(false);
      setShowVictory(false);
      setPlayer1HardDropping(false);
      setPlayer2HardDropping(false);
      // Clear any existing timers
      if (hardDropTimers.player1) clearTimeout(hardDropTimers.player1);
      if (hardDropTimers.player2) clearTimeout(hardDropTimers.player2);
      setHardDropTimers({ player1: null, player2: null });
      spawnNewPieces();
      setScore(0);
    }
  }, [isPlaying, boardWidth, boardHeight, setScore]);
  
  // Check for victory condition
  useEffect(() => {
    if (checkWinCondition(score) && !showVictory && !gameOver) {
      console.log('Victory! Score limit reached:', score, '>=', scoreLimit);
      setShowVictory(true);
      setGameOver(true);
      
      // Show victory message for 3 seconds, then return to menu
      setTimeout(() => {
        console.log('Victory timeout - returning to main menu');
        if (onGameOver) {
          onGameOver();
        }
      }, 3000);
    }
  }, [score, scoreLimit, checkWinCondition, showVictory, gameOver, onGameOver]);
  
  // Check if the top rows are blocked (game over condition)
  const checkGameOverCondition = (currentBoard: (TetrominoType | null)[][]) => {
    // Check if any of the top 2 rows have pieces (spawn area is blocked)
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < boardWidth; x++) {
        if (currentBoard[y][x] !== null) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Randomly select a tetromino type
  const getRandomTetromino = (): TetrominoType => {
    const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    return types[Math.floor(Math.random() * types.length)];
  };
  
  // Rotate a matrix (shape) either left or right
  const rotateMatrix = (matrix: number[][], direction: 'left' | 'right'): number[][] => {
    const n = matrix.length;
    const rotated: number[][] = [];
    
    // Initialize the rotated matrix
    for (let i = 0; i < n; i++) {
      rotated[i] = [];
    }
    
    if (direction === 'right') {
      // Rotate 90 degrees clockwise
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          rotated[i][j] = matrix[n - j - 1][i];
        }
      }
    } else {
      // Rotate 90 degrees counter-clockwise
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          rotated[i][j] = matrix[j][n - i - 1];
        }
      }
    }
    
    return rotated;
  };
  
  // Spawn new pieces for both players
  const spawnNewPieces = () => {
    // Generate different tetromino types for each player
    const type1 = getRandomTetromino();
    let type2;
    do {
      type2 = getRandomTetromino();
    } while (type2 === type1);
    
    // Player 1 piece (left side)
    setPlayer1Piece({
      type: type1,
      shape: TETROMINOES[type1],
      position: { x: Math.floor(boardWidth / 4), y: 0 }
    });
    
    // Player 2 piece (right side)
    setPlayer2Piece({
      type: type2,
      shape: TETROMINOES[type2],
      position: { x: Math.floor(boardWidth * 3 / 4), y: 0 }
    });
  };

  // Check if a piece would collide with the board (placed pieces or bounds)
  const wouldCollideBoard = (
    piece: {
      shape: number[][];
      position: { x: number; y: number };
    },
    dx: number = 0,
    dy: number = 0
  ): boolean => {
    const newX = piece.position.x + dx;
    const newY = piece.position.y + dy;

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;

          // Check boundaries
          if (
            boardX < 0 ||
            boardX >= boardWidth ||
            boardY < 0 ||
            boardY >= boardHeight
          ) {
            return true; // Out of bounds
          }

          // Check collision with placed pieces on the board
          if (boardY >= 0 && board[boardY][boardX] !== null) {
            return true; // Collision with placed piece
          }

        }
      }
    }
    return false;
  };

  // Check if a piece would collide with the other active piece only
  const wouldCollidePiece = (
    piece: {
      shape: number[][];
      position: { x: number; y: number };
    },
    otherPiece: {
      shape: number[][];
      position: { x: number; y: number };
    } | null,
    dx: number = 0,
    dy: number = 0
  ): boolean => {
    if (!otherPiece) return false;
    const newX = piece.position.x + dx;
    const newY = piece.position.y + dy;

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;

          for (let oy = 0; oy < otherPiece.shape.length; oy++) {
            for (let ox = 0; ox < otherPiece.shape[oy].length; ox++) {
              if (
                otherPiece.shape[oy][ox] &&
                boardX === otherPiece.position.x + ox &&
                boardY === otherPiece.position.y + oy
              ) {
                return true;
              }
            }
          }
        }
      }
    }

    return false;
  };
  
  // Check if piece can fall further
  const canFallFurther = (
    piece: {
      shape: number[][];
      position: { x: number; y: number };
    },
    otherPiece: {
      shape: number[][];
      position: { x: number; y: number };
    } | null
  ): boolean => {
    return !wouldCollideBoard(piece, 0, 1) && !wouldCollidePiece(piece, otherPiece, 0, 1);
  };
  
  // Move a player's piece
  const movePiece = (player: 1 | 2, dx: number, dy: number): boolean => {
    if (gameOver) return false;
    
    const piece = player === 1 ? player1Piece : player2Piece;
    const otherPiece = player === 1 ? player2Piece : player1Piece;
    const isHardDropping = player === 1 ? player1HardDropping : player2HardDropping;
    
    if (!piece) return false;
    
    // Check collision with board (bounds or placed pieces)
    if (wouldCollideBoard(piece, dx, dy)) {
      if (dy > 0) {
        placePiece(player);
      }
      return false;
    }

    // Check collision with the other active piece
    if (wouldCollidePiece(piece, otherPiece, dx, dy)) {
      // Return without locking so the piece stays active when blocked
      return false;
    }
    
    // Update piece position
    const newPiece = {
      ...piece,
      position: {
        x: piece.position.x + dx,
        y: piece.position.y + dy
      }
    };
    
    if (player === 1) {
      setPlayer1Piece(newPiece);
    } else {
      setPlayer2Piece(newPiece);
    }
    
    // If we're in hard drop mode and moved horizontally, check if piece can fall further
    if (isHardDropping && dx !== 0) {
      // Check if the piece can fall further from its new position
      if (canFallFurther(newPiece, otherPiece)) {
        // Continue falling
        let fallingPiece = { ...newPiece };
        while (canFallFurther(fallingPiece, otherPiece)) {
          fallingPiece.position.y++;
        }
        
        if (player === 1) {
          setPlayer1Piece(fallingPiece);
        } else {
          setPlayer2Piece(fallingPiece);
        }
      }
    }
    
    return true;
  };
  
  // Rotate a player's piece
  const rotatePiece = (player: 1 | 2, direction: 'left' | 'right'): boolean => {
    if (gameOver) return false;
    
    const piece = player === 1 ? player1Piece : player2Piece;
    const otherPiece = player === 1 ? player2Piece : player1Piece;
    const isHardDropping = player === 1 ? player1HardDropping : player2HardDropping;
    
    if (!piece || isHardDropping) return false;
    
    // Create a rotated shape
    const rotatedShape = rotateMatrix(piece.shape, direction);
    
    const newPiece = {
      ...piece,
      shape: rotatedShape
    };
    
    // Check for collision with board
    if (wouldCollideBoard(newPiece)) {
      // Try wall kicks - move left or right to make rotation possible
      const originalX = piece.position.x;
      
      // Try moving left
      for (let offset = 1; offset <= 2; offset++) {
        const testPiece = {
          ...newPiece,
          position: {
            ...newPiece.position,
            x: originalX - offset
          }
        };
        
        if (!wouldCollideBoard(testPiece) && !wouldCollidePiece(testPiece, otherPiece)) {
          if (player === 1) {
            setPlayer1Piece(testPiece);
          } else {
            setPlayer2Piece(testPiece);
          }
          return true;
        }
      }
      
      // Try moving right
      for (let offset = 1; offset <= 2; offset++) {
        const testPiece = {
          ...newPiece,
          position: {
            ...newPiece.position,
            x: originalX + offset
          }
        };
        
        if (!wouldCollideBoard(testPiece) && !wouldCollidePiece(testPiece, otherPiece)) {
          if (player === 1) {
            setPlayer1Piece(testPiece);
          } else {
            setPlayer2Piece(testPiece);
          }
          return true;
        }
      }
      
      // If no kick works, rotation fails
      return false;
    }
    
    // Check collision with other piece
    if (wouldCollidePiece(newPiece, otherPiece)) {
      return false;
    }
    
    // Update the piece with the rotated shape
    if (player === 1) {
      setPlayer1Piece(newPiece);
    } else {
      setPlayer2Piece(newPiece);
    }
    
    return true;
  };
  
  // Hard drop function for co-op mode
  const hardDrop = (player: 1 | 2): boolean => {
    if (gameOver) return false;
    
    const piece = player === 1 ? player1Piece : player2Piece;
    const otherPiece = player === 1 ? player2Piece : player1Piece;
    const isHardDropping = player === 1 ? player1HardDropping : player2HardDropping;
    
    if (!piece || isHardDropping) return false;
    
    let dropDistance = 0;
    let currentPiece = { ...piece };
    
    // Find the lowest possible position
    while (true) {
      if (wouldCollideBoard(currentPiece, 0, 1) || wouldCollidePiece(currentPiece, otherPiece, 0, 1)) {
        break;
      } else {
        currentPiece.position.y++;
        dropDistance++;
      }
    }
    
    // Update the piece to the dropped position
    if (player === 1) {
      setPlayer1Piece(currentPiece);
      setPlayer1HardDropping(true);
    } else {
      setPlayer2Piece(currentPiece);
      setPlayer2HardDropping(true);
    }
    
    // Set timer to lock the piece after 0.5 seconds
    const timer = setTimeout(() => {
      if (player === 1) {
        setPlayer1HardDropping(false);
      } else {
        setPlayer2HardDropping(false);
      }
      placePiece(player);
    }, 500); // Changed from 1000ms to 500ms
    
    setHardDropTimers(prev => ({
      ...prev,
      [player === 1 ? 'player1' : 'player2']: timer
    }));
    
    return dropDistance > 0;
  };
  
  // Place a piece on the board permanently
  const placePiece = (player: 1 | 2) => {
    if (gameOver) return;
    
    const piece = player === 1 ? player1Piece : player2Piece;
    if (!piece) return;
    
    // Clear hard drop timer if it exists
    const timerKey = player === 1 ? 'player1' : 'player2';
    if (hardDropTimers[timerKey]) {
      clearTimeout(hardDropTimers[timerKey]);
      setHardDropTimers(prev => ({
        ...prev,
        [timerKey]: null
      }));
    }
    
    // Reset hard dropping state
    if (player === 1) {
      setPlayer1HardDropping(false);
    } else {
      setPlayer2HardDropping(false);
    }
    
    // Create new board with piece locked in place
    const newBoard = board.map(row => [...row]);
    
    // Place piece on board
    piece.shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const boardY = piece.position.y + rowIndex;
          const boardX = piece.position.x + colIndex;
          
          if (
            boardY >= 0 && 
            boardY < boardHeight && 
            boardX >= 0 && 
            boardX < boardWidth
          ) {
            newBoard[boardY][boardX] = piece.type;
          }
        }
      });
    });
    
    // Check for game over condition after placing the piece
    if (checkGameOverCondition(newBoard)) {
      console.log('Co-op Game Over! Board is full.');
      setGameOver(true);
      setBoard(newBoard);
      if (onGameOver) {
        onGameOver();
      }
      return;
    }
    
    // Check for completed lines
    let completedLines = 0;
    for (let y = boardHeight - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== null)) {
        // Remove completed line
        newBoard.splice(y, 1);
        // Add new empty line at top
        newBoard.unshift(Array(boardWidth).fill(null));
        completedLines++;
      }
    }
    
    // Update board
    setBoard(newBoard);
    
    // Update score
    const lineScore = completedLines * 100;
    const placementScore = 10;
    const newScore = score + lineScore + placementScore;
    setScore(newScore);
    
    if (completedLines > 0) {
      playSuccess();
    }
    
    // Spawn new piece for the player
    if (player === 1) {
      let newType = getRandomTetromino();
      if (player2Piece) {
        while (newType === player2Piece.type) {
          newType = getRandomTetromino();
        }
      }
      
      setPlayer1Piece({
        type: newType,
        shape: TETROMINOES[newType],
        position: { x: Math.floor(boardWidth / 4), y: 0 }
      });
    } else {
      let newType = getRandomTetromino();
      if (player1Piece) {
        while (newType === player1Piece.type) {
          newType = getRandomTetromino();
        }
      }
      
      setPlayer2Piece({
        type: newType,
        shape: TETROMINOES[newType],
        position: { x: Math.floor(boardWidth * 3 / 4), y: 0 }
      });
    }
  };
  
  // Keyboard controls
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    
    const player1Controls = KEYBOARD_CONTROLS.player1;
    const player2Controls = KEYBOARD_CONTROLS.player2;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for game keys
      const allGameKeys = [
        ...player1Controls.moveLeft,
        ...player1Controls.moveRight,
        ...player1Controls.moveDown,
        ...player1Controls.rotateLeft,
        ...player1Controls.rotateRight,
        ...player1Controls.hardDrop,
        ...player2Controls.moveLeft,
        ...player2Controls.moveRight,
        ...player2Controls.moveDown,
        ...player2Controls.rotateLeft,
        ...player2Controls.rotateRight,
        ...player2Controls.hardDrop
      ];
      
      if (allGameKeys.includes(e.code)) {
        e.preventDefault();
      }

      // Player 1 controls
      if (player1Controls.moveLeft.includes(e.code)) {
        movePiece(1, -1, 0) && playHit();
      } else if (player1Controls.moveRight.includes(e.code)) {
        movePiece(1, 1, 0) && playHit();
      } else if (player1Controls.moveDown.includes(e.code)) {
        movePiece(1, 0, 1) && playHit();
      } else if (player1Controls.rotateLeft.includes(e.code)) {
        console.log('Player 1 trying to rotate left');
        const rotated = rotatePiece(1, 'left');
        if (rotated) {
          playHit();
          console.log('Player 1 rotated left successfully');
        } else {
          console.log('Player 1 rotation left failed');
        }
      } else if (player1Controls.rotateRight.includes(e.code)) {
        console.log('Player 1 trying to rotate right');
        const rotated = rotatePiece(1, 'right');
        if (rotated) {
          playHit();
          console.log('Player 1 rotated right successfully');
        } else {
          console.log('Player 1 rotation right failed');
        }
      } else if (player1Controls.hardDrop.includes(e.code)) {
        hardDrop(1) && playHit();
      }
      
      // Player 2 controls
      if (player2Controls.moveLeft.includes(e.code)) {
        movePiece(2, -1, 0) && playHit();
      } else if (player2Controls.moveRight.includes(e.code)) {
        movePiece(2, 1, 0) && playHit();
      } else if (player2Controls.moveDown.includes(e.code)) {
        movePiece(2, 0, 1) && playHit();
      } else if (player2Controls.rotateLeft.includes(e.code)) {
        console.log('Player 2 trying to rotate left');
        const rotated = rotatePiece(2, 'left');
        if (rotated) {
          playHit();
          console.log('Player 2 rotated left successfully');
        } else {
          console.log('Player 2 rotation left failed');
        }
      } else if (player2Controls.rotateRight.includes(e.code)) {
        console.log('Player 2 trying to rotate right');
        const rotated = rotatePiece(2, 'right');
        if (rotated) {
          playHit();
          console.log('Player 2 rotated right successfully');
        } else {
          console.log('Player 2 rotation right failed');
        }
      } else if (player2Controls.hardDrop.includes(e.code)) {
        hardDrop(2) && playHit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, gameOver, player1Piece, player2Piece, board, playHit, playSuccess, score, player1HardDropping, player2HardDropping]);
  
  // Game loop - automatically move pieces down (but not during hard drop)
  const lastTimeRef = useRef<number>(0);
  const frameIdRef = useRef<number>(0);
  
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    
    function gameLoop(timestamp: number) {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastTimeRef.current;
      
      // Move pieces down every 1000ms
      if (deltaTime > 1000) {
        // Move player 1 piece down (only if not hard dropping)
        if (player1Piece && !player1HardDropping) {
          movePiece(1, 0, 1);
        }

        // Move player 2 piece down (only if not hard dropping)
        if (player2Piece && !player2HardDropping) {
          movePiece(2, 0, 1);
        }
        
        lastTimeRef.current = timestamp;
      }
      
      frameIdRef.current = requestAnimationFrame(gameLoop);
    }
    
    frameIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [isPlaying, gameOver, player1Piece, player2Piece, board, player1HardDropping, player2HardDropping]);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hardDropTimers.player1) clearTimeout(hardDropTimers.player1);
      if (hardDropTimers.player2) clearTimeout(hardDropTimers.player2);
    };
  }, [hardDropTimers]);
  
  return (
    <div style={{ position: 'relative' }}>
      {/* Victory Screen */}
      {showVictory && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '0', 
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 100,
            flexDirection: 'column'
          }}
        >
          <div style={{
            textAlign: 'center',
            animation: 'victoryPulse 1s ease-in-out infinite alternate'
          }}>
            <h1 style={{ 
              fontSize: '4rem', 
              color: '#10b981',
              textShadow: '0 0 20px rgba(16, 185, 129, 0.8)',
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              ВЫ ПОБЕДИЛИ!
            </h1>
            <p style={{ 
              fontSize: '1.5rem', 
              color: '#ffffff',
              marginBottom: '1rem'
            }}>
              Цель достигнута: {score} очков!
            </p>
            <p style={{ 
              fontSize: '1rem', 
              color: '#9ca3af'
            }}>
              Возврат в главное меню через 3 секунды...
            </p>
          </div>
          
          {/* Animated confetti-like elements */}
          <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  position: 'absolute',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
                  borderRadius: '50%',
                  animation: `confettiFall ${Math.random() * 3 + 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Hard drop indicators */}
      {player1HardDropping && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '-30px', 
            left: '25%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4f46e5',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            animation: 'pulse 0.5s infinite',
            zIndex: 20
          }}
        >
          P1: 0.5s Control!
        </div>
      )}
      
      {player2HardDropping && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '-30px', 
            right: '25%',
            transform: 'translateX(50%)',
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            animation: 'pulse 0.5s infinite',
            zIndex: 20
          }}
        >
          P2: 0.5s Control!
        </div>
      )}
      
      {/* Main game board */}
      <div 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`, 
          backgroundColor: '#1f2937', 
          border: '2px solid #059669',
          display: 'grid',
          gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
          gridTemplateRows: `repeat(${boardHeight}, 1fr)`,
          gap: '1px',
          padding: '2px',
          // Add visual indicator for hard drop mode
          boxShadow: (player1HardDropping || player2HardDropping) ? 
            '0 0 20px #059669' : 'none',
          transition: 'box-shadow 0.2s'
        }}
      >
        {board.flat().map((cell, i) => {
          const x = i % boardWidth;
          const y = Math.floor(i / boardWidth);
          
          // Check if this position contains player 1's piece
          let isPlayer1Piece = false;
          let player1Type: TetrominoType | null = null;
          
          if (player1Piece) {
            player1Piece.shape.forEach((row, rowIndex) => {
              row.forEach((cell, colIndex) => {
                if (cell && 
                    x === player1Piece.position.x + colIndex && 
                    y === player1Piece.position.y + rowIndex) {
                  isPlayer1Piece = true;
                  player1Type = player1Piece.type;
                }
              });
            });
          }
          
          // Check if this position contains player 2's piece
          let isPlayer2Piece = false;
          let player2Type: TetrominoType | null = null;
          
          if (player2Piece) {
            player2Piece.shape.forEach((row, rowIndex) => {
              row.forEach((cell, colIndex) => {
                if (cell && 
                    x === player2Piece.position.x + colIndex && 
                    y === player2Piece.position.y + rowIndex) {
                  isPlayer2Piece = true;
                  player2Type = player2Piece.type;
                }
              });
            });
          }
          
          // Determine cell color
          let cellColor = '#374151'; // Empty cell
          let shouldPulse = false;
          
          if (cell) {
            cellColor = TETROMINO_COLORS[cell]; // Placed piece
          } else if (isPlayer1Piece && player1Type) {
            cellColor = TETROMINO_COLORS[player1Type]; // Player 1 piece
            shouldPulse = player1HardDropping;
          } else if (isPlayer2Piece && player2Type) {
            cellColor = TETROMINO_COLORS[player2Type]; // Player 2 piece
            shouldPulse = player2HardDropping;
          }
          
          return (
            <div 
              key={i} 
              style={{ 
                backgroundColor: cellColor,
                boxShadow: (cell || isPlayer1Piece || isPlayer2Piece) ? 
                  'inset 0 0 5px rgba(255,255,255,0.5)' : 'none',
                borderRadius: (cell || isPlayer1Piece || isPlayer2Piece) ? '2px' : '0',
                animation: shouldPulse ? 'pulse 0.5s infinite' : 'none'
              }}
            />
          );
        })}
      </div>
      
      {/* Game over overlay */}
      {gameOver && !showVictory && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '0', 
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#ffffff',
            zIndex: 10
          }}
        >
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Game Over</h3>
          <p>Board is full!</p>
          <p>Final Score: {score}</p>
        </div>
      )}
      
      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
          
          @keyframes victoryPulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.05); }
          }
          
          @keyframes confettiFall {
            0% {
              transform: translateY(-20px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(150px) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CoopGameBoard;