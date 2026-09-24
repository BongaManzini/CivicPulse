# CivicPulse

> **DIRISA Student Datathon Challenge 2026 · Teams Qualification Submission**  
> **Author / Lead Investigator:** Bonga Manzini (CSIR Civic Intelligence Fellow)  
> **Target Election:** Local Government Elections (LGE), 4 November 2026  
> **Geographic Scope:** Gauteng Metropolises (City of Johannesburg, City of Tshwane, City of Ekurhuleni) — 354 Wards, 2,268 Voting Districts  

---

## 1. Executive Summary & Purpose of the Study

### The Democratic Crisis in Gauteng
In the 2021 Local Government Elections, voter turnout in Gauteng collapsed to **47.4%** — the lowest recorded in South Africa's post-1994 democratic history. Most critically, participation among the **youth cohort (aged 18–29)** plunged to an estimated **23.1%**, in stark contrast to **44.4%** among voters aged 50 and above.

Conventional public discourse frequently dismisses this phenomenon as generic "youth apathy" or political cynicism. This study reframes that narrative using rigorous econometrics, geospatial analysis, and official Census 2022 records:

> **Core Research Problem Statement:**  
> *"To what extent do multi-dimensional deprivation (Stats SA Census 2022) and ward-level party dominance (IEC 2016/2021) explain differences in voter participation, especially youth participation, across the City of Johannesburg, City of Tshwane, and City of Ekurhuleni ahead of the 4 November 2026 Local Government Elections?"*

### Why It Matters, and to Whom
1. **The Electoral Commission of South Africa (IEC) & Civil Society:**  
   Pinpoints exact geographic wards where registration and turnout drives must be targeted prior to May 2026. Empirically identifies **203 temporary canvas tent voting stations** in informal settlements that impose physical queuing friction, weather exposure, and psychological alienation.
2. **Political Parties & Campaign Strategists:**  
   Empirically demonstrates whether uncompetitive "safe seats" (high margin of victory, low Effective Number of Parties) demobilise their own partisans, proving that voters disengage rather than defect.
3. **Investigative Journalists & Media:**  
   Supplies reproducible, ward-level empirical evidence to debunk the "youth apathy" trope by demonstrating that youth abstention is structurally bound to transit poverty, water cuts, and tent stations.
4. **Municipal Leadership & SALGA:**  
   Directly quantifies the democratic cost of service delivery collapse. Wards experiencing recurrent water outages and uncollected refuse display statistically significant civic demobilisation.

---

## 2. Research Hypotheses & Theoretical Framework

### Hypothesis 1: Deprivation Friction Effect ($H_1$)
* **Theoretical Proposition:** Structural deprivation (informal dwellings, lack of on-site piped water, pit latrines, uncollected refuse, and temporary canvas tent voting stations) imposes physical, economic, and psychological barriers that depress voter turnout.
* **Empirical Verdict:** **Confirmed** ($r = -0.412, p < 0.001$).
* **Key Finding:** Affluent wards in Quartile 1 average **52.4% turnout**, whereas informal settlements in Quartile 4 average **31.2% turnout** — a massive **21.2 percentage point participation chasm**. Furthermore, paired within-ward voting district analysis demonstrates that voters assigned to temporary tent stations suffer an additional **-1.00 pp** turnout penalty relative to peers voting in permanent brick-and-mortar halls within the exact same ward.

### Hypothesis 2: Incumbency Demobilisation Effect ($H_2$)
* **Theoretical Proposition:** Wards characterized by overwhelming one-party dominance (high victory margin, Effective Number of Parties $\text{ENP} < 2.0$) experience voter demobilisation; partisan voters abstain due to perceived certainty, while opposition voters abstain due to perceived futility.
* **Empirical Verdict:** **Confirmed** ($p = 0.004, F = 5.21$).
* **Key Finding:** Multi-party contested wards ($\text{ENP} > 3.0$) average **48.9% turnout**, compared to **42.1%** in safe seats — a **6.8 percentage point competition penalty**. However, partisan mobilization elasticities diverge: DA strongholds maintain mobilization (+0.41 SD), whereas ANC strongholds exhibit significant demobilisation (+0.05 SD).

---

## 3. Data Provenance & Harmonisation Pipeline

The project integrates three official, verified national data repositories across 354 wards:
- **IEC Municipal Election Results (2016 & 2021):** 45,086 vote records harmonized across 2,268 Voting Districts, de-duplicated and filtered strictly for ward ballots.
- **Stats SA Census 2022 Ward Indicators:** Multi-dimensional poverty indices, on-site piped water, formal dwellings, electricity, and age cohort distributions (18–29 youth cohort vs older brackets).
- **CSIR Geospatial & Boundary Shapefiles:** Spatial boundary alignment reconciling 2016 and 2021 municipal delimitation shifts, and GIS coordinate matching for 203 temporary tent voting stations.

