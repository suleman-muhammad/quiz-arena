import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'



function QuizCard({ quiz }) {
    // logic here

    const navigate = useNavigate();
    const [showModal, setShowModel] = useState(false)
    const [hostName, setHostName] = useState('')
    const [willPlay, setWillPlay] = useState(true)
    const [error, setError] = useState('')


    function closeModal(){
        setError('')
        setShowModel(false)
    }



    function handleHostGame(){
        if(hostName.length === 0){
            setError("Nick Name cannot be empty");
            return;
        }

        setError('')
        const socket = new SockJS('http://localhost:8080/ws')
        const client = Stomp.over(socket)
        client.debug = null

        client.connect({},()=>{
            client.subscribe(`/topic/host/${hostName}`, (msg) => {
                const room = JSON.parse(msg.body)
                client.disconnect()
                navigate(`/room/${room.roomCode}?nickname=${hostName}&host=true&playing=${willPlay}`)
            })

            client.send('/app/game/create',{}, JSON.stringify(
                {
                    quizId:quiz.id,
                    hostNickName:hostName
                }
            ))

        })

    }



    return (
        <>
            <div className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-neutral-800">{quiz.title}</h3>
                    <span className="bg-gradient-to-r from-rose-500 to-orange-400 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {quiz.questions?.length || 0} Qs
                    </span>
                </div>
                <p className="text-neutral-500 text-sm mb-4">
                    {quiz.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                        {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : ""}
                    </span>
                    <button
                        onClick={() => {setShowModel(true)}}
                        className="bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                    >
                        Host Game
                    </button>
                </div>
            </div>

            {/* Modal - shown when showModal is true */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
                        <h2 className="text-xl font-bold text-neutral-800 mb-6 text-center">Host a Game</h2>
                        <p className="text-neutral-500 text-sm text-center mb-6">
                            Quiz: <span className="font-semibold text-neutral-700">{quiz.title}</span>
                        </p>

                        {error && (
                            <p className="text-red-500 text-sm text-center mb-4">
                                {error}
                            </p>
                        )}

                        <div className="mb-4">
                            <label className="block text-neutral-600 text-sm font-semibold mb-2">Your Nickname</label>
                            <input
                                type="text"
                                placeholder="Enter a nickname"
                                maxLength={20}
                                value={hostName}
                                onChange={(e)=>{setHostName(e.target.value)}}
                                className="w-full border border-neutral-300 text-neutral-800 rounded-lg px-4 py-3 focus:border-orange-400 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 mb-6 px-1">
                            <input
                                type="checkbox"
                                id="willPlay"
                                className="w-4 h-4 accent-orange-500 cursor-pointer"
                            />
                            <label htmlFor="willPlay" className="text-neutral-600 text-sm cursor-pointer">
                                I want to play too (not just spectate)
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 border border-neutral-300 text-neutral-600 hover:border-rose-400 hover:text-rose-500 py-3 rounded-lg font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleHostGame}
                                className="flex-1 bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-400 hover:to-orange-300 text-white py-3 rounded-lg font-semibold transition"
                            >
                                Create Room
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default QuizCard