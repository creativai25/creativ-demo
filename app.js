// ============================================
//   CREATIV AI — DEMO LOGIC v2.0
//   Clean, documented code for dev handoff
// ============================================

// ── Global State ──────────────────────────────
const state = {
  // Step 1
  selectedSector: null,

  // Step 2 – Block 1: Fleet
  vehicleCount: 100,
  kmPerMonth: 8000,
  tipoVeiculo: "caminhao_pesado",
  turnos: 1,

  // Step 2 – Block 2: Safety & Tech
  usaTelemetria: "nao",
  acidentes6meses: "nenhum",

  // Step 2 – Block 3: Operational Context
  desafio: "acidentes",
  regiao: "Sudeste",
  frotaPropria: "propria",
  temMeta: "nao",

  // Computed scores (0–100, higher = better)
  scores: { seguranca: 0, eficiencia: 0, compliance: 0, produtividade: 0 },

  // Chart instance
  radarChartInstance: null,
};

// ── DOM References ─────────────────────────────
const step1El  = document.getElementById("step1");
const step2El  = document.getElementById("step2");
const step3El  = document.getElementById("step3");
const btnStep1 = document.getElementById("btnStep1");
const btnStep2 = document.getElementById("btnStep2");
const btnBack2 = document.getElementById("btnBack2");
const btnRestart = document.getElementById("btnRestart");
const loadingState = document.getElementById("loadingState");
const resultState  = document.getElementById("resultState");

// ── STEP 1: Sector Selection ────────────────────
document.querySelectorAll(".sector-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sector-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.selectedSector = btn.dataset.sector;
    btnStep1.disabled = false;
  });
});

btnStep1.addEventListener("click", () => {
  if (!state.selectedSector) return;
  goToStep(2);
});

// ── STEP 2: Operation Form ──────────────────────

// -- Vehicle Count Slider (step=1 up to 100, step=10 above 100)
const vehicleInput = document.getElementById("vehicleCount");
const vehicleVal   = document.getElementById("vehicleCountVal");

vehicleInput.addEventListener("input", () => {
  let val = parseInt(vehicleInput.value);
  if (val > 100) val = Math.round(val / 10) * 10;   // snap to multiples of 10 above 100
  state.vehicleCount = val;
  vehicleVal.textContent = val.toLocaleString("pt-BR");
});

// -- KM per Month Slider
const kmInput = document.getElementById("kmPerMonth");
const kmVal   = document.getElementById("kmPerMonthVal");

kmInput.addEventListener("input", () => {
  state.kmPerMonth = parseInt(kmInput.value);
  kmVal.textContent = state.kmPerMonth.toLocaleString("pt-BR");
});

// -- Generic toggle group helper
function bindToggleGroup(groupId, stateKey) {
  document.querySelectorAll(`#${groupId} .toggle-btn`).forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(`#${groupId} .toggle-btn`).forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state[stateKey] = btn.dataset.value;
    });
  });
}

bindToggleGroup("tipoVeiculoGroup", "tipoVeiculo");
bindToggleGroup("turnosGroup",      "turnos");
bindToggleGroup("telemetriaGroup",  "usaTelemetria");
bindToggleGroup("acidentesGroup",   "acidentes6meses");
bindToggleGroup("desafioGroup",     "desafio");
bindToggleGroup("regiaoGroup",      "regiao");
bindToggleGroup("frotaGroup",       "frotaPropria");
bindToggleGroup("metaGroup",        "temMeta");

btnBack2.addEventListener("click", () => goToStep(1));
btnStep2.addEventListener("click", () => { goToStep(3); runAIDiagnosis(); });

btnRestart.addEventListener("click", () => resetDemo());

