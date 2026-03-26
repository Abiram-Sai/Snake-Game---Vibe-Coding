import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

const TRACKS = [
  { id: 1, title: "Neon Drive (AI Gen)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Cyber City (AI Gen)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Digital Horizon (AI Gen)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function App() {
  // --- Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const directionRef = useRef(INITIAL_DIRECTION);
  const nextDirectionRef = useRef(INITIAL_DIRECTION);

  // --- Music Player State ---
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, volume]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  // --- Game Logic ---
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    nextDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsStarted(true);
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (document.activeElement?.tagName === 'BUTTON') return; // Let buttons work
        e.preventDefault();
        if (gameOver) {
          resetGame();
          return;
        }
        if (!isStarted) {
          setIsStarted(true);
          return;
        }
      }

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isStarted, resetGame]);

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        directionRef.current = nextDirectionRef.current;
        const head = prev[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y
        };

        // Wall Collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }

        // Self Collision
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Food Collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          let newFood;
          while (true) {
            newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
            if (!newSnake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
          }
          setFood(newFood);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, 120);
    return () => clearInterval(intervalId);
  }, [isStarted, gameOver, food]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ffff] font-terminal crt-flicker flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-[#ff00ff] selection:text-white">
      <div className="scanlines"></div>
      <div className="noise"></div>

      {/* Header */}
      <div className="mb-8 text-center relative z-10">
        <h1 className="text-3xl md:text-5xl font-pixel glitch mb-2" data-text="SNAKE_PROTOCOL">
          SNAKE_PROTOCOL
        </h1>
        <p className="text-[#ff00ff] text-xl tracking-[0.2em] uppercase screen-tear">
          SYS.VER.9.0.1 // AUDIO_LINK_ESTABLISHED
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl relative z-10">
        {/* Game Container */}
        <div className="relative flex flex-col items-center border-2 border-[#00ffff] bg-black p-1 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
          <div className="flex justify-between w-full mb-2 px-2 text-xl font-bold bg-[#00ffff] text-black">
            <span>MEM_ALLOC: {score}B</span>
            <span className={gameOver ? "text-[#ff00ff] animate-pulse" : ""}>
              {gameOver ? 'ERR: OVERFLOW' : isStarted ? 'STATUS: ACTIVE' : 'STATUS: IDLE'}
            </span>
          </div>

          <div
            className="bg-[#050505] relative overflow-hidden"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              width: 'min(85vw, 450px)',
              height: 'min(85vw, 450px)'
            }}
          >
            {/* Render Grid Cells */}
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = snake.some((s, idx) => idx !== 0 && s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={i}
                  className={`w-full h-full ${
                    isHead ? 'bg-[#00ffff] shadow-[0_0_8px_#00ffff]' :
                    isBody ? 'bg-[#008888] border-[1px] border-[#00ffff]/30' :
                    isFood ? 'bg-[#ff00ff] shadow-[0_0_12px_#ff00ff] animate-pulse' :
                    'bg-transparent border-[1px] border-[#00ffff]/5'
                  }`}
                />
              );
            })}

            {/* Overlays */}
            {!isStarted && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <button
                  onClick={() => setIsStarted(true)}
                  className="px-6 py-4 border-2 border-[#00ffff] text-[#00ffff] font-pixel text-sm hover:bg-[#00ffff] hover:text-black transition-none uppercase glitch"
                  data-text="[ EXECUTE ]"
                >
                  [ EXECUTE ]
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20">
                <h2 className="text-3xl font-pixel text-[#ff00ff] mb-4 glitch" data-text="FATAL_ERROR">FATAL_ERROR</h2>
                <p className="text-[#00ffff] text-2xl mb-8">DATA_CORRUPTED: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-4 border-2 border-[#ff00ff] text-[#ff00ff] font-pixel text-sm hover:bg-[#ff00ff] hover:text-black transition-none uppercase"
                >
                  [ REBOOT_SYS ]
                </button>
              </div>
            )}
          </div>
          <p className="text-[#00ffff]/50 text-lg mt-2 uppercase w-full text-left">
            INPUT_REQ: [W,A,S,D] OR [ARROWS]
          </p>
        </div>

        {/* Music Player */}
        <div className="w-full max-w-md border-2 border-[#ff00ff] bg-black p-6 flex flex-col gap-6 shadow-[0_0_15px_rgba(255,0,255,0.3)]">
          <div className="border-b-2 border-[#ff00ff] pb-2 flex justify-between items-end">
            <h3 className="text-[#ff00ff] font-pixel text-sm">AUDIO_SUBSYSTEM</h3>
            {/* Visualizer */}
            <div className="flex gap-1 h-6 items-end">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div
                  key={i}
                  className={`w-2 bg-[#00ffff] ${isPlaying ? 'animate-bounce-bar' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s`, height: isPlaying ? `${Math.random() * 100}%` : '20%' }}
                />
              ))}
            </div>
          </div>

          <div className="py-4 bg-[#ff00ff]/10 border border-[#ff00ff]/30 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#ff00ff_2px,#ff00ff_4px)] opacity-10 pointer-events-none"></div>
            <p className="text-2xl font-bold text-[#00ffff] truncate screen-tear">{TRACKS[currentTrack].title}</p>
            <p className="text-[#ff00ff] text-lg mt-1">SRC: AI_GENERATOR_NODE_{TRACKS[currentTrack].id}</p>
          </div>

          <div className="flex items-center justify-between gap-4 font-pixel text-sm">
            <button onClick={prevTrack} className="text-[#00ffff] hover:text-white hover:bg-[#00ffff] p-2 border border-[#00ffff] transition-none">
              [ &lt;&lt; ]
            </button>
            <button
              onClick={togglePlay}
              className="text-[#ff00ff] hover:text-black hover:bg-[#ff00ff] p-4 border-2 border-[#ff00ff] transition-none flex-1 text-center"
            >
              {isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}
            </button>
            <button onClick={nextTrack} className="text-[#00ffff] hover:text-white hover:bg-[#00ffff] p-2 border border-[#00ffff] transition-none">
              [ &gt;&gt; ]
            </button>
          </div>

          <div className="flex items-center gap-4 text-[#00ffff] mt-4 border-t border-[#00ffff]/30 pt-4">
            <span className="font-pixel text-xs">VOL:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-black border border-[#00ffff] appearance-none cursor-pointer accent-[#ff00ff]"
            />
            <span className="font-pixel text-xs">{Math.round(volume * 100)}%</span>
          </div>

          <audio
            ref={audioRef}
            src={TRACKS[currentTrack].url}
            onEnded={nextTrack}
            className="hidden"
          />
        </div>

      </div>
    </div>
  );
}