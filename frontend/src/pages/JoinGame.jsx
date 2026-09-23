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
        <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="bg-[#0A0E1A] border border-gray-800 rounded-2xl p-4 w-16 h-16 mx-auto flex items-center justify-center text-amber-400 mb-3">
                        <PlayerAvatar name={nickname || 'Player'} className="w-full h-full" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Join Battle Arena</h1>
                    <p className="text-sm text-gray-400 mt-1">Enter room code and choose your nickname</p>
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
                            className="w-full bg-[#0A0E1A] border border-gray-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#F9FAFB] placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-center text-2xl font-black tracking-widest font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                            Your Nickname
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            maxLength={20}
                            className="w-full bg-[#0A0E1A] border border-gray-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-[#F9FAFB] placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={handleJoin}
                        disabled={roomCode.length !== 6 || !nickname.trim() || loading}
                        className={`w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-gray-950 font-bold py-3 rounded-xl transition-all shadow-md mt-2 ${
                            roomCode.length !== 6 || !nickname.trim() || loading
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : ''
                        }`}
                    >
                        {loading ? 'JOINING ROOM...' : 'JOIN ROOM'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default JoinGame