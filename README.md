# ⚡ SyncWire - Modern Real-Time Chat & Video Calling Platform

<div align="center">

![SyncWire Banner](https://img.shields.io/badge/SyncWire-v2.4_Pro-8b5cf6?style=for-the-badge&logo=slack&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

<p align="center">
  A feature-rich, high-performance, full-stack communication platform built with modern web technologies. Experience lightning-fast messaging, crystal-clear peer-to-peer audio/video calling, 24-hour interactive stories, AI-powered smart replies, glassmorphic themes, and dynamic font customization.
</p>

</div>

---

## 🌟 Key Features

### 💬 1. Real-Time Messaging & Group Chats
- **Instant Messaging**: Sub-millisecond message delivery powered by Socket.io.
- **Group Conversations**: Create multi-user channels with custom icons, member management, and group search.
- **Rich Media & Attachments**: Send high-resolution images, voice notes, and audio messages.
- **Interactive Reactions & Replies**: Quick emoji reactions on any message with message reply threading.
- **Typing Indicators & Live Presence**: Real-time online/offline green dots and active typing bubbles.
- **Live Search**: Instant in-chat search across text history.

### 📹 2. HD Voice & Video Calling (WebRTC)
- **Peer-to-Peer Encrypted Calls**: Low-latency voice and video calls directly between users.
- **Mirror Selfie Camera**: Naturally mirrored (`scaleX(-1)`) self-camera preview.
- **Layout Switcher**:
  - **Picture-in-Picture (PIP)**: Keep floating preview while focusing on the remote speaker.
  - **Swap Main View**: Expand your own camera feed to full size.
  - **Split View**: 50/50 side-by-side grid display.
- **Call Controls**: Quick mute microphone, toggle camera on/off, and fullscreen mode.

### ⭕ 3. 24-Hour Stories (Status Updates)
- **Photo & Gradient Status**: Share media photos or colorful gradient text thoughts.
- **Interactive Likes & Hearts**: Instant 1-tap heart likes with real-time like counters.
- **Comments & Reply Drawer**: Post and read threaded comments on any active status.
- **Smart Pause Timer**: Progress bar automatically pauses while typing comments.
- **Ephemeral Storage**: Stories automatically expire and clean up after 24 hours.

### 🤖 4. QuickAI Smart Copilot
- **Chat Summarization**: Summarize lengthy group or 1-on-1 chat threads in seconds.
- **Tone Rewriter**: Transform informal thoughts into polished Professional or Fun tones.
- **Smart Reply Suggestions**: 1-tap AI contextual response chips above the input bar.

### 🎨 5. Wallpapers Gallery & Theme Studio
- **12+ Curated Chat Wallpapers**:
  - Classic Translucent Glow, WhatsApp Dark Doodle, WhatsApp Light Doodle, Cosmic Space Stars, Cyberpunk Neon Grid, Sakura Blossom, Emerald Honeycomb, Midnight OLED Carbon, Sunset Dunes, Glassmorphic Mesh Aura, Matte Slate, Alpine Forest.
- **8+ Glassmorphic Themes**:
  - Purple Velvet, WhatsApp Emerald, WhatsApp Classic Day, Midnight Forest, Celestial Galaxy, Sakura Blossom, Cyberpunk Neon, Midnight Pure Black OLED.
- **Live Message Bubble Preview**: Instant visual preview before applying changes.

### 🔠 6. System-Wide Dynamic Font Scaling
- 4 Typography tiers (`Small: 13.5px`, `Medium: 15px`, `Large: 17px`, `Extra Large: 19px`).
- Automatically syncs to `localStorage` and scales Tailwind font utilities seamlessly.

### 🔒 7. Privacy, Security & Authentication
- **1-Click Google Sign-In**: Powered by Firebase Google OAuth provider.
- **Email & Password Authentication**: Secure bcrypt hash + JWT session token.
- **Phone Number SMS Login**: Real-time phone verification with fast fallback.
- **Privacy Controls**: Read receipts toggle, Last Seen visibility, and 1-click storage cleanup.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, React Hot Toast |
| **Backend** | Node.js, Express.js, Socket.io (WebSocket), Cloudinary |
| **Database** | MongoDB & Mongoose ODM |
| **Real-time Comms** | WebRTC (Simple-Peer), Socket.io signaling |
| **Auth & Cloud** | Firebase Auth (Google OAuth & Phone Auth), JWT, Bcrypt |

---

## 📁 Project Architecture

```
QuickChat-Full-Stack/
├── client/                     # Frontend React + Vite Application
│   ├── src/
│   │   ├── components/         # Chat, Video Call, Modals, Status, Theme components
│   │   ├── context/            # AuthContext, ChatContext, CallContext
│   │   ├── pages/              # LoginPage, HomePage, ProfilePage, PhoneLoginPage
│   │   ├── lib/                # Firebase, WebRTC helpers, Utilities, Sounds
│   │   ├── App.jsx             # Routes & Global Providers
│   │   └── main.jsx            # React root mount
│   └── package.json
│
├── server/                     # Backend Node / Express & Socket.io Server
│   ├── controllers/            # User, Message, Group, Story, AI, OTP controllers
│   ├── models/                 # User, Message, Group, Story, Otp Schemas
│   ├── routes/                 # Express API endpoints
│   ├── lib/                    # MongoDB connection, Socket.io server, Cloudinary
│   ├── middleware/             # JWT auth protection
│   └── server.js               # Main HTTP & WebSocket server entry
│
├── docker-compose.yml          # Multi-container orchestration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or v20.x+)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Cloudinary Account** (for image & media uploads)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Goutam16-Withcode/QuickChat-Full-Stack.git
cd QuickChat-Full-Stack
```

---

### 2. Configure Backend Environment
Navigate to `server/` and create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/syncwire?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_2026
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

Install dependencies and start backend:
```bash
cd server
npm install
npm run server
```

---

### 3. Configure Frontend Environment
Navigate to `client/` and create a `.env` file:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Install dependencies and run frontend:
```bash
cd ../client
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 🐳 Docker Deployment

To launch the full stack with Docker Compose:
```bash
docker-compose up --build -d
```
- **Client**: `http://localhost:5173`
- **Server**: `http://localhost:5000`

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
