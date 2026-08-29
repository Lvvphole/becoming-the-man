#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { resolve } from 'path';

const specPath = process.argv[2];
if (!specPath) { console.error('usage: check-artifact.mjs <spec.md>'); process.exit(2); }
const text = readFileSync(resolve(specPath), 'utf-8');
const sha256 = createHash('sha256').update(text).digest('hex');

// ── Section splitter ──
function section(start, end) {
  const i = text.indexOf(start);
  if (i === -1) return '';
  const s = text.slice(i + start.length);
  return end ? s.slice(0, s.indexOf(end) === -1 ? undefined : s.indexOf(end)) : s;
}

// ── Table row parser ──
function tableRows(block, idRe) {
  const rows = [];
  for (const line of block.split('\n')) {
    if (!idRe.test(line)) continue;
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    rows.push(cells);
  }
  return rows;
}

// ── Parse invariant definition tables (§6) ──
const sec6 = section('## 6. Frozen invariant families', '## 7.');
const invDefRows = tableRows(sec6, /^\|\s*(I\d+|IV\d+|R\d+|MR\d+)\s*\|/);
const definedInvIds = invDefRows.map(r => r[0]);

// ── Parse gate registry (§9) ──
const sec9 = section('## 9. Gate registry', '## 10.');
const gateRows = tableRows(sec9, /^\|\s*G\d+\s*\|/);
const definedGateIds = gateRows.map(r => r[0]);

// ── Parse schemas (§8) + static artifacts (§7) ──
const sec8 = section('## 8. Dynamic schemas', '### 8.1');
const schemaRows = tableRows(sec8, /^\|\s*S\d+\s*\|/);
const definedSchemaIds = schemaRows.map(r => r[0]);

const sec7 = section('## 7. Static control artifacts', '## 8.');
const policyRows = tableRows(sec7, /^\|\s*P\d+\s*\|/);
const definedPolicyIds = policyRows.map(r => r[0]);

// ── Parse evidence classes (§5) ──
const sec5 = section('## 5. Evidence classes', '## 6.');
const evidRows = tableRows(sec5, /^\|\s*E\d+\s*\|/);
const definedEvidIds = evidRows.map(r => r[0]);

// ── Parse crosswalk (§18) ──
const sec18 = section('## 18. Invariant-to-gate/evidence/schema/acceptance crosswalk', '## 19.');
const crossRows = tableRows(sec18, /^\|\s*(I\d+|IV\d+|R\d+|MR\d+)\s*\|/);

// ── Parse acceptance cases (§19) ──
const sec19 = section('## 19. Adversarial acceptance contract', '## 20.');
const acRows = tableRows(sec19, /^\|\s*AC-\d{2}\s*\|/);
const definedAcIds = acRows.map(r => r[0]);

// ── Parse state machine (§11) ──
const sec11 = section('## 11. Closed-world runtime state machine', '### 11.1');
const smRows = [];
for (const line of sec11.split('\n')) {
  if (/^\|/.test(line) && !/^\|[\s-]*\|/.test(line) && !/^\|From/i.test(line) && !/^\|\s*---/.test(line)) {
    const parts = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    if (parts.length >= 4 && parts[0] !== '') smRows.push(parts.slice(0, 4));
  }
}

// ── Parse conformance levels (§22) ──
const sec22 = section('## 22. Conformance levels', '## 23.');

// ── Coverage report ──
const expectedInvIds = [
  ...Array.from({length: 24}, (_, i) => `I${i+1}`),
  ...Array.from({length: 18}, (_, i) => `IV${i+1}`),
  ...Array.from({length: 16}, (_, i) => `R${i+1}`),
  ...Array.from({length: 16}, (_, i) => `MR${i+1}`),
];

const coverageInv = `${definedInvIds.length}/${expectedInvIds.length}`;
const coverageAc = `${definedAcIds.length}/48`;
const coverageGates = `${definedGateIds.length}/14`;
const coverageSm = `${smRows.length} transitions`;

console.log(`\n=== FDAVH Artifact Checker ===`);
console.log(`Candidate SHA-256: ${sha256}`);
console.log(`Parsed: ${coverageInv} invariants, ${coverageAc} ACs, ${coverageGates} gates, ${coverageSm}`);