// ── Step Navigation ─────────────────────────────
function goToStep(step) {
  state.currentStep = step;
  step1El.classList.toggle("hidden", step !== 1);
  step2El.classList.toggle("hidden", step !== 2);
  step3El.classList.toggle("hidden", step !== 3);
  updateProgress(step);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateProgress(step) {
  const dots  = ["dot1", "dot2", "dot3"].map((id) => document.getElementById(id));
  const lines = ["line1", "line2"].map((id) => document.getElementById(id));

  dots.forEach((dot, i) => {
    dot.classList.remove("active", "completed");
    if (i + 1 < step)      dot.classList.add("completed");
    else if (i + 1 === step) dot.classList.add("active");
  });

  lines.forEach((line, i) => line.classList.toggle("active", step > i + 1));
}

// ── STEP 3: AI Diagnosis ────────────────────────
async function runAIDiagnosis() {
  loadingState.classList.remove("hidden");
  resultState.classList.add("hidden");

  // Animate loading steps
  const loadSteps = document.querySelectorAll(".loading-step");
  for (let i = 0; i < loadSteps.length; i++) {
    await delay(900 + i * 800);
    loadSteps[i].classList.add("visible");
  }
  await delay(600);

  // Calculate KPIs and 4D scores
  const sectorData = CONFIG.SECTORS[state.selectedSector];
  const kpis       = calculateKPIs(sectorData);
  const scores     = calculateScores();
  state.scores     = scores;

  // Fetch AI insights (Gemini) or use fallback
  let insights = [];
  try {
    insights = await fetchGeminiInsights(sectorData, kpis, scores);
  } catch (err) {
    console.warn("Gemini API unavailable, using fallback:", err);
    insights = getFallbackInsights(state.selectedSector, kpis);
  }

  // Populate all DOM values BEFORE revealing the section (avoids race conditions)
  renderResults(sectorData, kpis, scores, insights);

  // Small paint delay so browser can render Chart.js before revealing
  await delay(150);

  loadingState.classList.add("hidden");
  resultState.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── KPI Calculator ──────────────────────────────
function calculateKPIs(sectorData) {
  const { accidentRate, fuelWaste, costPerVehicle } = sectorData.benchmarks;
  const v  = state.vehicleCount;
  const km = state.kmPerMonth;
  const t  = parseInt(state.turnos);

  // Accident multipliers based on user inputs
  const accidentMultiplier =
    (state.acidentes6meses === "nenhum"    ? 0.6 :
     state.acidentes6meses === "1_a_5"     ? 1.0 :
     state.acidentes6meses === "6_a_15"    ? 1.4 : 1.9);

  const telemetriaDiscount =
    (state.usaTelemetria === "nao"      ? 1.0 :
     state.usaTelemetria === "basico"   ? 0.7 : 0.45);

  const monthlyAccidents = Math.max(1, Math.round(v * accidentRate * t * accidentMultiplier * telemetriaDiscount));

  // Savings calculation
  const monthlyFuelCost = v * km * 0.65;
  const fuelSaving      = monthlyFuelCost * fuelWaste * 0.7;
  const idleSaving      = v * costPerVehicle * 0.22 * 0.5;
  const accidentSaving  = monthlyAccidents * 15000 * 0.6;
  const totalSaving     = Math.round(fuelSaving + idleSaving + accidentSaving);

  // Risk score (0–100, higher = riskier)
  const riskScore = Math.min(95, Math.round(
    (accidentMultiplier * 20) +
    (t === 3 ? 20 : t === 2 ? 10 : 5) +
    (state.usaTelemetria === "nao" ? 25 : state.usaTelemetria === "basico" ? 12 : 0) +
    (state.tipoVeiculo === "maquinario_pesado" ? 15 : state.tipoVeiculo === "caminhao_pesado" ? 10 : 5) +
    (state.frotaPropria === "terceirizada" ? 10 : 0)
  ));

  const reductionPercent = Math.round(38 + Math.random() * 22);

  return { monthlyAccidents, totalSaving, reductionPercent, riskScore };
}

// ── 4D Score Calculator ─────────────────────────
// Returns scores 0–100 where HIGHER = better
function calculateScores() {
  // --- Segurança (inverted risk) ---
  let segurancaBase = 70;
  if (state.acidentes6meses === "mais_de_15") segurancaBase -= 35;
  else if (state.acidentes6meses === "6_a_15") segurancaBase -= 20;
  else if (state.acidentes6meses === "1_a_5")  segurancaBase -= 10;
  if (state.usaTelemetria === "avancado")      segurancaBase += 15;
  else if (state.usaTelemetria === "basico")   segurancaBase += 5;
  if (state.turnos == 3)                        segurancaBase -= 10;
  const seguranca = clamp(segurancaBase, 5, 95);

  // --- Eficiência ---
  let eficienciaBase = 60;
  if (state.usaTelemetria === "nao")           eficienciaBase -= 20;
  else if (state.usaTelemetria === "avancado") eficienciaBase += 15;
  if (state.desafio === "combustivel")          eficienciaBase -= 10;
  if (state.frotaPropria === "propria")         eficienciaBase += 10;
  const eficiencia = clamp(eficienciaBase, 5, 95);

  // --- Compliance ---
  let complianceBase = 55;
  if (state.temMeta === "sim")               complianceBase += 20;
  if (state.usaTelemetria !== "nao")          complianceBase += 15;
  if (state.desafio === "compliance")         complianceBase -= 15;
  if (state.frotaPropria === "terceirizada")  complianceBase -= 10;
  const compliance = clamp(complianceBase, 5, 95);

  // --- Produtividade ---
  let produtividadeBase = 65;
  if (state.desafio === "produtividade")     produtividadeBase -= 15;
  if (state.usaTelemetria === "avancado")    produtividadeBase += 15;
  if (state.turnos == 3)                      produtividadeBase += 10;
  if (state.tipoVeiculo === "frota_leve")    produtividadeBase += 5;
  const produtividade = clamp(produtividadeBase, 5, 95);

  return { seguranca, eficiencia, compliance, produtividade };
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, Math.round(val)));
}

