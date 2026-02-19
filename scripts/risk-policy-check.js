#!/usr/bin/env node
/**
 * risk-policy-check.js
 *
 * Classifies a list of changed files into risk tiers (high/low) based on the
 * patterns defined in risk-policy.json. Used by the risk-policy-gate GitHub
 * Actions workflow as the authoritative classification engine.
 *
 * WHY a separate script (not inline YAML logic)?
 *   - Testable locally before pushing to CI
 *   - Easier to iterate on glob patterns without touching workflow YAML
 *   - Clean separation: policy lives in risk-policy.json, logic lives here
 *
 * Usage:
 *   NODE_PATH=/tmp/rpcheck/node_modules node scripts/risk-policy-check.js \
 *     --files "src/api/users.js,src/components/Button.tsx" \
 *     --policy risk-policy.json \
 *     --sha abc123def456 \
 *     --output /tmp/risk-result.json
 *
 * Output JSON schema:
 * {
 *   "tier": "high" | "low",
 *   "headSha": string,
 *   "policyVersion": string,
 *   "filesAnalyzed": number,
 *   "changedFiles": string[],
 *   "highRiskFiles": Array<{ file: string, matchedPattern: string }>,
 *   "requiredChecks": string[],
 *   "policyViolated": boolean,
 *   "violationReason": string | null,
 *   "docsDriftViolations": Array<{ controlPlane: string, requiredDoc: string }>
 * }
 *
 * Exit codes:
 *   0 — classification complete, no policy violations
 *   1 — policy violation detected (docs drift, or other rule violations)
 *   2 — fatal error (missing args, file not found, malformed JSON)
 */

'use strict';

// ---------------------------------------------------------------------------
// Dependency loading — minimatch is installed by the workflow to /tmp/rpcheck
// We try that path first, then fall back to a local node_modules lookup.
// ---------------------------------------------------------------------------
let minimatch;
try {
  ({ minimatch } = require('minimatch'));
} catch (e) {
  console.error(
    'Error: Could not load minimatch. Install it first:\n' +
    '  npm install --prefix /tmp/rpcheck minimatch@8\n' +
    '  NODE_PATH=/tmp/rpcheck/node_modules node scripts/risk-policy-check.js ...'
  );
  process.exit(2);
}

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

/**
 * Parse CLI args in the form --key value --key2 value2.
 * Returns a plain object.
 */
function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const val = argv[i + 1];
      // Only consume the next token as a value if it doesn't start with --
      if (val !== undefined && !val.startsWith('--')) {
        result[key] = val;
        i++;
      } else {
        result[key] = true; // boolean flag
      }
    }
  }
  return result;
}

const args = parseArgs(process.argv.slice(2));

const {
  files:  filesArg,
  policy: policyPath,
  sha:    headSha,
  output: outputPath,
} = args;

// ---------------------------------------------------------------------------
// Validate required arguments
// ---------------------------------------------------------------------------

if (filesArg === undefined) {
  console.error('Fatal: --files argument is required (comma-separated list, may be empty string)');
  process.exit(2);
}

if (!policyPath) {
  console.error('Fatal: --policy argument is required (path to risk-policy.json)');
  process.exit(2);
}

