import React, { useState, useEffect, useCallback } from 'react';
import { 
  Phone, Mail, MapPin, Code2, ExternalLink, 
  Briefcase, GraduationCap, Trophy, Terminal, FolderGit2,
  Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Minus
} from 'lucide-react';

// --- 可重複使用的 UI 元件 ---
const Badge = ({ children, variant = 'default' }) => {
  const baseStyle = "px-3 py-1 text-sm font-medium rounded-full inline-block mb-2 mr-2";
  const variants = {
    default: "bg-blue-100 text-blue-700",
    outline: "border border-slate-300 text-slate-600 bg-slate-50",
    highlight: "bg-indigo-100 text-indigo-700"
  };
  return <span className={`${baseStyle} ${variants[variant]}`}>{children}</span>;
};

const SectionHeader = ({ icon: Icon, title }) => (
  <h2 className="section-header">
    <Icon className="icon-main" size={24} />
    {title}
  </h2>
);

const Card = ({ title, subtitle, date, location, children, tags = [] }) => (
  <div className="card">
    <div className="card-header">
      <div>
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      <div className="card-meta">
        {date && <span className="card-date">{date}</span>}
        {location && <span className="card-location">{location}</span>}
      </div>
    </div>
    <div className="card-body">
      {children}
    </div>
    {tags.length > 0 && (
      <div className="card-tags">
        {tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
      </div>
    )}
  </div>
);

// --- 貪食蛇遊戲元件 (React 版本) ---
const GRID_SIZE = 30;

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 15, y: 15 }]);
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [dir, setDir] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const onSnake = currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
      if (!onSnake) break;
    }
    setFood(newFood);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const validKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
      
      if (validKeys.includes(key)) {
        e.preventDefault(); // 防止網頁捲動
        // 若遊戲尚未開始或暫停中，按方向鍵自動開始/繼續
        if (!isPlaying && !gameOver) {
          setIsPlaying(true);
          setIsPaused(false);
        } else if (isPaused) {
          setIsPaused(false);
        }
      }

      setDir(prev => {
        if ((key === 'arrowup' || key === 'w') && prev !== 'DOWN') return 'UP';
        if ((key === 'arrowdown' || key === 's') && prev !== 'UP') return 'DOWN';
        if ((key === 'arrowleft' || key === 'a') && prev !== 'RIGHT') return 'LEFT';
        if ((key === 'arrowright' || key === 'd') && prev !== 'LEFT') return 'RIGHT';
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, gameOver]);

  useEffect(() => {
    if (!isPlaying || isPaused || gameOver || !dir) return;

    const speed = Math.max(50, 200 - (level - 1) * 20);
    const timer = setTimeout(() => {
      const head = snake[0];
      const newHead = { ...head };

      if (dir === 'UP') newHead.y -= 1;
      if (dir === 'DOWN') newHead.y += 1;
      if (dir === 'LEFT') newHead.x -= 1;
      if (dir === 'RIGHT') newHead.x += 1;

      // 撞牆判定
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      // 撞自己判定
      if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      const newSnake = [newHead, ...snake];

      // 吃到食物
      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 1;
        setScore(newScore);
        if (newScore % 3 === 0 && level < 10) setLevel(l => l + 1);
        generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    }, speed);

    return () => clearTimeout(timer);
  }, [snake, dir, isPlaying, isPaused, gameOver, level, food, score, generateFood]);

  const handleStart = () => {
    if (gameOver) handleRestart();
    else {
      setIsPlaying(true);
      setIsPaused(false);
      if (!dir) setDir('RIGHT'); // 預設往右走
    }
  };

  const handlePause = () => setIsPaused(true);

  const handleRestart = () => {
    setSnake([{ x: 15, y: 15 }]);
    setDir(null);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(false);
    setIsPaused(false);
    generateFood([{ x: 15, y: 15 }]);
  };

  const renderDirIcon = () => {
    switch (dir) {
      case 'UP': return <ArrowUp size={20} className="text-blue-600" />;
      case 'DOWN': return <ArrowDown size={20} className="text-blue-600" />;
      case 'LEFT': return <ArrowLeft size={20} className="text-blue-600" />;
      case 'RIGHT': return <ArrowRight size={20} className="text-blue-600" />;
      default: return <Minus size={20} className="text-slate-400" />;
    }
  };

  return (
    <div className="snake-container">
      {/* 狀態列 */}
      <div className="snake-header">
        <div>SCORE: <span className="snake-highlight">{score}</span></div>
        <div className="dir-display">
          <span>DIR:</span>
          <div className="dir-icon-box">{renderDirIcon()}</div>
        </div>
        <div>LEVEL: <span className="snake-highlight">{level}</span></div>
      </div>
      
      {/* 遊戲區域 */}
      <div className="snake-stage">
        {snake.map((segment, index) => (
          <div key={index} className="snake-body" style={{ left: `${segment.x * 10}px`, top: `${segment.y * 10}px` }} />
        ))}
        <div className="snake-food" style={{ left: `${food.x * 10}px`, top: `${food.y * 10}px` }} />
        
        {(!isPlaying && !gameOver && score === 0) && (
          <div className="snake-overlay">Press Start or Arrow Keys</div>
        )}
        {(isPaused && !gameOver) && (
          <div className="snake-overlay">PAUSED</div>
        )}
        {gameOver && (
          <div className="snake-overlay game-over">
            <div>Game Over!</div>
          </div>
        )}
      </div>

      {/* 控制按鈕區 */}
      <div className="snake-controls">
        <button onClick={handleStart} disabled={isPlaying && !isPaused} className="ctrl-btn start-btn">
          <Play size={16} /> {isPaused ? 'Resume' : 'Start'}
        </button>
        <button onClick={handlePause} disabled={!isPlaying || isPaused} className="ctrl-btn pause-btn">
          <Pause size={16} /> Pause
        </button>
        <button onClick={handleRestart} className="ctrl-btn restart-btn">
          <RotateCcw size={16} /> Restart
        </button>
      </div>
    </div>
  );
};

