import { Question, QuestionCategory } from '../types/game';

export type KojiMood = 'encouraging' | 'thoughtful' | 'curious' | 'celebrating';

export interface KojiExplanation {
  tutorGreeting: string;
  trapAnalysis: string;
  conceptKey: string;
  stepByStep: string[];
  correctAnswer: string;
  wrongAnswerPicked: string;
  proTip: string;
  encouragement: string;
  mood: KojiMood;
}

const GREETINGS = [
  "Hey, tutor Koji here! Don't sweat it — this is one of the best learning moments.",
  "Ah, I see what caught you there! Let's untangle this step by step.",
  'Great attempt! This question has a sneaky trap that tricks even top students.',
  "Pause for a second — let's look at what your brain saw versus the underlying rule.",
  "Don't worry! Brilliant minds make mistakes; great minds learn from them right away.",
];

const ENCOURAGEMENTS = [
  'Every mistake you dissect builds intuition that sticks forever!',
  "Notice that pattern? You won't fall for this trick on your next exam.",
  'Speed comes from clarity. Keep your momentum going!',
  "You're building real mathematical muscle right now.",
  "Next time this pattern shows up, you'll solve it in 5 seconds flat!",
];

/**
 * Heuristics to diagnose common student pitfalls based on question category and numbers
 */