// ── Render Results (synchronous – called BEFORE section is revealed) ──────────
function renderResults(sectorData, kpis, scores, insights) {
  // Sector title
  document.getElementById("resultSector").textContent = `da frota de ${sectorData.label}`;

  // KPI values (CSS transition on .kpi-card.visible handles entrance animation)
  document.getElementById("kpiAccidents").textContent = kpis.monthlyAccidents;
  document.getElementById("kpiSavings").textContent   = `R$ ${kpis.totalSaving.toLocaleString("pt-BR")}`;
  document.getElementById("kpiReduction").textContent = `${kpis.reductionPercent}%`;
  ["kpi1", "kpi2", "kpi3"].forEach((id) => document.getElementById(id).classList.add("visible"));

  // Risk score ring (CSS transition on stroke-dashoffset handles animation)
  const score  = kpis.riskScore;
  const offset = 314 - (314 * score) / 100;
  const fill   = document.getElementById("scoreFill");
  document.getElementById("scoreValue").textContent = score;

  let color, statusText, statusBg;
  if (score >= 70)      { color = "#ff3d57"; statusText = "Alto Risco";       statusBg = "rgba(255,61,87,0.12)"; }
  else if (score >= 45) { color = "#ff9100"; statusText = "Risco Moderado";   statusBg = "rgba(255,145,0,0.12)"; }
  else                  { color = "#00e676"; statusText = "Risco Controlado"; statusBg = "rgba(0,230,118,0.12)"; }

  fill.style.stroke           = color;
  fill.style.strokeDashoffset = offset;
  const statusEl              = document.getElementById("scoreStatus");
  statusEl.textContent        = statusText;
  statusEl.style.color        = color;
  statusEl.style.background   = statusBg;

  // Radar chart — Chart.js has its own built-in 1200ms entrance animation
  try {
    drawRadarChart(scores);
  } catch (err) {
    console.warn("Chart.js failed to load or render:", err);
  }

  // Insights
  const container = document.getElementById("insightsContent");
  container.innerHTML = "";
  try {
    if (!Array.isArray(insights)) throw new Error("Insights is not an array");
    insights.forEach((insight, i) => {
      const item = document.createElement("div");
      item.className = "insight-item";
      item.style.animationDelay = `${i * 0.15}s`;
      item.innerHTML = `<div class="insight-bullet">${insight.icon || "💡"}</div>
                        <div class="insight-text">${insight.text}</div>`;
      container.appendChild(item);
    });
  } catch (err) {
    console.warn("Failed to render insights:", err);
    container.innerHTML = `<div class="insight-item"><div class="insight-text">Erro ao carregar insights da IA. Tente novamente mais tarde.</div></div>`;
  }
}

