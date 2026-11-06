# Job-market research toolkit

Measures which technologies .NET employers ask for, compares them with the DevPath roadmap and
feeds the result back into the app: each topic page shows how often its technology appeared in
recent job postings.

```
tools/market-research/
  config.json      period, regions, search queries, core stack, thresholds, technology taxonomy
  lib.mjs          validation, counting, coverage, ranking, run comparison (pure functions)
  lib.test.mjs     unit tests:  node --test tools/market-research/lib.test.mjs
  analyze.mjs      analyses one run and writes its outputs

docs/market-research/
  history.json                 one line per run (top technologies, add/improve lists)
  runs/<yyyy-mm-dd>/
    postings.json              the collected postings (input, hand-curated)
    analysis.json / .md        generated ranking and gap analysis
    analysis-baseline.json/.md optional: the same run against an older roadmap
    REPORT.md                  hand-written report for the run

backend/DevPath.Api/SeedData/market-demand.json
                               generated from the newest run; seeded into the TopicDemand table
```

## Running a new research round

1. **Create the run folder** `docs/market-research/runs/<today>/`. Never edit or delete an
   older run; each run is a snapshot.
2. **Collect postings** for the period in `config.json` (`periodMonths`, default 3) using the
   queries and regions listed there. Use only permitted sources: an official API or connector,
   job boards' public pages within their terms, or postings the user supplies. Do not bypass
   logins, CAPTCHAs or anti-bot protection. Record the source in `postings.json`.
3. **Write `postings.json`** with this shape:

   ```json
   {
     "run": "2026-11-06", "collectedOn": "2026-11-06",
     "periodFrom": "2026-08-06", "periodTo": "2026-11-06",
     "source": "Where the postings came from and what could not be used",
     "inclusionRule": "Which postings count",
     "excluded":   [{ "ref": "...", "title": "...", "company": "...", "reason": "..." }],
     "duplicates": [{ "ref": "...", "duplicateOf": "..." }],
     "postings": [{
       "ref": "stable link to the posting", "title": "...", "company": "...", "posted": "yyyy-mm-dd",
       "location": "...", "country": "US", "region": "North America", "remote": true,
       "level": "Junior | Mid | Senior | Lead", "experience": "5+ years",
       "required": ["C#", "Azure", "..."], "preferred": ["Docker", "..."]
     }]
   }
   ```

   Technology names must be a taxonomy `name` or one of its `aliases` in `config.json`.
4. **Validate**: `node tools/market-research/analyze.mjs --check`. It reports postings outside
   the period, duplicates (same link, or same company + title + date) and technology names
   the taxonomy does not know. Add missing names to the taxonomy (with a category,
   a relevance of 1–3 and, if the roadmap teaches it, the roadmap topic slugs).
5. **Analyse**: `node tools/market-research/analyze.mjs`. It writes `analysis.json` and
   `analysis.md` for the run (including how each technology moved since the previous run), adds
   the run to `history.json` and regenerates `SeedData/market-demand.json`.
6. **Optional — measure against an older roadmap**: export it, then pass `--baseline`:

   ```
   git archive main backend/DevPath.Api/SeedData/roadmap | tar -x -C /tmp/baseline
   node tools/market-research/analyze.mjs --baseline /tmp/baseline/backend/DevPath.Api/SeedData/roadmap
   ```
7. **Act on the gaps** (`add` and `improve` in the analysis): add or extend topics in
   `SeedData/roadmap/*.json`, then point the taxonomy entry's `roadmap` list at the new slugs and
   run step 5 again so the topic shows its demand. The seeder rejects a topic placed before one
   of its prerequisites.
8. **Write `REPORT.md`** for the run: sources and limits, ranking, gaps, roadmap changes with
   their positions, test results and recommended next skills.

Older runs are never rewritten: `analyze.mjs <run>` refuses to overwrite the analysis of a run
that is not the newest unless `--force` is passed, and it never touches `REPORT.md`.

## How the numbers are calculated

- **Share**: postings that mention the technology ÷ all postings in the run.
- **Required / preferred**: from the posting's must-have list versus its nice-to-have list.
- **Score**: `(required + 0.5 × preferred) ÷ postings × 100 × relevance weight`, where the
  relevance weight (from `config.json`) is lower for technologies that are less central to a
  .NET full-stack developer.
- **Coverage**: `covered` when a roadmap topic is dedicated to the technology (the taxonomy's
  `roadmap` slugs), `mentioned` when its name (or one of its `terms`) appears as a whole word
  inside other topics, `missing` otherwise.
- **Recommendation**:
  - `add` / `improve`: missing / only mentioned, share ≥ `addMinShare`, at least
    `addMinPostings` postings and relevance ≥ `addMinRelevance`;
  - `watch`: not covered, below those thresholds but seen in at least `watchMinPostings` postings;
  - `covered` or `ignore` otherwise.

The core stack (`coreStack`) is reported separately and not ranked.
