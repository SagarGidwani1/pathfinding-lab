import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Zap,
  GitMerge,
  Target,
  Navigation,
  Activity,
  HelpCircle,
  Layers,
  Network,
  BookOpen,
  Cpu,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

const TREE_GRAPH = {
  nodes: [
    { id: 0, x: 250, y: 50, label: 'a' },
    { id: 1, x: 140, y: 120, label: 'b' },
    { id: 2, x: 360, y: 120, label: 'c' },
    { id: 3, x: 80, y: 200, label: 'd' },
    { id: 4, x: 200, y: 200, label: 'e' },
    { id: 5, x: 300, y: 200, label: 'f' },
    { id: 6, x: 420, y: 200, label: 'g' },
    { id: 7, x: 80, y: 280, label: 'h' },
    { id: 8, x: 170, y: 280, label: 'i' },
    { id: 9, x: 230, y: 280, label: 'j' },
    { id: 10, x: 300, y: 280, label: 'k' },
  ],
  edges: [
    { u: 0, v: 1 }, { u: 0, v: 2 },
    { u: 1, v: 3 }, { u: 1, v: 4 },
    { u: 2, v: 5 }, { u: 2, v: 6 },
    { u: 3, v: 7 }, { u: 4, v: 8 }, 
    { u: 4, v: 9 }, { u: 5, v: 10 }
  ]
};

const NETWORK_GRAPH = {
  nodes: [
    { id: 0, x: 60, y: 160, label: 'Start', h: 400 },
    { id: 1, x: 180, y: 70, label: 'A', h: 300 },
    { id: 2, x: 180, y: 250, label: 'B', h: 280 },
    { id: 3, x: 320, y: 70, label: 'C', h: 150 },
    { id: 4, x: 320, y: 250, label: 'D', h: 120 },
    { id: 5, x: 440, y: 160, label: 'Goal', h: 0 },
  ],
  edges: [
    { u: 0, v: 1, w: 4 }, { u: 0, v: 2, w: 2 },
    { u: 1, v: 2, w: 5 }, { u: 1, v: 3, w: 10 },
    { u: 2, v: 4, w: 3 }, { u: 3, v: 4, w: 4 },
    { u: 3, v: 5, w: 11 }, { u: 4, v: 5, w: 2 },
    { u: 2, v: 3, w: 8 }
  ]
};

const ALGO_CONFIG = {
  BFS: { 
    title: "Breadth-First Search", 
    Icon: Zap, 
    pseudo: ["Q = [start]", "while Q:", "  u = Q.shift()", "  explore(neighbors)"],
    concept: "BFS explores layer by layer, starting from the source. It ensures that when you find a node, you've found the shortest path (in terms of steps) from the start.",
    complexity: "Time: O(V + E) | Space: O(V)",
    apps: "GPS Navigation, Social Media Friend Suggestions, Network Broadcasting."
  },
  DFS: { 
    title: "Depth-First Search", 
    Icon: Activity, 
    pseudo: ["S = [start]", "while S:", "  u = S.pop()", "  dive(neighbors)"],
    concept: "DFS dives deep into a branch until it hits a dead end, then backtracks. It's efficient for searching exhaustive possibilities.",
    complexity: "Time: O(V + E) | Space: O(V)",
    apps: "Solving Puzzles (Sudoku, Mazes), Topological Sorting, Cycle Detection."
  },
  DIJKSTRA: { 
    title: "Dijkstra's Algo", 
    Icon: Navigation, 
    pseudo: ["PQ = [(0, start)]", "while PQ:", "  u = PQ.pop_min()", "  relax(edges)"],
    concept: "Dijkstra handles graphs with weighted edges. It always picks the 'cheapest' node next to find the absolute shortest total path cost.",
    complexity: "Time: O((V+E) log V) | Space: O(V)",
    apps: "Map Routing (Google Maps), Network Protocols (OSPF), Logistics."
  },
  ASTAR: { 
    title: "A* Search", 
    Icon: Target, 
    pseudo: ["PQ = [(f, start)]", "f = cost + guess", "while PQ:", "  u = PQ.pop_min()"],
    concept: "A* is an 'informed' search. It uses a heuristic (H) to guess the distance to the goal, allowing it to ignore paths heading the wrong way.",
    complexity: "Time: O(E) (Optimal Case) | Space: O(V)",
    apps: "Video Game Character Pathfinding, Robotics, Natural Language Processing."
  }
};

