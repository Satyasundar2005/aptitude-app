-- ==============================================================================
-- ApptiClash Supabase Seed Data (Sample Questions & Verified PYQs)
-- ==============================================================================

insert into public.questions (id, text, options, correct_index, category, difficulty, time_limit, exam_track, exam_tag, explanation)
values
(
    'seed_gate_001',
    'A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?',
    '["120 metres", "150 metres", "180 metres", "324 metres"]'::jsonb,
    1,
    'speed_distance',
    'easy',
    60,
    'gate',
    'GATE CS 2022',
    'Speed = 60 * (5/18) = 50/3 m/sec. Length = Speed * Time = (50/3) * 9 = 150 metres.'
),
(
    'seed_gate_002',
    'If 12 men can finish a piece of work in 30 days, how many men are needed to complete the same work in 20 days?',
    '["15", "18", "20", "24"]'::jsonb,
    1,
    'time_work',
    'easy',
    60,
    'gate',
    'GATE General Aptitude',
    'M1 * D1 = M2 * D2 => 12 * 30 = M2 * 20 => M2 = 360 / 20 = 18 men.'
),
(
    'seed_cat_001',
    'A shopkeeper sells two items at Rs. 990 each, one at a profit of 10% and the other at a loss of 10%. What is his overall gain or loss percentage?',
    '["No profit no loss", "1% loss", "1% gain", "2% loss"]'::jsonb,
    1,
    'percentages',
    'medium',
    45,
    'cat',
    'CAT Quant',
    'When two items are sold at the same price, one at x% profit and other at x% loss, there is always a loss of (x/10)^2 % = (10/10)^2 = 1% loss.'
),
(
    'seed_cat_002',
    'Find the remainder when 7^84 is divided by 342.',
    '["1", "7", "49", "341"]'::jsonb,
    0,
    'algebra',
    'hard',
    30,
    'cat',
    'CAT Advanced Numbers',
    'Notice 7^3 = 343 = 342 + 1. So 7^84 = (7^3)^28 = (342 + 1)^28. Remainder when divided by 342 is 1^28 = 1.'
),
(
    'seed_gre_001',
    'Quantity A: The area of a circle with radius 5. Quantity B: The area of a square with side length 9.',
    '["Quantity A is greater", "Quantity B is greater", "The two quantities are equal", "Relationship cannot be determined"]'::jsonb,
    1,
    'quantitative_comparison',
    'medium',
    45,
    'gre',
    'GRE Quant Comparison',
    'Area of circle = pi * r^2 = 3.1415 * 25 ≈ 78.54. Area of square = 9^2 = 81. Therefore, Quantity B is greater.'
),
(
    'seed_gre_002',
    'If 3x + 7y = 26 and 4x - y = 14, what is the value of x * y?',
    '["8", "10", "12", "14"]'::jsonb,
    0,
    'algebra',
    'easy',
    60,
    'gre',
    'GRE Algebra',
    'From second equation, y = 4x - 14. Substitute into first: 3x + 7(4x - 14) = 26 => 31x - 98 = 26 => 31x = 124 => x = 4. Then y = 4(4) - 14 = 2. Product x * y = 4 * 2 = 8.'
),
(
    'seed_ese_001',
    'Which ethical framework holds that the morality of an action is determined primarily by its consequences?',
    '["Deontology", "Virtue Ethics", "Utilitarianism", "Contractarianism"]'::jsonb,
    2,
    'ethics_project_mgmt',
    'easy',
    60,
    'ese',
    'ESE Paper-1 Ethics',
    'Utilitarianism (consequentialism) determines moral rightness strictly on outcomes/utility produced for the greatest number.'
),
(
    'seed_placement_001',
    'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
    '["1/3", "1/8", "2/8", "1/16"]'::jsonb,
    1,
    'series',
    'easy',
    60,
    'placement',
    'TCS NQT / Infosys',
    'Each term is divided by 2 (multiplied by 1/2). Next term is (1/4) / 2 = 1/8.'
),
(
    'seed_placement_002',
    'Two dice are rolled together. What is the probability that the sum of the scores is a prime number?',
    '["5/12", "7/18", "15/36", "13/36"]'::jsonb,
    0,
    'probability',
    'medium',
    45,
    'placement',
    'Cognizant / Wipro',
    'Possible prime sums are 2, 3, 5, 7, 11. Sum 2: 1 way; Sum 3: 2 ways; Sum 5: 4 ways; Sum 7: 6 ways; Sum 11: 2 ways. Total favorable outcomes = 1+2+4+6+2 = 15. Probability = 15/36 = 5/12.'
),
(
    'seed_banking_001',
    'A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The principal sum is:',
    '["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"]'::jsonb,
    2,
    'arithmetic',
    'medium',
    45,
    'banking',
    'IBPS PO / SBI PO',
    'Simple interest for 1 year = 854 - 815 = Rs. 39. Interest for 3 years = 39 * 3 = Rs. 117. Principal = 815 - 117 = Rs. 698.'
)
on conflict (id) do nothing;