// --- 主頁面元件 (三欄式佈局) ---
export default function App() {
  return (
    <div className="app-container">
      {/* 左欄：個人資料 */}
      <aside className="sidebar">
        <div className="profile-section">
          <div className="avatar-placeholder"><span>SL</span></div>
          <h1 className="name">Shih-Yuan Liou</h1>
          <p className="headline">Senior IT Software Engineer</p>
          <p className="sub-headline">M.S. in Artificial Intelligence</p>
        </div>

        <div className="contact-section">
          <a href="mailto:yuan00324@gmail.com" className="contact-link"><Mail size={18} /> yuan00324@gmail.com</a>
          <div className="contact-item"><Phone size={18} /> +886 972 236 907</div>
          <div className="contact-item"><MapPin size={18} /> Tainan, Taiwan</div>
          <a href="https://leetcode.com/u/SYLiou/" target="_blank" rel="noreferrer" className="contact-link highlight">
            <Code2 size={18} /> LeetCode Profile <ExternalLink size={14} />
          </a>
        </div>

        <div className="skills-section">
          <h3 className="sidebar-title">Core Skills</h3>
          <div className="skills-container">
            <Badge>Java</Badge><Badge>C++</Badge><Badge>Python</Badge>
            <Badge>Spring Boot 3</Badge><Badge>Kubernetes</Badge>
            <Badge>Docker</Badge><Badge>SQL</Badge><Badge>Azure</Badge>
          </div>
        </div>
      </aside>

      {/* 中欄：主要履歷內容 */}
      <main className="main-content">
        <section className="resume-section">
          <SectionHeader icon={Terminal} title="About Me" />
          <div className="about-text">
            <p>Performance-driven <strong>Software Engineer</strong> and Phi Tau Phi inductee with an M.S. in <strong>Artificial Intelligence</strong>. Specializes in high-performance C++ development, firmware validation, and hardware-software co-simulation.</p>
            <p>Backed by solid experience in migrating core applications to scalable <strong>Kubernetes (K8s) clusters</strong>. Possesses a deep mastery of advanced data structures, memory management, and algorithmic problem-solving.</p>
          </div>
        </section>

        <section className="resume-section">
          <SectionHeader icon={Briefcase} title="Work Experience" />
          <Card title="Senior IT Software Engineer" subtitle="Taiwan Semiconductor Manufacturing Company (TSMC)" date="Oct 2025 - Present" location="Tainan, Taiwan" tags={['Java', 'Spring Boot 3', 'Kubernetes']}>
            <ul className="list">
              <li>Architected and developed scalable data loaders and microservices.</li>
              <li>Executed strategic migration of core applications from VMs to Kubernetes.</li>
              <li>Managed containerized application lifecycles within K8s clusters.</li>
            </ul>
          </Card>
          <Card title="Software Engineer" subtitle="Phison Electronics Corporation" date="Sep 2022 - Oct 2025" location="Miaoli, Taiwan" tags={['C++', 'Qt', 'ARM DS-5']}>
            <ul className="list">
              <li>Developed high-fidelity NAND emulation system in C++.</li>
              <li>Built GUI-based validation applications using Qt framework.</li>
            </ul>
          </Card>
        </section>

        <section className="resume-section">
          <SectionHeader icon={GraduationCap} title="Education & Honors" />
          <Card title="M.S. in Artificial Intelligence" subtitle="National Cheng Kung University (NCKU)" date="Jan 2020 - Sep 2022">
            <ul className="list"><li><strong>GPA:</strong> 4.23 / 4.3 (Ranked Top 3%)</li></ul>
          </Card>
          <div className="awards-container" style={{marginTop: '1rem'}}>
            <div className="award-item"><span className="award-title">LeetCode Top 1.28%</span><span className="award-desc">Rating of 2,134. Ranked 378th globally (May 2024).</span></div>
            <div className="award-item"><span className="award-title">AI CUP 2021 Top 10</span><span className="award-desc">10th / 523 teams in Crop Location Auto-Labeling.</span></div>
          </div>
        </section>
      </main>

      {/* 右欄：遊戲面板 */}
      <aside className="right-sidebar">
        <div className="game-panel">
          <SectionHeader icon={Gamepad2} title="Take a Break" />
          <p className="game-desc">A classic Snake Game built with React Hooks. Enjoy!</p>
          <SnakeGame />
        </div>
      </aside>
    </div>
  );
}