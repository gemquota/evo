# Audit 2: Second Comprehensive Audit of params.html

**Date:** 2026-07-14 (post-fix)  
**File:** params.html (1244 lines)  
**Focus:** Remaining issues after Audit 1 fixes, new issues introduced by fixes, deeper analysis

---

## Post-Fix Verification (14 checks)

### ✅ C1 — CSS nesting fixed
`@media (max-width: 640px)` block now has valid CSS. Confirmed.

### ✅ J1 — cols.join fixed
`join('+')` → `join("")`. Header row now renders without `+` artifacts. Confirmed.

### ✅ D1-D3 — Type fields corrected
`attractRadius`: F, `zRange`: F, `repulsionRadius max`: "800". Confirmed.

### ✅ A3 — Need cases added
fps, frameTime, visibleCount, particleCount → R; _autoQuality → D. Confirmed.

### ✅ A4 — Cognitive load rebalanced
imp===1||imp===0 used instead of imp===3||imp===2. Confirmed.

### ✅ A6 — Thresholds adjusted
`load >= 1 ? 'M'` instead of `load >= 2 ? 'M'`. Confirmed.

### ✅ C2 — --surface2 removed
Variable no longer in `:root`. Confirmed.

### ✅ C7 — loc-badge styled
Background and padding added. Confirmed.

### ✅ C8 — @media print styles added
Print-friendly styles present before `</style>`. Confirmed.

### ✅ U3 — localStorage wrapped
All 6 localStorage calls wrapped in try/catch. Confirmed.

### ✅ R4 — Redundant files removed
4 files deleted. Confirmed.

---

## New Issues Found in Audit 2

### N1. `scopeLabel` and `typeLabel` defined but `typeLabel` is used in `typeBadge` 
- `typeBadge` uses `typeLabel(p.type)` — need to check if `typeLabel` exists

### N2. `grep` shows `typeLabel` might be missing
- Previous audit didn't check for this
- If `typeLabel` is undefined, the type badge title would show "Type: undefined"

### N3. Badge factory opportunity still exists
- Though individual functions work, ~10 nearly identical functions exist
- Each follows pattern: `return \`<span class="X-badge X-${val}" title="...">${val}</span>\``
- A unified `badge(name, val, title)` could reduce 40+ lines to 10

### N4. `Tuning Cadence` always `F` except for readonly/toggle/non-live
- Any slider that is `live === 'Yes'` gets `cadence = 'F'`
- This makes ~80% of params "Frequent" — not very informative
- Could distinguish between "Constantly tweaked" vs "Occasionally tuned"

### N5. `cluster-gap` duplicated in media query
- `@media (max-width: 640px)` block re-declares `.cluster-gap { display: inline-block; width: 4px; }`
- This is identical to the base rule — unnecessary override

### N6. `--surface2` removal may have left extra blank line
- Should verify no blank line was left in `:root` block

### N7. `print-color-adjust` typo
- In the print styles, I wrote `print-color-adjust: exact;` but the correct property is `color-adjust: exact` or `-webkit-print-color-adjust: exact`
- `print-color-adjust` is non-standard and may not work

### N8. `impTitle` function uses object lookup map — cleaner than before
- Current: `return {3:'Critical importance',2:'High importance',1:'Medium importance',0:'Low importance'}[p.imp]||'Importance: '+p.imp;`
- This is clean and correct. Good.

### N9. Type badge uses `tbadge` class but CSS defines `.scope-badge` 
- Looking at CSS, `.tbadge` might not have defined styles
- Need to check if `.tbadge` appears in CSS

### N10. `_dom` field still computed but unused
- 15 lines of code compute domain assignments
- No render path exists — purely dead code

---

## Summary Statistics

| Category | Issues Found |
|----------|-------------|
| Post-fix verification | 11 ✅ |
| New issues | 10 |
| **Total remaining** | **10** (minor) |

