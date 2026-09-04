# Supabase Database Setup for ApptiClash

This directory contains the database schema, seed scripts, and configuration for **ApptiClash** powered by [Supabase](https://supabase.com).

---

## 1. Create a Supabase Project

1. Go to [database.new](https://database.new) or [Supabase Dashboard](https://app.supabase.com).
2. Click **New project**.
3. Fill in your project details:
   - **Name**: `appticlash` (or any name)
   - **Database Password**: Set a secure password and save it
   - **Region**: Select the region closest to you
4. Click **Create new project** and wait ~1-2 minutes for provisioning.

---

## 2. Apply Database Schema

1. Open your project on the Supabase Dashboard.
2. In the left navigation, click on **SQL Editor**.
3. Click **New query**.
4. Copy the entire contents of [`supabase/schema.sql`](./schema.sql) and paste it into the editor.
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
6. Verify that the following tables were created in the **Table Editor**:
   - `profiles` (User rankings, ELO, stats, linked to Supabase Auth)
   - `questions` (Curated PYQ & question bank with JSON options)
   - `rooms` (1v1 live multiplayer rooms with Realtime sync)
   - `room_answers` (Per-round audit and scoring)
   - `solo_blitz_runs` (Global leaderboard runs)

---

## 3. Seed Questions & Verified PYQs

1. In the **SQL Editor**, open another **New query**.
2. Copy and run [`supabase/seed.sql`](./seed.sql) to add sample questions across tracks (GATE, CAT, GRE, ESE, Placement, Banking).
3. Optional: To load all **120+ verified PYQs**, copy and run [`supabase/seed_pyqs.sql`](./seed_pyqs.sql).
   *(You can regenerate this anytime using `node scripts/generate_seed_sql.js`)*.

---

## 4. Enable Supabase Realtime (For 1v1 Online Duels)

The `schema.sql` script automatically enables Realtime on `public.rooms` and `public.room_answers`. To confirm:
1. Go to **Database** -> **Replication** in the Supabase Dashboard.
2. Under **Source**, ensure `supabase_realtime` has `rooms` and `room_answers` toggled ON.

---

## 5. Connect the App (.env Configuration)

1. Go to **Project Settings** -> **API** (or **Data API**).
2. Copy your **Project URL** and **anon public key**.
3. Create a `.env` file in the root of the project (`D:\aptitude app\.env`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Restart your Expo development server:
```bash
npm start
```

---

## Architecture Summary

| Component | Description |
|-----------|-------------|
| **Client** | [`src/services/supabase.ts`](../src/services/supabase.ts) - Initialized Supabase client with AsyncStorage session persistence |
| **Types** | [`src/types/supabase.ts`](../src/types/supabase.ts) - Full TypeScript schema definitions |
| **Service Layer** | [`src/services/databaseService.ts`](../src/services/databaseService.ts) - Room creation, realtime subscription, question fetching & leaderboards |
| **Schema** | [`supabase/schema.sql`](./schema.sql) - Tables, indexes, triggers, RPCs, and RLS policies |
| **Seed** | [`supabase/seed_pyqs.sql`](./seed_pyqs.sql) - 120+ verified exam questions |
