# Audit 1: Exhaustive Comprehensive Audit of params.html

**Date:** 2026-07-14  
**File:** params.html (1222 lines, self-contained HTML/JS/CSS)  
**Focus:** Data integrity, rendering logic, CSS correctness, JS correctness, UX, accessibility, maintainability

---

## DATA Integrity (3 issues)

### D1. `attractRadius` type mismatch
- **Location:** Input > Touch Attract param
- **Data:** `type:"I"` (integer), min:10, max:1000
- **Reality:** Engine uses as float with step 0.1 in slider config
- **Severity:** Medium — affects precision badge

### D2. `zRange` type mismatch
- **Location:** World > Z-Space
- **Data:** `type:"I"` (integer), min:10, max:10000
- **Reality:** Engine uses as float, step of 10 in UI slider
- **Severity:** Low — cosmetic

### D3. `repulsionRadius` max value has stray asterisk
- **Location:** Species > Interaction Physics
- **Data:** `max:"800*"` — the `*` is not documented or meaningful
- **Severity:** Low — minor data inconsistency

---

## Data Augmentation Logic (6 issues)

### A1. `_vol` (volatility) computed but never displayed
- 12 lines of code compute volatility but no badge or column renders it
- Dead code in the rendering pipeline

### A2. `_dom` (domain) computed but never displayed
- Another computed field with no render path
- Dead code (20+ lines)

### A3. `_need` assignment hardcoded per param name
- Uses `if (p.name === 'interactionRadius') p._need = 'S'` pattern
- Fragile: adding a new param requires code change here
- Missing cases: `fps`, `frameTime`, `particleCount`, `preset name`, `preset desc`
- These fall through to `p._need = 'F'` (Free) by default — may be incorrect

### A4. `_cog` (cognitive load) counterintuitive weighting
- `if (p.imp === 3 || p.imp === 2) load++` — assigns higher cognitive load to more important params
- Logically, critical params should be simpler/clearer, not more complex
- Also: `load++` for `live === 'No'` — params that don't update live are inherently simpler

### A5. `_dconf` (default confidence) ambiguous `—` vs `L`
- `avg === '='` → `_dconf = 'L'` (Dynamic)
- `avg === '~'` → `_dconf = '—'` (Varies)
- But params with `min:'—'` and `avg:'—'` also get `_dconf='—'` which is correct but confusing when min/avg/max all are `—`

### A6. Cognitive Load threshold imbalance
- `p._cog = load >= 3 ? 'H' : load >= 2 ? 'M' : 'L'`
- With 4 possible sources (imp, live, ctrl, dlen), getting 3+ is quite easy
- 6 params get 'H' rating, most get 'M' — very few get 'L', making the metric uninformative

---

## CSS Issues (8 issues)

### C1. **CRITICAL: Malformed CSS in media query**
- **Location:** Line 397-401 (within `@media (max-width: 640px)`)
- **Code:** `.param-badges { .cluster-gap { ... } gap: 2px; flex-wrap: wrap; }`
- Nested rule is invalid CSS; orphaned `gap`/`flex-wrap` properties
- **Effect:** In responsive layout, the responsive badge wrapping breaks

### C2. `--surface2` CSS variable defined but never used
- Declared in `:root` but never referenced anywhere
- Unnecessary variable cruft

### C3. `.search-clear` uses `display: none` but JS toggles it via `style.display`
- CSS sets `display: none` and `display: block` via sibling selector
- JS also directly sets `style.display = 'block'`
- Duplicated display logic between CSS and JS — potential conflict

### C4. `.key-group` two-column layout wraps incorrectly
- `flex: 1; min-width: 160px;` — min-width prevents proper two-column when content is narrow
- Causes uneven column distribution

### C5. `.tabs` buttons lack bottom-border connection
- Tabs use `border-bottom: 2px solid var(--accent)` on active
- But the parent `.tabs` has no bottom border, so active tab looks disconnected

### C6. No `.key` section has `details` but no `summary` styling for the disclosure triangle
- Default browser-specific disclosure triangle in key section
- Inconsistent appearance across browsers

