# Northlight theme — working notes

Shopify theme for **Northlight** (northlightmen.com), a DTC men's supplement brand
for American men 40–60. Operated by Carnath Commerce LLC (Wyoming). US only, USD.

Reply to the owner (Lucas) in Brazilian Portuguese. Code, comments and storefront copy in English.

## How this repo works
- Base theme: **Dawn 16.0.0**. Custom work lives in `sections/nl-*.liquid`,
  `snippets/nl-icon.liquid`, `assets/northlight.css`, `assets/northlight.js`,
  and `templates/product.json`.
- The repo is connected to Shopify through the Shopify GitHub integration
  (branch `main`). Theme-editor changes are committed back by Shopify
  ("Update from Shopify for theme …"). **Always `git fetch` + fast-forward
  before editing**, and never overwrite `config/settings_data.json` or
  `*-group.json` / `templates/*.json` blindly: they hold the owner's editor changes.
- Validate with Shopify Theme Check before pushing (`@shopify/theme-check-node`).
- Every `nl-*` section has a schema so the owner can edit copy, images, prices
  and links in the theme editor. Keep it that way: no hard-coded copy.
- Checkout is **Reign** (external), not Shopify checkout. Each pack block in
  `nl-buy-box` holds two Reign links (subscription / one-time). `northlight.js`
  forwards the visitor's query string (UTMs, fbclid, click ids) onto those links.

## Brand system (source: Claude Design canvas "Men's Supplement Identity — Phase 1", brand manual v1.0)
Tagline: **Find your bearing.**  Voice: a pilot reading the instruments — calm,
precise, adult, dry humor, numbers over adjectives, respect for what he has built.
Never: "alpha", "beast", "supreme", "dominate", infomercial or locker-room tone,
fear, shame, innuendo.

Colors (dark-first; usage ratio Navy 50 / Abyss 15 / Midwatch 12 / Ice 10 / Gold 7 / Steel 4 / Aurora 2):
| Token | Hex | Use |
|---|---|---|
| Northlight Navy | `#0F1B2D` | primary ground |
| Abyss | `#080F1A` | depth, footer, cards on navy |
| Midwatch | `#1D2D45` | surfaces, panels |
| Compass Gold | `#CDB27A` | signature accent, buttons (Navy text on Gold) |
| Aurora | `#45CDB3` | **light, not paint**: thin lines, glows, small caps on dark only |
| Ice | `#F3F6F7` | text on dark; light-page ground |
| Steel | `#9AA4AC` | secondary text, silver |
Never Gold or Aurora as text on Ice (contrast fails).
Gradients: night sky `radial-gradient(#1D2D45, #0F1B2D 55%, #080F1A)`; foil gold
`linear-gradient(180deg,#EAD7A6,#CDB27A 48%,#9C7E45)` for type/rules only.

Type (Google Fonts, no third family):
- Display: **Jost** 500 (headlines, wordmark, labels); 800 caps only for 1–2 impact words.
- Text: **Atkinson Hyperlegible Next** 400/700 (body, facts, checkout, legal). Phone body ≥ 18px.
- Eyebrow: Atkinson 700 caps, 14px, letter-spacing .2em, Gold.

Graphic system: Aurora horizon line (one per layout), bezel dial, topographic
contours (10–20% opacity, never behind body copy), the **needle** (gold, always
pointing up) as bullet/progress marker. Icons: 24px grid, 1.6px stroke, round caps,
Gold on dark. Corners are square or nearly square — no bubbly radii.
Photography: men 45–58, real faces, dawn/blue hour, jar raised to the sky,
navy shadows + warm gold highlights. Never gym bodies, lab coats, flames, lightning.

## Product facts (launch SKU)
2 capsules/serving, 30 servings, 60 white vegetarian capsules (size 00).
Per serving: Shilajit extract 10:1 500 mg · Maca (Lepidium meyenii) root extract 10:1 400 mg ·
Tongkat Ali (Eurycoma longifolia) root extract 10:1 200 mg · Boron 10 mg (as boron glycinate, 286 mg).
Other: vegetarian capsule (hypromellose), magnesium stearate.
**These are generic extracts — NOT PrimaVie® or Physta®.** Never use those
trademarks, "branded ingredients", "clinically studied doses" or study
populations from branded-ingredient research. (The brand manual still says
"two branded ingredients"; that copy is outdated.)
Product name is not final (candidate: "Daybreak"). Use "Northlight Daily Vitality Formula for Men" until confirmed.

## Compliance (non-negotiable)
- Structure/function claims only ("supports healthy energy and drive*").
  No disease, drug-like, or treatment claims; no comparison to prescriptions.
- FDA disclaimer wherever a benefit claim appears (footer `nl-legal-note` covers the page).
- No invented numbers: no fake review counts, "16,000+ men", survey %, scarcity
  timers, inflated "compare at" anchors. Placeholders in [BRACKETS] until real.
- Reviews only when real and verified (Judge.me app block in `nl-reviews`).
- Subscription: clear renewal disclosure next to the CTA, online cancel,
  reminder before each charge (California auto-renewal law).
