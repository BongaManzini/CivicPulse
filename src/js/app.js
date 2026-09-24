/**
 * CivicPulse Gauteng — Application Logic & Interactive State Machine
 * DIRISA Student Datathon Challenge 2026 Qualification Submission Prototype
 */

class CivicPulseApp {
  constructor() {
    this.currentScreen = 1;
    this.totalScreens = 8;
    this.currentMode = 'fullapp'; // 'fullapp' | 'device' | 'board' | 'rubric'
    this.currentFullTab = 'overview'; // 'overview' | 'map' | 'wards' | 'analytics' | 'simulator' | 'quiz' | 'rubric'
    this.boardZoom = 1.0;
    this.theme = 'dark';
    
    // Core Data Store
    this.data = null;
    this.activeMetro = 'Tshwane';
    this.activeWardId = '79900059';
    this.activeAge = '18-29';
    this.activeRiskFilter = 'all';

    // Full App Filters & State
    this.fullFilterMetro = 'all';
    this.fullFilterRisk = 'all';
    this.compWardAId = '79900059';
    this.compWardBId = '79700001';

    // Policy Simulator State
    this.simState = {
      f1_service: 25,     // +25% water/sanitation
      f1_active: true,
      f2_jobs: 30,        // +30% youth employment & transit
      f2_active: true,
      f3_facilities: 40,  // +40% replace tents with permanent hubs
      f3_active: true,
      model: 'Ridge',     // 'Ridge' | 'Random Forest' | 'XGBoost' | 'OLS'
      baselineYouthTurnout: 24.0
    };

    // Full App Youth Civic Quiz
    this.fullQuizIndex = 0;
    this.fullQuizAnswers = [];
    this.fullQuizSelectedOption = null;

    // Mobile Quiz State
    this.quizIndex = 0;
    this.quizAnswers = [];
    this.quizQuestions = [
      {
        question: "What local municipal issue most urgently demands your ward councillor's action?",
        options: [
          { text: "Piped water & sanitation infrastructure", type: "service", points: 3 },
          { text: "Frequent power cuts & high tariffs", type: "energy", points: 2 },
          { text: "Youth unemployment & lack of transport to CBD", type: "economy", points: 4 },
          { text: "Refuse dumping & unpaved community roads", type: "environment", points: 2 }
        ]
      },
      {
        question: "Have you or your peers experienced obstacles when registering to vote?",
        options: [
          { text: "Voting station is a temporary tent with long queues", type: "infra", points: 4 },
          { text: "Lack of transport money to reach municipal office", type: "economy", points: 3 },
          { text: "Online portal confusion & missing ID document", type: "digital", points: 2 },
          { text: "Disillusionment: felt our votes wouldn't change anything", type: "disaffection", points: 4 }
        ]
      },
      {
        question: "What form of civic empowerment most excites you?",
        options: [
          { text: "Serving on the local Ward Youth Advisory Committee", type: "leadership", points: 4 },
          { text: "Community data auditor: tracking service delivery budget", type: "audit", points: 4 },
          { text: "Grassroots mobilization & voter education campaigns", type: "activism", points: 3 },
          { text: "Developing civic apps & municipal complaint trackers", type: "tech", points: 4 }
        ]
      },
      {
        question: "How do you rate the pace of service delivery improvement in your ward?",
        options: [
          { text: "Severely delayed: basic services are breaking down", type: "critical", points: 4 },
          { text: "Slow: progress only visible near election years", type: "cautious", points: 3 },
          { text: "Steady: some improvements in roads and water access", type: "positive", points: 2 },
          { text: "Disengaged: haven't seen any local councillor engagement", type: "alienated", points: 4 }
        ]
      }
    ];

    // Demo Walkthrough State
    this.isDemoActive = false;
    this.demoCurrentStep = 0;
    this.demoSteps = [
      {
        tab: 'purpose',
        badge: 'DEMO STEP 1 OF 6: STUDY PURPOSE',
        title: '1. Study Purpose & Gauteng Turnout Crisis',
        desc: 'Addressing why Gauteng voter turnout collapsed to 47.4% in 2021 (the lowest post-1994), with youth turnout (18–29) collapsing to 23.1%. The study models deprivation friction and incumbency demobilisation ahead of 4 Nov 2026.'
      },
      {
        tab: 'map',
        badge: 'DEMO STEP 2 OF 6: SPATIAL HOTSPOTS',
        title: '2. Spatial Geography & 203 Tent Stations',
        desc: 'Interactive choropleth shows severe deprivation clustering in Hammanskraal, Soweto, and Tembisa. 203 temporary canvas tent voting stations create acute queue friction and physical barriers.'
      },
      {
        tab: 'wards',
        badge: 'DEMO STEP 3 OF 6: WARD AUDIT & COMPARATOR',
        title: '3. Ward Explorer & Voting District Inspector',
        desc: 'Explore all 354 wards with 2026 Ridge forecasts (90% credible intervals), breakdown of 2,268 voting districts, and side-by-side comparative variance between contrasting wards.'
      },
      {
        tab: 'analytics',
        badge: 'DEMO STEP 4 OF 6: EMPIRICAL SCIENCE',
        title: '4. Statistical Tests & 1-SE Model Selection',
        desc: 'H1 confirmed (p < 0.001) with a 21.2 pp gap between Q1 and Q4. 5-Fold Spatial Block CV selected Ridge (Alpha=10, MAE 6.32 pp, R² 0.365) while excluding OLS due to severe collinearity (VIF > 10).'
      },
      {
        tab: 'simulator',
        badge: 'DEMO STEP 5 OF 6: POLICY SIMULATOR',
        title: '5. What-If Policy Lab & Real-Time Projections',
        desc: 'Tune municipal interventions: water/sanitation delivery, transit subsidies, and permanent polling station replacement. Live SVG donut chart and dynamic gauges project youth participation uplift.'
      },
      {
        tab: 'deployment',
        badge: 'DEMO STEP 6 OF 6: PRODUCTION DEPLOYMENT',
        title: '6. Systems Architecture & Edge Deployment',
        desc: 'Multi-modal deployment: embedded in-notebook widgets for Colab markers, high-performance web app with 505KB offline edge payload, and Streamlit app for municipal field committees.'
      }
    ];

    this.init();
  }

  async init() {
    this.setupTheme();
    this.bindEvents();
    this.updateClock();
    this.updateCountdown();
    setInterval(() => this.updateClock(), 30000);

    // Load Data
    await this.loadData();
    this.populateWardDropdown();
    this.updateWardCard();
    this.updateAnalyticsChart();
    this.runSimulation();
    this.populateReportTable();
    this.populateBoardSlots();

    // Full App Initializers
    this.populateFullWardsDropdown();
    this.updateFullWardCard();
    this.populateWardComparator();
    this.renderFullDeprivationChart();
    this.initFullQuiz();

    console.log("CivicPulse Gauteng Full Web App initialized successfully.");
  }

  /* --------------------------------------------------------------------------
     1. Data Loading & Initialization
     -------------------------------------------------------------------------- */
  async loadData() {
    try {
      const response = await fetch('./src/data/civicpulse_data.json');
      if (!response.ok) throw new Error("Network response was not ok");
      this.data = await response.json();
      console.log(`Loaded ${this.data.wards.length} wards from real dataset.`);
    } catch (err) {
      console.warn("Could not load civicpulse_data.json, using fallback data:", err);
      this.data = this.getFallbackData();
    }
  }

