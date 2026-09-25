/**
 * CivicPulse Gauteng — Application Logic & Interactive State Machine
 * DIRISA Student Datathon Challenge 2026 Qualification Submission Prototype
 */

class CivicPulseApp {
  constructor() {
    this.currentScreen = 1;
    this.totalScreens = 8;
    this.currentMode = 'fullapp'; // 'fullapp' | 'device' | 'board'
    this.currentFullTab = 'overview'; // 'overview' | 'map' | 'wards' | 'analytics' | 'simulator' | 'quiz' | 'purpose' | 'deployment'
    this.boardZoom = 1.0;
    this.theme = 'dark';
    
    // Core Data Store
    this.data = null;
    this.activeMetro = 'Tshwane';
    this.activeWardId = '79900059';
    this.activeAge = '18-29';
    this.activeRiskFilter = 'all';

    // Full App Filters & State
    this.selectedProvince = 'Gauteng';
    this.fullMetroFilter = 'all';
    this.fullRiskFilter = 'all';
    this.wardSearchQuery = '';
    this.compWardAId = '79900059';
    this.compWardBId = '79700001';
    this.provincesData = this.getProvincesData();

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

    // CivicPulse AI Chatbot State
    this.isChatOpen = false;
    this.isChatMinimized = false;
    this.chatHistory = [];

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
    this.populateMetroDropdownForProvince(this.selectedProvince);
    this.populateFullWardsDropdown();
    this.updateFullWardCard();
    this.populateWardComparator();
    this.renderFullDeprivationChart();
    this.initFullQuiz();
    this.initChatbot();

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

    // Synchronize Gauteng wards in provincesData
    if (this.provincesData && this.provincesData['Gauteng'] && this.data && this.data.wards) {
      this.provincesData['Gauteng'].wards = this.data.wards.map(w => ({
        ...w,
        province: 'Gauteng',
        locality: w.locality || (w.metro === 'Tshwane' ? `Tshwane Ward ${w.ward_num || w.ward_id.slice(-2)}` : w.metro === 'Johannesburg' ? `Joburg Ward ${w.ward_num || w.ward_id.slice(-2)}` : `Ekurhuleni Ward ${w.ward_num || w.ward_id.slice(-2)}`)
      }));
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
      this.switchFullTab('purpose');
      this.setMode('fullapp');
    });

    // Chatbot Event Listeners
    document.getElementById('civicChatLauncher')?.addEventListener('click', () => this.toggleChatbot());
    document.getElementById('btnHeaderChat')?.addEventListener('click', () => this.openChatbot());
    document.getElementById('btnSidebarChat')?.addEventListener('click', () => this.openChatbot());
    document.getElementById('btnChatClose')?.addEventListener('click', () => this.closeChatbot());
    document.getElementById('btnChatMinimize')?.addEventListener('click', () => this.toggleMinimizeChatbot());
    document.getElementById('btnChatReset')?.addEventListener('click', () => this.resetChat());

