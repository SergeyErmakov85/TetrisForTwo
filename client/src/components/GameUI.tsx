import { Text } from "@react-three/drei";

interface GameUIProps {
  player: 1 | 2;
  score: number;
  isGameOver: boolean;
  position: [number, number, number];
}

const GameUI = ({ player, score, isGameOver, position }: GameUIProps) => {
  // Color scheme based on player
  const playerColor = player === 1 ? "#4f46e5" : "#ef4444";
  
  return (
    <group position={position}>
      {/* Score display */}
      <group position={[0, 0, 0]}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          SCORE
        </Text>
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.8}
          color={playerColor}
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          {score}
        </Text>
      </group>
      
      {/* Game over message */}
      {isGameOver && (
        <Text
          position={[0, -2, 0]}
          fontSize={0.6}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          GAME OVER
        </Text>
      )}
      
      {/* Next piece label */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.4}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        NEXT PIECE
      </Text>
    </group>
  );
};

export default GameUI;
