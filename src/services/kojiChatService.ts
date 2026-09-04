import { Question, QuestionCategory } from '../types/game';
import { generateKojiCorrection, KojiExplanation } from './kojiTutorService';

export interface KojiChatMessage {
  id: string;
  sender: 'koji' | 'user';
  text: string;
  timestamp: number;
  suggestedQuestions?: string[];
}

export interface MistakeItem {
  question: Question;
  chosenIndex: number;
  roundNumber?: number;
}

export interface SimplifiedConcept {
  headline: string;
  oneLineIntuition: string;
  everydayAnalogy: string;
  eli5Explanation: string;
  formulaBreakdown: string;
  miniPractice: {
    question: string;
    answer: string;
    explanation: string;
  };
}

/**
 * Rich simplified concepts repository for all aptitude categories
 */
export function getSimplifiedConcept(
  category: QuestionCategory,
  questionText: string,
  chosenWrong: string,
  correctAnswer: string
): SimplifiedConcept {
  const qLower = questionText.toLowerCase();

  // 1. SPEED & DISTANCE (Harmonic Mean & Average Speed)
  if (category === 'speed_distance' || qLower.includes('speed') || qLower.includes('km/h')) {
    if (qLower.includes('average') || qLower.includes('avg')) {
      return {
        headline: 'Average Speed is a Time-Weighted Journey, Not a Quick Average',
        oneLineIntuition:
          'Because you travel slower for longer hours, the slow speed dominates the total trip!',
        everydayAnalogy:
          'Imagine walking to the mall at 2 km/h (takes 60 minutes) and sprinting back in an Uber at 60 km/h (takes 2 minutes). Out of 62 total minutes, you spent 60 minutes going slow! Your trip average will feel like walking, not zooming.',
        eli5Explanation:
          'Speed is simply Distance divided by Time. When you travel the same distance at two speeds, you spend WAY more minutes at the slower speed. That is why the true average is pulled closer to the slower number!',
        formulaBreakdown:
          'Formula: Average Speed = 2·A·B / (A + B). The 2 comes from covering the distance TWICE (there and back). We do not simply average the speeds because time is in the denominator.',
        miniPractice: {
          question:
            'A cyclist rides to school at 10 km/h and returns home at 20 km/h. What is the average speed?',
          answer: '13.33 km/h',
          explanation:
            'Average speed = 2 × 10 × 20 / (10 + 20) = 400 / 30 = 13.33 km/h (NOT 15 km/h!).',
        },
      };
    }
    return {
      headline: 'Speed, Distance, and the 5/18 Unit Bridge',
      oneLineIntuition:
        'Always translate kilometers to meters and hours to seconds before doing any multiplication.',
      everydayAnalogy:
        'Think of meters and kilometers like centimeters and inches on different sides of a ruler. If you measure the train in meters, you must measure its speed in meters per second too!',
      eli5Explanation:
        '1 kilometer has 1,000 meters. 1 hour has 3,600 seconds. 1,000 ÷ 3,600 simplifies to exactly 5/18. So to change km/h into m/s, simply multiply by 5/18!',
      formulaBreakdown:
        'Distance = Speed × Time. km/h to m/s: multiply by 5/18. m/s to km/h: multiply by 18/5.',
      miniPractice: {
        question: 'Convert 90 km/h into meters per second.',
        answer: '25 m/s',
        explanation: '90 × (5 / 18) = 5 × 5 = 25 m/s.',
      },
    };
  }

  // 2. PERCENTAGES & SUCCESSIVE DISCOUNTS
  if (
    category === 'percentages' ||
    qLower.includes('percent') ||
    qLower.includes('%') ||
    qLower.includes('discount') ||
    qLower.includes('profit')
  ) {
    if (
      qLower.includes('successive') ||
      qLower.includes('consecutive') ||
      qLower.includes('discount')
    ) {
      return {
        headline: 'Discounts Compound: The 2nd Cut Only Shrinks What Is Left',
        oneLineIntuition:
          'A second discount applies to the discounted price, never to the original starting tag.',
        everydayAnalogy:
          'If a store cuts a $100 jacket by 50%, it costs $50. If they give another 50% off, you pay $25—it is NOT free! Consecutive discounts eat away at a smaller pie each round.',
        eli5Explanation:
          'Always pretend the item starts at exactly 100 dollars. First discount reduces 100. The next discount takes a slice only out of the smaller leftover amount. Add up the savings from 100 to find the real percentage.',
        formulaBreakdown:
          'Net Discount Formula = A + B - (A × B) / 100. Notice the minus sign: it removes the double-counted overlap!',
        miniPractice: {
          question:
            'What is the single equivalent discount for successive discounts of 20% and 10%?',
          answer: '28%',
          explanation:
            'Start with 100: 20% off leaves 80. 10% off 80 leaves 72. You saved 100 - 72 = 28% (NOT 30%!).',
        },
      };
    }
    return {
      headline: 'The Base Anchor: What are We Taking the Percentage OF?',
      oneLineIntuition:
        'A percentage has no meaning without its base anchor. Profit% is anchored to Cost Price.',
      everydayAnalogy:
        'If you gain 50% more weight, you measure against your original weight. You never measure the gain against your heavier final weight!',
      eli5Explanation:
        'Cost Price is what you spent. Selling Price is what you received. Profit = Selling - Cost. Profit percentage is ALWAYS: (Profit ÷ Cost Price) × 100.',
      formulaBreakdown:
        'Profit % = (Profit / Cost Price) × 100. Loss % = (Loss / Cost Price) × 100.',
      miniPractice: {
        question: 'An item bought for $40 is sold for $50. What is the profit percentage?',
        answer: '25%',
        explanation: 'Profit = $10. Base = $40. Profit% = (10 / 40) × 100 = 25%.',
      },
    };
  }

  // 3. TIME & WORK (Inverted Rates)
  if (
    category === 'time_work' ||
    qLower.includes('work') ||
    qLower.includes('days') ||
    qLower.includes('pipe')
  ) {
    return {
      headline: 'Workers Combine Their Daily Speeds, Not Their Total Days',
      oneLineIntuition:
        'More hands make light work: when people work together, the total time must be LESS than the fastest person.',
      everydayAnalogy:
        'If Alice paints a wall in 2 hours and Bob paints it in 3 hours, working together they finish in under 2 hours. Adding 2 + 3 = 5 days would mean working together made them slower!',
      eli5Explanation:
        'Instead of asking "how many days?", ask "how much do they finish in just ONE day?". If Person A finishes 1/6 of a wall each day and B finishes 1/12, together in one day they finish 1/6 + 1/12 = 3/12 = 1/4 of the wall. If they do 1/4 each day, it takes 4 days total!',
      formulaBreakdown: 'Together Time = (A × B) / (A + B). Combined 1-day rate = 1/A + 1/B.',
      miniPractice: {
        question: 'A completes a task in 10 days, B in 15 days. How long working together?',
        answer: '6 days',
        explanation: 'Time = (10 × 15) / (10 + 15) = 150 / 25 = 6 days.',
      },
    };
  }

  // 4. PROBABILITY & COMBINATIONS
  if (
    category === 'probability' ||
    qLower.includes('probability') ||
    qLower.includes('dice') ||
    qLower.includes('card')
  ) {
    return {
      headline: 'Probability: Target Outcomes Divided by All Possibilities',
      oneLineIntuition:
        'Always map out the total sample space first, and beware of replacement vs without replacement.',
      everydayAnalogy:
        'If there are 52 cards and you draw an Ace (4/52), the deck now has only 51 cards left! The second card chance changes because the deck remembered your first draw.',
      eli5Explanation:
        'Probability is just a fraction: (Number of winning results) ÷ (Total possible results). If an event is too hard to count directly, calculate the chance of it NEVER happening and subtract from 1!',
      formulaBreakdown:
        'P(Event) = Favorable / Total. Complement Rule: P(At least one) = 1 - P(None).',
      miniPractice: {
        question: 'What is the probability of rolling a sum of 7 with two fair 6-sided dice?',
        answer: '1/6',
        explanation:
          'Favorable pairs = (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 pairs. Total pairs = 36. Probability = 6/36 = 1/6.',
      },
    };
  }

  // 5. FRACTIONS & RATIOS
  if (
    category === 'fractions' ||
    qLower.includes('ratio') ||
    qLower.includes('fraction') ||
    qLower.includes('proportion')
  ) {
    return {
      headline: 'Ratios Are Scaling Recipes, Not Fixed Quantities',
      oneLineIntuition:
        'A ratio of 2:3 does not mean 2 and 3; it means 2 parts and 3 parts out of 5 total parts.',
      everydayAnalogy:
        'Making chocolate milk with 1 scoop cocoa to 3 cups milk. If you double the recipe, you use 2 scoops and 6 cups. The proportion never changes, but the real amounts grow together.',
      eli5Explanation:
        'Whenever you see a ratio like A : B = 2 : 3, attach an "x" to both: 2x and 3x. Then add them up: 2x + 3x = 5x. Find what 1x is worth, and multiply back!',
      formulaBreakdown: 'Part A = (Ratio A / Total Ratio Sum) × Total Quantity.',
      miniPractice: {
        question: 'Divide $50 in the ratio 2 : 3.',
        answer: '$20 and $30',
        explanation:
          'Total parts = 2 + 3 = 5. One part = 50 / 5 = $10. Part 1 = 2 × 10 = $20. Part 2 = 3 × 10 = $30.',
      },
    };
  }

  // 6. SERIES & SEQUENCES
  if (
    category === 'series' ||
    qLower.includes('pattern') ||
    qLower.includes('sequence') ||
    qLower.includes('next number')
  ) {
    return {
      headline: 'Sequence Forensics: Look at Differences of Differences',
      oneLineIntuition:
        'When consecutive steps increase unevenly, look at the difference between the differences or squares (n² + 1).',
      everydayAnalogy:
        'Like a car accelerating: in 1st second it gains 2 mph, next second 4 mph, next second 6 mph. The speed is not constant, but the acceleration (2, 4, 6) is steady!',
      eli5Explanation:
        'Subtract each number from the number after it. Write down that list. If those numbers are not equal, subtract THEM! That almost always reveals the secret pattern.',
      formulaBreakdown:
        'Arithmetic progression: Tn = a + (n - 1)d. Quadratic progression: 2nd difference is constant 2a.',
      miniPractice: {
        question: 'What is the next number: 2, 5, 10, 17, ?',
        answer: '26',
        explanation:
          'Pattern is n² + 1: 1²+1=2, 2²+1=5, 3²+1=10, 4²+1=17, 5²+1=26 (differences are +3, +5, +7, +9).',
      },
    };
  }

  // Default fallback for logic and general quantitative
  return {
    headline: 'Breaking the Problem into Given Facts vs Target Goal',
    oneLineIntuition:
      'Write down what is explicitly known, eliminate impossible options, and verify the remaining choice.',
    everydayAnalogy:
      'Like being a detective at a clue board: cross off suspects that have solid alibis until only the truth remains.',
    eli5Explanation:
      'Read the very last sentence first so your mind knows what number or answer to look for. Then read the question from the start and solve step by step.',
    formulaBreakdown:
      'Deduction: (Given premises) → (Direct logical consequence) → (Verify against options).',
    miniPractice: {
      question: 'If all bloops are razzies, and all razzies are lizzies, are all bloops lizzies?',
      answer: 'Yes',
      explanation:
        'Transitive property: Bloops ⊂ Razzies ⊂ Lizzies, so all Bloops are indeed Lizzies.',
    },
  };
}

