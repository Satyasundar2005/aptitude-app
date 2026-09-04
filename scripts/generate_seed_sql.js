const fs = require('fs');
const path = require('path');

// Read questionGenerator.ts to extract CURATED_PYQS
const qGenPath = path.join(__dirname, '..', 'src', 'services', 'questionGenerator.ts');
const content = fs.readFileSync(qGenPath, 'utf8');

const match = content.match(/export const CURATED_PYQS: PyqTemplate\[\] = (\[[\s\S]*?\n\];)/);

if (!match) {
  console.error('Could not find CURATED_PYQS in questionGenerator.ts');
  process.exit(1);
}

// Evaluate CURATED_PYQS safely
let pyqs = [];
try {
  const jsonLike = match[1].replace(/;$/, '');
  pyqs = eval(jsonLike);
} catch (e) {
  console.error('Failed to parse pyqs:', e.message);
  process.exit(1);
}

console.log(`Found ${pyqs.length} curated PYQs to export.`);

function escapeSql(str) {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

let sql = `-- ==============================================================================
-- Curated Exam Questions Seed (${pyqs.length} Verified PYQs)
-- ==============================================================================

INSERT INTO public.questions (
  id,
  text,
  options,
  correct_index,
  category,
  difficulty,
  time_limit,
  exam_track,
  exam_tag,
  explanation
) VALUES\n`;

const rows = pyqs.map((q, idx) => {
  const id = escapeSql(`pyq_${q.examTrack}_${idx + 1}`);
  const text = escapeSql(q.text);
  const optionsJson = escapeSql(JSON.stringify(q.options));
  const correctIdx = q.correctIndex ?? 0;
  const category = escapeSql(q.category);
  const difficulty = escapeSql(q.difficulty);
  const timeLimit = q.difficulty === 'hard' ? 30 : q.difficulty === 'medium' ? 45 : 60;
  const examTrack = escapeSql(q.examTrack);
  const examTag = escapeSql(q.examTag || '');
  const explanation = escapeSql(q.explanation || '');

  return `  (${id}, ${text}, ${optionsJson}::jsonb, ${correctIdx}, ${category}, ${difficulty}, ${timeLimit}, ${examTrack}, ${examTag}, ${explanation})`;
});

sql += rows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n';

const outPath = path.join(__dirname, '..', 'supabase', 'seed_pyqs.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`Successfully generated ${outPath} with ${pyqs.length} questions!`);