// ── Radar Chart (Chart.js) ──────────────────────
function drawRadarChart(scores) {
  const ctx = document.getElementById("radarChart").getContext("2d");

  // Destroy previous instance if exists
  if (state.radarChartInstance) state.radarChartInstance.destroy();

  const withAI = {
    seguranca:    clamp(scores.seguranca    + 25, 0, 100),
    eficiencia:   clamp(scores.eficiencia   + 22, 0, 100),
    compliance:   clamp(scores.compliance   + 28, 0, 100),
    produtividade:clamp(scores.produtividade+ 20, 0, 100),
  };

  state.radarChartInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Segurança", "Eficiência", "Compliance", "Produtividade"],
      datasets: [
        {
          label: "Situação Atual",
          data: [scores.seguranca, scores.eficiencia, scores.compliance, scores.produtividade],
          backgroundColor: "rgba(255, 61, 87, 0.12)",
          borderColor: "#ff3d57",
          borderWidth: 2,
          pointBackgroundColor: "#ff3d57",
          pointRadius: 4,
        },
        {
          label: "Com Creativ AI",
          data: [withAI.seguranca, withAI.eficiencia, withAI.compliance, withAI.produtividade],
          backgroundColor: "rgba(0, 168, 255, 0.12)",
          borderColor: "#00a8ff",
          borderWidth: 2,
          pointBackgroundColor: "#00a8ff",
          pointRadius: 4,
          borderDash: [5, 3],
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 1200, easing: "easeInOutQuart" },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { stepSize: 25, display: false },
          grid: { color: "rgba(255,255,255,0.07)" },
          angleLines: { color: "rgba(255,255,255,0.07)" },
          pointLabels: { color: "#8b9ac0", font: { size: 12, family: "Inter", weight: "600" } },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}/100`,
          },
        },
      },
    },
  });
}

// ── Gemini API ──────────────────────────────────
async function fetchGeminiInsights(sectorData, kpis, scores) {
  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "SUA_GEMINI_API_KEY_AQUI") {
    throw new Error("API Key not configured");
  }

  const prompt = `
Você é um consultor sênior de segurança e eficiência de frotas industriais da Creativ AI Soluções.
Gere EXATAMENTE 4 insights estratégicos curtos e impactantes em português para o seguinte perfil de frota:

DADOS DO PROSPECT:
- Setor: ${sectorData.label}
- Veículos: ${state.vehicleCount} | Tipo: ${state.tipoVeiculo}
- Km/mês por veículo: ${state.kmPerMonth.toLocaleString("pt-BR")}
- Turnos: ${state.turnos} | Região: ${state.regiao}
- Telemetria atual: ${state.usaTelemetria}
- Acidentes nos últimos 6 meses: ${state.acidentes6meses}
- Principal desafio: ${state.desafio}
- Frota: ${state.frotaPropria} | Meta de acidentes: ${state.temMeta}

DIAGNÓSTICO DA IA:
- Score de Risco: ${kpis.riskScore}/100
- Incidentes estimados/mês: ${kpis.monthlyAccidents}
- Economia potencial/mês: R$ ${kpis.totalSaving.toLocaleString("pt-BR")}
- Scores: Segurança ${scores.seguranca}/100 | Eficiência ${scores.eficiencia}/100 | Compliance ${scores.compliance}/100 | Produtividade ${scores.produtividade}/100

Regras para os insights:
1. Específico para o setor ${sectorData.label} e os dados acima
2. Mencione como telemetria, videomonitoramento ou IA da Creativ resolve o problema
3. Use números reais do diagnóstico acima para tornar o insight concreto
4. Máximo 2 linhas por insight
5. Linguagem de negócios, sem jargão técnico excessivo

Retorne SOMENTE JSON válido:
[
  {"icon": "emoji", "text": "texto com <strong>palavras-chave</strong> em negrito"},
  {"icon": "emoji", "text": "..."},
  {"icon": "emoji", "text": "..."},
  {"icon": "emoji", "text": "..."}
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: 900 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);

  const data = await res.json();
  const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Extract JSON from response (handles markdown code blocks)
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Invalid JSON response from Gemini");
  return JSON.parse(jsonMatch[0]);
}

