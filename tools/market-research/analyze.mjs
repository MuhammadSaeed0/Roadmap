// Analyses one research run and writes its demand ranking and roadmap gap analysis.
//
//   node tools/market-research/analyze.mjs                 the newest run in docs/market-research/runs
//   node tools/market-research/analyze.mjs 2026-11-06      a given run
//   node tools/market-research/analyze.mjs --check         only validate (exit 1 on problems), write nothing
//   node tools/market-research/analyze.mjs --baseline <dir>
//        compare the run with another copy of the roadmap seed (e.g. the roadmap before a change, exported with
//        `git archive`); writes analysis-baseline.json/.md only
//
// Reads   docs/market-research/runs/<run>/postings.json, tools/market-research/config.json and the roadmap seed
//         (backend/DevPath.Api/SeedData/roadmap/*.json).
// Writes  docs/market-research/runs/<run>/analysis.json and analysis.md (generated), the run's line in
//         docs/market-research/history.json and, for the newest run, backend/DevPath.Api/SeedData/market-demand.json
//         (the demand shown on each topic page). Analyses of older runs are never rewritten without --force, and the
//         hand-written REPORT.md of a run is never touched.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildIndex, compareRuns, countTechnologies, coverage, distribution, rank, roadmapTopics, validatePostings } from './lib.mjs';

const root = resolve(import.meta.dirname, '..', '..');
const runsDir = join(root, 'docs', 'market-research', 'runs');
const historyFile = join(root, 'docs', 'market-research', 'history.json');
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const force = args.includes('--force');
const baselineDir = args.includes('--baseline') ? resolve(args[args.indexOf('--baseline') + 1]) : null;

const runs = readdirSync(runsDir).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
const runName = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--baseline') ?? runs.at(-1);
if (!runs.includes(runName)) throw new Error(`No run "${runName}" in ${runsDir}`);
const isLatest = runName === runs.at(-1);
const runDir = join(runsDir, runName);

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const config = readJson(join(import.meta.dirname, 'config.json'));
const run = readJson(join(runDir, 'postings.json'));
const seedDir = baselineDir ?? join(root, 'backend', 'DevPath.Api', 'SeedData', 'roadmap');
const phases = readdirSync(seedDir).filter(f => f.endsWith('.json')).sort().map(f => readJson(join(seedDir, f)));

const index = buildIndex(config.taxonomy);
const { postings, problems } = validatePostings(run, index);
const topics = roadmapTopics(phases);
const missingSlugs = config.taxonomy.flatMap(t => (t.roadmap ?? []).filter(s => !topics.has(s)).map(s => `${t.name} → ${s}`));

if (problems.length) {
  console.error(`Problems in ${runName}/postings.json:\n  ` + problems.join('\n  '));
  process.exit(1);
}
if (checkOnly) { console.log(`${runName}: ${postings.length} postings, no problems.`); process.exit(0); }

if (!baselineDir && !isLatest && !force && existsSync(join(runDir, 'analysis.json'))) {
  console.error(`${runName} is an older run and already analysed; pass --force to rewrite its analysis.`);
  process.exit(1);
}

const stats = countTechnologies(postings, index);
const ranking = rank(stats, config, topics, postings.length);
const previousName = runs[runs.indexOf(runName) - 1];
const previous = previousName && existsSync(join(runsDir, previousName, 'analysis.json'))
  ? readJson(join(runsDir, previousName, 'analysis.json')).ranking : null;
const changes = compareRuns(ranking, previous);
const core = stats.filter(s => config.coreStack.includes(s.name)).sort((a, b) => b.postings - a.postings);

const analysis = {
  run: runName, period: { from: run.periodFrom, to: run.periodTo }, source: run.source,
  postings: postings.length, excluded: run.excluded?.length ?? 0, duplicates: run.duplicates?.length ?? 0,
  regions: distribution(postings, 'region'), countries: distribution(postings, 'country'), levels: distribution(postings, 'level'),
  remote: postings.filter(p => p.remote).length,
  coreStack: core.map(s => ({ name: s.name, postings: s.postings, share: s.share })),
  ranking: ranking.map(r => ({
    name: r.name, category: r.category, relevance: r.relevance, postings: r.postings, share: r.share,
    required: r.required, preferred: r.preferred, requiredShare: r.requiredShare, score: r.score,
    coverage: r.coverage.status, roadmapTopics: r.coverage.topics.slice(0, 6), recommendation: r.recommendation,
    levels: r.levels, regions: r.regions, companies: r.companies,
  })),
  changesSincePrevious: changes ? { previousRun: previousName, ...changes } : null,
  taxonomySlugsNotInRoadmap: missingSlugs,
};
const outName = baselineDir ? 'analysis-baseline' : 'analysis';
if (baselineDir) analysis.baselineRoadmap = baselineDir;
writeFileSync(join(runDir, `${outName}.json`), JSON.stringify(analysis, null, 2) + '\n');