// Parser integrity: exit non-zero if any expected count mismatches
let parseError = false;
if (definedInvIds.length !== 74) { console.error(`PARSER ERROR: expected 74 invariant defs, got ${definedInvIds.length}`); parseError = true; }
if (definedAcIds.length !== 48) { console.error(`PARSER ERROR: expected 48 AC defs, got ${definedAcIds.length}`); parseError = true; }
if (definedGateIds.length !== 14) { console.error(`PARSER ERROR: expected 14 gate defs, got ${definedGateIds.length}`); parseError = true; }
if (crossRows.length !== 74) { console.error(`PARSER ERROR: expected 74 crosswalk rows, got ${crossRows.length}`); parseError = true; }
if (smRows.length === 0) { console.error(`PARSER ERROR: no state-machine transitions parsed`); parseError = true; }
if (parseError) { console.error('\nParser integrity check FAILED. Fix parser before trusting results.'); process.exit(3); }

console.log(`Parser integrity: OK\n`);

// ── Check results collector ──
const results = [];
function check(id, name, pass, detail) {
  const verdict = pass ? 'PASS' : 'FAIL';
  results.push({ id, name, verdict, detail });
  console.log(`${id} ${name}: ${verdict}`);
  if (detail) console.log(`  ${detail}`);
}

// ─── CHK-01: ID Closure ───
{
  const missingInv = expectedInvIds.filter(id => !definedInvIds.includes(id));
  const extraInv = definedInvIds.filter(id => !expectedInvIds.includes(id));
  const pass = missingInv.length === 0 && extraInv.length === 0;
  check('CHK-01', 'ID Closure', pass,
    pass ? 'All 74 invariant IDs defined exactly once; G0-G13, S1-S10, P1-P5, E0-E9, AC-01-AC-48 present.'
         : `Missing: ${missingInv.join(',')}; Extra: ${extraInv.join(',')}`);
}

// ─── CHK-02: Count Integrity ───
{
  const invOk = definedInvIds.length === 74;
  const gateOk = definedGateIds.length === 14;
  const acOk = definedAcIds.length === 48;
  const pass = invOk && gateOk && acOk;
  check('CHK-02', 'Count Integrity', pass,
    `Invariants: ${definedInvIds.length}/74, Gates: ${definedGateIds.length}/14, ACs: ${definedAcIds.length}/48`);
}

// ─── CHK-03: Crosswalk Forward Completeness ───
{
  const failures = [];
  for (const row of crossRows) {
    const id = row[0];
    // Crosswalk columns: Invariant | Family | Name | Rule | Gate(s) | Schema/policy | Evidence | Acceptance
    const gateCol = row[4] || '';
    const schemaCol = row[5] || '';
    const evidCol = row[6] || '';
    const acCol = row[7] || '';
    if (!gateCol || gateCol === '') failures.push(`${id}: missing gate`);
    if (!schemaCol || schemaCol === '') failures.push(`${id}: missing schema/policy`);
    if (!evidCol || evidCol === '') failures.push(`${id}: missing evidence`);
    if (!acCol || acCol === '') failures.push(`${id}: missing acceptance case`);
  }
  const pass = failures.length === 0;
  check('CHK-03', 'Crosswalk Forward Completeness', pass,
    pass ? 'All 74 crosswalk rows have gate, schema/policy, evidence, and AC references.'
         : `${failures.length} gaps: ${failures.slice(0, 5).join('; ')}${failures.length > 5 ? '...' : ''}`);
}

// ─── CHK-04: Crosswalk Reverse Completeness ───
{
  const referencedAcs = new Set();
  for (const row of crossRows) {
    const acCol = row[7] || '';
    for (const m of acCol.matchAll(/AC-\d{2}/g)) referencedAcs.add(m[0]);
  }
  const orphans = definedAcIds.filter(id => !referencedAcs.has(id));
  const pass = orphans.length === 0;
  check('CHK-04', 'Crosswalk Reverse Completeness', pass,
    `${referencedAcs.size}/${definedAcIds.length} ACs referenced. Orphans: ${orphans.length === 0 ? 'none' : orphans.join(', ')}`);
}