  getFallbackData() {
    return {
      summary: {
        total_wards: 354,
        total_registered: 5333337,
        overall_turnout: 0.4743,
        tent_vds: 203
      },
      wards: [
        { ward_id: "79900059", metro: "Tshwane", winner: "DA", turnout: 0.294, margin: 0.34, enp: 3.15, ward_gap_pp: -17.2, risk_tier: "High risk", forecast_2026: 0.285, forecast_lo: 0.230, forecast_hi: 0.340, deprivation_score: 0.82 },
        { ward_id: "79800065", metro: "Johannesburg", winner: "IFP", turnout: 0.313, margin: 0.22, enp: 3.82, ward_gap_pp: -16.4, risk_tier: "High risk", forecast_2026: 0.301, forecast_lo: 0.245, forecast_hi: 0.355, deprivation_score: 0.79 },
        { ward_id: "79900100", metro: "Tshwane", winner: "ANC", turnout: 0.218, margin: 0.48, enp: 2.12, ward_gap_pp: -14.2, risk_tier: "High risk", forecast_2026: 0.212, forecast_lo: 0.160, forecast_hi: 0.265, deprivation_score: 0.88 },
        { ward_id: "79700001", metro: "Ekurhuleni", winner: "DA", turnout: 0.713, margin: 0.55, enp: 2.45, ward_gap_pp: 4.8, risk_tier: "Low risk", forecast_2026: 0.695, forecast_lo: 0.640, forecast_hi: 0.750, deprivation_score: 0.18 }
      ],
      analytics: {
        deprivation_quartiles: [
          { quartile: 'Q1 - Low Deprivation', turnout: 0.524, label: 'Affluent / Established Services', youth_turnout: 0.342 },
          { quartile: 'Q2 - Moderate Deprivation', turnout: 0.448, label: 'Suburban / Formal Dwellings', youth_turnout: 0.278 },
          { quartile: 'Q3 - High Deprivation', turnout: 0.386, label: 'Townships / Service Stress', youth_turnout: 0.224 },
          { quartile: 'Q4 - Extreme Deprivation', turnout: 0.312, label: 'Informal Settlements / Tents', youth_turnout: 0.165 }
        ],
        models_comparison: [
          { model: 'Baseline (mean)', mae_pp: 8.57, rmse: 0.108, r2: -0.0004, status: 'Benchmark' },
          { model: 'OLS Regression', mae_pp: 6.33, rmse: 0.079, r2: 0.3652, status: 'Excluded (VIF > 10)' },
          { model: 'Ridge (Selected)', mae_pp: 6.32, rmse: 0.078, r2: 0.3651, status: 'CHOSEN (1-SE Rule)' },
          { model: 'Random Forest', mae_pp: 6.28, rmse: 0.077, r2: 0.3731, status: 'Lowest Raw MAE' },
          { model: 'XGBoost', mae_pp: 6.50, rmse: 0.081, r2: 0.3478, status: 'Competitive' }
        ]
      }
    };
  }

