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
  const { playHit, playSuccess } = useAudio();
  const { scoreLimit, end } = useGame();
  
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
  
  // Reset board when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      setBoard(generateEmptyBoard(boardWidth, boardHeight));
      spawnNewPieces();
      setScore(0);
    }
  }, [isPlaying, boardWidth, boardHeight, setScore]);
  
  // Randomly select a tetromino type
  const getRandomTetromino = (): TetrominoType => {
    const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    return types[Math.floor(Math.random() * types.length)];
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
            boardY >= boardHeight
          ) {
            return true;
          }

          // Check collision with placed pieces on the board
          if (boardY >= 0 && board[boardY][boardX] !== null) {
            return true;
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
  
  // Move a player's piece
  const movePiece = (player: 1 | 2, dx: number, dy: number): boolean => {
    const piece = player === 1 ? player1Piece : player2Piece;
    const otherPiece = player === 1 ? player2Piece : player1Piece;
    
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
    
    return true;
  };
  
  // Place a piece on the board permanently
  const placePiece = (player: 1 | 2) => {
    const piece = player === 1 ? player1Piece : player2Piece;
    if (!piece) return;
    
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
    
    // Check win condition
    if (newScore >= scoreLimit) {
      end();
      return;
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
    if (!isPlaying) return;
    
    const player1Controls = KEYBOARD_CONTROLS.player1;
    const player2Controls = KEYBOARD_CONTROLS.player2;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Player 1 controls
      if (player1Controls.moveLeft.includes(e.code)) {
        movePiece(1, -1, 0) && playHit();
      } else if (player1Controls.moveRight.includes(e.code)) {
        movePiece(1, 1, 0) && playHit();
      } else if (player1Controls.moveDown.includes(e.code)) {
        movePiece(1, 0, 1) && playHit();
      } else if (player1Controls.hardDrop.includes(e.code)) {
        placePiece(1);
      }
      
      // Player 2 controls
      if (player2Controls.moveLeft.includes(e.code)) {
        movePiece(2, -1, 0) && playHit();
      } else if (player2Controls.moveRight.includes(e.code)) {
        movePiece(2, 1, 0) && playHit();
      } else if (player2Controls.moveDown.includes(e.code)) {
        movePiece(2, 0, 1) && playHit();
      } else if (player2Controls.hardDrop.includes(e.code)) {
        placePiece(2);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, player1Piece, player2Piece, board, playHit, playSuccess, score]);
  
  // Game loop - automatically move pieces down
  const lastTimeRef = useRef<number>(0);
  const frameIdRef = useRef<number>(0);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    function gameLoop(timestamp: number) {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastTimeRef.current;
      
      // Move pieces down every 1000ms
      if (deltaTime > 1000) {
        // Move player 1 piece down
        if (player1Piece) {
          movePiece(1, 0, 1);
        }

        // Move player 2 piece down
        if (player2Piece) {
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
  }, [isPlaying, player1Piece, player2Piece, board]);
  
  return (
    <div style={{ position: 'relative' }}>
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
          padding: '2px'
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
          if (cell) {
            cellColor = TETROMINO_COLORS[cell]; // Placed piece
          } else if (isPlayer1Piece && player1Type) {
            cellColor = TETROMINO_COLORS[player1Type]; // Player 1 piece
          } else if (isPlayer2Piece && player2Type) {
            cellColor = TETROMINO_COLORS[player2Type]; // Player 2 piece
          }
          
          return (
            <div 
              key={i} 
              style={{ 
                backgroundColor: cellColor,
                boxShadow: (cell || isPlayer1Piece || isPlayer2Piece) ? 
                  'inset 0 0 5px rgba(255,255,255,0.5)' : 'none',
                borderRadius: (cell || isPlayer1Piece || isPlayer2Piece) ? '2px' : '0'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CoopGameBoard;