/**
 * Generate tailored suggested follow-up questions for the student
 */
export function getSuggestedDoubts(
  category: QuestionCategory,
  question: Question,
  chosenWrong: string
): string[] {
  const common = [
    `Can you explain this in simpler terms?`,
    `Give me a real-world analogy for this.`,
    `Why was my choice (${chosenWrong}) tempting?`,
    `Why do we use this specific formula?`,
    `Can you give me another quick practice question?`,
  ];

  if (category === 'speed_distance') {
    return [
      `Why isn't average speed just (Speed1 + Speed2) / 2?`,
      `Where does the 5/18 conversion come from?`,
      `Give me a real-world analogy for average speed.`,
      `What if the two distances were NOT equal?`,
    ];
  }

  if (category === 'percentages') {
    return [
      `Why can't I just add consecutive discounts directly?`,
      `Can you show me the calculation assuming base 100?`,
      `Why is profit percentage calculated on Cost Price?`,
      `Give me a quick test problem on successive discounts.`,
    ];
  }

  if (category === 'time_work') {
    return [
      `Why can't we just add the days together?`,
      `Can you explain the 1-day work rate concept?`,
      `What if a third person C joins the work?`,
      `Give me an everyday analogy for worker rates.`,
    ];
  }

  if (category === 'probability') {
    return [
      `What is the difference between with and without replacement?`,
      `When should I use the complement rule 1 - P(Not)?`,
      `Give me a simple dice or coin example.`,
    ];
  }

  return common.slice(0, 4);
}

