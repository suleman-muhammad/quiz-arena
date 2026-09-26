# ⚔️ QuizArena — Real-Time Multiplayer Trivia Battle Engine

<p align="center">
  <b>A high-performance, real-time multiplayer trivia platform built with Spring Boot, WebSocket STOMP messaging, and React 19 + Tailwind CSS.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/WebSocket-STOMP-000000?style=for-the-badge&logo=socket.io&logoColor=white" alt="STOMP" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Core Features](#-core-features)
- [Real-Time Game Loop & State Machine](#-real-time-game-loop--state-machine)
- [Mathematical Scoring Engine](#-mathematical-scoring-engine)
- [WebSocket STOMP Channel Protocol](#-websocket-stomp-channel-protocol)
- [REST API Reference](#-rest-api-reference)
- [Project Directory Structure](#-project-directory-structure)
- [Future Tasks](#-future-tasks)
- [Local Development & Setup](#-local-development--setup)

---

## 🏛️ Overview

**QuizArena** is a full-stack multiplayer trivia application. Users can create quizzes, browse saved quizzes, host or join rooms using unique 6-character room codes, and compete in synchronized rounds over WebSocket STOMP messaging.

The backend uses Spring Boot, Spring Data JPA, MySQL, and an in-memory concurrent room manager. The frontend is a React single-page application served by Vite and styled with Tailwind CSS.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             REACT 19 FRONTEND                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Explore Hub  │  │ Quiz Creator │  │ Match Lobby  │  │ Live Arena Room │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
└─────────┼─────────────────┼─────────────────┼───────────────────┼───────────┘
          │ REST (HTTP)     │ REST (HTTP)     │ WS / STOMP        │ WS / STOMP
          ▼                 ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SPRING BOOT 4.1 BACKEND                           │
│  ┌───────────────────────────────┐   ┌───────────────────────────────────┐  │
│  │       REST Controllers        │   │       WebSocket Controllers       │  │
│  │  Quiz · Room · Category       │   │ GameController (/app/game/rooms/*)│  │
│  └──────────────┬────────────────┘   └─────────────────┬─────────────────┘  │
│                 │                                      │                    │
│  ┌──────────────▼──────────────────────────────────────▼─────────────────┐  │
│  │                           GAME ENGINE CORE                            │  │
│  │  • GameManager (ConcurrentHashMap Room Registry)                      │  │
│  │  • GameRoom (Synchronized State, Dynamic Roster, Answer Buffers)      │  │
│  │  • GameService (ScheduledExecutorService Thread Pool)                 │  │
│  └──────────────┬────────────────────────────────────────────────────────┘  │
│                 │                                                           │
│  ┌──────────────▼────────────────┐                                          │
│  │   Spring Data JPA Hibernate   │                                          │
│  │          MySQL Store          │                                          │
│  └───────────────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Features

### 1. 🌐 Explore Saved Quizzes (`/explore`)
- **Database-backed quiz list**: Loads saved quizzes from `GET /api/quizzes`.
- **Search**: Filters by quiz title, description, and concept text in the browser.
- **Category filters**: Loads categories from `GET /api/quiz-categories` and shows quiz counts for each category.
- **Host a game**: Each quiz card opens a host dialog and starts the WebSocket room creation flow.

### 2. 🛠️ Custom Quiz Creator (`/create`)
- **Quiz metadata**: Enter a title, description, category, concepts, and trivia facts.
- **Question builder**: Add and remove multiple-choice questions with answer options and per-question time limits.
- **Persistence**: Saves quizzes through `POST /api/quizzes`.

### 3. 🛡️ Match Readiness Lobby (`/lobby/:roomCode`)
- **Room Code Plaque**: One-click clipboard copy with live visual feedback.
- **Dynamic Player Roster**: Real-time synchronization of joined players with custom archetype avatars (Paladin, Berserker, Assassin, Samurai, Crusader, Valkyrie).
- **Host Controls & Pedestal**: Dedicated host management stage with a synchronized match launch trigger.
- **Quiz Briefing Matrix**: Displays total question count, category metadata, and dynamically generated concept badges.
- **Trivia Lore Ticker**: Real-time broadcast channel for lobby events and trivia facts.

### 4. ⚔️ Live Battle Arena (`/rooms/:roomCode`)
- **Live game view**: Displays the current question, answer options, timer, score, combo, and leaderboard updates.
- **Dynamic Neon SVG Timer Ring**: Radial SVG timer changing dynamically from Cyan $\rightarrow$ Amber $\rightarrow$ Pulsing Crimson as the clock expires.
- **2x2 Combat Answer Pads**: Keyboard-friendly, high-contrast pads (`[A]`, `[B]`, `[C]`, `[D]`) with instant submission locking and server confirmation.
- **Live Competitor Mini-Leaderboard**: Tracks rival scores and real-time answer submission flags (`✔ Submitted`) during active rounds.
- **Dynamic Round Podium & Victory Celebrations**: Instant answer reveal highlighting the correct choice, awarding points, and displaying round-by-round and final match podium standings.

---

## 🔄 Real-Time Game Loop & State Machine

Every game round runs through a deterministic, server-managed multi-phase state lifecycle orchestrated by `GameService` using an asynchronous scheduled thread pool:

```
┌─────────────────┐     3s Countdown
│   START / INIT  │ ──────────────────────┐
└─────────────────┘                       │
                                          ▼
┌─────────────────┐     3s Text Peek    ┌──────────────────────┐
│  QUESTION_TEXT  │ ◄────────────────── │  QUESTION_PROMPT     │
└────────┬────────┘                     └──────────────────────┘
         │
         │ Timer Starts (e.g., 10s)
         ▼
┌─────────────────┐     Time Expires / All Submitted
│ QUESTION_OPTIONS│ ──────────────────────┐
└─────────────────┘                       │
                                          ▼
┌─────────────────┐     5s Breakdown    ┌──────────────────────┐
│  LEADERBOARD    │ ◄────────────────── │    QUESTION_STOP     │
└────────┬────────┘                     │ (Correct Reveal & pts)│
         │                              └──────────────────────┘
         ├── [More Questions] ──► (Next QUESTION_PROMPT)
         │
         └── [Final Question] ──► ┌──────────────────────┐
                                  │      GAME_OVER       │
                                  │ (Final Podium Stand) │
                                  └──────────────────────┘
```

---

## 📐 Mathematical Scoring Engine

QuizArena uses a **quadratic time-decay formula** to reward both conceptual accuracy and split-second cognitive speed:

$$\text{Score}(n) = \left\lceil 1000 - \frac{10 \cdot n \cdot (n + 1)}{2} \right\rceil$$

Where $n$ represents the total elapsed seconds before the player's correct answer is registered by the server.

| Elapsed Time ($n$) | Penalty Calculation | Points Awarded |
| :--- | :--- | :--- |
| **0.0 seconds** | $0$ | **$1000\text{ pts}$** |
| **1.0 second** | $\frac{10 \cdot 1 \cdot 2}{2} = 10$ | **$990\text{ pts}$** |
| **3.0 seconds** | $\frac{10 \cdot 3 \cdot 4}{2} = 60$ | **$940\text{ pts}$** |
| **5.0 seconds** | $\frac{10 \cdot 5 \cdot 6}{2} = 150$ | **$850\text{ pts}$** |
| **8.0 seconds** | $\frac{10 \cdot 8 \cdot 9}{2} = 360$ | **$640\text{ pts}$** |
| **Incorrect / Timeout** | — | **$0\text{ pts}$** |

---

## 📡 WebSocket STOMP Channel Protocol

All real-time communications operate over SockJS at `/ws` using STOMP frame routing:

### Client Inbound Destinations (`/app/game/rooms/*`)

| Destination | Request DTO | Description |
| :--- | :--- | :--- |
| `/app/game/rooms/create` | `CreateRoomRequest` | Create a room for a saved quiz |
| `/app/game/rooms/join` | `JoinRoomRequest` | Join an existing room with a nickname |
| `/app/game/rooms/leave` | `LeaveRoomRequest` | Leave the room and update the remaining roster |
| `/app/game/rooms/start` | `StartRoomRequest` | Host-only trigger to start the scheduled game loop |
| `/app/game/rooms/answer` | `SubmitAnswerRequest` | Submit an answer for the current question |

### Server Outbound Topics (`/topic/rooms/{roomCode}/*`)

| Topic | Event / Payload DTO | Description |
| :--- | :--- | :--- |
| `/topic/rooms/{roomCode}/waiting` | `RoomInfoDTO` | Broadcasts room metadata and active game state changes |
| `/topic/rooms/{roomCode}/roster` | `PlayerEventDTO` | Broadcasts join/leave events and updated player lists |
| `/topic/rooms/{roomCode}/start` | `RoomInfoDTO` | Signals all clients to transition into active arena mode |
| `/topic/rooms/{roomCode}/question/text` | `QuestionPromptDTO` | Phase 1: Delivers question text only for pre-read phase |
| `/topic/rooms/{roomCode}/question/options`| `QuestionOptionsDTO`| Phase 2: Delivers multiple-choice options & starts timer |
| `/topic/rooms/{roomCode}/question/stop` | `QuestionRevealDTO` | Phase 3: Broadcasts correct answer index & score deltas |
| `/topic/rooms/{roomCode}/leaderboard` | `List<Player>` | Phase 4: Synchronizes sorted leaderboard rankings |
| `/topic/rooms/{roomCode}/end` | `List<Player>` | Final match results and podium rankings |
| `/topic/rooms/{roomCode}/players/{name}` | `SystemMessageDTO` | Direct unicast channel for individual player feedback |

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/rooms/create` | Create a new multiplayer room (`CreateRoomRequest` $\rightarrow$ `RoomInfoDTO`) |
| `GET` | `/api/rooms/{roomCode}` | Fetch room metadata, player roster, quiz ID, and state |
| `GET` | `/api/rooms/{roomCode}/quiz` | Fetch the room's quiz ID |
| `GET` | `/api/rooms/{roomCode}/leaderboard` | Fetch the current player list |
| `GET` | `/api/quizzes` | Fetch all saved quizzes with categories and question counts |
| `GET` | `/api/quizzes/{id}` | Fetch full quiz details including questions and options |
| `POST` | `/api/quizzes` | Persist a newly created custom quiz to the database |
| `DELETE` | `/api/quizzes/{id}` | Delete a saved quiz |
| `GET` | `/api/quiz-categories` | Fetch all available quiz categories |

---

## 📂 Project Directory Structure

```
quiz-arena/
├── src/main/java/com/quizarena/
│   ├── config/              # WebSocket STOMP and CORS configurations
│   │   ├── CorsConfig.java
│   │   └── WebSocketConfig.java
│   ├── controller/          # REST endpoints and WebSocket message mappings
│   │   ├── CategoryController.java
│   │   ├── GameController.java
│   │   ├── QuizController.java
│   │   └── RoomController.java
│   ├── dto/                 # Strict separation of DTO models
│   │   ├── event/           # Real-time event payloads (QuestionPrompt, Reveal, Roster)
│   │   ├── request/         # Client inbound requests (CreateRoom, Join, SubmitAnswer)
│   │   └── response/        # REST response envelopes (RoomInfoDTO, JoinRoomResponse)
│   ├── entity/              # JPA database entities (Quiz, Question, Category, Concept)
│   ├── game/                # In-memory thread-safe room registry and game models
│   │   ├── GameManager.java # ConcurrentHashMap room store & atomic code generation
│   │   ├── GameRoom.java    # Synchronized player roster, answers & state machine
│   │   ├── Player.java      # Player entity with score, avatar, and round status
│   │   └── RoomState.java   # State enum (WAITING, IN_PROGRESS, BETWEEN_QUESTIONS, FINISHED)
│   ├── repository/          # Spring Data JPA repositories
│   └── service/             # Scheduled round timers and business logic
│       ├── CategoryService.java
│       ├── GameService.java # ScheduledExecutorService multi-phase game scheduler
│       └── QuizService.java
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Modular UI components (CyberAvatar, Navbar, QuizCard)
│   │   ├── pages/           # Route views
│   │   │   ├── Home.jsx         # Hero landing page & quick join
│   │   │   ├── Explore.jsx      # Saved quiz search and category filters
│   │   │   ├── CreateQuiz.jsx   # Custom question builder & time configuration
│   │   │   ├── JoinGame.jsx     # Room code verification & warrior selection
│   │   │   ├── Lobby.jsx        # Pre-match readiness lobby & live roster
│   │   │   └── Room.jsx         # Live arena battle screen
│   │   ├── App.jsx          # React Router v7 route definitions
│   │   ├── index.css        # Tailwind CSS 4 utilities and application styles
│   │   └── main.jsx         # Frontend entry point
│   ├── package.json
│   └── vite.config.js
│
├── build.gradle             # Java 21 & Spring Boot 4.1 dependencies
└── README.md                # System documentation
```

---

## 🔮 Future Tasks

### 1. 🌐 External Trivia Discovery
- **Open Trivia DB integration**: Add live querying of external trivia questions with category, difficulty, and question-count filters.
- **External quiz import**: Convert a selected external trivia set into a saved or immediately playable QuizArena room.

### 2. 🛡️ Security & Rate Limiting Layer
- **STOMP Frame Throttling**: Token-bucket rate limiters on `/app/game/rooms/answer` to prevent automated script spamming and brute-force answer attempts.
- **WebSocket Handshake Validation**: Origin verification and connection quota limits per IP to defend against socket exhaustion attacks.

### 3. 🔍 Strict Server-Side Validation Layer
- **Jakarta Bean Validation (`@Valid`)**: Enforce `@NotBlank`, `@Size`, `@Min`, `@Max`, and regex constraints on all inbound request DTOs (`CreateRoomRequest`, `SubmitAnswerRequest`, `CreateQuizRequest`).
- **Answer Integrity Guards**: Validate that submitted answers match the current active question cycle, preventing replay attacks or late-arriving packet exploitation.

### 4. 🔐 Authentication, Authorization & User Profiles
- **Spring Security + JWT Integration**: Stateless token-based authentication for persistent user accounts.
- **Player Progression & History**: Match history logging, lifetime win-loss records, accuracy metrics, and unlockable avatar tiers.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Quiz Creators, Room Admins, and standard Competitors.

### 5. 🔒 Private Tournaments & Access Control
- **Password-Protected Rooms**: Optional cryptographic hashing of room access passcodes.
- **Whitelist / Invite-Only Matches**: Host-managed access lists for closed corporate or classroom trivia tournaments.

### 6. ⚡ Distributed Horizontal Scaling (Redis Pub/Sub)
- **Distributed State Management**: Transitioning in-memory `GameManager` state to Redis Key-Value stores and distributed locks (`Redisson`).
- **Cross-Node WebSocket Messaging**: Redis Pub/Sub message broker replacing Spring's in-memory SimpleBroker to allow seamless multi-instance horizontal scaling behind a load balancer.

### 7. 🔊 Web Audio API Soundscape
- **Dynamic Acoustic Feedback**: Low-latency synthesized sound effects for countdown heartbeats, buzzer locks, correct streak chimes, and victory fanfares.

### 8. 💬 Real-Time In-Game & Lobby Chat System
- **Pre-Match Lobby Chatter**: Subscribed STOMP channel (`/topic/rooms/{roomCode}/chat`) enabling joined gladiators to send real-time text banter, coordinate strategies, and interact prior to match launch.
- **In-Arena Quick Reactions & Emotes**: Low-overhead real-time emote reactions (e.g., 🔥, ⚡, 💀, 🎯) and quick-chat overlays during question reveals and podium standings.
- **Content Sanitization & Spam Throttling**: Server-side profanity filtering and message frequency throttling to maintain a respectful and clean competitive environment.

---

## 🚀 Local Development & Setup

### Prerequisites
- **Java Development Kit (JDK) 21+**
- **Node.js 20+** and **npm**
- **MySQL 8+**

### 1. Clone the Repository
```bash
git clone https://github.com/suleman-muhammad/quiz-arena.git
cd quiz-arena
```

### 2. Configure Backend Database
Copy `src/main/resources/application.properties.example` to `application.properties`, then set your MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/quizarena
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### 3. Build & Run the Backend
```bash
# On Linux / macOS:
./gradlew bootRun

# On Windows (PowerShell / Command Prompt):
.\gradlew.bat bootRun
```
*The Spring Boot server will initialize on `http://localhost:8080` (WebSocket endpoint at `ws://localhost:8080/ws`).*

### 4. Build & Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will start on `http://localhost:5173`.*

The frontend uses `http://localhost:8080` for REST and WebSocket requests by default. Override these values when needed:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=http://localhost:8080/ws
```

### Tests
```bash
./gradlew test
```

On Windows, use `gradlew.bat` instead of `./gradlew`.

---

<p align="center">
  Crafted with precision by <b>Suleman Muhammad</b>
</p>
