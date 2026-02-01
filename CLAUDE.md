# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static ARG (Alternate Reality Game) website that mimics a nostalgic Japanese personal website (前略プロフィール style). The site features a progressive narrative system where content gradually reveals itself as users explore. The character "Ai (アイ)" communicates only through the 404 page, with story fragments unlocked through page visits.

## Technology Stack

- **Static HTML/CSS/JavaScript** - No build system or framework
- **localStorage** - State management for progression tracking
- **GitHub Pages** - Deployment target

## File Structure

```
/
├── index.html           # TOP page with dynamic menu
├── profile.html         # Self-introduction (fields fill in gradually)
├── diary.html          # Diary entries (expand with visits)
├── links.html          # Links page (items increase)
├── bbs.html            # BBS logs (posts appear)
├── archive.html         # Archive/memo page
├── yoru.html           # Night note (hidden page)
├── 404.html            # 404 page (only place "Ai" speaks)
├── reset.html          # Reset progress utility
├── assets/
│   ├── common.js       # Core state management
│   └── styles.css      # Styling
├── doc/
│   ├── 仕様.md         # Detailed specification
│   └── 台本.md         # Content script
└── tests/
    └── arg1-tests.html # Test page
```

## Core Architecture

### State Management (`assets/common.js`)

The entire progression system is built on `window.Arg1` global object:

**Fragment System**:
- 5 main fragments: `frag_profile`, `frag_diary`, `frag_links`, `frag_bbs`, `frag_archive`
- Additional fragment: `frag_yoru` (bonus page, discovered via puzzle)
- Fragments unlock via **gimmicks (user interactions)**, not visit count

**Gimmick-based Fragment Acquisition**:
| Fragment | Page | Gimmick |
|----------|------|---------|
| `frag_profile` | profile.html | Scroll to bottom ("ここまで。" marker) |
| `frag_diary` | diary.html | Click hidden entry (opacity: 0.15) |
| `frag_links` | links.html | Hover all link items |
| `frag_bbs` | bbs.html | Click "返信する（停止中）" button |
| `frag_archive` | archive.html | Click "そのうち" hidden link |
| `frag_yoru` | yoru.html | Visit page (URL guessed from diary puzzle) |

**Key Functions**:
- `grantFrag(id)` - Grant a fragment to the user
- `hasFrag(id)` - Check if user has a fragment
- `countFrags()` - Count total fragments (drives 404 phase system)
- `addVisit()` - Increment global visit counter
- `addPageVisit(pageId)` - Track visits per page
- `getAi404LogText()` - Generate phase-based 404 message
- `softRedirectToIndexIfNeeded(requiredFrags)` - Silent redirect if requirements not met
- `checkAbsence()` - Detect 5+ minute absence (for special 404 message)
- `shouldShowCrisisEvent()` / `markCrisisShown()` - Crisis event at 5 frags
- `hasAnsweredContinue()` / `markAnsweredContinue()` - Profile "続き?" choice tracking
- `hasRememberedAi()` / `markRememberedAi()` - Final "覚えてる?" button tracking

**Storage Structure**:
```javascript
{
  "frags": {
    "frag_profile": {"at": 1700000000000},
    "frag_diary": {"at": 1700000000001}
  },
  "visits": 12,
  "pageVisits": {
    "profile": 3,
    "diary": 2
  },
  "flags": { "seenSignature": true },
  "lastVisitTime": 1700000000000,
  "wasAbsent": false,
  "crisisShown": false,
  "answeredContinue": false,
  "rememberedAi": false
}
```

### Progression Design Philosophy

**CRITICAL: No Explicit Progress Indicators**
- No progress bars, percentages, or "n/5" displays
- No lock messages or error text when requirements not met
- Users discover content "naturally" as it appears
- Failed requirement checks redirect silently to index.html

**Content Revelation Pattern**:
1. Menu items appear on TOP as fragments unlock
2. Page content expands based on **other pages' fragments** (circular structure)
3. 404 page messages evolve through 10 phases based on fragment count + visit count
4. profile.html acts as a "progress dashboard" - revisit after getting fragments to see changes

### 404 Phase System

The 404 page is the only place "Ai" speaks. The message evolves through phases:

