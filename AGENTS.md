# Repository Guidelines

## Project Structure & Module Organization
This repository is a static site composed of standalone HTML pages plus shared CSS/JS assets.
Key locations:
- Root HTML pages (e.g., `index.html`, `about.html`, `404.html`, `error.html`) define each route.
- `assets/` contains shared styling and scripts (`assets/styles.css`, `assets/shared.js`).
- `notes/` holds dated entries such as `notes/2023-07-21.html`.
- `footer.html` and other partial-like files are simple HTML fragments; there is no build system to assemble them.

## Build, Test, and Development Commands
There is no build step or package manager in this repo.
Recommended local preview:
- `python3 -m http.server 8000` (serve the current directory)
  - Open `http://localhost:8000/index.html`
  - Note: links and assets use the `/arg1/` base path; for local preview you may need to host the site under `/arg1/` or temporarily adjust paths.

## Coding Style & Naming Conventions
- Indentation: 2 spaces in HTML/CSS/JS (match existing files like `index.html` and `assets/styles.css`).
- Naming: lowercase filenames, simple page names (`about.html`, `terms.html`); dated note files use `YYYY-MM-DD.html`.
- CSS: compact style blocks are used; keep declarations concise and avoid introducing preprocessors.
- JS: plain browser APIs only; keep scripts small and in `assets/shared.js` or page-local `<script>` blocks.

## Testing Guidelines
No automated tests are present.
Manual checks to run after changes:
- Open `index.html` and key pages in a browser.
- Verify navigation links, especially cross-page flows and `/arg1/` links.
- Spot-check the 404 flow (`404.html` and `error.html`) if modifying related scripts.

## Commit & Pull Request Guidelines
- Git history uses short, generic messages like “modified” and “修正”; there is no enforced convention.
- Prefer concise, descriptive messages in the imperative (e.g., “Fix archive links”).
- For PRs, include a summary, scope of pages touched, and screenshots for UI/CSS changes. Link related issues if applicable.

## Configuration & Deployment Notes
- The site assumes it is hosted under the `/arg1/` path. Keep this base path consistent when adding links or assets.
