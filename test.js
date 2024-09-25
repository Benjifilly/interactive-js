import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Moon, Sun, Coffee, Pizza, Music, Volume2, VolumeX, Gamepad2, RotateCcw, Eye, EyeOff, Sparkles, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { motion, useAnimation } from 'framer-motion';

const InsaneWebsite = () => {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [rotation, setRotation] = useState(0);
  const [ballColor, setBallColor] = useState('from-purple-500 to-pink-500');
  const [bounce, setBounce] = useState(false);
  const [theme, setTheme] = useState('light');
  const [message, setMessage] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [audio] = useState(new Audio('https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(0);
  const [particles, setParticles] = useState([]);
  const [gravity, setGravity] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mouseTrail, setMouseTrail] = useState([]);
  const [powerUp, setPowerUp] = useState(null);
  const canvasRef = useRef(null);
  const controls = useAnimation();

  // Background and rotation update
  useEffect(() => {
    const interval = setInterval(() => setRotation((prev) => (prev + 5) % 360), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    audio.volume = volume / 100;
  }, [volume, audio]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameActive, timeLeft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle, index) => {
        particle.life--;
        if (particle.life <= 0) {
          particles.splice(index, 1);
        } else {
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
          ctx.fill();
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (gravity) particle.vy += 0.1;
        }
      });

      mouseTrail.forEach((point, index) => {
        const alpha = 1 - index / mouseTrail.length;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [particles, gravity, mouseTrail]);

  const changeBackgroundColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    setBackgroundColor(`#${randomColor}`);
    createParticles(10);
    controls.start({ scale: [1, 1.2, 1], rotate: [0, 360, 0] });
  };

  const toggleBounce = () => {
    setBounce((prev) => !prev);
    createParticles(5);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    createParticles(5);
  };

  const changeBallColor = () => {
    const colors = ['from-purple-500 to-pink-500', 'from-blue-500 to-green-500', 'from-yellow-400 to-red-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBallColor(randomColor);
  };

  const showRandomMessage = () => {
    const messages = [
      "You're insanely awesome!",
      "Keep being wildly insane!",
      "Wow, such mind-bending interactivity!",
      "You clicked it! You absolute madlad!",
      "Is this insane enough? Or should we go further?",
    ];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
    createParticles(20);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
    createParticles(5);
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(30);
    spawnPowerUp();
  };

  const endGame = () => {
    setGameActive(false);
    if (score > highScore) {
      setHighScore(score);
      showRandomMessage();
    }
  };

  const incrementScore = () => {
    if (gameActive) {
      setScore((prevScore) => prevScore + 1);
      createParticles(3);
    }
  };

  const createParticles = (count) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        size: Math.random() * 5 + 2,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        life: Math.random() * 60 + 60,
      });
    }
    setParticles((prevParticles) => [...prevParticles, ...newParticles]);
  };

  const toggleGravity = () => {
    setGravity((prev) => !prev);
    createParticles(10);
  };

  const toggleHidden = () => {
    setHidden((prev) => !prev);
  };

  const handleMouseMove = useCallback((event) => {
    setMouseTrail((prev) => [...prev.slice(-20), { x: event.clientX, y: event.clientY }]);
  }, []);

  const spawnPowerUp = () => {
    setPowerUp({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      type: Math.random() < 0.5 ? 'timeBonus' : 'doublePoints',
    });
  };

  const activatePowerUp = () => {
    if (powerUp.type === 'timeBonus') {
      setTimeLeft((prev) => prev + 10);
    } else {
      setScore((prev) => prev + 10);
    }
    setPowerUp(null);
    setTimeout(spawnPowerUp, 5000);
  };

  return (
    <motion.div
      className={`min-h-screen p-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}
      style={{ backgroundColor }}
      animate={controls}
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none" width={window.innerWidth} height={window.innerHeight} />
      
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Welcome to the Insane Website!
      </motion.h1>

      {message && <Alert className="mb-4">{message}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={changeBackgroundColor}><Zap className="mr-2" />Change Background Color</Button>
        <Button onClick={toggleBounce}><RotateCcw className="mr-2" />Toggle Bounce</Button>
        <Button onClick={toggleTheme}>{theme === 'dark' ? <Sun className="mr-2" /> : <Moon className="mr-2" />}Toggle Theme</Button>
        <Button onClick={changeBallColor}><Palette className="mr-2" />Change Ball Color</Button>
        <Button onClick={showRandomMessage}><Sparkles className="mr-2" />Random Message</Button>
        <Button onClick={toggleAudio}>{isPlaying ? <VolumeX className="mr-2" /> : <Volume2 className="mr-2" />}Toggle Audio</Button>
        <Button onClick={startGame}><Gamepad2 className="mr-2" />Start Game</Button>
        <Button onClick={toggleGravity}>{gravity ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}Toggle Gravity</Button>
        <Button onClick={toggleHidden}>{hidden ? <EyeOff className="mr-2" /> : <Eye className="mr-2" />}Toggle Visibility</Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Game Zone</h2>
        <p>Score: {score} | Time Left: {timeLeft} | High Score: {highScore}</p>
        {powerUp && (
          <div className="text-center mt-4">
            <p className="text-lg">Power-Up: {powerUp.type === 'timeBonus' ? 'Time Bonus' : 'Double Points'}</p>
            <Button onClick={activatePowerUp}>Activate Power-Up</Button>
          </div>
        )}
      </div>

      <Slider value={volume} onChange={setVolume} className="mt-4" />
      <Progress value={(score / highScore) * 100} className="mt-4" />
    </motion.div>
  );
};

export default InsaneWebsite;