- **Phase calculation**: `basePhase = min(fragmentCount, 5)` + bonus phases from visit count and `frag_yoru`
- **Phase 0**: No message
- **Phase 1**: Traces of someone ("……消えた。" "ここ、誰かいた。")
- **Phase 2**: Awareness of visitor ("送れない。" "そこに、いる？")
- **Phase 3**: Acknowledgment ("来た。" "また、来る？") - Special variant if absent 5+ minutes
- **Phase 4**: Signature appears ("— あ" "— アイ") + shows "答えた。" if profile choice made
- **Phase 5**: Guidance to profile ("\"プロフィール\"に、置いた。")
- **Phase 6-10**: Unsettling revelations about "previous Ai" and viewer's role

**Crisis Event**: When all 5 main fragments collected, first 404 visit triggers a special overlay message ("終わり、かも。") for 8 seconds.

### Page Requirements & Fragment Granting

Each page has:
1. **Entry requirement** - Checked via `softRedirectToIndexIfNeeded()`
2. **Grant trigger** - Gimmick interaction (see table above)
3. **Progressive content** - Content appears based on **other pages' fragments**

**Flow**:
- `profile.html` → No requirement → Grants `frag_profile` on scroll to bottom
- `diary.html` → Requires `frag_profile` → Grants `frag_diary` on hidden entry click
- `links.html` → Requires `frag_diary` → Grants `frag_links` on hover-all
- `bbs.html` → Requires `frag_links` → Grants `frag_bbs` on reply button click
- `archive.html` → Requires `frag_bbs` → Grants `frag_archive` on hidden link click
- `yoru.html` → No requirement → Grants `frag_yoru` on first visit (hidden page, discovered via diary puzzle)

**Content Dependencies (Flag-based)**:
- profile.html fields fill based on: frag_diary → frag_links → frag_bbs → frag_archive
- diary.html entries appear based on: frag_diary → frag_links → frag_bbs → frag_archive
- links.html items appear based on: frag_links → frag_bbs → frag_archive
- bbs.html posts appear based on: frag_bbs → frag_archive
- archive.html memos appear based on: frag_archive → frag_yoru

### Natural 404 Hooks

Intentional broken links to make users encounter the 404 page:
- `index.html`: "キリ番報告" → kiriban.html (doesn't exist)
- `diary.html`: "昨日" → yesterday.html (doesn't exist)
- `bbs.html`: "過去ログ" → log/200x.html (doesn't exist)

## Development Commands

### Local Testing

```bash
# Simple HTTP server (Python)
python3 -m http.server 8000

# Or with Node.js
npx http-server -p 8000

# Then visit: http://localhost:8000
```

### Deployment

This site is designed for GitHub Pages. Push to the repository and enable GitHub Pages to deploy.

## Common Development Tasks

### Adding New Content to Existing Pages

When adding diary entries, link items, or BBS posts, follow the **flag-based** conditional display pattern:

```javascript
{
  show: window.Arg1.hasFrag("frag_something"),
  // content...
}
```

Content visibility should depend on **other pages' fragments**, not visit count. This creates a circular structure where completing one page unlocks content on others.

### Testing Progression States

Use `/reset.html` to clear localStorage and restart progression, or manually manipulate localStorage:

```javascript
// Grant a specific fragment
window.Arg1.grantFrag("frag_profile");

// Check current state
console.log(window.Arg1.loadState());
```

### Modifying 404 Messages

404 phase logic is in `common.js` `getAi404LogText()`. The function constructs messages based on:
- Fragment count (0-5)
- Total visit count
- Presence of `frag_yoru`
- Absence status (`wasAbsent` - 5+ minute absence triggers special Phase 3 variant)
- Profile choice status (`answeredContinue` - affects Phase 4 message)
- Final confirmation status (`rememberedAi` - affects Phase 6+ messages)

## Design Constraints

**MUST NOT**:
- Add progress indicators (%, n/5, progress bars)
- Show lock messages or requirement explanations
- Use "I/私/あたし" in non-404 pages
- Break the "natural discovery" illusion

**MUST**:
- Keep all user-facing progression silent
- Use `softRedirectToIndexIfNeeded()` for access control
- Keep Ai's voice confined to 404.html only
- Maintain short, fragmented text style (前略プロフィール aesthetic)

## Key Specifications

Detailed specifications are in:
- `doc/仕様.md` - Complete technical specification
- `doc/台本.md` - Content script with all text and conditions

When making changes, ensure they align with the ARG narrative structure and "invisible progression" design philosophy.
