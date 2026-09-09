import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SockJS from "sockjs-client"
import Stomp from 'stompjs'
import { PlayerAvatar } from '../components/CyberAvatar'
import { WS_BASE_URL } from '../config/api';

function JoinGame() {
    const navigate = useNavigate()
    const [roomCode, setRoomCode] = useState('')
    const [nickname, setNickname] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function handleJoin() {
        if (!roomCode.trim() || !nickname.trim()) {
            setError("Room code and nickname are required!")
            return
        }

        setError('')
        setLoading(true)

        const socket = new SockJS(WS_BASE_URL)
        const client = Stomp.over(socket)
        client.debug = null

        client.connect({}, () => {
            const requestId = "REQ_" + Math.random().toString(36).substring(2, 9)
            
            client.subscribe(`/topic/join-requests/${nickname}/${requestId}`, (msg) => {
                const data = JSON.parse(msg.body)
                console.log(data)
                setLoading(false)
                if (data.roomInfo === null) {
                    setError(data.message || "Failed to join room. Check your code.")
                    client.disconnect()
                    return
                }                
                client.disconnect()
                navigate(`/lobby/${roomCode}?nickname=${nickname}&host=false`)
            })

            client.send(`/app/game/rooms/join`, {}, JSON.stringify({
                roomCode: roomCode,
                playerNickName: nickname,
                requestId: requestId
            }))
        }, () => {
            setLoading(false)
            setError("Could not connect to battle server. Is it running?")
        })
    }

    return (
        <div className="min-h-screen bg-[#050714] text-white relative overflow-hidden flex flex-col justify-center items-center p-6 selection:bg-purple-500 selection:text-white font-sans">
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15)_0%,_transparent_60%)] pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-600/12 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-purple-700/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-md w-full bg-slate-900/90 border-2 border-purple-500/60 rounded-3xl p-8 glow-purple backdrop-blur-md shadow-2xl relative z-10">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="mb-3">
                        <PlayerAvatar name={nickname || 'Warrior'} className="w-20 h-20 shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
                    </div>
                    <span className="bg-purple-950/80 border border-purple-400/50 text-purple-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                        ⚔️ Gladiator Access
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-wide">
                        Join Battle Arena
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Enter match code and claim your warrior identity
                    </p>
                </div>
                {error && (
                    <div className="bg-rose-950/80 border border-rose-500/80 text-rose-300 text-xs font-bold px-4 py-2.5 rounded-xl mb-5 text-center animate-fade-in">
                        ⚠️ {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                            Room Code
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 4L1N8U"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="w-full bg-slate-950/90 border-2 border-slate-700 text-amber-400 rounded-2xl px-4 py-3 text-center text-2xl font-black tracking-widest font-mono focus:border-amber-400 focus:outline-none shadow-inner transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                            Your Gladiator Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            maxLength={20}
                            className="w-full bg-slate-950/90 border-2 border-slate-700 text-white rounded-2xl px-4 py-3.5 text-sm font-bold focus:border-purple-400 focus:outline-none shadow-inner transition-colors placeholder-slate-500"
                        />
                    </div>
                    <button
                        onClick={handleJoin}
                        disabled={roomCode.length !== 6 || !nickname.trim() || loading}
                        className={`w-full py-4 rounded-2xl font-black text-base tracking-wider transition-all duration-300 mt-2 ${
                            roomCode.length !== 6 || !nickname.trim() || loading
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-[0_0_25px_rgba(217,70,239,0.5)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        {loading ? 'ENTERING ARENA...' : 'ENTER THE ARENA ⚔️'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default JoinGame