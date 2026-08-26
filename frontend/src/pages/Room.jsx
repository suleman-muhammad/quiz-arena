import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import SockJS from "sockjs-client"
import Stomp from 'stompjs'
import { PlayerAvatar, HostAvatar } from "../components/CyberAvatar"
import colosseumBg from "../assets/colosseum_bg.jpg"

function Room() {
    const navigate = useNavigate()

    const { roomCode } = useParams()
    const [searchParams] = useSearchParams()
    const nickName = searchParams.get('nickname') || 'Gladiator'

    const [connected, setConnected] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)
    const [totalTime, setTotalTime] = useState(10)
    const [countdown, setCountdown] = useState(3)
    
    const [myMsgs, setMyMsgs] = useState('')

    const [quizId, setQuizId] = useState(-1)
    const [quizTitle, setQuizTitle] = useState('')
    const [quizDescription, setQuizDescription] = useState('')
    const [questionCount, setQuestionCount] = useState(0)

    const [gameState, setGameState] = useState('START')

    const [currQuestionNo, setCurrQuestionNo] = useState(0)
    const [questionText, setQuestionText] = useState('')
    const [optionA, setOptionA] = useState('')
    const [optionB, setOptionB] = useState('')
    const [optionC, setOptionC] = useState('')
    const [optionD, setOptionD] = useState('')
    const [answer, setAnswer] = useState('')

    const [leaderboard, setLeaderBoard] = useState([])
    const currectScore = useRef(0)
    const [totalScore, setTotalScore] = useState(0)
    const [position, setPosition] = useState(0)

    /*
     * ---------------------------------------------------------------------------------
     * 💡 NOTE FOR YOUR LOGIC PHASE (Add/Expand these whenever you are ready):
     * - streakCount: Track consecutive correct answers (e.g. 2x, 3x fire multiplier)
     * - playerSubmittedMap: Track real-time player answer submissions for checkmarks
     * - speedBonusPoints: Calculate extra points earned based on response speed
     * - isMuted: Toggle sound effects on/off
     * ---------------------------------------------------------------------------------
     */

    const stompClient = useRef(null)

    useEffect(() => {
        fetch(`http://localhost:8080/api/rooms/${roomCode}`)
            .then(res => res.json())
            .then((data) => {
                if (data === null) {
                    navigate("/")
                }else{
                    setLeaderBoard(data.players ? data.players.slice(0, 5) : [])

                    const me = data.players.find(p => p.nickName === nickName)
                    if (me){
                        setTotalScore(me.score)
                        setPosition(me.currentPos)
                    }
                }        
            })
            .catch(err => console.log(err))
        
        fetch(`http://localhost:8080/api/rooms/${roomCode}/quiz`)
            .then(res => {
                if (!res.ok) return null
                return res.json()
            })
            .then((id) => {
                if (id == null) {
                    console.log(`Room with code ${roomCode} does not have quiz.`)
                    navigate("/")
                    return
                }
                
                fetch(`http://localhost:8080/api/quizzes/${id}`)
                    .then(res => {
                        if (!res.ok) return null
                        return res.json()
                    })
                    .then((data) => {
                        if (data == null) {
                            console.log(`No quiz found with Id ${id}`)
                            navigate("/")
                            return
                        }
                        setQuizId(id)
                        setQuizTitle(data.title)
                        setQuizDescription(data.description)
                        setQuestionCount(data.questions?.length || 0)
                    })
            })

        const socket = new SockJS('http://localhost:8080/ws')
        const client = Stomp.over(socket)
        client.debug = null
        client.connect({}, () => {
            stompClient.current = client
            setConnected(true)

            client.subscribe(`/topic/room/update/${roomCode}`, (msg) => {
                const data = JSON.parse(msg.body)
                console.log(data)
            })

            client.subscribe(`/topic/room/play/question/text/${roomCode}`, (msg) => {
                const data = JSON.parse(msg.body)
                console.log(data)

                setGameState("QUESTION")
                setCurrQuestionNo(data.questionNo)
                setQuestionText(data.questionText)
            })

            client.subscribe(`/topic/room/play/question/options/${roomCode}`, (msg) =>{
                const data = JSON.parse(msg.body)
                console.log(data)

                setGameState("ANSWERING")
                setOptionA(data.optionA)
                setOptionB(data.optionB)
                setOptionC(data.optionC)
                setOptionD(data.optionD)
                setTimeLeft(data.timeLimit || 10)
                setTotalTime(data.timeLimit || 10)
            })

            client.subscribe(`/topic/room/play/question/stop/${roomCode}`, (msg) =>{
                const data = JSON.parse(msg.body)
                console.log(data)

                setTimeLeft(0)
                setTotalTime(0)
                setAnswer(data.answer)

                if(currectScore.current > 0){
                    setGameState('RESULT_CORRECT')
                }else{
                    setGameState("RESULT_WRONG")
                }
                setOptionA('')
                setOptionB('')
                setOptionC('')
                setOptionD('')
            })

            client.subscribe(`/topic/room/play/leaderboard/${roomCode}`, (msg) =>{
                const players = JSON.parse(msg.body)
                console.log(players)
                setLeaderBoard(players.slice(0,5))

                const me = players.find(p => p.nickName === nickName)
                if(me){
                    setTotalScore(me.score)
                    setPosition(me.currentPos)
                }

                setGameState("LEADERBOARD")
            })

            client.subscribe(`/topic/room/${roomCode}/player/${nickName}/scores`, (msg) => {
                const result = JSON.parse(msg.body)
                console.log(result)
                currectScore.current = result
            })

            client.subscribe(`/topic/room/end/${roomCode}`, (msg) => {
                const data = JSON.parse(msg.body)
                console.log(data)
                setGameState('GAME_OVER')
            })
        }, () => {
            setConnected(false)
        })

        return () => {
            if (stompClient.current) stompClient.current.disconnect()
        }
    }, [roomCode, nickName, navigate])

    useEffect(() => {
        if (timeLeft <= 0) return
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [timeLeft])

    useEffect(() => {
        if (gameState !== 'START' || countdown <= 0) return

        const timer = setInterval(() => {
            setCountdown(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [gameState, countdown])

    function submitAnswer(val) {
        setGameState('SUBMITTED')
        if (stompClient.current) {
            stompClient.current.send("/app/game/room/answer", {}, JSON.stringify({
                roomCode: roomCode,
                playerNickName: nickName,
                questionNo: currQuestionNo,
                chosenOption: val,
                answeredAtMillis: Date.now()
            }))
        }
    }

    function getPosition(pos) {
        const places = ['st', 'nd', 'rd']
        if (pos >= 1 && pos <= 3) {
            return pos + places[pos - 1]
        }
        return (pos || 1) + 'th'
    }

    // Circular Countdown math (circumference = 2 * PI * r)
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = totalTime > 0 ? circumference - (timeLeft / totalTime) * circumference : circumference

    return (
        <div className="min-h-screen bg-[#070a18] text-white relative overflow-hidden flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans">
            
            {/* Gothic Colosseum Arena Photographic Backdrop with Cheering Spectators */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-50 transform scale-105"
                style={{ backgroundImage: `url(${colosseumBg})` }}
            />
            {/* Dark Vignette & Ambient Glows Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070a18]/85 via-[#070a18]/65 to-[#070a18]/90 pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-64 cyber-grid opacity-20 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,black)]" />

            {/* ========================================================= */}
            {/* TOP TACTICAL HUD BAR                                      */}
            {/* ========================================================= */}
            <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    
                    {/* Room Code Badge */}
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2">
                            <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">Room</span>
                            <span className="font-mono font-black text-amber-400 tracking-wider text-sm">{roomCode}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1">
                            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="text-[11px] font-semibold text-slate-300">{connected ? 'Live' : 'Offline'}</span>
                        </div>
                    </div>

                    {/* Question Tracker Badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Progress</span>
                        <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-400/50 text-purple-200 text-xs font-black px-4 py-1.5 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                            Question {currQuestionNo} of {questionCount || 5}
                        </div>
                    </div>

                    {/* Personal Combat Stats (Rank, Score, Avatar) */}
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-1 flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Rank</p>
                                <p className="text-xs font-black text-cyan-400">{getPosition(position)}</p>
                            </div>
                            <div className="h-6 w-px bg-slate-700/80" />
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Score</p>
                                <p className="text-xs font-black text-amber-300 flex items-center gap-1">
                                    <span>👑</span> {totalScore.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <PlayerAvatar name={nickName} className="w-9 h-9" />
                    </div>
                </div>
            </header>

            {/* ========================================================= */}
            {/* MAIN BATTLE ARENA GRID (Left: 8 cols, Right: 4 cols)      */}
            {/* ========================================================= */}
            <main className="max-w-7xl mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 my-auto">
                
                {/* --------------------------------------------------------- */}
                {/* LEFT ARENA: Question Card, Timer & Answer Pads (8 cols)   */}
                {/* --------------------------------------------------------- */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                    
                    {/* Circular Countdown Timer */}
                    <div className="flex justify-center mb-4">
                        <div className="relative flex items-center justify-center">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    className="text-slate-800"
                                    fill="transparent"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className={`transition-all duration-1000 ${
                                        timeLeft <= 3 ? 'text-rose-500 animate-pulse' :
                                        timeLeft <= 5 ? 'text-amber-400' : 'text-cyan-400'
                                    }`}
                                    fill="transparent"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-2xl font-black font-mono ${
                                    timeLeft <= 3 ? 'text-rose-400' : 'text-white'
                                }`}>
                                    {String(timeLeft).padStart(2, '0')}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">SEC</span>
                            </div>
                        </div>
                    </div>

                    {/* Question Card Container */}
                    <div className="bg-slate-900/90 border-2 border-purple-500/60 rounded-2xl p-6 sm:p-8 glow-purple backdrop-blur-md relative overflow-hidden mb-6 text-center">
                        <span className="bg-purple-950/80 border border-purple-400/50 text-purple-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                            Question {currQuestionNo} of {questionCount || 5}
                        </span>
                        
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed mt-2 drop-shadow-md">
                            {questionText || "Waiting for battle question to commence..."}
                        </h2>

                        {gameState === 'QUESTION' && (
                            <p className="text-xs text-purple-300 font-bold uppercase tracking-widest mt-4 animate-pulse">
                                ⚔️ Answers unlocking shortly... Read carefully!
                            </p>
                        )}
                    </div>

                    {/* State 3: Active 4 Combat Answer Pads (2x2 Grid) */}
                    {gameState === 'ANSWERING' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { 
                                    label: 'A', 
                                    text: optionA, 
                                    border: 'border-rose-500/70 hover:border-rose-400',
                                    bg: 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-rose-900/40',
                                    badge: 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.7)]',
                                    val: 0 
                                },
                                { 
                                    label: 'B', 
                                    text: optionB, 
                                    border: 'border-cyan-500/70 hover:border-cyan-400',
                                    bg: 'bg-gradient-to-br from-cyan-950/60 via-slate-900 to-cyan-900/40',
                                    badge: 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.7)]',
                                    val: 1 
                                },
                                { 
                                    label: 'C', 
                                    text: optionC, 
                                    border: 'border-emerald-500/70 hover:border-emerald-400',
                                    bg: 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-emerald-900/40',
                                    badge: 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.7)]',
                                    val: 2 
                                },
                                { 
                                    label: 'D', 
                                    text: optionD, 
                                    border: 'border-amber-500/70 hover:border-amber-400',
                                    bg: 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-amber-900/40',
                                    badge: 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.7)]',
                                    val: 3 
                                },
                            ].map(opt => (
                                <button
                                    key={opt.label}
                                    onClick={() => submitAnswer(opt.val)}
                                    className={`${opt.bg} border-2 ${opt.border} rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center gap-4 group cursor-pointer`}
                                >
                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${opt.badge}`}>
                                        {opt.label}
                                    </span>
                                    <span className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-white leading-snug">
                                        {opt.text || `Option ${opt.label}`}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* State 4: Answer Submitted / Locked in */}
                    {gameState === 'SUBMITTED' && (
                        <div className="bg-slate-900/90 border-2 border-cyan-500/80 rounded-2xl p-8 glow-cyan text-center backdrop-blur-md">
                            <div className="text-4xl mb-3 animate-bounce">🔒</div>
                            <h3 className="text-xl font-black text-white">Answer Locked In!</h3>
                            <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider mt-1">
                                Stand by while other gladiators submit...
                            </p>
                        </div>
                    )}

                    {/* State 5: Correct Answer Result */}
                    {gameState === 'RESULT_CORRECT' && (
                        <div className="bg-slate-900/90 border-2 border-emerald-500/80 rounded-2xl p-8 glow-emerald text-center backdrop-blur-md animate-fade-in">
                            <div className="text-5xl mb-2">✅</div>
                            <h3 className="text-2xl font-black text-emerald-400">CORRECT!</h3>
                            <div className="mt-3 inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-400/60 px-4 py-1.5 rounded-full text-emerald-200 text-sm font-black shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                                <span>⚡</span> +{currectScore.current || 940} PTS
                            </div>
                        </div>
                    )}

                    {/* State 6: Wrong Answer Result */}
                    {gameState === 'RESULT_WRONG' && (
                        <div className="bg-slate-900/90 border-2 border-rose-500/80 rounded-2xl p-8 text-center backdrop-blur-md animate-fade-in">
                            <div className="text-5xl mb-2">❌</div>
                            <h3 className="text-2xl font-black text-rose-500">WRONG!</h3>
                            <p className="text-xs text-slate-300 mt-2">
                                Correct Answer: <span className="font-bold text-emerald-400">{answer}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* --------------------------------------------------------- */}
                {/* RIGHT ARENA: Live Rival Mini-Leaderboard (4 cols)         */}
                {/* --------------------------------------------------------- */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col h-full justify-between">
                        
                        <div>
                            {/* Leaderboard Header */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                <span className="text-xs font-extrabold tracking-wider uppercase text-purple-400 flex items-center gap-1.5">
                                    <span>⚔️</span> Live Arena Standings
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Top 5
                                </span>
                            </div>

                            {/* Competitor List */}
                            <div className="space-y-2.5">
                                {leaderboard.map((p, index) => {
                                    const isMe = p.nickName === nickName
                                    const medals = ['🥇', '🥈', '🥉']
                                    const isTop3 = p.currentPos < 3

                                    return (
                                        <div
                                            key={p.currentPos || index}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                isMe
                                                    ? 'bg-purple-950/60 border-purple-500/80 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                                                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Medal / Rank Tag */}
                                                <span className="w-5 text-center text-sm font-black">
                                                    {isTop3 ? medals[p.currentPos] : `#${p.currentPos}`}
                                                </span>

                                                {/* Warrior Avatar */}
                                                <PlayerAvatar index={p.currentPos} name={p.nickName} className="w-8 h-8" />

                                                <div>
                                                    <p className={`text-xs font-black truncate max-w-[100px] ${isMe ? 'text-purple-200' : 'text-slate-200'}`}>
                                                        {isMe ? `${p.nickName} (You)` : p.nickName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Score & Submission Status Indicator */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-amber-400 font-mono">
                                                    {p.score.toLocaleString() || 0}
                                                </span>
                                                <span className="text-emerald-400 text-xs font-bold" title="Submitted">
                                                    ✔
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}

                                {leaderboard.length === 0 && (
                                    <div className="text-center py-6 text-slate-500 text-xs">
                                        Loading competitor scores...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pinned Your Stats Card */}
                        <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950/80 rounded-xl p-3 flex items-center justify-between border border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <PlayerAvatar name={nickName} className="w-8 h-8" />
                                <div>
                                    <p className="text-xs font-black text-white">{nickName}</p>
                                    <p className="text-[10px] font-bold text-purple-400">{getPosition(position)} place</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-amber-300 font-mono">
                                {totalScore.toLocaleString()} pts
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* ========================================================= */}
            {/* OVERLAY: PRE-ROUND COUNTDOWN (Get Ready)                  */}
            {/* ========================================================= */}
            {gameState === 'START' && (
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
                    <div className="text-center max-w-sm">
                        <div className="w-20 h-20 mx-auto mb-4">
                            <HostAvatar className="w-20 h-20" />
                        </div>
                        <h2 className="text-lg font-black text-purple-300 uppercase tracking-widest mb-1">
                            Prepare for battle!
                        </h2>
                        <p className="text-xs text-slate-400 mb-6">First question starting in</p>
                        <span className="text-8xl font-black text-white animate-pulse font-mono drop-shadow-[0_0_30px_rgba(168,85,247,0.9)]">
                            {countdown}
                        </span>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* OVERLAY: ROUND STANDINGS & GAME OVER PODIUM               */}
            {/* ========================================================= */}
            {(gameState === 'LEADERBOARD' || gameState === 'GAME_OVER') && (
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-slate-900 border-2 border-purple-500/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl glow-purple backdrop-blur-xl animate-fade-in my-auto">
                        
                        <div className="text-5xl mb-2">
                            {gameState === 'GAME_OVER' ? '🏆' : '⚔️'}
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-wide">
                            {gameState === 'GAME_OVER' ? 'Grand Tournament Victor!' : 'Round Standings'}
                        </h2>
                        <p className="text-xs text-purple-300 font-bold uppercase tracking-widest mt-1 mb-6">
                            {gameState === 'GAME_OVER' ? 'Final Arena Results' : `After Question ${currQuestionNo}`}
                        </p>

                        {/* Top 3 Champions Podium Arc */}
                        <div className="flex items-end justify-center gap-3 mb-8 px-2">
                            {/* 2nd Place */}
                            {leaderboard[1] && (
                                <div className="flex flex-col items-center flex-1">
                                    <PlayerAvatar index={2} name={leaderboard[1].nickName} className="w-12 h-12 mb-2" />
                                    <div className="w-full bg-slate-800 border-t-2 border-slate-300 rounded-t-lg p-2 flex flex-col items-center h-24 justify-between shadow-lg">
                                        <span className="text-xs">🥈</span>
                                        <p className="text-[10px] font-black text-slate-200 truncate max-w-[80px]">{leaderboard[1].nickName}</p>
                                        <span className="text-[10px] font-mono text-slate-300 font-bold">{leaderboard[1].score}</span>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place */}
                            {leaderboard[0] && (
                                <div className="flex flex-col items-center flex-1 -mt-4">
                                    <span className="text-lg animate-bounce">👑</span>
                                    <PlayerAvatar index={1} name={leaderboard[0].nickName} className="w-16 h-16 mb-2 border-amber-400" />
                                    <div className="w-full bg-gradient-to-t from-amber-950/80 to-amber-900/60 border-t-2 border-amber-400 rounded-t-lg p-2 flex flex-col items-center h-32 justify-between shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                                        <span className="text-sm">🥇</span>
                                        <p className="text-xs font-black text-amber-200 truncate max-w-[80px]">{leaderboard[0].nickName}</p>
                                        <span className="text-xs font-mono text-amber-300 font-black">{leaderboard[0].score}</span>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {leaderboard[2] && (
                                <div className="flex flex-col items-center flex-1">
                                    <PlayerAvatar index={3} name={leaderboard[2].nickName} className="w-12 h-12 mb-2" />
                                    <div className="w-full bg-slate-800 border-t-2 border-amber-700 rounded-t-lg p-2 flex flex-col items-center h-20 justify-between shadow-lg">
                                        <span className="text-xs">🥉</span>
                                        <p className="text-[10px] font-black text-slate-200 truncate max-w-[80px]">{leaderboard[2].nickName}</p>
                                        <span className="text-[10px] font-mono text-slate-300 font-bold">{leaderboard[2].score}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Full Scoreboard Rows */}
                        <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-1">
                            {leaderboard.map((p, index) => (
                                <div key={index} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-500 w-4">{index + 1}</span>
                                        <span className="font-bold text-slate-200">{p.nickName}</span>
                                    </div>
                                    <span className="font-mono font-black text-amber-400">{p.score} pts</span>
                                </div>
                            ))}
                        </div>

                        {gameState === 'GAME_OVER' && (
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-base tracking-wider shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all cursor-pointer"
                            >
                                RETURN TO LOBBY
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Room