# CalcHub - Country-Specific Financial Calculator Platform

## Product Definition

A country-specific financial and life calculator platform hosted at `calc.m1ng.space`. All calculations run client-side in the browser. Monetized through Google AdSense via SEO-driven organic traffic.

**Core differentiator:** Deep localization per country — tax brackets, social insurance rates, mortgage rules are implemented per local regulations with cited official sources. Global calculator sites (OmniCalculator, Calculator.net) don't deeply localize.

## Target Countries (MVP)

| Priority | Country | Key Calculators | Data Sources |
|----------|---------|-----------------|-------------|
| 1 | Japan | Income tax (所得税), residence tax (住民税), social insurance | 国税庁, 厚生労働省 |
| 2 | Germany | Einkommensteuer, Sozialversicherung, Solidaritätszuschlag | Bundesfinanzministerium |
| 3 | Brazil | IRPF, INSS, FGTS | Receita Federal |
| 4 | India | Income tax (old/new regime), GST, EPF/PPF | Income Tax Department |
| 5 | Canada | Federal + provincial tax, CPP, EI | CRA |

## Calculator Types (6 per country)

1. **Income Tax Calculator** — Progressive tax brackets, deductions, credits
2. **Salary / Take-Home Pay Calculator** — Gross-to-net with all withholdings
3. **Mortgage Calculator** — Amortization schedule, user-input interest rate
4. **VAT / GST Calculator** — Add/remove tax, reverse calculation
5. **Pension Calculator** — Retirement savings projection
6. **Currency Converter** — Real-time exchange rates via free API

5 countries x 6 calculators = 30 calculator pages
x 6 languages = 180 unique SEO entry points (MVP)

## Technical Architecture

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js (App Router, Static Export) | SSG for SEO, static hosting |
| Language | TypeScript (strict) | Type safety critical for calculation logic |
| Styling | Tailwind CSS 4 | Rapid development, responsive |
| Charts | Recharts | Mature React charting, lightweight |
| i18n | next-intl | Proven Next.js i18n with static export support |
| Tax Data | JSON files in `/data/{country}/{year}/` | Separated from code, git-trackable |
| Exchange Rates | ExchangeRate-API (free tier) | Client-side fetch, no backend needed |
| Deployment | Cloudflare Pages | Free, global CDN, custom domain |
| Ads | Google AdSense | Auto ads + manual placements |

## URL Structure

```
calc.m1ng.space/
├── /                              # Homepage: country picker + popular calculators
├── /[locale]/                     # Locale root (en, zh, ja, de, pt, hi)
├── /[locale]/[country]/           # Country page: all calculators for this country
│   ├── /income-tax                # Income tax calculator
│   ├── /salary                    # Take-home pay calculator
│   ├── /mortgage                  # Mortgage calculator
│   ├── /vat                       # VAT/GST calculator
│   ├── /pension                   # Pension calculator
│   └── /currency                  # Currency converter
└── /about                         # About + data sources
```

## Data Architecture

```
/data/
├── japan/
│   ├── meta.json                  # Currency, locale, fiscal year info
│   └── 2026/
│       ├── income-tax.json        # Tax brackets, deductions
│       ├── social-insurance.json  # Health, pension, employment insurance rates
│       ├── residence-tax.json     # Per-prefecture rates
│       └── sources.json           # Official source URLs
├── germany/
│   └── 2026/
│       ├── income-tax.json
│       ├── social-insurance.json
│       └── sources.json
├── brazil/
├── india/
└── canada/
```

Each JSON file includes:
- `taxYear`: The applicable fiscal year
- `currency`: ISO currency code
- `source`: Official government URL
- `lastVerified`: Date of last verification

## Multilingual Strategy

| Phase | Languages | Purpose |
|-------|-----------|---------|
| MVP | English (en), Chinese (zh) | Primary SEO language + personal promotion channel |
| Expansion | Japanese (ja), German (de), Portuguese (pt), Hindi (hi) | Local language for each target country |

Implementation: next-intl with `/[locale]/` path prefix. Default locale: `en`.

## Page Layout

### Calculator Page

```
┌─────────────────────────────────────────┐
│  Logo    [Country ▾]  [Lang ▾]          │  Navigation
├─────────────────────────────────────────┤
│  {Country} {Type} Calculator {Year}     │  H1 (SEO keyword)
│  {Description with search terms}        │  Subtitle
├─────────────────────────────────────────┤
│  INPUT SECTION                          │  No ads here
│  - Country-specific input fields        │
│  - Dropdowns for local options          │
│  - [Calculate] button                   │
├─────────────────────────────────────────┤
│  RESULTS SECTION                        │  No ads here
│  - Large headline number                │
│  - Itemized breakdown table             │
│  - Pie chart / bar chart                │
│  - Monthly vs annual toggle             │
├─────────────────────────────────────────┤
│  [ AD SLOT 1 - below results ]          │  Highest acceptance
├─────────────────────────────────────────┤
│  HOW IT WORKS (SEO content)             │
│  - Tax system explanation (500-800 words)│
│  - Official tax table reference         │
│  - Data source + last verified date     │
├─────────────────────────────────────────┤
│  [ AD SLOT 2 - within content ]         │  Natural reading flow
├─────────────────────────────────────────┤
│  RELATED CALCULATORS                    │  Internal links
│  Footer                                 │
└─────────────────────────────────────────┘
```

**Ad placement principle:** Zero ads in input and result areas. Only show ads after the user has completed their core task.

## Design System

- **Primary color:** Deep navy/blue — conveys financial trust
- **Accent:** Orange — CTA buttons, interactive elements
- **Background:** White (light) / Dark charcoal (dark mode)
- **Typography:** Inter (body), monospace for number displays
- **Charts:** Distinct color per tax/deduction category
- **Trust markers:** Source links, "last verified" dates, official tax table citations
- **Dark mode:** System-aware toggle

## SEO Strategy

Per calculator page:
- **Title tag:** `{Country} {Type} Calculator {Year} | Free & Accurate`
- **Meta description:** Includes country name, calculator type, year, "based on official data"
- **H1:** Contains country + type + year
- **Schema.org:** `FAQPage` structured data
- **Sitemap:** Auto-generated, all 180+ pages
- **Internal linking:** Each calculator links to same-country others + same-type across countries
- **Content:** 500-800 word explanation below calculator, targeting long-tail queries

## Revenue Projection

Assumptions:
- Finance RPM: $15-25 (conservative)
- Month 1-3: 50 pages live, ~5K monthly PV → ~$100/month
- Month 3-6: SEO indexing, ~50K monthly PV → ~$1,000/month
- Month 6-12: 15 countries, ~100K+ monthly PV → ~$2,000+/month
- Year 2+: 20+ countries, local languages, ~500K+ PV → ~$10,000+/month

## Data Reliability

- Tax rates stored as structured JSON with official source URLs
- Each data file includes `lastVerified` date
- Mortgage/loan calculators use user-input rates (no stale data risk)
- Exchange rates fetched real-time from free API
- Annual update cycle aligned with each country's fiscal year
- Every calculator displays data source and verification date to users