const App = () => {
  const [activeAlgo, setActiveAlgo] = useState('BFS');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);

  const steps = useRef([]);
  const currentGraph = (activeAlgo === 'BFS' || activeAlgo === 'DFS') ? TREE_GRAPH : NETWORK_GRAPH;

  const reset = () => {
    setIsPlaying(false);
    setStepIndex(-1);
  };

  const generateSteps = useCallback((type) => {
    const data = (type === 'BFS' || type === 'DFS') ? TREE_GRAPH : NETWORK_GRAPH;
    const adj = Array.from({ length: data.nodes.length }, () => []);
    data.edges.forEach(({ u, v, w }) => {
      adj[u].push({ node: v, w });
      adj[v].push({ node: u, w });
    });

    const output = [];

    if (type === 'BFS') {
      const visited = new Set([0]);
      const queue = [0];
      output.push({ mem: [0], v: new Set([0]), curr: null, line: 0, msg: "Initialize Search", tip: "Start at root node 'a'." });
      while (queue.length > 0) {
        const u = queue.shift();
        output.push({ mem: [...queue], v: new Set(visited), curr: u, line: 2, msg: `Visiting ${data.nodes[u].label}`, tip: "Pop node from front." });
        for (const n of adj[u].sort((a,b) => a.node - b.node)) {
          if (!visited.has(n.node)) {
            visited.add(n.node); queue.push(n.node);
            output.push({ mem: [...queue], v: new Set(visited), curr: u, line: 3, msg: `Found ${data.nodes[n.node].label}`, tip: "Add to back of queue." });
          }
        }
      }
    } else if (type === 'DFS') {
      const visited = new Set();
      const stack = [0];
      const dfs = (u) => {
        visited.add(u);
        output.push({ mem: [...stack], v: new Set(visited), curr: u, line: 2, msg: `Visiting ${data.nodes[u].label}`, tip: "Diving deep into the branch." });
        for (const n of adj[u].filter(x => !visited.has(x.node)).sort((a,b) => a.node - b.node)) {
          stack.push(n.node);
          dfs(n.node);
          stack.pop();
          output.push({ mem: [...stack], v: new Set(visited), curr: u, line: 1, msg: `Backtrack to ${data.nodes[u].label}`, tip: "Moving back up." });
        }
      };
      dfs(0);
    } else if (type === 'DIJKSTRA') {
      const dists = Array(data.nodes.length).fill(Infinity);
      const visited = new Set();
      dists[0] = 0;
      const pq = [{ node: 0, d: 0 }];
      output.push({ mem: [0], v: new Set(), curr: null, line: 0, msg: "Start Dijkstra", tip: "Find the shortest total cost." });
      while (pq.length > 0) {
        pq.sort((a,b) => a.d - b.d);
        const { node: u, d } = pq.shift();
        if (visited.has(u)) continue;
        visited.add(u);
        output.push({ mem: pq.map(x => x.node), v: new Set(visited), curr: u, line: 2, msg: `Visit ${data.nodes[u].label} (${d})`, tip: "Pick node with lowest distance." });
        for (const n of adj[u]) {
          const newD = dists[u] + n.w;
          if (newD < dists[n.node]) {
            dists[n.node] = newD; pq.push({ node: n.node, d: newD });
            output.push({ mem: pq.map(x => x.node), v: new Set(visited), curr: u, line: 3, msg: `Relaxing ${data.nodes[n.node].label}`, tip: `Updated cost to ${newD}` });
          }
        }
      }
    } else if (type === 'ASTAR') {
      const g = Array(data.nodes.length).fill(Infinity);
      const visited = new Set();
      g[0] = 0;
      const pq = [{ node: 0, f: data.nodes[0].h }];
      output.push({ mem: [0], v: new Set(), curr: null, line: 0, msg: "Start A*", tip: "Distance + Heuristic (Guess)." });
      while (pq.length > 0) {
        pq.sort((a,b) => a.f - b.f);
        const { node: u } = pq.shift();
        if (visited.has(u)) continue;
        visited.add(u);
        output.push({ mem: pq.map(x => x.node), v: new Set(visited), curr: u, line: 2, msg: `Visit ${data.nodes[u].label}`, tip: "Pick node with lowest f-cost." });
        if (u === 5) break;
        for (const n of adj[u]) {
          const newG = g[u] + n.w;
          if (newG < g[n.node]) {
            g[n.node] = newG;
            const f = newG + data.nodes[n.node].h;
            pq.push({ node: n.node, f });
            output.push({ mem: pq.map(x => x.node), v: new Set(visited), curr: u, line: 3, msg: `Update ${data.nodes[n.node].label}`, tip: `g(${newG}) + h(${data.nodes[n.node].h}) = ${f}` });
          }
        }
      }
    }
    return output;
  }, []);

  useEffect(() => {
    steps.current = generateSteps(activeAlgo);
    reset();
  }, [activeAlgo, generateSteps]);

  useEffect(() => {
    let timer;
    if (isPlaying && stepIndex < steps.current.length - 1) {
      timer = setTimeout(() => setStepIndex(s => s + 1), speed);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, speed]);

  const currentStep = steps.current[Math.min(stepIndex, steps.current.length - 1)] || { v: new Set(), mem: [], msg: "Ready", tip: "Press play to start" };

  return (
    <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} min-h-screen font-sans transition-colors duration-300`}>
      <header className={`sticky top-0 z-[100] border-b-4 border-black px-6 py-4 flex items-center justify-between ${isDarkMode ? 'bg-zinc-800' : 'bg-yellow-400'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 border-2 border-black p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <GitMerge size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Pathfinding<span className="text-orange-600 italic">Lab</span></h1>
        </div>

        <div className="flex bg-black p-1 rounded-2xl gap-1">
          {Object.keys(ALGO_CONFIG).map(k => (
            <button key={k} onClick={() => setActiveAlgo(k)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeAlgo === k ? 'bg-orange-500 text-white scale-105' : 'text-slate-500 hover:text-white'}`}>
              {k}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 border-2 border-black rounded-lg bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:shadow-none transition-all"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Tempo</span>
            <input type="range" min="200" max="2500" step="100" value={2700 - speed} onChange={(e) => setSpeed(2700 - parseInt(e.target.value))} 
              className="w-24 accent-orange-600" />
          </div>
        </div>
      </header>

      <main className="flex flex-col overflow-y-auto h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col gap-6 p-6 min-h-[90vh] shrink-0">
          <div className="flex gap-6 flex-1 min-h-0">
            <aside className="w-72 flex flex-col gap-6">
              <div className={`border-4 border-black p-6 rounded-[32px] flex-1 flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isDarkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-50">Code Execution</h3>
                <div className="space-y-3 font-mono text-[11px] font-bold">
                  {ALGO_CONFIG[activeAlgo].pseudo.map((l, i) => (
                    <div key={i} className={`px-4 py-2 border-2 border-transparent rounded-xl transition-all ${stepIndex !== -1 && i === currentStep.line ? 'bg-orange-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105' : 'text-slate-500 opacity-60'}`}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`border-4 border-black p-5 h-48 flex flex-col rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isDarkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                <h3 className="text-xs font-black uppercase tracking-widest mb-3 opacity-50">Memory Space</h3>
                <div className="flex gap-2 flex-wrap overflow-y-auto content-start py-2">
                  {currentStep.mem.length === 0 ? <span className="text-[10px] font-black uppercase italic opacity-20 m-auto">Nothing waiting...</span> : 
                    currentStep.mem.map((id, i) => (
                      <div key={i} className={`w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${i === 0 ? 'bg-orange-500 text-white' : 'bg-white text-black'}`}>
                        {currentGraph.nodes[id].label}
                      </div>
                    ))
                  }
                </div>
              </div>
            </aside>

            <section className={`flex-1 border-4 border-black rounded-[40px] relative overflow-hidden flex flex-col items-center justify-center p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${isDarkMode ? 'bg-zinc-800' : 'bg-white'}`}>
              <div className="absolute top-6 left-8 flex items-center gap-4">
                <div className="px-4 py-2 bg-orange-500 border-2 border-black rounded-xl text-xs font-black text-white uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {currentStep.msg}
                </div>
              </div>

              <svg className="w-full h-full max-w-2xl" viewBox="0 0 500 320">
                {currentGraph.edges.map((e, i) => {
                  const start = currentGraph.nodes[e.u];
                  const end = currentGraph.nodes[e.v];
                  const activeLine = currentStep.v.has(e.u) && currentStep.v.has(e.v);
                  return (
                    <g key={i}>
                      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
                        stroke={activeLine ? "#f97316" : (isDarkMode ? "#333" : "#f1f5f9")} 
                        strokeWidth={activeLine ? "6" : "3"} strokeLinecap="round" />
                      {e.w && <text x={(start.x+end.x)/2} y={(start.y+end.y)/2-6} textAnchor="middle" fontSize="12" fontWeight="900" fill={isDarkMode ? "#555" : "#cbd5e1"}>{e.w}</text>}
                    </g>
                  );
                })}
                {currentGraph.nodes.map(n => {
                  const isV = currentStep.v.has(n.id);
                  const isC = currentStep.curr === n.id;
                  const inM = currentStep.mem.includes(n.id);
                  return (
                    <g key={n.id} transform={`translate(${n.x},${n.y})`} className="transition-all duration-300">
                      {isC && <circle r="30" className="fill-orange-500 animate-ping opacity-20" />}
                      <circle r="22" fill={isC ? '#f97316' : inM ? '#fff' : isV ? '#fff' : (isDarkMode ? '#222' : '#fff')} 
                        stroke="black" strokeWidth="3" className="shadow-lg" />
                      <text textAnchor="middle" dy=".3em" fontSize="12" fontWeight="900" fill={isC ? 'white' : (isDarkMode ? '#eee' : '#64748b')}>{n.label}</text>
                      {activeAlgo === 'ASTAR' && <text y="36" textAnchor="middle" fontSize="10" fill={isDarkMode ? "#888" : "#94a3b8"} fontWeight="black">h={n.h}</text>}
                    </g>
                  );
                })}
              </svg>

              {/* UPDATED CONSOLE BAR (Moved to Bottom-Right) */}
              <div className={`absolute bottom-6 right-2 flex items-center gap-8 px-8 py-4 border-4 border-black rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                <div className="flex items-center gap-6">
                  <button onClick={() => setStepIndex(s => Math.max(-1, s-1))} disabled={stepIndex <= -1} 
                    className="hover:scale-110 active:scale-95 disabled:opacity-20 transition-all text-orange-500"><ChevronLeft size={32} strokeWidth={3}/></button>
                  <button onClick={() => setIsPlaying(!isPlaying)} 
                    className="w-14 h-14 bg-orange-500 border-4 border-black rounded-2xl flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                    {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
                  </button>
                  <button onClick={() => setStepIndex(s => Math.min(steps.current.length - 1, s+1))} disabled={isPlaying}
                    className="hover:scale-110 active:scale-95 disabled:opacity-20 transition-all text-orange-500"><ChevronRight size={32} strokeWidth={3}/></button>
                </div>
                <div className="h-10 w-[1px] bg-black opacity-10" />
                <button onClick={reset} className="text-slate-400 hover:text-orange-500 transition-colors uppercase font-black text-xs flex items-center gap-2">
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </section>
          </div>

          <div className="px-10 py-4 bg-orange-100 border-4 border-black rounded-2xl flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <HelpCircle size={20} className="text-orange-600 shrink-0" />
             <p className="text-sm font-black italic text-orange-950">"{currentStep.tip}"</p>
          </div>
        </div>

        <section className={`px-12 py-20 flex flex-col gap-16 border-t-4 border-black ${isDarkMode ? 'bg-zinc-950' : 'bg-slate-50'}`}>
          <div className="max-w-4xl mx-auto space-y-24">
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-yellow-400 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <BookOpen size={32} className="text-black" />
                </div>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter">The Concept</h2>
              </div>
              <p className="text-2xl font-bold leading-snug opacity-80">
                {ALGO_CONFIG[activeAlgo].concept}
              </p>
              <div className="grid grid-cols-2 gap-8 mt-12">
                <div className={`p-8 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isDarkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                  <h4 className="text-sm font-black uppercase text-orange-500 mb-4 tracking-widest">Logic Type</h4>
                  <p className="text-xl font-bold">{activeAlgo === 'BFS' || activeAlgo === 'DFS' ? 'Uninformed Search' : 'Informed / Weighted Search'}</p>
                </div>
                <div className={`p-8 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isDarkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                  <h4 className="text-sm font-black uppercase text-orange-500 mb-4 tracking-widest">Data Structure</h4>
                  <p className="text-xl font-bold">{ALGO_CONFIG[activeAlgo].memory}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-cyan-400 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Cpu size={32} className="text-black" />
                </div>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter">Complexity</h2>
              </div>
              <div className={`p-10 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isDarkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                <p className="text-4xl font-mono font-black text-orange-500 tracking-tighter">
                  {ALGO_CONFIG[activeAlgo].complexity}
                </p>
                <p className="mt-6 text-lg font-bold opacity-60">
                  Performance is measured based on <span className="text-indigo-500 italic">V</span> (Vertices/Nodes) and <span className="text-indigo-500 italic">E</span> (Edges/Connections).
                </p>
              </div>
            </div>

            <div className="space-y-6 pb-20">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-pink-500 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Globe size={32} className="text-black" />
                </div>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter">Applications</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ALGO_CONFIG[activeAlgo].apps.split(',').map((app, i) => (
                  <div key={i} className={`p-6 border-4 border-black rounded-2xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] transition-all cursor-default ${isDarkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                    {app.trim()}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-2 bg-black z-[101]">
        <div 
          className="h-full bg-orange-500 transition-all duration-300" 
          style={{ width: `${stepIndex === -1 ? 0 : ((stepIndex + 1) / steps.current.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default App;