```
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│     IEC 2016 / 2021     │    │   Stats SA Census 2022  │    │     CSIR GIS Data       │
│  (Ward & PR 45,086 rows)│    │ (Ward Deprivation / Age)│    │(Boundaries & 203 Tents) │
└────────────┬────────────┘    └────────────┬────────────┘    └────────────┬────────────┘
             │                              │                              │
             └──────────────────────┬───────┴──────────────────────────────┘
                                    ▼
                     ┌──────────────────────────────┐
                     │ Data Cleaning & Audit Engine │
                     │ • Zero missing primary keys  │
                     │ • Ward boundary harmonization│
                     │ • Tent station spatial tags  │
                     └──────────────┬───────────────┘
                                    ▼
                     ┌──────────────────────────────┐
                     │     Feature Engineering      │
                     │ • Effective Parties (ENP)    │
                     │ • Victory Margins & Gaps     │
                     │ • Deprivation Composite Index│
                     └──────────────┬───────────────┘
                                    ▼
                     ┌──────────────────────────────┐
                     │ 5-Fold Spatial Block CV      │
                     │ • 1-SE Parsimony Rule Model  │
                     │ • Ridge Regularization       │
                     └──────────────┬───────────────┘
                                    ▼
                     ┌──────────────────────────────┐
                     │ Production Deployment Tiers  │
                     │ 1. Full Web App & Mobile PWA │
                     │ 2. In-Notebook Explorer      │
                     │ 3. Standalone Streamlit App  │
                     └──────────────────────────────┘
```

---

## 4. Econometric Model Selection & Spatial Validation

To prevent spatial autocorrelation leakage across contiguous municipal wards, all candidate models were evaluated using **5-Fold Spatial Block Cross-Validation**.

| Candidate Model | Mean Absolute Error (MAE) | $R^2$ Score | Root Mean Sq Error (RMSE) | Evaluation Verdict |
| :--- | :---: | :---: | :---: | :--- |
| **Baseline (Mean)** | 8.57 pp | -0.0004 | 0.108 | Trivial benchmark |
| **OLS Linear Regression** | 6.33 pp | 0.3652 | 0.079 | **Excluded (Severe Multicollinearity, $\text{VIF} > 10$)** |
| **Ridge Regularized ($\alpha=10$)** | **6.32 pp** | **0.3651** | **0.078** | **CHOSEN (1-SE Parsimony Rule & Direct Explainability)** |
| **Random Forest Regressor** | 6.28 pp | 0.3731 | 0.077 | Competitive (Marginal gain, high complexity, black box) |
| **XGBoost Regressor** | 6.50 pp | 0.3478 | 0.081 | Overfitting risk on spatial boundaries |

### Justification for Model Selection:
While Random Forest achieved a 0.04 pp lower raw MAE, **Ridge Regression was chosen** adhering to the formal **1-Standard Error (1-SE) Parsimony Rule**. Ridge regularizes collinear indicators (handling the severe collinearity where OLS exhibited $\text{VIF} > 10$), guarantees computational stability, and provides signed, standardized coefficients that directly answer the DIRISA challenge's core question (*to what extent specific factors drive participation*).

---

## 5. Multi-Tier Deployment Architecture

Adhering to the DIRISA deployment criteria, CivicPulse is deployed in **three complementary modalities**:

### Tier 1: Production Enterprise Web Application & Mobile PWA (Active)
- **Tech Stack:** Modern Vite, semantic HTML5, curated Vanilla CSS, and modular JavaScript.
- **Offline Edge Capability:** Bundles the complete audited 354-ward and 2,268-voting district dataset in a compressed **505KB JSON payload** (`src/data/civicpulse_data.json`).
- **Performance:** Instantaneous sub-second UI response, zero cloud database latency, zero hosting costs, and complete privacy compliance.
- **Dual Interfaces:** Seamlessly toggles between the **Full Web Application** (desktop/tablet dashboard), the **Mobile Prototype** (iPhone 16 Pro frame with tactile dynamic island), and the **Wireframe Canvas Board** (8-screen synchronized canvas).
- **Policy Simulator Studio:** Interactive what-if policy lab with dynamic levers for water/sanitation delivery, transit subsidies, and tent station replacements.
- **Export Engine:** One-click export of structured **Policy Briefs (JSON/PDF)** for municipal ward committees.

### Tier 2: In-Notebook Interactive Explorer (`CivicPulse_Submission.ipynb`)
- Embedded directly in Section 9.2 of the submission notebook using `ipywidgets`.
- Allows evaluators and markers in Google Colab to select any ward from a dropdown, inspect its voting districts, compare predicted vs actual turnout, and manipulate what-if sliders without installing external packages.