/**
 * Creates the initial welcoming conversation message when a student opens a mistake breakdown
 */
export function createInitialConversation(
  question: Question,
  chosenIndex: number,
  roundNumber?: number
): KojiChatMessage[] {
  const chosenWrong = question.options[chosenIndex] || 'your choice';
  const correctAnswer = question.options[question.correctIndex] || 'the correct answer';
  const concept = getSimplifiedConcept(
    question.category,
    question.text,
    chosenWrong,
    correctAnswer
  );
  const suggested = getSuggestedDoubts(question.category, question, chosenWrong);

  const roundPrefix = roundNumber ? `On Question ${roundNumber}, ` : '';

  const initialText =
    `👋 **Hey! Tutor Koji here.** Let's turn this mistake into your biggest strength!\n\n` +
    `${roundPrefix}you chose **"${chosenWrong}"**, while the correct answer is **"${correctAnswer}"**.\n\n` +
    `💡 **Simplified Core Concept:**\n${concept.oneLineIntuition}\n\n` +
    `🚗 **Think of it like this:**\n${concept.everydayAnalogy}\n\n` +
    `Ask me anything you're wondering about! Tap any suggested doubt below or type your own question.`;

  return [
    {
      id: `koji-init-${question.id}-${Date.now()}`,
      sender: 'koji',
      text: initialText,
      timestamp: Date.now(),
      suggestedQuestions: suggested,
    },
  ];
}

