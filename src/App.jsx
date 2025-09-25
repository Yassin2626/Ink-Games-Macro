import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, BufferGeometry, BufferAttribute } from '@react-three/drei';
import { motion } from 'framer-motion';

function FluidBackground(props) {
  const ref = useRef();
  const time = useRef(0);
  const mousePos = useRef({ x: 0, y: 0 });
  const mouseVelocity = useRef({ vx: 0, vy: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // Create multiple layers of particles for depth effect
  const [particles] = useState(() => {
    const layers = 3;
    const particlesPerLayer = 1500;
    const totalParticles = layers * particlesPerLayer;
    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    
    for (let layer = 0; layer < layers; layer++) {
      for (let i = 0; i < particlesPerLayer; i++) {
        const idx = (layer * particlesPerLayer + i) * 3;
        
        // Position particles in a more organic pattern
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * 8;
        positions[idx] = Math.cos(angle) * radius; // x
        positions[idx + 1] = Math.sin(angle) * radius; // y
        positions[idx + 2] = (Math.random() - 0.5) * 2; // z
        
        // Color based on layer for depth effect
        const r = 0.1 + (0.3 * layer / layers);
        const g = 0.3 + (0.4 * (1 - layer / layers));
        const b = 0.6 + (0.4 * layer / layers);
        
        colors[idx] = r;
        colors[idx + 1] = g;
        colors[idx + 2] = b;
        
        // Size variation
        sizes[layer * particlesPerLayer + i] = 0.01 + Math.random() * 0.03;
      }
    }
    
    return { positions, colors, sizes };
  });
  
  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse position to -1 to 1 range
      const rect = document.body.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / window.innerWidth) * 2 - 1;
      const y = -((e.clientY - rect.top) / window.innerHeight) * 2 + 1;
      
      // Calculate velocity
      mouseVelocity.current.vx = x - lastMousePos.current.x;
      mouseVelocity.current.vy = y - lastMousePos.current.y;
      
      mousePos.current = { x, y };
      lastMousePos.current = { x, y };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  useFrame((state, delta) => {
    time.current += delta;
    
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position.array;
      const colors = ref.current.geometry.attributes.color.array;
      
      // Apply fluid physics to each particle
      for (let i = 0; i < positions.length; i += 3) {
        const idx = i;
        const x = positions[idx];
        const y = positions[idx + 1];
        const z = positions[idx + 2];
        
        // Mouse interaction - calculate distance to mouse
        const dx = x - mousePos.current.x * 5;
        const dy = y - mousePos.current.y * 5;
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
        
        // Apply repulsion force based on mouse proximity
        if (distanceToMouse < 3) {
          const force = (3 - distanceToMouse) * 0.5;
          const angle = Math.atan2(dy, dx);
          positions[idx] += Math.cos(angle) * force * delta * 10;
          positions[idx + 1] += Math.sin(angle) * force * delta * 10;
        }
        
        // Apply velocity from mouse movement
        positions[idx] += mouseVelocity.current.vx * 2;
        positions[idx + 1] += mouseVelocity.current.vy * 2;
        
        // Create wave patterns
        const wave1 = Math.sin(x * 0.5 + time.current * 0.8) * 0.3;
        const wave2 = Math.cos(y * 0.7 + time.current * 1.2) * 0.2;
        const wave3 = Math.sin((x + y) * 0.3 + time.current * 0.5) * 0.15;
        
        positions[idx + 2] = wave1 + wave2 + wave3 + Math.sin(time.current * 0.2) * 0.1;
        
        // Color shifting based on position and time for dynamic effect
        const colorIdx = idx;
        const hueShift = (Math.sin(time.current * 0.5 + x * 0.2 + y * 0.3) + 1) / 2;
        
        // Subtle color transition
        colors[colorIdx] = 0.2 + hueShift * 0.3; // R
        colors[colorIdx + 1] = 0.4 + (1 - hueShift) * 0.4; // G
        colors[colorIdx + 2] = 0.7 + hueShift * 0.3; // B
      }
      
      // Update geometry
      ref.current.geometry.attributes.position.needsUpdate = true;
      ref.current.geometry.attributes.color.needsUpdate = true;
      
      // Slowly reset mouse velocity for natural decay
      mouseVelocity.current.vx *= 0.9;
      mouseVelocity.current.vy *= 0.9;
      
      // Gentle rotation for organic movement
      ref.current.rotation.z = Math.sin(time.current * 0.1) * 0.02;
    }
  });

  return (
    <points ref={ref} {...props}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attachObject={['attributes', 'color']}
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.85}
        vertexColors={true}
        blending={2} // Additive blending
      />
    </points>
  );
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <FluidBackground />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4f46e5" />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-indigo-900/30 to-gray-900/70"></div>
    </div>
  );
}