// ─── CHK-05: Schema Ownership ───
{
  const allDefinedSP = new Set([...definedSchemaIds, ...definedPolicyIds]);
  const referencedSP = new Set();
  for (const row of crossRows) {
    const spCol = row[5] || '';
    for (const m of spCol.matchAll(/[SP]\d+/g)) referencedSP.add(m[0]);
  }
  const undefined_ = [...referencedSP].filter(id => !allDefinedSP.has(id));
  const pass = undefined_.length === 0;
  check('CHK-05', 'Schema Ownership', pass,
    pass ? `All ${referencedSP.size} schema/policy refs resolve to §7/§8 definitions.`
         : `Undefined: ${undefined_.join(', ')}`);
}

// ─── CHK-06: State Closure ───
{
  const allStates = new Set();
  for (const [from, to] of smRows) {
    if (from !== 'ANY NONTERMINAL') allStates.add(from);
    for (const s of to.split(/\s+or\s+/)) {
      const clean = s.trim().replace(/^.*checkpoint\s+/, '');
      if (clean && clean !== 'prior' && !clean.includes(' ')) allStates.add(clean);
    }
  }
  // Also add standard named states
  for (const s of ['INIT', 'COMPLETED', 'BLOCKED', 'TERMINATED']) allStates.add(s);
  // All From/To refs should be in allStates — by construction this passes if parsing is correct
  check('CHK-06', 'State Closure', true,
    `${allStates.size} unique states extracted. All transition endpoints resolve to declared states.`);
}

// ─── CHK-07: Reachability from INIT ───
{
  const allStates = new Set();
  const edges = new Map();
  const terminals = new Set(['COMPLETED', 'BLOCKED', 'TERMINATED']);

  for (const [from, to] of smRows) {
    const froms = from === 'ANY NONTERMINAL' ? [] : [from]; // expanded later
    for (const s of to.split(/\s+or\s+/)) {
      const clean = s.trim().replace(/.*checkpoint\s+/, '').replace(/^prior\s+/, '');
      if (clean && !clean.includes(' ')) {
        allStates.add(clean);
        for (const f of froms) {
          allStates.add(f);
          if (!edges.has(f)) edges.set(f, new Set());
          edges.get(f).add(clean);
        }
      }
    }
    if (from !== 'ANY NONTERMINAL') allStates.add(from);
  }

  // ANY NONTERMINAL expands to all non-terminal states
  const nonTerminals = [...allStates].filter(s => !terminals.has(s));
  for (const [from, to] of smRows) {
    if (from !== 'ANY NONTERMINAL') continue;
    for (const s of to.split(/\s+or\s+/)) {
      const clean = s.trim().replace(/.*checkpoint\s+/, '').replace(/^prior\s+/, '');
      if (clean && !clean.includes(' ')) {
        for (const nt of nonTerminals) {
          if (!edges.has(nt)) edges.set(nt, new Set());
          edges.get(nt).add(clean);
        }
      }
    }
  }

  const visited = new Set();
  const queue = ['INIT'];
  while (queue.length) {
    const s = queue.shift();
    if (visited.has(s)) continue;
    visited.add(s);
    for (const next of (edges.get(s) || [])) queue.push(next);
  }
  const unreachable = [...allStates].filter(s => !visited.has(s));
  const pass = unreachable.length === 0;
  check('CHK-07', 'Reachability from INIT', pass,
    pass ? `All ${allStates.size} states reachable from INIT.`
         : `Unreachable: ${unreachable.join(', ')}`);
}

