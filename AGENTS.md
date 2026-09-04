# AGENTS.md — AptiClash Mobile Project Guide & Agent Conventions

This document provides foundational architecture details, conventions, workflows, and guidelines for AI agents and human contributors working on the **AptiClash** mobile application.

---

## 1. Project Overview

**AptiClash** is a fast-paced, gamified competitive aptitude testing mobile app built with React Native and Expo. It allows students and job aspirants to practice aptitude questions, play solo blitz games, duel locally on a single device (split-screen), and compete online in real-time.

- **Target Platforms**: iOS, Android, Web
- **Core Framework**: React Native 0.86, Expo SDK 57, Expo Router v57
- **Language**: TypeScript (`strict: false` currently in `tsconfig.json`)
- **Backend / Realtime**: Supabase (PostgreSQL, Row-Level Security, Realtime broadcast/presence)
- **Local State**: Zustand (`zustand@4.5.4`)
- **Icons & Graphics**: `lucide-react-native`, `expo-linear-gradient`, `react-native-svg`
- **Audio & FX**: `expo-haptics`, `expo-av`

---

## 2. Directory Structure

```
├── app/                       # Expo Router file-based routing
│   ├── _layout.tsx            # Root layout with Stack & Status Bar
│   ├── index.tsx              # Home / Main Menu route
│   ├── duel.tsx               # Local 2-Player Split-screen route
│   ├── online.tsx             # Real-time Online 1v1 route
│   ├── solo.tsx               # Solo Blitz mode route
│   └── practice.tsx           # Practice / Topic study route
├── src/
│   ├── components/            # Reusable UI components & modals
│   │   ├── duel/
│   │   │   └── PlayerZone.tsx # Split-screen upside-down / rightside-up player board
│   │   └── ProfileMenuModal.tsx # User profile, stats, streak & account settings
│   ├── screens/               # Screen implementations
│   │   ├── HomeScreen.tsx
│   │   ├── DuelScreen.tsx
│   │   ├── OnlineDuelScreen.tsx
│   │   ├── OnlineLobbyModal.tsx
│   │   ├── SoloBlitzScreen.tsx
│   │   └── PracticeScreen.tsx
│   ├── services/              # External APIs & business logic
│   │   ├── databaseService.ts # Supabase questions & profile operations
│   │   ├── questionGenerator.ts # Algorithmic question engine & PYQ fallbacks
│   │   └── supabase.ts        # Supabase client singleton & auth helpers
│   ├── store/                 # Zustand state stores
│   │   ├── useGameStore.ts    # Match state, scores, round timers
│   │   └── useUserStore.ts    # User profile, XP, rating (Elo), coins
│   └── types/                 # TypeScript type declarations
│       ├── game.ts            # Game mode, Question, Player, Round types
│       └── supabase.ts        # Generated & custom database schemas
├── supabase/                  # Database migration and seed files
│   ├── schema.sql             # Tables: profiles, questions, rooms, matches
│   ├── seed.sql               # Base mock & test data
│   └── seed_pyqs.sql          # Previous Years Questions (TCS, Infosys, CAT, etc.)
└── package.json
```

---

## 3. Development Workflow & Commands

### Running the App
- **Start Expo Dev Server**:
  ```bash
  npm start
  # or with cache cleared:
  npx expo start -c
  ```
- **Platform-specific shortcuts**:
  - Android: `npm run android`
  - iOS: `npm run ios`
  - Web: `npm run web`

### Environment Configuration
- Supabase credentials reside in `.env` (or fallback keys configured in `src/services/supabase.ts`):
  ```env
  EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=<public-anon-key>
  ```

---

## 4. Key Architectural Patterns & Conventions

### 4.1 React Native & Performance
- **Avoid Heavy Re-renders**: Use memoized selectors with Zustand (`useGameStore(state => state.foo)`).
- **Haptics & Sound**: Gracefully catch errors on Web/Unsupported environments (`Haptics.impactAsync().catch(...)`).
- **Safe Area**: Always wrap screens with `SafeAreaView` from `react-native-safe-area-context`.
- **Keyboard Handling**: Dismiss keyboards on tap outside in input-heavy screens or modals.

### 4.2 Local Split-screen Duel Design
- `PlayerZone.tsx` supports `inverted={true}` for Player 1 (top of screen facing the opposing player) with `transform: [{ rotate: '180deg' }]`.
- Ensure touch coordinates and modal alerts do not cross into the other player's region.

### 4.3 Supabase Realtime Synchronization
- Room creation and joining rely on Supabase Realtime channel subscriptions (`supabase.channel('room:<code'>)`).
- Handle disconnected/reconnecting states gracefully with timeout fallbacks to prevent freezing games.

---

## 5. Coding Guidelines for Agents

1. **TypeScript Hygiene**:
   - Prefer strongly typed interfaces in `src/types/game.ts` and `src/types/supabase.ts`.
   - Never use `any` when an interface or union type can be inferred or defined.

2. **Styling**:
   - Keep styles encapsulated using `StyleSheet.create()`.
   - Maintain the neon cyber-arcade dark theme palette (Deep navy `#0B0F19`, Neon cyan `#06B6D4`, Electric Violet `#8B5CF6`, Emerald `#10B981`, Coral `#F43F5E`).

3. **Database & Migrations**:
   - Whenever database schemas or seed data change, update `supabase/schema.sql` and `supabase/seed_pyqs.sql` accordingly.
   - Do not commit sensitive service role secrets or production API keys to git.