/**
 * Answer any user doubt conversationally, using pedagogical heuristic reasoning
 * with optional live Gemini API fallback if configured.
 */
export async function answerUserDoubt(params: {
  question: Question;
  chosenIndex: number;
  userDoubt: string;
  history: KojiChatMessage[];
}): Promise<KojiChatMessage> {
  const { question, chosenIndex, userDoubt, history } = params;
  const chosenWrong = question.options[chosenIndex] || 'your choice';
  const correctAnswer = question.options[question.correctIndex] || 'the correct answer';
  const concept = getSimplifiedConcept(
    question.category,
    question.text,
    chosenWrong,
    correctAnswer
  );

  // Optional: Check if Gemini API key exists for live streaming / generative expansion
  const geminiApiKey =
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GEMINI_API_KEY
      ? process.env.EXPO_PUBLIC_GEMINI_API_KEY
      : null;

  if (geminiApiKey) {
    try {
      const geminiResponse = await fetchGeminiResponse(
        geminiApiKey,
        question,
        chosenWrong,
        correctAnswer,
        userDoubt,
        history
      );
      if (geminiResponse) {
        return {
          id: `koji-res-${Date.now()}`,
          sender: 'koji',
          text: geminiResponse,
          timestamp: Date.now(),
          suggestedQuestions: getDynamicFollowUps(userDoubt, question.category),
        };
      }
    } catch {
      // Graceful fallback to rich local pedagogical tutor
    }
  }

  // Local Pedagogical Reasoning Engine
  const responseText = generateLocalTutorResponse(
    userDoubt,
    question,
    chosenIndex,
    chosenWrong,
    correctAnswer,
    concept
  );

  return {
    id: `koji-res-${Date.now()}`,
    sender: 'koji',
    text: responseText,
    timestamp: Date.now(),
    suggestedQuestions: getDynamicFollowUps(userDoubt, question.category),
  };
}