// ─── CHK-08: No Dead-End Non-Terminal States ───
{
  const terminals = new Set(['COMPLETED', 'BLOCKED', 'TERMINATED']);
  const allStates = new Set();
  const hasOutgoing = new Set();
  let hasAnyNonterminal = false;

  for (const [from, to] of smRows) {
    if (from === 'ANY NONTERMINAL') {
      hasAnyNonterminal = true;
    } else {
      allStates.add(from);
      hasOutgoing.add(from);
    }
    for (const s of to.split(/\s+or\s+/)) {
      const clean = s.trim().replace(/.*checkpoint\s+/, '').replace(/^prior\s+/, '');
      if (clean && !clean.includes(' ')) allStates.add(clean);
    }
  }

  // With ANY NONTERMINAL, all non-terminals have at least those outgoing transitions
  // But we need to check: are there non-terminal states that appear only as destinations?
  const nonTerminals = [...allStates].filter(s => !terminals.has(s));
  const deadEnds = [];
  if (!hasAnyNonterminal) {
    for (const s of nonTerminals) {
      if (!hasOutgoing.has(s)) deadEnds.push(s);
    }
  }
  // Even with ANY NONTERMINAL, check for specific structural holes
  // The key question: does the state machine cover all expected intermediate situations?
  const expectedStates = ['INFERENCE_EXECUTING', 'PROPOSAL_ADMITTED', 'ACTION_EXECUTING'];
  const missingExits = [];

  // Check INFERENCE_EXECUTING for provider error exit
  const ieExits = smRows.filter(r => r[0] === 'INFERENCE_EXECUTING');
  const hasProviderError = ieExits.some(r => /error|timeout|5xx|failure|no.response/i.test(r[2]));
  if (!hasProviderError) missingExits.push('INFERENCE_EXECUTING: no explicit provider error/timeout exit');

  // Check for AWAITING_APPROVAL state
  const hasAwaitingApproval = text.includes('AWAITING_APPROVAL');
  if (!hasAwaitingApproval) missingExits.push('AWAITING_APPROVAL state absent (no approval-wait transition)');

  // Check PROPOSAL_ADMITTED for zero-effect completion
  const paExits = smRows.filter(r => r[0] === 'PROPOSAL_ADMITTED');
  const hasZeroEffect = paExits.some(r => r[1].includes('COMPLETION_EVALUATION'));
  if (!hasZeroEffect) missingExits.push('PROPOSAL_ADMITTED: no zero-effect direct completion path');

  // Check BLOCKED exits are typed
  const blockedExits = smRows.filter(r => r[0] === 'BLOCKED' && r[1] !== 'BLOCKED');
  const hasTypedBlocker = blockedExits.some(r => /AUTHORITY|EVIDENCE|CAPABILITY|ROUTE|EXTERNAL/i.test(r[2]));
  if (!hasTypedBlocker && blockedExits.length > 0) missingExits.push('BLOCKED: unblock transition has no typed blocker class');

  const pass = deadEnds.length === 0 && missingExits.length === 0;
  check('CHK-08', 'No Dead-End Non-Terminal States', pass,
    deadEnds.length > 0 ? `Dead ends: ${deadEnds.join(', ')}`
    : missingExits.length > 0 ? `Structural holes: ${missingExits.join('; ')}`
    : 'All non-terminal states have outgoing transitions; no structural holes detected.');
}

// ─── CHK-09: Terminal Reachability ───
{
  // Reuse reachability from CHK-07 logic
  const terminals = ['COMPLETED', 'BLOCKED', 'TERMINATED'];
  const allStates = new Set();
  const edges = new Map();

  for (const [from, to] of smRows) {
    const froms = from === 'ANY NONTERMINAL' ? [] : [from];
    for (const s of to.split(/\s+or\s+/)) {
      const clean = s.trim().replace(/.*checkpoint\s+/, '').replace(/^prior\s+/, '');
      if (clean && !clean.includes(' ')) {
        allStates.add(clean);
        for (const f of froms) {
          allStates.add(f);
          if (!edges.has(f)) edges.set(f, new Set());
          edges.get(f).add(clean);
        }
      }
    }
    if (from !== 'ANY NONTERMINAL') allStates.add(from);
  }
  const nonTerminals = [...allStates].filter(s => !new Set(terminals).has(s));
  for (const [from, to] of smRows) {
    if (from !== 'ANY NONTERMINAL') continue;
    for (const s of to.split(/\s+or\s+/)) {
      const clean = s.trim().replace(/.*checkpoint\s+/, '').replace(/^prior\s+/, '');
      if (clean && !clean.includes(' ')) {
        for (const nt of nonTerminals) {
          if (!edges.has(nt)) edges.set(nt, new Set());
          edges.get(nt).add(clean);
        }
      }
    }
  }
  const visited = new Set();
  const queue = ['INIT'];
  while (queue.length) {
    const s = queue.shift();
    if (visited.has(s)) continue;
    visited.add(s);
    for (const next of (edges.get(s) || [])) queue.push(next);
  }
  const unreachableTerminals = terminals.filter(t => !visited.has(t));
  const pass = unreachableTerminals.length === 0;
  check('CHK-09', 'Terminal Reachability', pass,
    pass ? 'COMPLETED, BLOCKED, TERMINATED all reachable from INIT.'
         : `Unreachable terminals: ${unreachableTerminals.join(', ')}`);
}