// ── Fallback Insights ───────────────────────────
function getFallbackInsights(sector, kpis) {
  const map = {
    logistica: [
      { icon: "🚨", text: `Com <strong>${kpis.monthlyAccidents} incidentes estimados/mês</strong>, o risco operacional está acima do aceitável. O videomonitoramento com detecção de fadiga pode reduzir este número em até <strong>${kpis.reductionPercent}%</strong>.` },
      { icon: "⛽", text: `O monitoramento via <strong>barramento CAN</strong> identifica padrões de aceleração brusca e marcha lenta excessiva, reduzindo o consumo de combustível entre <strong>15% e 22%</strong> em frotas de logística.` },
      { icon: "📍", text: `A <strong>Reconstrução de Rotas</strong> com análise de IA identifica trajetos ineficientes e desacordos com as rotas aprovadas, garantindo compliance operacional em tempo real.` },
      { icon: "💰", text: `A economia potencial estimada é de <strong>R$ ${kpis.totalSaving.toLocaleString("pt-BR")}/mês</strong>, considerando combustível, manutenção preventiva e redução de sinistros.` },
    ],
    mineracao: [
      { icon: "⛏️", text: `Com <strong>${state.vehicleCount} veículos</strong> operando em ${state.turnos} turno(s), o risco de fadiga do operador é crítico. A IA embarcada detecta bocejos e fechamento de olhos em <strong>tempo real</strong>.` },
      { icon: "🛡️", text: `O sistema de <strong>Inteligência de Segurança no Local</strong> detecta proximidade de pessoas a veículos em movimento e ausência de EPI, prevenindo os acidentes mais graves da mineração.` },
      { icon: "📊", text: `Score de Risco <strong>${kpis.riskScore}/100</strong> indica necessidade imediata de intervenção. A Raízen reduziu seus indicadores em mais de <strong>50% em 6 meses</strong> com a solução Creativ AI.` },
      { icon: "💰", text: `Cada acidente grave em mineração custa em média <strong>R$ 85.000</strong> entre indenizações e paradas operacionais. A IA preditiva é o investimento com maior ROI do setor.` },
    ],
    utilities: [
      { icon: "⚡", text: `Frotas de utilities operam em áreas urbanas de alto risco. O <strong>ADAS</strong> alerta desvios de faixa e riscos de colisão em tempo real para os <strong>${state.vehicleCount} veículos</strong> da sua operação.` },
      { icon: "📋", text: `O compliance regulatório de concessionárias exige relatórios detalhados. Nossa IA gera os <strong>relatórios de segurança automaticamente</strong>, eliminando horas de trabalho manual.` },
      { icon: "🗺️", text: `Com <strong>Cercas Geográficas Embarcadas</strong>, você recebe alertas quando veículos saem das áreas autorizadas ou excedem velocidade em zonas críticas da concessão.` },
      { icon: "💰", text: `Economia potencial de <strong>R$ ${kpis.totalSaving.toLocaleString("pt-BR")}/mês</strong> — equivale ao custo de uma equipe inteira de analistas de frota, mas com monitoramento <strong>24h por dia</strong>.` },
    ],
  };

  return map[sector] || map["logistica"];
}