  /* --------------------------------------------------------------------------
     2. Event Listeners & Mode Switcher
     -------------------------------------------------------------------------- */
  bindEvents() {
    // Mode switcher buttons
    document.getElementById('btnModeFullApp')?.addEventListener('click', () => this.setMode('fullapp'));
    document.getElementById('btnModeDevice')?.addEventListener('click', () => this.setMode('device'));
    document.getElementById('btnModeBoard')?.addEventListener('click', () => this.setMode('board'));
    document.getElementById('btnModeRubric')?.addEventListener('click', () => this.setMode('rubric'));

    // Screen Stepper Pills
    document.querySelectorAll('.step-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const targetScreen = parseInt(e.currentTarget.getAttribute('data-screen'), 10);
        this.goToScreen(targetScreen);
      });
    });

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

    // Password visibility toggle
    document.getElementById('btnTogglePwd')?.addEventListener('click', () => {
      const pwdInput = document.getElementById('loginPassword');
      if (pwdInput) {
        pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
      }
    });

    // Research Notes Docs button
    document.getElementById('btnOpenDocs')?.addEventListener('click', () => {
      this.switchFullTab('rubric');
      this.setMode('fullapp');
    });

    // SVG Map Hover & Click (both mobile and full app maps)
    const paths = document.querySelectorAll('.map-region-path');
    paths.forEach(p => {
      p.addEventListener('mouseenter', (e) => this.handleMapHover(e));
      p.addEventListener('mouseleave', () => this.handleMapLeave());
      p.addEventListener('click', (e) => {
        const m = e.currentTarget.getAttribute('data-metro');
        if (m) {
          const selectMetro = document.getElementById('selectMetro');
          if (selectMetro) {
            selectMetro.value = m;
            this.onMetroChange(m);
          }
          this.setFullMetroFilter(m);
          this.showToast(`Switched map focus to ${m}`);
        }
      });
    });

    // Close omni-dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-omni-box')) {
        document.getElementById('omniDropdown')?.classList.remove('show');
      }
    });
  }

  setMode(mode) {
    this.currentMode = mode;

    document.querySelectorAll('.view-mode-selector .mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    const fullContainer = document.getElementById('fullAppContainer');
    const devContainer = document.getElementById('deviceViewContainer');
    const boardContainer = document.getElementById('boardViewContainer');
    const rubricContainer = document.getElementById('rubricViewContainer');
    const stepper = document.getElementById('screenStepper');

    fullContainer?.classList.toggle('active', mode === 'fullapp');
    devContainer?.classList.toggle('active', mode === 'device');
    boardContainer?.classList.toggle('active', mode === 'board');
    rubricContainer?.classList.toggle('active', mode === 'rubric');

    if (stepper) {
      stepper.style.display = (mode === 'device') ? 'flex' : 'none';
    }

    const stage = document.getElementById('prototypeStage');
    if (stage) {
      stage.classList.toggle('stage-fullapp', mode === 'fullapp');
    }

    // In board mode, ensure slots are refreshed
    if (mode === 'board') {
      this.populateBoardSlots();
    }
  }

  switchAppMode(mode) {
    if (mode === 'full' || mode === 'fullapp') this.setMode('fullapp');
    else if (mode === 'mobile' || mode === 'device') this.setMode('device');
    else if (mode === 'board') this.setMode('board');
    else if (mode === 'rubric') this.setMode('rubric');
    else this.setMode(mode);
  }

  /* --------------------------------------------------------------------------
     3. Screen Navigation State Machine
     -------------------------------------------------------------------------- */
  goToScreen(screenNum) {
    if (screenNum < 1 || screenNum > this.totalScreens) return;

    const prevScreen = this.currentScreen;
    this.currentScreen = screenNum;

    // Update screen elements inside slider
    for (let i = 1; i <= this.totalScreens; i++) {
      const scr = document.getElementById(`screen${i}`);
      if (scr) {
        scr.classList.remove('active', 'prev');
        if (i === screenNum) {
          scr.classList.add('active');
        } else if (i < screenNum) {
          scr.classList.add('prev');
        }
      }
    }

    // Update Stepper Pills
    document.querySelectorAll('.step-pill').forEach(pill => {
      const s = parseInt(pill.getAttribute('data-screen'), 10);
      pill.classList.toggle('active', s === screenNum);
    });

    // Scroll active screen to top
    const activeScr = document.getElementById(`screen${screenNum}`);
    if (activeScr) activeScr.scrollTop = 0;

    // Trigger screen-specific refresh
    if (screenNum === 6) this.updateAnalyticsChart();
    if (screenNum === 8) this.runSimulation();
  }

  /* --------------------------------------------------------------------------
     4. Screen 1: Auth Handler
     -------------------------------------------------------------------------- */
  handleLogin() {
    const btn = document.getElementById('btnLogin');
    if (btn) {
      btn.innerHTML = `<span class="spinner-inline"></span> Authenticating...`;
      btn.disabled = true;
    }

    setTimeout(() => {
      if (btn) {
        btn.innerHTML = `<span>Login</span>`;
        btn.disabled = false;
      }
      this.showToast("Welcome to CivicPulse Gauteng!");
      this.goToScreen(2);
    }, 450);
  }

  /* --------------------------------------------------------------------------
     5. Screen 4: Metro & Ward Filtering
     -------------------------------------------------------------------------- */
  populateWardDropdown() {
    const wardSelect = document.getElementById('selectWard');
    if (!wardSelect || !this.data) return;

    wardSelect.innerHTML = '';
    const filteredWards = this.data.wards.filter(w => {
      const matchMetro = w.metro === this.activeMetro;
      const matchRisk = this.activeRiskFilter === 'all' || w.risk_tier === this.activeRiskFilter;
      return matchMetro && matchRisk;
    });

    filteredWards.sort((a, b) => (a.ward_num || 0) - (b.ward_num || 0));

    filteredWards.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.ward_id;
      opt.textContent = `Ward ${w.ward_id.slice(-4)} (${w.winner} · ${(w.turnout * 100).toFixed(1)}%)`;
      wardSelect.appendChild(opt);
    });

    // Update count badge
    const badge = document.getElementById('filterWardCountBadge');
    if (badge) {
      badge.textContent = `${filteredWards.length} Wards`;
    }

    // Select first or active
    if (filteredWards.length > 0) {
      const currentExists = filteredWards.some(w => w.ward_id === this.activeWardId);
      if (!currentExists) {
        this.activeWardId = filteredWards[0].ward_id;
      }
      wardSelect.value = this.activeWardId;
    }
  }

  onMetroChange(newMetro) {
    this.activeMetro = newMetro;
    this.populateWardDropdown();
    this.updateWardCard();
    this.updateAnalyticsChart();
  }

  onWardChange(newWardId) {
    this.activeWardId = newWardId;
    this.updateWardCard();
  }

  onAgeChange(newAge) {
    this.activeAge = newAge;
    this.updateWardCard();
    this.updateAnalyticsChart();
  }

  onRiskFilterChange(newRisk) {
    this.activeRiskFilter = newRisk;
    this.populateWardDropdown();
    this.updateWardCard();
  }

  updateWardCard() {
    if (!this.data) return;
    const ward = this.data.wards.find(w => w.ward_id === this.activeWardId) || this.data.wards[0];
    if (!ward) return;

    document.getElementById('cardWardId').textContent = `Ward ${ward.ward_id}`;
    document.getElementById('cardWardMetro').textContent = `City of ${ward.metro}`;

    // Winner Badge
    const badge = document.getElementById('cardWinnerBadge');
    if (badge) {
      badge.textContent = `${ward.winner} Won`;
      badge.className = 'winner-badge';
      if (ward.winner === 'DA') badge.classList.add('party-da');
      else if (ward.winner === 'ANC') badge.classList.add('party-anc');
      else if (ward.winner === 'EFF') badge.classList.add('party-eff');
      else if (ward.winner === 'ActionSA') badge.classList.add('party-actionsa');
      else badge.classList.add('party-da');
    }

    // Stats
    document.getElementById('cardTurnout').textContent = `${(ward.turnout * 100).toFixed(1)}%`;
    document.getElementById('cardMargin').textContent = ward.margin.toFixed(2);
    document.getElementById('cardENP').textContent = ward.enp.toFixed(2);

    const gapEl = document.getElementById('cardGap');
    if (gapEl) {
      const gap = ward.ward_gap_pp || (ward.turnout - 0.42) * 100;
      gapEl.textContent = `${gap >= 0 ? '+' : ''}${gap.toFixed(1)} pp`;
      gapEl.className = 'w-val ' + (gap < -5 ? 'text-danger' : gap > 0 ? 'text-accent' : '');
    }

    // Forecast
    const fcVal = ward.forecast_2026 ? `${(ward.forecast_2026 * 100).toFixed(1)}%` : '28.5%';
    const fcLo = ward.forecast_lo ? `${(ward.forecast_lo * 100).toFixed(1)}%` : '23.0%';
    const fcHi = ward.forecast_hi ? `${(ward.forecast_hi * 100).toFixed(1)}%` : '34.0%';

    document.getElementById('cardForecastVal').textContent = fcVal;
    document.getElementById('cardForecastCI').textContent = `${fcLo} – ${fcHi}`;
  }

  /* --------------------------------------------------------------------------
     6. Screen 5: Spatial Map Interaction
     -------------------------------------------------------------------------- */
  handleMapHover(event) {
    const metro = event.currentTarget.getAttribute('data-metro');
    const stats = {
      'Tshwane': { score: 'High (0.84)', turnout: '21.4% (Youth)' },
      'Johannesburg': { score: 'Elevated (0.68)', turnout: '23.8% (Youth)' },
      'Ekurhuleni': { score: 'Moderate (0.42)', turnout: '31.2% (Youth)' }
    };

    const st = stats[metro] || { score: 'Moderate', turnout: '25%' };
    
    // Update mobile map tooltip
    const tooltip = document.getElementById('mapTooltip');
    if (tooltip) {
      document.getElementById('tooltipMetro').textContent = `City of ${metro}`;
      document.getElementById('tooltipScore').textContent = st.score;
      document.getElementById('tooltipTurnout').textContent = st.turnout;
      tooltip.style.opacity = '1';
    }

    // Update full app map tooltip
    const fullTooltip = document.getElementById('fullMapTooltip');
    if (fullTooltip) {
      const elMetro = document.getElementById('fullTooltipMetro');
      const elScore = document.getElementById('fullTooltipScore');
      const elTurnout = document.getElementById('fullTooltipTurnout');
      if (elMetro) elMetro.textContent = `City of ${metro}`;
      if (elScore) elScore.textContent = st.score;
      if (elTurnout) elTurnout.textContent = st.turnout;
      fullTooltip.style.opacity = '1';
    }
  }

  handleMapLeave() {
    const tooltip = document.getElementById('mapTooltip');
    if (tooltip) tooltip.style.opacity = '0.9';
    const fullTooltip = document.getElementById('fullMapTooltip');
    if (fullTooltip) fullTooltip.style.opacity = '0.9';
  }

  onMapLayerChange(layer) {
    const paths = document.querySelectorAll('.map-region-path');
    paths.forEach(p => {
      if (layer === 'turnout') {
        p.setAttribute('fill', '#10b981');
      } else if (layer === 'youth') {
        p.setAttribute('fill', '#8b5cf6');
      } else {
        // Deprivation default
        const m = p.getAttribute('data-metro');
        if (m === 'Tshwane') p.setAttribute('fill', '#ef4444');
        else if (m === 'Johannesburg') p.setAttribute('fill', '#f97316');
        else p.setAttribute('fill', '#10b981');
      }
    });
    this.showToast(`Map layer updated: ${layer}`);
  }

  /* --------------------------------------------------------------------------
     7. Screen 6: Deprivation vs Turnout Chart
     -------------------------------------------------------------------------- */
  updateAnalyticsChart() {
    const container = document.getElementById('deprivationBarChart');
    if (!container || !this.data) return;

    const quartiles = this.data.analytics.deprivation_quartiles || [];
    const isYouth = this.activeAge === '18-29';

    // Build SVG Bar Chart
    const svgWidth = 280;
    const svgHeight = 130;
    const barWidth = 44;
    const gap = 24;
    const startX = 20;

    let barsSvg = '';
    quartiles.forEach((q, i) => {
      const val = isYouth ? q.youth_turnout : q.turnout;
      const height = Math.round(val * 160);
      const x = startX + i * (barWidth + gap);
      const y = svgHeight - height - 20;

      // Color from Green (Q1) to Red (Q4)
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
      const color = colors[i] || '#3b82f6';

      barsSvg += `
        <g class="bar-group" data-q="${q.quartile}">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="6" fill="${color}" fill-opacity="0.85">
            <animate attributeName="height" from="0" to="${height}" dur="0.5s" fill="freeze" />
            <animate attributeName="y" from="${svgHeight - 20}" to="${y}" dur="0.5s" fill="freeze" />
          </rect>
          <text x="${x + barWidth / 2}" y="${y - 6}" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">
            ${(val * 100).toFixed(1)}%
          </text>
          <text x="${x + barWidth / 2}" y="${svgHeight - 4}" font-size="9" font-weight="600" fill="#94a3b8" text-anchor="middle">
            Q${i + 1}
          </text>
        </g>
      `;
    });

    container.innerHTML = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="barchart-svg">
        <line x1="10" y1="${svgHeight - 18}" x2="${svgWidth - 10}" y2="${svgHeight - 18}" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        ${barsSvg}
      </svg>
    `;
  }

  /* --------------------------------------------------------------------------
     8. Screen 7: Hypothesis Gesture Interaction
     -------------------------------------------------------------------------- */
  handleFeedbackClick() {
    const btn = document.getElementById('btnClapFeedback');
    const countEl = document.getElementById('gestureCount');
    if (!btn || !countEl) return;

    let count = parseInt(countEl.textContent, 10) || 24;
    count++;
    countEl.textContent = count;
    btn.classList.add('clapped');

    this.showToast("Empirical assumptions endorsed! Moving forward.");
  }

  /* --------------------------------------------------------------------------
     9. Screen 8: Policy Simulator Engine
     -------------------------------------------------------------------------- */
  onModelSelect(modelName) {
    this.simState.model = modelName;
    this.runSimulation();
  }

  runSimulation() {
    // Read feature sliders & checkboxes (from full app or mobile)
    const chk1 = (document.getElementById('fullChk1')?.checked ?? document.getElementById('chkFeature1')?.checked) ?? true;
    const chk2 = (document.getElementById('fullChk2')?.checked ?? document.getElementById('chkFeature2')?.checked) ?? true;
    const chk3 = (document.getElementById('fullChk3')?.checked ?? document.getElementById('chkFeature3')?.checked) ?? true;

    const val1 = parseInt(document.getElementById('fullSlider1')?.value || document.getElementById('sliderFeature1')?.value || 25, 10);
    const val2 = parseInt(document.getElementById('fullSlider2')?.value || document.getElementById('sliderFeature2')?.value || 30, 10);
    const val3 = parseInt(document.getElementById('fullSlider3')?.value || document.getElementById('sliderFeature3')?.value || 40, 10);

    // Update label bubbles on mobile
    const bubble1 = document.getElementById('valFeature1');
    const bubble2 = document.getElementById('valFeature2');
    const bubble3 = document.getElementById('valFeature3');
    if (bubble1) bubble1.textContent = `+${val1}%`;
    if (bubble2) bubble2.textContent = `+${val2}%`;
    if (bubble3) bubble3.textContent = `+${val3}%`;

    // Update label bubbles on full app
    const fBubble1 = document.getElementById('fullBubble1');
    const fBubble2 = document.getElementById('fullBubble2');
    const fBubble3 = document.getElementById('fullBubble3');
    if (fBubble1) fBubble1.textContent = `+${val1}%`;
    if (fBubble2) fBubble2.textContent = `+${val2}%`;
    if (fBubble3) fBubble3.textContent = `+${val3}%`;

    // Calculate simulated uplift using empirical model coefficients
    // Weights based on DIRISA regression feature importance
    const wService = chk1 ? (val1 / 50) * 6.5 : 0;      // max +6.5 pp
    const wJobs = chk2 ? (val2 / 50) * 5.2 : 0;         // max +5.2 pp
    const wFacilities = chk3 ? (val3 / 50) * 3.8 : 0;   // max +3.8 pp (tent replacement)

    // Model specific damping / tuning
    let modelMultiplier = 1.0;
    if (this.simState.model === 'Random Forest') modelMultiplier = 1.05;
    else if (this.simState.model === 'XGBoost') modelMultiplier = 0.98;
    else if (this.simState.model === 'OLS') modelMultiplier = 1.08;

    const totalLift = (wService + wJobs + wFacilities) * modelMultiplier;
    const baseline = this.simState.baselineYouthTurnout; // 24.0%
    const simulatedTurnout = Math.min(Math.round(baseline + totalLift), 75);

    // Update Progress Gauges (Mobile)
    const fillSim = document.getElementById('gaugeFillSimulated');
    const valSim = document.getElementById('gaugeValSimulated');
    if (fillSim) fillSim.style.width = `${simulatedTurnout}%`;
    if (valSim) valSim.textContent = `${simulatedTurnout}%`;

    // Update Progress Gauges (Full App)
    const fullFillSim = document.getElementById('fullSimTurnoutFill');
    const fullValSim = document.getElementById('fullSimTurnoutVal');
    if (fullFillSim) fullFillSim.style.width = `${simulatedTurnout}%`;
    if (fullValSim) fullValSim.textContent = `${simulatedTurnout}%`;

    // Center Donut Stat (Mobile & Full)
    const donutStat = document.getElementById('donutTotalImpact');
    if (donutStat) donutStat.textContent = `+${totalLift.toFixed(1)}%`;
    const fDonutStat = document.getElementById('fullDonutImpact');
    if (fDonutStat) fDonutStat.textContent = `+${totalLift.toFixed(1)}%`;
    const fDonutCenter = document.getElementById('fullDonutCenterVal');
    if (fDonutCenter) fDonutCenter.textContent = `+${totalLift.toFixed(1)}%`;

    // Render Donut SVG
    this.renderDonutChart(wService, wJobs, wFacilities);
    this.renderFullDonutChart(wService, wJobs, wFacilities);

    // Update Table R2 / RMSE / MAE based on selected model
    const tableR2 = document.getElementById('tableR2');
    const tableRMSE = document.getElementById('tableRMSE');
    const tableMAE = document.getElementById('tableMAE');
    const tableParsimony = document.getElementById('tableParsimony');

    const fR2 = document.getElementById('fullR2');
    const fRMSE = document.getElementById('fullRMSE');
    const fMAE = document.getElementById('fullMAE');
    const fParsimony = document.getElementById('fullParsimony');

    const modelMetrics = {
      'Ridge': { r2: '0.365', rmse: '0.078', mae: '6.32 pp', parsimony: 'Validated (1-SE)' },
      'Random Forest': { r2: '0.373', rmse: '0.077', mae: '6.28 pp', parsimony: 'Complex (Non-linear)' },
      'XGBoost': { r2: '0.348', rmse: '0.081', mae: '6.50 pp', parsimony: 'Competitive' },
      'OLS': { r2: '0.365', rmse: '0.079', mae: '6.33 pp', parsimony: 'VIF > 10 Excluded' }
    };

    const m = modelMetrics[this.simState.model] || modelMetrics['Ridge'];
    if (tableR2) tableR2.textContent = m.r2;
    if (tableRMSE) tableRMSE.textContent = m.rmse;
    if (tableMAE) tableMAE.textContent = m.mae;
    if (tableParsimony) tableParsimony.textContent = m.parsimony;

    if (fR2) fR2.textContent = m.r2;
    if (fRMSE) fRMSE.textContent = m.rmse;
    if (fMAE) fMAE.textContent = m.mae;
    if (fParsimony) fParsimony.textContent = m.parsimony;
  }

  renderDonutChart(s1, s2, s3) {
    const svg = document.getElementById('simDonutSvg');
    if (!svg) return;

    const total = (s1 + s2 + s3) || 1;
    const p1 = (s1 / total) * 100;
    const p2 = (s2 / total) * 100;
    const p3 = (s3 / total) * 100;

    const radius = 45;
    const circumference = 2 * Math.PI * radius; // ~282.7

    const offset1 = 0;
    const length1 = (p1 / 100) * circumference;

    const offset2 = -length1;
    const length2 = (p2 / 100) * circumference;

    const offset3 = -(length1 + length2);
    const length3 = (p3 / 100) * circumference;

    svg.innerHTML = `
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12" />
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#10b981" stroke-width="12"
              stroke-dasharray="${length1} ${circumference}" stroke-dashoffset="${offset1}" />
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#3b82f6" stroke-width="12"
              stroke-dasharray="${length2} ${circumference}" stroke-dashoffset="${offset2}" />
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#8b5cf6" stroke-width="12"
              stroke-dasharray="${length3} ${circumference}" stroke-dashoffset="${offset3}" />
    `;
  }

  resetSimulation() {
    ['sliderFeature1', 'sliderFeature2', 'sliderFeature3', 'fullSlider1', 'fullSlider2', 'fullSlider3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = 0;
    });

    this.runSimulation();
    this.showToast("Simulation sliders reset to baseline.");
  }

  exportPolicyBrief() {
    const report = {
      project: "CivicPulse Gauteng — 2026 Youth Turnout Policy Simulation",
      date: new Date().toISOString(),
      model: this.simState.model,
      metro: this.activeMetro,
      simulatedTurnout: document.getElementById('gaugeValSimulated')?.textContent || "38%",
      baselineTurnout: "24%",
      recommendations: [
        "Eliminate 203 temporary tent voting stations in informal settlements",
        "Target water infrastructure in top 15 demobilised wards",
        "Coordinate youth voting transit subsidies on 4 Nov 2026"
      ]
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CivicPulse_PolicyBrief_${this.activeMetro}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast("Exported Policy Brief JSON successfully!");
  }

  /* --------------------------------------------------------------------------
     10. Mode 2: Wireframe Board Cloner
     -------------------------------------------------------------------------- */
  populateBoardSlots() {
    for (let i = 1; i <= this.totalScreens; i++) {
      const targetSlot = document.getElementById(`slotFrame${i}`);
      const sourceScreen = document.getElementById(`screen${i}`);
      if (targetSlot && sourceScreen && targetSlot.children.length === 0) {
        // Create cloned phone viewport
        const phoneViewport = document.createElement('div');
        phoneViewport.className = 'phone-viewport';

        // Add dummy status bar
        phoneViewport.innerHTML = `
          <div class="phone-status-bar">
            <span class="status-time">09:41</span>
            <div class="status-dynamic-island"><span class="island-dot"></span><span class="island-text">CivicPulse</span></div>
            <div class="status-icons">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0 0 12 4z"/></svg>
            </div>
          </div>
        `;

        // Clone screen content
        const clonedContent = sourceScreen.cloneNode(true);
        clonedContent.classList.add('active');
        clonedContent.style.position = 'relative';
        clonedContent.style.opacity = '1';
        clonedContent.style.visibility = 'visible';
        clonedContent.style.transform = 'none';

        phoneViewport.appendChild(clonedContent);
        targetSlot.appendChild(phoneViewport);
      }
    }
  }

  zoomBoard(delta) {
    this.boardZoom = Math.min(Math.max(this.boardZoom + delta, 0.6), 1.6);
    const track = document.getElementById('boardTrack');
    const zoomText = document.getElementById('zoomLevelText');
    if (track) track.style.transform = `scale(${this.boardZoom})`;
    if (zoomText) zoomText.textContent = `${Math.round(this.boardZoom * 100)}%`;
  }

  resetBoardZoom() {
    this.boardZoom = 1.0;
    const track = document.getElementById('boardTrack');
    const zoomText = document.getElementById('zoomLevelText');
    if (track) track.style.transform = `scale(1)`;
    if (zoomText) zoomText.textContent = `100%`;
  }

  /* --------------------------------------------------------------------------
     11. Interactive Civic Quiz Flow
     -------------------------------------------------------------------------- */
  openQuizModal() {
    this.quizIndex = 0;
    this.quizAnswers = [];
    const modal = document.getElementById('quizModal');
    if (modal) {
      modal.showModal();
      this.renderQuizStep();
    }
  }

  closeQuizModal() {
    const modal = document.getElementById('quizModal');
    if (modal) modal.close();
  }

  renderQuizStep() {
    const q = this.quizQuestions[this.quizIndex];
    if (!q) {
      this.renderQuizResults();
      return;
    }

    document.getElementById('quizStepText').textContent = `Question ${this.quizIndex + 1} of ${this.quizQuestions.length}`;
    document.getElementById('quizQuestionTitle').textContent = q.question;

    const list = document.getElementById('quizOptionsList');
    if (list) {
      list.innerHTML = '';
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-opt-btn';
        btn.textContent = opt.text;
        btn.onclick = () => {
          document.querySelectorAll('.quiz-opt-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.selectedQuizOption = opt;
          const nextBtn = document.getElementById('btnNextQuiz');
          if (nextBtn) nextBtn.disabled = false;
        };
        list.appendChild(btn);
      });
    }

    const nextBtn = document.getElementById('btnNextQuiz');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = `<span>${this.quizIndex === this.quizQuestions.length - 1 ? 'Finish' : 'Next'}</span>`;
    }
  }

  handleNextQuiz() {
    if (!this.selectedQuizOption) return;
    this.quizAnswers.push(this.selectedQuizOption);
    this.selectedQuizOption = null;

    this.quizIndex++;
    if (this.quizIndex < this.quizQuestions.length) {
      this.renderQuizStep();
    } else {
      this.renderQuizResults();
    }
  }

  renderQuizResults() {
    const body = document.getElementById('quizModalBody');
    const footer = document.getElementById('quizModalFooter');
    document.getElementById('quizStepText').textContent = 'Profile Complete';
    document.getElementById('quizQuestionTitle').textContent = 'Your Civic Archetype';

    const archetypes = [
      {
        title: "Public Infrastructure Auditor",
        desc: "You prioritize basic service delivery, clean water, and accountability. You are best suited for ward committee monitoring, municipal budget oversight, and CSIR civic data labs.",
        rotation: "Career Track: Municipal Governance & Public Infrastructure"
      },
      {
        title: "Youth Mobilisation Catalyst",
        desc: "You believe in empowering young voices to overturn political apathy. You thrive in grassroots democracy, campus voter education, and civic digital storytelling.",
        rotation: "Career Track: Civil Society Leadership & Civic Advocacy"
      }
    ];

    const chosen = archetypes[Math.floor(Math.random() * archetypes.length)];

    body.innerHTML = `
      <div class="archetype-result-card">
        <div class="archetype-badge">🏆 ${chosen.title}</div>
        <p style="margin-bottom: 12px; font-size: 0.88rem; line-height: 1.5; color: #cbd5e1;">${chosen.desc}</p>
        <div class="purple-callout-box" style="margin-top: 10px;">
          <p class="callout-text"><strong>Recommended Mentorship:</strong> ${chosen.rotation}</p>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn-primary btn-block" onclick="window.CivicApp.closeQuizModal(); window.CivicApp.goToScreen(3);">
        <span>Enter Main Dashboard</span>
      </button>
    `;
  }

  /* --------------------------------------------------------------------------
     12. Auxiliary Modals (Stats, Privacy, Calendar, Settings)
     -------------------------------------------------------------------------- */
  openStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) modal.showModal();
  }

  closeStatsModal() {
    const modal = document.getElementById('statsModal');
    if (modal) modal.close();
  }

  showPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (modal) modal.showModal();
  }

  closePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (modal) modal.close();
  }

  showCalendarModal() {
    this.showToast("Elections Timeline: LGE scheduled for 4 Nov 2026. Next registration weekend: May 2026.");
  }

  showSettingsModal() {
    this.showToast("Preferences: Dark Mode Active · Offline Cache Ready · DIRISA SDC 2026 Mode");
  }

  showProfileModal() {
    this.showToast("User Profile: Bonga Manzini · CSIR Civic Intelligence Fellow");
  }

  populateReportTable() {
    const tbody = document.getElementById('reportModelsTbody');
    if (!tbody || !this.data) return;

    const models = this.data.analytics.models_comparison || [];
    tbody.innerHTML = '';
    models.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${m.model}</strong></td>
        <td>${m.mae_pp.toFixed(2)}</td>
        <td>${m.r2.toFixed(3)}</td>
        <td>${m.rmse ? m.rmse.toFixed(3) : '0.078'}</td>
        <td><span class="badge-mini ${m.status.includes('CHOSEN') ? 'badge-green' : ''}">${m.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* --------------------------------------------------------------------------
     13. Utilities: Theme, Toast, Clock
     -------------------------------------------------------------------------- */
  setupTheme() {
    const saved = localStorage.getItem('civicpulse_theme') || 'dark';
    this.theme = saved;
    document.documentElement.setAttribute('data-theme', saved);
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('civicpulse_theme', this.theme);
    this.showToast(`Switched to ${this.theme} theme`);
  }

  updateClock() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const clock = document.getElementById('statusClock');
    if (clock) clock.textContent = `${hrs}:${mins}`;
  }

  showToast(message) {
    const toast = document.getElementById('appToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /* --------------------------------------------------------------------------
     14. Mode 0: Enterprise Full Web Application Methods
     -------------------------------------------------------------------------- */
  updateCountdown() {
    const el = document.getElementById('sidebarCountdown');
    if (!el) return;
    const target = new Date('2026-11-04T07:00:00+02:00').getTime();
    const now = new Date().getTime();
    const diff = target - now;
    if (diff <= 0) {
      el.textContent = 'Election Day';
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    el.textContent = `${days} Days`;
  }

  switchFullTab(tabId) {
    this.currentFullTab = tabId;

    // Sidebar navigation buttons
    const navBtns = document.querySelectorAll('.sidebar-nav-btn');
    navBtns.forEach(btn => {
      if (btn.getAttribute('data-fulltab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Content Panes
    const panes = document.querySelectorAll('.full-tab-pane');
    panes.forEach(pane => pane.classList.remove('active'));

    const targetPaneId = `pane${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`;
    const activePane = document.getElementById(targetPaneId);
    if (activePane) {
      activePane.classList.add('active');
    }

    // Tab-specific lifecycle activations
    if (tabId === 'analytics') {
      this.renderFullDeprivationChart();
    } else if (tabId === 'wards') {
      this.updateFullWardCard();
      this.updateWardComparator();
    } else if (tabId === 'simulator') {
      this.runSimulation();
    } else if (tabId === 'quiz') {
      this.renderFullQuizStep();
    }

    const contentArea = document.getElementById('fullTabContentArea');
    if (contentArea) contentArea.scrollTop = 0;
  }

  setFullMetroFilter(metro) {
    this.fullMetroFilter = metro;

    // Toolbar Metro Pill Buttons
    const btns = document.querySelectorAll('.tb-metro-btn');
    btns.forEach(b => {
      if (b.getAttribute('data-metro') === metro) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Sync dropdown on Ward pane
    const selMetro = document.getElementById('fullSelectMetro');
    if (selMetro) {
      selMetro.value = metro;
    }

    this.populateFullWardsDropdown();
    this.showToast(`Metro filter: ${metro === 'all' ? 'All Gauteng' : metro}`);
  }

  handleOmniSearch(query) {
    const dropdown = document.getElementById('omniDropdown');
    if (!dropdown || !this.data) return;

    const q = (query || '').trim().toLowerCase();
    if (q.length < 2) {
      dropdown.classList.remove('show');
      dropdown.innerHTML = '';
      return;
    }

    const wards = this.data.wards || [];
    const matches = wards.filter(w => {
      const wid = String(w.ward_id || '').toLowerCase();
      const wnum = String(w.ward_num || '').toLowerCase();
      const metro = String(w.metro || '').toLowerCase();
      const winner = String(w.winner || '').toLowerCase();
      return wid.includes(q) || wnum === q || metro.includes(q) || winner.includes(q);
    }).slice(0, 8);

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="omni-no-results" style="padding:0.75rem 1rem; color:var(--color-text-subtle); font-size:0.82rem;">No wards found matching "${query}"</div>`;
      dropdown.classList.add('show');
      return;
    }

    dropdown.innerHTML = matches.map(w => `
      <div class="omni-item" onclick="window.CivicApp.selectWardAndInspect('${w.ward_id}');">
        <div class="omni-left">
          <span class="omni-ward-id">Ward ${w.ward_id} (Ward ${w.ward_num || 'N/A'})</span>
          <span class="omni-metro">City of ${w.metro} · Risk: ${w.risk_tier || 'Moderate'}</span>
        </div>
        <div class="omni-right">
          <span class="badge-mini ${w.winner === 'DA' ? 'badge-blue' : w.winner === 'ANC' ? 'badge-amber' : w.winner === 'EFF' ? 'badge-red' : 'badge-green'}">${w.winner}</span>
          <span class="omni-turnout">${(w.turnout * 100).toFixed(1)}%</span>
        </div>
      </div>
    `).join('');

    dropdown.classList.add('show');
  }

  selectWardAndInspect(wardId) {
    this.selectedWardId = wardId;
    this.activeWardId = wardId;

    const selWard = document.getElementById('fullSelectWard');
    if (selWard) selWard.value = wardId;

    const selWardMobile = document.getElementById('selectWard');
    if (selWardMobile) selWardMobile.value = wardId;

    this.switchFullTab('wards');
    this.updateFullWardCard();
    this.updateWardCard();

    const dropdown = document.getElementById('omniDropdown');
    if (dropdown) dropdown.classList.remove('show');

    const searchInput = document.getElementById('fullSearchWards');
    if (searchInput) searchInput.value = '';

    this.showToast(`Inspecting Ward ${wardId}`);
  }

  populateFullWardsDropdown() {
    const selWard = document.getElementById('fullSelectWard');
    if (!selWard || !this.data) return;

    let wards = this.data.wards || [];
    if (this.fullMetroFilter && this.fullMetroFilter !== 'all') {
      wards = wards.filter(w => w.metro === this.fullMetroFilter);
    }
    if (this.fullRiskFilter && this.fullRiskFilter !== 'all') {
      wards = wards.filter(w => {
        const r = (w.risk_tier || '').toLowerCase();
        if (this.fullRiskFilter === 'high') return r.includes('high');
        if (this.fullRiskFilter === 'med') return r.includes('med') || r.includes('moderate');
        if (this.fullRiskFilter === 'low') return r.includes('low');
        return true;
      });
    }

    const badge = document.getElementById('fullWardCounterBadge');
    if (badge) {
      badge.textContent = `${wards.length} Wards Listed`;
    }

    selWard.innerHTML = wards.map(w => `
      <option value="${w.ward_id}">Ward ${w.ward_id} (${w.metro} - ${w.winner}, ${(w.turnout * 100).toFixed(1)}%)</option>
    `).join('');

    const exists = wards.some(w => w.ward_id === this.selectedWardId);
    if (exists) {
      selWard.value = this.selectedWardId;
    } else if (wards.length > 0) {
      this.selectedWardId = wards[0].ward_id;
      selWard.value = this.selectedWardId;
    }

    this.updateFullWardCard();
  }

  onFullMetroDropdown(metro) {
    this.setFullMetroFilter(metro);
  }

  onFullRiskDropdown(risk) {
    this.fullRiskFilter = risk;
    this.populateFullWardsDropdown();
  }

  onFullWardDropdown(wardId) {
    this.selectedWardId = wardId;
    this.activeWardId = wardId;
    this.updateFullWardCard();
    this.updateWardCard();
  }

  updateFullWardCard() {
    if (!this.data) return;
    const ward = this.data.wards.find(w => w.ward_id === this.selectedWardId) || this.data.wards[0];
    if (!ward) return;

    const elWardId = document.getElementById('fullCardWardId');
    if (elWardId) elWardId.textContent = `Ward ${ward.ward_id}`;

    const elMetro = document.getElementById('fullCardWardMetro');
    if (elMetro) elMetro.textContent = `City of ${ward.metro}`;

    const elBadge = document.getElementById('fullCardWinnerBadge');
    if (elBadge) {
      elBadge.textContent = `${ward.winner} Won`;
      elBadge.className = 'winner-badge';
      if (ward.winner === 'DA') elBadge.classList.add('party-da');
      else if (ward.winner === 'ANC') elBadge.classList.add('party-anc');
      else if (ward.winner === 'EFF') elBadge.classList.add('party-eff');
      else if (ward.winner === 'ActionSA') elBadge.classList.add('party-actionsa');
      else elBadge.classList.add('party-da');
    }

    const elRisk = document.getElementById('fullCardRiskBadge');
    if (elRisk) {
      elRisk.textContent = ward.risk_tier || 'Moderate';
      const r = (ward.risk_tier || '').toLowerCase();
      elRisk.className = 'badge-mini ' + (r.includes('high') ? 'badge-red' : r.includes('low') ? 'badge-green' : 'badge-amber');
    }

    const elTurnout = document.getElementById('fullCardTurnout');
    if (elTurnout) elTurnout.textContent = `${(ward.turnout * 100).toFixed(1)}%`;

    const elMargin = document.getElementById('fullCardMargin');
    if (elMargin) elMargin.textContent = ward.margin.toFixed(2);

    const elENP = document.getElementById('fullCardENP');
    if (elENP) elENP.textContent = ward.enp.toFixed(2);

    const elGap = document.getElementById('fullCardGap');
    if (elGap) {
      const gap = ward.ward_gap_pp !== undefined ? ward.ward_gap_pp : ((ward.turnout - 0.42) * 100);
      elGap.textContent = `${gap >= 0 ? '+' : ''}${gap.toFixed(1)} pp`;
      elGap.className = 'wdc-m-val ' + (gap < -5 ? 'text-danger' : gap > 0 ? 'text-accent' : '');
    }

    const elForecast = document.getElementById('fullCardForecast');
    if (elForecast) {
      const fcVal = ward.forecast_2026 ? `${(ward.forecast_2026 * 100).toFixed(1)}%` : '28.5%';
      elForecast.textContent = fcVal;
    }

    const elForecastCI = document.getElementById('fullCardForecastCI');
    if (elForecastCI) {
      const fcLo = ward.forecast_lo ? `${(ward.forecast_lo * 100).toFixed(1)}%` : '23.0%';
      const fcHi = ward.forecast_hi ? `${(ward.forecast_hi * 100).toFixed(1)}%` : '34.0%';
      elForecastCI.textContent = `${fcLo} – ${fcHi}`;
    }

    // Populate Voting Districts Table
    const tbody = document.getElementById('fullVdsTbody');
    if (tbody) {
      const vds = ward.top_vds || [];
      if (vds.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 1.5rem; color: var(--color-text-subtle);">No voting district breakdown available for this ward.</td></tr>`;
      } else {
        tbody.innerHTML = vds.map(vd => `
          <tr>
            <td><strong>${vd.VotingDistrict}</strong></td>
            <td>${vd.station}</td>
            <td><span class="badge-mini badge-blue">${vd.station_type || 'Voting Station'}</span></td>
            <td>${(vd.registered || 0).toLocaleString()}</td>
            <td><strong>${((vd.turnout || 0) * 100).toFixed(1)}%</strong></td>
            <td>${vd.tent ? '<span class="badge-mini badge-red">Tent Station</span>' : '<span class="badge-mini badge-green">Permanent</span>'}</td>
          </tr>
        `).join('');
      }
    }
  }

  populateWardComparator() {
    const selA = document.getElementById('compWardA');
    const selB = document.getElementById('compWardB');
    if (!selA || !selB || !this.data) return;

    const wards = this.data.wards || [];
    const optionsHtml = wards.map(w => `
      <option value="${w.ward_id}">Ward ${w.ward_id} - ${w.metro} (${w.winner}, ${(w.turnout * 100).toFixed(1)}%)</option>
    `).join('');

    selA.innerHTML = optionsHtml;
    selB.innerHTML = optionsHtml;

    // Pick two contrasting default wards if available
    const highDep = wards.find(w => (w.risk_tier || '').toLowerCase().includes('high')) || wards[0];
    const lowDep = wards.find(w => (w.risk_tier || '').toLowerCase().includes('low') && w.ward_id !== highDep.ward_id) || wards[1];

    if (highDep) {
      this.compWardAId = highDep.ward_id;
      selA.value = highDep.ward_id;
    }
    if (lowDep) {
      this.compWardBId = lowDep.ward_id;
      selB.value = lowDep.ward_id;
    }

    this.updateWardComparator();
  }

  updateWardComparator() {
    const selA = document.getElementById('compWardA');
    const selB = document.getElementById('compWardB');
    const tbody = document.getElementById('compTableTbody');
    const headerA = document.getElementById('compHeaderA');
    const headerB = document.getElementById('compHeaderB');
    if (!tbody || !this.data) return;

    const idA = selA ? selA.value : this.compWardAId;
    const idB = selB ? selB.value : this.compWardBId;

    const wardA = this.data.wards.find(w => w.ward_id === idA) || this.data.wards[0];
    const wardB = this.data.wards.find(w => w.ward_id === idB) || this.data.wards[1];

    if (!wardA || !wardB) return;

    if (headerA) headerA.textContent = `Ward ${wardA.ward_id} (${wardA.metro})`;
    if (headerB) headerB.textContent = `Ward ${wardB.ward_id} (${wardB.metro})`;

    const turnoutDiff = ((wardA.turnout - wardB.turnout) * 100).toFixed(1);
    const depDiff = ((wardA.deprivation_score - wardB.deprivation_score) * 100).toFixed(1);
    const regDiff = ((wardA.registered || 0) - (wardB.registered || 0)).toLocaleString();

    tbody.innerHTML = `
      <tr>
        <td><strong>Metropolitan Municipality</strong></td>
        <td>${wardA.metro}</td>
        <td>${wardB.metro}</td>
        <td><span class="badge-mini">${wardA.metro === wardB.metro ? 'Same Metro' : 'Cross-Metro'}</span></td>
      </tr>
      <tr>
        <td><strong>Winning Party (2021 LGE)</strong></td>
        <td><span class="winner-badge ${wardA.winner === 'DA' ? 'party-da' : wardA.winner === 'ANC' ? 'party-anc' : wardA.winner === 'EFF' ? 'party-eff' : 'party-actionsa'}">${wardA.winner} Won</span></td>
        <td><span class="winner-badge ${wardB.winner === 'DA' ? 'party-da' : wardB.winner === 'ANC' ? 'party-anc' : wardB.winner === 'EFF' ? 'party-eff' : 'party-actionsa'}">${wardB.winner} Won</span></td>
        <td>${wardA.winner === wardB.winner ? 'Identical Winner' : '<span class="text-amber">Different Plurality</span>'}</td>
      </tr>
      <tr>
        <td><strong>2021 Turnout Rate</strong></td>
        <td><strong>${(wardA.turnout * 100).toFixed(1)}%</strong></td>
        <td><strong>${(wardB.turnout * 100).toFixed(1)}%</strong></td>
        <td><strong class="${turnoutDiff >= 0 ? 'text-accent' : 'text-danger'}">${turnoutDiff >= 0 ? '+' : ''}${turnoutDiff} pp variance</strong></td>
      </tr>
      <tr>
        <td><strong>2026 Forecast (90% CI)</strong></td>
        <td>${(wardA.forecast_2026 * 100).toFixed(1)}% <small style="color:var(--color-text-subtle);">(${(wardA.forecast_lo * 100).toFixed(1)}%–${(wardA.forecast_hi * 100).toFixed(1)}%)</small></td>
        <td>${(wardB.forecast_2026 * 100).toFixed(1)}% <small style="color:var(--color-text-subtle);">(${(wardB.forecast_lo * 100).toFixed(1)}%–${(wardB.forecast_hi * 100).toFixed(1)}%)</small></td>
        <td><span class="badge-mini badge-purple">Ridge Model</span></td>
      </tr>
      <tr>
        <td><strong>Deprivation Score (Index)</strong></td>
        <td>${wardA.deprivation_score.toFixed(3)}</td>
        <td>${wardB.deprivation_score.toFixed(3)}</td>
        <td><span class="${depDiff >= 0 ? 'text-danger' : 'text-accent'}">${depDiff >= 0 ? '+' : ''}${depDiff} pp relative stress</span></td>
      </tr>
      <tr>
        <td><strong>Risk & Vulnerability Tier</strong></td>
        <td><span class="badge-mini ${(wardA.risk_tier || '').toLowerCase().includes('high') ? 'badge-red' : 'badge-green'}">${wardA.risk_tier || 'Moderate'}</span></td>
        <td><span class="badge-mini ${(wardB.risk_tier || '').toLowerCase().includes('high') ? 'badge-red' : 'badge-green'}">${wardB.risk_tier || 'Moderate'}</span></td>
        <td>${(wardA.risk_tier || '') === (wardB.risk_tier || '') ? 'Parity' : '<span class="text-amber">Tier Divergence</span>'}</td>
      </tr>
      <tr>
        <td><strong>Margin of Victory</strong></td>
        <td>${wardA.margin.toFixed(2)}</td>
        <td>${wardB.margin.toFixed(2)}</td>
        <td>${Math.abs(wardA.margin - wardB.margin) < 0.1 ? 'Competitive parity' : `${Math.abs(wardA.margin - wardB.margin).toFixed(2)} margin gap`}</td>
      </tr>
      <tr>
        <td><strong>Effective Parties (ENP)</strong></td>
        <td>${wardA.enp.toFixed(2)}</td>
        <td>${wardB.enp.toFixed(2)}</td>
        <td>${wardA.enp > 3 ? '<span class="badge-mini badge-blue">High Fragmentation</span>' : 'Standard'}</td>
      </tr>
      <tr>
        <td><strong>Tent Voting Station Share</strong></td>
        <td>${((wardA.tent_share || 0) * 100).toFixed(1)}% (${(wardA.top_vds || []).filter(v => v.tent).length} tents)</td>
        <td>${((wardB.tent_share || 0) * 100).toFixed(1)}% (${(wardB.top_vds || []).filter(v => v.tent).length} tents)</td>
        <td>${(wardA.tent_share || 0) > (wardB.tent_share || 0) ? '<span class="badge-mini badge-red">Higher Infrastructure Deficit</span>' : '<span class="badge-mini badge-green">Lower Deficit</span>'}</td>
      </tr>
      <tr>
        <td><strong>Registered Voters</strong></td>
        <td>${(wardA.registered || 0).toLocaleString()}</td>
        <td>${(wardB.registered || 0).toLocaleString()}</td>
        <td>${regDiff} voter delta</td>
      </tr>
    `;
  }

  renderFullDeprivationChart() {
    const container = document.getElementById('fullDeprivationBarChart');
    if (!container || !this.data) return;

    const quartiles = this.data.analytics?.deprivation_quartiles || [];
    if (quartiles.length === 0) return;

    const svgWidth = 620;
    const svgHeight = 240;
    const paddingLeft = 45;
    const paddingBottom = 45;
    const chartWidth = svgWidth - paddingLeft - 20;
    const chartHeight = svgHeight - paddingBottom - 25;

    const groupWidth = chartWidth / quartiles.length;
    const barWidth = 42;
    const innerGap = 8;

    let barsHtml = '';
    const ticks = [0.2, 0.4, 0.6];
    let gridHtml = '';
    ticks.forEach(t => {
      const y = 25 + chartHeight * (1 - (t / 0.6));
      gridHtml += `
        <line x1="${paddingLeft}" y1="${y}" x2="${svgWidth - 20}" y2="${y}" stroke="rgba(255,255,255,0.07)" stroke-dasharray="3,3" />
        <text x="${paddingLeft - 8}" y="${y + 4}" fill="rgba(255,255,255,0.4)" font-size="10" text-anchor="end">${Math.round(t * 100)}%</text>
      `;
    });

    quartiles.forEach((q, i) => {
      const groupX = paddingLeft + i * groupWidth + (groupWidth - (barWidth * 2 + innerGap)) / 2;

      // General Turnout Bar
      const genH = (q.turnout / 0.6) * chartHeight;
      const genY = 25 + chartHeight - genH;

      // Youth Turnout Bar
      const youthH = (q.youth_turnout / 0.6) * chartHeight;
      const youthY = 25 + chartHeight - youthH;

      barsHtml += `
        <g class="chart-group">
          <!-- General Turnout Bar -->
          <rect x="${groupX}" y="${genY}" width="${barWidth}" height="${genH}" rx="4" fill="#10b981" fill-opacity="0.88">
            <title>${q.quartile}: ${(q.turnout * 100).toFixed(1)}% General Turnout</title>
          </rect>
          <text x="${groupX + barWidth / 2}" y="${genY - 6}" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">
            ${(q.turnout * 100).toFixed(1)}%
          </text>

          <!-- Youth Turnout Bar -->
          <rect x="${groupX + barWidth + innerGap}" y="${youthY}" width="${barWidth}" height="${youthH}" rx="4" fill="#8b5cf6" fill-opacity="0.88">
            <title>${q.quartile} Youth (18-29): ${(q.youth_turnout * 100).toFixed(1)}%</title>
          </rect>
          <text x="${groupX + barWidth + innerGap + barWidth / 2}" y="${youthY - 6}" fill="#a78bfa" font-size="11" font-weight="700" text-anchor="middle">
            ${(q.youth_turnout * 100).toFixed(1)}%
          </text>

          <!-- Quartile X Label -->
          <text x="${groupX + barWidth + innerGap / 2}" y="${svgHeight - 22}" fill="#ffffff" font-size="11" font-weight="600" text-anchor="middle">
            Q${i + 1}
          </text>
          <text x="${groupX + barWidth + innerGap / 2}" y="${svgHeight - 8}" fill="rgba(255,255,255,0.4)" font-size="9.5" text-anchor="middle">
            ${i === 0 ? 'Affluent' : i === 1 ? 'Moderate' : i === 2 ? 'Townships' : 'Informal Tents'}
          </text>
        </g>
      `;
    });

    container.innerHTML = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="full-barchart-svg" style="width:100%; height:100%; max-height:260px; overflow:visible;">
        ${gridHtml}
        ${barsHtml}
      </svg>
    `;
  }

  renderFullDonutChart(s1, s2, s3) {
    const svg = document.getElementById('fullSimDonutSvg');
    if (!svg) return;

    const total = (s1 + s2 + s3) || 1;
    const p1 = (s1 / total) * 100;
    const p2 = (s2 / total) * 100;
    const p3 = (s3 / total) * 100;

    const radius = 45;
    const circumference = 2 * Math.PI * radius; // ~282.7

    const offset1 = 0;
    const length1 = (p1 / 100) * circumference;

    const offset2 = -length1;
    const length2 = (p2 / 100) * circumference;

    const offset3 = -(length1 + length2);
    const length3 = (p3 / 100) * circumference;

    svg.innerHTML = `
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12" />
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#10b981" stroke-width="12"
              stroke-dasharray="${length1} ${circumference}" stroke-dashoffset="${offset1}" />
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#3b82f6" stroke-width="12"
              stroke-dasharray="${length2} ${circumference}" stroke-dashoffset="${offset2}" />
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#8b5cf6" stroke-width="12"
              stroke-dasharray="${length3} ${circumference}" stroke-dashoffset="${offset3}" />
    `;
  }

  syncSlidersFromFull(leverNum, val) {
    const num = parseInt(val, 10) || 0;
    const fullBubble = document.getElementById(`fullBubble${leverNum}`);
    if (fullBubble) fullBubble.textContent = `+${num}%`;

    const mobSlider = document.getElementById(`sliderFeature${leverNum}`);
    const mobBubble = document.getElementById(`valFeature${leverNum}`);
    if (mobSlider) mobSlider.value = num;
    if (mobBubble) mobBubble.textContent = `+${num}%`;

    this.runSimulation();
  }

  setSimulationModel(modelName) {
    this.simState.model = modelName;

    // Update active button state
    const fullBtns = document.querySelectorAll('.sms-buttons-row .btn-model');
    fullBtns.forEach(btn => {
      if (btn.getAttribute('data-model') === modelName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const label = document.getElementById('fullModelNameText');
    if (label) label.textContent = modelName;

    this.runSimulation();
    this.showToast(`Selected model: ${modelName}`);
  }

  initFullQuiz() {
    this.fullQuizIndex = 0;
    this.fullQuizAnswers = [];
    this.selectedFullQuizOption = undefined;
    this.renderFullQuizStep();
  }

  renderFullQuizStep() {
    const qBox = document.getElementById('fullQuizQuestionBox');
    const rCard = document.getElementById('fullQuizResultsCard');
    const pBar = document.getElementById('fullQuizProgressBar');
    const nextBtn = document.getElementById('btnFullNextQuiz');

    if (this.fullQuizIndex >= this.quizQuestions.length) {
      if (qBox) qBox.style.display = 'none';
      if (rCard) rCard.style.display = 'block';
      if (pBar) pBar.style.width = '100%';
      this.calculateFullArchetype();
      return;
    }

    if (qBox) qBox.style.display = 'block';
    if (rCard) rCard.style.display = 'none';

    const q = this.quizQuestions[this.fullQuizIndex];
    const pct = Math.round(((this.fullQuizIndex + 1) / this.quizQuestions.length) * 100);
    if (pBar) pBar.style.width = `${pct}%`;

    const tag = document.getElementById('fullQuizStepTag');
    if (tag) tag.textContent = `Question ${this.fullQuizIndex + 1} of ${this.quizQuestions.length}`;

    const title = document.getElementById('fullQuizQuestionTitle');
    if (title) title.textContent = q.question;

    const container = document.getElementById('fullQuizOptionsContainer');
    if (container) {
      container.innerHTML = q.options.map((opt, idx) => `
        <button type="button" class="q-opt-btn" onclick="window.CivicApp.selectFullQuizOption(${idx});">
          <span class="q-opt-bullet">${String.fromCharCode(65 + idx)}</span>
          <span class="q-opt-text">${opt.text}</span>
        </button>
      `).join('');
    }

    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = `<span>${this.fullQuizIndex === this.quizQuestions.length - 1 ? 'Calculate Civic Archetype' : 'Next Question &rarr;'}</span>`;
    }
  }

  selectFullQuizOption(idx) {
    this.selectedFullQuizOption = idx;
    const btns = document.querySelectorAll('#fullQuizOptionsContainer .q-opt-btn');
    btns.forEach((b, i) => {
      if (i === idx) b.classList.add('selected');
      else b.classList.remove('selected');
    });

    const nextBtn = document.getElementById('btnFullNextQuiz');
    if (nextBtn) nextBtn.disabled = false;
  }

  handleFullQuizNext() {
    if (this.selectedFullQuizOption === undefined) return;
    this.fullQuizAnswers.push(this.selectedFullQuizOption);
    this.fullQuizIndex++;
    this.selectedFullQuizOption = undefined;
    this.renderFullQuizStep();
  }

  resetFullQuiz() {
    this.fullQuizIndex = 0;
    this.fullQuizAnswers = [];
    this.selectedFullQuizOption = undefined;
    this.renderFullQuizStep();
    this.showToast('Quiz reset');
  }

  calculateFullArchetype() {
    const archetypes = [
      {
        title: "Public Infrastructure & Municipal Auditor",
        desc: "You prioritize basic service delivery, clean water, and municipal accountability. You are best suited for ward committee monitoring, municipal budget oversight, and CSIR civic data labs.",
        track: "Municipal Governance & Public Infrastructure"
      },
      {
        title: "Grassroots Voter Mobilizer & Community Organizer",
        desc: "You excel at energizing youth, organizing voter registration weekends, and combating voter disaffection in marginalized communities.",
        track: "Civic Education & Youth Mobilization"
      },
      {
        title: "Civic Tech Innovator & Data Analyst",
        desc: "You leverage spatial data, predictive algorithms, and mobile applications to make municipal governance transparent and accessible to citizens.",
        track: "Civic Tech & Open Governance Analytics"
      }
    ];

    const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    const elTitle = document.getElementById('fullArchetypeTitle');
    const elDesc = document.getElementById('fullArchetypeDesc');
    const elTrack = document.getElementById('fullArchetypeTrack');

    if (elTitle) elTitle.textContent = archetype.title;
    if (elDesc) elDesc.textContent = archetype.desc;
    if (elTrack) elTrack.innerHTML = `<strong>Recommended Mentorship:</strong> ${archetype.track}`;
  }

  /* --------------------------------------------------------------------------
     15. Guided Demo Presentation Walkthrough
     -------------------------------------------------------------------------- */
  toggleDemoMode(forceState) {
    if (forceState !== undefined) {
      this.isDemoActive = forceState;
    } else {
      this.isDemoActive = !this.isDemoActive;
    }

    const hud = document.getElementById('demoWalkthroughHud');
    const btn = document.getElementById('btnTourDemo');
    if (hud) {
      hud.style.display = this.isDemoActive ? 'block' : 'none';
    }
    if (btn) {
      btn.classList.toggle('active', this.isDemoActive);
    }

    if (this.isDemoActive) {
      this.setMode('fullapp');
      this.demoCurrentStep = 0;
      this.updateDemoStep();
      this.showToast("Guided Demo Walkthrough Active");
    } else {
      this.showToast("Demo Mode Closed");
    }
  }

  startDemoWalkthrough() {
    this.toggleDemoMode(true);
  }

  demoNextStep() {
    if (this.demoCurrentStep < this.demoSteps.length - 1) {
      this.demoCurrentStep++;
      this.updateDemoStep();
    } else {
      this.showToast("Demo Complete! Thank you for evaluating CivicPulse.");
      this.toggleDemoMode(false);
    }
  }

  demoPrevStep() {
    if (this.demoCurrentStep > 0) {
      this.demoCurrentStep--;
      this.updateDemoStep();
    }
  }

  updateDemoStep() {
    const stepData = this.demoSteps[this.demoCurrentStep];
    if (!stepData) return;

    // Switch to tab
    this.switchFullTab(stepData.tab);

    // Update HUD elements
    const elBadge = document.getElementById('demoStepBadge');
    const elTitle = document.getElementById('demoStepTitle');
    const elDesc = document.getElementById('demoStepDesc');
    const btnPrev = document.getElementById('btnDemoPrev');
    const btnNext = document.getElementById('btnDemoNext');

    if (elBadge) elBadge.textContent = stepData.badge;
    if (elTitle) elTitle.textContent = stepData.title;
    if (elDesc) elDesc.textContent = stepData.desc;

    if (btnPrev) btnPrev.disabled = (this.demoCurrentStep === 0);
    if (btnNext) {
      btnNext.innerHTML = (this.demoCurrentStep === this.demoSteps.length - 1)
        ? `<span>Finish Tour &check;</span>`
        : `<span>Next Step &rarr;</span>`;
    }
  }
}

// Instantiate and expose globally
window.CivicApp = new CivicPulseApp();