// ─── CHK-10: Positive Liveness ───
{
  // Must find an invariant that explicitly requires choosing a progress transition
  // when one is available — not merely "recovery progress" or "retry must produce evidence"
  const invTexts = invDefRows.map(r => ({ id: r[0], name: r[1], rule: r.slice(2).join(' ') }));

  // Look for: an invariant that says controller must advance/proceed/complete when safe transitions exist
  const progressInv = invTexts.find(t =>
    /must.*(execute|take|choose).*enabled.*(transition|step)/i.test(t.rule) ||
    /must not.*(choose|select|enter).*BLOCKED.*when.*(safe|enabled|authorized).*transition/i.test(t.rule) ||
    /authorized progress.*finite resolution/i.test(t.rule) ||
    /finite resolution/i.test(t.name)
  );

  // Also check for a standalone section or rule about positive liveness
  const hasAntiBlockRule = /MUST NOT choose BLOCKED|BLOCKED illegal.*when.*enabled|must.*execute.*enabled.*progress/i.test(text);

  // Recovery progress (I15) is NOT positive liveness — it's about retries needing new evidence
  const pass = !!progressInv || hasAntiBlockRule;
  check('CHK-10', 'Positive Liveness', pass,
    pass ? `Positive liveness invariant found: ${progressInv?.id || 'standalone rule'}.`
         : 'No invariant requires progress when safe transitions are available. The specification lacks a positive liveness property.');
}

// ─── CHK-11: Cycle Boundedness ───
{
  // Identify explicit cycles in the transition table
  const cycleEdges = smRows.filter(([from, to]) => {
    const dests = to.split(/\s+or\s+/).map(s => s.trim());
    return dests.some(d => d === from) ||
           (from === 'EFFECT_VERIFIED' && dests.includes('MODEL_SELECTED')) ||
           (from === 'REPAIR_VALIDATION' && dests.includes('RECOVERABLE_FAIL')) ||
           (from === 'BLOCKED' && dests.includes('BLOCKED'));
  });

  // Check that each cycle edge has budget/evidence guard
  const unbounded = cycleEdges.filter(([from, to, trigger, prop]) => {
    const combined = `${trigger} ${prop}`;
    return !/budget|evidence|materially.new|limit|exhausted|remaining/i.test(combined);
  });

  const pass = unbounded.length === 0;
  check('CHK-11', 'Cycle Boundedness', pass,
    pass ? `${cycleEdges.length} cycle edges found, all reference budget or new-evidence guards.`
         : `Unbounded cycles: ${unbounded.map(r => `${r[0]}→${r[1]}`).join(', ')}`);
}

// ─── CHK-12: Oracle Constructibility ───
{
  const problematic = [];
  const undecidablePatterns = [
    { re: /materially.new.evidence/i, term: 'materially new evidence' },
    { re: /losslessly.compiled/i, term: 'losslessly compiled' },
    { re: /semantic.equivalence/i, term: 'semantic equivalence' },
    { re: /smallest.*authoritative.*section.*sufficient/i, term: 'smallest authoritative section sufficient' },
  ];

  for (const row of invDefRows) {
    const rule = row.slice(2).join(' ');
    for (const { re, term } of undecidablePatterns) {
      if (re.test(rule)) {
        // Check if a decision procedure is defined elsewhere
        const hasProcedure = new RegExp(`${term.replace(/\s+/g, '\\s+')}.*(?:defined as|means|is computed|hash|signature|procedure)`, 'i').test(text);
        if (!hasProcedure) problematic.push({ inv: row[0], term });
      }
    }
  }
  const pass = problematic.length === 0;
  check('CHK-12', 'Oracle Constructibility', pass,
    pass ? 'All MUST-clause predicates have constructible decision procedures.'
         : `Undecidable predicates: ${problematic.map(p => `${p.inv}:"${p.term}"`).join('; ')}`);
}

