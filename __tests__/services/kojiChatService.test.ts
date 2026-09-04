import {
  getSimplifiedConcept,
  getSuggestedDoubts,
  createInitialConversation,
  answerUserDoubt,
} from '../../src/services/kojiChatService';
import { Question } from '../../src/types/game';

describe('kojiChatService', () => {
  const sampleSpeedQuestion: Question = {
    id: 'speed-q1',
    text: 'A car travels to city A at 60 km/h and returns at 40 km/h. What is the average speed?',
    options: ['50 km/h', '48 km/h', '45 km/h', '52 km/h'],
    correctIndex: 1, // '48 km/h'
    category: 'speed_distance',
    difficulty: 'medium',
    timeLimit: 45,
    explanation: 'Harmonic mean formula gives 48 km/h.',
  };

  describe('getSimplifiedConcept', () => {
    it('returns rich simplified concept for average speed harmonic mean', () => {
      const concept = getSimplifiedConcept(
        'speed_distance',
        sampleSpeedQuestion.text,
        '50 km/h',
        '48 km/h'
      );
      expect(concept.headline).toBeDefined();
      expect(concept.oneLineIntuition).toContain('slow speed dominates');
      expect(concept.everydayAnalogy).toContain('walking');
      expect(concept.eli5Explanation).toContain('Distance divided by Time');
      expect(concept.formulaBreakdown).toContain('2·A·B');
      expect(concept.miniPractice.question).toBeDefined();
      expect(concept.miniPractice.answer).toBeDefined();
    });

    it('returns concept for unit conversion in speed and distance', () => {
      const concept = getSimplifiedConcept(
        'speed_distance',
        'A train of length 150m runs at 72 km/h',
        '10s',
        '7.5s'
      );
      expect(concept.eli5Explanation).toContain('5/18');
      expect(concept.formulaBreakdown).toContain('5/18');
    });

    it('returns simplified concept for successive percentage discounts', () => {
      const concept = getSimplifiedConcept(
        'percentages',
        'Find equivalent discount of successive discounts 20% and 10%',
        '30%',
        '28%'
      );
      expect(concept.oneLineIntuition).toContain('discounted price');
      expect(concept.everydayAnalogy).toContain('jacket');
      expect(concept.formulaBreakdown).toContain('A + B - (A × B)');
    });

    it('returns simplified concept for time and work inverted rates', () => {
      const concept = getSimplifiedConcept(
        'time_work',
        'A does work in 6 days and B in 12 days',
        '9 days',
        '4 days'
      );
      expect(concept.oneLineIntuition).toContain('LESS than the fastest person');
      expect(concept.eli5Explanation).toContain('ONE day');
      expect(concept.formulaBreakdown).toContain('(A × B) / (A + B)');
    });

    it('returns simplified concept for probability', () => {
      const concept = getSimplifiedConcept(
        'probability',
        'What is the probability of rolling a 7 on two dice',
        '1/12',
        '1/6'
      );
      expect(concept.eli5Explanation).toContain('winning results');
      expect(concept.formulaBreakdown).toContain('P(Event)');
    });

    it('returns simplified concept for fractions and ratios', () => {
      const concept = getSimplifiedConcept(
        'fractions',
        'Divide 100 in the ratio 2:3',
        '50 and 50',
        '40 and 60'
      );
      expect(concept.oneLineIntuition).toContain('parts');
      expect(concept.eli5Explanation).toContain('attach an "x"');
    });

    it('returns simplified concept for series and sequence patterns', () => {
      const concept = getSimplifiedConcept(
        'series',
        'What is the next number in sequence 2, 5, 10, 17',
        '24',
        '26'
      );
      expect(concept.oneLineIntuition).toContain('difference between the differences');
      expect(concept.miniPractice.answer).toBe('26');
    });

    it('handles fallback logic category gracefully', () => {
      const concept = getSimplifiedConcept(
        'logic',
        'All cats are animals. Felix is a cat.',
        'False',
        'True'
      );
      expect(concept.headline).toBeDefined();
      expect(concept.oneLineIntuition).toBeDefined();
    });
  });

  describe('getSuggestedDoubts', () => {
    it('returns suggested doubts tailored to speed and distance', () => {
      const doubts = getSuggestedDoubts('speed_distance', sampleSpeedQuestion, '50 km/h');
      expect(doubts.length).toBeGreaterThanOrEqual(3);
      expect(doubts[0]).toContain('average speed');
    });

    it('returns suggested doubts tailored to time and work', () => {
      const doubts = getSuggestedDoubts(
        'time_work',
        { ...sampleSpeedQuestion, category: 'time_work' },
        '9 days'
      );
      expect(doubts.length).toBeGreaterThanOrEqual(3);
      expect(doubts.some((d) => d.includes('days') || d.includes('rate'))).toBe(true);
    });
  });

  describe('createInitialConversation', () => {
    it('creates initial pedagogical welcoming message from Koji', () => {
      const msgs = createInitialConversation(sampleSpeedQuestion, 0, 1);
      expect(msgs).toHaveLength(1);
      expect(msgs[0].sender).toBe('koji');
      expect(msgs[0].text).toContain('Tutor Koji');
      expect(msgs[0].text).toContain('50 km/h');
      expect(msgs[0].text).toContain('48 km/h');
      expect(msgs[0].suggestedQuestions).toBeDefined();
      expect(msgs[0].suggestedQuestions!.length).toBeGreaterThan(0);
    });
  });

  describe('answerUserDoubt', () => {
    it('answers simplification and ELI5 doubts with simplified explanation', async () => {
      const reply = await answerUserDoubt({
        question: sampleSpeedQuestion,
        chosenIndex: 0,
        userDoubt: 'Can you explain like I am 10 years old? Keep it simple.',
        history: [],
      });

      expect(reply.sender).toBe('koji');
      expect(reply.text).toContain('super simple');
      expect(reply.suggestedQuestions).toBeDefined();
    });

    it('answers analogy requests with real-world pictures', async () => {
      const reply = await answerUserDoubt({
        question: sampleSpeedQuestion,
        chosenIndex: 0,
        userDoubt: 'Give me an everyday real-world analogy for this.',
        history: [],
      });

      expect(reply.sender).toBe('koji');
      expect(reply.text).toContain('everyday picture');
      expect(reply.text).toContain('walking');
    });

    it('answers why the chosen answer was tempting', async () => {
      const reply = await answerUserDoubt({
        question: sampleSpeedQuestion,
        chosenIndex: 0,
        userDoubt: 'Why is 50 km/h wrong? I thought adding and dividing by 2 makes sense.',
        history: [],
      });

      expect(reply.sender).toBe('koji');
      expect(reply.text).toContain('sneaky trap');
      expect(reply.text).toContain('50 km/h');
      expect(reply.text).toContain('48 km/h');
    });

    it('answers formula questions with variable breakdown', async () => {
      const reply = await answerUserDoubt({
        question: sampleSpeedQuestion,
        chosenIndex: 0,
        userDoubt: 'Where did the formula come from and why is there a 2?',
        history: [],
      });

      expect(reply.sender).toBe('koji');
      expect(reply.text).toContain('formula');
      expect(reply.text).toContain('2·A·B');
    });

    it('answers practice requests with mini challenge problem', async () => {
      const reply = await answerUserDoubt({
        question: sampleSpeedQuestion,
        chosenIndex: 0,
        userDoubt: 'Give me another practice question to test myself!',
        history: [],
      });

      expect(reply.sender).toBe('koji');
      expect(reply.text).toContain('mini challenge');
      expect(reply.text).toContain('Problem');
      expect(reply.text).toContain('Answer');
    });

    it('celebrates when the student says they understood', async () => {
      const reply = await answerUserDoubt({
        question: sampleSpeedQuestion,
        chosenIndex: 0,
        userDoubt: 'Thank you Koji, I understood now! Makes total sense.',
        history: [],
      });

      expect(reply.sender).toBe('koji');
      expect(reply.text).toContain('music to my ears');
    });

    it('gracefully handles general doubts and questions', async () => {
      const reply = await answerUserDoubt({
        question: sampleSpeedQuestion,
        chosenIndex: 0,
        userDoubt: 'I am not sure how to solve this step by step.',
        history: [],
      });

      expect(reply.sender).toBe('koji');
      expect(reply.text.length).toBeGreaterThan(20);
      expect(reply.suggestedQuestions?.length).toBeGreaterThan(0);
    });
  });
});
