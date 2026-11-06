// node --test tools/market-research
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addMonths, buildIndex, compareRuns, countTechnologies, coverage, rank, roadmapTopics, validatePostings } from './lib.mjs';

const taxonomy = [
  { name: 'C#', category: 'Core stack', relevance: 3, aliases: [], roadmap: ['cs-basics'] },
  { name: 'Docker', category: 'Cloud', relevance: 3, aliases: ['Containers'], roadmap: ['devops-docker'], terms: ['docker'] },
  { name: 'Redis', category: 'Backend', relevance: 2, aliases: [], roadmap: [], terms: ['redis'] },
  { name: 'Kafka', category: 'Backend', relevance: 2, aliases: [], roadmap: [] },
  { name: 'PHP', category: 'Other', relevance: 1, aliases: [], roadmap: [] },
];
const config = {
  coreStack: ['C#'], taxonomy, relevanceWeight: { 3: 1, 2: 0.8, 1: 0.5 },
  thresholds: { addMinShare: 30, addMinPostings: 2, addMinRelevance: 2, watchMinPostings: 2 },
};
const index = buildIndex(taxonomy);
const posting = (ref, required, preferred = [], extra = {}) =>
  ({ ref, title: 'Dev ' + ref, company: 'Co ' + ref, posted: '2026-10-01', level: 'Mid', region: 'Europe', required, preferred, ...extra });
const phases = [{ slug: 'p', order: 1, topics: [
  { slug: 'cs-basics', titleEn: 'C#', summaryEn: 'Basics' },
  { slug: 'api-perf', titleEn: 'Performance', summaryEn: 'Use Redis for distributed caching.' },
] }];

test('a technology named twice in one posting (alias, or required and preferred) counts once, as required', () => {
  const stats = countTechnologies([posting('a', ['Docker', 'C#'], ['Containers'])], index);
  const docker = stats.find(s => s.name === 'Docker');
  assert.equal(docker.postings, 1);
  assert.equal(docker.required, 1);
  assert.equal(docker.preferred, 0);
  assert.equal(docker.share, 100);
});

test('postings outside the period, duplicates and unknown technologies are reported', () => {
  const run = { periodFrom: '2026-08-06', periodTo: '2026-11-06', postings: [
    posting('a', ['C#']),
    posting('a', ['C#']),                                   // same link
    posting('b', ['C#'], [], { company: 'Co a', title: 'Dev a' }),   // same company, title and date
    posting('c', ['C#'], [], { posted: '2026-05-01' }),
    posting('d', ['Cobol']),
  ] };
  const { postings, problems } = validatePostings(run, index);
  assert.deepEqual(postings.map(p => p.ref), ['a', 'd']);
  assert.equal(problems.length, 4);
  assert.match(problems.join('\n'), /unclassified technology "Cobol"/);
});

test('coverage tells a dedicated topic from a passing mention and from nothing', () => {
  const topics = roadmapTopics(phases);
  assert.equal(coverage(taxonomy[0], topics).status, 'covered');
  assert.deepEqual(coverage(taxonomy[2], topics), { status: 'mentioned', topics: ['api-perf'] });
  assert.equal(coverage(taxonomy[1], topics).status, 'missing');   // its topic doesn't exist yet
});

test('ranking leaves out the core stack and only recommends adding well-evidenced, relevant gaps', () => {
  const postings = [
    posting('1', ['C#', 'Docker', 'Kafka', 'PHP']), posting('2', ['C#', 'Docker'], ['Redis']),
    posting('3', ['C#', 'PHP']), posting('4', ['C#'], ['Redis']),
  ];
  const ranked = rank(countTechnologies(postings, index), config, roadmapTopics(phases), postings.length);
  const by = Object.fromEntries(ranked.map(r => [r.name, r]));
  assert.equal(by['C#'], undefined);
  assert.equal(by.Docker.recommendation, 'add');        // 50% of postings, required, missing from the roadmap
  assert.equal(by.Redis.recommendation, 'improve');     // 50%, but already mentioned in a topic
  assert.equal(by.Kafka.recommendation, 'ignore');      // one posting only
  assert.equal(by.PHP.recommendation, 'watch');         // frequent enough, but not relevant to the stack
  assert.equal(ranked[0].name, 'Docker');
});

test('runs are compared by rank and share', () => {
  const changes = compareRuns([{ name: 'Docker', share: 50 }, { name: 'Redis', share: 30 }], [{ name: 'Redis', share: 40 }, { name: 'Kafka', share: 10 }]);
  assert.deepEqual(changes.added, ['Docker']);
  assert.deepEqual(changes.dropped, ['Kafka']);
  assert.deepEqual(changes.moved, [{ name: 'Redis', from: 1, to: 2, shareChange: -10 }]);
});

test('research periods are counted in calendar months', () => {
  assert.equal(addMonths('2026-11-06', -3), '2026-08-06');
});

test('an alias may belong to one technology only', () => {
  assert.throws(() => buildIndex([{ name: 'A', aliases: ['x'] }, { name: 'B', aliases: ['X'] }]), /used by two technologies/);
});
