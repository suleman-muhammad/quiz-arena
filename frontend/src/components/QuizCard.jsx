import { useState } from "react"
import { useNavigate } from "react-router-dom"
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'



function QuizCard({ quiz }) {
    // logic here

    const navigate = useNavigate();
    const [showModal, setShowModel] = useState(false)
    const [hostName, setHostName] = useState('')
    const [willPlay, setWillPlay] = useState(false)
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
                navigate(`/waitingRoom/${room.roomCode}?nickname=${hostName}&host=true&playing=${willPlay}`)
            })

            client.send('/app/game/room/create',{}, JSON.stringify(
                {
                    quizId:quiz.id,
                    hostNickName:hostName,
                    hostIsPlaying:willPlay
                }
            ))

        })

    }



    return (
        <>
            <div className="bg-slate-900 border border-purple-500 rounded-xl p-5 flex flex-col h-full hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-shadow">
                
                {/* Header: Icon, Title, and Badge */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="text-gray-400">
                            {/* Generic gear icon placeholder - replace dynamically based on quiz type */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                    </div>
                    {/* Circular Purple Badge */}
                    <span className="bg-purple-600 text-white text-sm font-bold w-10 h-10 flex items-center justify-center rounded-full shrink-0">
                        {quiz.questions?.length || 0} Qs
                    </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-6 flex-grow">
                    {quiz.description || "No description"}
                </p>

                {/* Footer: Date and CTA */}
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm text-white font-semibold">
                        {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : ""}
                    </span>
                    <button
                        onClick={() => {setShowModel(true)}}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-extrabold px-4 py-2 rounded-md transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M2.736 9.775a.75.75 0 0 0-1.12.868l2.368 9.255c.264 1.002 1.215 1.102 1.942 1.102h12.148c.727 0 1.678-.1 1.942-1.102l2.368-9.255a.75.75 0 0 0-1.12-.868l-4.707 3.32-3.14-9.034a.75.75 0 0 0-1.417 0l-3.14 9.034-4.707-3.32Z" />
                        </svg>
                        HOST GAME
                    </button>
                </div>
            </div>

            {/* Modal Logic Remains the Same (Updated to Match Dark Theme) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-purple-500 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-6 text-center">Host a Game</h2>
                        <div className="flex gap-3 mt-6">
                            <button onClick={closeModal} className="flex-1 border border-slate-600 text-white py-3 rounded-lg font-bold">Cancel</button>
                            <button onClick={handleHostGame} className="flex-1 bg-yellow-500 text-black py-3 rounded-lg font-extrabold">Create Room</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default QuizCard