// ── Lead Capture → Supabase ─────────────────────
document.getElementById("btnSubmitLead").addEventListener("click", async () => {
  const name    = document.getElementById("leadName").value.trim();
  const email   = document.getElementById("leadEmail").value.trim();
  const company = document.getElementById("leadCompany").value.trim();

  if (!name || !email || !company) {
    showToast("⚠️ Preencha todos os campos para continuar", "#ff9100");
    return;
  }

  const btn = document.getElementById("btnSubmitLead");
  btn.textContent = "Enviando...";
  btn.disabled    = true;

  const leadData = {
    nome:                           name,
    email:                          email,
    empresa:                        company,
    setor:                          state.selectedSector,
    tipo_veiculo:                   state.tipoVeiculo,
    quantidade_veiculos:            state.vehicleCount,
    km_por_mes:                     state.kmPerMonth,
    turnos:                         parseInt(state.turnos),
    usa_telemetria:                 state.usaTelemetria,
    acidentes_6meses:               state.acidentes6meses,
    desafio_principal:              state.desafio,
    regiao:                         state.regiao,
    frota_propria:                  state.frotaPropria,
    tem_meta_acidentes:             state.temMeta,
    score_risco:                    parseInt(document.getElementById("scoreValue").textContent) || null,
    score_eficiencia:               state.scores.eficiencia || null,
    score_compliance:               state.scores.compliance || null,
    score_produtividade:            state.scores.produtividade || null,
    economia_estimada_mes:          parseNumeric(document.getElementById("kpiSavings").textContent),
    reducao_acidentes_estimada_pct: parseInt((document.getElementById("kpiReduction").textContent || "0").replace("%", "")) || null,
    fonte:                          "demo-creativ-ia",
  };

  // 1. Save to Supabase
  let supabaseOk = false;
  if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/demo_leads`, {
        method: "POST",
        headers: {
          "apikey":       CONFIG.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer":       "return=minimal",
        },
        body: JSON.stringify(leadData),
      });
      if (res.ok || res.status === 201) {
        supabaseOk = true;
        console.log("✅ Lead saved to Supabase.");
      } else {
        console.warn("⚠️ Supabase error:", res.status, await res.text());
      }
    } catch (err) {
      console.warn("⚠️ Supabase connection error:", err);
    }
  }

  // 2. n8n webhook (optional)
  if (CONFIG.N8N_WEBHOOK_URL) {
    try {
      await fetch(CONFIG.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
    } catch (err) {
      console.warn("⚠️ n8n webhook error:", err);
    }
  }

  // 3. Visual feedback
  btn.textContent  = "✅ Recebemos! Entraremos em contato em breve.";
  btn.style.background = "linear-gradient(135deg, #00e676, #00bcd4)";
  showToast(supabaseOk ? "✅ Lead registrado! Nossa equipe entrará em contato." : "✅ Recebemos sua solicitação!", "#00e676");
  console.log("Lead captured:", leadData);
});

// ── Demo Reset ──────────────────────────────────
function resetDemo() {
  Object.assign(state, {
    selectedSector: null, vehicleCount: 100, kmPerMonth: 8000,
    tipoVeiculo: "caminhao_pesado", turnos: 1,
    usaTelemetria: "nao", acidentes6meses: "nenhum",
    desafio: "acidentes", regiao: "Sudeste",
    frotaPropria: "propria", temMeta: "nao",
  });

  document.querySelectorAll(".sector-btn").forEach((b) => b.classList.remove("selected"));
  btnStep1.disabled = true;

  document.getElementById("vehicleCount").value = 100;
  vehicleVal.textContent = "100";
  document.getElementById("kmPerMonth").value = 8000;
  kmVal.textContent = "8.000";

  document.getElementById("leadName").value    = "";
  document.getElementById("leadEmail").value   = "";
  document.getElementById("leadCompany").value = "";

  const submitBtn = document.getElementById("btnSubmitLead");
  submitBtn.textContent    = "Quero a demonstração real →";
  submitBtn.style.background = "";
  submitBtn.disabled       = false;

  resultState.classList.add("hidden");
  loadingState.classList.remove("hidden");
  document.querySelectorAll(".loading-step").forEach((s) => s.classList.remove("visible"));

  if (state.radarChartInstance) {
    state.radarChartInstance.destroy();
    state.radarChartInstance = null;
  }

  goToStep(1);
}

// ── Utilities ───────────────────────────────────
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

function showToast(msg, color = "#00e676") {
  const toast   = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  toastMsg.textContent   = msg;
  toast.style.borderColor = color;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4000);
}

function parseNumeric(text) {
  return parseFloat((text || "0").replace("R$ ", "").replace(/\./g, "").replace(",", ".")) || null;
}
