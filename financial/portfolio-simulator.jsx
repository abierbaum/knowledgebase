import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  RotateCcw,
  ChevronDown,
  Settings,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';

// ============================================================================
// Data definitions: edit these or use the in-app editors to prototype scenarios
// ============================================================================

const SCENARIOS = [
  {
    id: 'ai',
    label: 'AI productivity boom',
    desc: 'AI delivers real productivity gains, broad rally, tech leads, inflation cools',
    short: 'AI boom',
    default: 8,
    color: '#1F8F7A',
  },
  {
    id: 'refl',
    label: 'Reflation / re-acceleration',
    desc: 'Growth picks up, moderate inflation, weak dollar, international and value win',
    short: 'Reflation',
    default: 7,
    color: '#7F4FB8',
  },
  {
    id: 'sl',
    label: 'Soft landing',
    desc: 'Inflation cools, moderate equity gains, bonds stable',
    short: 'Soft landing',
    default: 10,
    color: '#3B6D11',
  },
  {
    id: 'sq',
    label: 'Status quo',
    desc: 'Tech-led growth continues, mild inflation, no recession',
    short: 'Status quo',
    default: 20,
    color: '#185FA5',
  },
  {
    id: 'tb',
    label: 'Tech bubble bursts',
    desc: 'Nasdaq -30%, broad market hit, defensives hold up',
    short: 'Tech burst',
    default: 15,
    color: '#A32D2D',
  },
  {
    id: 'rec',
    label: 'Broad recession',
    desc: 'US growth contracts, all equity drops, Fed cuts aggressively',
    short: 'Recession',
    default: 22,
    color: '#5F5E5A',
  },
  {
    id: 'stag',
    label: 'Stagflation',
    desc: 'Inflation persists, growth weak, TIPS and gold shine',
    short: 'Stagflation',
    default: 18,
    color: '#BA7517',
  },
];