// ---------- Markdown summary ----------
const pct = (n) => `${n}%`;
const lines = [
  `# Demand analysis — run ${runName}${baselineDir ? ' (against the baseline roadmap)' : ''}`,
  '',
  `_Generated by \`tools/market-research/analyze.mjs\` from \`postings.json\`. Do not edit; re-run the script instead._`,
  '',
  `- Postings analysed: **${postings.length}** (period ${run.periodFrom} to ${run.periodTo}; ${analysis.excluded} excluded, ${analysis.duplicates} duplicates removed)`,
  `- Regions: ${Object.entries(analysis.regions).map(([k, v]) => `${k} ${v}`).join(', ')}`,
  `- Levels: ${Object.entries(analysis.levels).map(([k, v]) => `${k} ${v}`).join(', ')}; remote: ${analysis.remote}`,
  '',
  '## Core stack (for reference)',
  '',
  '| Technology | Postings | Share |', '|---|---|---|',
  ...analysis.coreStack.map(c => `| ${c.name} | ${c.postings} | ${pct(c.share)} |`),
  '',
  '## Additional technologies, ranked',
  '',
  'Score = (required + 0.5 × preferred) ÷ postings × 100 × relevance weight. Coverage: covered = dedicated topic, mentioned = named inside other topics, missing = absent.',
  '',
  '| # | Technology | Category | Postings | Share | Required | Preferred | Score | Roadmap | Recommendation |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...analysis.ranking.map((r, i) =>
    `| ${i + 1} | ${r.name} | ${r.category} | ${r.postings} | ${pct(r.share)} | ${r.required} | ${r.preferred} | ${r.score} | ${r.coverage}${r.roadmapTopics.length ? ` (${r.roadmapTopics.slice(0, 3).join(', ')})` : ''} | **${r.recommendation}** |`),
  '',
];
if (changes) {
  lines.push(`## Changes since ${previousName}`, '',
    `- New: ${changes.added.join(', ') || 'none'}`, `- Dropped: ${changes.dropped.join(', ') || 'none'}`,
    ...changes.moved.slice(0, 20).map(m => `- ${m.name}: rank ${m.from} → ${m.to} (share ${m.shareChange >= 0 ? '+' : ''}${m.shareChange} pts)`), '');
}
if (missingSlugs.length) lines.push('## Taxonomy slugs not (yet) in the roadmap', '', ...missingSlugs.map(s => `- ${s}`), '');
writeFileSync(join(runDir, `${outName}.md`), lines.join('\n'));
if (baselineDir) {
  console.log(`${runName}: baseline analysis written (${outName}.json, ${outName}.md).`);
  process.exit(0);
}

// ---------- History (one line per run; earlier runs are kept) ----------
const history = existsSync(historyFile) ? readJson(historyFile) : { runs: [] };
history.runs = history.runs.filter(h => h.run !== runName);
history.runs.push({
  run: runName, period: analysis.period, postings: postings.length, regions: analysis.regions,
  top: analysis.ranking.slice(0, 15).map(r => ({ name: r.name, share: r.share, recommendation: r.recommendation })),
  add: analysis.ranking.filter(r => r.recommendation === 'add').map(r => r.name),
  improve: analysis.ranking.filter(r => r.recommendation === 'improve').map(r => r.name),
});
history.runs.sort((a, b) => a.run.localeCompare(b.run));
writeFileSync(historyFile, JSON.stringify(history, null, 2) + '\n');

// ---------- Demand per roadmap topic (newest run only), read by the seeder ----------
if (isLatest) {
  const demand = {};
  const coreRows = stats.filter(s => config.coreStack.includes(s.name))
    .map(s => ({ ...s, coverage: coverage(index.get(s.name.toLowerCase()), topics) }));
  for (const r of [...coreRows, ...ranking]) {
    if (r.coverage.status !== 'covered') continue;
    for (const slug of r.coverage.topics) (demand[slug] ??= []).push({ technology: r.name, postings: r.postings, required: r.required, share: r.share });
  }
  for (const rows of Object.values(demand)) rows.sort((a, b) => b.share - a.share || a.technology.localeCompare(b.technology));
  writeFileSync(join(root, 'backend', 'DevPath.Api', 'SeedData', 'market-demand.json'), JSON.stringify({
    $comment: 'Generated by tools/market-research/analyze.mjs from the newest research run. Do not edit; re-run the script.',
    run: runName, periodFrom: run.periodFrom, periodTo: run.periodTo, postings: postings.length, source: run.source,
    topics: Object.fromEntries(Object.entries(demand).sort(([a], [b]) => a.localeCompare(b))),
  }, null, 2) + '\n');
}

console.log(`${runName}: ${postings.length} postings, ${analysis.ranking.length} additional technologies.`);
console.log(`add: ${history.runs.at(-1).add.join(', ') || 'none'}`);
console.log(`improve: ${history.runs.at(-1).improve.join(', ') || 'none'}`);