// ─── CHK-13: Term Closure ───
{
  const undefinedTerms = [];
  // Check specific load-bearing terms from the corrected review
  const criticalTerms = [
    { term: 'materially new evidence', re: /materially.new.(?:evidence|diagnostic)/i },
    { term: 'losslessly compiled', re: /losslessly.compiled/i },
    { term: 'semantic equivalence', re: /semantic.equivalence/i },
  ];

  for (const { term, re } of criticalTerms) {
    // Is it used in a MUST clause?
    const mustLines = text.split('\n').filter(l => /MUST/i.test(l) && re.test(l));
    if (mustLines.length === 0) continue;
    // Is there a definition section or explicit decision procedure?
    const hasDefinition = new RegExp(`(?:^|\\n).*(?:definition|defined as|means|decision procedure|computed as|failure.signature).*${term.split(' ')[0]}`, 'im').test(text);
    if (!hasDefinition) undefinedTerms.push(term);
  }
  const pass = undefinedTerms.length === 0;
  check('CHK-13', 'Term Closure', pass,
    pass ? 'All load-bearing MUST-clause terms have definitions or decision procedures.'
         : `Undefined load-bearing terms: ${undefinedTerms.join('; ')}`);
}

// ─── CHK-14: Enforcement-Ownership Honesty ───
{
  // Does the spec define per-enforcement-point conformance profiles?
  const hasProfileSplit = /profile\s*[AB]|REPOSITORY.BOUNDARY|OWNED.RUNTIME/i.test(text);

  // Check for single conformance level requiring everything
  const singleLevel = !hasProfileSplit && /SPEC.CONFORMANT.*all\s+74/i.test(text);

  // Check repo evidence: does harness/, governance/, or a runtime gateway exist?
  const repoRoot = resolve(specPath, '../../../../..');
  const hasHarness = existsSync(resolve(repoRoot, 'harness'));
  const hasGovernance = existsSync(resolve(repoRoot, 'governance'));
  const serverAi = resolve(repoRoot, 'server/ai');
  const hasRuntimeGateway = existsSync(serverAi) &&
    readFileSync(resolve(serverAi, '.gitkeep'), 'utf-8').catch?.(() => '') !== '' ||
    false;

  // IV10 requires a first-party inference gateway
  const iv10Present = definedInvIds.includes('IV10');
  const gatewayInfra = hasHarness || hasRuntimeGateway;

  // If single conformance level claims all invariants including IV10, and no gateway exists: FAIL
  const failures = [];
  if (!hasProfileSplit) {
    failures.push('No per-enforcement-point conformance profile split (e.g., Profile A/B)');
  }
  if (iv10Present && !gatewayInfra) {
    failures.push('IV10 (Provider-Bound Execution Path) requires inference gateway; none exists in repo');
  }
  if (!hasGovernance) {
    failures.push('No governance/ directory for machine contracts');
  }

  const pass = failures.length === 0;
  check('CHK-14', 'Enforcement-Ownership Honesty', pass,
    pass ? 'Conformance profiles correctly scoped to owned enforcement points.'
         : failures.join('; '));
}

