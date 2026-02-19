#!/usr/bin/env bash
# browser-evidence-verify.sh
#
# Verifies that a browser evidence manifest is valid, fresh, and matches the
# expected HEAD SHA and entrypoint. Called by the risk-policy-gate workflow
# when a high-risk PR touches UI or user-facing flows.
#
# WHY machine-verifiable evidence (not just screenshots)?
#   Screenshots can be faked, stale, or taken against the wrong branch.
#   A machine-generated manifest with a captured timestamp and HEAD SHA
#   proves the evidence was captured on the correct code at the right time.
#
# Usage:
#   ./scripts/browser-evidence-verify.sh \
#     --manifest evidence/manifest.json \
#     --sha abc123def456 \
#     --entrypoint "https://staging.example.com/checkout" \
#     --max-age-hours 24
#
# Exit codes:
#   0 — all checks passed
#   1 — verification failed (details on stderr)
#
# CUSTOMIZE_HERE: Adjust the required files list and manifest schema fields
# for your project's evidence capture setup.

set -euo pipefail

# ---------------------------------------------------------------------------
# Defaults (overridden by CLI args)
# ---------------------------------------------------------------------------

MANIFEST_PATH="evidence/manifest.json"
EXPECTED_SHA=""
EXPECTED_ENTRYPOINT=""
MAX_AGE_HOURS=24

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

usage() {
  cat >&2 <<EOF
Usage: $0 [OPTIONS]

Options:
  --manifest PATH          Path to the evidence manifest JSON (default: evidence/manifest.json)
  --sha SHA                Expected HEAD SHA the evidence was captured against
  --entrypoint URL         Expected entrypoint URL used during capture
  --max-age-hours N        Maximum age in hours for evidence to be considered fresh (default: 24)
  --help                   Show this help message

EOF
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --manifest)      MANIFEST_PATH="$2"; shift 2 ;;
    --sha)           EXPECTED_SHA="$2"; shift 2 ;;
    --entrypoint)    EXPECTED_ENTRYPOINT="$2"; shift 2 ;;
    --max-age-hours) MAX_AGE_HOURS="$2"; shift 2 ;;
    --help)          usage ;;
    *)
      echo "Error: Unknown argument: $1" >&2
      usage
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Helper: colored output (falls back to plain text if no TTY)
# ---------------------------------------------------------------------------

