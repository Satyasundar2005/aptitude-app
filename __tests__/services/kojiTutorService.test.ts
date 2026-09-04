import { generateKojiCorrection } from '../../src/services/kojiTutorService';
import { Question } from '../../src/types/game';

describe('kojiTutorService', () => {
  const baseQuestion: Question = {
    id: 'test-q1',
    text: 'A car travels at 60 km/h and returns at 40 km/h. What is the average speed?',
    options: ['50 km/h', '48 km/h', '52 km/h', '45 km/h'],
    correctIndex: 1, // '48 km/h'
    category: 'speed_distance',
    difficulty: 'medium',
    timeLimit: 30,
    explanation: 'Average speed for equal distances is (2 * 60 * 40)/(60 + 40) = 48 km/h.',
  };

  it('generates a complete KojiExplanation with all required pedagogical fields', () => {
    const correction = generateKojiCorrection(baseQuestion, 0); // picked '50 km/h' (the trap)

    expect(correction.tutorGreeting).toBeDefined();
    expect(correction.tutorGreeting.length).toBeGreaterThan(5);
    expect(correction.trapAnalysis).toBeDefined();
    expect(correction.conceptKey).toBeDefined();
    expect(correction.stepByStep.length).toBeGreaterThanOrEqual(2);
    expect(correction.correctAnswer).toBe('48 km/h');
    expect(correction.wrongAnswerPicked).toBe('50 km/h');
    expect(correction.proTip).toContain("Koji's Rule");
    expect(correction.encouragement.length).toBeGreaterThan(5);
    expect(correction.mood).toBe('encouraging');
  });

  it('correctly diagnoses the harmonic mean trap for average speed problems', () => {
    const correction = generateKojiCorrection(baseQuestion, 0);
    expect(correction.conceptKey).toContain('Harmonic Mean');
    expect(correction.trapAnalysis).toContain('simple average');
    expect(correction.proTip).toContain('strictly LESS than the simple arithmetic average');
  });

  it('correctly diagnoses unit conversion in distance & speed problems', () => {
    const q: Question = {
      ...baseQuestion,
      text: 'A train 150m long travels at 72 km/h. How long to cross a pole?',
      options: ['10s', '7.5s', '15s', '5s'],
      correctIndex: 1,
    };
    const correction = generateKojiCorrection(q, 0);
    expect(correction.conceptKey).toContain('Conversion');
    expect(correction.trapAnalysis).toContain('mix units');
    expect(correction.proTip).toContain('5/18 m/s');
  });

  it('diagnoses successive percentage and discount traps', () => {
    const q: Question = {
      ...baseQuestion,
      category: 'percentages',
      text: 'Find single discount equivalent to successive discounts of 20% and 10%.',
      options: ['30%', '28%', '25%', '27%'],
      correctIndex: 1, // 28%
    };
    const correction = generateKojiCorrection(q, 0); // picked 30%
    expect(correction.conceptKey).toContain('Successive Percentage');
    expect(correction.trapAnalysis).toContain('added the percentages directly');
    expect(correction.proTip).toContain('assuming an initial value of 100');
  });

  it('diagnoses percentage base value traps', () => {
    const q: Question = {
      ...baseQuestion,
      category: 'percentages',
      text: 'What is the profit percentage on an article sold at Rs. 120?',
      options: ['20%', '25%', '15%', '30%'],
      correctIndex: 1,
    };
    const correction = generateKojiCorrection(q, 0);
    expect(correction.conceptKey).toContain('Percentage Base');
    expect(correction.trapAnalysis).toContain('wrong base value');
    expect(correction.proTip).toContain('Profit% is ALWAYS calculated on Cost Price');
  });

  it('diagnoses time and work inverted rates trap', () => {
    const q: Question = {
      ...baseQuestion,
      category: 'time_work',
      text: 'A can do a piece of work in 6 days and B in 12 days. In how many days working together?',
      options: ['9 days', '4 days', '18 days', '6 days'],
      correctIndex: 1, // 4 days
    };
    const correction = generateKojiCorrection(q, 0); // picked 9 days (average)
    expect(correction.conceptKey).toContain('Work Rates');
    expect(correction.trapAnalysis).toContain('adding the days directly');
    expect(correction.proTip).toContain('finish faster than the single fastest worker');
  });

  it('diagnoses probability and combinations traps', () => {
    const q: Question = {
      ...baseQuestion,
      category: 'probability',
      text: 'What is the probability of drawing two aces consecutively without replacement?',
      options: ['1/169', '1/221', '4/52', '2/52'],
      correctIndex: 1,
    };
    const correction = generateKojiCorrection(q, 0);
    expect(correction.conceptKey).toContain('Sample Space');
    expect(correction.proTip).toContain('P(Event) + P(Not Event) = 1');
  });

  it('diagnoses fractions and ratio proportions traps', () => {
    const q: Question = {
      ...baseQuestion,
      category: 'fractions',
      text: 'Divide 60 in the ratio 2:3.',
      options: ['30 and 30', '24 and 36', '20 and 40', '10 and 50'],
      correctIndex: 1,
    };
    const correction = generateKojiCorrection(q, 0);
    expect(correction.conceptKey).toContain('Proportions');
    expect(correction.proTip).toContain('introduce an "x" multiplier');
  });

  it('diagnoses series and pattern progression traps', () => {
    const q: Question = {
      ...baseQuestion,
      category: 'series',
      text: 'Find the next number in sequence: 2, 5, 10, 17, ?',
      options: ['24', '26', '25', '28'],
      correctIndex: 1,
    };
    const correction = generateKojiCorrection(q, 0);
    expect(correction.conceptKey).toContain('Pattern Recognition');
    expect(correction.trapAnalysis).toContain('constant addition');
    expect(correction.stepByStep[1]).toContain('differences of differences');
    expect(correction.proTip).toContain("Koji's Rule");
  });

  it('gracefully handles missing explanation and fallback categories', () => {
    const q: Question = {
      id: 'custom-q',
      text: 'Which logical deduction is valid?',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 2,
      category: 'logic',
      difficulty: 'hard',
      timeLimit: 30,
    };
    const correction = generateKojiCorrection(q, 0);
    expect(correction.conceptKey).toContain('LOGIC Reasoning');
    expect(correction.correctAnswer).toBe('C');
    expect(correction.wrongAnswerPicked).toBe('A');
    expect(correction.stepByStep.length).toBeGreaterThan(0);
  });

  it('handles out of bounds index cleanly without crashing', () => {
    const correction = generateKojiCorrection(baseQuestion, 99);
    expect(correction.wrongAnswerPicked).toBe('your choice');
    expect(correction.correctAnswer).toBe('48 km/h');
  });
});
