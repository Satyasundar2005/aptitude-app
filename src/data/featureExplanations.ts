import { FeatureInfoData } from '../components/common/FeatureInfoModal';

export const FEATURE_EXPLANATIONS: Record<string, FeatureInfoData> = {
  self_study: {
    title: 'Solo Study Pathway',
    tag: 'Adaptive Learning Roadmap',
    accentColor: '#06B6D4',
    summary:
      'A step-by-step 30-level aptitude and reasoning journey inspired by Brilliant.org and Matiks, designed to take learners from 13-year-old middle school basics to CAT 99th percentile quants.',
    howItWorks: [
      'Stage 1 (Levels 1–5): Visual ratio models, fractions & clocks for age 13+ beginners.',
      'Stage 2 (Levels 6–10): High school algebra, train speeds, and work-time LCM shortcuts.',
      'Stage 3 (Levels 11–15): Campus placement PYQs from TCS NQT, Infosys, Wipro, and Accenture.',
      'Stage 4 (Levels 16–20): Banking speed math, quadratic signs, and alligations for SBI PO & SSC CGL.',
      'Stage 5 (Levels 21–25): Engineering aptitude, PERT/CPM floats, and Six Sigma for GATE & ESE.',
      'Stage 6 (Levels 26–30): Advanced logarithm changes, derangements, and CAT 99%ile gauntlets.',
    ],
    tips: 'Every level begins with an intuitive mental model hook, followed by 3 progressive interactive challenges with official exam tags.',
  },

  compete_friends: {
    title: 'Compete with Friends',
    tag: '1v1 Player vs Player',
    accentColor: '#F472B6',
    summary:
      'Challenge friends in real-time speed battles. Play online over Wi-Fi/4G using 6-letter room codes, or play face-to-face on one device offline!',
    howItWorks: [
      'Online Duels: Create a room and share the room code, or click Quick Match to duel live rivals.',
      'Offline Split-Screen: Place your phone or tablet on a table; top screen rotates 180° for your opponent.',
      'Authentic Questions: Battles pull authentic 10-year PYQs from your selected exam syllabus.',
      'Points System: Winning adds +30 to +35 PTS; losing deducts -20 to -25 PTS.',
    ],
    tips: 'Speed and combos build score multipliers! The faster you submit the correct answer, the more bonus points you claim.',
  },

  online_duel: {
    title: 'Play Online With Friends',
    tag: 'Real-Time Multiplayer',
    accentColor: '#6366F1',
    summary:
      'Host private battle rooms or join an instant match against other online students preparing for the same exam track.',
    howItWorks: [
      'Create Room: Generates a unique 6-character room code to text or share with friends.',
      'Join Room: Enter any room code to instantly connect and start the head-to-head match.',
      'Instant Match: Automatic matchmaking finds available online contenders in your exam track.',
      'Live Sync: Scores, streaks, and round transitions sync in real time via Supabase realtime channels.',
    ],
    tips: 'Winners gain +35 Matiks Points and advance their daily Duel Champion quest.',
  },

  offline_split_screen: {
    title: '1v1 Split Screen (Offline)',
    tag: 'Same-Device Tabletop',
    accentColor: '#EC4899',
    summary:
      'A true face-to-face tabletop experience on a single smartphone or tablet. No internet or Wi-Fi required!',
    howItWorks: [
      'Dual Viewports: Player 1 controls the bottom zone; Player 2 controls the inverted 180° top zone.',
      'Simultaneous Solving: Both players read the identical aptitude question at the same time.',
      'Speed Advantage: The first player to tap the correct answer locks in the round victory.',
    ],
    tips: 'Great for study groups, college dorms, library practice, and bus/train journeys.',
  },

  invite_friends: {
    title: 'Invite Friends & Earn Points',
    tag: 'Referral Rewards',
    accentColor: '#FBBF24',
    summary:
      'Invite classmates, study partners, and friends who are not yet on ApptiClash to join and duel with you.',
    howItWorks: [
      'Share your unique invite code or custom referral link via WhatsApp, Telegram, or SMS.',
      'When your friend signs up and plays their first match, you both receive +50 Bonus Matiks Points!',
      'They will automatically appear in your Quick Challenge roster for easy dueling.',
    ],
    tips: 'Build a private campus leaderboard with your friends to see who holds the highest aptitude rating!',
  },

  timed_exam_sprint: {
    title: 'Question Practice (Timed Sprint)',
    tag: 'Strict Exam Simulator',
    accentColor: '#F59E0B',
    summary:
      'Simulates the intense time pressure of real competitive exams with 10 authentic questions under a ticking countdown.',
    howItWorks: [
      'Strict Timer: Every question has an individual countdown (30s, 45s, or 60s based on difficulty).',
      'Instant Mistake Clinic: Tap "Ask Koji" after the sprint to review step-by-step solution breakdowns.',
      'Sprint Target: Score 60%+ accuracy (6/10) to WIN the sprint and claim +25 Matiks Points.',
      'Exam Tracks: Practice with specific papers (GATE, CAT, GRE, ESE, Placements, Banking) or Universal Mix.',
    ],
    tips: 'Answering under pressure trains instinct. Learn to eliminate obvious trap options quickly.',
  },

  daily_rewards: {
    title: 'Matiks Daily Tasks & Rewards',
    tag: 'Daily Quests & Points',
    accentColor: '#10B981',
    summary:
      'Earn points every day by completing daily training milestones across all game modes, plus unlock the Grand Daily Bonus Chest!',
    howItWorks: [
      '5 Daily Tasks: Daily login, Duel victory, Solo Blitz sprint, Solo Study levels, and precision correct answers.',
      'Midnight Reset: Tasks automatically refresh every 24 hours at 00:00 local time.',
      'Grand Daily Chest: Complete all 5 daily tasks to claim a massive +75 BONUS Matiks Points!',
      'Universal Validity: Points earned count towards your master rating and global scholar tiers.',
    ],
    tips: 'Claim completed tasks before midnight so they contribute to your streak and leaderboard rank.',
  },

  exam_tracks: {
    title: '10-Year PYQ Exam Tracks',
    tag: 'Authentic 2015–2024 Papers',
    accentColor: '#38BDF8',
    summary:
      'Questions are authentic 10-year Previous Year Questions from premier national and international examinations with verified paper citations.',
    howItWorks: [
      'GATE: 2015–2024 Aptitude across CS, ME, EC, EE, CE, and Data Science.',
      'CAT: 2015–2024 QA & DILR from IIM Ahmedabad, Bangalore, and Calcutta slots.',
      'GRE: Quantitative Reasoning, Comparisons, and Advanced Arithmetic.',
      'ESE / IES: UPSC Paper-1 General Studies & Engineering Aptitude.',
      'Campus Placements: TCS NQT, Infosys SP/SE, Wipro Elite, and Accenture.',
      'Banking & Govt: SBI PO, IBPS PO, SSC CGL, and RBI Grade B Speed Math.',
    ],
    tips: 'Every question displays its official exam source tag directly in the header.',
  },

  diff_easy: {
    title: 'Beginner Pacing (Easy)',
    tag: 'Foundation Pace • 60s / Q',
    accentColor: '#10B981',
    summary:
      '60 seconds per question. Ideal for beginners, 7th–10th graders, and foundational placement screening tests.',
    howItWorks: [
      'Target Exams: TCS NQT, Wipro, Accenture, Grade 7–10 math foundations.',
      'Pacing: 60 seconds per question allows thorough step-by-step arithmetic without rushing.',
      'Passing Standard: 60% accuracy (6/10) to win +25 PTS.',
    ],
  },

  diff_medium: {
    title: 'Intermediate Pacing (Medium)',
    tag: 'Standard Exam Pace • 45s / Q',
    accentColor: '#38BDF8',
    summary:
      '45 seconds per question. Calibrated to the standard solving speed required for GATE, GRE, and Banking exams.',
    howItWorks: [
      'Target Exams: GATE General Aptitude, GRE Quantitative, SBI PO Prelims.',
      'Pacing: 45 seconds tests mental calculations and formula recognition.',
      'Passing Standard: 60% accuracy (6/10) to win +25 PTS.',
    ],
  },

  diff_hard: {
    title: 'Advanced Pacing (Hard)',
    tag: 'Masterclass Sprint • 30s / Q',
    accentColor: '#F43F5E',
    summary:
      '30 seconds per question. Extreme speed-math simulator calibrated to IIMs CAT 99th percentile and Bank PO Mains.',
    howItWorks: [
      'Target Exams: CAT QA 99%ile, RBI Grade B, Banking Mains rapid fire.',
      'Pacing: 30 seconds requires instant pattern recognition and mental shortcuts.',
      'Passing Standard: 60% accuracy (6/10) to win +25 PTS.',
    ],
  },

  points_system: {
    title: 'Universal Points Rules',
    tag: 'All Game Formats',
    accentColor: '#38BDF8',
    summary:
      'A fair competitive Elo-inspired points system valid across all game formats. Points determine your Scholar Tier and rank on the global leaderboard.',
    howItWorks: [
      'Online 1v1: Win yields +35 PTS, Loss deducts -25 PTS.',
      'Split-Screen: Win yields +30 PTS, Loss deducts -20 PTS.',
      'Solo Blitz (Sprint): ≥60% accuracy yields +25 PTS, <60% deducts -15 PTS.',
      'Solo Study Pathway: ≥2 Stars yields +20 PTS, <2 Stars deducts -10 PTS.',
      'Protection Floor: Points will never drop below 0.',
    ],
    tips: 'Complete all 5 daily tasks before midnight to claim an additional +75 PTS from the Grand Bonus Chest!',
  },

  online_create_room: {
    title: 'Host Private Battle Room',
    tag: 'Multiplayer Host',
    accentColor: '#6366F1',
    summary:
      'Generate a unique 6-character room code to invite a friend or classmate to a live 1v1 battle.',
    howItWorks: [
      'Tap "Generate Private Room Code" to create a room with your selected exam track.',
      'Share the code with your friend via WhatsApp, SMS, or in person.',
      'Once they enter the code, both players sync and the duel begins simultaneously.',
    ],
    tips: 'The host and challenger receive the same 10 PYQ questions with real-time score updates.',
  },

  online_join_room: {
    title: 'Join Friend’s Room',
    tag: 'Multiplayer Challenger',
    accentColor: '#A855F7',
    summary:
      'Enter the 6-character code created by your friend to join their private exam battle room.',
    howItWorks: [
      'Type or paste your friend’s code into the input box.',
      'Tap "Join Friend\'s Room" to connect instantly.',
      'Answer questions faster than your friend to build combos and secure the win.',
    ],
    tips: 'Double check the room code capitalization; codes are automatically uppercased for you.',
  },

  online_quick_match: {
    title: 'Quick Match Online Rival',
    tag: 'Instant Matchmaking',
    accentColor: '#10B981',
    summary:
      'Instantly pair up with an active online peer preparing for the same competitive exam track.',
    howItWorks: [
      'Automatic matchmaking searches for available online contenders in your exam syllabus.',
      'Both players duel across 10 identical authentic PYQs.',
      'Winner earns +35 Matiks Points towards their daily quest and leaderboard rank.',
    ],
    tips: 'Speed and combos build score multipliers! The faster you answer correctly, the more points you gain.',
  },
};