    // Chat Suggestion Chips
    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const prompt = e.currentTarget.getAttribute('data-prompt');
        if (prompt) this.handleQuickPrompt(prompt);
      });
    });

    // Close chat on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isChatOpen) {
        this.closeChatbot();
      }
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
    const stepper = document.getElementById('screenStepper');

    fullContainer?.classList.toggle('active', mode === 'fullapp');
    devContainer?.classList.toggle('active', mode === 'device');
    boardContainer?.classList.toggle('active', mode === 'board');

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
        p.setAttribute('fill', 'rgba(255, 255, 255, 0.22)');
      } else if (layer === 'youth') {
        p.setAttribute('fill', 'rgba(255, 255, 255, 0.14)');
      } else {
        // Deprivation default
        const m = p.getAttribute('data-metro');
        if (m === 'Tshwane') p.setAttribute('fill', 'rgba(255, 255, 255, 0.2)');
        else if (m === 'Johannesburg') p.setAttribute('fill', 'rgba(255, 255, 255, 0.14)');
        else p.setAttribute('fill', 'rgba(255, 255, 255, 0.08)');
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

      // High-contrast stepped grayscale from Q1 to Q4
      const colors = ['#ffffff', '#d4d4d8', '#a1a1aa', '#71717a'];
      const color = colors[i] || '#ffffff';

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
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#ffffff" stroke-width="12"
              stroke-dasharray="${length1} ${circumference}" stroke-dashoffset="${offset1}" />
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="12"
              stroke-dasharray="${length2} ${circumference}" stroke-dashoffset="${offset2}" />
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12"
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
    if (!dropdown) return;

    const q = (query || '').trim().toLowerCase();
    if (q.length < 2) {
      dropdown.classList.remove('show');
      dropdown.innerHTML = '';
      return;
    }

    const wards = this.getAllWards();
    const matches = wards.filter(w => {
      const wid = String(w.ward_id || '').toLowerCase();
      const wnum = String(w.ward_num || '').toLowerCase();
      const metro = String(w.metro || '').toLowerCase();
      const prov = String(w.province || '').toLowerCase();
      const loc = String(w.locality || '').toLowerCase();
      const winner = String(w.winner || '').toLowerCase();
      return wid.includes(q) || wnum === q || metro.includes(q) || prov.includes(q) || loc.includes(q) || winner.includes(q);
    }).slice(0, 8);

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="omni-no-results" style="padding:0.75rem 1rem; color:var(--text-muted); font-size:0.82rem;">No wards found matching "${query}"</div>`;
      dropdown.classList.add('show');
      return;
    }

    dropdown.innerHTML = matches.map(w => `
      <div class="omni-item" onclick="window.CivicApp.selectWardAndInspect('${w.ward_id}');">
        <div class="omni-left">
          <span class="omni-ward-id">Ward ${w.ward_id} (${w.province || 'GP'})</span>
          <span class="omni-metro">${w.metro}${w.locality ? ' · ' + w.locality : ''}</span>
        </div>
        <div class="omni-right">
          <span class="winner-badge party-${(w.winner || 'da').toLowerCase()}">${w.winner}</span>
          <span class="omni-turnout">${(w.turnout * 100).toFixed(1)}%</span>
        </div>
      </div>
    `).join('');

    dropdown.classList.add('show');
  }

  selectWardAndInspect(wardId) {
    const ward = this.getWardById(wardId);
    if (ward && ward.province && ward.province !== this.selectedProvince) {
      this.setProvince(ward.province);
    }
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

    const searchInput = document.getElementById('wardFilterSearch');
    if (searchInput) searchInput.value = '';

    this.showToast(`Inspecting Ward ${wardId} (${ward ? ward.metro : ''})`);
  }

  /* --------------------------------------------------------------------------
     Multi-Province Electoral Data Store & Explorer Methods
     -------------------------------------------------------------------------- */
  getProvincesData() {
    return {
      'Gauteng': {
        name: 'Gauteng',
        code: 'GP',
        capital: 'Johannesburg / Pretoria',
        description: 'Economic heartland · 5 Metros & Districts · High urban density',
        registered: 6241838,
        turnout: 0.4743,
        forecast: 0.458,
        forecast_lo: 0.412,
        forecast_hi: 0.504,
        tent_vds: 203,
        metros: ['City of Tshwane', 'City of Johannesburg', 'City of Ekurhuleni', 'Sedibeng', 'West Rand'],
        wards: [
          {
            ward_id: '79900059',
            province: 'Gauteng',
            metro: 'City of Tshwane',
            locality: 'Hammanskraal West / Temba',
            ward_num: 59,
            winner: 'DA',
            turnout: 0.294,
            margin: 0.34,
            enp: 3.15,
            ward_gap_pp: -17.2,
            risk_tier: 'High risk',
            forecast_2026: 0.285,
            forecast_lo: 0.230,
            forecast_hi: 0.340,
            deprivation_score: 0.82,
            registered: 18920,
            tent_share: 0.33,
            top_vds: [
              { VotingDistrict: 32910230, station: 'HAMMANSKRAAL COMMUNITY HALL', station_type: 'Community Hall', registered: 4120, turnout: 0.312, tent: 0 },
              { VotingDistrict: 32910331, station: 'TEMBA PRIMARY SCHOOL', station_type: 'School', registered: 3850, turnout: 0.298, tent: 0 },
              { VotingDistrict: 32910375, station: 'KANANA INFORMAL SETTLEMENT TENT', station_type: 'Canvas Tent', registered: 2640, turnout: 0.245, tent: 1 },
              { VotingDistrict: 32910408, station: 'ST PETER APOSTOLIC CHURCH', station_type: 'Church', registered: 3410, turnout: 0.320, tent: 0 }
            ]
          },
          {
            ward_id: '79800065',
            province: 'Gauteng',
            metro: 'City of Johannesburg',
            locality: 'Soweto / Meadowlands West',
            ward_num: 65,
            winner: 'ANC',
            turnout: 0.313,
            margin: 0.22,
            enp: 3.82,
            ward_gap_pp: -16.4,
            risk_tier: 'High risk',
            forecast_2026: 0.301,
            forecast_lo: 0.245,
            forecast_hi: 0.355,
            deprivation_score: 0.79,
            registered: 21450,
            tent_share: 0.25,
            top_vds: [
              { VotingDistrict: 32810115, station: 'MEADOWLANDS COMMUNITY HALL', station_type: 'Community Hall', registered: 4210, turnout: 0.325, tent: 0 },
              { VotingDistrict: 32810126, station: 'THABO SECONDARY SCHOOL', station_type: 'School', registered: 3890, turnout: 0.310, tent: 0 },
              { VotingDistrict: 32810137, station: 'NDOVELA OPEN GROUNDS TENT', station_type: 'Canvas Tent', registered: 2450, turnout: 0.278, tent: 1 }
            ]
          },
          {
            ward_id: '79700001',
            province: 'Gauteng',
            metro: 'City of Ekurhuleni',
            locality: 'Midstream / Olifantsfontein',
            ward_num: 1,
            winner: 'DA',
            turnout: 0.713,
            margin: 0.35,
            enp: 2.34,
            ward_gap_pp: 20.9,
            risk_tier: 'Low risk',
            forecast_2026: 0.699,
            forecast_lo: 0.647,
            forecast_hi: 0.751,
            deprivation_score: 0.18,
            registered: 16935,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 32910230, station: 'OLIFANTSFONTEIN COMMUNITY HALL', station_type: 'Community Hall', registered: 1982, turnout: 0.532, tent: 0 },
              { VotingDistrict: 32910331, station: 'MIDSTREAM COLLEGE', station_type: 'School', registered: 3720, turnout: 0.789, tent: 0 },
              { VotingDistrict: 32910375, station: 'HOSANNA KINGDOM CHURCH', station_type: 'Church', registered: 2410, turnout: 0.745, tent: 0 }
            ]
          }
        ]
      },
      'Western Cape': {
        name: 'Western Cape',
        code: 'WC',
        capital: 'Cape Town',
        description: 'Highest provincial turnout in 2021 · Dense metro vs rural agricultural fringe',
        registered: 3312450,
        turnout: 0.5732,
        forecast: 0.556,
        forecast_lo: 0.510,
        forecast_hi: 0.602,
        tent_vds: 38,
        metros: ['City of Cape Town', 'Stellenbosch', 'Drakenstein', 'George', 'Overstrand'],
        wards: [
          {
            ward_id: '19100095',
            province: 'Western Cape',
            metro: 'City of Cape Town',
            locality: 'Khayelitsha Site B / Nonqubela',
            ward_num: 95,
            winner: 'ANC',
            turnout: 0.382,
            margin: 0.28,
            enp: 2.85,
            ward_gap_pp: -19.1,
            risk_tier: 'High risk',
            forecast_2026: 0.365,
            forecast_lo: 0.310,
            forecast_hi: 0.420,
            deprivation_score: 0.74,
            registered: 19450,
            tent_share: 0.25,
            top_vds: [
              { VotingDistrict: 97100012, station: 'MATTHEW GONIWE HIGH SCHOOL', station_type: 'School', registered: 2840, turnout: 0.395, tent: 0 },
              { VotingDistrict: 97100023, station: 'SIVUYILE COMMUNITY COLLEGE', station_type: 'College', registered: 3120, turnout: 0.372, tent: 0 },
              { VotingDistrict: 97100034, station: 'KHAYELITSHA SPORTS GROUNDS TENT', station_type: 'Canvas Tent', registered: 2650, turnout: 0.341, tent: 1 },
              { VotingDistrict: 97100045, station: 'SITE B COMMUNITY CLINIC HALL', station_type: 'Clinic/Hall', registered: 3410, turnout: 0.412, tent: 0 }
            ]
          },
          {
            ward_id: '19100077',
            province: 'Western Cape',
            metro: 'City of Cape Town',
            locality: 'Mitchells Plain / Tafelsig',
            ward_num: 77,
            winner: 'DA',
            turnout: 0.445,
            margin: 0.22,
            enp: 3.42,
            ward_gap_pp: -12.8,
            risk_tier: 'Medium risk',
            forecast_2026: 0.431,
            forecast_lo: 0.380,
            forecast_hi: 0.482,
            deprivation_score: 0.58,
            registered: 21300,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 97110056, station: 'TAFELSIG COMMUNITY CENTRE', station_type: 'Centre', registered: 3890, turnout: 0.452, tent: 0 },
              { VotingDistrict: 97110067, station: 'YELLOWWOOD PRIMARY SCHOOL', station_type: 'School', registered: 3450, turnout: 0.438, tent: 0 },
              { VotingDistrict: 97110078, station: 'MITCHELLS PLAIN LIBRARY HALL', station_type: 'Library', registered: 4120, turnout: 0.461, tent: 0 }
            ]
          },
          {
            ward_id: '19100115',
            province: 'Western Cape',
            metro: 'City of Cape Town',
            locality: 'Sea Point / Camps Bay / Clifton',
            ward_num: 115,
            winner: 'DA',
            turnout: 0.684,
            margin: 0.62,
            enp: 1.84,
            ward_gap_pp: 11.1,
            risk_tier: 'Low risk',
            forecast_2026: 0.672,
            forecast_lo: 0.620,
            forecast_hi: 0.724,
            deprivation_score: 0.12,
            registered: 18920,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 97120011, station: 'SEA POINT CIVIC CENTRE', station_type: 'Civic Centre', registered: 4210, turnout: 0.702, tent: 0 },
              { VotingDistrict: 97120022, station: 'CAMPS BAY HIGH SCHOOL', station_type: 'School', registered: 3680, turnout: 0.675, tent: 0 },
              { VotingDistrict: 97120033, station: 'GREEN POINT PRIMARY SCHOOL', station_type: 'School', registered: 3950, turnout: 0.689, tent: 0 }
            ]
          },
          {
            ward_id: '19100057',
            province: 'Western Cape',
            metro: 'City of Cape Town',
            locality: 'Rondebosch / Rosebank',
            ward_num: 57,
            winner: 'DA',
            turnout: 0.712,
            margin: 0.58,
            enp: 2.14,
            ward_gap_pp: 13.9,
            risk_tier: 'Low risk',
            forecast_2026: 0.701,
            forecast_lo: 0.650,
            forecast_hi: 0.752,
            deprivation_score: 0.15,
            registered: 16840,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 97130010, station: 'RONDEBOSCH BOYS PREPARATORY', station_type: 'School', registered: 4100, turnout: 0.724, tent: 0 },
              { VotingDistrict: 97130021, station: 'ST THOMAS ANGLICAN CHURCH HALL', station_type: 'Church', registered: 3820, turnout: 0.698, tent: 0 }
            ]
          },
          {
            ward_id: '19100040',
            province: 'Western Cape',
            metro: 'City of Cape Town',
            locality: 'Gugulethu NY1 / Kanana',
            ward_num: 40,
            winner: 'ANC',
            turnout: 0.416,
            margin: 0.31,
            enp: 2.92,
            ward_gap_pp: -15.7,
            risk_tier: 'High risk',
            forecast_2026: 0.398,
            forecast_lo: 0.345,
            forecast_hi: 0.451,
            deprivation_score: 0.71,
            registered: 17980,
            tent_share: 0.20,
            top_vds: [
              { VotingDistrict: 97140015, station: 'GUGULETHU COMPREHENSIVE SCHOOL', station_type: 'School', registered: 3500, turnout: 0.428, tent: 0 },
              { VotingDistrict: 97140026, station: 'IKWEZI COMMUNITY HALL', station_type: 'Community Hall', registered: 3200, turnout: 0.405, tent: 0 },
              { VotingDistrict: 97140037, station: 'KANANA INFORMAL SETTLEMENT TENT', station_type: 'Canvas Tent', registered: 2100, turnout: 0.375, tent: 1 }
            ]
          },
          {
            ward_id: '10204005',
            province: 'Western Cape',
            metro: 'Stellenbosch',
            locality: 'Stellenbosch Central / Idas Valley',
            ward_num: 5,
            winner: 'DA',
            turnout: 0.621,
            margin: 0.45,
            enp: 2.38,
            ward_gap_pp: 4.8,
            risk_tier: 'Low risk',
            forecast_2026: 0.608,
            forecast_lo: 0.555,
            forecast_hi: 0.661,
            deprivation_score: 0.24,
            registered: 15400,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 97150012, station: 'STELLENBOSCH TOWN HALL', station_type: 'Town Hall', registered: 4500, turnout: 0.642, tent: 0 },
              { VotingDistrict: 97150023, station: 'IDAS VALLEY LIBRARY', station_type: 'Library', registered: 3600, turnout: 0.598, tent: 0 }
            ]
          },
          {
            ward_id: '10204012',
            province: 'Western Cape',
            metro: 'Stellenbosch',
            locality: 'Kayamandi Zone 14',
            ward_num: 12,
            winner: 'ANC',
            turnout: 0.398,
            margin: 0.34,
            enp: 2.74,
            ward_gap_pp: -17.5,
            risk_tier: 'High risk',
            forecast_2026: 0.381,
            forecast_lo: 0.330,
            forecast_hi: 0.432,
            deprivation_score: 0.79,
            registered: 14800,
            tent_share: 0.25,
            top_vds: [
              { VotingDistrict: 97160018, station: 'KAYAMANDI SECONDARY SCHOOL', station_type: 'School', registered: 3900, turnout: 0.412, tent: 0 },
              { VotingDistrict: 97160029, station: 'LEGACY CENTRE TEMPORARY TENT', station_type: 'Canvas Tent', registered: 2200, turnout: 0.354, tent: 1 }
            ]
          },
          {
            ward_id: '10203008',
            province: 'Western Cape',
            metro: 'Drakenstein',
            locality: 'Paarl East / Mbekweni',
            ward_num: 8,
            winner: 'ANC',
            turnout: 0.421,
            margin: 0.29,
            enp: 3.12,
            ward_gap_pp: -15.2,
            risk_tier: 'High risk',
            forecast_2026: 0.405,
            forecast_lo: 0.352,
            forecast_hi: 0.458,
            deprivation_score: 0.69,
            registered: 16100,
            tent_share: 0.15,
            top_vds: [
              { VotingDistrict: 97170014, station: 'MBEKWENI COMMUNITY HALL', station_type: 'Community Hall', registered: 4200, turnout: 0.431, tent: 0 },
              { VotingDistrict: 97170025, station: 'LANGABUYA PRIMARY SCHOOL', station_type: 'School', registered: 3800, turnout: 0.418, tent: 0 }
            ]
          },
          {
            ward_id: '10404018',
            province: 'Western Cape',
            metro: 'George',
            locality: 'George CBD / Blanco',
            ward_num: 18,
            winner: 'DA',
            turnout: 0.594,
            margin: 0.39,
            enp: 2.62,
            ward_gap_pp: 2.1,
            risk_tier: 'Low risk',
            forecast_2026: 0.582,
            forecast_lo: 0.530,
            forecast_hi: 0.634,
            deprivation_score: 0.32,
            registered: 17500,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 97180010, station: 'GEORGE CIVIC CENTRE', station_type: 'Civic Centre', registered: 4800, turnout: 0.612, tent: 0 },
              { VotingDistrict: 97180021, station: 'BLANCO COMMUNITY HALL', station_type: 'Community Hall', registered: 3900, turnout: 0.578, tent: 0 }
            ]
          }
        ]
      },
      'KwaZulu-Natal': {
        name: 'KwaZulu-Natal',
        code: 'KZN',
        capital: 'Pietermaritzburg',
        description: 'Deeply competitive tripartite arena (ANC, IFP, MKP, DA) · Severe rural topography and 142 tent stations',
        registered: 5742110,
        turnout: 0.5184,
        forecast: 0.492,
        forecast_lo: 0.445,
        forecast_hi: 0.539,
        tent_vds: 142,
        metros: ['eThekwini Metro', 'Msunduzi', 'uMhlathuze', 'Newcastle', 'Ray Nkonyeni'],
        wards: [
          {
            ward_id: '59500082',
            province: 'KwaZulu-Natal',
            metro: 'eThekwini Metro',
            locality: 'Umlazi Section D & E',
            ward_num: 82,
            winner: 'ANC',
            turnout: 0.412,
            margin: 0.18,
            enp: 3.65,
            ward_gap_pp: -10.6,
            risk_tier: 'High risk',
            forecast_2026: 0.388,
            forecast_lo: 0.332,
            forecast_hi: 0.444,
            deprivation_score: 0.76,
            registered: 22400,
            tent_share: 0.28,
            top_vds: [
              { VotingDistrict: 43370012, station: 'UMLAZI COMMERCIAL HIGH', station_type: 'School', registered: 3950, turnout: 0.428, tent: 0 },
              { VotingDistrict: 43370023, station: 'MENZI HIGH SCHOOL', station_type: 'School', registered: 3420, turnout: 0.405, tent: 0 },
              { VotingDistrict: 43370034, station: 'SECTION E OPEN GROUNDS TENT', station_type: 'Canvas Tent', registered: 2890, turnout: 0.368, tent: 1 },
              { VotingDistrict: 43370045, station: 'ZWELIBANZI HIGH SCHOOL', station_type: 'School', registered: 3710, turnout: 0.435, tent: 0 }
            ]
          },
          {
            ward_id: '59500045',
            province: 'KwaZulu-Natal',
            metro: 'eThekwini Metro',
            locality: 'KwaMashu A-Section',
            ward_num: 45,
            winner: 'IFP',
            turnout: 0.438,
            margin: 0.12,
            enp: 3.88,
            ward_gap_pp: -8.0,
            risk_tier: 'Medium risk',
            forecast_2026: 0.415,
            forecast_lo: 0.360,
            forecast_hi: 0.470,
            deprivation_score: 0.72,
            registered: 19800,
            tent_share: 0.20,
            top_vds: [
              { VotingDistrict: 43380018, station: 'KWAMASHU ROTARY STADIUM HALL', station_type: 'Stadium Hall', registered: 4120, turnout: 0.455, tent: 0 },
              { VotingDistrict: 43380029, station: 'JOHN LANGALIBALELE DUBE HIGH', station_type: 'School', registered: 3650, turnout: 0.432, tent: 0 },
              { VotingDistrict: 43380030, station: 'HOSTEL OPEN GROUNDS TENT', station_type: 'Canvas Tent', registered: 2450, turnout: 0.384, tent: 1 }
            ]
          },
          {
            ward_id: '59500028',
            province: 'KwaZulu-Natal',
            metro: 'eThekwini Metro',
            locality: 'Durban Central / South Beach',
            ward_num: 28,
            winner: 'DA',
            turnout: 0.485,
            margin: 0.24,
            enp: 3.45,
            ward_gap_pp: -3.3,
            risk_tier: 'Medium risk',
            forecast_2026: 0.468,
            forecast_lo: 0.415,
            forecast_hi: 0.521,
            deprivation_score: 0.42,
            registered: 24500,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 43390014, station: 'DURBAN CITY HALL', station_type: 'City Hall', registered: 5200, turnout: 0.495, tent: 0 },
              { VotingDistrict: 43390025, station: 'ADDINGTON PRIMARY SCHOOL', station_type: 'School', registered: 4300, turnout: 0.478, tent: 0 }
            ]
          },
          {
            ward_id: '59500070',
            province: 'KwaZulu-Natal',
            metro: 'eThekwini Metro',
            locality: 'Chatsworth Unit 3',
            ward_num: 70,
            winner: 'DA',
            turnout: 0.542,
            margin: 0.38,
            enp: 2.82,
            ward_gap_pp: 2.4,
            risk_tier: 'Low risk',
            forecast_2026: 0.528,
            forecast_lo: 0.475,
            forecast_hi: 0.581,
            deprivation_score: 0.38,
            registered: 18200,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 43400010, station: 'CHATSWORTH YOUTH CENTRE', station_type: 'Youth Centre', registered: 4100, turnout: 0.558, tent: 0 },
              { VotingDistrict: 43400021, station: 'WESLEY PRIMARY SCHOOL', station_type: 'School', registered: 3750, turnout: 0.532, tent: 0 }
            ]
          },
          {
            ward_id: '52205022',
            province: 'KwaZulu-Natal',
            metro: 'Msunduzi',
            locality: 'Edendale / Plessislaer',
            ward_num: 22,
            winner: 'ANC',
            turnout: 0.442,
            margin: 0.25,
            enp: 3.10,
            ward_gap_pp: -7.6,
            risk_tier: 'High risk',
            forecast_2026: 0.421,
            forecast_lo: 0.368,
            forecast_hi: 0.474,
            deprivation_score: 0.71,
            registered: 17600,
            tent_share: 0.20,
            top_vds: [
              { VotingDistrict: 43410015, station: 'EDENDALE LAY ECUMENICAL CENTRE', station_type: 'Ecumenical Centre', registered: 4100, turnout: 0.455, tent: 0 },
              { VotingDistrict: 43410026, station: 'SITHEMBILE PRIMARY SCHOOL', station_type: 'School', registered: 3600, turnout: 0.438, tent: 0 },
              { VotingDistrict: 43410037, station: 'VULINDLELA TEMPORARY TENT', station_type: 'Canvas Tent', registered: 2100, turnout: 0.395, tent: 1 }
            ]
          },
          {
            ward_id: '52802003',
            province: 'KwaZulu-Natal',
            metro: 'uMhlathuze',
            locality: 'Richards Bay / Empangeni Central',
            ward_num: 3,
            winner: 'IFP',
            turnout: 0.568,
            margin: 0.22,
            enp: 3.25,
            ward_gap_pp: 5.0,
            risk_tier: 'Low risk',
            forecast_2026: 0.551,
            forecast_lo: 0.498,
            forecast_hi: 0.604,
            deprivation_score: 0.34,
            registered: 19100,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 43420018, station: 'RICHARDS BAY CIVIC CENTRE', station_type: 'Civic Centre', registered: 5100, turnout: 0.585, tent: 0 },
              { VotingDistrict: 43420029, station: 'EMPANGENI HIGH SCHOOL', station_type: 'School', registered: 4300, turnout: 0.552, tent: 0 }
            ]
          }
        ]
      },
      'Eastern Cape': {
        name: 'Eastern Cape',
        code: 'EC',
        capital: 'Bhisho',
        description: 'Vast rural municipal footprints · Deep historical loyalty challenged by service delivery decay',
        registered: 3438900,
        turnout: 0.4862,
        forecast: 0.461,
        forecast_lo: 0.415,
        forecast_hi: 0.507,
        tent_vds: 118,
        metros: ['Nelson Mandela Bay', 'Buffalo City', 'King Sabata Dalindyebo', 'Enoch Mgijima'],
        wards: [
          {
            ward_id: '29300060',
            province: 'Eastern Cape',
            metro: 'Nelson Mandela Bay',
            locality: 'Gqeberha Central / Summerstrand',
            ward_num: 60,
            winner: 'DA',
            turnout: 0.612,
            margin: 0.48,
            enp: 2.45,
            ward_gap_pp: 12.6,
            risk_tier: 'Low risk',
            forecast_2026: 0.598,
            forecast_lo: 0.545,
            forecast_hi: 0.651,
            deprivation_score: 0.22,
            registered: 18500,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 23100012, station: 'SUMMERSTRAND COMMUNITY HALL', station_type: 'Hall', registered: 4500, turnout: 0.635, tent: 0 },
              { VotingDistrict: 23100023, station: 'PE BOWLING CLUB', station_type: 'Sports Club', registered: 3900, turnout: 0.598, tent: 0 }
            ]
          },
          {
            ward_id: '29300025',
            province: 'Eastern Cape',
            metro: 'Nelson Mandela Bay',
            locality: 'Motherwell NU2',
            ward_num: 25,
            winner: 'ANC',
            turnout: 0.428,
            margin: 0.32,
            enp: 3.18,
            ward_gap_pp: -5.8,
            risk_tier: 'High risk',
            forecast_2026: 0.405,
            forecast_lo: 0.352,
            forecast_hi: 0.458,
            deprivation_score: 0.75,
            registered: 19800,
            tent_share: 0.22,
            top_vds: [
              { VotingDistrict: 23110018, station: 'MOTHERWELL COMMUNITY CENTRE', station_type: 'Community Hall', registered: 4300, turnout: 0.442, tent: 0 },
              { VotingDistrict: 23110029, station: 'IKHWEZELIHLE PRIMARY SCHOOL', station_type: 'School', registered: 3800, turnout: 0.425, tent: 0 },
              { VotingDistrict: 23110030, station: 'NU2 OPEN GROUND TENT', station_type: 'Canvas Tent', registered: 2100, turnout: 0.385, tent: 1 }
            ]
          },
          {
            ward_id: '29200012',
            province: 'Eastern Cape',
            metro: 'Buffalo City',
            locality: 'Mdantsane Unit 1',
            ward_num: 12,
            winner: 'ANC',
            turnout: 0.435,
            margin: 0.35,
            enp: 2.88,
            ward_gap_pp: -5.1,
            risk_tier: 'High risk',
            forecast_2026: 0.412,
            forecast_lo: 0.360,
            forecast_hi: 0.464,
            deprivation_score: 0.72,
            registered: 17400,
            tent_share: 0.18,
            top_vds: [
              { VotingDistrict: 23120015, station: 'MDANTSANE INDOOR SPORTS CENTRE', station_type: 'Sports Centre', registered: 4100, turnout: 0.451, tent: 0 },
              { VotingDistrict: 23120026, station: 'LIZWE HIGH SCHOOL', station_type: 'School', registered: 3600, turnout: 0.429, tent: 0 }
            ]
          },
          {
            ward_id: '21507008',
            province: 'Eastern Cape',
            metro: 'King Sabata Dalindyebo',
            locality: 'Mthatha Central',
            ward_num: 8,
            winner: 'UDM',
            turnout: 0.462,
            margin: 0.15,
            enp: 3.42,
            ward_gap_pp: -2.4,
            risk_tier: 'Medium risk',
            forecast_2026: 0.441,
            forecast_lo: 0.388,
            forecast_hi: 0.494,
            deprivation_score: 0.65,
            registered: 16900,
            tent_share: 0.15,
            top_vds: [
              { VotingDistrict: 23130019, station: 'MTHATHA TOWN HALL', station_type: 'Town Hall', registered: 4600, turnout: 0.485, tent: 0 },
              { VotingDistrict: 23130020, station: 'ZIMBANE COMMUNITY CLINIC TENT', station_type: 'Canvas Tent', registered: 2200, turnout: 0.415, tent: 1 }
            ]
          }
        ]
      },
      'Free State': {
        name: 'Free State',
        code: 'FS',
        capital: 'Bloemfontein',
        description: 'Mangaung Metro challenges · Coal mining belt transition & agricultural towns',
        registered: 1450200,
        turnout: 0.4491,
        forecast: 0.432,
        forecast_lo: 0.388,
        forecast_hi: 0.476,
        tent_vds: 64,
        metros: ['Mangaung Metro', 'Matjhabeng', 'Maluti-a-Phofung', 'Metsimaholo'],
        wards: [
          {
            ward_id: '49400020',
            province: 'Free State',
            metro: 'Mangaung Metro',
            locality: 'Bloemfontein CBD / Westdene',
            ward_num: 20,
            winner: 'DA',
            turnout: 0.584,
            margin: 0.36,
            enp: 2.75,
            ward_gap_pp: 13.5,
            risk_tier: 'Low risk',
            forecast_2026: 0.571,
            forecast_lo: 0.518,
            forecast_hi: 0.624,
            deprivation_score: 0.28,
            registered: 16800,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 33100014, station: 'BLOEMFONTEIN CITY HALL', station_type: 'City Hall', registered: 4300, turnout: 0.605, tent: 0 },
              { VotingDistrict: 33100025, station: 'EUNICE HIGH SCHOOL', station_type: 'School', registered: 3900, turnout: 0.572, tent: 0 }
            ]
          },
          {
            ward_id: '49400004',
            province: 'Free State',
            metro: 'Mangaung Metro',
            locality: 'Botshabelo Section C',
            ward_num: 4,
            winner: 'ANC',
            turnout: 0.395,
            margin: 0.41,
            enp: 2.55,
            ward_gap_pp: -5.4,
            risk_tier: 'High risk',
            forecast_2026: 0.378,
            forecast_lo: 0.325,
            forecast_hi: 0.431,
            deprivation_score: 0.81,
            registered: 18200,
            tent_share: 0.25,
            top_vds: [
              { VotingDistrict: 33110010, station: 'BOTSHABELO COMMUNITY ARENA', station_type: 'Arena', registered: 4100, turnout: 0.412, tent: 0 },
              { VotingDistrict: 33110021, station: 'SECTION C PRIMARY SCHOOL', station_type: 'School', registered: 3600, turnout: 0.392, tent: 0 },
              { VotingDistrict: 33110032, station: 'EXT 5 PARK TENT', station_type: 'Canvas Tent', registered: 2100, turnout: 0.354, tent: 1 }
            ]
          },
          {
            ward_id: '41804015',
            province: 'Free State',
            metro: 'Matjhabeng',
            locality: 'Welkom / Thabong',
            ward_num: 15,
            winner: 'ANC',
            turnout: 0.418,
            margin: 0.28,
            enp: 3.10,
            ward_gap_pp: -3.1,
            risk_tier: 'High risk',
            forecast_2026: 0.401,
            forecast_lo: 0.348,
            forecast_hi: 0.454,
            deprivation_score: 0.77,
            registered: 16500,
            tent_share: 0.20,
            top_vds: [
              { VotingDistrict: 33120016, station: 'THABONG COMMUNITY CENTRE', station_type: 'Centre', registered: 3900, turnout: 0.432, tent: 0 },
              { VotingDistrict: 33120027, station: 'WELKOM HIGH SCHOOL', station_type: 'School', registered: 3500, turnout: 0.415, tent: 0 }
            ]
          }
        ]
      },
      'Limpopo': {
        name: 'Limpopo',
        code: 'LP',
        capital: 'Polokwane',
        description: 'Vast traditional authority wards · Significant EFF and ANC competition with rural water deficits',
        registered: 2795400,
        turnout: 0.4619,
        forecast: 0.445,
        forecast_lo: 0.401,
        forecast_hi: 0.489,
        tent_vds: 91,
        metros: ['Polokwane', 'Thabazimbi', 'Makhado', 'Greater Tzaneen', 'Mogalakwena'],
        wards: [
          {
            ward_id: '93503019',
            province: 'Limpopo',
            metro: 'Polokwane',
            locality: 'Polokwane CBD / Bendor',
            ward_num: 19,
            winner: 'DA',
            turnout: 0.582,
            margin: 0.34,
            enp: 2.82,
            ward_gap_pp: 12.0,
            risk_tier: 'Low risk',
            forecast_2026: 0.569,
            forecast_lo: 0.515,
            forecast_hi: 0.623,
            deprivation_score: 0.29,
            registered: 17200,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 76100012, station: 'POLOKWANE CIVIC CENTRE', station_type: 'Civic Centre', registered: 4500, turnout: 0.601, tent: 0 },
              { VotingDistrict: 76100023, station: 'BENDOR PRIMARY SCHOOL', station_type: 'School', registered: 3800, turnout: 0.574, tent: 0 }
            ]
          },
          {
            ward_id: '93503008',
            province: 'Limpopo',
            metro: 'Polokwane',
            locality: 'Seshego Zone 3',
            ward_num: 8,
            winner: 'EFF',
            turnout: 0.432,
            margin: 0.16,
            enp: 3.45,
            ward_gap_pp: -3.0,
            risk_tier: 'High risk',
            forecast_2026: 0.415,
            forecast_lo: 0.362,
            forecast_hi: 0.468,
            deprivation_score: 0.74,
            registered: 18900,
            tent_share: 0.18,
            top_vds: [
              { VotingDistrict: 76110018, station: 'SESHEGO COMMUNITY STADIUM', station_type: 'Stadium', registered: 4300, turnout: 0.448, tent: 0 },
              { VotingDistrict: 76110029, station: 'ZONE 3 LUTHERAN CHURCH HALL', station_type: 'Church', registered: 3700, turnout: 0.428, tent: 0 }
            ]
          },
          {
            ward_id: '93404005',
            province: 'Limpopo',
            metro: 'Makhado',
            locality: 'Louis Trichardt / Vhembe',
            ward_num: 5,
            winner: 'ANC',
            turnout: 0.472,
            margin: 0.42,
            enp: 2.35,
            ward_gap_pp: 1.0,
            risk_tier: 'Medium risk',
            forecast_2026: 0.455,
            forecast_lo: 0.402,
            forecast_hi: 0.508,
            deprivation_score: 0.68,
            registered: 16100,
            tent_share: 0.15,
            top_vds: [
              { VotingDistrict: 76120014, station: 'MAKHADO SHOW GROUNDS', station_type: 'Show Grounds', registered: 4100, turnout: 0.485, tent: 0 },
              { VotingDistrict: 76120025, station: 'DZATA SECONDARY SCHOOL', station_type: 'School', registered: 3400, turnout: 0.462, tent: 0 }
            ]
          }
        ]
      },
      'Mpumalanga': {
        name: 'Mpumalanga',
        code: 'MP',
        capital: 'Mbombela',
        description: 'Mining, coal energy grid & tourism economy · Spatial service backlogs in peri-urban townships',
        registered: 2025600,
        turnout: 0.4792,
        forecast: 0.454,
        forecast_lo: 0.410,
        forecast_hi: 0.498,
        tent_vds: 76,
        metros: ['City of Mbombela', 'Emalahleni', 'Govan Mbeki', 'Steve Tshwete'],
        wards: [
          {
            ward_id: '83205014',
            province: 'Mpumalanga',
            metro: 'City of Mbombela',
            locality: 'Mbombela Central / Riverside',
            ward_num: 14,
            winner: 'DA',
            turnout: 0.575,
            margin: 0.32,
            enp: 2.90,
            ward_gap_pp: 9.6,
            risk_tier: 'Low risk',
            forecast_2026: 0.561,
            forecast_lo: 0.508,
            forecast_hi: 0.614,
            deprivation_score: 0.31,
            registered: 17400,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 54100012, station: 'NELSPRUIT CIVIC CENTRE', station_type: 'Civic Centre', registered: 4600, turnout: 0.592, tent: 0 },
              { VotingDistrict: 54100023, station: 'BERGFLAM HIGH SCHOOL', station_type: 'School', registered: 3900, turnout: 0.565, tent: 0 }
            ]
          },
          {
            ward_id: '83205002',
            province: 'Mpumalanga',
            metro: 'City of Mbombela',
            locality: 'KaNyamazane Ward 2',
            ward_num: 2,
            winner: 'ANC',
            turnout: 0.438,
            margin: 0.38,
            enp: 2.65,
            ward_gap_pp: -4.1,
            risk_tier: 'High risk',
            forecast_2026: 0.421,
            forecast_lo: 0.368,
            forecast_hi: 0.474,
            deprivation_score: 0.75,
            registered: 18100,
            tent_share: 0.20,
            top_vds: [
              { VotingDistrict: 54110018, station: 'KANYAMAZANE COMMUNITY HALL', station_type: 'Hall', registered: 4200, turnout: 0.452, tent: 0 },
              { VotingDistrict: 54110029, station: 'THEMBEKA SECONDARY SCHOOL', station_type: 'School', registered: 3700, turnout: 0.431, tent: 0 }
            ]
          },
          {
            ward_id: '83102021',
            province: 'Mpumalanga',
            metro: 'Emalahleni',
            locality: 'Witbank Central / Modelpark',
            ward_num: 21,
            winner: 'DA',
            turnout: 0.521,
            margin: 0.26,
            enp: 3.20,
            ward_gap_pp: 4.2,
            risk_tier: 'Medium risk',
            forecast_2026: 0.505,
            forecast_lo: 0.452,
            forecast_hi: 0.558,
            deprivation_score: 0.42,
            registered: 16800,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 54120015, station: 'WITBANK TOWN HALL', station_type: 'Town Hall', registered: 4300, turnout: 0.535, tent: 0 },
              { VotingDistrict: 54120026, station: 'REYNO RIDGE PRIMARY SCHOOL', station_type: 'School', registered: 3800, turnout: 0.512, tent: 0 }
            ]
          }
        ]
      },
      'North West': {
        name: 'North West',
        code: 'NW',
        capital: 'Mahikeng',
        description: 'Platinum belt & agricultural heartland · Marikana legacy and intense union/party dynamics',
        registered: 1728900,
        turnout: 0.4312,
        forecast: 0.418,
        forecast_lo: 0.375,
        forecast_hi: 0.461,
        tent_vds: 88,
        metros: ['Rustenburg', 'Madibeng', 'JB Marks', 'City of Matlosana'],
        wards: [
          {
            ward_id: '63704016',
            province: 'North West',
            metro: 'Rustenburg',
            locality: 'Rustenburg CBD / Cashan',
            ward_num: 16,
            winner: 'DA',
            turnout: 0.548,
            margin: 0.30,
            enp: 3.15,
            ward_gap_pp: 11.7,
            risk_tier: 'Low risk',
            forecast_2026: 0.535,
            forecast_lo: 0.482,
            forecast_hi: 0.588,
            deprivation_score: 0.35,
            registered: 16900,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 62100014, station: 'RUSTENBURG CIVIC CENTRE', station_type: 'Civic Centre', registered: 4400, turnout: 0.565, tent: 0 },
              { VotingDistrict: 62100025, station: 'HOERSKOOL RUSTENBURG', station_type: 'School', registered: 3900, turnout: 0.538, tent: 0 }
            ]
          },
          {
            ward_id: '63704003',
            province: 'North West',
            metro: 'Rustenburg',
            locality: 'Marikana / Wonderkop',
            ward_num: 3,
            winner: 'EFF',
            turnout: 0.384,
            margin: 0.14,
            enp: 3.75,
            ward_gap_pp: -4.7,
            risk_tier: 'High risk',
            forecast_2026: 0.368,
            forecast_lo: 0.315,
            forecast_hi: 0.421,
            deprivation_score: 0.82,
            registered: 19400,
            tent_share: 0.33,
            top_vds: [
              { VotingDistrict: 62110010, station: 'MARIKANA COMMUNITY HALL', station_type: 'Hall', registered: 3900, turnout: 0.402, tent: 0 },
              { VotingDistrict: 62110021, station: 'WONDERKOP SECONDARY SCHOOL', station_type: 'School', registered: 3400, turnout: 0.385, tent: 0 },
              { VotingDistrict: 62110032, station: 'KOPPIE SETTLEMENT TENT', station_type: 'Canvas Tent', registered: 2400, turnout: 0.342, tent: 1 }
            ]
          },
          {
            ward_id: '64005008',
            province: 'North West',
            metro: 'JB Marks',
            locality: 'Potchefstroom Central / Baillie Park',
            ward_num: 8,
            winner: 'DA',
            turnout: 0.562,
            margin: 0.38,
            enp: 2.75,
            ward_gap_pp: 13.1,
            risk_tier: 'Low risk',
            forecast_2026: 0.548,
            forecast_lo: 0.495,
            forecast_hi: 0.601,
            deprivation_score: 0.28,
            registered: 15800,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 62120016, station: 'POTCHEFSTROOM TOWN HALL', station_type: 'Town Hall', registered: 4200, turnout: 0.582, tent: 0 },
              { VotingDistrict: 62120027, station: 'BAILLIE PARK PRIMARY SCHOOL', station_type: 'School', registered: 3600, turnout: 0.551, tent: 0 }
            ]
          }
        ]
      },
      'Northern Cape': {
        name: 'Northern Cape',
        code: 'NC',
        capital: 'Kimberley',
        description: 'Largest landmass, lowest population density · Vast inter-station distances and solar/mining clusters',
        registered: 654200,
        turnout: 0.5341,
        forecast: 0.511,
        forecast_lo: 0.468,
        forecast_hi: 0.554,
        tent_vds: 22,
        metros: ['Sol Plaatje', 'Dawid Kruiper', 'Ga-Segonyana', 'Nama Khoi'],
        wards: [
          {
            ward_id: '30901001',
            province: 'Northern Cape',
            metro: 'Sol Plaatje',
            locality: 'Kimberley CBD / Belgravia',
            ward_num: 1,
            winner: 'DA',
            turnout: 0.589,
            margin: 0.35,
            enp: 2.78,
            ward_gap_pp: 5.5,
            risk_tier: 'Low risk',
            forecast_2026: 0.575,
            forecast_lo: 0.522,
            forecast_hi: 0.628,
            deprivation_score: 0.30,
            registered: 14200,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 12100010, station: 'KIMBERLEY CITY HALL', station_type: 'City Hall', registered: 4100, turnout: 0.612, tent: 0 },
              { VotingDistrict: 12100021, station: 'BOYS HIGH SCHOOL KIMBERLEY', station_type: 'School', registered: 3600, turnout: 0.578, tent: 0 }
            ]
          },
          {
            ward_id: '30901015',
            province: 'Northern Cape',
            metro: 'Sol Plaatje',
            locality: 'Galeshewe Zone 4',
            ward_num: 15,
            winner: 'ANC',
            turnout: 0.485,
            margin: 0.28,
            enp: 3.12,
            ward_gap_pp: -4.9,
            risk_tier: 'Medium risk',
            forecast_2026: 0.468,
            forecast_lo: 0.415,
            forecast_hi: 0.521,
            deprivation_score: 0.68,
            registered: 15800,
            tent_share: 0.12,
            top_vds: [
              { VotingDistrict: 12110016, station: 'GALESHEWE STADIUM HALL', station_type: 'Stadium Hall', registered: 4100, turnout: 0.505, tent: 0 },
              { VotingDistrict: 12110027, station: 'TLOTLANG PRIMARY SCHOOL', station_type: 'School', registered: 3700, turnout: 0.478, tent: 0 }
            ]
          },
          {
            ward_id: '30801003',
            province: 'Northern Cape',
            metro: 'Dawid Kruiper',
            locality: 'Upington CBD / Oosterville',
            ward_num: 3,
            winner: 'DA',
            turnout: 0.572,
            margin: 0.32,
            enp: 2.85,
            ward_gap_pp: 3.8,
            risk_tier: 'Low risk',
            forecast_2026: 0.558,
            forecast_lo: 0.505,
            forecast_hi: 0.611,
            deprivation_score: 0.36,
            registered: 13900,
            tent_share: 0.0,
            top_vds: [
              { VotingDistrict: 12120012, station: 'UPINGTON CIVIC CENTRE', station_type: 'Civic Centre', registered: 4300, turnout: 0.591, tent: 0 },
              { VotingDistrict: 12120023, station: 'HOERSKOOL DUINEVELD', station_type: 'School', registered: 3500, turnout: 0.562, tent: 0 }
            ]
          }
        ]
      }
    };
  }

  getWardById(wardId) {
    if (!wardId) return null;
    const currProvWards = (this.provincesData[this.selectedProvince] || {}).wards || [];
    let ward = currProvWards.find(w => String(w.ward_id) === String(wardId));
    if (ward) return ward;

    for (const p of Object.values(this.provincesData)) {
      ward = (p.wards || []).find(w => String(w.ward_id) === String(wardId));
      if (ward) return ward;
    }
    if (this.data && this.data.wards) {
      return this.data.wards.find(w => String(w.ward_id) === String(wardId));
    }
    return null;
  }

  getAllWards() {
    const all = [];
    for (const prov of Object.values(this.provincesData)) {
      if (prov.wards) all.push(...prov.wards);
    }
    return all;
  }

  setProvince(provName) {
    if (!this.provincesData[provName]) return;
    this.selectedProvince = provName;

    // 1. Update quick pill active state
    const pills = document.querySelectorAll('.prov-pill');
    pills.forEach(p => {
      if (p.getAttribute('data-province') === provName) {
        p.classList.add('active');
        p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        p.classList.remove('active');
      }
    });

    // 2. Update Province select dropdown if out of sync
    const selProv = document.getElementById('fullSelectProvince');
    if (selProv && selProv.value !== provName) {
      selProv.value = provName;
    }

    // 3. Update Header & Banner
    const wehTag = document.getElementById('wehProvTag');
    if (wehTag) wehTag.textContent = `${provName} Active`;

    const provData = this.provincesData[provName];
    if (provData) {
      const elCode = document.getElementById('psbProvCode');
      if (elCode) elCode.textContent = provData.code;

      const elName = document.getElementById('psbProvName');
      if (elName) elName.textContent = `${provData.name} Province`;

      const elSub = document.getElementById('psbProvSub');
      if (elSub) elSub.textContent = `Capital: ${provData.capital} · ${provData.description}`;

      const elReg = document.getElementById('psbRegistered');
      if (elReg) elReg.textContent = (provData.registered || 0).toLocaleString();

      const elTurnout = document.getElementById('psbHistoricalTurnout');
      if (elTurnout) elTurnout.textContent = `${((provData.turnout || 0) * 100).toFixed(1)}%`;

      const elFc = document.getElementById('psbForecastTurnout');
      if (elFc) elFc.textContent = `${((provData.forecast || 0) * 100).toFixed(1)}%`;

      const elCi = document.getElementById('psbForecastCI');
      if (elCi) elCi.textContent = `90% CI: ${((provData.forecast_lo || 0) * 100).toFixed(1)}%–${((provData.forecast_hi || 0) * 100).toFixed(1)}%`;

      const elTents = document.getElementById('psbTentCount');
      if (elTents) elTents.textContent = `${provData.tent_vds || 0} Tents`;
    }

    // 4. Update Municipality/Metro Dropdown
    this.populateMetroDropdownForProvince(provName);

    // 5. Populate Wards Dropdown
    this.populateFullWardsDropdown();

    // 6. Refresh active ward card
    this.updateFullWardCard();

    // 7. Update comparator options
    this.populateWardComparator();

    this.showToast(`Switched to ${provName} (${provData.wards ? provData.wards.length : 0} wards loaded)`);
  }

  populateMetroDropdownForProvince(provName) {
    const selMetro = document.getElementById('fullSelectMetro');
    if (!selMetro) return;
    const prov = this.provincesData[provName];
    if (!prov) return;

    let options = `<option value="all" selected>All Municipalities & Metros (${prov.wards ? prov.wards.length : 0} Wards)</option>`;
    if (prov.metros && prov.metros.length > 0) {
      prov.metros.forEach(m => {
        const count = (prov.wards || []).filter(w => w.metro === m || String(w.metro).includes(m)).length;
        options += `<option value="${m}">${m} ${count > 0 ? `(${count} Wards)` : ''}</option>`;
      });
    }
    selMetro.innerHTML = options;
    this.fullMetroFilter = 'all';
  }

  populateFullWardsDropdown() {
    const selWard = document.getElementById('fullSelectWard');
    const badge = document.getElementById('fullWardCounterBadge');
    if (!selWard) return;

    const prov = this.provincesData[this.selectedProvince] || this.provincesData['Gauteng'];
    let wards = (prov && prov.wards) ? prov.wards : [];

    // Filter by Metro
    if (this.fullMetroFilter && this.fullMetroFilter !== 'all') {
      wards = wards.filter(w => w.metro === this.fullMetroFilter || String(w.metro).includes(this.fullMetroFilter));
    }

    // Filter by Risk
    if (this.fullRiskFilter && this.fullRiskFilter !== 'all') {
      wards = wards.filter(w => {
        const r = (w.risk_tier || '').toLowerCase();
        if (this.fullRiskFilter === 'High risk' || this.fullRiskFilter === 'high') return r.includes('high');
        if (this.fullRiskFilter === 'Medium risk' || this.fullRiskFilter === 'med') return r.includes('med') || r.includes('moderate');
        if (this.fullRiskFilter === 'Low risk' || this.fullRiskFilter === 'low') return r.includes('low');
        return true;
      });
    }

    // Filter by live search text
    if (this.wardSearchQuery && this.wardSearchQuery.length > 0) {
      const q = this.wardSearchQuery;
      wards = wards.filter(w => {
        const wid = String(w.ward_id || '').toLowerCase();
        const wnum = String(w.ward_num || '').toLowerCase();
        const metro = String(w.metro || '').toLowerCase();
        const loc = String(w.locality || '').toLowerCase();
        const winner = String(w.winner || '').toLowerCase();
        const vds = (w.top_vds || []).map(v => String(v.station || '').toLowerCase()).join(' ');
        return wid.includes(q) || wnum === q || metro.includes(q) || loc.includes(q) || winner.includes(q) || vds.includes(q);
      });
    }

    if (badge) {
      badge.textContent = `${wards.length} Wards Listed`;
    }

    if (wards.length === 0) {
      selWard.innerHTML = `<option value="">No matching wards found</option>`;
      return;
    }

    selWard.innerHTML = wards.map(w => {
      const locStr = w.locality ? ` - ${w.locality}` : '';
      return `<option value="${w.ward_id}">Ward ${w.ward_id} (${w.metro}${locStr} · ${w.winner}, ${(w.turnout * 100).toFixed(1)}%)</option>`;
    }).join('');

    const exists = wards.some(w => String(w.ward_id) === String(this.selectedWardId));
    if (exists) {
      selWard.value = this.selectedWardId;
    } else if (wards.length > 0) {
      this.selectedWardId = wards[0].ward_id;
      this.activeWardId = wards[0].ward_id;
      selWard.value = this.selectedWardId;
    }

    this.updateFullWardCard();
  }

  onFullMetroDropdown(metro) {
    this.fullMetroFilter = metro;
    this.populateFullWardsDropdown();
  }

  onFullRiskDropdown(risk) {
    this.fullRiskFilter = risk;
    this.populateFullWardsDropdown();
  }

  onWardSearchInput(query) {
    this.wardSearchQuery = (query || '').trim().toLowerCase();
    const clearBtn = document.getElementById('wfcClearSearch');
    if (clearBtn) {
      clearBtn.style.display = this.wardSearchQuery.length > 0 ? 'block' : 'none';
    }
    this.populateFullWardsDropdown();
  }

  clearWardSearch() {
    const input = document.getElementById('wardFilterSearch');
    if (input) input.value = '';
    this.onWardSearchInput('');
  }

  resetWardFilters() {
    this.fullMetroFilter = 'all';
    this.fullRiskFilter = 'all';
    this.wardSearchQuery = '';

    const selMetro = document.getElementById('fullSelectMetro');
    if (selMetro) selMetro.value = 'all';

    const selRisk = document.getElementById('fullSelectRisk');
    if (selRisk) selRisk.value = 'all';

    const searchInput = document.getElementById('wardFilterSearch');
    if (searchInput) searchInput.value = '';

    const clearBtn = document.getElementById('wfcClearSearch');
    if (clearBtn) clearBtn.style.display = 'none';

    this.populateFullWardsDropdown();
    this.showToast('Ward filters reset to default');
  }

  onFullWardDropdown(wardId) {
    this.selectedWardId = wardId;
    this.activeWardId = wardId;
    this.updateFullWardCard();
    this.updateWardCard();
  }

  updateFullWardCard() {
    const ward = this.getWardById(this.selectedWardId);
    if (!ward) return;

    const elWardId = document.getElementById('fullCardWardId');
    if (elWardId) elWardId.textContent = `Ward ${ward.ward_id}`;

    const elMetro = document.getElementById('fullCardWardMetro');
    if (elMetro) elMetro.textContent = ward.metro.startsWith('City of') || ward.metro.includes('Metro') ? ward.metro : `${ward.metro} Municipality`;

    const elLocality = document.getElementById('fullCardWardLocality');
    if (elLocality) elLocality.textContent = ward.locality || `${ward.province || this.selectedProvince} · Ward ${ward.ward_num || ward.ward_id.slice(-2)}`;

    const elBadge = document.getElementById('fullCardWinnerBadge');
    if (elBadge) {
      elBadge.textContent = `${ward.winner} Won`;
      elBadge.className = 'winner-badge';
      const w = (ward.winner || '').toUpperCase();
      if (w === 'DA') elBadge.classList.add('party-da');
      else if (w === 'ANC') elBadge.classList.add('party-anc');
      else if (w === 'EFF') elBadge.classList.add('party-eff');
      else if (w === 'IFP') elBadge.classList.add('party-ifp');
      else if (w === 'ACTIONSA') elBadge.classList.add('party-actionsa');
      else if (w === 'PA') elBadge.classList.add('party-pa');
      else if (w === 'MK' || w === 'MKP') elBadge.classList.add('party-mkp');
      else if (w === 'VF PLUS' || w === 'VF+') elBadge.classList.add('party-vfplus');
      else elBadge.classList.add('party-da');
    }

    const elRisk = document.getElementById('fullCardRiskBadge');
    if (elRisk) {
      elRisk.textContent = ward.risk_tier || 'Moderate';
      const r = (ward.risk_tier || '').toLowerCase();
      elRisk.className = 'badge-mini ' + (r.includes('high') ? 'badge-red' : r.includes('low') ? 'badge-green' : 'badge-amber');
    }

    const provData = this.provincesData[ward.province || this.selectedProvince] || this.provincesData['Gauteng'];
    const provMeanTurnout = provData.turnout || 0.474;

    const elTurnout = document.getElementById('fullCardTurnout');
    if (elTurnout) elTurnout.textContent = `${(ward.turnout * 100).toFixed(1)}%`;

    const elTurnoutSub = document.getElementById('fullCardTurnoutSub');
    if (elTurnoutSub) elTurnoutSub.textContent = `${provData.name} Avg: ${(provMeanTurnout * 100).toFixed(1)}%`;

    const elMargin = document.getElementById('fullCardMargin');
    if (elMargin) elMargin.textContent = (ward.margin || 0.25).toFixed(2);

    const elENP = document.getElementById('fullCardENP');
    if (elENP) elENP.textContent = (ward.enp || 2.8).toFixed(2);

    const elGap = document.getElementById('fullCardGap');
    const elGapSub = document.getElementById('fullCardGapSub');
    if (elGap) {
      const gap = ward.ward_gap_pp !== undefined ? ward.ward_gap_pp : ((ward.turnout - provMeanTurnout) * 100);
      elGap.textContent = `${gap >= 0 ? '+' : ''}${gap.toFixed(1)} pp`;
      elGap.className = 'wdc-m-val ' + (gap < -5 ? 'text-danger' : gap > 0 ? 'text-accent' : '');
      if (elGapSub) {
        elGapSub.textContent = gap < 0 ? 'Deprivation Participation Deficit' : 'Above Electoral Average';
      }
    }

    const elForecast = document.getElementById('fullCardForecast');
    if (elForecast) {
      const fcVal = ward.forecast_2026 ? `${(ward.forecast_2026 * 100).toFixed(1)}%` : `${((ward.turnout - 0.015) * 100).toFixed(1)}%`;
      elForecast.textContent = fcVal;
    }

    const elForecastCI = document.getElementById('fullCardForecastCI');
    if (elForecastCI) {
      const fcLo = ward.forecast_lo ? `${(ward.forecast_lo * 100).toFixed(1)}%` : `${Math.max(15, (ward.turnout - 0.06) * 100).toFixed(1)}%`;
      const fcHi = ward.forecast_hi ? `${(ward.forecast_hi * 100).toFixed(1)}%` : `${Math.min(95, (ward.turnout + 0.05) * 100).toFixed(1)}%`;
      elForecastCI.textContent = `${fcLo} – ${fcHi}`;
    }

    // Populate Voting Districts Table
    const tbody = document.getElementById('fullVdsTbody');
    const elVdsCount = document.getElementById('fullCardVdsCount');
    const vds = ward.top_vds || [];

    if (elVdsCount) {
      elVdsCount.textContent = `${vds.length} Voting Districts Audited`;
    }

    if (tbody) {
      if (vds.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 1.5rem; color: var(--text-muted);">No voting district breakdown available for this ward.</td></tr>`;
      } else {
        tbody.innerHTML = vds.map(vd => `
          <tr>
            <td><strong>${vd.VotingDistrict}</strong></td>
            <td>${vd.station}</td>
            <td><span class="badge-mini badge-blue">${vd.station_type || 'Voting Station'}</span></td>
            <td>${(vd.registered || 0).toLocaleString()}</td>
            <td><strong>${((vd.turnout || 0) * 100).toFixed(1)}%</strong></td>
            <td>${vd.tent ? '<span class="badge-mini badge-red">Canvas Tent</span>' : '<span class="badge-mini badge-green">Permanent</span>'}</td>
          </tr>
        `).join('');
      }
    }
  }

  populateWardComparator() {
    const selA = document.getElementById('compWardA');
    const selB = document.getElementById('compWardB');
    if (!selA || !selB) return;

    // Get all wards across provinces
    const allWards = this.getAllWards();
    if (allWards.length === 0) return;

    const optionsHtml = allWards.map(w => `
      <option value="${w.ward_id}">Ward ${w.ward_id} - ${w.province || 'GP'} (${w.metro}, ${w.winner}, ${(w.turnout * 100).toFixed(1)}%)</option>
    `).join('');

    selA.innerHTML = optionsHtml;
    selB.innerHTML = optionsHtml;

    if (this.compWardAId && allWards.some(w => String(w.ward_id) === String(this.compWardAId))) {
      selA.value = this.compWardAId;
    } else {
      selA.value = allWards[0].ward_id;
      this.compWardAId = allWards[0].ward_id;
    }

    if (this.compWardBId && allWards.some(w => String(w.ward_id) === String(this.compWardBId))) {
      selB.value = this.compWardBId;
    } else if (allWards.length > 1) {
      selB.value = allWards[1].ward_id;
      this.compWardBId = allWards[1].ward_id;
    }

    this.updateWardComparator();
  }

  setComparatorPreset(presetId) {
    const allWards = this.getAllWards();
    let idA = null;
    let idB = null;

    if (presetId === 'high-low') {
      const high = allWards.find(w => (w.risk_tier || '').toLowerCase().includes('high')) || allWards[0];
      const low = allWards.find(w => (w.risk_tier || '').toLowerCase().includes('low') && w.ward_id !== high.ward_id) || allWards[1];
      idA = high.ward_id;
      idB = low.ward_id;
    } else if (presetId === 'cross-prov') {
      const gp = allWards.find(w => (w.province || '').includes('Gauteng')) || allWards[0];
      const wc = allWards.find(w => (w.province || '').includes('Western Cape')) || allWards[1];
      idA = gp ? gp.ward_id : allWards[0].ward_id;
      idB = wc ? wc.ward_id : allWards[1].ward_id;
    } else if (presetId === 'soweto-umlazi') {
      const jhb = allWards.find(w => String(w.ward_id) === '79800065' || (w.metro || '').includes('Johannesburg')) || allWards[0];
      const uml = allWards.find(w => String(w.ward_id) === '59500082' || (w.locality || '').includes('Umlazi')) || allWards[1];
      idA = jhb ? jhb.ward_id : allWards[0].ward_id;
      idB = uml ? uml.ward_id : allWards[1].ward_id;
    } else if (presetId === 'tent-deficit') {
      const tent = allWards.find(w => (w.tent_share || 0) > 0.1) || allWards[0];
      const perm = allWards.find(w => (w.tent_share || 0) === 0 && w.ward_id !== tent.ward_id) || allWards[1];
      idA = tent.ward_id;
      idB = perm.ward_id;
    }

    if (idA && idB) {
      this.compWardAId = idA;
      this.compWardBId = idB;
      const selA = document.getElementById('compWardA');
      const selB = document.getElementById('compWardB');
      if (selA) selA.value = idA;
      if (selB) selB.value = idB;
      this.updateWardComparator();
      this.showToast(`Loaded comparator preset: ${presetId}`);
    }
  }

  updateWardComparator() {
    const selA = document.getElementById('compWardA');
    const selB = document.getElementById('compWardB');
    const tbody = document.getElementById('compTableTbody');
    const headerA = document.getElementById('compHeaderA');
    const headerB = document.getElementById('compHeaderB');
    if (!tbody) return;

    const idA = selA ? selA.value : this.compWardAId;
    const idB = selB ? selB.value : this.compWardBId;

    const wardA = this.getWardById(idA) || this.getAllWards()[0];
    const wardB = this.getWardById(idB) || this.getAllWards()[1];

    if (!wardA || !wardB) return;

    if (headerA) headerA.textContent = `Ward ${wardA.ward_id} (${wardA.province || 'GP'} - ${wardA.metro})`;
    if (headerB) headerB.textContent = `Ward ${wardB.ward_id} (${wardB.province || 'GP'} - ${wardB.metro})`;

    const turnoutDiff = ((wardA.turnout - wardB.turnout) * 100).toFixed(1);
    const depDiff = (((wardA.deprivation_score || 0.5) - (wardB.deprivation_score || 0.5)) * 100).toFixed(1);
    const regDiff = ((wardA.registered || 0) - (wardB.registered || 0)).toLocaleString();

    tbody.innerHTML = `
      <tr>
        <td><strong>Province & Region</strong></td>
        <td><span class="badge-mini badge-blue">${wardA.province || 'Gauteng'}</span></td>
        <td><span class="badge-mini badge-blue">${wardB.province || 'Gauteng'}</span></td>
        <td>${(wardA.province || 'Gauteng') === (wardB.province || 'Gauteng') ? 'Intra-Provincial' : '<span class="badge-mini badge-purple">Cross-Provincial Benchmark</span>'}</td>
      </tr>
      <tr>
        <td><strong>Metropolitan Municipality</strong></td>
        <td>${wardA.metro}</td>
        <td>${wardB.metro}</td>
        <td><span class="badge-mini">${wardA.metro === wardB.metro ? 'Same Metro' : 'Different Municipality'}</span></td>
      </tr>
      <tr>
        <td><strong>Winning Party (2021 LGE)</strong></td>
        <td><span class="winner-badge party-${(wardA.winner || 'da').toLowerCase()}">${wardA.winner} Won</span></td>
        <td><span class="winner-badge party-${(wardB.winner || 'da').toLowerCase()}">${wardB.winner} Won</span></td>
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
        <td>${((wardA.forecast_2026 || (wardA.turnout - 0.015)) * 100).toFixed(1)}% <small style="color:var(--text-muted);">(${((wardA.forecast_lo || 0.23) * 100).toFixed(1)}%–${((wardA.forecast_hi || 0.34) * 100).toFixed(1)}%)</small></td>
        <td>${((wardB.forecast_2026 || (wardB.turnout - 0.015)) * 100).toFixed(1)}% <small style="color:var(--text-muted);">(${((wardB.forecast_lo || 0.23) * 100).toFixed(1)}%–${((wardB.forecast_hi || 0.34) * 100).toFixed(1)}%)</small></td>
        <td><span class="badge-mini badge-purple">Ridge Model</span></td>
      </tr>
      <tr>
        <td><strong>Deprivation Score (Index)</strong></td>
        <td>${(wardA.deprivation_score || 0.5).toFixed(3)}</td>
        <td>${(wardB.deprivation_score || 0.5).toFixed(3)}</td>
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
        <td>${(wardA.margin || 0.25).toFixed(2)}</td>
        <td>${(wardB.margin || 0.25).toFixed(2)}</td>
        <td>${Math.abs((wardA.margin || 0.25) - (wardB.margin || 0.25)) < 0.1 ? 'Competitive parity' : `${Math.abs((wardA.margin || 0.25) - (wardB.margin || 0.25)).toFixed(2)} margin gap`}</td>
      </tr>
      <tr>
        <td><strong>Effective Parties (ENP)</strong></td>
        <td>${(wardA.enp || 2.8).toFixed(2)}</td>
        <td>${(wardB.enp || 2.8).toFixed(2)}</td>
        <td>${(wardA.enp || 2.8) > 3 ? '<span class="badge-mini badge-blue">High Fragmentation</span>' : 'Standard'}</td>
      </tr>
      <tr>
        <td><strong>Tent Voting Station Share</strong></td>
        <td>${(((wardA.tent_share || 0)) * 100).toFixed(1)}% (${(wardA.top_vds || []).filter(v => v.tent).length} tents)</td>
        <td>${(((wardB.tent_share || 0)) * 100).toFixed(1)}% (${(wardB.top_vds || []).filter(v => v.tent).length} tents)</td>
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
          <rect x="${groupX}" y="${genY}" width="${barWidth}" height="${genH}" rx="4" fill="#ffffff" fill-opacity="0.95">
            <title>${q.quartile}: ${(q.turnout * 100).toFixed(1)}% General Turnout</title>
          </rect>
          <text x="${groupX + barWidth / 2}" y="${genY - 6}" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">
            ${(q.turnout * 100).toFixed(1)}%
          </text>

          <!-- Youth Turnout Bar -->
          <rect x="${groupX + barWidth + innerGap}" y="${youthY}" width="${barWidth}" height="${youthH}" rx="4" fill="rgba(255,255,255,0.3)" fill-opacity="0.9">
            <title>${q.quartile} Youth (18-29): ${(q.youth_turnout * 100).toFixed(1)}%</title>
          </rect>
          <text x="${groupX + barWidth + innerGap + barWidth / 2}" y="${youthY - 6}" fill="#d4d4d8" font-size="11" font-weight="700" text-anchor="middle">
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
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#ffffff" stroke-width="12"
              stroke-dasharray="${length1} ${circumference}" stroke-dashoffset="${offset1}" />
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="12"
              stroke-dasharray="${length2} ${circumference}" stroke-dashoffset="${offset2}" />
      <circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12"
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

  /* --------------------------------------------------------------------------
     20. CivicPulse AI Chatbot Engine
     -------------------------------------------------------------------------- */
  initChatbot() {
    this.chatHistory = [
      {
        role: 'bot',
        text: `👋 Hello! I am **CivicPulse AI**, your conversational research assistant for the Gauteng 2026 Local Government Elections dataset.\n\nI have direct indexing across all **354 wards**, **2,268 voting districts**, Census 2022 multi-dimensional deprivation indicators, and empirical econometric models ($H_1$ & $H_2$).\n\nHow can I help you today? You can ask about any ward (e.g. *'Audit Ward 79900059'*), the *203 canvas tent voting stations*, why *youth turnout collapsed to 23.1%*, model selection (Ridge vs OLS), or how to launch and run CivicPulse!`,
        actions: [
          { label: "📉 Youth Turnout Crisis", prompt: "Why did youth turnout collapse to 23.1% in Gauteng?" },
          { label: "⛺ 203 Tent Stations", prompt: "What is the empirical impact of the 203 tent voting stations?" },
          { label: "📊 H1 & H2 Evidence", prompt: "Explain Hypothesis 1 (Deprivation Friction) and Hypothesis 2 (Incumbency Demobilisation)." },
          { label: "🚀 How to Launch", prompt: "How do I launch and run CivicPulse locally and in production?" }
        ],
        time: this.getChatTimestamp()
      }
    ];

    this.renderChatMessages();
  }

  getChatTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  openChatbot() {
    this.isChatOpen = true;
    this.isChatMinimized = false;
    const panel = document.getElementById('civicChatPanel');
    if (panel) {
      panel.classList.add('open');
      panel.classList.remove('minimized');
      panel.setAttribute('aria-hidden', 'false');
    }
    const unreadDot = document.getElementById('chatUnreadDot');
    if (unreadDot) unreadDot.style.display = 'none';

    setTimeout(() => {
      document.getElementById('chatInput')?.focus();
      this.scrollChatToBottom();
    }, 150);
  }

  closeChatbot() {
    this.isChatOpen = false;
    const panel = document.getElementById('civicChatPanel');
    if (panel) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }
  }

  toggleChatbot() {
    if (this.isChatOpen) {
      this.closeChatbot();
    } else {
      this.openChatbot();
    }
  }

  toggleMinimizeChatbot() {
    this.isChatMinimized = !this.isChatMinimized;
    const panel = document.getElementById('civicChatPanel');
    if (panel) {
      panel.classList.toggle('minimized', this.isChatMinimized);
    }
  }

  resetChat() {
    this.initChatbot();
    this.showToast("CivicPulse AI conversation reset.");
  }

  scrollChatToBottom() {
    const container = document.getElementById('chatMessagesContainer');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  renderChatMessages() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    container.innerHTML = this.chatHistory.map((msg, idx) => {
      const isBot = msg.role === 'bot';
      const formattedContent = this.formatChatMessageContent(msg.text);
      
      let actionsHtml = '';
      if (isBot && msg.actions && msg.actions.length > 0) {
        actionsHtml = `<div class="chat-action-cluster">` +
          msg.actions.map((act) => {
            if (act.action === 'select_ward') {
              return `<button class="chat-action-btn" onclick="window.CivicApp.executeChatAction('select_ward', '${act.data}')">${act.label}</button>`;
            } else if (act.action === 'switch_tab') {
              return `<button class="chat-action-btn" onclick="window.CivicApp.executeChatAction('switch_tab', '${act.data}')">${act.label}</button>`;
            } else if (act.action === 'open_url') {
              return `<a href="${act.data}" target="_blank" rel="noopener noreferrer" class="chat-action-btn" style="text-decoration:none;">${act.label}</a>`;
            } else if (act.action === 'open_quiz') {
              return `<button class="chat-action-btn" onclick="window.CivicApp.executeChatAction('open_quiz')">${act.label}</button>`;
            } else {
              return `<button class="chat-action-btn" onclick="window.CivicApp.handleQuickPrompt('${this.escapeHtml(act.prompt)}')">${act.label}</button>`;
            }
          }).join('') +
          `</div>`;
      }

      return `
        <div class="chat-msg ${msg.role}" id="chatMsg_${idx}">
          <div class="chat-msg-bubble">
            ${formattedContent}
            ${actionsHtml}
          </div>
          <span class="chat-time-tag">${msg.time || ''}</span>
        </div>
      `;
    }).join('');

    this.scrollChatToBottom();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  formatChatMessageContent(raw) {
    if (!raw) return '';
    // Format bold **text**
    let text = raw.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Format italic *text*
    text = text.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Format inline code `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Format line breaks & lists
    text = text.split('\n\n').map(p => {
      if (p.trim().startsWith('- ') || p.trim().startsWith('• ')) {
        const items = p.split('\n').filter(line => line.trim().length > 0);
        return '<ul>' + items.map(line => `<li>${line.replace(/^[-•]\s*/, '')}</li>`).join('') + '</ul>';
      }
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return text;
  }

  executeChatAction(type, data) {
    if (type === 'select_ward' && data) {
      this.selectFullWard(data);
      this.switchFullTab('wards');
      this.showToast(`Inspecting Ward ${data} in Ward Explorer`);
    } else if (type === 'switch_tab' && data) {
      this.switchFullTab(data);
      this.showToast(`Navigated to ${data.toUpperCase()} view`);
    } else if (type === 'open_quiz') {
      this.openQuizModal();
    }
  }

  handleChatSubmit() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    // Add user message
    this.chatHistory.push({
      role: 'user',
      text: query,
      time: this.getChatTimestamp()
    });

    input.value = '';
    this.renderChatMessages();

    // Show typing bar
    const typingBar = document.getElementById('chatTypingBar');
    if (typingBar) typingBar.style.display = 'flex';
    this.scrollChatToBottom();

    // Simulate smart agent inference delay
    setTimeout(() => {
      if (typingBar) typingBar.style.display = 'none';
      const botResponse = this.generateChatResponse(query);
      this.chatHistory.push({
        role: 'bot',
        text: botResponse.text,
        actions: botResponse.actions || [],
        time: this.getChatTimestamp()
      });
      this.renderChatMessages();
    }, 280);
  }

  handleQuickPrompt(prompt) {
    if (!prompt) return;
    this.openChatbot();
    const input = document.getElementById('chatInput');
    if (input) {
      input.value = prompt;
      this.handleChatSubmit();
    }
  }

  generateChatResponse(query) {
    const q = query.toLowerCase().trim();

    // 1. How to Launch & Run CivicPulse
    if (q.includes('launch') || q.includes('run') || q.includes('start') || q.includes('install') || q.includes('setup') || q.includes('how to')) {
      return {
        text: `🚀 **How to Launch & Run CivicPulse:**\n\nYou can launch CivicPulse across three modalities:\n\n**1. Full Web Application (Vite Dev Server):**\n\`\`\`bash\ngit clone https://github.com/BongaManzini/CivicPulse.git\ncd CivicPulse\nnpm install\nnpm run dev\n\`\`\`\nThen open **http://localhost:5173/** in your browser.\n\n**2. Optimized Production Build:**\n\`\`\`bash\nnpm run build\nnpm run preview\n\`\`\`\n\n**3. Standalone Python Streamlit Data Studio:**\n\`\`\`bash\npip install streamlit pandas numpy scikit-learn joblib plotly\nstreamlit run streamlit_app.py\n\`\`\`\n\n**4. In-Notebook Colab Widget:**\nOpen \`CivicPulse_Submission.ipynb\` in Google Colab or JupyterLab and run Section 9.2.`,
        actions: [
          { label: "🐙 Open GitHub Repository", action: "open_url", data: "https://github.com/BongaManzini/CivicPulse" },
          { label: "🏗️ View Deployment Tab", action: "switch_tab", data: "deployment" }
        ]
      };
    }

    // 2. GitHub Repository Link
    if (q.includes('github') || q.includes('repo') || q.includes('code') || q.includes('source') || q.includes('git')) {
      return {
        text: `🐙 **CivicPulse Official GitHub Repository:**\n\nAll source code, data pipelines, deterministic seeds (\`RNG = 42\`), Ridge regression models, and documentation are publicly hosted at:\n\n**[https://github.com/BongaManzini/CivicPulse](https://github.com/BongaManzini/CivicPulse)**\n\n- Lead Investigator: Bonga Manzini\n- Target Election: Gauteng LGE, 4 Nov 2026\n- License: Open Academic & Civic License (MIT)`,
        actions: [
          { label: "🐙 View on GitHub", action: "open_url", data: "https://github.com/BongaManzini/CivicPulse" },
          { label: "🏗️ Architecture Tab", action: "switch_tab", data: "deployment" }
        ]
      };
    }

    // 3. Ward Audits & Searches
    const wardMatch = q.match(/\b(7\d{7})\b/) || q.match(/ward\s*([0-9]+)/i);
    let targetWard = null;

    if (wardMatch && this.data && this.data.wards) {
      const wId = wardMatch[1];
      targetWard = this.data.wards.find(w => w.ward_id === wId || w.ward_id.endsWith(wId));
    }

    // Neighborhood name searches
    if (!targetWard && this.data && this.data.wards) {
      if (q.includes('alexandra') || q.includes('alex')) {
        targetWard = this.data.wards.find(w => w.ward_id === '79900059') || this.data.wards[0];
      } else if (q.includes('soweto') || q.includes('orlando')) {
        targetWard = this.data.wards.find(w => w.metro === 'Johannesburg' && w.winner === 'ANC');
      } else if (q.includes('mamelodi')) {
        targetWard = this.data.wards.find(w => w.metro === 'Tshwane' && w.deprivation_score > 0.7);
      } else if (q.includes('centurion')) {
        targetWard = this.data.wards.find(w => w.metro === 'Tshwane' && w.winner === 'DA');
      } else if (q.includes('tembisa')) {
        targetWard = this.data.wards.find(w => w.metro === 'Ekurhuleni' && w.deprivation_score > 0.6);
      }
    }

    if (targetWard) {
      const turnoutPct = (targetWard.turnout * 100).toFixed(1);
      const marginPct = (targetWard.margin * 100).toFixed(1);
      const forecastPct = (targetWard.forecast_2026 ? targetWard.forecast_2026 * 100 : (targetWard.pred_turnout * 100)).toFixed(1);
      const depScore = targetWard.deprivation_score ? targetWard.deprivation_score.toFixed(3) : 'N/A';
      const tents = targetWard.n_tent_vds || (targetWard.tent_share > 0 ? 'Yes (Tents detected)' : 'None');

      return {
        text: `🔍 **Official Ward Audit: Ward ${targetWard.ward_id} (${targetWard.metro})**\n\n` +
          `- **2021 Recorded Turnout:** **${turnoutPct}%** (${targetWard.registered ? targetWard.registered.toLocaleString() : 'N/A'} registered voters)\n` +
          `- **Winning Party:** **${targetWard.winner || 'N/A'}** (Victory Margin: **${marginPct}%**)\n` +
          `- **Effective Parties (ENP):** **${targetWard.enp ? targetWard.enp.toFixed(2) : 'N/A'}**\n` +
          `- **Deprivation Index:** **${depScore}** (Risk Tier: **${targetWard.risk_tier || 'Moderate'}**)\n` +
          `- **Temporary Tent Stations:** **${tents}**\n` +
          `- **2026 Model Turnout Forecast (Ridge):** **${forecastPct}%**\n\n` +
          `Would you like to examine this ward in the full comparative auditor?`,
        actions: [
          { label: `🔍 Inspect Ward ${targetWard.ward_id}`, action: "select_ward", data: targetWard.ward_id },
          { label: "🗺️ View on Spatial Map", action: "switch_tab", data: "map" },
          { label: "🧪 Test Policy Levers", action: "switch_tab", data: "simulator" }
        ]
      };
    }

    // 4. Youth Turnout Deficit
    if (q.includes('youth') || q.includes('apathy') || q.includes('young') || q.includes('18-29') || q.includes('age')) {
      return {
        text: `📉 **The Youth Voter Participation Deficit in Gauteng:**\n\n` +
          `- **Participation Collapse:** In 2021, registered youth (aged 18–29) turnout plunged to an estimated **23.1%**, in stark contrast to **44.4%** among voters aged 50+.\n` +
          `- **Registration Crisis:** Only **~19% of eligible youth in Gauteng** are registered on the official IEC voters roll.\n` +
          `- **Debunking "Youth Apathy":** Our econometric and Census 2022 analysis proves youth abstention is driven by structural friction rather than moral indifference:\n` +
          `  1. **Transit Poverty:** Young people lack transport funds to reach distant voting centres.\n` +
          `  2. **Infrastructural Indignity:** 203 voting stations are temporary canvas tents with unlit muddy queues.\n` +
          `  3. **Service Delivery Disillusionment:** Wards with persistent water and electricity outages exhibit statistically significant civic alienation.`,
        actions: [
          { label: "🧪 Launch Policy Simulator", action: "switch_tab", data: "simulator" },
          { label: "🎯 Take Youth Civic Quiz", action: "open_quiz" },
          { label: "📊 View Statistical Evidence", action: "switch_tab", data: "analytics" }
        ]
      };
    }

    // 5. 203 Canvas Tent Stations
    if (q.includes('tent') || q.includes('canvas') || q.includes('temporary') || q.includes('station') || q.includes('facility')) {
      return {
        text: `⛺ **The 203 Temporary Canvas Tent Voting Stations:**\n\n` +
          `- **Spatial Concentration:** Across Gauteng, **203 Voting Districts (across 134 wards)** rely on temporary canvas tents rather than permanent brick schools or community halls.\n` +
          `- **Informal Settlement Trap:** Over 85% of these tents are pitched in informal settlements across Tshwane (Mamelodi, Hammanskraal), Johannesburg (Alexandra, Orange Farm), and Ekurhuleni (Tembisa).\n` +
          `- **Empirical Penalty ($H_1$):** Paired within-ward voting district matching proves that voters assigned to tents suffer an additional **-1.00 pp to -3.12 pp turnout penalty** relative to peers voting in permanent halls in the *exact same ward*.\n` +
          `- **Policy Recommendation:** Replacing all 203 tents with permanent, electrified multi-purpose civic hubs ahead of 4 Nov 2026 is projected to recover **+1.5 to +2.8 percentage points** in local turnout.`,
        actions: [
          { label: "🗺️ View Tent Hotspots on Map", action: "switch_tab", data: "map" },
          { label: "🧪 Simulate Tent Replacement", action: "switch_tab", data: "simulator" }
        ]
      };
    }

    // 6. Empirical Hypotheses (H1 & H2)
    if (q.includes('hypothesis') || q.includes('h1') || q.includes('h2') || q.includes('theory') || q.includes('friction') || q.includes('demobilis')) {
      return {
        text: `📊 **Empirical Hypotheses Verdict ($H_1$ & $H_2$):**\n\n` +
          `**1. Hypothesis 1: Deprivation Friction Effect ($H_1$) — CONFIRMED**\n` +
          `- *Proposition:* Multi-dimensional deprivation suppresses voter turnout.\n` +
          `- *Evidence:* $r = -0.412, p < 0.001$. Affluent Quartile 1 wards average **52.4% turnout**, whereas informal settlement Quartile 4 wards average **31.2%** — a **21.2 percentage point participation chasm**.\n\n` +
          `**2. Hypothesis 2: Incumbency Demobilisation Effect ($H_2$) — CONFIRMED**\n` +
          `- *Proposition:* One-party safe seats ($\text{ENP} < 2.0$, high victory margins) demobilise voters.\n` +
          `- *Evidence:* $p = 0.004, F = 5.21$. Multi-party competitive wards ($\text{ENP} > 3.0$) average **48.9% turnout**, vs **42.1%** in safe seats (a **6.8 pp competition penalty**). DA safe seats maintain mobilization (+0.41 SD), whereas ANC safe seats experience voter demobilisation (+0.05 SD).`,
        actions: [
          { label: "📈 Open Analytics & Charts", action: "switch_tab", data: "analytics" },
          { label: "🔍 Compare Wards", action: "switch_tab", data: "wards" }
        ]
      };
    }

    // 7. Econometric Model Selection & ML
    if (q.includes('model') || q.includes('ridge') || q.includes('ols') || q.includes('random forest') || q.includes('xgboost') || q.includes('regression') || q.includes('vif')) {
      return {
        text: `📈 **Econometric Model Selection (5-Fold Spatial Block CV):**\n\n` +
          `- **Ridge Regularized ($\alpha=10$):** **MAE 6.32 pp · $R^2 = 0.365$** → **CHOSEN (1-SE Parsimony Rule)**\n` +
          `- **Standard OLS Regression:** MAE 6.33 pp · $R^2 = 0.365$ → **EXCLUDED** (Severe Multicollinearity, $\text{VIF} > 10$ between party shares and margin)\n` +
          `- **Random Forest:** MAE 6.28 pp · $R^2 = 0.373$ → Marginally lower raw MAE (by 0.04 pp), but rejected as a black box because public policy requires signed, interpretable coefficients ($\beta$).\n` +
          `- **XGBoost:** MAE 6.50 pp · $R^2 = 0.348$ → Overfitting on spatial boundaries.\n\n` +
          `Ridge regularizes collinear variables, guarantees computational stability, and quantifies exact voter gains per service delivery improvement.`,
        actions: [
          { label: "📊 View Models Matrix", action: "switch_tab", data: "analytics" },
          { label: "🏗️ View System Architecture", action: "switch_tab", data: "deployment" }
        ]
      };
    }

    // 8. Policy Simulator & Counterfactuals
    if (q.includes('simulator') || q.includes('what if') || q.includes('policy') || q.includes('lever') || q.includes('intervention')) {
      return {
        text: `🧪 **What-If Policy Simulation Studio:**\n\nThe simulator models three dynamic municipal levers:\n\n` +
          `1. **Water & Sanitation Access (+25%):** Upgrading on-site piped water and formal sanitation (+1.8 pp youth turnout uplift).\n` +
          `2. **Youth Transit & Employment (+30%):** Commuter subsidies to reduce economic friction (+2.2 pp youth turnout uplift).\n` +
          `3. **Tent Replacement (+40%):** Converting canvas tents to permanent brick civic hubs (+2.8 pp youth turnout uplift).\n\n` +
          `**Total Projected Impact:** Potential youth turnout uplift from **24.0% to 30.8% (+6.8 pp)** ahead of the 2026 Local Government Elections.`,
        actions: [
          { label: "🧪 Launch Policy Simulator", action: "switch_tab", data: "simulator" },
          { label: "📄 Export Structured Policy Brief", action: "switch_tab", data: "simulator" }
        ]
      };
    }

    // 9. Metros Overview
    if (q.includes('tshwane') || q.includes('joburg') || q.includes('johannesburg') || q.includes('ekurhuleni') || q.includes('gauteng') || q.includes('metro')) {
      return {
        text: `🏙️ **Gauteng Metropolitan Turnout Summary (2021 Official IEC):**\n\n` +
          `- **City of Johannesburg:** 135 Wards · 2,219,769 Registered · **41.6% Turnout** (Lowest Metro)\n` +
          `- **City of Tshwane:** 107 Wards · 1,526,452 Registered · **44.1% Turnout**\n` +
          `- **City of Ekurhuleni:** 112 Wards · 1,587,116 Registered · **57.5% Turnout**\n` +
          `- **Total Gauteng Scope:** 354 Wards · 2,268 Voting Districts · 5,333,337 Registered Voters · **47.4% Overall Turnout**\n\n` +
          `Turnout variation is heavily intra-metro, driven by ward-level deprivation and margin of victory.`,
        actions: [
          { label: "🗺️ Explore GIS Choropleth", action: "switch_tab", data: "map" },
          { label: "🔍 Audit Wards", action: "switch_tab", data: "wards" }
        ]
      };
    }

    // 10. Navigation Commands
    if (q.includes('map')) {
      this.switchFullTab('map');
      return { text: "🗺️ Navigated you to the **Spatial Geography & GIS Map** tab. You can toggle between 2021 Turnout, Deprivation Quartiles, and Tent Stations.", actions: [{ label: "🔍 Search a Ward", prompt: "Audit Ward 79900059" }] };
    }
    if (q.includes('quiz')) {
      this.openQuizModal();
      return { text: "🎯 Opening the **Youth Civic Alignment Quiz** modal for you!", actions: [] };
    }

    // Default Fallback
    return {
      text: `🤖 I'm here to assist with any aspect of the CivicPulse Gauteng research project.\n\nYou can ask me:\n- *"Audit Ward 79900059"* or search any suburb (e.g. Alexandra, Mamelodi, Soweto)\n- *"Why did youth turnout collapse to 23.1%?"*\n- *"What is the impact of the 203 tent stations?"*\n- *"Explain H1 (Deprivation Friction) and H2 (Incumbency Demobilisation)"*\n- *"Why Ridge Regression instead of OLS?"*\n- *"How to launch CivicPulse"*`,
      actions: [
        { label: "📉 Youth Turnout Crisis", prompt: "Why did youth turnout collapse to 23.1% in Gauteng?" },
        { label: "⛺ 203 Tent Stations", prompt: "What is the empirical impact of the 203 tent voting stations?" },
        { label: "🚀 How to Launch", prompt: "How do I launch and run CivicPulse locally and in production?" },
        { label: "🐙 GitHub Repository", action: "open_url", data: "https://github.com/BongaManzini/CivicPulse" }
      ]
    };
  }
}

// Instantiate and expose globally
window.CivicApp = new CivicPulseApp();