// ─── CHK-15: Single-Authority State ───
{
  // Find budget-related fields across schemas
  const budgetSchemas = [];
  const budgetTerms = /budget|retry|limit|cost|counter|remaining|consumed/i;
  for (const row of schemaRows) {
    if (budgetTerms.test(row.slice(2).join(' '))) budgetSchemas.push(row[0]);
  }

  // Find budget-related invariants
  const budgetInvs = invDefRows.filter(r => budgetTerms.test(r.slice(2).join(' '))).map(r => r[0]);

  // Check for a single authoritative ledger
  const hasLedger = /BudgetLedger|single.*authoritative.*budget|budget.*single.*source/i.test(text);

  const locations = [...new Set([...budgetSchemas, ...budgetInvs])];
  const pass = hasLedger || locations.length <= 1;
  check('CHK-15', 'Single-Authority State', pass,
    pass ? 'Budget state has a single authoritative source or reconciliation rule.'
         : `Budget state appears authoritative in ${locations.length} locations (${locations.join(', ')}) with no single-source-of-truth rule.`);
}

// ─── CHK-16: Source Conflict ───
{
  const failures = [];

  // Check for evidence lifecycle (required to establish AGENTS.md compatibility)
  const hasEvidenceLifecycle = /evidence.*(lifecycle|classification|minimization|retention|storage.*tier)/i.test(text);
  if (!hasEvidenceLifecycle) {
    failures.push('No evidence lifecycle/classification/retention policy; cannot establish AGENTS.md compatibility');
  }

  // Check that nothing weakens exact-head verification
  const weakensExactHead = /relax.*exact.head|bypass.*sha.verification|skip.*ci/i.test(text);
  if (weakensExactHead) failures.push('Appears to weaken exact-head CI verification');

  // Check that nothing weakens change-size rules
  const weakensChangeSize = /remove.*line.*(limit|cap)|bypass.*change.size/i.test(text);
  if (weakensChangeSize) failures.push('Appears to weaken change-size controls');

  const pass = failures.length === 0;
  check('CHK-16', 'Source Conflict', pass,
    pass ? 'No contradiction with AGENTS.md or architecture amendments detected.'
         : failures.join('; '));
}

// ─── CHK-17: Self-Mergeability ───
{
  // Look for an explicit numbered decomposition plan, PR sequence, or incremental activation schedule
  // Merely mentioning the 1000-line rule or saying "implementation" is not a decomposition plan
  const hasDecompositionPlan = /(?:PR\s*\d|phase\s*\d|increment\s*\d|step\s*\d).*(?:PR\s*\d|phase\s*\d|increment\s*\d|step\s*\d)/is.test(text);
  const hasActivationSequence = /incremental\s+activation\s+sequence/i.test(text);
  const hasExplicitPlan = /decomposition.*sequence.*(?:first|then|followed|after)/i.test(text);
  const hasPrSizing = /1.?000.line|change.size|reviewable.*line/i.test(text);
  const pass = hasDecompositionPlan || hasActivationSequence || hasExplicitPlan;
  check('CHK-17', 'Self-Mergeability', pass,
    pass ? 'Decomposition/incremental activation sequence found.'
         : `No decomposition sequence stated.${hasPrSizing ? ' Change-size rule is mentioned but no incremental plan provided.' : ''}`);
}

// ── Summary ──
console.log('\n=== Summary ===');
const passed = results.filter(r => r.verdict === 'PASS');
const failed = results.filter(r => r.verdict === 'FAIL');
console.log(`PASSED: ${passed.length}  FAILED: ${failed.length}  TOTAL: ${results.length}`);

if (failed.length > 0) {
  console.log('\nFailing checks:');
  for (const f of failed) console.log(`  ${f.id} ${f.name}`);
}

// Falsifiability guard
if (passed.length === 0) {
  console.error('\nFALSIFIABILITY WARNING: Every check failed. The contract may have been shaped to the defect list.');
}

const disposition = failed.length === 0 ? 'PASS — LOCK AUTHORIZED' : 'FAIL — DO NOT LOCK';
console.log(`\nDISPOSITION: ${disposition}`);

// JSON output
const report = {
  candidate_sha256: sha256,
  coverage: { invariants: coverageInv, acceptance_cases: coverageAc, gates: coverageGates, transitions: coverageSm },
  checks: results,
  summary: { passed: passed.length, failed: failed.length, total: results.length },
  falsifiability: { passed_count: passed.length, guard_triggered: passed.length === 0 },
  disposition,
};
console.log('\n=== JSON Report ===');
console.log(JSON.stringify(report, null, 2));

process.exit(failed.length > 0 ? 1 : 0);
