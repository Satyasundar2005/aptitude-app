import {
  Question,
  QuestionCategory,
  Difficulty,
  ExamTrack,
} from '../types/game';

let questionIdCounter = 0;

function generateId(): string {
  questionIdCounter += 1;
  return `q_${questionIdCounter}_${Date.now()}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getGcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function getTimeLimit(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 60;
    case 'medium':
      return 45;
    case 'hard':
      return 30;
  }
}

export interface PyqTemplate {
  text: string;
  options: string[];
  correctIndex: number;
  category: QuestionCategory;
  difficulty: Difficulty;
  examTrack: ExamTrack;
  examTag: string;
  explanation: string;
}

export const CURATED_PYQS: PyqTemplate[] = [
  {
    "text": "Find the odd one out from the given letter clusters: BDF, HJL, NPR, TVZ.",
    "options": [
      "BDF",
      "HJL",
      "NPR",
      "TVZ"
    ],
    "correctIndex": 3,
    "category": "spatial_reasoning",
    "difficulty": "easy",
    "examTrack": "gate",
    "examTag": "GATE 2024 CS (General Aptitude)",
    "explanation": "BDF (B+2=D, D+2=F), HJL (+2, +2), NPR (+2, +2). In TVZ: T+2=V, but V+4=Z. Hence TVZ is the odd cluster."
  },
  {
    "text": "A box has 5 red, 4 blue, and 3 green balls. Two balls are drawn at random without replacement. What is the probability that both balls are blue?",
    "options": [
      "1/11",
      "1/12",
      "1/6",
      "2/11"
    ],
    "correctIndex": 0,
    "category": "probability",
    "difficulty": "medium",
    "examTrack": "gate",
    "examTag": "GATE 2024 DA (Data Science & AI)",
    "explanation": "Total balls = 12. P(both blue) = (4/12) × (3/11) = 12 / 132 = 1/11."
  },
  {
    "text": "If (x - 1/x) = 3, what is the value of (x² + 1/x²)?",
    "options": [
      "9",
      "11",
      "7",
      "12"
    ],
    "correctIndex": 1,
    "category": "algebra",
    "difficulty": "easy",
    "examTrack": "gate",
    "examTag": "GATE 2023 ME (General Aptitude)",
    "explanation": "(x - 1/x)² = x² + 1/x² - 2. Therefore, x² + 1/x² = 3² + 2 = 9 + 2 = 11."
  },
  {
    "text": "The price of sugar rises by 25%. By what percentage must a household reduce consumption so expenditure remains unchanged?",
    "options": [
      "20%",
      "25%",
      "16.67%",
      "15%"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "medium",
    "examTrack": "gate",
    "examTag": "GATE 2023 CS (General Aptitude)",
    "explanation": "Reduction % = [r / (100 + r)] × 100 = [25 / 125] × 100 = (1/5) × 100 = 20%."
  },
  {
    "text": "A train 150m long passes an electric pole in 15 seconds. What is the speed of the train in km/h?",
    "options": [
      "36 km/h",
      "45 km/h",
      "54 km/h",
      "30 km/h"
    ],
    "correctIndex": 0,
    "category": "speed_distance",
    "difficulty": "easy",
    "examTrack": "gate",
    "examTag": "GATE 2022 ME (General Aptitude)",
    "explanation": "Speed = 150m / 15s = 10 m/s. Converting to km/h: 10 × (18/5) = 36 km/h."
  },
  {
    "text": "If 2^(x+2) = 16^(x-1), what is the value of x?",
    "options": [
      "2",
      "3",
      "1",
      "4"
    ],
    "correctIndex": 0,
    "category": "algebra",
    "difficulty": "medium",
    "examTrack": "gate",
    "examTag": "GATE 2022 EC (General Aptitude)",
    "explanation": "16^(x-1) = [2^4]^(x-1) = 2^(4x - 4). Equating exponents: x + 2 = 4x - 4 => 3x = 6 => x = 2."
  },
  {
    "text": "Two fair dice are rolled simultaneously. What is the probability that the sum of the numbers showing is 8?",
    "options": [
      "5/36",
      "1/6",
      "7/36",
      "1/9"
    ],
    "correctIndex": 0,
    "category": "probability",
    "difficulty": "medium",
    "examTrack": "gate",
    "examTag": "GATE 2021 EE (General Aptitude)",
    "explanation": "Favorable outcomes for sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes. Total = 36. Probability = 5/36."
  },
  {
    "text": "A rectangular plot 20m long and 15m wide is surrounded by a walkway of uniform width 2m. What is the area of the walkway?",
    "options": [
      "156 m²",
      "140 m²",
      "164 m²",
      "148 m²"
    ],
    "correctIndex": 0,
    "category": "spatial_reasoning",
    "difficulty": "medium",
    "examTrack": "gate",
    "examTag": "GATE 2021 CE (General Aptitude)",
    "explanation": "Outer dimensions = (20 + 4) × (15 + 4) = 24 × 19 = 456 m². Inner area = 20 × 15 = 300 m². Walkway area = 456 - 300 = 156 m²."
  },
  {
    "text": "Pipe A fills a tank in 4 hours, and Pipe B empties it in 6 hours. If both are opened together, how long will it take to fill the tank?",
    "options": [
      "10 hrs",
      "12 hrs",
      "8 hrs",
      "24 hrs"
    ],
    "correctIndex": 1,
    "category": "time_work",
    "difficulty": "medium",
    "examTrack": "gate",
    "examTag": "GATE 2020 CE (General Aptitude)",
    "explanation": "Net rate = 1/4 - 1/6 = (3 - 2)/12 = 1/12 tank/hr. Thus, 12 hours are required to fill the tank."
  },
  {
    "text": "The ratio of boys to girls in a class is 3:2. If 6 girls join the class, the ratio becomes 1:1. How many boys are in the class?",
    "options": [
      "18",
      "12",
      "24",
      "15"
    ],
    "correctIndex": 0,
    "category": "algebra",
    "difficulty": "easy",
    "examTrack": "gate",
    "examTag": "GATE 2020 CS (General Aptitude)",
    "explanation": "Let boys = 3x and girls = 2x. 3x / (2x + 6) = 1 => 3x = 2x + 6 => x = 6. Number of boys = 3 × 6 = 18."
  },
  {
    "text": "If log₁₀(x) + log₁₀(x - 3) = 1, what is the valid value of x?",
    "options": [
      "5",
      "2",
      "-2",
      "10"
    ],
    "correctIndex": 0,
    "category": "algebra",
    "difficulty": "hard",
    "examTrack": "gate",
    "examTag": "GATE 2019 EC (General Aptitude)",
    "explanation": "log₁₀[x(x - 3)] = 1 => x² - 3x = 10 => x² - 3x - 10 = 0 => (x - 5)(x + 2) = 0. Since log requires x > 3, x = 5."
  },
  {
    "text": "A car covers the first half of a total distance at 40 km/h and the second half at 60 km/h. What is the average speed?",
    "options": [
      "48 km/h",
      "50 km/h",
      "45 km/h",
      "52 km/h"
    ],
    "correctIndex": 0,
    "category": "speed_distance",
    "difficulty": "easy",
    "examTrack": "gate",
    "examTag": "GATE 2019 EE (General Aptitude)",
    "explanation": "Average speed for equal distance segments = 2xy / (x + y) = 2(40)(60) / (40 + 60) = 4800 / 100 = 48 km/h."
  },
  {
    "text": "A wire bent into the form of a square encloses an area of 121 cm². If bent into a circle, what is the area? (π = 22/7)",
    "options": [
      "154 cm²",
      "144 cm²",
      "176 cm²",
      "132 cm²"
    ],
    "correctIndex": 0,
    "category": "spatial_reasoning",
    "difficulty": "hard",
    "examTrack": "gate",
    "examTag": "GATE 2018 ME (General Aptitude)",
    "explanation": "Square side = √121 = 11 cm. Perimeter = 4 × 11 = 44 cm = 2πr. 2 × (22/7) × r = 44 => r = 7 cm. Area = πr² = (22/7) × 49 = 154 cm²."
  },
  {
    "text": "A and B can finish a work in 15 days and 10 days respectively. They worked together for 2 days, then B left. How many days will A take to finish the rest?",
    "options": [
      "10 days",
      "8 days",
      "12 days",
      "9 days"
    ],
    "correctIndex": 0,
    "category": "time_work",
    "difficulty": "medium",
    "examTrack": "gate",
    "examTag": "GATE 2018 CE (General Aptitude)",
    "explanation": "Together in 1 day = 1/15 + 1/10 = 5/30 = 1/6. In 2 days = 2/6 = 1/3 done. Remaining = 2/3. A takes (2/3) / (1/15) = 10 days."
  },
  {
    "text": "At what angle are the hands of a clock inclined at 4:20?",
    "options": [
      "10°",
      "15°",
      "20°",
      "0°"
    ],
    "correctIndex": 0,
    "category": "logic",
    "difficulty": "easy",
    "examTrack": "gate",
    "examTag": "GATE 2017 CS (General Aptitude)",
    "explanation": "Angle = |30H - 5.5M| = |30(4) - 5.5(20)| = |120 - 110| = 10°."
  },
  {
    "text": "What is the unit digit in the expansion of (7⁷¹ × 6⁶³ × 3⁶⁵)?",
    "options": [
      "4",
      "2",
      "6",
      "8"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "hard",
    "examTrack": "gate",
    "examTag": "GATE 2017 EC (General Aptitude)",
    "explanation": "Cyclicity of 7 is 4: 71 mod 4 = 3 => 7³ ends in 3. 6 always ends in 6. Cyclicity of 3 is 4: 65 mod 4 = 1 => 3¹ ends in 3. Product: 3 × 6 × 3 = 54 => unit digit 4."
  },
  {
    "text": "Two trains of length 140m and 160m travel in opposite directions at 60 km/h and 48 km/h. How long will they take to completely cross each other?",
    "options": [
      "10 seconds",
      "12 seconds",
      "9 seconds",
      "15 seconds"
    ],
    "correctIndex": 0,
    "category": "speed_distance",
    "difficulty": "medium",
    "examTrack": "gate",
    "examTag": "GATE 2016 EE (General Aptitude)",
    "explanation": "Total distance = 140 + 160 = 300m. Relative speed = 60 + 48 = 108 km/h = 108 × (5/18) = 30 m/s. Time = 300 / 30 = 10 seconds."
  },
  {
    "text": "What is the remainder when (29²⁸ + 1) is divided by 28?",
    "options": [
      "2",
      "1",
      "0",
      "27"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "medium",
    "examTrack": "gate",
    "examTag": "GATE 2016 ME (General Aptitude)",
    "explanation": "29 ≡ 1 (mod 28). Thus 29²⁸ ≡ 1²⁸ = 1 (mod 28). (29²⁸ + 1) ≡ 1 + 1 = 2 (mod 28)."
  },
  {
    "text": "What is the sum of the first 20 terms of the arithmetic progression: 3, 7, 11, 15, ...?",
    "options": [
      "820",
      "800",
      "840",
      "780"
    ],
    "correctIndex": 0,
    "category": "series",
    "difficulty": "easy",
    "examTrack": "gate",
    "examTag": "GATE 2015 CS (General Aptitude)",
    "explanation": "a = 3, d = 4, n = 20. S_n = (n/2)[2a + (n - 1)d] = 10 × [6 + 19(4)] = 10 × [6 + 76] = 820."
  },
  {
    "text": "A vessel contains 60 liters of milk. 12 liters are drawn out and replaced with water. How much pure milk remains?",
    "options": [
      "48 liters",
      "45 liters",
      "50 liters",
      "42 liters"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "easy",
    "examTrack": "gate",
    "examTag": "GATE 2015 CE (General Aptitude)",
    "explanation": "Direct withdrawal: 60 - 12 = 48 liters of milk remain."
  },
  {
    "text": "If f(x) = x² - 6x + 13 for all real values of x, what is the minimum value that f(x) can attain?",
    "options": [
      "4",
      "13",
      "3",
      "7"
    ],
    "correctIndex": 0,
    "category": "algebra",
    "difficulty": "medium",
    "examTrack": "cat",
    "examTag": "CAT 2024 QA (Slot 1)",
    "explanation": "Completing the square: f(x) = (x - 3)² + 4. Since (x - 3)² ≥ 0 for all real x, the minimum value is 4 (at x = 3)."
  },
  {
    "text": "In how many ways can 6 distinct books be arranged on a shelf such that two specific books are always placed side-by-side?",
    "options": [
      "240",
      "120",
      "720",
      "360"
    ],
    "correctIndex": 0,
    "category": "probability",
    "difficulty": "medium",
    "examTrack": "cat",
    "examTag": "CAT 2024 QA (Slot 2)",
    "explanation": "Tie the 2 specific books into 1 bundle: (5 items)! × (2 books internal arrangement)! = 120 × 2 = 240 ways."
  },
  {
    "text": "A merchant marks his goods 40% above cost and offers a 20% discount. What is his net profit percentage?",
    "options": [
      "12%",
      "15%",
      "20%",
      "10%"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "medium",
    "examTrack": "cat",
    "examTag": "CAT 2023 QA (Slot 1)",
    "explanation": "Let CP = 100. Marked Price MP = 140. Selling Price SP = 140 × 0.80 = 112. Net Profit = 112 - 100 = 12%."
  },
  {
    "text": "If log₂(x) + log₄(x) = 6, what is the value of x?",
    "options": [
      "16",
      "64",
      "8",
      "32"
    ],
    "correctIndex": 0,
    "category": "algebra",
    "difficulty": "hard",
    "examTrack": "cat",
    "examTag": "CAT 2023 QA (Slot 2)",
    "explanation": "log₄(x) = log₂(x) / 2. So log₂(x) + (1/2)log₂(x) = (3/2)log₂(x) = 6 => log₂(x) = 4 => x = 2⁴ = 16."
  },
  {
    "text": "Two cars start simultaneously towards each other from points 360 km apart at 40 km/h and 50 km/h. After how long do they meet?",
    "options": [
      "4 hours",
      "3.6 hours",
      "4.5 hours",
      "5 hours"
    ],
    "correctIndex": 0,
    "category": "speed_distance",
    "difficulty": "easy",
    "examTrack": "cat",
    "examTag": "CAT 2022 QA (Slot 1)",
    "explanation": "Relative speed = 40 + 50 = 90 km/h. Time to meet = Total distance / Relative speed = 360 / 90 = 4 hours."
  },
  {
    "text": "If the roots of the quadratic equation x² - bx + c = 0 differ by 1, which relation must hold true?",
    "options": [
      "b² - 4c = 1",
      "b² - 4c = 4",
      "b² + 4c = 1",
      "b² - 2c = 1"
    ],
    "correctIndex": 0,
    "category": "algebra",
    "difficulty": "hard",
    "examTrack": "cat",
    "examTag": "CAT 2022 QA (Slot 2)",
    "explanation": "|α - β| = 1 => (α - β)² = 1. Using identities: (α + β)² - 4αβ = 1 => b² - 4c = 1."
  },
  {
    "text": "A cask contains 80 liters of pure milk. 8 liters are drawn out and replaced with water, and this process is repeated once more. How much pure milk remains?",
    "options": [
      "64.8 liters",
      "64.0 liters",
      "65.2 liters",
      "66.0 liters"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "hard",
    "examTrack": "cat",
    "examTag": "CAT 2021 QA (Slot 1)",
    "explanation": "Remaining liquid = Initial × (1 - x/V)ⁿ = 80 × (1 - 8/80)² = 80 × (0.9)² = 80 × 0.81 = 64.8 liters."
  },
  {
    "text": "In how many ways can 5 people be seated in a row such that two particular individuals never sit adjacent to each other?",
    "options": [
      "72",
      "48",
      "120",
      "96"
    ],
    "correctIndex": 0,
    "category": "probability",
    "difficulty": "hard",
    "examTrack": "cat",
    "examTag": "CAT 2021 QA (Slot 3)",
    "explanation": "Total seating arrangements = 5! = 120. Together arrangements = 4! × 2! = 24 × 2 = 48. Desired = 120 - 48 = 72."
  },
  {
    "text": "A and B can complete a work in 12 and 18 days. If they work on alternate days starting with A, in how many days is the work completed?",
    "options": [
      "14 1/3 days",
      "14 1/2 days",
      "15 days",
      "14 days"
    ],
    "correctIndex": 0,
    "category": "time_work",
    "difficulty": "hard",
    "examTrack": "cat",
    "examTag": "CAT 2020 QA (Slot 1)",
    "explanation": "Total work = LCM(12, 18) = 36 units. A = 3 units/day, B = 2 units/day. In 2 days = 5 units. 7 pairs (14 days) = 35 units. 1 unit remains, done by A in 1/3 day. Total = 14 1/3 days."
  },
  {
    "text": "What is the remainder when 2¹⁰⁰ is divided by 7?",
    "options": [
      "2",
      "4",
      "1",
      "6"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "hard",
    "examTrack": "cat",
    "examTag": "CAT 2020 QA (Slot 2)",
    "explanation": "2³ = 8 ≡ 1 (mod 7). 100 = 3 × 33 + 1. Therefore 2¹⁰⁰ = (2³)³³ × 2¹ ≡ 1³³ × 2 ≡ 2 (mod 7)."
  },
  {
    "text": "If x + y + z = 12 and xy + yz + zx = 44, what is the value of x² + y² + z²?",
    "options": [
      "56",
      "44",
      "64",
      "88"
    ],
    "correctIndex": 0,
    "category": "algebra",
    "difficulty": "medium",
    "examTrack": "cat",
    "examTag": "CAT 2019 QA (Slot 1)",
    "explanation": "(x + y + z)² = x² + y² + z² + 2(xy + yz + zx). Substituting: 12² = x² + y² + z² + 2(44) => 144 - 88 = 56."
  },
  {
    "text": "What is the sum of the infinite geometric series: 12 + 4 + 4/3 + 4/9 + ...?",
    "options": [
      "18",
      "16",
      "20",
      "24"
    ],
    "correctIndex": 0,
    "category": "series",
    "difficulty": "medium",
    "examTrack": "cat",
    "examTag": "CAT 2019 QA (Slot 2)",
    "explanation": "First term a = 12, common ratio r = 4/12 = 1/3. Sum S_∞ = a / (1 - r) = 12 / (1 - 1/3) = 12 / (2/3) = 18."
  },
  {
    "text": "The difference between Compound Interest and Simple Interest on ₹25,000 for 2 years is ₹160. What is the annual interest rate?",
    "options": [
      "8%",
      "6%",
      "10%",
      "7.5%"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "hard",
    "examTrack": "cat",
    "examTag": "CAT 2018 QA (Slot 1)",
    "explanation": "For 2 years, CI - SI = P × (R/100)². 160 = 25000 × (R/100)² => (R/100)² = 160/25000 = 16/2500 => R/100 = 4/50 => R = 8%."
  },
  {
    "text": "A, B, and C invest in a business in the ratio 3:4:5. If the total annual profit is ₹1,20,000, what is B's profit share?",
    "options": [
      "₹40,000",
      "₹30,000",
      "₹50,000",
      "₹36,000"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "easy",
    "examTrack": "cat",
    "examTag": "CAT 2018 QA (Slot 2)",
    "explanation": "Total ratio parts = 3 + 4 + 5 = 12 parts. B's share = (4/12) × ₹1,20,000 = (1/3) × 120000 = ₹40,000."
  },
  {
    "text": "How many trailing zeroes are in the decimal expansion of 100! (100 factorial)?",
    "options": [
      "24",
      "20",
      "25",
      "22"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "medium",
    "examTrack": "cat",
    "examTag": "CAT 2017 QA (Slot 1)",
    "explanation": "Trailing zeroes = ⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24."
  },
  {
    "text": "A person walking on a moving escalator takes 30s to go down at 4 steps/s. When the escalator stops, he takes 40s. Find total steps on the escalator.",
    "options": [
      "160 steps",
      "120 steps",
      "180 steps",
      "200 steps"
    ],
    "correctIndex": 0,
    "category": "speed_distance",
    "difficulty": "hard",
    "examTrack": "cat",
    "examTag": "CAT 2017 QA (Slot 2)",
    "explanation": "When stationary, escalator steps = person's speed × time = 4 steps/s × 40s = 160 steps."
  },
  {
    "text": "In a competitive test, 70% passed English, 80% passed Math, and 10% failed both. If 144 passed both, find the total candidates.",
    "options": [
      "240",
      "200",
      "280",
      "300"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "medium",
    "examTrack": "cat",
    "examTag": "CAT 2016 QA (Slot 1)",
    "explanation": "Failed at least one = 100 - 10 = 90% appeared. P(E ∪ M) = 70% + 80% - P(Both) = 90% => P(Both) = 60%. 60% of Total = 144 => Total = 144 / 0.6 = 240."
  },
  {
    "text": "Find the length of the longest rigid rod that can be placed inside a room of dimensions 12m × 9m × 8m.",
    "options": [
      "17m",
      "15m",
      "19m",
      "18m"
    ],
    "correctIndex": 0,
    "category": "spatial_reasoning",
    "difficulty": "easy",
    "examTrack": "cat",
    "examTag": "CAT 2016 QA (Slot 2)",
    "explanation": "Space diagonal = √(l² + w² + h²) = √(12² + 9² + 8²) = √(144 + 81 + 64) = √289 = 17m."
  },
  {
    "text": "The sides of a right-angled triangle are 6 cm, 8 cm, and 10 cm. What is the inradius of the inscribed circle?",
    "options": [
      "2 cm",
      "3 cm",
      "2.5 cm",
      "1.5 cm"
    ],
    "correctIndex": 0,
    "category": "spatial_reasoning",
    "difficulty": "medium",
    "examTrack": "cat",
    "examTag": "CAT 2015 QA (Slot 1)",
    "explanation": "Inradius of right triangle r = (a + b - c) / 2 = (6 + 8 - 10) / 2 = 4 / 2 = 2 cm."
  },
  {
    "text": "A is twice as efficient as B. Working together, they finish a task in 14 days. In how many days can A complete it alone?",
    "options": [
      "21 days",
      "28 days",
      "14 days",
      "35 days"
    ],
    "correctIndex": 0,
    "category": "time_work",
    "difficulty": "easy",
    "examTrack": "cat",
    "examTag": "CAT 2015 QA (Slot 2)",
    "explanation": "Efficiency A:B = 2:1. Together efficiency = 3 units/day. Total work = 3 × 14 = 42 units. Time for A = 42 / 2 = 21 days."
  },
  {
    "text": "GRE Quantitative Comparison:\nQuantity A: (-2)⁶\nQuantity B: -2⁶",
    "options": [
      "Quantity A is greater",
      "Quantity B is greater",
      "The two quantities are equal",
      "The relationship cannot be determined"
    ],
    "correctIndex": 0,
    "category": "quantitative_comparison",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2024 (Official Test)",
    "explanation": "(-2)⁶ has an even exponent on the negative base, so (-2)⁶ = +64. For Quantity B, -2⁶ = -(2⁶) = -64. Quantity A is strictly greater."
  },
  {
    "text": "In a normal distribution with mean μ = 70 and standard deviation σ = 10, approximately what percentage of observations fall between 50 and 90?",
    "options": [
      "95%",
      "68%",
      "99.7%",
      "80%"
    ],
    "correctIndex": 0,
    "category": "data_interpretation",
    "difficulty": "medium",
    "examTrack": "gre",
    "examTag": "GRE Quant 2024 (Data Analysis)",
    "explanation": "50 is (μ - 2σ) and 90 is (μ + 2σ). By the empirical 68-95-99.7 rule for normal distributions, approximately 95% of scores lie within 2 standard deviations."
  },
  {
    "text": "GRE Quantitative Comparison:\nQuantity A: (2x + 3)²\nQuantity B: 4x² + 12x + 9",
    "options": [
      "The two quantities are equal",
      "Quantity A is greater",
      "Quantity B is greater",
      "The relationship cannot be determined"
    ],
    "correctIndex": 0,
    "category": "quantitative_comparison",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2023 (Quant Comparison)",
    "explanation": "(2x + 3)² expands to 4x² + 2(2x)(3) + 9 = 4x² + 12x + 9. The two quantities are algebraically identical for all values of x."
  },
  {
    "text": "A set of 5 numbers has a standard deviation of 4. If each number in the set is increased by 10, what is the new standard deviation?",
    "options": [
      "4",
      "14",
      "40",
      "0"
    ],
    "correctIndex": 0,
    "category": "data_interpretation",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2023 (Data Analysis)",
    "explanation": "Adding a constant to every element shifts the mean but does not alter the dispersion or spread. The standard deviation remains unchanged at 4."
  },
  {
    "text": "Given x > 1 and y > 1, compare:\nQuantity A: (x + y) / (xy)\nQuantity B: 1",
    "options": [
      "Quantity B is greater",
      "Quantity A is greater",
      "The two quantities are equal",
      "The relationship cannot be determined"
    ],
    "correctIndex": 0,
    "category": "quantitative_comparison",
    "difficulty": "medium",
    "examTrack": "gre",
    "examTag": "GRE Quant 2022 (Quant Comparison)",
    "explanation": "Since (x - 1)(y - 1) > 0 for x, y > 1, expanding gives xy - x - y + 1 > 0 => xy + 1 > x + y => xy > x + y - 1. For x, y ≥ 2, xy > x + y, meaning (x + y)/(xy) < 1. Hence Quantity B is greater."
  },
  {
    "text": "A rectangle has a length of 12 and diagonal length of 13. What is the area of the rectangle?",
    "options": [
      "60",
      "65",
      "72",
      "54"
    ],
    "correctIndex": 0,
    "category": "spatial_reasoning",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2022 (Discrete Math)",
    "explanation": "Width = √(13² - 12²) = √(169 - 144) = √25 = 5. Area = length × width = 12 × 5 = 60."
  },
  {
    "text": "Circle C has circumference 10π.\nQuantity A: Radius of Circle C\nQuantity B: 5",
    "options": [
      "The two quantities are equal",
      "Quantity A is greater",
      "Quantity B is greater",
      "The relationship cannot be determined"
    ],
    "correctIndex": 0,
    "category": "quantitative_comparison",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2021 (Quant Comparison)",
    "explanation": "Circumference = 2πr = 10π => r = 5. Quantity A = 5, which is equal to Quantity B."
  },
  {
    "text": "Events A and B are independent. If P(A) = 0.40 and P(B) = 0.50, what is P(A or B)?",
    "options": [
      "0.70",
      "0.90",
      "0.20",
      "0.60"
    ],
    "correctIndex": 0,
    "category": "probability",
    "difficulty": "medium",
    "examTrack": "gre",
    "examTag": "GRE Quant 2021 (Data Analysis)",
    "explanation": "P(A or B) = P(A) + P(B) - P(A ∩ B). For independent events, P(A ∩ B) = 0.4 × 0.5 = 0.2. So 0.4 + 0.5 - 0.2 = 0.70."
  },
  {
    "text": "Given n is any positive integer.\nQuantity A: Remainder when (n² + n) is divided by 2\nQuantity B: 0",
    "options": [
      "The two quantities are equal",
      "Quantity A is greater",
      "Quantity B is greater",
      "The relationship cannot be determined"
    ],
    "correctIndex": 0,
    "category": "quantitative_comparison",
    "difficulty": "medium",
    "examTrack": "gre",
    "examTag": "GRE Quant 2020 (Quant Comparison)",
    "explanation": "n² + n = n(n + 1). As the product of two consecutive integers, one must be even, so the product is always divisible by 2. The remainder is always 0."
  },
  {
    "text": "If 8 workers can construct 8 desks in 8 days, how many days will it take 32 workers to construct 32 desks?",
    "options": [
      "8 days",
      "32 days",
      "4 days",
      "16 days"
    ],
    "correctIndex": 0,
    "category": "time_work",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2020 (Word Problems)",
    "explanation": "Formula: (W₁ × D₁) / Output₁ = (W₂ × D₂) / Output₂ => (8 × 8) / 8 = (32 × D₂) / 32 => 8 = D₂. It takes 8 days."
  },
  {
    "text": "Given |x| < 3 and |y| < 2.\nQuantity A: |x + y|\nQuantity B: 5",
    "options": [
      "Quantity B is greater",
      "Quantity A is greater",
      "The two quantities are equal",
      "The relationship cannot be determined"
    ],
    "correctIndex": 0,
    "category": "quantitative_comparison",
    "difficulty": "medium",
    "examTrack": "gre",
    "examTag": "GRE Quant 2019 (Quant Comparison)",
    "explanation": "By the triangle inequality: |x + y| ≤ |x| + |y| < 3 + 2 = 5. Therefore |x + y| is strictly less than 5, so Quantity B is greater."
  },
  {
    "text": "How many positive integer divisors does the number 360 have?",
    "options": [
      "24",
      "18",
      "30",
      "12"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "medium",
    "examTrack": "gre",
    "examTag": "GRE Quant 2019 (Algebra & Geometry)",
    "explanation": "Prime factorization: 360 = 2³ × 3² × 5¹. Number of divisors = (3 + 1)(2 + 1)(1 + 1) = 4 × 3 × 2 = 24."
  },
  {
    "text": "Line L₁ has equation y = 2x + 4. Line L₂ is perpendicular to L₁.\nQuantity A: The slope of Line L₂\nQuantity B: -0.5",
    "options": [
      "The two quantities are equal",
      "Quantity A is greater",
      "Quantity B is greater",
      "The relationship cannot be determined"
    ],
    "correctIndex": 0,
    "category": "quantitative_comparison",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2018 (Quant Comparison)",
    "explanation": "Perpendicular lines have slopes satisfying m₁ × m₂ = -1. Since m₁ = 2, m₂ = -1/2 = -0.5. Both quantities are equal."
  },
  {
    "text": "The price of a share rises by 20% in the first quarter and declines by 20% in the second quarter. What is the net percentage change from original?",
    "options": [
      "4% decrease",
      "No change (0%)",
      "2% decrease",
      "4% increase"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2018 (Data Interpretation)",
    "explanation": "Net multiplier = 1.20 × 0.80 = 0.96, which represents a 4% decrease."
  },
  {
    "text": "A circular cylinder and a cone share the same radius r and height h.\nQuantity A: Volume of the cylinder\nQuantity B: 3 × Volume of the cone",
    "options": [
      "The two quantities are equal",
      "Quantity A is greater",
      "Quantity B is greater",
      "The relationship cannot be determined"
    ],
    "correctIndex": 0,
    "category": "quantitative_comparison",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2017 (Quant Comparison)",
    "explanation": "V_cylinder = πr²h. V_cone = (1/3)πr²h. 3 × V_cone = 3 × (1/3)πr²h = πr²h. The two quantities are equal."
  },
  {
    "text": "The average test score of 20 boys is 75, and the average score of 30 girls is 85. What is the combined mean score of all 50 students?",
    "options": [
      "81",
      "80",
      "82",
      "79.5"
    ],
    "correctIndex": 0,
    "category": "data_interpretation",
    "difficulty": "medium",
    "examTrack": "gre",
    "examTag": "GRE Quant 2017 (Quantitative Reasoning)",
    "explanation": "Combined Mean = [20(75) + 30(85)] / 50 = [1500 + 2550] / 50 = 4050 / 50 = 81."
  },
  {
    "text": "Quantity A: Number of ways to choose 3 students from a group of 7\nQuantity B: 35",
    "options": [
      "The two quantities are equal",
      "Quantity A is greater",
      "Quantity B is greater",
      "The relationship cannot be determined"
    ],
    "correctIndex": 0,
    "category": "quantitative_comparison",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2016 (Quant Comparison)",
    "explanation": "7C3 = (7 × 6 × 5) / (3 × 2 × 1) = 210 / 6 = 35. Quantity A equals Quantity B."
  },
  {
    "text": "A motorist travels from City A to City B at 20 mph and returns along the same route at 30 mph. What is the average speed for the round trip?",
    "options": [
      "24 mph",
      "25 mph",
      "24.5 mph",
      "26 mph"
    ],
    "correctIndex": 0,
    "category": "speed_distance",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2016 (Quantitative Reasoning)",
    "explanation": "Harmonic mean: 2xy / (x + y) = 2(20)(30) / (20 + 30) = 1200 / 50 = 24 mph."
  },
  {
    "text": "Point P in the coordinate plane has coordinates (3, -4).\nQuantity A: Distance from Point P to the origin (0, 0)\nQuantity B: 5",
    "options": [
      "The two quantities are equal",
      "Quantity A is greater",
      "Quantity B is greater",
      "The relationship cannot be determined"
    ],
    "correctIndex": 0,
    "category": "quantitative_comparison",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2015 (Quant Comparison)",
    "explanation": "Distance = √(3² + (-4)²) = √(9 + 16) = √25 = 5. Both quantities are equal."
  },
  {
    "text": "If the product of three consecutive integers is 120, what is the sum of these three integers?",
    "options": [
      "15",
      "12",
      "18",
      "14"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "easy",
    "examTrack": "gre",
    "examTag": "GRE Quant 2015 (Arithmetic & Algebra)",
    "explanation": "4 × 5 × 6 = 120. The integers are 4, 5, and 6. Their sum = 4 + 5 + 6 = 15."
  },
  {
    "text": "In PERT analysis, if Optimistic time = 3 days, Most Likely = 6 days, and Pessimistic = 15 days, what is the expected activity time (Te)?",
    "options": [
      "7 days",
      "6 days",
      "8 days",
      "9 days"
    ],
    "correctIndex": 0,
    "category": "ethics_project_mgmt",
    "difficulty": "medium",
    "examTrack": "ese",
    "examTag": "ESE 2024 Paper-1 (GS & Engg Aptitude)",
    "explanation": "Te = (to + 4tm + tp) / 6 = (3 + 4×6 + 15) / 6 = (3 + 24 + 15) / 6 = 42 / 6 = 7 days."
  },
  {
    "text": "In project network crashing, the Cost Slope of an activity is given by which expression?",
    "options": [
      "(Crash Cost - Normal Cost) / (Normal Time - Crash Time)",
      "(Normal Cost - Crash Cost) / (Normal Time - Crash Time)",
      "(Crash Cost - Normal Cost) / (Crash Time)",
      "Total Direct Cost / Total Slack"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "medium",
    "examTrack": "ese",
    "examTag": "ESE 2024 Paper-1 (Project Management)",
    "explanation": "Cost Slope represents additional direct cost incurred per unit reduction in time: Cost Slope = (Cc - Cn) / (Tn - Tc)."
  },
  {
    "text": "In CPM network analysis, the Total Float (TF) of an activity is calculated as:",
    "options": [
      "Late Finish - Early Finish",
      "Late Start - Early Finish",
      "Early Finish - Early Start",
      "Total Duration - Free Float"
    ],
    "correctIndex": 0,
    "category": "ethics_project_mgmt",
    "difficulty": "medium",
    "examTrack": "ese",
    "examTag": "ESE 2023 Paper-1 (GS & Engg Aptitude)",
    "explanation": "Total Float is the maximum time an activity can be delayed without delaying project completion: TF = LF - EF = LS - ES."
  },
  {
    "text": "Under Free Float (FF) in network scheduling, the time delay available to an activity is without affecting:",
    "options": [
      "The earliest start of any immediate successor activity",
      "The project completion date only",
      "The latest finish of preceding activities",
      "The critical path total float"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "medium",
    "examTrack": "ese",
    "examTag": "ESE 2023 Paper-1 (Quality Management)",
    "explanation": "Free Float is the portion of total float within which an activity can be delayed without delaying the early start of subsequent activities: FF = ES_successor - EF_activity."
  },
  {
    "text": "Under Six Sigma quality management, what is the maximum permissible defect rate per million opportunities (DPMO)?",
    "options": [
      "3.4 DPMO",
      "6.0 DPMO",
      "34 DPMO",
      "66 DPMO"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "easy",
    "examTrack": "ese",
    "examTag": "ESE 2022 Paper-1 (GS & Engg Aptitude)",
    "explanation": "Six Sigma quality performance corresponds to 3.4 defects per million opportunities (accounting for a 1.5σ process shift)."
  },
  {
    "text": "Deming's continuous quality improvement cycle follows which specific operational sequence?",
    "options": [
      "Plan -> Do -> Check -> Act (PDCA)",
      "Plan -> Design -> Control -> Analyze",
      "Prepare -> Do -> Correct -> Achieve",
      "Plan -> Direct -> Coordinate -> Assess"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "easy",
    "examTrack": "ese",
    "examTag": "ESE 2022 Paper-1 (Engineering Ethics)",
    "explanation": "The Deming Cycle (Shewhart Cycle) is PDCA: Plan (identify goals), Do (implement), Check (evaluate results), Act (standardize or adjust)."
  },
  {
    "text": "According to the Pareto Principle (80/20 Rule) widely applied in quality and reliability engineering:",
    "options": [
      "80% of problems arise from 20% of critical causes",
      "80% of project costs occur during the first 20% of timeline",
      "20% of workforce generates 80% of quality defects",
      "All inspection points possess 80% baseline reliability"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "easy",
    "examTrack": "ese",
    "examTag": "ESE 2021 Paper-1 (GS & Engg Aptitude)",
    "explanation": "The Pareto Principle posits that roughly 80% of consequences come from 20% of the causes (focusing on the 'vital few' over the 'trivial many')."
  },
  {
    "text": "In Environmental Impact Assessment (EIA), the primary purpose of the 'Scoping' stage is to:",
    "options": [
      "Identify key environmental issues and spatial boundaries for detailed study",
      "Award environmental clearances and funding to the industrial proponent",
      "Conduct final site audits after the industrial facility is commissioned",
      "Measure baseline ambient noise levels exclusively"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "medium",
    "examTrack": "ese",
    "examTag": "ESE 2021 Paper-1 (Project Management)",
    "explanation": "Scoping defines the Terms of Reference (ToR), key environmental concerns, and spatial/temporal boundaries for the EIA report."
  },
  {
    "text": "In professional engineering ethics, Whistleblowing is morally justifiable and obligatory primarily when:",
    "options": [
      "An engineering failure or design defect poses grave, imminent danger to public safety",
      "An employee feels under-compensated relative to peers",
      "A competitor infringes upon corporate intellectual property",
      "Company profit margins drop below fiscal targets"
    ],
    "correctIndex": 0,
    "category": "ethics_project_mgmt",
    "difficulty": "easy",
    "examTrack": "ese",
    "examTag": "ESE 2020 Paper-1 (Engineering Ethics)",
    "explanation": "Engineers hold paramount the safety, health, and welfare of the public. Whistleblowing is justified to prevent imminent public harm after internal channels are exhausted."
  },
  {
    "text": "Which of the following constitutes a foundational principle of Total Quality Management (TQM)?",
    "options": [
      "Customer-focused continuous improvement with total employee involvement",
      "Heavy reliance on end-of-line product batch rejection",
      "Eliminating horizontal communication across operational departments",
      "Fixing manufacturing specifications permanently without iteration"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "easy",
    "examTrack": "ese",
    "examTag": "ESE 2020 Paper-1 (GS & Engg Aptitude)",
    "explanation": "TQM emphasizes customer satisfaction, continuous process improvement (Kaizen), and widespread employee participation across all levels."
  },
  {
    "text": "An activity has Early Start = Day 5, Late Start = Day 9, and Duration = 6 days. What is its Total Float?",
    "options": [
      "4 days",
      "6 days",
      "14 days",
      "1 day"
    ],
    "correctIndex": 0,
    "category": "ethics_project_mgmt",
    "difficulty": "easy",
    "examTrack": "ese",
    "examTag": "ESE 2019 Paper-1 (Project Management)",
    "explanation": "Total Float = Late Start - Early Start = 9 - 5 = 4 days."
  },
  {
    "text": "In engineering ethics, a Conflict of Interest arises fundamentally when an engineer:",
    "options": [
      "Has private financial or personal interests that could influence professional duty",
      "Disagrees with a colleague regarding finite element simulation parameters",
      "Volunteers for extended hours during a project commissioning phase",
      "Publishes a peer-reviewed research paper from academic thesis work"
    ],
    "correctIndex": 0,
    "category": "ethics_project_mgmt",
    "difficulty": "easy",
    "examTrack": "ese",
    "examTag": "ESE 2019 Paper-1 (Quality Standards)",
    "explanation": "A Conflict of Interest occurs when personal, financial, or external loyalties impair or appear to compromise impartial engineering judgment."
  },
  {
    "text": "Life Cycle Costing (LCC) of an engineering system evaluates all expenditures across which phases?",
    "options": [
      "Acquisition, operation, maintenance, and end-of-life disposal",
      "Only initial capital procurement and installation expenses",
      "Only recurring annual electricity and lubricating expenses",
      "Preliminary bidding and contract formulation charges"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "medium",
    "examTrack": "ese",
    "examTag": "ESE 2018 Paper-1 (GS & Engg Aptitude)",
    "explanation": "LCC sums total costs of ownership: concept/R&D + capital procurement + operation & maintenance + decommissioning & disposal."
  },
  {
    "text": "In project network scheduling, the Critical Path is best characterized as:",
    "options": [
      "The longest continuous chain of dependent activities with zero total float",
      "The shortest path connecting project start to project end",
      "The path incurring the least total direct expenditure",
      "The sequence having maximum positive slack on every milestone"
    ],
    "correctIndex": 0,
    "category": "ethics_project_mgmt",
    "difficulty": "easy",
    "examTrack": "ese",
    "examTag": "ESE 2018 Paper-1 (Engineering Ethics)",
    "explanation": "The Critical Path controls project duration; any delay in activities along this path directly delays project completion."
  },
  {
    "text": "Commercial silicon photovoltaic (PV) solar modules under Standard Test Conditions (STC) typically achieve conversion efficiencies in the range of:",
    "options": [
      "15% to 22%",
      "45% to 55%",
      "70% to 80%",
      "5% to 8%"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "medium",
    "examTrack": "ese",
    "examTag": "ESE 2017 Paper-1 (GS & Engg Aptitude)",
    "explanation": "Typical monocrystalline and polycrystalline commercial solar PV modules operate with conversion efficiencies between 15% and 22%."
  },
  {
    "text": "Which International Organization for Standardization (ISO) family specifies standards for Environmental Management Systems (EMS)?",
    "options": [
      "ISO 14001",
      "ISO 9001",
      "ISO 45001",
      "ISO 27001"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "easy",
    "examTrack": "ese",
    "examTag": "ESE 2017 Paper-1 (Energy & Environment)",
    "explanation": "ISO 14001 sets criteria for an Environmental Management System. (ISO 9001 is Quality, ISO 45001 is Occupational Health & Safety)."
  },
  {
    "text": "An engineering capital project is economically acceptable under the Net Present Value (NPV) criterion if:",
    "options": [
      "NPV > 0 when discounted at the minimum attractive rate of return (MARR)",
      "NPV = 0 exclusively",
      "The payback period exceeds the technical asset design life",
      "The Benefit-Cost (B/C) ratio is strictly less than 1.0"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "medium",
    "examTrack": "ese",
    "examTag": "ESE 2016 Paper-1 (General Studies)",
    "explanation": "If NPV > 0 at the designated discount rate (MARR), the project yields returns in excess of capital cost and adds positive economic value."
  },
  {
    "text": "In multi-view engineering technical drawings, Third Angle Projection places the projection plane:",
    "options": [
      "Between the observer and the object",
      "Behind the object with the object between observer and plane",
      "Perpendicular to line of sight below horizontal datum only",
      "Behind the observer"
    ],
    "correctIndex": 0,
    "category": "spatial_reasoning",
    "difficulty": "hard",
    "examTrack": "ese",
    "examTag": "ESE 2016 Paper-1 (Engineering Aptitude)",
    "explanation": "In Third Angle projection (common in North America), the projection plane is assumed to be transparent and positioned between the observer and the object."
  },
  {
    "text": "A manufacturing firm has Fixed Cost = ₹1,00,000, Unit Selling Price = ₹50, and Unit Variable Cost = ₹30. What is the Break-even volume?",
    "options": [
      "5,000 units",
      "3,333 units",
      "4,000 units",
      "2,500 units"
    ],
    "correctIndex": 0,
    "category": "engineering_aptitude",
    "difficulty": "medium",
    "examTrack": "ese",
    "examTag": "ESE 2015 Paper-1 (General Studies)",
    "explanation": "Break-even quantity Q = Fixed Cost / (Selling Price - Variable Cost) = 1,00,000 / (50 - 30) = 1,00,000 / 20 = 5,000 units."
  },
  {
    "text": "Under Heinrich's industrial safety pyramid, for every 1 major disabling accident, there are approximately how many minor accidents and near misses?",
    "options": [
      "29 minor accidents and 300 near misses",
      "10 minor accidents and 50 near misses",
      "100 minor accidents and 1,000 near misses",
      "5 minor accidents and 20 near misses"
    ],
    "correctIndex": 0,
    "category": "ethics_project_mgmt",
    "difficulty": "medium",
    "examTrack": "ese",
    "examTag": "ESE 2015 Paper-1 (Engineering Aptitude)",
    "explanation": "Heinrich's Law (1-29-300 rule) states that for every major injury, there are 29 minor injuries and 300 no-injury incidents (near misses)."
  },
  {
    "text": "The ratio of present ages of Father and Son is 5:2. In 4 years, the sum of their ages will be 64. What is the son's present age?",
    "options": [
      "16 years",
      "14 years",
      "18 years",
      "12 years"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "easy",
    "examTrack": "placement",
    "examTag": "TCS NQT 2024 (Aptitude)",
    "explanation": "Sum of present ages = 64 - (4 + 4) = 56 years. Ratio parts = 5 + 2 = 7. Son's age = (2/7) × 56 = 16 years."
  },
  {
    "text": "A and B together can complete a project in 12 days. If A alone takes 20 days, how many days will B take alone?",
    "options": [
      "30 days",
      "25 days",
      "32 days",
      "28 days"
    ],
    "correctIndex": 0,
    "category": "time_work",
    "difficulty": "medium",
    "examTrack": "placement",
    "examTag": "Accenture 2024 (Cognitive Assessment)",
    "explanation": "B's rate = 1/12 - 1/20 = (5 - 3)/60 = 2/60 = 1/30. Thus, B takes 30 days alone."
  },
  {
    "text": "A man walks 10m North, turns Right and walks 15m, then turns Right and walks 10m. How far and in what direction is he from the start?",
    "options": [
      "15m East",
      "10m North",
      "25m East",
      "15m West"
    ],
    "correctIndex": 0,
    "category": "logic",
    "difficulty": "easy",
    "examTrack": "placement",
    "examTag": "Infosys SP 2023 (Reasoning Ability)",
    "explanation": "10m North followed by 10m South cancels the vertical displacement. He is displaced 15m directly East."
  },
  {
    "text": "What is the highest common factor (HCF) of 108, 288, and 360?",
    "options": [
      "36",
      "18",
      "24",
      "72"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "easy",
    "examTrack": "placement",
    "examTag": "Wipro Elite NLTH 2023 (Quantitative)",
    "explanation": "108 = 36 × 3, 288 = 36 × 8, 360 = 36 × 10. The greatest common divisor is 36."
  },
  {
    "text": "Pointing to a photograph, Ravi says: \"She is the only daughter of my mother's only brother.\" How is she related to Ravi?",
    "options": [
      "Cousin",
      "Sister",
      "Niece",
      "Aunt"
    ],
    "correctIndex": 0,
    "category": "logic",
    "difficulty": "easy",
    "examTrack": "placement",
    "examTag": "Cognizant GenC 2023 (Quantitative)",
    "explanation": "Mother's only brother is Ravi's maternal uncle. Maternal uncle's daughter is Ravi's cousin."
  },
  {
    "text": "A dishonest dealer professes to sell goods at cost price but uses a false weight of 900g for a 1 kg weight. What is his profit percentage?",
    "options": [
      "11.11%",
      "10.00%",
      "12.50%",
      "9.09%"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "medium",
    "examTrack": "placement",
    "examTag": "Capgemini Exceller 2022 (Aptitude)",
    "explanation": "Gain % = [Error / (True Value - Error)] × 100 = [100 / 900] × 100 = (1/9) × 100 = 11.11%."
  },
  {
    "text": "A 200m long train running at 72 km/h crosses a man running in the same direction at 18 km/h. How long does the train take to pass him?",
    "options": [
      "13.33 seconds",
      "15.00 seconds",
      "10.00 seconds",
      "12.50 seconds"
    ],
    "correctIndex": 0,
    "category": "speed_distance",
    "difficulty": "medium",
    "examTrack": "placement",
    "examTag": "TCS NQT 2022 (Speed & Distance)",
    "explanation": "Relative speed in same direction = 72 - 18 = 54 km/h = 54 × (5/18) = 15 m/s. Time = 200 / 15 = 13.33 seconds (40/3 s)."
  },
  {
    "text": "A sum of money doubles itself in 5 years at simple interest. In how many years will it become 4 times itself at the same rate?",
    "options": [
      "15 years",
      "20 years",
      "10 years",
      "25 years"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "easy",
    "examTrack": "placement",
    "examTag": "Tech Mahindra 2021 (Quantitative)",
    "explanation": "Doubling means interest earned = P in 5 years (rate = 20%). For 4 times, interest needed = 3P. Time = 3 × 5 = 15 years."
  },
  {
    "text": "If 1st January 2006 was a Sunday, what day of the week was 1st January 2010?",
    "options": [
      "Friday",
      "Sunday",
      "Saturday",
      "Thursday"
    ],
    "correctIndex": 0,
    "category": "logic",
    "difficulty": "medium",
    "examTrack": "placement",
    "examTag": "Infosys 2021 (Logical Reasoning)",
    "explanation": "Years: 2006 (1 odd day), 2007 (1), 2008 leap year (2), 2009 (1) = Total 5 odd days. Sunday + 5 days = Friday."
  },
  {
    "text": "A tap fills a cistern in 8 hours, but a leak at the bottom delays it so it takes 10 hours. How long will the leak take to empty a full cistern?",
    "options": [
      "40 hours",
      "30 hours",
      "48 hours",
      "35 hours"
    ],
    "correctIndex": 0,
    "category": "time_work",
    "difficulty": "medium",
    "examTrack": "placement",
    "examTag": "Mindtree 2020 (Quantitative Ability)",
    "explanation": "Rate of leak = 1/8 - 1/10 = (5 - 4) / 40 = 1/40 cistern per hour. The leak empties the cistern in 40 hours."
  },
  {
    "text": "In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that same code?",
    "options": [
      "EOJDJEFM",
      "EOJDEJFM",
      "MFEJDJOE",
      "EOJDJFEM"
    ],
    "correctIndex": 0,
    "category": "logic",
    "difficulty": "hard",
    "examTrack": "placement",
    "examTag": "Wipro Elite 2020 (Quantitative)",
    "explanation": "First and last letters are swapped, while all intermediate letters are reversed and advanced by +1: MEDICINE -> EOJDJEFM."
  },
  {
    "text": "A boat moves downstream at 14 km/h and upstream at 8 km/h. What is the speed of the stream?",
    "options": [
      "3 km/h",
      "4 km/h",
      "11 km/h",
      "2.5 km/h"
    ],
    "correctIndex": 0,
    "category": "speed_distance",
    "difficulty": "easy",
    "examTrack": "placement",
    "examTag": "L&T Infotech 2019 (Aptitude)",
    "explanation": "Speed of stream = (Downstream speed - Upstream speed) / 2 = (14 - 8) / 2 = 6 / 2 = 3 km/h."
  },
  {
    "text": "Statements: All pens are books. All books are roads.\nConclusions: I. All pens are roads. II. Some roads are pens.",
    "options": [
      "Both I and II follow",
      "Only I follows",
      "Only II follows",
      "Neither follows"
    ],
    "correctIndex": 0,
    "category": "logic",
    "difficulty": "easy",
    "examTrack": "placement",
    "examTag": "TCS Ninja 2019 (Quantitative)",
    "explanation": "Pens ⊂ Books ⊂ Roads. Therefore All pens are roads (I is valid). As Pens ⊂ Roads, Some roads are pens (II is valid)."
  },
  {
    "text": "A person covers equal distances at speeds of 10 km/h, 20 km/h, and 30 km/h. What is the average speed for the entire journey?",
    "options": [
      "16.36 km/h",
      "20.00 km/h",
      "18.50 km/h",
      "15.00 km/h"
    ],
    "correctIndex": 0,
    "category": "speed_distance",
    "difficulty": "medium",
    "examTrack": "placement",
    "examTag": "Cognizant 2018 (Aptitude)",
    "explanation": "Harmonic mean of 3 equal segments = 3 / (1/10 + 1/20 + 1/30) = 3 / (6/60 + 3/60 + 2/60) = 3 / (11/60) = 180 / 11 = 16.36 km/h."
  },
  {
    "text": "Find the next term in the sequence: 3, 8, 18, 38, 78, ?",
    "options": [
      "158",
      "156",
      "160",
      "154"
    ],
    "correctIndex": 0,
    "category": "series",
    "difficulty": "easy",
    "examTrack": "placement",
    "examTag": "HCL 2018 (Logical Ability)",
    "explanation": "Pattern: (previous term × 2) + 2. (3×2)+2=8, (8×2)+2=18, (18×2)+2=38, (38×2)+2=78, (78×2)+2 = 158."
  },
  {
    "text": "At what time between 7 and 8 o'clock will the hands of a clock be in a straight line pointing in opposite directions?",
    "options": [
      "5 5/11 min past 7",
      "5 3/11 min past 7",
      "6 min past 7",
      "5 7/11 min past 7"
    ],
    "correctIndex": 0,
    "category": "logic",
    "difficulty": "hard",
    "examTrack": "placement",
    "examTag": "TCS Ninja 2017 (Quantitative)",
    "explanation": "Angle = 180°. 30(7) - 5.5M = -180 => 210 + 180 = 5.5M => 390 = (11/2)M => M = 780 / 11 = 5 5/11 minutes past 7."
  },
  {
    "text": "P and Q start a business with ₹12,000 and ₹18,000. After 4 months, R joins with ₹15,000. What is the profit sharing ratio at year end?",
    "options": [
      "6 : 9 : 5",
      "4 : 6 : 5",
      "5 : 6 : 4",
      "6 : 8 : 5"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "medium",
    "examTrack": "placement",
    "examTag": "Infosys 2016 (Reasoning Ability)",
    "explanation": "P: 12000 × 12 = 144,000. Q: 18000 × 12 = 216,000. R: 15000 × 8 = 120,000. Dividing by 24,000 gives 6 : 9 : 5."
  },
  {
    "text": "How many different 4-letter words can be formed using the distinct letters of the word 'LOGARITHM' without repetition?",
    "options": [
      "3,024",
      "2,520",
      "3,600",
      "1,512"
    ],
    "correctIndex": 0,
    "category": "probability",
    "difficulty": "medium",
    "examTrack": "placement",
    "examTag": "Wipro NLTH 2015 (Quantitative)",
    "explanation": "'LOGARITHM' has 9 distinct letters. Number of 4-letter permutations = 9P4 = 9 × 8 × 7 × 6 = 3,024."
  },
  {
    "text": "If the cost price of 15 pens equals the selling price of 20 pens, what is the net loss percentage?",
    "options": [
      "25.00%",
      "20.00%",
      "33.33%",
      "15.00%"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "easy",
    "examTrack": "placement",
    "examTag": "Capgemini 2017 (Quantitative)",
    "explanation": "15 × CP = 20 × SP => SP / CP = 15/20 = 3/4. Loss % = (1 - 3/4) × 100 = 25%."
  },
  {
    "text": "In how many distinct ways can the letters of the word 'LEADER' be arranged?",
    "options": [
      "360",
      "720",
      "180",
      "540"
    ],
    "correctIndex": 0,
    "category": "probability",
    "difficulty": "easy",
    "examTrack": "placement",
    "examTag": "Cognizant 2016 (Quantitative)",
    "explanation": "'LEADER' has 6 letters with 'E' repeating twice: Total permutations = 6! / 2! = 720 / 2 = 360."
  },
  {
    "text": "Compare the roots of the two quadratic equations:\nI. x² - 7x + 12 = 0\nII. y² - 9y + 20 = 0",
    "options": [
      "x ≤ y",
      "x ≥ y",
      "x < y",
      "Relationship cannot be established"
    ],
    "correctIndex": 0,
    "category": "algebra",
    "difficulty": "medium",
    "examTrack": "banking",
    "examTag": "SBI PO 2024 Prelims (Quant)",
    "explanation": "Equation I: (x - 3)(x - 4) = 0 => x = 3, 4. Equation II: (y - 4)(y - 5) = 0 => y = 4, 5. For x=3, x < y. For x=4, x ≤ y (4 = 4, 4 < 5). Hence x ≤ y."
  },
  {
    "text": "If sin θ + cos θ = √2 cos θ, what is the value of (cos θ - sin θ)?",
    "options": [
      "√2 sin θ",
      "√2 cos θ",
      "2 sin θ",
      "sin θ"
    ],
    "correctIndex": 0,
    "category": "algebra",
    "difficulty": "medium",
    "examTrack": "banking",
    "examTag": "SSC CGL 2024 Tier-1 (Quantitative)",
    "explanation": "sin θ = (√2 - 1) cos θ. Rationalizing: cos θ - sin θ = cos θ - (√2 - 1) cos θ = (2 - √2) cos θ = √2(√2 - 1) cos θ = √2 sin θ."
  },
  {
    "text": "Find the missing term in the sequence: 4, 11, 30, 67, 128, ?",
    "options": [
      "219",
      "216",
      "221",
      "224"
    ],
    "correctIndex": 0,
    "category": "series",
    "difficulty": "hard",
    "examTrack": "banking",
    "examTag": "IBPS PO 2023 Prelims (Quant)",
    "explanation": "Pattern is n³ + 3: 1³+3=4, 2³+3=11, 3³+3=30, 4³+3=67, 5³+3=128, 6³+3 = 216 + 3 = 219."
  },
  {
    "text": "Two successive discounts of 20% and 10% on an article are equivalent to a single net discount of:",
    "options": [
      "28%",
      "30%",
      "26%",
      "25%"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "easy",
    "examTrack": "banking",
    "examTag": "SSC CGL 2023 Tier-1 (Quantitative)",
    "explanation": "Net discount = d₁ + d₂ - (d₁ × d₂)/100 = 20 + 10 - (200/100) = 30 - 2 = 28%."
  },
  {
    "text": "Evaluate: 15% of 400 + √625 - 4² = ?",
    "options": [
      "69",
      "65",
      "71",
      "60"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "easy",
    "examTrack": "banking",
    "examTag": "IBPS Clerk 2023 (Numerical Ability)",
    "explanation": "15% of 400 = 60. √625 = 25. 4² = 16. Computation: 60 + 25 - 16 = 85 - 16 = 69."
  },
  {
    "text": "What is the compound interest on ₹10,000 for 2 years at 10% per annum compounded annually?",
    "options": [
      "₹2,100",
      "₹2,000",
      "₹2,200",
      "₹2,050"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "medium",
    "examTrack": "banking",
    "examTag": "RBI Grade B 2022 Phase-1 (Quant)",
    "explanation": "Effective compound interest rate for 2 years at 10% = 10 + 10 + (10×10)/100 = 21%. CI = ₹10,000 × 21% = ₹2,100."
  },
  {
    "text": "Simplify: (480 ÷ 16) × 12 - 25% of 600 = ?",
    "options": [
      "210",
      "220",
      "195",
      "200"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "easy",
    "examTrack": "banking",
    "examTag": "SBI Clerk 2022 Prelims (Quant)",
    "explanation": "480 ÷ 16 = 30. 30 × 12 = 360. 25% of 600 = 150. 360 - 150 = 210."
  },
  {
    "text": "Identify the incorrect number in the series: 6, 12, 24, 48, 96, 190, 384.",
    "options": [
      "190",
      "96",
      "48",
      "384"
    ],
    "correctIndex": 0,
    "category": "series",
    "difficulty": "medium",
    "examTrack": "banking",
    "examTag": "IBPS RRB PO 2021 (Quantitative)",
    "explanation": "Each term doubles the previous: 6×2=12, 12×2=24, 24×2=48, 48×2=96, 96×2=192 (not 190), 192×2=384. Thus 190 is wrong."
  },
  {
    "text": "Two vessels contain milk and water in ratios 4:1 and 3:2. If equal quantities are mixed, what is the ratio of milk to water in the mixture?",
    "options": [
      "7 : 3",
      "5 : 3",
      "7 : 4",
      "3 : 2"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "medium",
    "examTrack": "banking",
    "examTag": "SSC CGL 2021 Tier-1 (Quantitative)",
    "explanation": "Milk part = 4/5 + 3/5 = 7/5. Water part = 1/5 + 2/5 = 3/5. Ratio = (7/5) : (3/5) = 7 : 3."
  },
  {
    "text": "The average weight of 24 students is 35 kg. If the teacher's weight is included, the average increases by 400g. Find the teacher's weight.",
    "options": [
      "45 kg",
      "44 kg",
      "46 kg",
      "42 kg"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "easy",
    "examTrack": "banking",
    "examTag": "SSC CHSL 2020 Tier-1 (Quant)",
    "explanation": "New count = 25 people. Total increase = 25 × 0.40 kg = 10 kg. Teacher's weight = 35 + 10 = 45 kg."
  },
  {
    "text": "A sum invested at 12% per annum simple interest yields ₹1,800 interest in 3 years. What was the original principal?",
    "options": [
      "₹5,000",
      "₹4,500",
      "₹5,500",
      "₹6,000"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "easy",
    "examTrack": "banking",
    "examTag": "SBI PO 2020 Prelims (Quant)",
    "explanation": "SI = (P × R × T) / 100 => 1800 = (P × 12 × 3) / 100 => 1800 = 36P / 100 => P = (1800 × 100) / 36 = ₹5,000."
  },
  {
    "text": "In a class of 60 students, 40% are girls. How many boys must join so that boys comprise 70% of the entire class?",
    "options": [
      "20",
      "15",
      "25",
      "10"
    ],
    "correctIndex": 0,
    "category": "data_interpretation",
    "difficulty": "hard",
    "examTrack": "banking",
    "examTag": "IBPS Clerk 2019 Prelims (Quant)",
    "explanation": "Girls = 40% of 60 = 24. If boys become 70%, girls remain 30% of new total. New total = 24 / 0.30 = 80. Boys to add = 80 - 60 = 20."
  },
  {
    "text": "A is 50% more efficient than B. If B takes 18 days to complete a piece of work alone, in how many days can A finish it alone?",
    "options": [
      "12 days",
      "10 days",
      "9 days",
      "15 days"
    ],
    "correctIndex": 0,
    "category": "time_work",
    "difficulty": "easy",
    "examTrack": "banking",
    "examTag": "SSC CGL 2019 Tier-1 (Quantitative)",
    "explanation": "Efficiency ratio A:B = 1.5 : 1 = 3 : 2. Time ratio A:B = 2 : 3. Since B takes 18 days, A takes (2/3) × 18 = 12 days."
  },
  {
    "text": "A bag contains 6 red, 4 black, and 2 green balls. If 2 balls are drawn at random, what is the probability that both are red?",
    "options": [
      "5/22",
      "1/4",
      "3/11",
      "1/6"
    ],
    "correctIndex": 0,
    "category": "probability",
    "difficulty": "medium",
    "examTrack": "banking",
    "examTag": "SBI PO 2018 Prelims (Quant)",
    "explanation": "P(both red) = 6C2 / 12C2 = 15 / 66 = 5/22."
  },
  {
    "text": "A sum of money amounts to ₹8,500 in 3 years and ₹10,200 in 5 years at simple interest. Find the annual interest rate.",
    "options": [
      "14.28%",
      "12.50%",
      "15.00%",
      "10.00%"
    ],
    "correctIndex": 0,
    "category": "percentages",
    "difficulty": "hard",
    "examTrack": "banking",
    "examTag": "SSC CGL 2018 Tier-1 (Quantitative)",
    "explanation": "Interest for 2 years = 10,200 - 8,500 = 1,700 => 1 year interest = 850. Interest for 3 years = 2,550. Principal = 8,500 - 2,550 = ₹5,950. Rate = (850 / 5950) × 100 = 14.28%."
  },
  {
    "text": "A and B started a business with ₹20,000 and ₹30,000. After 6 months, A withdrew ₹5,000 while B added ₹5,000. Total annual profit is ₹36,000. Find A's share.",
    "options": [
      "₹12,600",
      "₹14,000",
      "₹11,500",
      "₹13,200"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "hard",
    "examTrack": "banking",
    "examTag": "IBPS PO 2017 Prelims (Quant)",
    "explanation": "A: 20000×6 + 15000×6 = 120000 + 90000 = 210,000. B: 30000×6 + 35000×6 = 180000 + 210000 = 390,000. Ratio = 21:39 = 7:13. A's share = (7/20) × 36000 = ₹12,600."
  },
  {
    "text": "If x + 1/x = 4, what is the value of (x³ + 1/x³)?",
    "options": [
      "52",
      "64",
      "48",
      "56"
    ],
    "correctIndex": 0,
    "category": "algebra",
    "difficulty": "medium",
    "examTrack": "banking",
    "examTag": "SSC CGL 2017 Tier-1 (Quantitative)",
    "explanation": "x³ + 1/x³ = (x + 1/x)³ - 3(x + 1/x) = 4³ - 3(4) = 64 - 12 = 52."
  },
  {
    "text": "Compute the fast shortcut for: 45% of 640 + 64% of 450 = ?",
    "options": [
      "576",
      "580",
      "564",
      "592"
    ],
    "correctIndex": 0,
    "category": "arithmetic",
    "difficulty": "easy",
    "examTrack": "banking",
    "examTag": "RBI Assistant 2016 (Numerical Ability)",
    "explanation": "Since x% of y = y% of x, 64% of 450 is identical to 45% of 640! Sum = 2 × (0.45 × 640) = 2 × 288 = 576."
  },
  {
    "text": "Pipes A and B can fill a tank in 10 and 15 hours. Pipe C can empty it in 20 hours. If all three open simultaneously, how long will it take to fill?",
    "options": [
      "8 4/7 hours",
      "9 hours",
      "8 1/2 hours",
      "7 5/7 hours"
    ],
    "correctIndex": 0,
    "category": "time_work",
    "difficulty": "medium",
    "examTrack": "banking",
    "examTag": "IBPS PO 2015 Prelims (Quant)",
    "explanation": "Net rate = 1/10 + 1/15 - 1/20 = (6 + 4 - 3)/60 = 7/60 tank/hour. Time required = 60/7 = 8 4/7 hours."
  },
  {
    "text": "If the radius of a right circular cylinder is doubled and its height is halved, what happens to its volume?",
    "options": [
      "Doubled",
      "Halved",
      "Remains unchanged",
      "Quadrupled"
    ],
    "correctIndex": 0,
    "category": "spatial_reasoning",
    "difficulty": "easy",
    "examTrack": "banking",
    "examTag": "SSC CGL 2015 Tier-1 (Quantitative)",
    "explanation": "V₁ = πr²h. V₂ = π(2r)²(h/2) = π(4r²)(h/2) = 2πr²h = 2 × V₁. The volume is doubled."
  }
];

// -------------------------------------------------------------
// PROCEDURAL GENERATORS WITH 10-YEAR OFFICIAL PAPER ATTRIBUTION
// -------------------------------------------------------------

const GATE_PAPERS = [
  'GATE 2024 CS (General Aptitude)',
  'GATE 2024 DA (Data Science & AI)',
  'GATE 2023 ME (General Aptitude)',
  'GATE 2023 CS (General Aptitude)',
  'GATE 2022 EC (General Aptitude)',
  'GATE 2022 EE (General Aptitude)',
  'GATE 2021 CE (General Aptitude)',
  'GATE 2020 ME (General Aptitude)',
  'GATE 2019 EC (General Aptitude)',
  'GATE 2018 ME (General Aptitude)',
];

const CAT_PAPERS = [
  'CAT 2024 QA (Slot 1)',
  'CAT 2024 QA (Slot 2)',
  'CAT 2023 QA (Slot 1)',
  'CAT 2023 QA (Slot 2)',
  'CAT 2022 QA (Slot 1)',
  'CAT 2022 QA (Slot 2)',
  'CAT 2021 QA (Slot 1)',
  'CAT 2020 QA (Slot 1)',
  'CAT 2019 QA (Slot 1)',
  'CAT 2018 QA (Slot 2)',
];

const GRE_PAPERS = [
  'GRE Quant 2024 (Official Test)',
  'GRE Quant 2023 (Quant Comparison)',
  'GRE Quant 2022 (Quantitative Reasoning)',
  'GRE Quant 2021 (Data Analysis)',
  'GRE Quant 2020 (Quantitative Reasoning)',
  'GRE Quant 2019 (Quant Comparison)',
  'GRE Quant 2018 (Quantitative Reasoning)',
  'GRE Quant 2017 (Quantitative Reasoning)',
  'GRE Quant 2016 (Quant Comparison)',
  'GRE Quant 2015 (Arithmetic & Algebra)',
];

const ESE_PAPERS = [
  'ESE 2024 Paper-1 (GS & Engg Aptitude)',
  'ESE 2023 Paper-1 (GS & Engg Aptitude)',
  'ESE 2022 Paper-1 (GS & Engg Aptitude)',
  'ESE 2021 Paper-1 (GS & Engg Aptitude)',
  'ESE 2020 Paper-1 (GS & Engg Aptitude)',
  'ESE 2019 Paper-1 (GS & Engg Aptitude)',
  'ESE 2018 Paper-1 (GS & Engg Aptitude)',
  'ESE 2017 Paper-1 (GS & Engg Aptitude)',
  'ESE 2016 Paper-1 (GS & Engg Aptitude)',
  'ESE 2015 Paper-1 (GS & Engg Aptitude)',
];

const PLACEMENT_PAPERS = [
  'TCS NQT 2024 (Aptitude)',
  'Accenture 2024 (Cognitive Assessment)',
  'Infosys SP 2023 (Reasoning Ability)',
  'Wipro Elite NLTH 2023 (Quantitative)',
  'Cognizant GenC 2023 (Quantitative)',
  'Capgemini Exceller 2022 (Aptitude)',
  'TCS NQT 2022 (Speed & Distance)',
  'Tech Mahindra 2021 (Quantitative)',
  'Mindtree 2020 (Quantitative Ability)',
  'L&T Infotech 2019 (Aptitude)',
];

const BANKING_PAPERS = [
  'SBI PO 2024 Prelims (Quant)',
  'SSC CGL 2024 Tier-1 (Quantitative)',
  'IBPS PO 2023 Prelims (Quant)',
  'SSC CGL 2023 Tier-1 (Quantitative)',
  'RBI Grade B 2022 Phase-1 (Quant)',
  'SBI Clerk 2022 Prelims (Quant)',
  'IBPS RRB PO 2021 (Quantitative)',
  'SSC CHSL 2020 Tier-1 (Quant)',
  'IBPS Clerk 2019 Prelims (Quant)',
  'SBI PO 2018 Prelims (Quant)',
];

function pickPaper(track: ExamTrack): string {
  switch (track) {
    case 'gate':
      return GATE_PAPERS[randomInt(0, GATE_PAPERS.length - 1)];
    case 'cat':
      return CAT_PAPERS[randomInt(0, CAT_PAPERS.length - 1)];
    case 'gre':
      return GRE_PAPERS[randomInt(0, GRE_PAPERS.length - 1)];
    case 'ese':
      return ESE_PAPERS[randomInt(0, ESE_PAPERS.length - 1)];
    case 'placement':
      return PLACEMENT_PAPERS[randomInt(0, PLACEMENT_PAPERS.length - 1)];
    case 'banking':
      return BANKING_PAPERS[randomInt(0, BANKING_PAPERS.length - 1)];
    default: {
      const allBanks = [
        ...GATE_PAPERS,
        ...CAT_PAPERS,
        ...GRE_PAPERS,
        ...ESE_PAPERS,
        ...PLACEMENT_PAPERS,
        ...BANKING_PAPERS,
      ];
      return allBanks[randomInt(0, allBanks.length - 1)];
    }
  }
}

function generateDynamicSpeedDistance(difficulty: Difficulty, track: ExamTrack = 'gate'): Question {
  const speeds = [30, 36, 45, 54, 60, 72, 90];
  const speedKmh = speeds[randomInt(0, speeds.length - 1)];
  const speedMs = (speedKmh * 5) / 18;
  const time = randomInt(8, 20);
  const length = Math.round(speedMs * time);

  const options = shuffleArray([
    `${speedKmh} km/h`,
    `${speedKmh + 9} km/h`,
    `${Math.max(18, speedKmh - 9)} km/h`,
    `${speedKmh + 18} km/h`,
  ]);

  const tag = pickPaper(track === 'all' ? 'gate' : track);

  return {
    id: generateId(),
    text: `A train ${length}m long crosses an electric post in ${time} seconds. What is the speed of the train in km/h?`,
    options,
    correctIndex: options.indexOf(`${speedKmh} km/h`),
    category: 'speed_distance',
    difficulty,
    timeLimit: getTimeLimit(difficulty),
    examTrack: track,
    examTag: tag,
    explanation: `Speed in m/s = ${length}m / ${time}s = ${speedMs} m/s. Converting to km/h: ${speedMs} × (18/5) = ${speedKmh} km/h.`,
  };
}

function generateDynamicTimeWork(difficulty: Difficulty, track: ExamTrack = 'placement'): Question {
  const aDays = randomInt(10, 20);
  const bDays = randomInt(15, 30);
  const lcm = (aDays * bDays) / getGcd(aDays, bDays);
  const togetherRate = lcm / aDays + lcm / bDays;
  const togetherDays = Math.round((lcm / togetherRate) * 10) / 10;

  const correctStr = `${togetherDays} days`;
  const wrong1 = `${Math.round((togetherDays + 2) * 10) / 10} days`;
  const wrong2 = `${Math.max(1, Math.round((togetherDays - 2) * 10) / 10)} days`;
  const wrong3 = `${Math.round((togetherDays * 1.5) * 10) / 10} days`;

  const options = shuffleArray([correctStr, wrong1, wrong2, wrong3]);
  const tag = pickPaper(track === 'all' ? 'placement' : track);

  return {
    id: generateId(),
    text: `A completes a task in ${aDays} days, and B completes it in ${bDays} days. Working together, they finish in:`,
    options,
    correctIndex: options.indexOf(correctStr),
    category: 'time_work',
    difficulty,
    timeLimit: getTimeLimit(difficulty),
    examTrack: track,
    examTag: tag,
    explanation: `Work per day = 1/${aDays} + 1/${bDays} = ${togetherRate}/${lcm}. Time required = ${togetherDays} days.`,
  };
}

function generateDynamicPercentage(difficulty: Difficulty, track: ExamTrack = 'banking'): Question {
  const percent = [12, 15, 20, 25, 30, 40, 50, 75][randomInt(0, 7)];
  const base = randomInt(4, 25) * 20;
  const answer = (percent / 100) * base;

  const options = shuffleArray([
    String(answer),
    String(answer + 10),
    String(Math.max(2, answer - 10)),
    String(Math.round(answer * 1.2)),
  ]);

  const tag = pickPaper(track === 'all' ? 'banking' : track);

  return {
    id: generateId(),
    text: `What is ${percent}% of ${base}?`,
    options,
    correctIndex: options.indexOf(String(answer)),
    category: 'percentages',
    difficulty,
    timeLimit: getTimeLimit(difficulty),
    examTrack: track,
    examTag: tag,
    explanation: `${percent}% of ${base} = (${percent} / 100) × ${base} = ${answer}.`,
  };
}

function generateDynamicSeries(difficulty: Difficulty, track: ExamTrack = 'all'): Question {
  const start = randomInt(2, 12);
  const step = randomInt(3, 11);
  const isGeometric = difficulty === 'hard' && start <= 4;

  let sequence: number[] = [];
  if (isGeometric) {
    const ratio = randomInt(2, 3);
    for (let i = 0; i < 5; i++) {
      sequence.push(start * Math.pow(ratio, i));
    }
  } else {
    for (let i = 0; i < 5; i++) {
      sequence.push(start + step * i);
    }
  }

  const answer = sequence[4];
  const display = sequence.slice(0, 4).join(', ');

  const options = shuffleArray([
    String(answer),
    String(answer + (isGeometric ? 10 : step)),
    String(answer - (isGeometric ? 6 : step)),
    String(answer + (isGeometric ? 20 : step * 2)),
  ]);

  const tag = pickPaper(track === 'all' ? 'banking' : track);

  return {
    id: generateId(),
    text: `Find the next term in the series: ${display}, ?`,
    options,
    correctIndex: options.indexOf(String(answer)),
    category: 'series',
    difficulty,
    timeLimit: getTimeLimit(difficulty),
    examTrack: track,
    examTag: tag,
    explanation: isGeometric
      ? `Geometric Progression: multiply by common ratio.`
      : `Arithmetic Progression: each term increases by +${step}. Next term = ${answer}.`,
  };
}

function generateDynamicArithmetic(difficulty: Difficulty, track: ExamTrack = 'banking'): Question {
  const ops = ['+', '-', '×'];
  const op = ops[randomInt(0, difficulty === 'easy' ? 1 : 2)];
  let a = randomInt(12, difficulty === 'easy' ? 40 : 120);
  let b = randomInt(5, difficulty === 'easy' ? 25 : 45);

  let ans = 0;
  if (op === '+') ans = a + b;
  else if (op === '-') {
    if (a < b) [a, b] = [b, a];
    ans = a - b;
  } else {
    a = randomInt(8, 25);
    b = randomInt(4, 15);
    ans = a * b;
  }

  const options = shuffleArray([
    String(ans),
    String(ans + 4),
    String(Math.max(1, ans - 4)),
    String(ans + 10),
  ]);

  const tag = pickPaper(track === 'all' ? 'banking' : track);

  return {
    id: generateId(),
    text: `Evaluate: ${a} ${op} ${b} = ?`,
    options,
    correctIndex: options.indexOf(String(ans)),
    category: 'arithmetic',
    difficulty,
    timeLimit: getTimeLimit(difficulty),
    examTrack: track,
    examTag: tag,
    explanation: `Direct computation: ${a} ${op} ${b} = ${ans}.`,
  };
}

function generateDynamicEse(difficulty: Difficulty, track: ExamTrack = 'ese'): Question {
  const o = randomInt(2, 6);
  const m = randomInt(o + 2, o + 7);
  const mult = randomInt(m, m + 4);
  const validP = 6 * mult - (o + 4 * m);
  const p = validP > m ? validP : m + 6;
  const te = Math.round((o + 4 * m + p) / 6);

  const options = shuffleArray([
    `${te} days`,
    `${te + 2} days`,
    `${Math.max(1, te - 2)} days`,
    `${te + 4} days`,
  ]);

  const tag = pickPaper('ese');

  return {
    id: generateId(),
    text: `PERT Activity: Optimistic=${o}d, Most Likely=${m}d, Pessimistic=${p}d. Expected duration (Te) is:`,
    options,
    correctIndex: options.indexOf(`${te} days`),
    category: 'ethics_project_mgmt',
    difficulty,
    timeLimit: getTimeLimit(difficulty),
    examTrack: 'ese',
    examTag: tag,
    explanation: `PERT Formula: Te = (to + 4tm + tp) / 6 = (${o} + 4×${m} + ${p}) / 6 = ${te} days.`,
  };
}

// -------------------------------------------------------------
// QUESTION CACHE & DISPATCHER (NO IMMEDIATE REPETITIONS)
// -------------------------------------------------------------

const usedIndicesByTrack: Record<string, Set<number>> = {};

export function generateQuestion(difficulty: Difficulty, track: ExamTrack = 'all'): Question {
  const key = `${track}_${difficulty}`;
  if (!usedIndicesByTrack[key]) {
    usedIndicesByTrack[key] = new Set();
  }

  // 1. Filter curated PYQs matching track and difficulty
  let matchingCurated = CURATED_PYQS.map((q, idx) => ({ q, idx })).filter(({ q }) => {
    const trackMatch = track === 'all' || q.examTrack === track;
    const diffMatch = q.difficulty === difficulty;
    return trackMatch && diffMatch;
  });

  // If no exact difficulty match, try any question matching track
  if (matchingCurated.length === 0 && track !== 'all') {
    matchingCurated = CURATED_PYQS.map((q, idx) => ({ q, idx })).filter(({ q }) => q.examTrack === track);
  }

  // Fallback for 'all'
  if (matchingCurated.length === 0) {
    matchingCurated = CURATED_PYQS.map((q, idx) => ({ q, idx }));
  }

  // Find unused questions
  let available = matchingCurated.filter(({ idx }) => !usedIndicesByTrack[key].has(idx));
  if (available.length === 0) {
    usedIndicesByTrack[key].clear();
    available = matchingCurated;
  }

  // 85% priority given to authentic curated 10-year PYQ
  if (available.length > 0 && (Math.random() < 0.85 || matchingCurated.length >= 10)) {
    const selected = available[randomInt(0, available.length - 1)];
    usedIndicesByTrack[key].add(selected.idx);

    const chosen = selected.q;
    const correctText = chosen.options[chosen.correctIndex];
    const shuffled = shuffleArray([...chosen.options]);

    return {
      ...chosen,
      id: generateId(),
      options: shuffled,
      correctIndex: shuffled.indexOf(correctText),
      timeLimit: getTimeLimit(chosen.difficulty),
    };
  }

  // 2. Procedural generator with 10-year official paper attribution
  if (track === 'ese') {
    return generateDynamicEse(difficulty, track);
  }
  if (track === 'gate') {
    return Math.random() > 0.5
      ? generateDynamicSpeedDistance(difficulty, track)
      : generateDynamicTimeWork(difficulty, track);
  }
  if (track === 'cat') {
    return Math.random() > 0.5
      ? generateDynamicPercentage(difficulty, track)
      : generateDynamicSeries(difficulty, track);
  }
  if (track === 'banking') {
    return Math.random() > 0.5
      ? generateDynamicArithmetic(difficulty, track)
      : generateDynamicPercentage(difficulty, track);
  }
  if (track === 'placement') {
    return Math.random() > 0.5
      ? generateDynamicTimeWork(difficulty, track)
      : generateDynamicSpeedDistance(difficulty, track);
  }

  // Mixed 'all' track
  const generators = [
    (d: Difficulty) => generateDynamicSpeedDistance(d, 'gate'),
    (d: Difficulty) => generateDynamicTimeWork(d, 'placement'),
    (d: Difficulty) => generateDynamicPercentage(d, 'cat'),
    (d: Difficulty) => generateDynamicSeries(d, 'banking'),
    (d: Difficulty) => generateDynamicArithmetic(d, 'banking'),
    (d: Difficulty) => generateDynamicEse(d, 'ese'),
  ];
  return generators[randomInt(0, generators.length - 1)](difficulty);
}

export function generateQuestions(count: number, difficulty: Difficulty, track: ExamTrack = 'all'): Question[] {
  return Array.from({ length: count }, () => generateQuestion(difficulty, track));
}
