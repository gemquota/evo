# Change Log 1 — Complete Record

## Fixes Applied

| ID | Change | Status |
|----|--------|--------|
| C1 | Fix malformed CSS nesting in media query | ✅ Done |
| J1 | Fix `cols.join('+')` → `cols.join("")` | ✅ Done |
| D1 | `attractRadius` type `I` → `F` | ✅ Done |
| D2 | `zRange` type `I` → `F` | ✅ Done |
| D3 | `repulsionRadius max` `"800*"` → `"800"` | ✅ Done |
| A3 | Add missing `_need` cases (fps, frameTime, visibleCount, particleCount, _autoQuality) | ✅ Done |
| A4 | Invert cognitive load importance weight; remove live==='No' penalty | ✅ Done |
| A6 | Raise cognitive load thresholds for better distribution | ✅ Done |
| C2 | Remove unused `--surface2` CSS variable | ✅ Done |
| C7 | Style `.loc-badge` with background | ✅ Done |
| C8 | Add `@media print` styles | ✅ Done |
| U3 | Wrap localStorage calls in try/catch | ✅ Done |
| R4 | Remove params_backup.html, params_backup2.html, public/params.html, parameters.csv | ✅ Done |
| R1 | Fixed impTitle function syntax issue | ✅ Done |

## Issues Deferred / Not Actioned

| ID | Reason |
|----|--------|
| A1, A2 | `_vol`, `_dom` unused but harmless — left for future cleanup |
| C3 | search-clear dual display is standard pattern (CSS initial, JS override) |
| C4 | key-group layout works adequately |
| C5 | Tab style is intentional minimal design |
| C6 | details/summary is browser-native — OK |
| J2, J3 | Sorting & search interplay is acceptable for single-page app |
| U1 | Button elements have native keyboard support |
| U2 | Sticky headers are nice-to-have, not a bug |
| U4 | Search highlighting is enhancement, not fix |
| R2 | Separate augmentation from grouping — refactoring nice-to-have |
| R3 | View definition duplication is acceptable for 4 views |

## Summary
**14 fixes applied, 11 issues deferred as non-critical or design choices.**

