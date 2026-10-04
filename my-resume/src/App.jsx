import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, MapPin, Code2, ExternalLink, 
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
          <div className="contact-item"><MapPin size={18} /> Tainan, Taiwan</div>
          <a href="https://leetcode.com/u/SYLiou/" target="_blank" rel="noreferrer" className="contact-link highlight">
            <Code2 size={18} /> LeetCode Profile <ExternalLink size={14} />
          </a>
        </div>

        <div className="skills-section">
          <h3 className="sidebar-title">Core Skills</h3>
          <div className="skills-container">
            <Badge>C++</Badge><Badge>Java</Badge><Badge>Python</Badge>
            <Badge>C</Badge><Badge>Verilog</Badge><Badge>SQL</Badge>
            <Badge>Spring Boot 3</Badge><Badge>Qt</Badge><Badge>React</Badge>
            <Badge>Kubernetes (K8s)</Badge><Badge>Docker</Badge><Badge>Azure</Badge>
            <Badge>PyTorch</Badge><Badge>CI/CD</Badge>
          </div>
        </div>
      </aside>

      {/* 中欄：主要履歷內容 */}
      <main className="main-content">
        
        {/* --- About Me --- */}
        <section className="resume-section">
          <SectionHeader icon={Terminal} title="About Me" />
          <div className="about-text">
            <p>Performance-driven <strong>Software Engineer</strong> and Phi Tau Phi inductee with an M.S. in <strong>Artificial Intelligence</strong>. Specializes in high-performance <strong>C++ development</strong>, firmware validation, and hardware-software co-simulation.</p>
            <p>Backed by solid experience in migrating core applications to scalable <strong>Kubernetes (K8s) clusters</strong>. Possesses a deep mastery of advanced data structures, memory management, and <strong>algorithmic problem-solving</strong>. Proven track record of bridging rigorous academic research with industrial execution to build highly optimized, mission-critical architectures.</p>
          </div>
        </section>

        {/* --- Experience --- */}
        <section className="resume-section">
          <SectionHeader icon={Briefcase} title="Work Experience" />
          
          <Card title="Senior IT Software Engineer" subtitle="Taiwan Semiconductor Manufacturing Company (TSMC)" date="Oct 2025 - Present" location="Tainan, Taiwan" tags={['Java', 'Spring Boot 3', 'Kubernetes', 'Maven']}>
            <ul className="list">
              <li><strong>Backend Development:</strong> Architected and developed scalable data loaders and microservices using <strong>Java (Maven)</strong> and <strong>Spring Boot 3</strong>, enabling real-time monitoring of factory production data.</li>
              <li><strong>Cloud Migration:</strong> Executed the strategic migration of core applications from Virtual Machines to <strong>Kubernetes (K8s)</strong>, optimizing deployment workflows and enhancing system scalability.</li>
              <li><strong>DevOps & Operations:</strong> Managed containerized application lifecycles within K8s clusters, ensuring high availability and consistent uptime for critical manufacturing tools.</li>
            </ul>
          </Card>
          
          <Card title="Software Engineer" subtitle="Phison Electronics Corporation" date="Sep 2022 - Oct 2025" location="Miaoli, Taiwan" tags={['C++', 'Qt', 'ARM DS-5', 'Firmware']}>
            <ul className="list">
              <li><strong>NAND Emulation System:</strong> Developed a high-fidelity NAND emulation system using <strong>C++</strong>, ensuring accurate simulation of flash memory behaviors for firmware validation.</li>
              <li><strong>Firmware Validation:</strong> Designed rigorous error-handling algorithms and validation protocols to ensure firmware reliability under stress conditions.</li>
              <li><strong>Tool Development:</strong> Built a GUI-based firmware validation application using <strong>C++</strong> and the <strong>Qt framework</strong>, significantly improving testing efficiency.</li>
              <li><strong>Hardware Integration:</strong> Leveraged <strong>ARM DS-5</strong> and Evaluation Boards to conduct rigorous hardware-software co-simulation and debugging.</li>
            </ul>
          </Card>
        </section>

        {/* --- Technical Projects --- */}
        <section className="resume-section">
          <SectionHeader icon={FolderGit2} title="Technical Projects" />
          
          <Card title="EasyEat - Android App Development" tags={['Java', 'Azure', 'SQL', 'PHP']}>
            <ul className="list">
              <li>Developed an MVC-based Android application in <strong>Java</strong>, integrating it with an MSSQL database via PHP APIs.</li>
              <li>Configured Virtual Machines on <strong>Microsoft Azure</strong> (IaaS) and deployed an Apache server to host the backend.</li>
            </ul>
          </Card>

          <Card title="Medical Imaging AI (Fetal NT & Spinal Registration)" tags={['Deep Learning', 'Computer Vision', 'CNN']}>
            <ul className="list">
              <li>Developed a multi-stage CNN to locate fetal 2D planes in 3D ultrasound images for Down syndrome risk prediction.</li>
              <li>Created a neural network pipeline to register 3D spinal CT images with 2D fluoroscopy to enhance surgical precision.</li>
            </ul>
          </Card>

          <Card title="RISC-V CPU Design" tags={['Verilog HDL']}>
            <ul className="list">
              <li>Implemented ALU and decoder modules using <strong>Verilog HDL</strong> to execute a comprehensive set of RISC-V instructions.</li>
            </ul>
          </Card>
        </section>

        {/* --- Education --- */}
        <section className="resume-section">
          <SectionHeader icon={GraduationCap} title="Education" />
          
          <Card title="M.S. in Artificial Intelligence Master Program" subtitle="National Cheng Kung University (NCKU)" date="Jan 2020 - Sep 2022">
            <ul className="list">
              <li><strong>GPA:</strong> 4.23 / 4.3 (Ranked Top 3%)</li>
              <li><strong>Honor:</strong> <strong>Phi Tau Phi Scholastic Honor Society Member</strong> (Recognizing exceptional academic achievement and character).</li>
            </ul>
          </Card>
          
          <Card title="M.S. Institute of Molecular and Cellular Biology" subtitle="National Taiwan University (NTU)" date="Sep 2014 - Aug 2016">
            <ul className="list">
              <li><strong>GPA:</strong> 3.78 / 4</li>
              <li><strong>Publication:</strong> Co-authored <em>"Presynaptic SNAP-25 regulates retinal waves and retinogeniculate projection via phosphorylation"</em>, published in <strong>PNAS</strong> (Feb. 2019).</li>
            </ul>
          </Card>

          <Card title="B.S. in Bio-Agriculture Technology" subtitle="National Chiayi University (NCYU)" date="Sep 2010 - Jun 2014">
            <ul className="list">
              <li><strong>Honors:</strong> Class Valedictorian.</li>
            </ul>
          </Card>
        </section>

        {/* --- Honors & Awards --- */}
        <section className="resume-section">
          <SectionHeader icon={Trophy} title="Honors & Awards" />
          <div className="awards-container">
            <div className="award-item">
              <span className="award-title">LeetCode Algorithm Contest</span>
              <span className="award-desc">Achieved a <strong>Rating of 2,134</strong>, placing in the <strong>Top 1.28%</strong> of global participants.</span>
            </div>
            <div className="award-item">
              <span className="award-title">Global Programming Ranking</span>
              <span className="award-desc">Ranked <strong>378th</strong> globally in LeetCode Weekly Contest 397 (May 2024).</span>
            </div>
            <div className="award-item">
              <span className="award-title">AI CUP 2021 Top 10</span>
              <span className="award-desc">Ranked <strong>10th / 523 teams</strong> in the AI CUP 2021 (Crop Location Auto-Labeling).</span>
            </div>
            <div className="award-item">
              <span className="award-title">Phi Tau Phi Honor Society</span>
              <span className="award-desc">Selected for the Phi Tau Phi Honor Society (Top 3% of graduating class at NCKU).</span>
            </div>
            <div className="award-item">
              <span className="award-title">Dean's List Scholarship</span>
              <span className="award-desc">Dean's List Award recipient (6 semesters) at NCYU.</span>
            </div>
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