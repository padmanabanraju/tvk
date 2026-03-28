import { useState } from 'react';
import { formatCurrency } from '../../utils/format';

function scoreTrade({ strategy, shortStrike, longStrike, credit, currentPrice, maxPain, expectedMove, daysToExpiry }) {
  const width = Math.abs(shortStrike - longStrike);
  const isCredit = ['bull_put_credit', 'bear_call_credit', 'iron_condor'].includes(strategy);

  let maxProfit, maxLoss, breakeven, distanceToStrike, distancePct;

  if (isCredit) {
    maxProfit = credit * 100;
    maxLoss = (width - credit) * 100;
    if (strategy === 'bull_put_credit') {
      breakeven = shortStrike - credit;
      distanceToStrike = currentPrice - shortStrike;
    } else {
      breakeven = shortStrike + credit;
      distanceToStrike = shortStrike - currentPrice;
    }
  } else {
    maxLoss = credit * 100;
    maxProfit = (width * 100) - maxLoss;
    if (strategy === 'put_debit') {
      breakeven = longStrike - credit;
      distanceToStrike = currentPrice - shortStrike;
    } else {
      breakeven = longStrike + credit;
      distanceToStrike = shortStrike - currentPrice;
    }
  }

  distancePct = (distanceToStrike / currentPrice) * 100;
  const riskRewardRatio = maxLoss / maxProfit;

  let probOfProfit;
  if (expectedMove && expectedMove > 0) {
    const strikeRatio = Math.abs(distanceToStrike) / expectedMove;
    probOfProfit = Math.min(95, Math.max(30, 50 + (strikeRatio * 25)));
  } else {
    probOfProfit = Math.min(90, Math.max(35, 50 + (distancePct * 5)));
  }
  if (isCredit) probOfProfit = Math.min(90, probOfProfit + 10);

  const ev = (probOfProfit / 100 * maxProfit - (1 - probOfProfit / 100) * maxLoss) / maxLoss;

  let grade, gradeColor, recommendation;
  if (riskRewardRatio <= 1.5 && probOfProfit >= 75) {
    grade = 'A+'; gradeColor = '#22c55e'; recommendation = 'EXCELLENT — Take this trade';
  } else if (riskRewardRatio <= 2.0 && probOfProfit >= 70) {
    grade = 'A'; gradeColor = '#22c55e'; recommendation = 'STRONG — Good setup';
  } else if (riskRewardRatio <= 2.5 && probOfProfit >= 65) {
    grade = 'B+'; gradeColor = '#86efac'; recommendation = 'SOLID — Take with conviction';
  } else if (riskRewardRatio <= 3.0 && probOfProfit >= 60) {
    grade = 'B'; gradeColor = '#fbbf24'; recommendation = 'DECENT — Acceptable risk';
  } else if (riskRewardRatio <= 4.0 && probOfProfit >= 55) {
    grade = 'C'; gradeColor = '#f59e0b'; recommendation = 'MARGINAL — Only with strong thesis';
  } else {
    grade = 'F'; gradeColor = '#ef4444'; recommendation = "SKIP — Math doesn't work";
  }

  let maxPainNote = '';
  if (maxPain) {
    if (strategy === 'bull_put_credit' && maxPain > shortStrike) {
      maxPainNote = 'Max pain above short strike — favorable';
      if (grade === 'B+') { grade = 'A'; gradeColor = '#22c55e'; }
      if (grade === 'B') { grade = 'B+'; gradeColor = '#86efac'; }
    } else if (strategy === 'bear_call_credit' && maxPain < shortStrike) {
      maxPainNote = 'Max pain below short strike — favorable';
      if (grade === 'B+') { grade = 'A'; gradeColor = '#22c55e'; }
      if (grade === 'B') { grade = 'B+'; gradeColor = '#86efac'; }
    } else {
      maxPainNote = 'Max pain not aligned — caution';
    }
  }

  return {
    strategy: strategy.replace(/_/g, ' ').toUpperCase(),
    shortStrike, longStrike, width,
    credit: credit.toFixed(2),
    maxProfit: maxProfit.toFixed(0),
    maxLoss: maxLoss.toFixed(0),
    breakeven: breakeven.toFixed(2),
    riskRewardRatio: riskRewardRatio.toFixed(2),
    distanceToStrike: distanceToStrike.toFixed(2),
    distancePct: distancePct.toFixed(1),
    probOfProfit: probOfProfit.toFixed(0),
    expectedValue: ev.toFixed(2),
    daysToExpiry,
    grade, gradeColor, recommendation, maxPainNote,
  };
}

const STRATEGIES = [
  { value: 'bull_put_credit', label: 'Bull Put Credit Spread' },
  { value: 'bear_call_credit', label: 'Bear Call Credit Spread' },
  { value: 'put_debit', label: 'Put Debit Spread' },
  { value: 'call_debit', label: 'Call Debit Spread' },
];

