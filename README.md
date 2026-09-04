# AptiClash ⚡

> **🎮 Fast-Paced Gamified Competitive Aptitude Testing & 1v1 Battle Arena**  
> Master quantitative aptitude, logical reasoning, verbal ability, and 10-year placement PYQs through stepping stone pathways, split-screen tabletop duels, and online multiplayer.

[![Download APK](https://img.shields.io/badge/Download-Android%20APK-10B981?style=for-the-badge&logo=android&logoColor=white)](https://satyasundar2005.github.io/aptitude-app/)
[![Live Download Site](https://img.shields.io/badge/Website-GitHub%20Pages-06B6D4?style=for-the-badge&logo=githubpages&logoColor=white)](https://satyasundar2005.github.io/aptitude-app/)
[![CI Pipeline](https://img.shields.io/github/actions/workflow/status/Satyasundar2005/aptitude-app/ci.yml?branch=main&label=CI&style=for-the-badge)](https://github.com/Satyasundar2005/aptitude-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge)](LICENSE)

---

### 🌐 Official Website & APK Download
👉 **[https://satyasundar2005.github.io/aptitude-app/](https://satyasundar2005.github.io/aptitude-app/)**  
Visit the site on your phone or scan the QR code to download and install **`AptiClash.apk`** directly.

---

## 🚀 Core Features

- **🗺️ Self-Study Pathway (Default)**: Visual stepping-stone roadmaps with checkpoints, master tests, and Koji AI interactive tutor.
- **⚔️ 1v1 Tabletop Split-Screen**: Put your phone on a table and duel head-to-head on a single screen (Player 1 board is rotated 180°).
- **🌐 Online 1v1 Ranked Duels**: Real-time room codes, cross-device matchmaking, and instant invite links via Supabase Realtime WebSockets.
- **⏱️ Timed Question Practice**: Exam-oriented sprint modes featuring 10-year Previous Year Questions from TCS, Infosys, CAT, and GATE.
- **🤖 Interactive Koji AI Tutor**: Mistake clinics, concept breakdown tabs, and interactive doubt clearing.
- **🏆 Elo Rating & Scholar Ranks**: Climb from Bronze Cadet to Grandmaster, earn daily streak coin rewards, and level up.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) SDK 57 (React Native 0.86)
- **Router**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime WebSockets)
- **Icons & Styling**: [Lucide React Native](https://lucide.dev/), `expo-linear-gradient`
- **Sensory Effects**: `expo-haptics`, `expo-av`

---

## 📱 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Expo Go](https://expo.dev/go) app installed on your physical device (iOS/Android) or an emulator.

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Supabase (Optional)
Copy `.env.example` to `.env` and provide your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the App
```bash
# Start Metro bundler with cleared cache
npx expo start -c

# Or run directly on an emulator:
npm run android
npm run ios
npm run web
```

---

## 📄 License
This project is licensed under the MIT License.