### Tier 3: Standalone Streamlit Application (`streamlit_app.py`)
- Python-native deployment generated from saved model artefacts (`turnout_model.joblib`, `ward_table.csv`, `vd_scored_2021.csv`) for data science teams and municipal stakeholders.

---

## 6. How to Run & Demo the Application

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Launch
```bash
# 1. Clone or navigate to the repository directory
cd CivicPulse

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will be live at:
**[http://localhost:5173/](http://localhost:5173/)**

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 7. Guided Presentation Demo Mode

CivicPulse includes a built-in **Interactive Guided Demo HUD** designed for evaluators and presenters.

1. Click **`Guided Demo Tour`** in the top navigation toolbar.
2. The glowing presentation controller bar activates at the bottom of the screen with speaker prompts:
   - **Step 1: Study Purpose & Problem Statement** (`#panePurpose`) — Explains the 47.4% turnout drop, youth collapse, and 4 beneficiary pillars.
   - **Step 2: Spatial Geography & 203 Tent Stations** (`#paneMap`) — Explores the interactive GIS choropleth and temporary canvas tent hotspots.
   - **Step 3: Ward Audit & Comparator Tool** (`#paneWards`) — Audits ward 79900059, inspects voting stations (halls vs tents), and compares Ward A vs Ward B.
   - **Step 4: Empirical Findings & Statistical Rigor** (`#paneAnalytics`) — Demonstrates H1/H2 confirmation, Q1–Q4 bar charts, and 1-SE Ridge model selection.
   - **Step 5: Policy Simulator Studio** (`#paneSimulator`) — Tunes municipal water/transit/tent levers and projects youth turnout uplift on the dynamic SVG donut.
   - **Step 6: Production Architecture & Deployment** (`#paneDeployment`) — Shows the multi-tier deployment, 505KB offline cache, and reproducibility matrix.

---

## 8. DIRISA SDC 2026 Evaluation Rubric Alignment

| Rubric Criterion | Implementation in CivicPulse | Evidence & Location |
| :--- | :--- | :--- |
| **1. Defined Problem Statement** | Addresses youth disaffection and deprivation friction in Gauteng metros across 354 wards ahead of 4 Nov 2026. | `README.md` (§1), `index.html` (`#panePurpose`), `CivicPulse_Submission.ipynb` (Cell 1) |
| **2. Data Cleaning & Harmonisation** | Harmonized 45,086 IEC election rows, handled boundary shifts, tagged 203 tent stations, verified zero missing keys across 2,268 VDs. | `CivicPulse_Submission.ipynb` (§2–3), `src/data/civicpulse_data.json` |
| **3. EDA & Visualisation** | Multi-layer SVG GIS choropleth map, deprivation quartile vs turnout bar charts, spatial distribution of tent stations. | `index.html` (`#paneMap`, `#paneAnalytics`), `app.js` |
| **4. Feature Engineering** | Tent-served VD informal settlement marker, Effective Number of Parties (ENP), victory margins, deprivation composite index. | `CivicPulse_Submission.ipynb` (§4), `app.js` (`updateFullWardCard`) |
| **5. Model Selection & CV** | Spatial 5-fold cross-validation, 1-SE rule selection of Ridge (MAE 6.32 pp, $R^2$ 0.365) over OLS ($\text{VIF} > 10$) and Random Forest. | `CivicPulse_Submission.ipynb` (§7), `index.html` (`#fullModelsTable`) |
| **6. Hypothesis Tests ($H_1$ & $H_2$)** | $H_1$ deprivation friction confirmed ($r = -0.412, p < 0.001$, -1.00 pp tent penalty). $H_2$ safe-seat demobilisation confirmed ($p = 0.004$). | `CivicPulse_Submission.ipynb` (§6), `index.html` (`#panePurpose`) |
| **7. Deployment in Usable Form** | Working full web app + policy simulator what-if engine + interactive mobile prototype + in-notebook Colab widget + Streamlit app. | `index.html`, `app.js`, `CivicPulse_Submission.ipynb` (§9) |
| **8. Code Documentation & Reproducibility** | Full deterministic seeds (`RNG = 42`), pinned packages, clean modular codebase, zero console warnings. | `package.json`, `app.js`, `README.md` |

---

## 9. License & Citations
- **Data Provenance:** Electoral Commission of South Africa (IEC), Statistics South Africa (Stats SA Census 2022), Council for Scientific and Industrial Research (CSIR).
- **License:** Open Academic & Civic License (MIT) for DIRISA Student Datathon Challenge 2026.
