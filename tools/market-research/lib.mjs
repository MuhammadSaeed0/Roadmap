// Job-market analysis for the DevPath roadmap: counts the technologies in a run's job postings, ranks the ones
// beyond the core stack, checks how the roadmap covers each of them and compares the run with the previous one.
// Pure functions only (no file access), so they can be unit-tested: see analyze.mjs for the command line.

/** Lower-case key used to match technology names and aliases. */
const key = (s) => s.trim().toLowerCase();

/** name or alias -> taxonomy entry. */
export function buildIndex(taxonomy) {
  const index = new Map();
  for (const entry of taxonomy) {
    for (const name of [entry.name, ...(entry.aliases ?? [])]) {
      const k = key(name);
      if (index.has(k) && index.get(k) !== entry) throw new Error(`Taxonomy: "${name}" is used by two technologies`);
      index.set(k, entry);
    }
  }
  return index;
}

/** Adds months to a YYYY-MM-DD date and returns YYYY-MM-DD. */
export function addMonths(date, months) {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

/**
 * Checks a run's postings: inside the period, no duplicates (same link, or same company + title + date),
 * every technology known to the taxonomy. Returns the postings to count and the problems found.
 */
export function validatePostings(run, index) {
  const problems = [];
  const seenRefs = new Set(), seenAdverts = new Set();
  const kept = [];
  for (const p of run.postings) {
    if (p.posted < run.periodFrom || p.posted > run.periodTo) { problems.push(`${p.ref}: posted ${p.posted}, outside ${run.periodFrom}..${run.periodTo}`); continue; }
    const advert = key(`${p.company}|${p.title}|${p.posted}`);
    if (seenRefs.has(p.ref) || seenAdverts.has(advert)) { problems.push(`${p.ref}: duplicate of an earlier posting`); continue; }
    seenRefs.add(p.ref); seenAdverts.add(advert);
    for (const t of [...(p.required ?? []), ...(p.preferred ?? [])]) {
      if (!index.has(key(t))) problems.push(`${p.ref}: unclassified technology "${t}" (add it to the taxonomy)`);
    }
    kept.push(p);
  }
  return { postings: kept, problems };
}

/**
 * Per technology: in how many distinct postings it appears (as required or preferred), the share of postings,
 * the companies, levels and regions. A posting that names a technology under two aliases counts once; if it is
 * both required and preferred, required wins.
 */
export function countTechnologies(postings, index) {
  const stats = new Map();
  for (const p of postings) {
    const levelOf = new Map();
    for (const t of p.required ?? []) { const e = index.get(key(t)); if (e) levelOf.set(e.name, 'required'); }
    for (const t of p.preferred ?? []) { const e = index.get(key(t)); if (e && !levelOf.has(e.name)) levelOf.set(e.name, 'preferred'); }
    for (const [name, level] of levelOf) {
      const s = stats.get(name) ?? { name, required: 0, preferred: 0, companies: new Set(), levels: {}, regions: {} };
      s[level]++;
      s.companies.add(p.company);
      s.levels[p.level] = (s.levels[p.level] ?? 0) + 1;
      s.regions[p.region] = (s.regions[p.region] ?? 0) + 1;
      stats.set(name, s);
    }
  }
  const total = postings.length;
  return [...stats.values()].map(s => ({
    ...s,
    companies: [...s.companies].sort(),
    postings: s.required + s.preferred,
    share: total ? Math.round(1000 * (s.required + s.preferred) / total) / 10 : 0,
    requiredShare: s.required + s.preferred ? Math.round(100 * s.required / (s.required + s.preferred)) : 0,
  }));
}

/** Flattens a roadmap (phases with topics) into slug -> { phase, position, text }. */
export function roadmapTopics(phases) {
  const topics = new Map();
  for (const phase of phases) {
    phase.topics.forEach((t, i) => {
      const text = ['titleEn', 'summaryEn', 'whyEn', 'howEn', 'exampleEn', 'practiceEn', 'challengeEn'].map(f => t[f] ?? '').join('\n');
      topics.set(t.slug, { phase: phase.slug, phaseOrder: phase.order, position: i + 1, title: t.titleEn, text });
    });
  }
  return topics;
}

/**
 * How the roadmap covers a technology:
 *  - "covered": a topic dedicated to it exists (the taxonomy's `roadmap` slugs);
 *  - "mentioned": no dedicated topic, but topics mention it (the taxonomy's `terms`, or its name);
 *  - "missing": neither.
 */
export function coverage(entry, topics) {
  const dedicated = (entry.roadmap ?? []).filter(slug => topics.has(slug));
  if (dedicated.length) return { status: 'covered', topics: dedicated };
  // Whole words only, so "React" doesn't match "reactive".
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = (entry.terms?.length ? entry.terms : [entry.name]).map(term =>
    new RegExp(`(?<![A-Za-z0-9])${escape(term)}(?![A-Za-z0-9])`, 'i'));
  const mentions = [...topics].filter(([, t]) => patterns.some(p => p.test(t.text))).map(([slug]) => slug);
  return mentions.length ? { status: 'mentioned', topics: mentions } : { status: 'missing', topics: [] };
}

/**
 * Ranks the technologies beyond the core stack. Score = (required + 0.5 x preferred) / postings x 100, weighted by
 * the technology's relevance to a full-stack .NET + Angular developer. Recommendation:
 *  - "add" when the roadmap doesn't cover it, enough postings ask for it and it is relevant;
 *  - "improve" when it is only mentioned in passing;
 *  - "covered", or "watch" / "ignore" when the evidence is too thin.
 */
export function rank(stats, config, topics, totalPostings) {
  const index = buildIndex(config.taxonomy);
  const core = new Set(config.coreStack);
  const th = config.thresholds;
  return stats
    .filter(s => !core.has(s.name))
    .map(s => {
      const entry = index.get(key(s.name));
      const cov = coverage(entry, topics);
      const weight = config.relevanceWeight[String(entry.relevance)] ?? 0.5;
      const score = Math.round(10 * (s.required + 0.5 * s.preferred) / totalPostings * 100 * weight) / 10;
      const strong = s.share >= th.addMinShare && s.postings >= th.addMinPostings && entry.relevance >= th.addMinRelevance;
      const recommendation =
        cov.status === 'covered' ? 'covered'
        : strong ? (cov.status === 'missing' ? 'add' : 'improve')
        : s.postings >= th.watchMinPostings ? 'watch' : 'ignore';
      return { ...s, category: entry.category, relevance: entry.relevance, score, coverage: cov, recommendation };
    })
    .sort((a, b) => b.score - a.score || b.postings - a.postings || a.name.localeCompare(b.name));
}

/** What changed since the previous run: new and dropped technologies, and rank movements. */
export function compareRuns(current, previous) {
  if (!previous) return null;
  const before = new Map(previous.map((r, i) => [r.name, { rank: i + 1, share: r.share }]));
  const now = new Map(current.map((r, i) => [r.name, { rank: i + 1, share: r.share }]));
  return {
    added: current.filter(r => !before.has(r.name)).map(r => r.name),
    dropped: previous.filter(r => !now.has(r.name)).map(r => r.name),
    moved: current.filter(r => before.has(r.name)).map(r => ({
      name: r.name, from: before.get(r.name).rank, to: now.get(r.name).rank,
      shareChange: Math.round(10 * (r.share - before.get(r.name).share)) / 10,
    })).filter(m => m.from !== m.to || m.shareChange !== 0),
  };
}

/** Count of postings per value of a field (region, level, country). */
export function distribution(postings, field) {
  const out = {};
  for (const p of postings) out[p[field]] = (out[p[field]] ?? 0) + 1;
  return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]));
}
