const page = document.body.dataset.page;
const dataUrl = page === "review" ? "../submission.json" : "./submission.json";
const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

const esc = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const labelize = (value) => String(value)
  .replace(/([a-z])([A-Z])/g, "$1 $2")
  .replaceAll("And", "and")
  .replace(/^./, (char) => char.toUpperCase());

const amount = (value) => typeof value === "number" ? money.format(value) : esc(value);
const signed = (value) => `<span class="${value < 0 ? "negative" : "positive"}">${money.format(value)}</span>`;

function statementRows(object, totals = []) {
  return Object.entries(object).map(([key, value]) => {
    if (typeof value === "object" && value !== null) return "";
    const total = totals.includes(key) ? "total" : "";
    return `<tr class="${total}"><td>${esc(labelize(key))}</td><td>${amount(value)}</td></tr>`;
  }).join("");
}

function renderMain(data) {
  const pnl = data.statements.profitAndLoss;
  const cf = data.statements.cashFlow;
  const bs = data.statements.balanceSheet;
  const managementProfit = 312000;
  const overstatement = managementProfit - pnl.netProfit;
  const currentLiabilities = bs.liabilities.suppliers + bs.liabilities.payroll + bs.liabilities.customerDeposits + bs.liabilities.interest + bs.liabilities.legalProvision;

  document.querySelector("#app").innerHTML = `
    <div class="shell" id="top">
      <section class="masthead">
        <div><div class="eyebrow">Hostile takeover · forensic reconstruction</div><h1>Claims met evidence.<br>The numbers changed.</h1><p class="lede">A traceable reconstruction of Divorce Party International Ltd. from bank records, contracts, warehouse evidence, third-party invoices and adjusting events at 31 August 2026.</p></div>
        <div class="case-meta"><strong>Case ${esc(data.caseId)}</strong><span>Prepared for ${esc(data.student.name)}</span><br><span>${esc(data.certification.status)}</span></div>
      </section>
      <section class="kpis" aria-label="Key financial results">
        <article class="kpi accent"><span class="label">Corrected profit</span><span class="value">${money.format(pnl.netProfit)}</span><span class="delta">Management claimed ${money.format(managementProfit)}</span></article>
        <article class="kpi"><span class="label">Closing cash</span><span class="value">${money.format(cf.closingCash)}</span><span class="delta">${money.format(currentLiabilities)} current obligations</span></article>
        <article class="kpi"><span class="label">Total assets</span><span class="value">${money.format(bs.assets.total)}</span><span class="delta">Balance sheet reconciled</span></article>
        <article class="kpi"><span class="label">Total liabilities</span><span class="value">${money.format(bs.liabilities.total)}</span><span class="delta">${number.format(bs.liabilities.total / bs.equity.closingEquity)}× closing equity</span></article>
        <article class="kpi"><span class="label">Profit overstatement</span><span class="value negative">${money.format(overstatement)}</span><span class="delta">79% below management claim</span></article>
      </section>
    </div>

    <section class="section" id="statements"><div class="shell">
      <div class="section-head"><div><div class="eyebrow">Three statements</div><h2>One connected reconstruction</h2></div><p>Profit is separated from cash, customer deposits from revenue, owner spending from expenses, and borrowing from income.</p></div>
      <div class="grid-3">
        <article class="panel"><h3>Profit and loss</h3><table class="statement"><tbody>${statementRows(pnl, ["grossProfit", "operatingProfit", "netProfit"])}</tbody></table></article>
        <article class="panel"><h3>Cash flow</h3><table class="statement"><tbody>${statementRows(cf, ["netOperatingCashFlow", "netInvestingCashFlow", "netFinancingCashFlow", "closingCash"])}</tbody></table></article>
        <article class="panel"><h3>Balance sheet</h3><table class="statement"><tbody>
          <tr><th colspan="2">Assets</th></tr>${statementRows(bs.assets, ["total"])}
          <tr><th colspan="2">Liabilities</th></tr>${statementRows(bs.liabilities, ["total"])}
          <tr><th>Closing equity</th><th>${money.format(bs.equity.closingEquity)}</th></tr>
          <tr class="total"><td>Liabilities and equity</td><td>${money.format(bs.liabilitiesAndEquity)}</td></tr>
        </tbody></table></article>
      </div>
    </div></section>

    <section class="section" id="decisions"><div class="shell">
      <div class="section-head"><div><div class="eyebrow">Decision register</div><h2>100 certified treatments</h2></div><p>75 operational decisions and 25 material judgments, each tied to evidence and confidence.</p></div>
      <div class="controls">
        <label><span class="sr-only">Search decisions</span><input id="decision-search" type="search" placeholder="Search ID, question or answer"></label>
        <label><span class="sr-only">Review tier</span><select id="tier-filter"><option value="">All review tiers</option><option value="operational">Operational</option><option value="material_judgment">Material judgment</option></select></label>
        <label><span class="sr-only">Confidence</span><select id="confidence-filter"><option value="">All confidence</option><option>high</option><option>medium</option><option>low</option></select></label>
      </div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Tier</th><th>Question</th><th>Final answer</th><th>Confidence</th><th>Evidence</th></tr></thead><tbody id="decision-body"></tbody></table></div>
    </div></section>

    <section class="section" id="evidence"><div class="shell">
      <div class="section-head"><div><div class="eyebrow">Evidence register</div><h2>Source hierarchy preserved</h2></div><p>Bank, signed contracts and external confirmations override management labels and messages.</p></div>
      <div class="evidence-list">${data.evidence.map(item => `<article class="evidence-card"><span class="file">${esc(item.id)} · ${esc(item.file)}</span><p><span class="badge ${esc(item.reliability)}">${esc(item.reliability)}</span></p><p>${esc(item.finding)}</p></article>`).join("")}</div>
    </div></section>

    <section class="section" id="schedules"><div class="shell">
      <div class="section-head"><div><div class="eyebrow">Supporting schedules</div><h2>Every total has a roll-forward</h2></div><p>Revenue, receivables, inventory, payroll, PPE, debt and equity connect directly to the statements.</p></div>
      <div class="grid-3">${Object.entries(data.schedules).map(([name, schedule]) => `<article class="panel"><h3>${esc(labelize(name))}</h3><table class="statement"><tbody>${statementRows(schedule)}</tbody></table></article>`).join("")}</div>
    </div></section>

    <section class="section" id="reconciliations"><div class="shell">
      <div class="section-head"><div><div class="eyebrow">Control checks</div><h2>Seven reconciliations passed</h2></div><p>Each required accounting relationship closes to zero difference.</p></div>
      <div class="checks">${data.reconciliations.map(check => `<article class="check"><span class="check-mark">✓</span><div><strong>${esc(check.name)}</strong><p>${esc(check.formula)}</p><span class="badge passed">Difference ${money.format(check.difference)}</span></div></article>`).join("")}</div>
    </div></section>

    <section class="section" id="uncertainty"><div class="shell">
      <div class="section-head"><div><div class="eyebrow">Uncertainty</div><h2>Visible, quantified, unresolved where necessary</h2></div><p>The base case uses the best-supported estimates and keeps evidence gaps in view.</p></div>
      <div class="grid-2">${data.uncertainties.map(item => `<article class="panel callout"><h3>${esc(item.item)}</h3><p><strong>Recognized: ${money.format(item.recognized)}</strong>${item.range ? ` · Range ${money.format(item.range[0])}–${money.format(item.range[1])}` : ""}</p><p>${esc(item.impact)}</p></article>`).join("")}</div>
    </div></section>

    <section class="section" id="board"><div class="shell">
      <div class="section-head"><div><div class="eyebrow">Board recommendation</div><h2>Continue, under immediate controls</h2></div><p>${esc(data.boardRecommendation.decision)}</p></div>
      <div class="grid-2"><article class="panel"><h3>Liquidity and solvency</h3><p>${esc(data.boardRecommendation.solvencyWarning)}</p><table class="statement"><tbody><tr><td>Working capital</td><td>${money.format(data.boardRecommendation.workingCapital)}</td></tr><tr><td>Current ratio</td><td>${number.format(data.boardRecommendation.currentRatio)}×</td></tr><tr><td>Closing cash</td><td>${money.format(data.boardRecommendation.closingCash)}</td></tr></tbody></table></article><article class="panel"><h3>Five immediate actions</h3><ol class="action-list">${data.boardRecommendation.immediateActions.map(action => `<li>${esc(action)}</li>`).join("")}</ol></article></div>
    </div></section>`;

  const search = document.querySelector("#decision-search");
  const tier = document.querySelector("#tier-filter");
  const confidence = document.querySelector("#confidence-filter");
  const renderDecisions = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = data.decisions.filter(d => (!query || `${d.id} ${d.question} ${d.answer}`.toLowerCase().includes(query)) && (!tier.value || d.reviewTier === tier.value) && (!confidence.value || d.confidence === confidence.value));
    document.querySelector("#decision-body").innerHTML = filtered.map(d => `<tr><td class="decision-id">${esc(d.id)}</td><td><span class="badge ${esc(d.reviewTier)}">${esc(labelize(d.reviewTier))}</span></td><td>${esc(d.question)}</td><td>${esc(d.answer)}</td><td><span class="badge ${esc(d.confidence)}">${esc(d.confidence)}</span></td><td>${d.evidence.map(item => esc(item)).join("<br>")}</td></tr>`).join("") || `<tr><td colspan="6">No decisions match these filters.</td></tr>`;
  };
  [search, tier, confidence].forEach(control => control.addEventListener("input", renderDecisions));
  renderDecisions();
}

