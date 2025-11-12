# Intezaam — Wedding Workspace for Talha & Joveriya

A drag‑drop‑and‑play single‑page site + an **organizers workspace** with tasks, guests, budget, vendors, menu, and timeline.

## Live Structure
- `/` — Public wedding site (Talha & Joveriya)
- `/workspace/` — Organizers workspace (client‑side, no server)
- `/data/intezaam.json` — Shared data file (commit this for team sync)
- `/data/templates/*.csv` — Import templates

## Deploy on GitHub Pages
1. Create a repo (e.g., `intezaam`).
2. Upload everything from this folder.
3. Settings → Pages → Deploy from branch → `main` → `/ (root)`.

## Collaborating with Organizers
- Each organizer opens `/workspace/` and works locally (autosaves to their browser).
- To sync: **Export JSON** → commit as `/data/intezaam.json` → others refresh to pull changes.
- Optionally, protect `main` and use PRs for change review.

## Optional Enhancements
- Add a Google Form for RSVP and paste the link in `/index.html`.
- Use GitHub Issues for extended conversations and attach files.
- Add a `CNAME` file for a custom domain.


## Menu Files
- `data/menu/intezaam_menu.csv` — editable in any spreadsheet.
- `data/menu/intezaam_menu.xlsx` — Excel version (if present).
- You can import this menu into the Workspace → Menu tab manually or keep it as the master list.
