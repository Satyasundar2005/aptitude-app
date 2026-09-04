# AptiClash ⚡

A high-energy, gamified aptitude testing and battle arena mobile application built with **React Native**, **Expo**, and **Supabase**.

Master quantitative aptitude, logical reasoning, verbal ability, and company-specific placement PYQs (TCS, Infosys, Wipro, Accenture, CAT) through fast-paced solo sprints and head-to-head duels.

---

## 🚀 Features

- **⚔️ 1v1 Local Split-Screen Duel**: Battle face-to-face on the same phone. Screen flips 180° for Player 1 with simultaneous real-time scoring.
- **🌐 Online 1v1 Ranked Matchmaking**: Create custom rooms with 6-digit room codes or join random players worldwide in real-time via Supabase Realtime.
- **⚡ Solo Blitz**: Beat the ticking clock in rapid-fire 60-second sprints to maximize your score and combo multipliers.
- **📚 Topic Practice**: Deep dive by category (Quantitative, Logical, Verbal, Data Interpretation) with step-by-step solution breakdowns.
- **🏆 Elo Rating & XP Progression**: Level up, earn badges, build daily streaks, and climb the competitive ladder.

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