function ToggleButton({ phase, onToggle }) {
  const isActive = phase === 'on';
  const label = phase === 'init' ? 'Start' : isActive ? 'ON' : 'OFF';
  const palette = useMemo(() => ({
    blue:  { glow: '#3b82f6', ring: '#60a5fa', icon: '#93c5fd', text: '#bfdbfe', gradFrom: '#3b82f6', gradTo: '#1d4ed8' },
    green: { glow: '#00ff00', ring: '#34d399', icon: '#6ee7b7', text: '#d1fae5', gradFrom: '#22c55e', gradTo: '#065f46' },
    red:   { glow: '#ff0000', ring: '#f87171', icon: '#fca5a5', text: '#fecaca', gradFrom: '#dc2626', gradTo: '#7f1d1d' },
  }), []);
  const mode = phase === 'init' ? 'blue' : (phase === 'on' ? 'green' : 'red');
  const colors = palette[mode];
  
  // Determine button size based on mode
  const isBlueButton = mode === 'blue';
  const buttonSize = isBlueButton ? 'w-40 h-40' : 'w-32 h-32';
  const innerSize = isBlueButton ? 'w-32 h-32' : 'w-24 h-24';
  const middleSize = isBlueButton ? 'w-24 h-24' : 'w-16 h-16';
  const centerSize = isBlueButton ? 'w-16 h-16' : 'w-10 h-10';
  const labelSize = isBlueButton ? 'text-2xl' : 'text-lg';
  
  return (
    <motion.div 
      className="relative z-10 flex flex-col items-center"
      initial={false}
      animate={{ scale: isActive ? 1.08 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.button
        className={`${buttonSize} rounded-full flex items-center justify-center cursor-pointer focus:outline-none border-0 bg-transparent`}
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Enhanced outer glow ring with smooth water-like animation */}
        <motion.div 
          className="absolute rounded-full"
          animate={{ 
            boxShadow: [
              `0 0 40px ${colors.glow}`, 
              `0 0 70px ${colors.glow}`, 
              `0 0 100px ${colors.ring}`,
              `0 0 70px ${colors.glow}`,
              `0 0 40px ${colors.glow}`
            ],
            width: isBlueButton ? ['80px', '90px', '100px', '90px', '80px'] : ['70px', '80px', '90px', '80px', '70px'],
            height: isBlueButton ? ['80px', '90px', '100px', '90px', '80px'] : ['70px', '80px', '90px', '80px', '70px'],
          }}
          whileHover={{ 
            boxShadow: [
              `0 0 60px ${colors.glow}`, 
              `0 0 100px ${colors.ring}`, 
              `0 0 140px ${colors.glow}`,
              `0 0 100px ${colors.ring}`,
              `0 0 60px ${colors.glow}`
            ],
            width: isBlueButton ? ['100px', '120px', '140px', '120px', '100px'] : ['90px', '110px', '130px', '110px', '90px'],
            height: isBlueButton ? ['100px', '120px', '140px', '120px', '100px'] : ['90px', '110px', '130px', '110px', '90px'],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: 'easeInOut',
            boxShadow: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            width: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            height: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
        ></motion.div>
        
        {/* Main button with consistent 3D effect */}
        <motion.div 
          className={`relative ${innerSize} rounded-full flex items-center justify-center`}
          animate={{ background: [`linear-gradient(145deg, ${colors.gradFrom}, ${colors.gradTo})`] }}
          transition={{ duration: 0.35 }}
        >
          {/* Center icon */}
          <motion.div className={`${middleSize} rounded-full flex items-center justify-center`}
            animate={{ backgroundColor: colors.ring }} transition={{ duration: 0.35 }}>
            <motion.div className={`${centerSize} rounded-full`}
              animate={{ backgroundColor: colors.icon }} transition={{ duration: 0.35 }} />
          </motion.div>

          {/* Center label */}
          <motion.span className={`absolute font-bold drop-shadow ${labelSize}`}
            animate={{ color: colors.text }} transition={{ duration: 0.3 }}>{label}</motion.span>
        </motion.div>
      </motion.button>
      
      {/* Status text */}
      <motion.div 
        className="mt-6 text-xl font-bold"
        animate={{ color: colors.text, textShadow: [`0 0 6px ${colors.glow}`, `0 0 22px ${colors.glow}`, `0 0 6px ${colors.glow}`] }}
        transition={{ duration: 0.5 }}
      >
        {phase==='init' ? 'Ready' : `Marco is ${isActive ? 'ON' : 'OFF'}`}
      </motion.div>
    </motion.div>
  );
}

function App() {
  const [phase, setPhase] = useState('init'); // init -> on -> off -> on -> ...
  const [err, setErr] = useState('');

  useEffect(() => () => { window.electron?.stopMacro?.(); }, []);

  const handleToggle = async () => {
    if (phase === 'init') {
      const res = await window.electron?.startMacro?.();
      if (res && res.ok === false) {
        setErr(res.error || 'Failed to start macro');
      } else {
        setErr('');
      }
      setPhase('on');
      return;
    }
    if (phase === 'on') {
      await window.electron?.stopMacro?.();
      setPhase('off');
      return;
    }
    // off -> on
    const res = await window.electron?.startMacro?.();
    if (res && res.ok === false) {
      setErr(res.error || 'Failed to start macro');
    } else {
      setErr('');
    }
    setPhase('on');
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gray-900 flex items-center justify-center">
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4">
        {/* Top branding */}
        <motion.h1 
          className="text-3xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500"
          animate={{ 
            textShadow: [
              '0 0 5px #00ffff', 
              '0 0 15px #00ffff', 
              '0 0 5px #00ffff'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Marco Ink Games
        </motion.h1>
        
        {/* Toggle button */}
        <ToggleButton phase={phase} onToggle={handleToggle} />
        
        {/* Bottom branding */}
      <motion.a 
        onClick={(e) => {
          e.preventDefault();
          window.electron?.openExternal?.('https://discord.com/users/956699005960720474');
        }}
        className="mt-16 text-sm text-center text-cyan-300 cursor-pointer no-underline hover:underline"
        animate={{ 
          textShadow: [
            '0 0 2px #00ffff', 
            '0 0 10px #00ffff', 
            '0 0 2px #00ffff'
          ]
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        Made by Yassin1234
      </motion.a>
        {err ? <p className="mt-4 text-xs text-red-400">{String(err)}</p> : null}
      </div>
    </div>
  );
}

export default App;