const DEFAULT_TICKERS = {
  XLP: { name: 'Consumer Staples SPDR', category: 'us-factor', er: 0.09, purpose: 'Defensive US equity. Holds Procter & Gamble, Coca-Cola, Walmart. Designed to hold up in slowdowns, struggles in stagflation.', sq: 7, tb: 3, rec: -3, stag: -1, sl: 6, ai: 6, refl: 8 },
  VEA: { name: 'FTSE Developed Markets', category: 'intl', er: 0.06, purpose: 'International developed equity. Europe, Japan, UK, Australia. Diversifies away from US concentration.', sq: 13, tb: -5, rec: -12, stag: -2, sl: 11, ai: 15, refl: 22 },
  VNQ: { name: 'Real Estate', category: 'real', er: 0.13, purpose: 'US real estate (REITs). Inflation hedge in theory, rate-sensitive in practice. Pays dividend income.', sq: 8, tb: -3, rec: -10, stag: -5, sl: 11, ai: 18, refl: 12 },
  VWO: { name: 'FTSE Emerging Markets', category: 'intl', er: 0.07, purpose: 'Emerging market equity. China, India, Taiwan, Brazil. Higher growth but higher volatility than developed markets.', sq: 11, tb: -7, rec: -15, stag: -4, sl: 13, ai: 18, refl: 28 },
  GLDM: { name: 'Gold', category: 'real', er: 0.10, purpose: 'Physical gold. Inflation and currency debasement hedge. Tail-risk insurance. Pays no income.', sq: 5, tb: 15, rec: 10, stag: 20, sl: -5, ai: -10, refl: 12 },
  VWOB: { name: "EM Gov't Bonds", category: 'bond-long', er: 0.20, purpose: "Emerging market sovereign bonds in USD. High yield (~6%) but behaves more like a risk asset than safe haven.", sq: 6, tb: -3, rec: -7, stag: -3, sl: 5, ai: 4, refl: 5 },
  SCHD: { name: 'US Dividend', category: 'us-broad', er: 0.06, purpose: 'US large-cap dividend equity. Quality and value screen. Less tech-heavy than S&P 500.', sq: 11, tb: -2, rec: -8, stag: -1, sl: 11, ai: 14, refl: 18 },
  SCHP: { name: 'US TIPS', category: 'bond-long', er: 0.04, purpose: 'US Treasury Inflation-Protected Securities. Principal adjusts with CPI. Direct stagflation hedge.', sq: 3, tb: 3, rec: 5, stag: 8, sl: 2, ai: 1, refl: 4 },
  BND: { name: 'Total Bond', category: 'bond-long', er: 0.03, purpose: 'Investment-grade US bonds (Treasuries and corporates). Classic recession ballast and equity diversifier.', sq: 4, tb: 5, rec: 8, stag: -3, sl: 5, ai: 4, refl: -2 },
  SHV: { name: 'Short Treasury', category: 'bond-short', er: 0.15, purpose: 'Short-term US Treasuries (under 1 year). Cash equivalent paying near Fed funds rate. Dry powder for buying dips.', sq: 4, tb: 3, rec: 3, stag: 4, sl: 3, ai: 4, refl: 4 },
  GOOGL: { name: 'Alphabet', category: 'single', er: 0.00, purpose: 'Single-stock conviction play. Search, YouTube, Cloud, Waymo, AI. Higher reward, higher idiosyncratic risk than ETFs.', sq: 22, tb: -20, rec: -18, stag: -5, sl: 20, ai: 45, refl: 22 },
  VXUS: { name: 'Total International', category: 'intl', er: 0.05, purpose: 'All non-US equity in one fund. Combines VEA + VWO. Simpler than holding both separately.', sq: 12, tb: -6, rec: -13, stag: -3, sl: 11.5, ai: 16, refl: 24 },
  VTI: { name: 'Total US Stock Market', category: 'us-broad', er: 0.03, purpose: 'Most diversified US equity exposure (~3,700 stocks). Heavily tech-weighted by market cap.', sq: 14, tb: -12, rec: -15, stag: -4, sl: 13, ai: 25, refl: 15 },
  VOO: { name: 'S&P 500', category: 'us-broad', er: 0.03, purpose: 'Large-cap US equity benchmark. Similar to VTI but excludes small/mid-caps.', sq: 14, tb: -12, rec: -15, stag: -4, sl: 13, ai: 25, refl: 15 },
  QQQ: { name: 'Nasdaq-100', category: 'us-growth', er: 0.20, purpose: 'Concentrated in mega-cap tech and growth. Highest beta to AI thesis.', sq: 22, tb: -28, rec: -20, stag: -8, sl: 17, ai: 40, refl: 18 },
  VGT: { name: 'Vanguard Info Technology', category: 'us-growth', er: 0.09, purpose: 'Pure US tech sector (320 holdings). Even more tech-concentrated than QQQ. Highest beta to AI scenario.', sq: 24, tb: -30, rec: -22, stag: -10, sl: 18, ai: 45, refl: 17 },
  VUG: { name: 'Vanguard Growth', category: 'us-growth', er: 0.04, purpose: 'US large-cap growth (200 stocks). Broader than tech-only but growth-tilted. Cheapest growth exposure.', sq: 18, tb: -20, rec: -17, stag: -6, sl: 15, ai: 30, refl: 16 },
  VIG: { name: 'Vanguard Dividend Appreciation', category: 'us-broad', er: 0.05, purpose: 'US dividend growth screen. Quality companies raising dividends 10+ years. Less yield than SCHD, more growth tilt.', sq: 12, tb: -7, rec: -10, stag: -3, sl: 12, ai: 18, refl: 14 },
  AVUV: { name: 'Avantis US Small Cap Value', category: 'us-factor', er: 0.25, purpose: 'Small cap value factor exposure. Cheap, smaller US companies. Shines in reflation, hurts hard in recession.', sq: 15, tb: -15, rec: -20, stag: -8, sl: 14, ai: 22, refl: 25 },
  TLT: { name: '20+ Year Treasury', category: 'bond-long', er: 0.15, purpose: 'Long-duration US Treasuries. Strongest recession hedge in bonds. Very rate-sensitive (huge gain or loss).', sq: 2, tb: 10, rec: 20, stag: -8, sl: 7, ai: 3, refl: -10 },
  SGOV: { name: '0-3 Month Treasury', category: 'bond-short', er: 0.09, purpose: 'Ultra-short Treasuries (under 3 months). Effectively cash. Near-zero rate sensitivity. Pays current Fed funds rate.', sq: 4.5, tb: 4.5, rec: 3.5, stag: 4.5, sl: 4, ai: 4.5, refl: 4.5 },
  BIL: { name: '1-3 Month T-Bill', category: 'bond-short', er: 0.14, purpose: 'Almost identical to SGOV. Slightly higher fee but established track record. T-bill ladder in ETF form.', sq: 4.3, tb: 4.3, rec: 3.3, stag: 4.3, sl: 3.8, ai: 4.3, refl: 4.3 },
  JPST: { name: 'Ultra-Short Income', category: 'bond-short', er: 0.18, purpose: 'Active ultra-short bond fund (corp + Treasury). Small yield pickup over SGOV with slightly more credit risk.', sq: 5.0, tb: 4.0, rec: 2.5, stag: 4.5, sl: 4.5, ai: 5.0, refl: 5.0 },
  VGSH: { name: '1-3 Year Treasury', category: 'bond-short', er: 0.04, purpose: 'Short-duration Treasuries (1-3 years). Modest rate risk for slightly more yield than ultra-short. Stable.', sq: 4, tb: 5, rec: 6, stag: 2, sl: 4.5, ai: 4, refl: 2 },
};

const CATEGORIES = [
  { id: 'us-broad', label: 'US equity — Broad market & dividend' },
  { id: 'us-growth', label: 'US equity — Growth & tech' },
  { id: 'us-factor', label: 'US equity — Sector & factor' },
  { id: 'intl', label: 'International equity' },
  { id: 'single', label: 'Individual stocks' },
  { id: 'bond-long', label: 'Fixed income — Core & long duration' },
  { id: 'bond-short', label: 'Fixed income — Cash & short duration' },
  { id: 'real', label: 'Real assets & commodities' },
];

