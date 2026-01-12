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
- Additional fragment: `frag_yoru` (bonus page)
- Fragments unlock as users visit pages multiple times

**Key Functions**:
- `grantFrag(id)` - Grant a fragment to the user
- `hasFrag(id)` - Check if user has a fragment
- `countFrags()` - Count total fragments (drives 404 phase system)
- `addVisit()` - Increment global visit counter
- `addPageVisit(pageId)` - Track visits per page
- `getAi404LogText()` - Generate phase-based 404 message
- `softRedirectToIndexIfNeeded(requiredFrags)` - Silent redirect if requirements not met

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
  }
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
2. Page content fills in/expands with repeated visits
3. 404 page messages evolve through 10 phases based on fragment count + visit count

### 404 Phase System

The 404 page is the only place "Ai" speaks. The message evolves through phases:

- **Phase calculation**: `basePhase = min(fragmentCount, 5)` + bonus phases from visit count and `frag_yoru`
- **Phase 0-1**: Recognition ("……ない。" / "ここ、空。")
- **Phase 2-3**: Awareness of visitor
- **Phase 4**: Signature appears ("— アイ")
- **Phase 5**: Hints at completion page
- **Phase 6-10**: Additional progression messages based on total activity

### Page Requirements & Fragment Granting

Each page has:
1. **Entry requirement** - Checked via `softRedirectToIndexIfNeeded()`
2. **Grant trigger** - Usually after 3+ page visits
3. **Progressive content** - More content appears with repeated visits

**Flow**:
- `profile.html` → No requirement → Grants `frag_profile` on 3rd visit
- `diary.html` → Requires `frag_profile` → Grants `frag_diary` on 3rd visit
- `links.html` → Requires `frag_diary` → Grants `frag_links` on 3rd visit
- `bbs.html` → Requires `frag_links` → Grants `frag_bbs` on 3rd visit
- `archive.html` → Requires `frag_bbs` → Grants `frag_archive` on 3rd visit
- `yoru.html` → No requirement → Grants `frag_yoru` on first visit (hidden page)

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

When adding diary entries, link items, or BBS posts, follow the existing conditional display pattern:

```javascript
{
  show: visits >= N || window.Arg1.hasFrag("frag_something"),
  // content...
}
```

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
