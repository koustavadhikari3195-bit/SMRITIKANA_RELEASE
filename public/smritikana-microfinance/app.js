/**
 * SMRITIKANA BUSINESS SOLUTIONS - APP LOGIC
 * Platform: SETU (Systematic Enablement of Transparent Underwriting)
 * Version: 1.1.0 (Comparison Engine Upgrade)
 * Compliance: RBI 2025 Directions
 **/

// ─── COMPLIANCE CONSTANTS (RBI 2025) ───
const RBI_2025 = {
    MIN_MICROFINANCE_ASSET_PCT: 60,
    SECTION_8_ASSET_THRESHOLD: 100_00_00_000, // ₹100 Cr
    MIN_CRAR_PCT: 15,
    MIN_NOF_REQUIRED: 5_00_00_000,           // ₹5 Cr
};

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. NAVIGATION & UI HELPERS
    // ==========================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }

    // Smooth Scroll & Mobile Menu Close
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ==========================================
    // 2. COMPARISON ENGINE (SETU v1.1)
    // ==========================================
    const ceForm = {
        totalAssets: document.getElementById('ceTotalAssets'),
        mfAssets: document.getElementById('ceMFAssets'),
        nof: document.getElementById('ceNOF'),
        growth: document.getElementById('ceGrowthRate'),
        years: document.getElementById('ceYears'),
        preference: document.getElementById('cePreference'),
        btnRun: document.getElementById('btnRunAnalysis')
    };

    const ceUI = {
        inputSection: document.getElementById('ceInputSection'),
        resultsSection: document.getElementById('ceResultsSection'),
        tabVerdicts: document.getElementById('tabVerdicts'),
        tabMatrix: document.getElementById('tabMatrix'),
        tabProjection: document.getElementById('tabProjection'),
        previews: {
            ratio: document.getElementById('previewRatio'),
            assets: document.getElementById('previewAssets'),
            crar: document.getElementById('previewCRAR')
        }
    };

    // --- Live Event Listeners ---
    [ceForm.totalAssets, ceForm.mfAssets, ceForm.nof].forEach(el => {
        el?.addEventListener('input', updateLivePreviews);
    });

    function updateLivePreviews() {
        const total = parseFloat(ceForm.totalAssets.value) || 0;
        const mf = parseFloat(ceForm.mfAssets.value) || 0;
        const nof = parseFloat(ceForm.nof.value) || 0;

        if (!ceUI.previews.ratio) return;

        // Ratio
        const ratio = total > 0 ? (mf / total) * 100 : 0;
        const ratioCard = ceUI.previews.ratio;
        ratioCard.querySelector('.value').innerText = ratio > 0 ? ratio.toFixed(1) + '%' : '—';
        ratioCard.className = `ce-preview-card ${ratio >= 60 ? 'good' : (ratio >= 50 ? 'warn' : 'bad')}`;

        // Assets
        const assetsCard = ceUI.previews.assets;
        assetsCard.querySelector('.value').innerText = total > 0 ? formatCurrency(total) : '—';
        assetsCard.className = `ce-preview-card ${total >= RBI_2025.SECTION_8_ASSET_THRESHOLD ? 'bad' : (total >= 70_00_00_000 ? 'warn' : 'good')}`;

        // CRAR
        const crar = mf > 0 ? (nof / mf) * 100 : 0;
        const crarCard = ceUI.previews.crar;
        crarCard.querySelector('.value').innerText = mf > 0 ? crar.toFixed(1) + '%' : '—';
        crarCard.className = `ce-preview-card ${crar >= 15 ? 'good' : 'bad'}`;
    }

    ceForm.btnRun?.addEventListener('click', () => {
        const input = {
            totalAssets: parseFloat(ceForm.totalAssets.value) || 0,
            mfAssets: parseFloat(ceForm.mfAssets.value) || 0,
            nof: parseFloat(ceForm.nof.value) || 0,
            growth: parseFloat(ceForm.growth.value) || 0,
            years: parseInt(ceForm.years.value) || 3,
            preference: ceForm.preference.value
        };

        if (input.totalAssets <= 0) {
            alert('Please enter valid asset figures.');
            return;
        }

        const output = runComparisonEngine(input);
        renderResults(output);

        ceUI.inputSection.classList.add('hidden');
        ceUI.resultsSection.classList.remove('hidden');
        ceUI.resultsSection.scrollIntoView({ behavior: 'smooth' });
    });

    // --- Tab Switching ---
    document.querySelectorAll('.ce-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            if (target === 'input') {
                ceUI.resultsSection.classList.add('hidden');
                ceUI.inputSection.classList.remove('hidden');
                return;
            }

            document.querySelectorAll('.ce-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            document.getElementById('tab' + target.charAt(0).toUpperCase() + target.slice(1)).classList.remove('hidden');
        });
    });

    function runComparisonEngine(input) {
        const { totalAssets, mfAssets, nof, growth, years } = input;

        // 1. Current Verdicts
        const ratio = (mfAssets / totalAssets) * 100;
        const crar = mfAssets > 0 ? (nof / mfAssets) * 100 : 0;

        const verdicts = [
            {
                rule: '60% Microfinance Asset Rule',
                status: ratio >= 60 ? 'compliant' : (ratio >= 50 ? 'warning' : 'non_compliant'),
                current: ratio.toFixed(1) + '%',
                required: '≥ 60%',
                ref: 'Para 3(1)(iii)',
                explanation: ratio >= 60 ? 'Compliant with RBI composition norms.' : 'MF assets must be at least 60% of total assets.'
            },
            {
                rule: '₹100 Crore Threshold',
                status: totalAssets >= RBI_2025.SECTION_8_ASSET_THRESHOLD ? 'warning' : 'compliant',
                current: formatCurrency(totalAssets),
                required: '< ₹100 Cr',
                ref: 'Para 2(1)(iv)',
                explanation: totalAssets >= RBI_2025.SECTION_8_ASSET_THRESHOLD ? 'MANDATORY transition to NBFC-MFI required.' : 'Safe within Section 8 asset limits.'
            },
            {
                rule: 'Capital Adequacy (CRAR)',
                status: crar >= 15 ? 'compliant' : 'non_compliant',
                current: crar.toFixed(1) + '%',
                required: '≥ 15%',
                ref: 'Para 9',
                explanation: crar >= 15 ? 'Capital buffer is adequate.' : 'Insufficient capital relative to risk assets.'
            }
        ];

        // 2. Projections
        const projections = [];
        let currTot = totalAssets;
        let currMF = mfAssets;
        const multiplier = 1 + (growth / 100);

        for (let i = 1; i <= years; i++) {
            currTot *= multiplier;
            currMF *= multiplier;
            projections.push({
                year: i,
                total: Math.round(currTot),
                mf: Math.round(currMF),
                ratio: (currMF / currTot) * 100,
                nofReq: currMF * 0.15,
                crossed: currTot >= RBI_2025.SECTION_8_ASSET_THRESHOLD
            });
        }

        // 3. Recommendation
        let path = 'section_8';
        let reason = 'Based on your current scale, Section 8 is a viable low-cost setup.';

        if (totalAssets >= RBI_2025.SECTION_8_ASSET_THRESHOLD) {
            path = 'section_8_transition';
            reason = 'MANDATORY transition. Your assets exceed the ₹100 Cr limit for Section 8 microfinance.';
        } else if (totalAssets >= 70_00_00_000 || projections.some(p => p.crossed)) {
            path = 'nbfc_mfi';
            reason = 'Strategic NBFC-MFI registration recommended. You are approaching or will soon cross the ₹100 Cr limit.';
        }

        return { verdicts, projections, path, reason };
    }

    function renderResults(output) {
        // Render Verdicts
        ceUI.tabVerdicts.innerHTML = `
            <div class="verdict-banner">
                <div class="verdict-icon-box">${output.path === 'nbfc_mfi' ? '🏦' : (output.path === 'section_8_transition' ? '🔄' : '🏛️')}</div>
                <div>
                    <h4 style="color: #166534;">Recommended Path: ${output.path.replace('_', ' ').toUpperCase()}</h4>
                    <p style="font-size: 0.9rem; margin-top: 5px;">${output.reason}</p>
                </div>
            </div>
            ${output.verdicts.map(v => `
                <div class="verdict-card ${v.status}">
                    <div class="verdict-header">
                        <span class="verdict-rule">${v.rule}</span>
                        <span class="verdict-badge ${v.status}">${v.status.replace('_', ' ')}</span>
                    </div>
                    <p style="font-size: 0.85rem; color: #475569;">${v.explanation}</p>
                    <div class="verdict-footer">
                        <span><strong>Current:</strong> ${v.current}</span>
                        <span><strong>Required:</strong> ${v.required}</span>
                        <span style="font-family: monospace; font-size: 0.75rem;">Ref: ${v.ref}</span>
                    </div>
                </div>
            `).join('')}
        `;

        // Render Matrix (Static but updated based on recommendation)
        ceUI.tabMatrix.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="border-bottom: 2px solid #e2e8f0;">
                        <th style="text-align: left; padding: 12px; font-size: 0.8rem; color: #64748b; text-transform: uppercase;">Dimension</th>
                        <th style="text-align: left; padding: 12px; color: #1e3a8a;">Section 8</th>
                        <th style="text-align: left; padding: 12px; color: #059669;">NBFC-MFI</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px; font-weight: 600;">Min Capital</td>
                        <td style="padding: 12px;">₹2 Lakhs</td>
                        <td style="padding: 12px; background: #ecfdf5; font-weight: 700;">₹5 Crores</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
                        <td style="padding: 12px; font-weight: 600;">RBI Limit</td>
                        <td style="padding: 12px; background: #eff6ff; font-weight: 700;">₹100 Cr Cap</td>
                        <td style="padding: 12px;">Unlimited</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px; font-weight: 600;">Dividend</td>
                        <td style="padding: 12px;">Not Permitted</td>
                        <td style="padding: 12px; background: #ecfdf5; font-weight: 700;">Founders Profit</td>
                    </tr>
                </tbody>
            </table>
        `;

        // Render Projections
        const maxAsset = Math.max(...output.projections.map(p => p.total), 100_00_00_000);
        ceUI.tabProjection.innerHTML = `
            <div class="proj-chart">
                <h4 style="margin-bottom: 20px; font-size: 0.9rem; color: #64748b;">ASSET GROWTH TRAJECTORY</h4>
                ${output.projections.map(p => {
            const totalPct = (p.total / maxAsset) * 100;
            const mfPct = (p.mf / maxAsset) * 100;
            const thresholdPct = (100_00_00_000 / maxAsset) * 100;
            return `
                        <div class="proj-row">
                            <span class="proj-year">Year ${p.year}</span>
                            <div class="proj-bar-container">
                                <div class="proj-bar-total" style="width: ${totalPct}%"></div>
                                <div class="proj-bar-mf ${p.crossed ? 'crossed' : ''}" style="width: ${mfPct}%"></div>
                                <div class="proj-threshold-line" style="left: ${thresholdPct}%"></div>
                            </div>
                            <span class="proj-value">${formatCurrency(p.total)}</span>
                        </div>
                    `;
        }).join('')}
                <div class="proj-legend">
                    <div class="legend-item"><div class="legend-color" style="background: #059669;"></div> MF Assets</div>
                    <div class="legend-item"><div class="legend-color" style="background: #cbd5e1;"></div> Total Assets</div>
                    <div class="legend-item"><div class="legend-color" style="background: #dc2626;"></div> ₹100 Cr Threshold</div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // 3. ELIGIBILITY BOT (v1.2 Alpha - Advanced)
    // ==========================================
    const INCOME_CATALOG = [
        { value: 'salaried', label: 'Salaried Job' },
        { value: 'daily_wages', label: 'Daily Wages' },
        { value: 'agriculture', label: 'Agriculture' },
        { value: 'hustle', label: 'Small Business' },
        { value: 'remittance', label: 'Remittances' },
        { value: 'other', label: 'Other' }
    ];

    window.EligibilityBot = {
        step: 0,
        totalSteps: 6,
        data: {
            householdType: 'rural',
            members: 4,
            earners: 1,
            incomeSources: [], // { id, type, amount, verifiable }
            obligations: [],   // { id, type, emi, lender }
            proposed: {
                amount: 50000,
                tenure: 12,
                rate: 24,
                purpose: 'income_generation'
            }
        },

        init() {
            this.renderStep();
            this.updateProgress();
        },

        updateProgress() {
            const progress = (this.step / (this.totalSteps - 1)) * 100;
            const progressBar = document.getElementById('botProgress');
            if (progressBar) progressBar.style.width = `${progress}%`;
        },

        // --- State Helpers ---
        addIncome() {
            this.data.incomeSources.push({ id: Date.now(), type: 'salaried', amount: 0, verifiable: true });
            this.renderStep();
        },
        removeIncome(id) {
            this.data.incomeSources = this.data.incomeSources.filter(s => s.id !== id);
            this.renderStep();
        },
        addDebt() {
            this.data.obligations.push({ id: Date.now(), type: 'mfi', emi: 0, lender: '' });
            this.renderStep();
        },
        removeDebt(id) {
            this.data.obligations = this.data.obligations.filter(d => d.id !== id);
            this.renderStep();
        },

        nextStep() {
            if (this.step < this.totalSteps - 1) {
                if (!this.validateStep()) return;
                this.step++;
                this.renderStep();
                this.updateProgress();
            }
        },
        prevStep() {
            if (this.step > 0) {
                this.step--;
                this.renderStep();
                this.updateProgress();
            }
        },

        validateStep() {
            if (this.step === 2 && this.data.incomeSources.length === 0) {
                alert('Please add at least one income source.');
                return false;
            }
            return true;
        },

        renderStep() {
            const container = document.getElementById('botStepContainer');
            if (!container) return;

            container.style.opacity = '0';
            setTimeout(() => {
                let html = '';
                switch (this.step) {
                    case 0: // Welcome
                        html = `
                            <div class="bot-step welcome">
                                <span class="step-icon">👋</span>
                                <h3>Annex I Assessment</h3>
                                <p>This tool evaluates borrower eligibility against the <strong>₹3L Income Cap</strong> and <strong>50% FOIR Limit</strong> as per RBI 2025 Directions.</p>
                                <div class="welcome-box">
                                    <ul>
                                        <li><i class="fas fa-check"></i> Multi-Source Income Audit</li>
                                        <li><i class="fas fa-check"></i> Cross-Lender Debt Check</li>
                                        <li><i class="fas fa-check"></i> Risk Flag Detection</li>
                                    </ul>
                                </div>
                            </div>
                        `;
                        break;
                    case 1: // Profile
                        html = `
                            <div class="bot-step">
                                <h3><i class="fas fa-home"></i> Household Profile</h3>
                                <div class="bot-options">
                                    <label class="bot-option-card ${this.data.householdType === 'rural' ? 'active' : ''}">
                                        <input type="radio" name="hType" onclick="EligibilityBot.data.householdType='rural'; EligibilityBot.renderStep()" ${this.data.householdType === 'rural' ? 'checked' : ''}>
                                        <div class="option-inner"><i class="fas fa-leaf"></i> <span>Rural</span></div>
                                    </label>
                                    <label class="bot-option-card ${this.data.householdType === 'urban' ? 'active' : ''}">
                                        <input type="radio" name="hType" onclick="EligibilityBot.data.householdType='urban'; EligibilityBot.renderStep()" ${this.data.householdType === 'urban' ? 'checked' : ''}>
                                        <div class="option-inner"><i class="fas fa-city"></i> <span>Urban</span></div>
                                    </label>
                                </div>
                                <div class="form-grid-2">
                                    <div class="form-group">
                                        <label>Family Members</label>
                                        <input type="number" value="${this.data.members}" oninput="EligibilityBot.data.members=parseInt(this.value)">
                                    </div>
                                    <div class="form-group">
                                        <label>Earning Members</label>
                                        <input type="number" value="${this.data.earners}" oninput="EligibilityBot.data.earners=parseInt(this.value)">
                                    </div>
                                </div>
                            </div>
                        `;
                        break;
                    case 2: // Income
                        html = `
                            <div class="bot-step">
                                <h3><i class="fas fa-wallet"></i> Income Sources</h3>
                                <div class="dynamic-list">
                                    ${this.data.incomeSources.map(s => `
                                        <div class="list-item">
                                            <select onchange="EligibilityBot.updateIncome(${s.id}, 'type', this.value)">
                                                ${INCOME_CATALOG.map(cat => `<option value="${cat.value}" ${s.type === cat.value ? 'selected' : ''}>${cat.label}</option>`).join('')}
                                            </select>
                                            <div class="input-with-prefix">
                                                <span>₹</span>
                                                <input type="number" value="${s.amount || ''}" placeholder="Monthly" oninput="EligibilityBot.updateIncome(${s.id}, 'amount', this.value)">
                                            </div>
                                            <button onclick="EligibilityBot.removeIncome(${s.id})" class="btn-remove"><i class="fas fa-trash"></i></button>
                                        </div>
                                    `).join('')}
                                </div>
                                <button onclick="EligibilityBot.addIncome()" class="btn-add"><i class="fas fa-plus"></i> Add Income Source</button>
                            </div>
                        `;
                        break;
                    case 3: // Debts
                        html = `
                            <div class="bot-step">
                                <h3><i class="fas fa-hand-holding-usd"></i> Existing Loans</h3>
                                <div class="dynamic-list">
                                    ${this.data.obligations.map(d => `
                                        <div class="list-item">
                                            <input type="text" placeholder="Lender Name" value="${d.lender}" oninput="EligibilityBot.updateDebt(${d.id}, 'lender', this.value)">
                                            <div class="input-with-prefix">
                                                <span>₹</span>
                                                <input type="number" value="${d.emi || ''}" placeholder="EMI" oninput="EligibilityBot.updateDebt(${d.id}, 'emi', this.value)">
                                            </div>
                                            <button onclick="EligibilityBot.removeDebt(${d.id})" class="btn-remove"><i class="fas fa-trash"></i></button>
                                        </div>
                                    `).join('')}
                                </div>
                                <button onclick="EligibilityBot.addDebt()" class="btn-add"><i class="fas fa-plus"></i> Add Existing Loan</button>
                            </div>
                        `;
                        break;
                    case 4: // Proposed
                        html = `
                            <div class="bot-step">
                                <h3><i class="fas fa-bullseye"></i> Proposed Loan</h3>
                                <div class="form-grid-2">
                                    <div class="form-group">
                                        <label>Amount (₹)</label>
                                        <input type="number" value="${this.data.proposed.amount}" oninput="EligibilityBot.data.proposed.amount=parseFloat(this.value)">
                                    </div>
                                    <div class="form-group">
                                        <label>Tenure (Months)</label>
                                        <input type="number" value="${this.data.proposed.tenure}" oninput="EligibilityBot.data.proposed.tenure=parseInt(this.value)">
                                    </div>
                                </div>
                                <div class="form-group" style="margin-top: 15px;">
                                    <label>Purpose of Loan</label>
                                    <select onchange="EligibilityBot.data.proposed.purpose=this.value">
                                        <option value="income_generation">Income Generation</option>
                                        <option value="housing">Housing Repair</option>
                                        <option value="consumption">Consumption</option>
                                    </select>
                                </div>
                            </div>
                        `;
                        break;
                    case 5: // Results
                        this.renderFinalResults(container);
                        return;
                }
                container.innerHTML = html;
                container.style.opacity = '1';
                this.renderControls();
            }, 200);
        },

        updateIncome(id, field, value) {
            const s = this.data.incomeSources.find(x => x.id === id);
            if (s) s[field] = field === 'amount' ? parseFloat(value) || 0 : value;
        },
        updateDebt(id, field, value) {
            const d = this.data.obligations.find(x => x.id === id);
            if (d) d[field] = field === 'emi' ? parseFloat(value) || 0 : value;
        },

        renderControls() {
            const controls = document.getElementById('botControls');
            if (!controls) return;
            controls.innerHTML = `
                ${this.step > 0 ? `<button onclick="EligibilityBot.prevStep()" class="bot-btn secondary">Back</button>` : ''}
                <button onclick="EligibilityBot.nextStep()" class="bot-btn primary">
                    ${this.step === 4 ? 'Run AI Analysis' : (this.step === 0 ? 'Begin Assessment' : 'Next Step')}
                </button>
            `;
        },

        calculateEMI(p, r, n) {
            if (!p || !n) return 0;
            const monthlyRate = r / 12 / 100;
            const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
            return Math.round(emi);
        },

        renderFinalResults(container) {
            const totalMonthlyIncome = this.data.incomeSources.reduce((sum, s) => sum + s.amount, 0);
            const totalAnnualIncome = totalMonthlyIncome * 12;
            const existingEMI = this.data.obligations.reduce((sum, d) => sum + d.emi, 0);
            const proposedEMI = this.calculateEMI(this.data.proposed.amount, this.data.proposed.rate, this.data.proposed.tenure);
            const totalEMI = existingEMI + proposedEMI;
            const foir = totalMonthlyIncome > 0 ? (totalEMI / totalMonthlyIncome) * 100 : 0;

            const incomeOk = totalAnnualIncome <= 300000;
            const foirOk = foir <= 50;
            const eligible = incomeOk && foirOk;

            // Save to History (Full Stack Link)
            this.saveToHistory({
                location: this.data.householdType,
                income: totalAnnualIncome,
                debt: totalEMI,
                foir: foir,
                status: eligible ? 'pass' : 'fail'
            });

            // Risk Flags
            const flags = [];
            if (this.data.obligations.length >= 3) flags.push({ s: 'med', t: 'Multiple MFI Debt', d: 'Borrower has 3+ existing loans.' });
            if (foir > 40 && foir <= 50) flags.push({ s: 'low', t: 'Thin Headroom', d: 'FOIR is near the 50% threshold.' });
            if (this.data.earners === 1 && this.data.members > 4) flags.push({ s: 'low', t: 'High Dependency', d: 'Single earner for large family.' });

            container.innerHTML = `
                <div class="bot-results-advanced">
                    <div class="result-header ${eligible ? 'pass' : 'fail'}">
                        <i class="fas ${eligible ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        <h4>${eligible ? 'Assess: ELIGIBLE' : 'Assess: INELIGIBLE'}</h4>
                    </div>

                    <div class="metrics-grid">
                        <div class="metric-box">
                            <span class="m-label">Annual Income</span>
                            <span class="m-value ${incomeOk ? 'ok' : 'bad'}">${formatCurrency(totalAnnualIncome)}</span>
                            <span class="m-limit">Limit: ₹3L</span>
                        </div>
                        <div class="metric-box">
                            <span class="m-label">Projected FOIR</span>
                            <span class="m-value ${foirOk ? (foir > 40 ? 'warn' : 'ok') : 'bad'}">${foir.toFixed(1)}%</span>
                            <span class="m-limit">Limit: 50%</span>
                        </div>
                    </div>

                    <div class="foir-viz">
                        <div class="viz-labels"><span>Total EMI</span> <span>${formatCurrency(totalEMI)}/mo</span></div>
                        <div class="viz-bar-container">
                            <div class="viz-bar" style="width: ${Math.min(foir, 100)}%; background: ${foir > 50 ? '#ef4444' : (foir > 40 ? '#f59e0b' : '#10b981')}"></div>
                            <div class="viz-threshold" style="left: 50%"></div>
                        </div>
                    </div>

                    ${flags.length ? `
                        <div class="risk-flags">
                            <h5><i class="fas fa-shield-alt"></i> Intelligence Flags</h5>
                            ${flags.map(f => `
                                <div class="flag-item ${f.s}">
                                    <strong>${f.t}:</strong> ${f.d}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="result-footer">
                        <p>Ref: RBI Chapter III, Para 7(1). Standardized calculation effective 2025.</p>
                        <button onclick="EligibilityBot.reset()" class="bot-btn outline">Restart Audit</button>
                    </div>
                </div>
            `;
            container.style.opacity = '1';
            document.getElementById('botControls').innerHTML = '';
        },

        reset() {
            this.step = 0;
            this.data = {
                householdType: 'rural', members: 4, earners: 1,
                incomeSources: [], obligations: [],
                proposed: { amount: 50000, tenure: 12, rate: 24, purpose: 'income_generation' }
            };
            this.init();
        },

        saveToHistory(result) {
            const history = JSON.parse(localStorage.getItem('setu_assessments') || '[]');
            const newItem = {
                id: Date.now(),
                created_at: new Date().toISOString(),
                ...result
            };
            history.unshift(newItem);
            localStorage.setItem('setu_assessments', JSON.stringify(history.slice(0, 50)));
            console.log("Assessment stored locally. Connect Supabase for cloud sync.");
        }
    };

    EligibilityBot.init();

    // Helper: Formatter
    function formatCurrency(num) {
        if (num >= 100_00_00_000) return '₹' + (num / 100_00_00_000).toFixed(2) + ' Cr';
        if (num >= 1_00_00_000) return '₹' + (num / 1_00_00_000).toFixed(2) + ' Cr';
        if (num >= 1_00_000) return '₹' + (num / 1_00_00_000).toFixed(1) + ' L';
        return '₹' + num.toLocaleString('en-IN');
    }
});