const DEFAULT_PORTFOLIOS = [
  {
    id: 'current',
    name: 'Current (legacy)',
    subtitle: 'Existing IRA, defensive thesis miscalibrated',
    weights: { XLP: 25, VEA: 23, VNQ: 20, VWO: 15, GLDM: 15, VWOB: 2 },
  },
  {
    id: 'conservative',
    name: 'Conservative',
    subtitle: 'Slightly more bearish than consensus',
    weights: { SCHP: 22, GLDM: 18, BND: 18, VEA: 15, SCHD: 12, VWO: 8, SHV: 7 },
  },
  {
    id: 'consensus7',
    name: 'Consensus core',
    subtitle: 'Aligned with current institutional consensus',
    weights: { VEA: 22, GLDM: 18, SCHP: 18, SCHD: 18, VWO: 10, BND: 8, GOOGL: 6 },
  },
  {
    id: 'optimistic',
    name: 'Optimistic',
    subtitle: 'Slightly more bullish than consensus',
    weights: { VTI: 25, VEA: 20, VGT: 15, SCHD: 12, GLDM: 10, BND: 10, GOOGL: 8 },
  },
  {
    id: 'nestegg',
    name: 'Nest egg',
    subtitle: 'Yield plus modest equity upside (6-18mo)',
    weights: { VGSH: 60, SCHD: 25, BND: 15 },
  },
];

// ============================================================================
// Helpers
// ============================================================================

function portfolioReturn(portfolio, scenarioId, tickers) {
  let total = 0;
  for (const [t, w] of Object.entries(portfolio.weights)) {
    if (tickers[t] && typeof tickers[t][scenarioId] === 'number') {
      total += (w / 100) * tickers[t][scenarioId];
    }
  }
  return total;
}

function weightedExpected(portfolio, probs, tickers) {
  const probSum = SCENARIOS.reduce((s, sc) => s + probs[sc.id], 0);
  if (probSum === 0) return 0;
  return SCENARIOS.reduce(
    (sum, sc) => sum + (probs[sc.id] / probSum) * portfolioReturn(portfolio, sc.id, tickers),
    0
  );
}

function portfolioWeightSum(p) {
  return Object.values(p.weights).reduce((s, w) => s + w, 0);
}

function tickerWeightedReturn(tickerData, probs) {
  if (!tickerData) return 0;
  const probSum = SCENARIOS.reduce((s, sc) => s + probs[sc.id], 0);
  if (probSum === 0) return 0;
  return SCENARIOS.reduce(
    (sum, sc) =>
      sum +
      (probs[sc.id] / probSum) *
        (typeof tickerData[sc.id] === 'number' ? tickerData[sc.id] : 0),
    0
  );
}

function portfolioWeightedER(portfolio, tickers) {
  let total = 0;
  let weight = 0;
  for (const [t, w] of Object.entries(portfolio.weights)) {
    if (tickers[t] && typeof tickers[t].er === 'number') {
      total += (w / 100) * tickers[t].er;
      weight += w / 100;
    }
  }
  return weight > 0 ? total / weight : 0;
}

function formatPct(v, decimals = 1) {
  return (v >= 0 ? '+' : '') + v.toFixed(decimals) + '%';
}

// ============================================================================
// Main component
// ============================================================================