export default function TradeScorer({ currentPrice, maxPain, expirations }) {
  const [open, setOpen] = useState(false);
  const [strategy, setStrategy] = useState('bull_put_credit');
  const [shortStrike, setShortStrike] = useState('');
  const [longStrike, setLongStrike] = useState('');
  const [credit, setCredit] = useState('');
  const [expiration, setExpiration] = useState('');
  const [result, setResult] = useState(null);

  const handleCalc = () => {
    const ss = parseFloat(shortStrike);
    const ls = parseFloat(longStrike);
    const cr = parseFloat(credit);
    if (!ss || !ls || !cr || !currentPrice) return;

    const daysToExpiry = expiration
      ? Math.ceil((new Date(expiration + 'T12:00:00') - new Date()) / 86400000)
      : 7;

    const res = scoreTrade({
      strategy, shortStrike: ss, longStrike: ls, credit: cr,
      currentPrice, maxPain: maxPain || null, expectedMove: null, daysToExpiry,
    });
    setResult(res);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      '--- TRADE SCORER ---',
      `Strategy: ${result.strategy}`,
      `Current Price: ${formatCurrency(currentPrice)}`,
      `Short Strike: $${result.shortStrike} | Long Strike: $${result.longStrike} | Width: $${result.width}`,
      `Credit: $${result.credit} | Expiration: ${expiration || 'N/A'} (${result.daysToExpiry} days)`,
      `Max Profit: $${result.maxProfit} | Max Loss: $${result.maxLoss}`,
      `Risk/Reward: ${result.riskRewardRatio}:1`,
      `Breakeven: $${result.breakeven} (${result.distancePct}% from price)`,
      `Prob of Profit: ~${result.probOfProfit}%`,
      `Expected Value: ${result.expectedValue} per $1 risked`,
      result.maxPainNote ? `Max Pain: ${result.maxPainNote}` : '',
      `Grade: ${result.grade} — ${result.recommendation}`,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const inputClass = "bg-[#08080e] border border-white/10 rounded px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#22c55e]/50 w-full";

  return (
    <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-bold text-white">TRADE SCORER</span>
        <span className="text-[#666] text-sm">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <select value={strategy} onChange={e => setStrategy(e.target.value)} className={inputClass}>
            {STRATEGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Short Strike" value={shortStrike} onChange={e => setShortStrike(e.target.value)} className={inputClass} />
            <input type="number" placeholder="Long Strike" value={longStrike} onChange={e => setLongStrike(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Credit/Debit" value={credit} onChange={e => setCredit(e.target.value)} className={inputClass} step="0.01" />
            {expirations && expirations.length > 0 ? (
              <select value={expiration} onChange={e => setExpiration(e.target.value)} className={inputClass}>
                <option value="">Expiration...</option>
                {expirations.map(exp => {
                  const d = new Date(exp.date + 'T12:00:00');
                  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return <option key={exp.date} value={exp.date}>{label} {exp.type !== 'WEEKLY' ? `[${exp.label}]` : ''}</option>;
                })}
              </select>
            ) : (
              <input type="text" placeholder="YYYY-MM-DD" value={expiration} onChange={e => setExpiration(e.target.value)} className={inputClass} />
            )}
          </div>

          <button
            onClick={handleCalc}
            className="w-full py-2.5 rounded-lg bg-[#22c55e] text-black font-bold text-sm active:scale-95 transition-transform"
          >
            CALCULATE
          </button>

          {result && (
            <div className="rounded-lg border border-white/10 overflow-hidden">
              {/* Grade header */}
              <div className="flex items-center justify-between p-3" style={{ backgroundColor: result.gradeColor + '15' }}>
                <div>
                  <span className="text-2xl font-bold" style={{ color: result.gradeColor }}>{result.grade}</span>
                  <p className="text-xs text-[#d0d0dd] mt-0.5">{result.recommendation}</p>
                </div>
              </div>

              <div className="p-3 space-y-1.5">
                {[
                  ['Max Profit', `$${result.maxProfit}`, '#22c55e'],
                  ['Max Loss', `$${result.maxLoss}`, '#ef4444'],
                  ['Risk/Reward', `${result.riskRewardRatio}:1`, null],
                  ['Breakeven', `$${result.breakeven}`, null],
                  ['Distance', `$${result.distanceToStrike} (${result.distancePct}%)`, null],
                  ['Prob of Profit', `~${result.probOfProfit}%`, null],
                  ['Expected Value', `${parseFloat(result.expectedValue) >= 0 ? '+' : ''}$${result.expectedValue}/risk`, parseFloat(result.expectedValue) >= 0 ? '#22c55e' : '#ef4444'],
                  ['Days to Exp', result.daysToExpiry, null],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-[#666]">{label}</span>
                    <span className="font-mono" style={{ color: color || '#d0d0dd' }}>{value}</span>
                  </div>
                ))}
                {result.maxPainNote && (
                  <div className="text-xs mt-1 pt-1 border-t border-white/5">
                    <span className={result.maxPainNote.includes('favorable') ? 'text-[#22c55e]' : 'text-[#f59e0b]'}>
                      {result.maxPainNote.includes('favorable') ? '✅' : '⚠️'} {result.maxPainNote}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleCopy}
                className="w-full py-2 text-xs text-[#a855f7] font-medium border-t border-white/5 active:bg-white/5"
              >
                Copy for Claude
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
