# ⚔️ QuizArena Server — Real-Time Multiplayer Trivia Battle Engine

<p align="center">
  <b>A high-performance, real-time multiplayer trivia game server built with Spring Boot, Java 21, WebSocket STOMP messaging, and MySQL.</b>
</p>

<p align="center">
  <a href="https://github.com/suleman-muhammad/quiz-arena/actions/workflows/ci.yml">
    <img src="https://github.com/suleman-muhammad/quiz-arena/actions/workflows/ci.yml/badge.svg" alt="CI Pipeline" />
  </a>
  <img src="https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/WebSocket-STOMP-000000?style=for-the-badge&logo=socket.io&logoColor=white" alt="STOMP" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT" />
</p>

<p align="center">
  🌐 <b>Companion Frontend Client:</b> <a href="https://github.com/suleman-muhammad/quiz-arena-client">quiz-arena-client (React 19 + Vite + Tailwind CSS v4)</a>
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
- [Local Development & Setup](#-local-development--setup)
- [Docker Deployment](#-docker-deployment)
- [Roadmap & Future Enhancements](#-roadmap--future-enhancements)

---

## 🏛️ Overview

**QuizArena Server** is the core game engine and backend service powering the QuizArena platform. It orchestrates high-concurrency multiplayer trivia rooms, real-time question timers, dynamic player scoring, and in-room chat over WebSocket STOMP messaging.

- **Fast & Scalable**: In-memory thread-safe room registry (`ConcurrentHashMap`) ensures sub-millisecond game state updates.
- **Accurate Real-Time Synchronization**: Centralized `ScheduledExecutorService` manages synchronized multi-phase round transitions across all connected clients.
- **Decoupled Client Architecture**: Cleanly separated from the [QuizArena Client](https://github.com/suleman-muhammad/quiz-arena-client) frontend application.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CLIENTS (Web / Mobile / React 19 Frontend)                  │
│       https://github.com/suleman-muhammad/quiz-arena-client                 │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
               ┌────────────────┴────────────────┐
               │ HTTP REST (Port 8080)           │ WebSocket STOMP (/ws)
               ▼                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        QUIZARENA SPRING BOOT SERVER                         │
│                                                                             │
│  ┌───────────────────────────────┐   ┌───────────────────────────────────┐  │
│  │       REST Controllers        │   │       WebSocket Controllers       │  │
│  │  Quiz · Room · Category       │   │ GameController (/app/game/rooms/*)│  │
│  └──────────────┬────────────────┘   └─────────────────┬─────────────────┘  │
│                 │                                      │                    │
│  ┌──────────────▼──────────────────────────────────────▼─────────────────┐  │
│  │                           GAME ENGINE CORE                            │  │
│  │  • GameManager (ConcurrentHashMap Room Registry & Atomic Code Gen)   │  │
│  │  • GameRoom (Synchronized State, Dynamic Roster, Answer Buffers)      │  │
│  │  • GameService (ScheduledExecutorService Multi-Phase Thread Pool)     │  │
│  └──────────────┬────────────────────────────────────────────────────────┘  │
│                 │                                                           │
│  ┌──────────────▼────────────────┐                                          │
│  │   Spring Data JPA Hibernate   │                                          │
│  │       MySQL 8.0 Database      │                                          │
│  └───────────────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Features

### 1. ⚡ Dynamic In-Memory Room Management
- **Concurrent Room Registry**: High-throughput atomic 6-character room code generator backed by a thread-safe `ConcurrentHashMap`.
- **Automatic Lifecycle Cleanup**: Idle and finished rooms automatically deallocate resources from memory.

### 2. ⏱️ Multi-Phase Synchronized Game Loop
- **Non-blocking Timers**: Powered by Java's `ScheduledExecutorService`—guarantees that every player in a room receives questions, answer reveals, and leaderboard transitions synchronously down to the millisecond.
- **Strict Answer Locking**: Prevents late-arriving packets or double-submission exploits once a round's countdown expires.

### 3. 🎯 Quadratic Speed-Bonus Scoring Engine
- Awards maximum points for fast, correct submissions using a quadratic decay curve, rewarding rapid reflex times while maintaining fair competitive balance.

### 4. 💬 Real-Time STOMP Messaging
- **Lobby & In-Game Chat**: Integrated real-time messaging feed supporting player communication, system announcements, and trivia fact broadcasts.
- **Player State Broadcasting**: Live roster synchronization, host transfers, and real-time competitor answer status flags.

### 5. 🗄️ Relational Database Persistence
- Relational schema managing Quizzes, Questions, Categories, and Key Concepts via Spring Data JPA with automatic MySQL schema synchronization.

---

## 🔄 Real-Time Game Loop & State Machine

Every `GameRoom` transitions through a deterministic state machine:

```
[ WAITING ] ────────► [ IN_PROGRESS ] ────────► [ BETWEEN_QUESTIONS ]
  Lobby & Roster       Countdown Active          Reveal Correct Answer
  Preparation          Accepting Answers         Update Scores & Podium
                             │                              │
                             │ (Last Question Finished)     │ (Next Round)
                             ▼                              ▼
                       [ FINISHED ] ◄───────────────────────┘
                     Final Victory Podium
```

---

## 🧮 Mathematical Scoring Engine

When a player submits a correct answer, their score calculation incorporates both correctness and response speed:

$$\text{Points} = \text{Base Points} + \text{Speed Bonus}$$

$$\text{Speed Bonus} = \text{Max Bonus} \times \left( \frac{\text{Time Remaining}}{\text{Total Time Allowed}} \right)^2$$

- **Incorrect Answers**: Yield $0$ points (accuracy is strictly enforced).
- **Quadratic Curve**: Submitting in the first $20\%$ of time grants $\sim80\text{--}100\%$ of maximum bonus points, heavily rewarding fast knowledge recall.

---

## 📡 WebSocket STOMP Channel Protocol

The WebSocket handshake endpoint is exposed at: `ws://localhost:8080/ws`

### Inbound Client Destinations (`/app`)

| Destination | Payload | Description |
|---|---|---|
| `/app/game/rooms/create` | `CreateRoomRequest` | Initiates a new room from a saved quiz and assigns host credentials. |
| `/app/game/rooms/join` | `JoinRoomRequest` | Validates a 6-character room code and joins player to the roster. |
| `/app/game/rooms/{code}/start` | Empty / Token | Host trigger to launch the match and begin round 1. |
| `/app/game/rooms/answer` | `SubmitAnswerRequest` | Submits an answer index (`0-3`) for the current active question. |
| `/app/game/rooms/{code}/chat` | `ChatMessageRequest` | Sends a chat message to the room's live feed. |

### Outbound Broadcast Topics (`/topic`)

| Topic | Event Payload | Trigger |
|---|---|---|
| `/topic/rooms/{code}` | `RoomInfoDTO` | Broadcast on player join, leave, or host update. |
| `/topic/rooms/{code}/question` | `QuestionPromptEvent` | Broadcast when a new question round begins (options, time limit). |
| `/topic/rooms/{code}/reveal` | `AnswerRevealEvent` | Broadcast when round time expires (correct index, score deltas). |
| `/topic/rooms/{code}/podium` | `PodiumEvent` | Broadcast on match completion with final gold, silver, and bronze rankings. |
| `/topic/rooms/{code}/chat` | `ChatMessageDTO` | Broadcast real-time text chat messages to all players in the room. |

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/quizzes` | Fetch all saved quizzes with categories and concept metadata. |
| `GET` | `/api/quizzes/{id}` | Retrieve full quiz details including questions and options. |
| `POST` | `/api/quizzes` | Create and persist a new custom quiz tournament. |
| `DELETE` | `/api/quizzes/{id}` | Delete a saved quiz. |
| `GET` | `/api/quiz-categories` | Retrieve all quiz categories with active quiz counts. |
| `GET` | `/api/rooms/{code}` | Query public state and status of an active room. |

---

## 📂 Project Directory Structure

```text
quiz-arena/
├── .github/workflows/       # GitHub Actions CI workflow (JUnit + MySQL service)
├── src/main/java/com/quizarena/
│   ├── config/              # WebSocket STOMP and CORS configurations
│   │   ├── CorsConfig.java
│   │   └── WebSocketConfig.java
│   ├── controller/          # REST endpoints and WebSocket message mappings
│   │   ├── CategoryController.java
│   │   ├── GameController.java
│   │   ├── QuizController.java
│   │   └── RoomController.java
│   ├── dto/                 # Separation of DTO models
│   │   ├── event/           # Real-time event payloads (QuestionPrompt, Reveal, Podium)
│   │   ├── request/         # Client inbound requests (CreateRoom, Join, SubmitAnswer)
│   │   └── response/        # REST response envelopes (RoomInfoDTO, JoinRoomResponse)
│   ├── entity/              # JPA database entities (Quiz, Question, Category, Concept)
│   ├── game/                # In-memory thread-safe room registry and game engine
│   │   ├── GameManager.java # ConcurrentHashMap room store & atomic code generation
│   │   ├── GameRoom.java    # Synchronized player roster, answers & state machine
│   │   ├── Player.java      # Player entity with score, avatar, and round status
│   │   └── RoomState.java   # State enum (WAITING, IN_PROGRESS, BETWEEN_QUESTIONS, FINISHED)
│   ├── repository/          # Spring Data JPA repositories
│   └── service/             # Scheduled round timers and business logic
│       ├── CategoryService.java
│       ├── GameService.java # ScheduledExecutorService multi-phase game scheduler
│       └── QuizService.java
├── src/main/resources/
│   ├── application.properties.example  # Configuration template
│   └── static/                         # Static server resources
├── build.gradle             # Java 21 & Spring Boot 4.1 build script
├── Dockerfile               # Container build instructions
└── README.md                # System documentation
```

---

## 🚀 Local Development & Setup

### Prerequisites
- **Java Development Kit (JDK) 21+**
- **MySQL 8.0+**
- Gradle (optional — the included `./gradlew` wrapper handles this automatically)

### 1. Clone the Repository
```bash
git clone https://github.com/suleman-muhammad/quiz-arena.git
cd quiz-arena
```

### 2. Configure Database
Copy the template configuration file:
```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Update `application.properties` with your MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/quizarena?useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

### 3. Build & Run
```bash
# On Linux / macOS:
./gradlew bootRun

# On Windows (PowerShell / Command Prompt):
.\gradlew.bat bootRun
```

The server will initialize at: **`http://localhost:8080`**  
WebSocket handshake URL: **`ws://localhost:8080/ws`**

### 4. Run Unit & Integration Tests
```bash
./gradlew test
```

---

## 🐳 Docker Deployment

You can build and package the server as a lightweight container image:

```bash
# 1. Build the executable JAR
./gradlew build -x test

# 2. Build the Docker image
docker build -t quiz-arena-server .

# 3. Run the container
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/quizarena \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  quiz-arena-server
```

---

## 🔮 Roadmap & Future Enhancements

- [ ] **Spring Security & JWT Authentication**: Stateless user accounts with personal match histories and saved favorites.
- [ ] **Game Master / Host Controls**: Dedicated host management stage with question pausing, manual skip, and participant moderation.
- [ ] **AI-Powered Quiz Generation**: Automatic quiz creation from documents, topics, or URLs using LLM integrations.
- [ ] **Redis Pub/Sub Scaling**: Replacing Spring's SimpleBroker with Redis to enable multi-instance horizontal clustering behind load balancers.
- [ ] **Rate Limiting & Socket Throttling**: Token-bucket rate limiting on submission endpoints to prevent automated scripts and abuse.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

<p align="center">
  Crafted with precision by <b>Suleman Muhammad</b>
</p>