function diagnoseTrap(
  category: QuestionCategory,
  questionText: string,
  chosenWrongOption: string,
  correctOption: string,
  explanation?: string
): { trap: string; concept: string; steps: string[]; proTip: string } {
  const qLower = questionText.toLowerCase();

  // 1. SPEED & DISTANCE (Average speed harmonic mean trap)
  if (category === 'speed_distance' || qLower.includes('speed') || qLower.includes('km/h')) {
    if (qLower.includes('average speed') || qLower.includes('avg speed')) {
      return {
        concept: 'Average Speed = Total Distance / Total Time (Harmonic Mean)',
        trap: `You likely took the simple average of the speeds (which gives ${chosenWrongOption}). But because more time is spent at the slower speed, the true average is pulled downwards!`,
        steps: [
          'Recognize that Average Speed is NOT (S1 + S2) / 2 when distances are equal.',
          'Use the Harmonic Mean formula: Average Speed = (2 × S1 × S2) / (S1 + S2).',
          `Plugging in the numbers gives exactly ${correctOption}.`,
        ],
        proTip:
          "Koji's Rule: For equal distance round-trips, the average speed is always strictly LESS than the simple arithmetic average.",
      };
    }
    return {
      concept: 'Distance = Speed × Time Conversion',
      trap: `It's easy to mix units here (km/h vs m/s or hours vs minutes). Notice how ${chosenWrongOption} matches a missing conversion factor.`,
      steps: [
        'Check units first: to convert km/h to m/s, multiply by 5/18.',
        'Align all time values to hours or seconds before multiplying.',
        `Solving with unified units yields ${correctOption}.`,
      ],
      proTip:
        "Koji's Rule: 1 km/h = 5/18 m/s. 1 m/s = 18/5 km/h. Keep this shortcut in your memory toolkit!",
    };
  }

  // 2. PERCENTAGES & PROFIT/LOSS (Base value & consecutive percentage trap)
  if (
    category === 'percentages' ||
    qLower.includes('percent') ||
    qLower.includes('%') ||
    qLower.includes('profit') ||
    qLower.includes('discount')
  ) {
    if (
      qLower.includes('successive') ||
      qLower.includes('consecutive') ||
      qLower.includes('discount')
    ) {
      return {
        concept: 'Successive Percentage Changes',
        trap: `You probably added the percentages directly to get ${chosenWrongOption}. But the second percentage applies to the already discounted price, not the original!`,
        steps: [
          'Never add consecutive discounts directly (e.g. 20% + 10% is NOT 30%).',
          'Use the effective change formula: a + b + (a × b) / 100.',
          `Calculate step-by-step from 100 base: 100 → intermediate → final gives ${correctOption}.`,
        ],
        proTip:
          "Koji's Rule: Always test percentage questions by assuming an initial value of 100.",
      };
    }
    return {
      concept: 'Percentage Base & Margin',
      trap: `You calculated the percentage over the wrong base value (e.g., selling price instead of cost price), which led to ${chosenWrongOption}.`,
      steps: [
        'Identify the reference base (Cost Price or Initial Value).',
        'Formula: Change / Original Base × 100.',
        `Evaluating against the true base arrives at ${correctOption}.`,
      ],
      proTip:
        "Koji's Rule: Profit% is ALWAYS calculated on Cost Price unless the problem explicitly states otherwise.",
    };
  }

  // 3. TIME & WORK (Inverted rates trap)
  if (category === 'time_work' || qLower.includes('days') || qLower.includes('hours to complete')) {
    return {
      concept: 'Work Rates & Inverted Sums',
      trap: `A common slip is adding the days directly (getting ${chosenWrongOption}). But work rates add together, not days!`,
      steps: [
        "Convert each worker's time into a 1-day rate (1/A and 1/B).",
        'Add the combined rates: Total Rate = 1/A + 1/B = (A + B) / (A × B).',
        `Invert the combined rate to get total days: (A × B) / (A + B) = ${correctOption}.`,
      ],
      proTip:
        "Koji's Rule: Two workers working together will ALWAYS finish faster than the single fastest worker.",
    };
  }

  // 4. PROBABILITY & COMBINATIONS (Replacement vs No Replacement)
  if (
    category === 'probability' ||
    qLower.includes('probability') ||
    qLower.includes('cards') ||
    qLower.includes('dice')
  ) {
    return {
      concept: 'Probability: Favorable Outcomes / Total Sample Space',
      trap: `You may have counted outcomes without accounting for replacement or permutation order, reaching ${chosenWrongOption}.`,
      steps: [
        'Determine total possible outcomes (Sample Space).',
        'Count strictly favorable cases without double-counting.',
        `Fraction = Favorable / Total = ${correctOption}.`,
      ],
      proTip:
        "Koji's Rule: P(Event) + P(Not Event) = 1. Often calculating the opposite (complement) is 3x faster!",
    };
  }

  // 5. FRACTIONS & RATIOS (Cross multiplication & common denominators)
  if (category === 'fractions' || qLower.includes('ratio') || qLower.includes('fraction')) {
    return {
      concept: 'Proportions and Common Multipliers',
      trap: `Option ${chosenWrongOption} happens when numerator and denominator are treated independently rather than as a ratio.`,
      steps: [
        'Express ratios with a common multiplier (e.g., 3x and 4x).',
        'Set up the algebraic equality and solve for x.',
        `Substitute back to find the exact target: ${correctOption}.`,
      ],
      proTip:
        'Koji\'s Rule: In ratio word problems, always introduce an "x" multiplier to maintain true proportions.',
    };
  }

  // 6. ARITHMETIC / ALGEBRA / SERIES (General calculation & pattern recognition)
  if (category === 'series' || qLower.includes('pattern') || qLower.includes('sequence')) {
    return {
      concept: 'Pattern Recognition & Step Differences',
      trap: `The eye naturally looks for constant addition, which made ${chosenWrongOption} look right. But look at the second difference!`,
      steps: [
        'Write out the differences between consecutive terms (d1, d2, d3...).',
        'If the first differences change, check the differences of differences (or multiplication/squares).',
        `Applying the true progression rule leads straight to ${correctOption}.`,
      ],
      proTip:
        "Koji's Rule: If differences increase rapidly, test n² or n³ + constant before assuming complex multiplication.",
    };
  }

  // Default fallback for general aptitude / logic
  const explanationLines = explanation
    ? explanation
        .split('.')
        .map((s) => s.trim())
        .filter((s) => s.length > 5)
    : [];

  const parsedSteps =
    explanationLines.length >= 2
      ? explanationLines.slice(0, 3)
      : [
          'Identify what the question is asking and list given values.',
          'Apply the direct mathematical relationship without shortcuts.',
          `Calculate carefully to land on ${correctOption}.`,
        ];

  return {
    concept: `${category.replace('_', ' ').toUpperCase()} Reasoning`,
    trap: `Option ${chosenWrongOption} is a tempting distractor designed to catch quick mental approximations.`,
    steps: parsedSteps,
    proTip:
      "Koji's Rule: Read the final sentence first to know exactly what quantity is requested before calculating.",
  };
}

/**
 * Generate a rich, tutor-like Koji guidance object for an incorrect answer
 */
export function generateKojiCorrection(question: Question, chosenIndex: number): KojiExplanation {
  const chosenWrongOption = question.options[chosenIndex] || 'your choice';
  const correctOption = question.options[question.correctIndex] || 'the correct answer';
  const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  const randomEncouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

  const diagnosis = diagnoseTrap(
    question.category,
    question.text,
    chosenWrongOption,
    correctOption,
    question.explanation
  );

  return {
    tutorGreeting: randomGreeting,
    trapAnalysis: diagnosis.trap,
    conceptKey: diagnosis.concept,
    stepByStep: diagnosis.steps,
    correctAnswer: correctOption,
    wrongAnswerPicked: chosenWrongOption,
    proTip: diagnosis.proTip,
    encouragement: randomEncouragement,
    mood: 'encouraging',
  };
}
