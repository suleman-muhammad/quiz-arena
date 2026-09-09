import { Link } from 'react-router-dom'

function Explore() {
    return (
        <div className="min-h-screen bg-[#050714] text-white relative overflow-hidden flex flex-col justify-between py-8 px-4 sm:px-6 selection:bg-purple-500 selection:text-white font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.25)_0%,_transparent_65%)] pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-cyan-500/20 rounded-full blur-[160px] pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <span className="absolute top-[10%] left-[12%] w-1.5 h-1.5 bg-cyan-300 rounded-full animate-star shadow-[0_0_8px_#38bdf8]" style={{ animationDelay: '0s' }} />
                <span className="absolute top-[18%] left-[28%] w-1 h-1 bg-purple-300 rounded-full animate-star shadow-[0_0_6px_#c084fc]" style={{ animationDelay: '1.2s' }} />
                <span className="absolute top-[8%] left-[55%] w-2 h-2 bg-cyan-200 rounded-full animate-star shadow-[0_0_10px_#67e8f9]" style={{ animationDelay: '2.1s' }} />
                <span className="absolute top-[22%] left-[75%] w-1 h-1 bg-amber-200 rounded-full animate-star shadow-[0_0_6px_#fde047]" style={{ animationDelay: '0.7s' }} />
                <span className="absolute top-[14%] left-[88%] w-1.5 h-1.5 bg-cyan-300 rounded-full animate-star shadow-[0_0_8px_#38bdf8]" style={{ animationDelay: '1.8s' }} />
            </div>

            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute top-1/4 left-[10%] w-2.5 h-2.5 bg-cyan-400/40 rotate-45 animate-vector-float shadow-[0_0_10px_rgba(6,182,212,0.6)]" style={{ animationDelay: '0s' }} />
                <div className="absolute top-1/3 right-[12%] w-3 h-3 bg-purple-400/40 rotate-45 animate-vector-float shadow-[0_0_10px_rgba(168,85,247,0.6)]" style={{ animationDelay: '2.5s' }} />
                <div className="absolute bottom-1/3 left-[18%] w-2 h-2 bg-amber-400/40 rotate-45 animate-vector-float shadow-[0_0_8px_rgba(245,158,11,0.6)]" style={{ animationDelay: '1.2s' }} />
            </div>

            <div className="absolute -bottom-10 inset-x-0 h-[44vh] vector-grid-3d pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.85)_35%,black_100%)] opacity-70" />
            <div className="absolute bottom-[40vh] inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent shadow-[0_0_18px_rgba(6,182,212,0.9)] pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <svg className="absolute top-14 left-6 w-32 h-32 text-purple-500/35 animate-circuit-pulse" viewBox="0 0 100 100" fill="none">
                    <path d="M0 40 L0 0 L40 0" stroke="currentColor" strokeWidth="2" />
                    <circle cx="4" cy="4" r="2.5" fill="currentColor" />
                    <line x1="12" y1="12" x2="35" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
                <svg className="absolute top-14 right-6 w-32 h-32 text-cyan-400/35 animate-circuit-pulse" viewBox="0 0 100 100" fill="none">
                    <path d="M100 40 L100 0 L60 0" stroke="currentColor" strokeWidth="2" />
                    <circle cx="96" cy="4" r="2.5" fill="currentColor" />
                    <line x1="88" y1="12" x2="65" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
            </div>

            <div className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between">
                <Link
                    to="/"
                    className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 hover:border-purple-500/80 text-purple-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all backdrop-blur-md shadow-md hover:scale-105 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <span>Back to Arena</span>
                </Link>

                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-1.5 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">Sector: Nexus v2</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full relative z-10 my-auto text-center py-10 space-y-8">
                <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/30 to-pink-500/20 blur-3xl animate-pulse" />
                    
                    <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-cyan-400/40 bg-slate-950/70 backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                        <svg className="absolute inset-0 w-full h-full text-purple-500/40 animate-[spin_20s_linear_infinite]" viewBox="0 0 200 200" fill="none">
                            <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
                            <circle cx="100" cy="100" r="76" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.6" />
                        </svg>

                        <svg className="absolute inset-0 w-full h-full text-cyan-400/40 animate-[spin_12s_linear_infinite_reverse]" viewBox="0 0 200 200" fill="none">
                            <circle cx="100" cy="100" r="84" stroke="currentColor" strokeWidth="1" strokeDasharray="12 12" />
                        </svg>

                        <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
                            <span className="text-4xl sm:text-5xl animate-bounce">🌐</span>
                            <span className="text-[9px] sm:text-[10px] font-mono font-black text-cyan-300 uppercase tracking-widest bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                                SYNC GATE
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 max-w-2xl mx-auto">
                    <span className="bg-purple-950/80 border border-purple-400/50 text-purple-300 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)] inline-block">
                        ⚡ NEXUS TELEMETRY · UPCOMING FEATURE
                    </span>

                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wide uppercase">
                        The Explore Vault
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                        A global gateway connecting QuizArena to thousands of community trivia battles, live OpenTDB categories, and instant matchmaking.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
                    <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-4 backdrop-blur-md shadow-lg text-left">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">OpenTDB API</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        </div>
                        <div className="text-sm font-black text-white">20+ Categories</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Connecting endpoints</div>
                    </div>

                    <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-4 backdrop-blur-md shadow-lg text-left">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">Matchmaking</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        </div>
                        <div className="text-sm font-black text-white">Public Hub</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">1-Click Instant Battle</div>
                    </div>

                    <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-md shadow-lg text-left">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Status</span>
                            <span className="text-[10px] font-mono text-amber-400 font-extrabold">v2.0</span>
                        </div>
                        <div className="text-sm font-black text-white">In Development</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Arriving soon</div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <Link
                        to="/create"
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all hover:scale-105 active:scale-95"
                    >
                        ⚔️ Create Custom Quiz Instead
                    </Link>
                    <Link
                        to="/"
                        className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                    >
                        Browse Arena Home
                    </Link>
                </div>
            </div>

            <div className="relative z-20 text-center py-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    QuizArena · High-Performance Real-Time Trivia
                </span>
            </div>
        </div>
    )
}

export default Explore