export default function PortfolioSimulator() {
  const [probs, setProbs] = useState(() => {
    const init = {};
    SCENARIOS.forEach((s) => (init[s.id] = s.default));
    return init;
  });
  const [tickers, setTickers] = useState(DEFAULT_TICKERS);
  const [portfolios, setPortfolios] = useState(DEFAULT_PORTFOLIOS);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [showPortfolios, setShowPortfolios] = useState(false);
  const [editAssumptions, setEditAssumptions] = useState(false);
  const [editPortfolios, setEditPortfolios] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load persisted state on mount, merging with current defaults so new scenarios/tickers added in later versions get sensible values rather than NaN
  useEffect(() => {
    async function load() {
      if (!window.storage) {
        setLoaded(true);
        return;
      }
      try {
        const p = await window.storage.get('probs');
        if (p?.value) {
          const parsed = JSON.parse(p.value);
          const merged = {};
          SCENARIOS.forEach((s) => {
            merged[s.id] =
              typeof parsed[s.id] === 'number' ? parsed[s.id] : s.default;
          });
          const sum = Object.values(merged).reduce((a, b) => a + b, 0);
          if (sum !== 100) {
            SCENARIOS.forEach((s) => (merged[s.id] = s.default));
          }
          setProbs(merged);
        }
      } catch (e) {}
      try {
        const t = await window.storage.get('tickers');
        if (t?.value) {
          const parsed = JSON.parse(t.value);
          const merged = {};
          Object.keys(DEFAULT_TICKERS).forEach((ticker) => {
            merged[ticker] = { ...DEFAULT_TICKERS[ticker] };
            if (parsed[ticker]) {
              SCENARIOS.forEach((s) => {
                if (typeof parsed[ticker][s.id] === 'number') {
                  merged[ticker][s.id] = parsed[ticker][s.id];
                }
              });
            }
          });
          setTickers(merged);
        }
      } catch (e) {}
      try {
        const pf = await window.storage.get('portfolios');
        if (pf?.value) setPortfolios(JSON.parse(pf.value));
      } catch (e) {}
      setLoaded(true);
    }
    load();
  }, []);

  // Persist on change (after initial load)
  useEffect(() => {
    if (!loaded || !window.storage) return;
    window.storage.set('probs', JSON.stringify(probs)).catch(() => {});
  }, [probs, loaded]);
  useEffect(() => {
    if (!loaded || !window.storage) return;
    window.storage.set('tickers', JSON.stringify(tickers)).catch(() => {});
  }, [tickers, loaded]);
  useEffect(() => {
    if (!loaded || !window.storage) return;
    window.storage.set('portfolios', JSON.stringify(portfolios)).catch(() => {});
  }, [portfolios, loaded]);

  function setProb(id, newValue) {
    newValue = Math.max(0, Math.min(100, Math.round(newValue)));
    setProbs((prev) => {
      const old = prev[id];
      const delta = newValue - old;
      if (delta === 0) return prev;
      const next = { ...prev, [id]: newValue };
      const otherIds = SCENARIOS.map((s) => s.id).filter((o) => o !== id);
      const otherTotal = otherIds.reduce((s, o) => s + prev[o], 0);
      if (otherTotal === 0 && delta < 0) {
        const each = Math.round(-delta / otherIds.length);
        otherIds.forEach((o) => (next[o] = Math.max(0, each)));
      } else if (otherTotal > 0) {
        otherIds.forEach((o) => {
          next[o] = Math.max(0, Math.round(prev[o] - (delta * prev[o]) / otherTotal));
        });
      }
      let sum = SCENARIOS.reduce((s, sc) => s + next[sc.id], 0);
      if (sum !== 100) {
        const diff = 100 - sum;
        const sorted = otherIds.slice().sort((a, b) => next[b] - next[a]);
        for (const o of sorted) {
          if (next[o] + diff >= 0) {
            next[o] += diff;
            break;
          }
        }
      }
      return next;
    });
  }

  function resetProbs() {
    const init = {};
    SCENARIOS.forEach((s) => (init[s.id] = s.default));
    setProbs(init);
  }

  function resetTickers() {
    setTickers(DEFAULT_TICKERS);
  }

  function resetPortfolios() {
    setPortfolios(DEFAULT_PORTFOLIOS);
  }

  function updateTickerValue(ticker, scenarioId, value) {
    const parsed = parseFloat(value);
    setTickers((prev) => ({
      ...prev,
      [ticker]: { ...prev[ticker], [scenarioId]: isNaN(parsed) ? 0 : parsed },
    }));
  }

  function updatePortfolioName(id, value) {
    setPortfolios((prev) => prev.map((p) => (p.id === id ? { ...p, name: value } : p)));
  }

  function updatePortfolioWeight(id, ticker, value) {
    const parsed = parseFloat(value);
    setPortfolios((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, weights: { ...p.weights, [ticker]: isNaN(parsed) ? 0 : parsed } }
          : p
      )
    );
  }

  function removeTickerFromPortfolio(id, ticker) {
    setPortfolios((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p.weights };
        delete next[ticker];
        return { ...p, weights: next };
      })
    );
  }

  function addTickerToPortfolio(id, ticker) {
    if (!ticker || !tickers[ticker]) return;
    setPortfolios((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, weights: { ...p.weights, [ticker]: 0 } } : p
      )
    );
  }

  function addPortfolio() {
    const newId = 'custom_' + Date.now();
    setPortfolios((prev) => [
      ...prev,
      { id: newId, name: 'New portfolio', subtitle: 'Custom', weights: {} },
    ]);
  }

  function deletePortfolio(id) {
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
  }

  // Monte Carlo: 500 paths of 10 years each, scenarios sampled by probability
  const monteCarlo = useMemo(() => {
    const RUNS = 500;
    const YEARS = 10;
    const STARTING = 10000;
    const probSum = SCENARIOS.reduce((s, sc) => s + probs[sc.id], 0);
    if (probSum === 0) return { perYear: [], stats: {} };

    // Build cumulative probability lookup for sampling
    const cumProbs = [];
    let cum = 0;
    for (const sc of SCENARIOS) {
      cum += probs[sc.id] / probSum;
      cumProbs.push({ id: sc.id, cum });
    }

    const result = {};
    for (const p of portfolios) {
      // Precompute returns per scenario for this portfolio
      const scenarioReturns = {};
      SCENARIOS.forEach((s) => {
        scenarioReturns[s.id] = portfolioReturn(p, s.id, tickers) / 100;
      });

      // Run simulations
      const yearlyValues = Array.from({ length: YEARS + 1 }, () => []);
      for (let y = 0; y <= YEARS; y++) yearlyValues[y].length = RUNS;

      for (let r = 0; r < RUNS; r++) {
        let value = STARTING;
        yearlyValues[0][r] = value;
        for (let y = 1; y <= YEARS; y++) {
          const rand = Math.random();
          let scenarioId = cumProbs[cumProbs.length - 1].id;
          for (const cp of cumProbs) {
            if (rand <= cp.cum) {
              scenarioId = cp.id;
              break;
            }
          }
          value = value * (1 + scenarioReturns[scenarioId]);
          yearlyValues[y][r] = value;
        }
      }

      // Compute percentiles per year
      const perYear = yearlyValues.map((values) => {
        const sorted = values.slice().sort((a, b) => a - b);
        return {
          p10: sorted[Math.floor(RUNS * 0.1)],
          p50: sorted[Math.floor(RUNS * 0.5)],
          p90: sorted[Math.floor(RUNS * 0.9)],
        };
      });

      const final = perYear[YEARS];
      const cagrMedian = Math.pow(final.p50 / STARTING, 1 / YEARS) - 1;
      result[p.id] = { perYear, final, cagrMedian };
    }

    return result;
  }, [portfolios, probs, tickers]);

  // Computed
  const chartData = useMemo(
    () =>
      portfolios.map((p) => {
        const r1 = weightedExpected(p, probs, tickers);
        const mc = monteCarlo?.[p.id];
        const r5 = mc?.perYear?.[5]?.p50
          ? (mc.perYear[5].p50 / 10000 - 1) * 100
          : 0;
        return {
          name: p.name,
          oneY: isNaN(r1) ? 0 : r1,
          fiveY: isNaN(r5) ? 0 : r5,
        };
      }),
    [portfolios, probs, tickers, monteCarlo]
  );

  const allTickers = useMemo(() => {
    const set = new Set();
    portfolios.forEach((p) => Object.keys(p.weights).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [portfolios]);

  const groupedTickers = useMemo(() => {
    const groups = CATEGORIES.map((cat) => ({
      ...cat,
      tickers: allTickers
        .filter((t) => tickers[t]?.category === cat.id)
        .sort(),
    })).filter((g) => g.tickers.length > 0);

    const uncategorized = allTickers
      .filter((t) => !tickers[t]?.category || !CATEGORIES.find((c) => c.id === tickers[t].category))
      .sort();
    if (uncategorized.length > 0) {
      groups.push({ id: 'other', label: 'Other', tickers: uncategorized });
    }
    return groups;
  }, [allTickers, tickers]);

  const bestPerScenario = useMemo(() => {
    const out = {};
    SCENARIOS.forEach((s) => {
      let bestId = portfolios[0]?.id;
      let bestVal = -Infinity;
      portfolios.forEach((p) => {
        const v = portfolioReturn(p, s.id, tickers);
        if (v > bestVal) {
          bestVal = v;
          bestId = p.id;
        }
      });
      out[s.id] = bestId;
    });
    return out;
  }, [portfolios, tickers]);

  const totalProb = SCENARIOS.reduce((s, sc) => s + probs[sc.id], 0);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div className="w-full px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-medium tracking-tight">Portfolio Scenario Simulator</h1>
              <p className="text-stone-600 mt-1 text-sm">
                Set probabilities, see weighted expected returns across portfolio options, edit assumptions to test sensitivity.
              </p>
            </div>
          </div>
        </header>

        {/* Top: portfolio comparison + sliders */}
        <div className="flex gap-6 mb-6">
          {/* Portfolio comparison table (left, 75% width) */}
          <div className="w-3/4 bg-white border border-stone-200 rounded-lg p-6 min-w-0">
            <div className="mb-4">
              <h2 className="text-base font-medium">Portfolio compositions</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Holdings and weights across portfolio options. Edit weights at the bottom.
              </p>
            </div>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2 px-2 font-medium" style={{ minWidth: '110px' }}>
                      Holding
                    </th>
                    <th className="text-left py-2 px-2 font-medium" style={{ minWidth: '260px' }}>
                      Purpose
                    </th>
                    <th className="text-right py-2 px-2 font-medium whitespace-nowrap" style={{ minWidth: '50px' }} title="Expense ratio">
                      ER
                    </th>
                    <th className="text-right py-2 px-2 font-medium whitespace-nowrap" style={{ minWidth: '70px' }} title="Weighted expected 1-year return given current scenario probabilities">
                      Exp. 1Y
                    </th>
                    {portfolios.map((p) => (
                      <th
                        key={p.id}
                        className="text-right py-2 px-2 font-medium whitespace-nowrap"
                        style={{ minWidth: '70px' }}
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupedTickers.map((group) => (
                    <React.Fragment key={group.id}>
                      <tr className="bg-stone-100">
                        <td
                          colSpan={4 + portfolios.length}
                          className="py-1.5 px-2 text-[11px] font-medium uppercase tracking-wide text-stone-600"
                        >
                          {group.label}
                        </td>
                      </tr>
                      {group.tickers.map((t) => {
                        const td = tickers[t];
                        return (
                          <tr key={t} className="border-b border-stone-100 align-top">
                            <td className="py-2 px-2 whitespace-nowrap">
                              <div className="font-medium">{t}</div>
                              {td && (
                                <div className="text-[10px] text-stone-500 leading-tight">
                                  {td.name}
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-2">
                              {td?.purpose && (
                                <div className="text-[11px] text-stone-600 leading-snug">
                                  {td.purpose}
                                </div>
                              )}
                            </td>
                            <td className="text-right py-2 px-2 tabular-nums text-stone-600 whitespace-nowrap">
                              {td && typeof td.er === 'number'
                                ? td.er === 0
                                  ? '—'
                                  : `${td.er.toFixed(2)}%`
                                : ''}
                            </td>
                            <td
                              className="text-right py-2 px-2 tabular-nums whitespace-nowrap font-medium"
                              style={{
                                color:
                                  td && tickerWeightedReturn(td, probs) >= 0
                                    ? '#27500A'
                                    : '#791F1F',
                              }}
                            >
                              {td
                                ? formatPct(tickerWeightedReturn(td, probs))
                                : ''}
                            </td>
                            {portfolios.map((p) => {
                              const w = p.weights[t];
                              return (
                                <td
                                  key={p.id}
                                  className="text-right py-2 px-2 tabular-nums"
                                >
                                  {w ? (
                                    `${w}%`
                                  ) : (
                                    <span className="text-stone-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                  <tr className="border-t-2 border-stone-300 bg-stone-50">
                    <td className="py-2 px-2 font-medium">Total</td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    {portfolios.map((p) => {
                      const sum = portfolioWeightSum(p);
                      return (
                        <td
                          key={p.id}
                          className={`text-right py-2 px-2 font-medium tabular-nums ${
                            sum === 100 ? '' : 'text-red-700'
                          }`}
                        >
                          {sum}%
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-stone-50">
                    <td className="py-2 px-2 font-medium">Weighted ER</td>
                    <td className="py-2 px-2 text-[11px] text-stone-500">
                      Average annual fee drag on this portfolio
                    </td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    {portfolios.map((p) => {
                      const er = portfolioWeightedER(p, tickers);
                      return (
                        <td
                          key={p.id}
                          className="text-right py-2 px-2 font-medium tabular-nums text-stone-600"
                        >
                          {er.toFixed(2)}%
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-stone-50">
                    <td className="py-2 px-2 font-medium">Portfolio Exp. 1Y</td>
                    <td className="py-2 px-2 text-[11px] text-stone-500">
                      Weighted expected return given current scenario probabilities
                    </td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    {portfolios.map((p) => {
                      const exp = weightedExpected(p, probs, tickers);
                      return (
                        <td
                          key={p.id}
                          className="text-right py-2 px-2 font-medium tabular-nums"
                          style={{ color: exp >= 0 ? '#27500A' : '#791F1F' }}
                        >
                          {formatPct(exp, 2)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-stone-50">
                    <td className="py-2 px-2 font-medium">Portfolio Exp. 5Y</td>
                    <td className="py-2 px-2 text-[11px] text-stone-500">
                      Cumulative compound return over 5 years (Monte Carlo median)
                    </td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    {portfolios.map((p) => {
                      const mc = monteCarlo?.[p.id];
                      const cumulative = mc?.perYear?.[5]?.p50
                        ? (mc.perYear[5].p50 / 10000 - 1) * 100
                        : 0;
                      return (
                        <td
                          key={p.id}
                          className="text-right py-2 px-2 font-medium tabular-nums"
                          style={{ color: cumulative >= 0 ? '#27500A' : '#791F1F' }}
                        >
                          {formatPct(cumulative, 1)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-stone-50">
                    <td className="py-2 px-2 font-medium">Portfolio Exp. 10Y</td>
                    <td className="py-2 px-2 text-[11px] text-stone-500">
                      Cumulative compound return over 10 years (Monte Carlo median)
                    </td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
                    {portfolios.map((p) => {
                      const mc = monteCarlo?.[p.id];
                      const cumulative = mc?.perYear?.[10]?.p50
                        ? (mc.perYear[10].p50 / 10000 - 1) * 100
                        : 0;
                      return (
                        <td
                          key={p.id}
                          className="text-right py-2 px-2 font-medium tabular-nums"
                          style={{ color: cumulative >= 0 ? '#27500A' : '#791F1F' }}
                        >
                          {formatPct(cumulative, 1)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Scenario sliders (right, 25% width) */}
          <div className="w-1/4 bg-white border border-stone-200 rounded-lg p-5 min-w-0">
            <div className="flex justify-between items-start mb-4 gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-medium">Scenarios</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Auto-balance to 100%
                </p>
              </div>
              <button
                onClick={resetProbs}
                className="text-xs flex items-center gap-1 px-2 py-1 border border-stone-300 rounded hover:bg-stone-50 transition-colors shrink-0"
                title="Reset to consensus"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {SCENARIOS.map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between items-baseline mb-1 gap-2">
                    <span
                      className="text-xs font-medium truncate"
                      style={{ color: s.color }}
                      title={s.desc}
                    >
                      {s.label}
                    </span>
                    <span className="text-xs font-medium tabular-nums whitespace-nowrap">
                      {probs[s.id]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={probs[s.id]}
                    onChange={(e) => setProb(s.id, parseInt(e.target.value))}
                    className="w-full"
                    style={{ accentColor: s.color }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 text-right text-xs text-stone-500">
              Total:{' '}
              <span
                className={`font-medium tabular-nums ${
                  totalProb === 100 ? 'text-stone-700' : 'text-red-700'
                }`}
              >
                {totalProb}%
              </span>
            </div>
          </div>
        </div>

        {/* Expected return chart */}
        <section className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
          <h2 className="text-base font-medium mb-1">Weighted expected returns: 1-year and 5-year</h2>
          <p className="text-xs text-stone-500 mb-4">
            1-year weighted expected return and 5-year cumulative return (Monte Carlo median) per portfolio, given current probability weights
          </p>
          <div style={{ height: Math.max(260, portfolios.length * 60) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${v}%`}
                  stroke="#78716c"
                  fontSize={11}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#78716c"
                  fontSize={11}
                  width={150}
                />
                <Tooltip
                  formatter={(v, name) => [
                    `${Number(v).toFixed(2)}%`,
                    name === 'oneY' ? '1-year expected' : '5-year cumulative',
                  ]}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e7e5e4',
                    fontSize: 12,
                    borderRadius: 4,
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === 'oneY' ? '1-year expected' : '5-year cumulative'
                  }
                  wrapperStyle={{ fontSize: 11 }}
                />
                <ReferenceLine x={0} stroke="#78716c" strokeWidth={1} />
                <Bar dataKey="oneY" radius={[0, 3, 3, 0]} barSize={12}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.oneY >= 0 ? '#85B7EB' : '#E59494'}
                    />
                  ))}
                </Bar>
                <Bar dataKey="fiveY" radius={[0, 3, 3, 0]} barSize={12}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.fiveY >= 0 ? '#185FA5' : '#A32D2D'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
          <h2 className="text-base font-medium mb-1">Performance under each scenario</h2>
          <p className="text-xs text-stone-500 mb-4">
            Highlighted cell shows the best portfolio for that scenario
          </p>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-2 px-2 font-medium">Portfolio</th>
                  {SCENARIOS.map((s) => (
                    <th
                      key={s.id}
                      className="text-right py-2 px-2 font-medium whitespace-nowrap"
                    >
                      <div style={{ color: s.color }}>{s.short}</div>
                      <div className="text-[10px] text-stone-400 font-normal">
                        {probs[s.id]}%
                      </div>
                    </th>
                  ))}
                  <th className="text-right py-2 px-2 font-medium bg-stone-50">
                    Weighted
                  </th>
                </tr>
              </thead>
              <tbody>
                {portfolios.map((p) => {
                  const weighted = weightedExpected(p, probs, tickers);
                  return (
                    <tr key={p.id} className="border-b border-stone-100">
                      <td className="py-3 px-2">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-stone-500">{p.subtitle}</div>
                      </td>
                      {SCENARIOS.map((s) => {
                        const v = portfolioReturn(p, s.id, tickers);
                        const isBest = bestPerScenario[s.id] === p.id;
                        return (
                          <td
                            key={s.id}
                            className={`text-right py-3 px-2 tabular-nums ${
                              isBest ? 'bg-green-50 font-medium' : ''
                            }`}
                            style={{ color: v >= 0 ? '#27500A' : '#791F1F' }}
                          >
                            {formatPct(v)}
                          </td>
                        );
                      })}
                      <td
                        className="text-right py-3 px-2 tabular-nums font-medium bg-stone-50"
                        style={{ color: weighted >= 0 ? '#27500A' : '#791F1F' }}
                      >
                        {formatPct(weighted, 2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Editable assumptions */}
        <section className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
          <button
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="flex items-center gap-2 text-base font-medium w-full text-left"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showAssumptions ? '' : '-rotate-90'
              }`}
            />
            Scenario return assumptions per asset
          </button>

          {showAssumptions && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
                <p className="text-xs text-stone-500">
                  {editAssumptions
                    ? 'Edit any value. Chart and matrix update live.'
                    : 'Per-asset returns assumed in each scenario.'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditAssumptions(!editAssumptions)}
                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 rounded hover:bg-stone-50"
                  >
                    {editAssumptions ? (
                      <>
                        <Save className="w-3 h-3" />
                        Done editing
                      </>
                    ) : (
                      <>
                        <Settings className="w-3 h-3" />
                        Edit values
                      </>
                    )}
                  </button>
                  {editAssumptions && (
                    <button
                      onClick={resetTickers}
                      className="text-xs flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 rounded hover:bg-stone-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-2 px-2 font-medium">Ticker</th>
                      <th className="text-left py-2 px-2 font-medium">Name</th>
                      {SCENARIOS.map((s) => (
                        <th
                          key={s.id}
                          className="text-right py-2 px-2 font-medium whitespace-nowrap"
                          style={{ color: s.color }}
                        >
                          {s.short}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(tickers).map(([ticker, data]) => (
                      <tr key={ticker} className="border-b border-stone-100">
                        <td className="py-2 px-2 font-medium">{ticker}</td>
                        <td className="py-2 px-2 text-stone-600">{data.name}</td>
                        {SCENARIOS.map((s) => (
                          <td
                            key={s.id}
                            className="text-right py-2 px-2 tabular-nums"
                          >
                            {editAssumptions ? (
                              <input
                                type="number"
                                value={data[s.id]}
                                onChange={(e) =>
                                  updateTickerValue(ticker, s.id, e.target.value)
                                }
                                className="w-16 text-right border border-stone-200 rounded px-1 py-0.5"
                                step="0.5"
                              />
                            ) : (
                              <span
                                style={{
                                  color: data[s.id] >= 0 ? '#27500A' : '#791F1F',
                                }}
                              >
                                {formatPct(data[s.id])}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Editable portfolios */}
        <section className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
          <button
            onClick={() => setShowPortfolios(!showPortfolios)}
            className="flex items-center gap-2 text-base font-medium w-full text-left"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showPortfolios ? '' : '-rotate-90'
              }`}
            />
            Portfolio compositions
          </button>

          {showPortfolios && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
                <p className="text-xs text-stone-500">
                  {editPortfolios
                    ? 'Edit weights, add or remove holdings. Weights should sum to 100% per portfolio.'
                    : 'Current portfolio compositions.'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditPortfolios(!editPortfolios)}
                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 rounded hover:bg-stone-50"
                  >
                    {editPortfolios ? (
                      <>
                        <Save className="w-3 h-3" />
                        Done editing
                      </>
                    ) : (
                      <>
                        <Settings className="w-3 h-3" />
                        Edit portfolios
                      </>
                    )}
                  </button>
                  {editPortfolios && (
                    <>
                      <button
                        onClick={addPortfolio}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 rounded hover:bg-stone-50"
                      >
                        <Plus className="w-3 h-3" />
                        Add portfolio
                      </button>
                      <button
                        onClick={resetPortfolios}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 rounded hover:bg-stone-50"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {portfolios.map((p) => {
                  const weightSum = portfolioWeightSum(p);
                  return (
                    <div
                      key={p.id}
                      className="border border-stone-200 rounded p-4 bg-stone-50"
                    >
                      <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          {editPortfolios ? (
                            <input
                              type="text"
                              value={p.name}
                              onChange={(e) =>
                                updatePortfolioName(p.id, e.target.value)
                              }
                              className="font-medium text-sm border border-stone-300 rounded px-2 py-1 w-full max-w-sm"
                            />
                          ) : (
                            <div className="font-medium text-sm">{p.name}</div>
                          )}
                          <div className="text-xs text-stone-500 mt-0.5">
                            {p.subtitle}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs tabular-nums ${
                              weightSum === 100
                                ? 'text-stone-600'
                                : 'text-red-700 font-medium'
                            }`}
                          >
                            Total: {weightSum}%
                          </span>
                          {editPortfolios && (
                            <button
                              onClick={() => deletePortfolio(p.id)}
                              className="text-xs text-red-700 hover:bg-red-50 p-1 rounded"
                              aria-label={`Delete ${p.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(p.weights).map(([ticker, weight]) => (
                          <div
                            key={ticker}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="font-medium w-12">{ticker}</span>
                            {editPortfolios ? (
                              <>
                                <input
                                  type="number"
                                  value={weight}
                                  onChange={(e) =>
                                    updatePortfolioWeight(
                                      p.id,
                                      ticker,
                                      e.target.value
                                    )
                                  }
                                  className="w-14 text-right border border-stone-300 rounded px-1 py-0.5"
                                  step="1"
                                  min="0"
                                />
                                <span className="text-stone-500">%</span>
                                <button
                                  onClick={() =>
                                    removeTickerFromPortfolio(p.id, ticker)
                                  }
                                  className="text-stone-400 hover:text-red-700 ml-auto"
                                  aria-label={`Remove ${ticker}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <span className="tabular-nums">{weight}%</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {editPortfolios && (
                        <div className="mt-3 pt-3 border-t border-stone-200">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                addTickerToPortfolio(p.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="text-xs border border-stone-300 rounded px-2 py-1"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Add ticker to portfolio...
                            </option>
                            {Object.keys(tickers)
                              .filter((t) => !(t in p.weights))
                              .map((t) => (
                                <option key={t} value={t}>
                                  {t} - {tickers[t].name}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <footer className="text-xs text-stone-500 mt-8 leading-relaxed space-y-2">
          <p>
            <strong className="font-medium text-stone-700">How to use:</strong> Move the sliders
            to reflect your view of scenario probabilities. The chart and matrix update live.
            Expand the assumption editor to test sensitivity (what if GLDM returns less in
            stagflation than I'm assuming?). Expand the portfolio editor to modify weights,
            add tickers, or build new portfolios to compare.
          </p>
          <p>
            Scenario returns are estimates based on typical historical patterns for each asset
            class under similar macro conditions. These are not predictions, and this tool is
            not investment advice. Use it to think structurally about your bets, not as a
            forecast. Your settings persist between sessions when storage is available.
          </p>
          <div className="pt-2">
            <button
              onClick={async () => {
                if (!window.storage) return;
                if (!confirm('Reset all saved data (probabilities, assumptions, portfolios) to defaults?')) return;
                try {
                  await window.storage.delete('probs');
                  await window.storage.delete('tickers');
                  await window.storage.delete('portfolios');
                } catch (e) {}
                const init = {};
                SCENARIOS.forEach((s) => (init[s.id] = s.default));
                setProbs(init);
                setTickers(DEFAULT_TICKERS);
                setPortfolios(DEFAULT_PORTFOLIOS);
              }}
              className="text-xs px-2 py-1 border border-stone-300 rounded hover:bg-stone-50"
            >
              Clear saved data and reset everything
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