if (!headSha) {
  console.error('Fatal: --sha argument is required (current HEAD commit SHA)');
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Load and parse risk-policy.json
// ---------------------------------------------------------------------------

let policy;
const resolvedPolicyPath = path.resolve(policyPath);

try {
  const raw = fs.readFileSync(resolvedPolicyPath, 'utf8');
  policy = JSON.parse(raw);
} catch (e) {
  if (e.code === 'ENOENT') {
    console.error(`Fatal: risk-policy.json not found at: ${resolvedPolicyPath}`);
    console.error('Make sure you are running from the repo root and risk-policy.json exists.');
    process.exit(2);
  }
  if (e instanceof SyntaxError) {
    console.error(`Fatal: Failed to parse ${resolvedPolicyPath} as JSON: ${e.message}`);
    console.error('Check for trailing commas, missing quotes, or other JSON syntax errors.');
    process.exit(2);
  }
  console.error(`Fatal: Unexpected error reading ${resolvedPolicyPath}: ${e.message}`);
  process.exit(2);
}

// Validate that the policy has the expected shape
if (!policy.riskTierRules || !policy.mergePolicy) {
  console.error(`Fatal: ${resolvedPolicyPath} is missing required fields: riskTierRules, mergePolicy`);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Parse changed files list
// ---------------------------------------------------------------------------

// Files are passed as a comma-separated string. Empty string → no changed files.
const changedFiles = String(filesArg)
  .split(',')
  .map(f => f.trim())
  .filter(Boolean); // remove empty strings

// Edge case: completely empty changeset (e.g., empty commit)
if (changedFiles.length === 0) {
  // stderr for human messages; stdout must always be valid JSON for the workflow to parse
  console.error('No changed files detected. Classifying as LOW tier (nothing to gate).');
  const lowChecks = policy.mergePolicy?.low?.requiredChecks || [];
  const result = buildResult('low', headSha, [], policy, [], lowChecks);
  console.log(JSON.stringify(result, null, 2));  // stdout = JSON
  outputResult(result, outputPath);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Classify each file against high-risk patterns
// ---------------------------------------------------------------------------

const highPatterns = policy.riskTierRules?.high?.patterns || [];

/**
 * WHY we check every pattern and collect ALL matches:
 * We want the PR comment to show operators WHICH pattern triggered high-risk
 * classification, so they can debug or refine patterns in risk-policy.json.
 */
const highRiskFiles = [];

for (const file of changedFiles) {
  for (const pattern of highPatterns) {
    if (matchesGlob(file, pattern)) {
      highRiskFiles.push({ file, matchedPattern: pattern });
      break; // first matching pattern wins; don't double-count
    }
  }
}

// A PR is HIGH tier if ANY changed file matches a high-risk pattern.
// This is intentionally conservative: one high-risk file → full review pipeline.
const tier = highRiskFiles.length > 0 ? 'high' : 'low';

// ---------------------------------------------------------------------------
// Docs drift check
// ---------------------------------------------------------------------------

const docsDriftViolations = checkDocsDrift(changedFiles, policy);

// ---------------------------------------------------------------------------
// Build result and check for violations
// ---------------------------------------------------------------------------

const requiredChecks = policy.mergePolicy?.[tier]?.requiredChecks || [];
const result = buildResult(tier, headSha, highRiskFiles, policy, docsDriftViolations, requiredChecks);

// Docs drift is a policy violation only if the feature is enabled
if (docsDriftViolations.length > 0 && policy.docsDriftRules?.enabled) {
  result.policyViolated = true;
  result.violationReason = [
    'Docs drift detected — control-plane files changed without corresponding docs update:',
    ...docsDriftViolations.map(v =>
      `  • ${v.controlPlane} changed but ${v.requiredDoc} was not updated in this PR`
    ),
    '',
    'Fix: update the documentation for the control-plane change in this PR,',
    'OR disable docsDriftRules.enabled in risk-policy.json if this is intentional.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Output results
// ---------------------------------------------------------------------------

// Always log to stdout so the workflow can capture it
console.log(JSON.stringify(result, null, 2));
outputResult(result, outputPath);

// Log summary to stderr so it doesn't pollute the JSON stdout
console.error(`\n── Risk Policy Classification ──────────────────`);
console.error(`  Tier:             ${tier.toUpperCase()}`);
console.error(`  Files analyzed:   ${changedFiles.length}`);
console.error(`  High-risk files:  ${highRiskFiles.length}`);
console.error(`  Required checks:  ${requiredChecks.join(', ')}`);
console.error(`  Docs drift:       ${docsDriftViolations.length} violation(s)`);
console.error(`  Policy violated:  ${result.policyViolated}`);
console.error(`────────────────────────────────────────────────`);

// Exit code: 1 if policy violated, 0 if clean
process.exit(result.policyViolated ? 1 : 0);

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Match a file path against a minimatch glob pattern.
 * We use { dot: true } to include dotfiles (e.g., .github/workflows)
 * and { matchBase: true } to allow bare filenames to match anywhere.
 */
function matchesGlob(file, pattern) {
  // Direct minimatch match — handles most patterns
  if (minimatch(file, pattern, { dot: true, matchBase: false })) {
    return true;
  }
  // Also try matchBase for patterns without path separators (e.g., "Dockerfile")
  if (!pattern.includes('/') && minimatch(file, pattern, { dot: true, matchBase: true })) {
    return true;
  }
  return false;
}

/**
 * Check docs drift rules: for every control-plane file changed, verify that
 * at least one file matching the requiredDocPattern is also in the changeset.
 *
 * WHY: Prevents the "code changed, docs not updated" drift that makes ops
 * runbooks misleading. Makes doc updates a hard gate, not a suggestion.
 */
function checkDocsDrift(changedFiles, policy) {
  if (!policy.docsDriftRules?.enabled) return [];

  const violations = [];
  const rules = policy.docsDriftRules.rules || [];

  for (const rule of rules) {
    // Was a control-plane file changed?
    const controlPlaneChanged = changedFiles.some(f =>
      matchesGlob(f, rule.controlPlanePattern)
    );

    if (!controlPlaneChanged) continue;

    // Was the required doc also updated?
    const docUpdated = changedFiles.some(f =>
      matchesGlob(f, rule.requiredDocPattern)
    );

    if (!docUpdated) {
      violations.push({
        controlPlane: rule.controlPlanePattern,
        requiredDoc:  rule.requiredDocPattern,
      });
    }
  }

  return violations;
}

/**
 * Assemble the final result object.
 * This is the single source of truth consumed by the workflow JavaScript steps.
 */
function buildResult(tier, headSha, highRiskFiles, policy, docsDriftViolations, requiredChecks) {
  return {
    tier,
    headSha,
    policyVersion:       policy.version || 'unknown',
    filesAnalyzed:       changedFiles.length,
    changedFiles,
    highRiskFiles,
    requiredChecks:      requiredChecks || [],
    policyViolated:      false,
    violationReason:     null,
    docsDriftViolations: docsDriftViolations || [],
  };
}

/**
 * Write the result JSON to a file (for workflow steps that read it via fs).
 * Skipped if --output was not provided.
 */
function outputResult(result, outputPath) {
  if (!outputPath) return;

  try {
    const dir = path.dirname(path.resolve(outputPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
    console.error(`Result written to: ${outputPath}`);
  } catch (e) {
    console.error(`Warning: Could not write output file ${outputPath}: ${e.message}`);
    // Not fatal — stdout is the primary output channel
  }
}
