# Nikao Growth Hub

A dependency-free, standalone HTML/CSS/JS learning hub. No login, no accounts,
no saved progress, no integrations — just a browsable front end over the
Complete QA & Test Engineering Learning Roadmap (July 2026) and the
engineering team's learning roadmap.

## Run

```
cd Nikao-Growth-Hub
python -m http.server 8000
```

Then open http://localhost:8000

## Content

All data in `roadmap-data.js` was extracted programmatically from the actual
hyperlink relationships inside the supplied .docx — not retyped or guessed.

- 8 categories, 17 skills, **60** individually researched and verified courses/videos/references
- 10 free platforms + 5 premium platforms
- 3 experience-based learning paths (Beginner / Intermediate / Advanced)

Every resource card's "Start learning" button links directly to the real URL
from the roadmap document and opens in a new tab.

## Pages

- **Home** — hero, stats, category tiles
- **Explore skills** — category filter chips + skill cards → skill detail
- **Skill detail** — resources grouped into Premium Courses / Free YouTube / Free References
- **Learning library** — search + filter across all 60 resources
- **Learning paths** — Beginner / Intermediate / Advanced quick reference
- **Platforms** — free and premium platform directory

## Design

Built on the existing Nikao design-system tokens (colors, type scale,
spacing, radii) in `styles.css`, restyled to match the Nikao brand direction:
dark aubergine nav/footer, diagonal-stripe hero, category-accented cards,
lime/teal/ocean accents used sparingly.
