import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import TetrisGame from "./components/TetrisGame";
import { CONTROLS } from "./lib/constants";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Initialize audio elements
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    setBackgroundMusic(bgMusic);

    const hitSfx = new Audio("/sounds/hit.mp3");
    setHitSound(hitSfx);

    const successSfx = new Audio("/sounds/success.mp3");
    setSuccessSound(successSfx);

    // Return cleanup function
    return () => {
      bgMusic.pause();
      hitSfx.pause();
      successSfx.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={CONTROLS}>
        <Canvas
          shadows
          camera={{ 
            position: [0, 0, 18], 
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          gl={{ 
            antialias: true,
            powerPreference: "default"
          }}
        >
          <color attach="background" args={["#111827"]} />
          
          {/* Add ambient light for overall illumination */}
          <ambientLight intensity={0.5} />
          
          {/* Add directional light for shadows and dimension */}
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024}
          />

          <Suspense fallback={null}>
            <TetrisGame />
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

export default App;