/**
 * High-speed local cognitive tutor response generator
 */
function generateLocalTutorResponse(
  doubt: string,
  question: Question,
  chosenIndex: number,
  chosenWrong: string,
  correctAnswer: string,
  concept: SimplifiedConcept
): string {
  const lower = doubt.toLowerCase();

  const isQuestioning = lower.includes('?') || lower.includes('why') || lower.includes('wrong');

  // 1. Thank you / I get it / Understood / Eureka (affirming understanding)
  if (
    !isQuestioning &&
    (lower.includes('thank') ||
      lower.includes('understood') ||
      lower.includes('i get it') ||
      lower.includes('that makes sense') ||
      lower.includes('makes sense now') ||
      lower.includes('now makes sense') ||
      lower.includes('clear now') ||
      lower.includes('got it') ||
      lower.includes('i understand'))
  ) {
    return (
      `🎉 **That is music to my ears!**\n\n` +
      `Once your brain clicks on *why* that trap existed, you will never fall for it on a real exam.\n\n` +
      `You're building real mathematical intuition! Whenever you're ready, tap **"Next Mistake"** or continue practicing.`
    );
  }

  // 2. Simplify / ELI5 / Too complex / Easier
  if (
    lower.includes('simpl') ||
    lower.includes('eli5') ||
    lower.includes('10 year old') ||
    lower.includes('easier') ||
    lower.includes('too hard') ||
    lower.includes('too complex') ||
    lower.includes('confus') ||
    lower.includes('beginner')
  ) {
    return (
      `🤗 **Let's strip away all the complicated math and make it super simple:**\n\n` +
      `${concept.eli5Explanation}\n\n` +
      `📌 **In short:** ${concept.oneLineIntuition}\n\n` +
      `Does this picture make it feel more natural?`
    );
  }

  // 3. Analogy / Real world / Story
  if (
    lower.includes('analogy') ||
    lower.includes('real world') ||
    lower.includes('real life') ||
    lower.includes('story') ||
    lower.includes('example')
  ) {
    return (
      `🏎️ **Here is an everyday picture you can keep in your mind:**\n\n` +
      `${concept.everydayAnalogy}\n\n` +
      `See how the numbers connect to real everyday actions? That is the secret to solving aptitude questions without memorizing formulas!`
    );
  }

  // 4. Why was my choice wrong / why not chosenOption
  if (
    lower.includes('my choice') ||
    lower.includes('why not') ||
    lower.includes('wrong') ||
    lower.includes('tempt') ||
    lower.includes(chosenWrong.toLowerCase())
  ) {
    return (
      `🔍 **Why "${chosenWrong}" is such a sneaky trap:**\n\n` +
      `The question setter intentionally designed **"${chosenWrong}"** to reward mental shortcuts! ` +
      `When we glance quickly at numbers, our subconscious brain wants to do the easiest linear calculation.\n\n` +
      `Here, the trap comes from: ${concept.oneLineIntuition}\n\n` +
      `The true answer is **"${correctAnswer}"** because we must account for the underlying proportion rather than the quick surface sum.`
    );
  }

  // 5. Formula / Why this formula / Where did the number come from
  if (
    lower.includes('formula') ||
    lower.includes('equation') ||
    lower.includes('where did') ||
    lower.includes('why multiply') ||
    lower.includes('why divide') ||
    lower.includes('derive') ||
    lower.includes('5/18') ||
    lower.includes('2*')
  ) {
    return (
      `📐 **Let's peek under the hood of the formula:**\n\n` +
      `${concept.formulaBreakdown}\n\n` +
      `💡 **Tutor Tip:** Never just memorize a formula blindly. Know *what* is in the numerator (what you want) and *what* is in the denominator (what you measure against).`
    );
  }

  // 6. Mini Practice / Test me / Another question
  if (
    lower.includes('practice') ||
    lower.includes('quiz') ||
    lower.includes('test me') ||
    lower.includes('another') ||
    lower.includes('problem')
  ) {
    return (
      `🎯 **Here is a quick mini challenge to lock in your intuition:**\n\n` +
      `❓ **Problem:** ${concept.miniPractice.question}\n\n` +
      `Think about it for 5 seconds...\n\n` +
      `✅ **Answer:** **${concept.miniPractice.answer}**\n\n` +
      `📝 **Why:** ${concept.miniPractice.explanation}\n\n` +
      `How did you find that? Makes sense?`
    );
  }

  // 7. What if / Different numbers / What happens if
  if (lower.includes('what if') || lower.includes('if the') || lower.includes('suppose')) {
    return (
      `🤔 **Great hypothetical! Let's explore that scenario:**\n\n` +
      `If you change the numbers, the core rule remains identical: **${concept.headline}**.\n\n` +
      `Whenever one factor changes, notice how it pulls the final outcome: ` +
      `${concept.oneLineIntuition}\n\n` +
      `Try testing it with simple round numbers like 10, 20, or 100 — it makes the math click immediately!`
    );
  }

  // 8. General inquiry / specific questions
  const correction = generateKojiCorrection(question, chosenIndex);
  return (
    `💭 **Great question! Let's unpack that:**\n\n` +
    `For this problem, the fundamental clue is:\n` +
    `• **Target:** Reach **${correctAnswer}**\n` +
    `• **Key Insight:** ${concept.oneLineIntuition}\n\n` +
    `• **Step breakdown:**\n${correction.stepByStep.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
    `⭐ **${correction.proTip}**\n\n` +
    `Which specific step would you like me to walk through in even more detail?`
  );
}

/**
 * Dynamic follow-ups that adapt after each chat turn
 */
function getDynamicFollowUps(lastUserDoubt: string, category: QuestionCategory): string[] {
  const lower = lastUserDoubt.toLowerCase();
  if (lower.includes('simpl') || lower.includes('analogy')) {
    return [
      `Give me a quick practice problem to test this!`,
      `Where does this formula come from?`,
      `I understand now!`,
    ];
  }
  if (lower.includes('formula')) {
    return [
      `Can you give me a real-world analogy?`,
      `Explain like I'm 10 years old.`,
      `I got it, thanks!`,
    ];
  }
  if (lower.includes('practice')) {
    return [
      `Why did the answer work out that way?`,
      `Explain like a beginner.`,
      `I'm ready for the next question!`,
    ];
  }

  return [
    `Can you simplify this even further?`,
    `Give me a quick mini practice question.`,
    `I understand now!`,
  ];
}

/**
 * Fetch generative response from Gemini API if key is provided
 */
async function fetchGeminiResponse(
  apiKey: string,
  question: Question,
  chosenWrong: string,
  correctAnswer: string,
  userDoubt: string,
  history: KojiChatMessage[]
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt =
    `You are "Koji", an encouraging, empathetic, brilliant home tutor in an aptitude exam app (like Brilliant's Koji).\n` +
    `The student is reviewing a mistake they made on an aptitude question.\n` +
    `Question: "${question.text}"\n` +
    `Category: ${question.category}\n` +
    `Student's incorrect answer: "${chosenWrong}"\n` +
    `Correct answer: "${correctAnswer}"\n` +
    `Explanation: "${question.explanation || ''}"\n\n` +
    `The student asks: "${userDoubt}"\n\n` +
    `Provide a concise (2-3 short paragraphs), warm, clear response that addresses their exact doubt, simplifies the underlying mathematical concept with intuition or an everyday analogy, and keeps them encouraged. Format with clean bold text and bullet points.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText ? candidateText.trim() : null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
