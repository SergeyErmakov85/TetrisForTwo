import React, { useEffect, useRef } from 'react';
import { useTetris } from '../hooks/useTetris';
import { TETROMINO_COLORS, KEYBOARD_CONTROLS } from '../lib/constants';
import { useAudio } from '../lib/stores/useAudio';

interface GameBoardProps {
  player: 1 | 2;
  position?: [number, number, number]; // Used for 3D positioning (not used in 2D mode)
  isGameOver: boolean;
  setGameOver: (value: boolean) => void;
  setScore: (value: number) => void;
  isPlaying: boolean;
  width: number;
  height: number;
  boardWidth: number;
  boardHeight: number;
}

const GameBoard: React.FC<GameBoardProps> = ({
  player,
  isGameOver,
  setGameOver,
  setScore,
  isPlaying,
  width,
  height,
  boardWidth,
  boardHeight
}) => {
  const { playHit } = useAudio();
  
  const {
    board,
    activePiece,
    nextPiece,
    score,
    gameOver,
    movePiece,
    rotatePiece,
    hardDrop,
    reset
  } = useTetris(player);

  // Update score and game over state
  useEffect(() => {
    setScore(score);
  }, [score, setScore]);

  useEffect(() => {
    if (gameOver && !isGameOver) {
      setGameOver(true);
      console.log(`Player ${player} - Game Over!`);
    }
  }, [gameOver, isGameOver, player, setGameOver]);

  // Reset game when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      reset();
    }
  }, [isPlaying, reset]);

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const playerKey = player === 1 ? 'player1' : 'player2';
    const controls = KEYBOARD_CONTROLS[playerKey];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Player controls based on keyboard input
      if (controls.moveLeft.includes(e.code)) {
        movePiece(-1, 0) && playHit();
      } else if (controls.moveRight.includes(e.code)) {
        movePiece(1, 0) && playHit();
      } else if (controls.moveDown.includes(e.code)) {
        movePiece(0, 1) && playHit();
      } else if (controls.rotateLeft.includes(e.code)) {
        rotatePiece('left') && playHit();
      } else if (controls.rotateRight.includes(e.code)) {
        rotatePiece('right') && playHit();
      } else if (controls.hardDrop.includes(e.code)) {
        hardDrop() && playHit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isGameOver, player, movePiece, rotatePiece, hardDrop, playHit]);

  // Game loop - automatically move piece down
  const lastTimeRef = useRef<number>(0);
  const frameIdRef = useRef<number>(0);
  
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    
    function gameLoop(timestamp: number) {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastTimeRef.current;
      
      // Move piece down every 1000ms, speed up based on score
      const fallSpeed = Math.max(100, 1000 - Math.floor(score / 500) * 100);
      
      if (deltaTime > fallSpeed) {
        movePiece(0, 1);
        lastTimeRef.current = timestamp;
      }
      
      frameIdRef.current = requestAnimationFrame(gameLoop);
    }
    
    frameIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [isPlaying, isGameOver, score, movePiece]);
  
  // Calculate cell size
  const cellWidth = width / boardWidth;
  const cellHeight = height / boardHeight;
  
  return (
    <div style={{ position: 'relative' }}>
      {/* Main game board */}
      <div 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`, 
          backgroundColor: '#1f2937', 
          border: player === 1 ? '2px solid #4f46e5' : '2px solid #ef4444',
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
          
          // Check if this position contains the active piece
          let isActivePiece = false;
          let activePieceType = null;
          
          if (activePiece) {
            const { shape, type, position } = activePiece;
            
            shape.forEach((row, rowIndex) => {
              row.forEach((value, colIndex) => {
                if (value && 
                    y === position.y + rowIndex && 
                    x === position.x + colIndex) {
                  isActivePiece = true;
                  activePieceType = type;
                }
              });
            });
          }
          
          const cellType = isActivePiece ? activePieceType : cell;
          
          return (
            <div 
              key={i} 
              style={{ 
                backgroundColor: cellType ? TETROMINO_COLORS[cellType] : '#374151',
                boxShadow: cellType ? 'inset 0 0 5px rgba(255,255,255,0.5)' : 'none',
                borderRadius: cellType ? '2px' : '0'
              }}
            />
          );
        })}
      </div>
      
      {/* Next piece display */}
      {nextPiece && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '-90px',
            width: '80px',
            height: '80px',
            backgroundColor: '#1f2937',
            border: player === 1 ? '1px solid #4f46e5' : '1px solid #ef4444',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: '1px',
            padding: '2px'
          }}
        >
          {Array(16).fill(null).map((_, i) => {
            const x = i % 4;
            const y = Math.floor(i / 4);
            
            let showPiece = false;
            
            // Center the piece in the next piece display
            const offsetX = nextPiece.shape[0].length === 4 ? 0 : 
                           nextPiece.shape[0].length === 3 ? 0 : 
                           nextPiece.shape[0].length === 2 ? 1 : 0;
            
            const offsetY = nextPiece.shape.length === 4 ? 0 : 
                           nextPiece.shape.length === 3 ? 0 : 
                           nextPiece.shape.length === 2 ? 1 : 0;
            
            if (y - offsetY >= 0 && 
                y - offsetY < nextPiece.shape.length && 
                x - offsetX >= 0 && 
                x - offsetX < nextPiece.shape[0].length && 
                nextPiece.shape[y - offsetY][x - offsetX]) {
              showPiece = true;
            }
            
            return (
              <div 
                key={i} 
                style={{ 
                  backgroundColor: showPiece ? TETROMINO_COLORS[nextPiece.type] : '#374151',
                  boxShadow: showPiece ? 'inset 0 0 5px rgba(255,255,255,0.5)' : 'none',
                  borderRadius: showPiece ? '2px' : '0'
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Game over overlay */}
      {isGameOver && (
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
          <p>Score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default GameBoard;