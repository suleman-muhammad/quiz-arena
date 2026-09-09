# ⚔️ QuizArena — Real-Time Multiplayer Trivia Battle Engine

<p align="center">
  <b>A high-performance, real-time multiplayer trivia platform built with Spring Boot, WebSocket STOMP messaging, and React 19 + Tailwind CSS.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.4.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
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
- [Upcoming Engineering Roadmap](#-upcoming-engineering-roadmap)
- [Local Development & Setup](#-local-development--setup)

---

## 🏛️ Overview

**QuizArena** is a full-stack, low-latency multiplayer trivia battle engine designed for competitive, multi-user synchronous gameplay. Players create or discover trivia quizzes, spin up isolated multiplayer rooms using unique 6-character room codes, select cyberpunk warrior archetypes, and compete under strict quadratic time-decay countdowns.

The application architecture emphasizes **thread safety, non-blocking scheduled concurrency, synchronized multi-client state distribution**, and a modern **GPU-accelerated CSS 3D Vector Grid UI** built without heavy external raster assets.

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
│                           SPRING BOOT 3.4 BACKEND                           │
│  ┌───────────────────────────────┐   ┌───────────────────────────────────┐  │
│  │       REST Controllers        │   │       WebSocket Controllers       │  │
│  │  Quiz · Room · Category       │   │   GameController (/app/rooms/*)   │  │
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
│  │   PostgreSQL / MySQL Store    │                                          │
│  └───────────────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Features

### 1. 🌐 Explore Public Trivia Hub (`/explore`)
- **Open Trivia DB (OpenTDB) Integration**: Direct live querying of thousands of verified community questions across 20+ categories (Computer Science, Science & Nature, History, Mythology, Pop Culture, etc.).
- **Dynamic Filter Controls**: Real-time filtering by category, difficulty (`Easy`, `Medium`, `Hard`, or `Mixed`), and question limits (`5`, `10`, `15`, `20`).
- **Instant Battle Launcher**: Instantly converts any external API trivia set into an active, shareable multiplayer room with a single click.

### 2. 🛠️ Custom Quiz Creator (`/create`)
- **Interactive Question Builder**: Add, edit, reorder, and remove custom questions on the fly.
- **Configurable Match Settings**: Custom question time limits (5s to 60s), custom categories, and 4-option multiple-choice matrix with radio validation.
- **Client & Server Validation**: Guards against incomplete question sets, missing correct answers, and invalid time limits before persisting to the database.

### 3. 🛡️ Match Readiness Lobby (`/lobby/:roomCode`)
- **Room Code Plaque**: One-click clipboard copy with live visual feedback.
- **Dynamic Player Roster**: Real-time synchronization of joined players with custom archetype avatars (Paladin, Berserker, Assassin, Samurai, Crusader, Valkyrie).
- **Host Controls & Pedestal**: Dedicated host management stage with a synchronized match launch trigger.
- **Quiz Briefing Matrix**: Displays total question count, category metadata, and dynamically generated concept badges.
- **Trivia Lore Ticker**: Real-time broadcast channel for lobby events and trivia facts.

### 4. ⚔️ Live Battle Arena (`/room/:roomCode`)
- **3D Perspective Vector Grid Floor**: Custom CSS 3D perspective grid floor (`vector-grid-3d`) with ambient cyan/purple glow lighting and zero raster image dependencies.
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

### Client Inbound Destinations (`/app/rooms/{roomCode}/*`)

| Destination | Request DTO | Description |
| :--- | :--- | :--- |
| `/app/rooms/{roomCode}/join` | `JoinRoomRequest` | Join an existing room with player name and avatar ID |
| `/app/rooms/{roomCode}/leave` | `LeaveRoomRequest` | Leave the room gracefully and update remaining roster |
| `/app/rooms/{roomCode}/start` | `StartRoomRequest` | Host-only trigger to start the scheduled game loop |
| `/app/rooms/{roomCode}/submit` | `SubmitAnswerRequest`| Submit selected answer index with client timestamp |

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
| `GET` | `/api/rooms/details/{roomCode}` | Fetch metadata, player roster, and state for a room |
| `GET` | `/api/quizzes` | Fetch all saved quizzes with categories and question counts |
| `GET` | `/api/quizzes/{id}` | Fetch full quiz details including questions and options |
| `POST` | `/api/quizzes` | Persist a newly created custom quiz to the database |
| `GET` | `/api/categories` | Fetch all available quiz categories |

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
│   │   └── RoomState.java   # State enum (WAITING, STARTING, IN_PROGRESS, FINISHED)
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
│   │   │   ├── Explore.jsx      # OpenTDB dynamic trivia discovery hub
│   │   │   ├── CreateQuiz.jsx   # Custom question builder & time configuration
│   │   │   ├── JoinGame.jsx     # Room code verification & warrior selection
│   │   │   ├── Lobby.jsx        # Pre-match readiness lobby & live roster
│   │   │   └── Room.jsx         # Live arena battle screen
│   │   ├── App.jsx          # React Router v7 route definitions
│   │   ├── index.css        # Tailwind CSS 4 utilities & GPU 3D keyframes
│   │   └── main.jsx         # Frontend entry point
│   ├── package.json
│   └── vite.config.js
│
├── build.gradle             # Java 21 & Spring Boot 3.4 dependencies
└── README.md                # System documentation
```

---

## 🔮 Upcoming Engineering Roadmap

### 1. 🛡️ Security & Rate Limiting Layer
- **STOMP Frame Throttling**: Token-bucket rate limiters on `/app/rooms/{roomCode}/submit` to prevent automated script spamming and brute-force answer attempts.
- **WebSocket Handshake Validation**: Origin verification and connection quota limits per IP to defend against socket exhaustion attacks.

### 2. 🔍 Strict Server-Side Validation Layer
- **Jakarta Bean Validation (`@Valid`)**: Enforce `@NotBlank`, `@Size`, `@Min`, `@Max`, and regex constraints on all inbound request DTOs (`CreateRoomRequest`, `SubmitAnswerRequest`, `CreateQuizRequest`).
- **Answer Integrity Guards**: Validate that submitted answers match the current active question cycle, preventing replay attacks or late-arriving packet exploitation.

### 3. 🔐 Authentication, Authorization & User Profiles
- **Spring Security + JWT Integration**: Stateless token-based authentication for persistent user accounts.
- **Player Progression & History**: Match history logging, lifetime win-loss records, accuracy metrics, and unlockable avatar tiers.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Quiz Creators, Room Admins, and standard Competitors.

### 4. 🔒 Private Tournaments & Access Control
- **Password-Protected Rooms**: Optional cryptographic hashing of room access passcodes.
- **Whitelist / Invite-Only Matches**: Host-managed access lists for closed corporate or classroom trivia tournaments.

### 5. ⚡ Distributed Horizontal Scaling (Redis Pub/Sub)
- **Distributed State Management**: Transitioning in-memory `GameManager` state to Redis Key-Value stores and distributed locks (`Redisson`).
- **Cross-Node WebSocket Messaging**: Redis Pub/Sub message broker replacing Spring's in-memory SimpleBroker to allow seamless multi-instance horizontal scaling behind a load balancer.

### 6. 🔊 Web Audio API Soundscape
- **Dynamic Acoustic Feedback**: Low-latency synthesized sound effects for countdown heartbeats, buzzer locks, correct streak chimes, and victory fanfares.

### 7. 💬 Real-Time In-Game & Lobby Chat System
- **Pre-Match Lobby Chatter**: Subscribed STOMP channel (`/topic/rooms/{roomCode}/chat`) enabling joined gladiators to send real-time text banter, coordinate strategies, and interact prior to match launch.
- **In-Arena Quick Reactions & Emotes**: Low-overhead real-time emote reactions (e.g., 🔥, ⚡, 💀, 🎯) and quick-chat overlays during question reveals and podium standings.
- **Content Sanitization & Spam Throttling**: Server-side profanity filtering and message frequency throttling to maintain a respectful and clean competitive environment.

---

## 🚀 Local Development & Setup

### Prerequisites
- **Java Development Kit (JDK) 21+**
- **Node.js 20+** and **npm**
- **PostgreSQL** or **MySQL** (or H2 in-memory for testing)

### 1. Clone the Repository
```bash
git clone https://github.com/suleman-muhammad/quiz-arena.git
cd quiz-arena
```

### 2. Configure Backend Database
Edit `src/main/resources/application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/quizarena
spring.datasource.username=postgres
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

---

<p align="center">
  Crafted with precision by <b>Suleman Muhammad</b>
</p>
