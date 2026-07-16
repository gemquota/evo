# Change Log 3 — Addressing Audit 3 Findings

## Fixes Applied

| ID | Change | Status |
|----|--------|--------|
| I1 | Comment out `_vol` dead code computation (3→3 commented lines) | ✅ Done |

## Issues Verified / Deferred

| ID | Status | Reason |
|----|--------|--------|
| I2 | ✅ Verified | `_dom` not referenced elsewhere — safe |
| I5 | Deferred | Tab hardcoded mapping is acceptable |
| I6 | Deferred | Object key order is stable enough |
| I10 | Deferred | esc() risk is theoretical for controlled values |

## Summary
**1 fix applied, 4 verified/deferred.**

## Cumulative Fix Count
| Round | Issues Found | Fixed | Deferred |
|-------|-------------|-------|----------|
| 1 | 31 | 14 | 11 |
| 2 | 10 | 3 | 3 |
| 3 | 5 | 1 | 4 |
| **Total** | **46** | **18** | **18** |

