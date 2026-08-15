import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function JoinGame() {
    

    const navigate = useNavigate()
    const [roomCode, setRoomCode] = useState('')
    const [nickname, setNickname] = useState('')
    const [error, setError] = useState('')

    

    return (
        <div className="max-w-md mx-auto p-8 mt-16">
            <h1 className="text-3xl font-bold text-neutral-800 mb-8 text-center">Join a Game</h1>

            <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}

                <div className="mb-4">
                    <label className="block text-neutral-600 text-sm font-semibold mb-2">Room Code</label>
                    <input
                        type="text"
                        placeholder="e.g. 4L1N8U"
                        value={roomCode}  // value assignment here
                        onChange={(e) => setRoomCode(e.target.value)}  // change on update
                        maxLength={6}
                        className="w-full border border-neutral-300 text-neutral-800 rounded-lg px-4 py-3 text-center text-2xl tracking-widest font-mono focus:border-orange-400 focus:outline-none"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-neutral-600 text-sm font-semibold mb-2">Your Nickname</label>
                    <input
                        type="text"
                        placeholder="Enter a nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}  // change value on update
                        maxLength={20}
                        className="w-full border border-neutral-300 text-neutral-800 rounded-lg px-4 py-3 focus:border-orange-400 focus:outline-none"
                    />
                </div>

                <button
                    onClick={} // call function to handle the funcitonality
                    className="w-full bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white py-3 rounded-lg font-semibold transition text-lg"
                >
                    Join Game
                </button>
            </div>
        </div>
    )
}

export default JoinGame