RED=''
GREEN=''
YELLOW=''
RESET=''
if [[ -t 2 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  RESET='\033[0m'
fi

pass()  { echo -e "${GREEN}  ✓${RESET} $*" >&2; }
fail()  { echo -e "${RED}  ✗${RESET} $*" >&2; }
warn()  { echo -e "${YELLOW}  ⚠${RESET} $*" >&2; }
info()  { echo "  →  $*" >&2; }

ERRORS=0
mark_failed() {
  fail "$@"
  ERRORS=$((ERRORS + 1))
}

# ---------------------------------------------------------------------------
# Helper: get file modification time as Unix epoch (cross-platform)
# ---------------------------------------------------------------------------

file_mtime_epoch() {
  local file="$1"
  if [[ "$(uname)" == "Darwin" ]]; then
    # macOS: stat uses -f %m
    stat -f %m "$file" 2>/dev/null || echo 0
  else
    # Linux: stat uses -c %Y
    stat -c %Y "$file" 2>/dev/null || echo 0
  fi
}

# ---------------------------------------------------------------------------
# Helper: current time as Unix epoch
# ---------------------------------------------------------------------------

now_epoch() {
  date +%s
}

# ---------------------------------------------------------------------------
# Check 1: Required files exist
# ---------------------------------------------------------------------------

echo >&2
echo "── Browser Evidence Verification ──────────────────────" >&2
echo "  Manifest:    $MANIFEST_PATH" >&2
echo "  Expected SHA: ${EXPECTED_SHA:-"(not specified)"}" >&2
echo "  Entrypoint:  ${EXPECTED_ENTRYPOINT:-"(not specified)"}" >&2
echo "  Max age:     ${MAX_AGE_HOURS}h" >&2
echo "────────────────────────────────────────────────────────" >&2
echo >&2

echo "Check 1: Required evidence files exist" >&2

# CUSTOMIZE_HERE: Add or remove required evidence files for your project
REQUIRED_FILES=(
  "$MANIFEST_PATH"
  "evidence/screenshot.png"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$f" ]]; then
    pass "Found: $f"
  else
    mark_failed "Missing required evidence file: $f"
    info "Capture evidence using your browser automation tool and commit to the PR branch."
  fi
done

# If the manifest is missing, we cannot continue with further checks
if [[ ! -f "$MANIFEST_PATH" ]]; then
  echo >&2
  echo -e "${RED}FAILED: Manifest file not found. Cannot continue verification.${RESET}" >&2
  echo >&2
  echo "To fix: run your browser evidence capture script and ensure it writes" >&2
  echo "evidence/manifest.json with at least: entrypoint, capturedAt, headSha, flows" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Check 2: Manifest is valid JSON with required fields
# ---------------------------------------------------------------------------

echo >&2
echo "Check 2: Manifest is valid JSON with required fields" >&2

# Parse the manifest (requires jq)
if ! command -v jq &>/dev/null; then
  mark_failed "jq is not installed — cannot parse manifest JSON"
  info "Install jq: apt-get install jq  OR  brew install jq"
else
  if ! MANIFEST_CONTENT=$(jq '.' "$MANIFEST_PATH" 2>&1); then
    mark_failed "Manifest is not valid JSON: $MANIFEST_CONTENT"
  else
    pass "Manifest is valid JSON"

    # CUSTOMIZE_HERE: Adjust required manifest fields for your schema
    REQUIRED_FIELDS=("entrypoint" "capturedAt" "headSha" "flows")
    for field in "${REQUIRED_FIELDS[@]}"; do
      value=$(jq -r ".$field // empty" "$MANIFEST_PATH" 2>/dev/null)
      if [[ -z "$value" ]]; then
        mark_failed "Manifest missing required field: $field"
      else
        pass "Field present: $field"
      fi
    done
  fi
fi

# ---------------------------------------------------------------------------
# Check 3: Evidence is fresh (not older than MAX_AGE_HOURS)
# ---------------------------------------------------------------------------

echo >&2
echo "Check 3: Evidence freshness (max age: ${MAX_AGE_HOURS}h)" >&2

if command -v jq &>/dev/null && [[ -f "$MANIFEST_PATH" ]]; then
  CAPTURED_AT=$(jq -r '.capturedAt // empty' "$MANIFEST_PATH" 2>/dev/null)

  if [[ -z "$CAPTURED_AT" ]]; then
    warn "Cannot verify freshness: manifest.capturedAt field is missing or empty"
  else
    # Parse the ISO 8601 timestamp to epoch
    # date -d is GNU (Linux), date -j is BSD (macOS)
    CAPTURED_EPOCH=0
    if [[ "$(uname)" == "Darwin" ]]; then
      # macOS: strip trailing Z and use -j -f
      CLEAN_TS="${CAPTURED_AT%Z}"
      CLEAN_TS="${CLEAN_TS//T/ }"
      CAPTURED_EPOCH=$(date -j -f "%Y-%m-%d %H:%M:%S" "${CLEAN_TS%.*}" "+%s" 2>/dev/null || echo 0)
    else
      # Linux GNU date
      CAPTURED_EPOCH=$(date -d "$CAPTURED_AT" "+%s" 2>/dev/null || echo 0)
    fi

    if [[ "$CAPTURED_EPOCH" -eq 0 ]]; then
      warn "Could not parse capturedAt timestamp: $CAPTURED_AT"
      info "Expected ISO 8601 format, e.g.: 2026-02-19T14:30:00Z"
    else
      NOW=$(now_epoch)
      AGE_SECONDS=$(( NOW - CAPTURED_EPOCH ))
      AGE_HOURS=$(( AGE_SECONDS / 3600 ))
      MAX_AGE_SECONDS=$(( MAX_AGE_HOURS * 3600 ))

      if [[ "$AGE_SECONDS" -gt "$MAX_AGE_SECONDS" ]]; then
        mark_failed "Evidence is stale: captured ${AGE_HOURS}h ago (max allowed: ${MAX_AGE_HOURS}h)"
        info "Re-capture evidence against the current PR branch and commit the updated manifest."
      else
        pass "Evidence is fresh: captured ${AGE_HOURS}h ago (within ${MAX_AGE_HOURS}h limit)"
      fi
    fi
  fi
else
  warn "Skipping freshness check (jq not available or manifest missing)"
fi

# ---------------------------------------------------------------------------
# Check 4: Verify evidence was captured against the correct HEAD SHA
# ---------------------------------------------------------------------------

echo >&2
echo "Check 4: Evidence captured against correct HEAD SHA" >&2

if [[ -z "$EXPECTED_SHA" ]]; then
  warn "No --sha provided; skipping SHA validation"
  info "Pass --sha \${{ github.event.pull_request.head.sha }} from the workflow for full validation."
elif command -v jq &>/dev/null && [[ -f "$MANIFEST_PATH" ]]; then
  MANIFEST_SHA=$(jq -r '.headSha // empty' "$MANIFEST_PATH" 2>/dev/null)

  if [[ -z "$MANIFEST_SHA" ]]; then
    mark_failed "Manifest missing headSha field — cannot verify evidence was captured against the correct commit"
  elif [[ "$MANIFEST_SHA" == "$EXPECTED_SHA" ]]; then
    pass "Evidence SHA matches HEAD: ${EXPECTED_SHA:0:12}..."
  else
    mark_failed "SHA MISMATCH: evidence was captured for ${MANIFEST_SHA:0:12} but current HEAD is ${EXPECTED_SHA:0:12}"
    info "Evidence was captured on a different commit. Re-run evidence capture on the current branch HEAD."
    info "  Manifest SHA: $MANIFEST_SHA"
    info "  Expected SHA: $EXPECTED_SHA"
  fi
fi

# ---------------------------------------------------------------------------
# Check 5: Verify entrypoint matches expected value
# ---------------------------------------------------------------------------

echo >&2
echo "Check 5: Entrypoint verification" >&2

if [[ -z "$EXPECTED_ENTRYPOINT" ]]; then
  warn "No --entrypoint provided; skipping entrypoint validation"
  info "Pass --entrypoint to ensure evidence covers the intended user flow."
elif command -v jq &>/dev/null && [[ -f "$MANIFEST_PATH" ]]; then
  MANIFEST_ENTRYPOINT=$(jq -r '.entrypoint // empty' "$MANIFEST_PATH" 2>/dev/null)

  if [[ -z "$MANIFEST_ENTRYPOINT" ]]; then
    mark_failed "Manifest missing entrypoint field"
  elif [[ "$MANIFEST_ENTRYPOINT" == "$EXPECTED_ENTRYPOINT" ]]; then
    pass "Entrypoint matches: $EXPECTED_ENTRYPOINT"
  else
    mark_failed "ENTRYPOINT MISMATCH:"
    fail "  Expected: $EXPECTED_ENTRYPOINT"
    fail "  Got:      $MANIFEST_ENTRYPOINT"
    info "Recapture evidence starting from the correct entrypoint URL."
  fi
fi

# ---------------------------------------------------------------------------
# Check 6: Validate evidence/screenshot.png is a real image (basic check)
# ---------------------------------------------------------------------------

echo >&2
echo "Check 6: Screenshot file sanity" >&2

SCREENSHOT_PATH="evidence/screenshot.png"
if [[ -f "$SCREENSHOT_PATH" ]]; then
  # Basic check: a valid PNG starts with the 8-byte PNG signature
  PNG_MAGIC=$(xxd -l 8 "$SCREENSHOT_PATH" 2>/dev/null | awk '{print $2$3}' | head -c16 || echo "")
  if [[ "$PNG_MAGIC" == "89504e47"* ]]; then
    FILESIZE=$(wc -c < "$SCREENSHOT_PATH" | tr -d ' ')
    pass "Screenshot is a valid PNG (${FILESIZE} bytes)"
  elif command -v file &>/dev/null; then
    FILE_TYPE=$(file "$SCREENSHOT_PATH")
    if echo "$FILE_TYPE" | grep -qi "PNG\|image"; then
      pass "Screenshot file type: $FILE_TYPE"
    else
      mark_failed "Screenshot does not appear to be a valid image: $FILE_TYPE"
    fi
  else
    warn "Could not verify screenshot format (xxd/file not available)"
  fi
fi

# ---------------------------------------------------------------------------
# Final verdict
# ---------------------------------------------------------------------------

echo >&2
echo "────────────────────────────────────────────────────────" >&2

if [[ "$ERRORS" -gt 0 ]]; then
  echo -e "${RED}FAILED: $ERRORS check(s) failed.${RESET}" >&2
  echo >&2
  echo "Browser evidence verification is a hard gate for high-risk UI changes." >&2
  echo "See individual failures above and re-capture evidence before merging." >&2
  echo >&2
  exit 1
else
  echo -e "${GREEN}PASSED: All browser evidence checks passed.${RESET}" >&2
  echo >&2
  exit 0
fi
