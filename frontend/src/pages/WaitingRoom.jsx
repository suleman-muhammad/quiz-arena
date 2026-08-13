import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import SockJS from "sockjs-client"
import Stomp from 'stompjs'


function WaitingRoom(){

    const navigate = useNavigate()

    const { roomCode } = useParams()
    const [searchParams] = useSearchParams()
    const nickName = searchParams.get('nickname')
    const isHost = searchParams.get('host') === 'true'
    const isHostPlaying = searchParams.get('playing') === 'true'
    


    const { players, setPlayers } = useState([]) 

    


    return (
        <div className="max-w-lg mx-auto p-8 mt-8">
            {/* Room code display */}
            <div className="text-center mb-8">
                <p className="text-neutral-500 text-sm font-semibold uppercase tracking-wide mb-2">Room Code</p>
                <h1 className="text-5xl font-bold text-neutral-800 tracking-widest font-mono">{roomCode}</h1>
                <p className="text-neutral-400 text-sm mt-2">Share this code with your friends</p>
            </div>

            {/* Connection status */}
            <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-neutral-500 text-sm">Connected</span>
            </div>

            {/* Player list */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-neutral-700">Players</h2>
                    <span className="bg-neutral-100 text-neutral-600 text-sm font-semibold px-3 py-1 rounded-full">
                        0
                    </span>
                </div>

                {/* Empty state */}
                <p className="text-neutral-400 text-center py-4">Waiting for players to join...</p>

                {/* Player list items - render these when players exist */}
                <div className="space-y-2" >
                    <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-3" >
                            <span className="bg-gradient-to-r from-rose-500 to-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                S
                            </span>
                            <span className="text-neutral-700 font-medium">Suleman</span>
                        </div>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">Host</span>
                    </div>
                </div>
            </div>

            {/* Error/message display */}
            <p className="text-center text-red-500 mb-4"></p>

            {/* Host view - Start button */}
            <div className="text-center">
                { isHost && <button
                    className="w-full py-4 rounded-xl font-bold text-lg transition bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white"
                >
                    Start Game
                </button>}
            </div>

            {/* Player view - Waiting message */}
            <div className="text-center">
                <div className="bg-neutral-100 rounded-xl p-6">
                    <p className="text-neutral-600 font-medium text-lg mb-2">You're in! 🎯</p>
                    <p className="text-neutral-400">{isHost ? 'Others are Waiting for you to Start the Game....' : 'Waiting for the host to start the game...'}</p>
                </div>
            </div>
        </div>
    )
}

export default WaitingRoom