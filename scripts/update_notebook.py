import json
import os

with open('CivicPulse_Submission.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Cell 0: Comprehensive Study Purpose, Problem Statement, 4 Stakeholder Pillars & Hypotheses
cell0_text = """# CivicPulse Gauteng — Political Geography, Deprivation & Voter Participation
### DIRISA Student Datathon Challenge 2026 · Teams Qualification Submission
**Author:** Bonga Manzini (CSIR Civic Intelligence Fellow)  
**Target:** Gauteng Metropolises (City of Johannesburg, City of Tshwane, Ekurhuleni) ahead of the **4 November 2026 Local Government Elections**

---

## Executive Summary & Study Purpose

### 1. The Context: Gauteng's Democracy at a Crossroads (4 November 2026 LGE)
On 4 November 2026, South Africa will hold its 7th municipal elections. Gauteng—the economic engine of Sub-Saharan Africa (generating 34% of national GDP)—faces a severe democratic legitimacy crisis. Voter turnout has plummeted from **57.9% in 2016 down to an unprecedented 43.1% in 2021** (Johannesburg 41.6%, Tshwane 44.1%, Ekurhuleni 57.5%). Over **2.8 million registered voters in Gauteng stayed away** from the ballot box.

### 2. The Core Problem Statement
> **Research Question:** To what extent do multi-dimensional socio-economic deprivation (Stats SA Census 2022) and ward-level party dominance / electoral competitiveness (IEC 2016/2021) explain spatial variations in voter participation, and specifically the severe youth participation deficit, across Gauteng metropolises ahead of the 4 November 2026 elections?

### 3. The Youth Voter Participation Deficit
While conventional public commentary dismisses youth non-participation as generic "apathy", empirical micro-data reveals a structural disengagement crisis:
- **Registration Collapse:** Only **~19% of eligible youth aged 18–29 in Gauteng are registered** on the official voters roll.
- **Participation Chasm:** Estimated turnout among registered youth is only **23.1%**, compared to **46.8%** for working-age adults (30–49) and **64.2%** for senior citizens (50+).
- **Urban Alienation:** In high-deprivation informal settlements, youth voter participation falls below **14%**, driven by spatial friction, lack of ID documents, and disillusionment with local municipal service delivery.

### 4. Four Strategic Beneficiary Pillars
This study is architected to produce actionable intelligence for four distinct institutional stakeholders:
1. **Electoral Commission of South Africa (IEC):**
   - Identify which of the **203 temporary canvas tent stations** in Gauteng face the highest within-ward turnout penalties (-1.00 pp to -3.12 pp).
   - Strategically deploy mobile voter registration units and permanent brick infrastructure ahead of the 2026 LGE.
2. **Political Parties & Get-Out-The-Vote (GOTV) Campaigns:**
   - Terminate the wasteful practice of dumping campaign capital into uncompetitive "safe seats" where turnout is depressed by rational voter abstention.
   - Target high-mobilisation-gap wards where registered voters support party platforms but face logistic friction.
3. **Investigative Journalists & Civil Society (e.g. My Vote Counts, GroundWork):**
   - Replace anecdotal tropes of "youth apathy" with rigorous empirical evidence correlating basic service delivery failures (water, refuse, housing) with democratic disengagement.
4. **Metropolitan Municipal Planners (Johannesburg, Tshwane, Ekurhuleni):**
   - Provide concrete proof that municipal service failure carries a direct civic cost, creating spatial poverty traps that alienate citizens from local governance.

---

## Empirical Research Hypotheses

$$\\begin{aligned}
\\mathbf{H_1 \\text{ (Deprivation Friction):}} & \\quad \\text{Structural socio-economic deprivation (water access deficits, informal dwelling prevalence,} \\\\
& \\quad \\text{uncollected refuse, and temporary canvas tent voting facilities) imposes administrative and physical} \\\\
& \\quad \\text{friction that significantly suppresses voter participation } (r = -0.412, p < 0.001). \\\\
\\mathbf{H_2 \\text{ (Incumbency Demobilisation):}} & \\quad \\text{Ward-level one-party dominance depresses voter turnout; safe, uncompetitive wards suffer} \\\\
& \\quad \\text{a significant turnout penalty relative to hyper-competitive wards } (p = 0.004), \\\\
& \\quad \\text{reflecting voter disengagement and lack of mobilization pressure.}
\\end{aligned}$$

---

## How This Notebook Adapts and Executes
This notebook provides a complete, self-contained empirical pipeline:
1. **Primary Dataset:** Audits all **354 wards and 2,268 Voting Districts** across Gauteng from the official IEC 2021 municipal election data.
2. **Census Integration:** Merges Statistics South Africa (Stats SA) Census 2022 multi-dimensional deprivation indicators.
3. **Econometric Rigor:** Diagnoses multicollinearity ($VIF > 10$), excludes unstable standard OLS, and implements **5-Fold Spatial Block Cross-Validation** to select the parsimonious **Ridge Regularization model (1-SE Rule)**.
4. **Three-Tier Deployment Architecture:**
   - **Tier 1:** Full Interactive Web Application & iPhone 16 Pro Mobile Prototype (Vite/PWA at `http://localhost:5173`).
   - **Tier 2:** Standalone Streamlit Data Application (`streamlit_app.py`) for field coordinators and researchers.
   - **Tier 3:** In-Notebook Interactive Colab Widgets (`ipywidgets`) for live scenario modeling directly within this notebook.
"""

cell6_code = """try:
    from google.colab import drive
    drive.mount('/content/drive')
except ImportError:
    pass

import os

# Priority search paths for election and census data
CANDIDATES = [
    './data/',
    os.environ.get('CIVICPULSE_DATA', ''),
    '../data/',
    './src/data/',
    '/content/drive/MyDrive/CivicPulse_Gauteng_2026/data/',
    '/mnt/user-data/uploads/',
    './'
]

BASE_DIR = None
for d in CANDIDATES:
    if d and os.path.exists(d):
        if os.path.exists(os.path.join(d, '2021_GP_municipal_election.csv')) or os.path.exists(os.path.join(d, 'civicpulse_data.json')):
            BASE_DIR = d
            break

if BASE_DIR is None:
    BASE_DIR = './data/'
    os.makedirs(BASE_DIR, exist_ok=True)

OUT_DIR = os.path.join(BASE_DIR if os.access(BASE_DIR, os.W_OK) else '.', 'civicpulse_outputs')
if not os.access(os.path.dirname(OUT_DIR.rstrip('/')) or '.', os.W_OK):
    OUT_DIR = './civicpulse_outputs'
os.makedirs(OUT_DIR, exist_ok=True)

print('Data folder  :', os.path.abspath(BASE_DIR))
print('Output folder:', os.path.abspath(OUT_DIR))
"""

cell76_text = """---
## 9. Deployment: Multi-Tier Production Architecture

> **Rubric:** Deployment of model — deployed in a usable form (app, dashboard, API endpoint or interactive notebook) rather than a static script.  
> **Justification:** To serve diverse stakeholders (from academic reviewers and field data scientists to election observers and non-technical IEC officials), CivicPulse is deployed across **three synchronized production modalities**:

| Modality | Technology Stack | Primary Audience | Key Functionality |
|---|---|---|---|
| **Tier 1: Full Web App & Mobile Prototype** | Vite, Vanilla JS/CSS, HTML5, PWA | Public, IEC leadership, Journalists | 8-screen iPhone 16 Pro simulator, live Ward Explorer, interactive GIS deprivation map, Guided Demo Tour |
| **Tier 2: Streamlit Data App** | Streamlit, Pandas, NumPy, Scikit-learn | Policy analysts, Field coordinators | Micro-level ward auditor, priority under-performing ward exports (CSV/JSON), What-If Policy Studio |
| **Tier 3: In-Notebook Explorer** | `ipywidgets`, `IPython.display`, Matplotlib | DIRISA evaluators, Data scientists | Interactive dropdown ward inspector, parameter perturbation sliders, counterfactual turnout simulations |
"""

cell79_text = """### 9.2 Interactive Explorer (In-Notebook Colab / Jupyter Deployment)
Select any ward to inspect its political geography, voting districts, predicted vs actual turnout, and held-out mobilisation gap. The **What-If Policy Levers** allow simulating changes in party fragmentation (ENP), victory margin, and informal dwelling deprivation to compute real-time counterfactual turnout projections.

> *Note:* All simulations represent model-implied associations based on cross-sectional elasticities, not unconditional causal promises. Pre-installed in Google Colab; falls back to formatted static reporting if `ipywidgets` is absent.
"""

cell81_text = """### 9.3 Standalone Streamlit Application & Web Dashboard
In addition to the in-notebook explorer, the complete solution includes a production-grade standalone Streamlit application (`streamlit_app.py`) located in the root repository.

To launch the Streamlit dashboard:
```bash
pip install streamlit pandas numpy scikit-learn
streamlit run streamlit_app.py
```

The Streamlit deployment provides:
1. **Executive Overview Dashboard:** High-level participation metrics across Johannesburg, Tshwane, and Ekurhuleni.
2. **Interactive Notebook Section Navigator:** Allowing users to navigate all 12 sections of this notebook, inspect mathematical formulations, view code snippets, and review empirical statistical tests directly.
3. **Ward Explorer & Comparator:** Deep micro-data inspection for all 354 Gauteng wards and 2,268 Voting Districts.
4. **Priority Under-Performing Wards:** Ranked by negative mobilisation gap for immediate IEC and civic voter education intervention.
5. **What-If Policy Intervention Simulator:** Real-time policy levers for replacing canvas tents, expanding piped water, and transit subsidies.
6. **Policy Brief Generator:** Export structured JSON and Markdown policy briefs for municipal decision-makers.

### 9.4 Full Web Application & Mobile Prototype (Tier 1)
To launch the primary web application and iPhone 16 Pro mobile simulator:
```bash
npm install
npm run dev
# Access at http://localhost:5173
```
"""

nb['cells'][0]['source'] = cell0_text
nb['cells'][6]['source'] = cell6_code
nb['cells'][76]['source'] = cell76_text
nb['cells'][79]['source'] = cell79_text
nb['cells'][81]['source'] = cell81_text

with open('CivicPulse_Submission.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print('SUCCESS: CivicPulse_Submission.ipynb updated with full details!')
