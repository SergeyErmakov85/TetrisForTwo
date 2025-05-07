import { useEffect } from 'react';
import { useKeyboardControls } from '@react-three/drei';
import { useGame } from '../lib/stores/useGame';

// This component handles global keyboard controls
const GameControls = () => {
  const { phase, restart } = useGame();
  
  // Handle any global keyboard shortcuts for the game
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // R key to restart the game
      if (event.code === 'KeyR' && phase === 'ended') {
        restart();
      }
      
      // Log keyboard events for debugging
      console.log(`Key pressed: ${event.code}`);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, restart]);
  
  return null; // This component doesn't render anything
};

export default GameControls;