### C7. `.loc-badge` has no background color
- Other badges have distinct backgrounds, LoC badge is just bold text
- Visual inconsistency

### C8. No `@media print` styles
- Page has no print-friendly stylesheet
- Background/colors would print poorly

---

## JS Logic Issues (6 issues)

### J1. `cols.join('+')` renders literal `+` in table headers
- **Location:** `renderParams()` line ~864
- **Code:** `'<table><thead><tr>' + cols.join('+') + '</tr></thead><tbody>'`
- `cols` already contains full `<th>` tags; joining with `+` inserts literal `+` between headers
- **Severity:** High — rendered text artifact

### J2. Filter by importance breaks when switching tabs
- `applySearch()` uses `activeTab.querySelectorAll('tbody tr')` 
- After `renderAllTabs()` recreates DOM, search/filter state is reapplied
- But `renderAllTabs` replaces innerHTML completely, so if called again, state is lost
- Not triggered currently, but fragile

### J3. Sort re-applies `applySearch()` which may lose sort order
- `sortTable()` calls `applySearch()` at the end
- `applySearch()` toggles `hidden` class based on match
- But `sortTable` first reorders DOM nodes via `appendChild`, then `applySearch` re-hides
- This works but is fragile: sorting moves rows AND potentially re-hides differently

### J4. `touchend` handler in params.html not relevant
- Wait, params.html has no touch handlers — this is not an issue in this file
- (Misread — this issue applies to `useInputHandlers.js`, not params.html)

### J5. Summary counts include `DATA.length` as "sub-categories"
- `DATA.length` = 23 sub-category groups
- But some super-categories have categories, and `.sub` headers contain 23 sub-category labels
- This is actually correct since each DATA entry IS a sub-category

### J6. `currentSort` is `null` but sort indicators persist across tab switches
- On tab switch, `currentSort = null` is set
- But sort indicator arrows from previous tab aren't explicitly removed
- Cleaned up by `renderAllTabs()` which rebuilds innerHTML — works, but implicit

---

## UX / Accessibility Issues (4 issues)

### U1. No keyboard support for filter buttons
- Filter buttons use `click` events only
- No `keydown` or `keypress` handling for Enter/Space
- Works with screen readers that synthesize click, but not for keyboard-only users

### U2. Tab content uses `overflow-x: auto` but tables don't have sticky headers
- Scrolling wide tables loses column context

### U3. No loading or error state
- If `DATA` is malformed or `renderAllTabs` fails, page is blank with no error feedback
- No console error recovery

### U4. Search highlight is minimal
- Search only shows/hides rows; no text highlighting or emphasis within found rows
- Makes it hard to see why a row matched

---

## Redundancy / Modularization (4 issues)

### R1. Badge rendering functions are verbose and repetitive
- `typeBadge()`, `scopeBadge()`, `impTitle()`, `liveTitle()` etc.
- Each is a 3-5 line function that could be consolidated into badge factory
- `ctrlLabel()` and `ctrlTitle()` are similar but separate from the badge functions
- ~80 lines of badge functions

### R2. `superMap` construction and augmentation in same loop
- Lines 910-950: single loop builds `superMap` AND augments params with derived fields
- Mixes data transformation with data structuring
- Should be two phases: augment then group

### R3. Tab view definitions repeated in `renderParams` and `renderAllTabs`
- `renderParams` has full `views` object defining columns per view
- `renderAllTabs` independently lists views as `['badges', 'descriptions', 'fields', 'full']`
- Single source of truth could eliminate duplication

### R4. Parameters CSV duplicates params.html data
- `parameters.csv` contains the same data as the embedded DATA array
- Two sources that will drift over time

---

## Summary Statistics

| Category | Issues Found |
|----------|-------------|
| DATA Integrity | 3 |
| Augmentation Logic | 6 |
| CSS | 8 |
| JS Logic | 6 |
| UX/Accessibility | 4 |
| Redundancy | 4 |
| **Total** | **31** |

