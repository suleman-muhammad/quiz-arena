import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Explore from './pages/Explore'
import CreateQuiz from './pages/CreateQuiz'
import JoinGame from './pages/JoinGame'
import WaitingRoom from './pages/WaitingRoom'
import Room from './pages/Room'

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-800 to-zinc-950 text-zinc-100 font-sans">
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/create" element={<CreateQuiz />} />
                    <Route path="/join" element={<JoinGame />} />
                    <Route path='/waitingRoom/:roomCode' element={<WaitingRoom />} />
                    <Route path='/room/:roomCode' element={<Room />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App