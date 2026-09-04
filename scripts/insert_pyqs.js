/**
 * Direct Question/PYQ Inserter for Supabase
 * Usage:
 *   node scripts/insert_pyqs.js [path-to-json-file]
 * 
 * If no path is provided, it reads from `scripts/new_questions.json`
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found at', envPath);
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8');
const urlMatch = env.match(/EXPO_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/EXPO_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error('Error: Supabase URL or Anon key missing in .env');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    console.error('Error: Provided data is not an array or is empty.');
    return;
  }

  console.log(`\n⏳ Preparing to insert ${questions.length} question(s) into Supabase...`);

  const formatted = questions.map((q, idx) => {
    // Generate id if not provided
    const id = q.id || `pyq_${q.examTrack || q.exam_track || 'gen'}_${Date.now()}_${idx + 1}`;
    const options = Array.isArray(q.options) ? q.options : [];
    const correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : (q.correct_index ?? 0);
    const difficulty = q.difficulty || 'medium';
    const timeLimit = q.timeLimit || q.time_limit || (difficulty === 'hard' ? 30 : difficulty === 'medium' ? 45 : 60);

    return {
      id,
      text: q.text,
      options,
      correct_index: correctIndex,
      category: q.category || 'arithmetic',
      difficulty,
      time_limit: timeLimit,
      exam_track: q.examTrack || q.exam_track || 'all',
      exam_tag: q.examTag || q.exam_tag || '',
      explanation: q.explanation || '',
      is_verified: true,
    };
  });

  const { data, error } = await supabase
    .from('questions')
    .upsert(formatted, { onConflict: 'id' })
    .select('id');

  if (error) {
    console.error('❌ Insertion failed:', error.message);
    if (error.details) console.error('Details:', error.details);
    return false;
  }

  console.log(`✅ Successfully inserted/updated ${data.length} question(s)!`);

  // Get new total
  const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  console.log(`📊 Total questions now in Supabase: ${count}\n`);
  return true;
}

// Check command line arguments or default file
const targetFile = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(__dirname, 'new_questions.json');

if (fs.existsSync(targetFile)) {
  try {
    const raw = fs.readFileSync(targetFile, 'utf8');
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    insertQuestions(list);
  } catch (err) {
    console.error('Error reading JSON file:', err.message);
  }
} else {
  console.log(`No JSON file specified and '${targetFile}' does not exist.`);
  console.log('You can create a JSON file or pass questions to insertQuestions().');
}

module.exports = { insertQuestions };