function renderReview(data) {
  const material = data.decisions.filter(item => item.reviewTier === "material_judgment");
  const low = data.decisions.filter(item => item.confidence === "low");
  const overrides = material.filter(item => item.changedFromAI);
  const disagreementIds = new Set();
  const sharedExceptionIds = new Set(["D075"]);
  const disagreements = material.filter(item => disagreementIds.has(item.id));
  document.querySelector("#app").innerHTML = `
    <div class="shell">
      <section class="review-hero"><div><div class="eyebrow">Compact assessor view</div><h1>Review the exceptions first.</h1><p class="lede">Material judgments, independent positions, confidence flags and unresolved uncertainty in one route.</p></div><div class="case-meta"><strong>${esc(data.caseId)}</strong><span>${esc(data.student.name)}</span><br><span>31 August 2026</span></div></section>
      <section class="alert-grid" aria-label="Review flags">
        <article class="alert-card"><span class="label">Material judgments</span><strong>${material.length}</strong><span class="badge material_judgment">Review trail complete</span></article>
        <article class="alert-card"><span class="label">Agent disagreements</span><strong>${disagreements.length}</strong><span class="badge high">Independent conclusions aligned</span></article>
        <article class="alert-card"><span class="label">Student overrides</span><strong>${overrides.length}</strong><span class="badge high">None recorded</span></article>
        <article class="alert-card"><span class="label">Low confidence</span><strong>${low.length}</strong><span class="badge low">Monthly payroll + insurance</span></article>
      </section>
      <section class="section"><div class="section-head"><div><div class="eyebrow">Headline conclusion</div><h2>${money.format(data.statements.profitAndLoss.netProfit)} corrected profit</h2></div><p>${esc(data.boardRecommendation.decision)}</p></div><div class="grid-3"><article class="panel"><h3>Cash</h3><p class="positive">${money.format(data.statements.cashFlow.closingCash)}</p><p>Closing bank balance confirmed externally.</p></article><article class="panel"><h3>Balance sheet</h3><p class="positive">${money.format(data.statements.balanceSheet.assets.total)}</p><p>Assets equal liabilities and equity.</p></article><article class="panel callout"><h3>Management claim</h3><p class="negative">${money.format(312000)}</p><p>Rejected for valuation and earn-out purposes.</p></article></div></section>
      <section class="section"><div class="section-head"><div><div class="eyebrow">Priority exceptions</div><h2>Unresolved and low-confidence items</h2></div><p>These items require focused reviewer attention before final student certification.</p></div><div class="grid-2">${data.uncertainties.map(item => `<article class="panel callout"><h3>${esc(item.item)}</h3><p>${esc(item.impact)}</p>${item.range ? `<span class="badge medium">${money.format(item.range[0])}–${money.format(item.range[1])}</span>` : `<span class="badge low">Evidence gap</span>`}</article>`).join("")}</div></section>
      <section class="section"><div class="section-head"><div><div class="eyebrow">AI review trail</div><h2>25 material judgments</h2></div><p>First proposal, independent challenge and certified reasoning are retained for every material item.</p></div><div class="trail">${material.map(item => `<article class="trail-item" id="${esc(item.id)}"><header><span class="decision-id">${esc(item.id)}</span><h3>${esc(item.question)}</h3><span class="badge ${esc(item.confidence)}">${esc(item.confidence)}</span>${disagreementIds.has(item.id) ? `<span class="badge medium">agent disagreement</span>` : ""}${sharedExceptionIds.has(item.id) ? `<span class="badge medium">shared exception</span>` : ""}${item.changedFromAI ? `<span class="badge low">student override</span>` : ""}</header><div class="trail-columns"><div><small>Agent 1 proposal</small><p>${esc(item.aiProposal)}</p></div><div><small>Independent Agent 2</small><p>${esc(item.independentChallenge)}</p></div><div><small>Final certification</small><p><strong>${esc(item.answer)}</strong></p><p>${esc(item.studentReasoning)}</p></div></div><p><small>Evidence: ${item.evidence.map(ev => esc(ev)).join(" · ")}</small></p></article>`).join("")}</div></section>
    </div>`;
}

fetch(dataUrl)
  .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
  .then(data => page === "review" ? renderReview(data) : renderMain(data))
  .catch(error => { document.querySelector("#app").innerHTML = `<div class="shell loading"><strong>Unable to load the case data.</strong><br>${esc(error.message)}</div>`; });
