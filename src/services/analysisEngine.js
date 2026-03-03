// Algorithmic analysis engine — generates insights from real data
// All analysis is derived from actual market data, not random values

export function generateFullAnalysis(data) {
  if (!data) return null;

  try {
    return {
      trend: analyzeTrend(data),
      maAnalysis: analyzeMovingAverages(data),
      valuation: analyzeValuation(data),
      momentum: analyzeMomentum(data),
      priceTargets: computePriceTargets(data),
      tradingStrategy: generateTradingStrategy(data),
      investmentThesis: generateInvestmentThesis(data),
      optionsInsight: generateOptionsInsight(data),
      optionsStrategies: generateOptionsStrategies(data),
      futureProjection: generateFutureProjection(data),
      newsSentiment: analyzeNewsSentiment(data),
      riskAssessment: assessRisk(data),
    };
  } catch (err) {
    console.error('[TVK] Analysis engine error:', err);
    return null;
  }
}

// --- Trend Analysis ---
function analyzeTrend(data) {
  const { price, indicators, candles } = data;
  const { sma20, sma50, sma200 } = indicators || {};

  let trend = 'Unclear';
  let strength = 'Weak';
  const signals = [];

  if (sma20 && sma50 && sma200) {
    // Golden Cross / Death Cross
    if (sma50 > sma200) {
      signals.push({ type: 'bullish', text: 'Golden Cross: SMA 50 is above SMA 200 — long-term bullish trend' });
    } else {
      signals.push({ type: 'bearish', text: 'Death Cross: SMA 50 is below SMA 200 — long-term bearish trend' });
    }

    // Price relative to MAs
    if (price > sma20 && price > sma50 && price > sma200) {
      trend = 'Strong Uptrend';
      strength = 'Strong';
      signals.push({ type: 'bullish', text: 'Price is trading above all major moving averages (20, 50, 200)' });
    } else if (price < sma20 && price < sma50 && price < sma200) {
      trend = 'Strong Downtrend';
      strength = 'Strong';
      signals.push({ type: 'bearish', text: 'Price is trading below all major moving averages (20, 50, 200)' });
    } else if (price > sma200 && price > sma50) {
      trend = 'Uptrend';
      strength = 'Moderate';
      signals.push({ type: 'bullish', text: 'Price above SMA 50 and SMA 200 — intermediate uptrend intact' });
    } else if (price < sma200 && price < sma50) {
      trend = 'Downtrend';
      strength = 'Moderate';
      signals.push({ type: 'bearish', text: 'Price below SMA 50 and SMA 200 — intermediate downtrend' });
    } else {
      trend = 'Consolidation';
      strength = 'Weak';
      signals.push({ type: 'neutral', text: 'Price between moving averages — consolidation phase' });
    }

    // MA alignment
    if (sma20 > sma50 && sma50 > sma200) {
      signals.push({ type: 'bullish', text: 'Perfect bullish alignment: SMA 20 > SMA 50 > SMA 200' });
    } else if (sma20 < sma50 && sma50 < sma200) {
      signals.push({ type: 'bearish', text: 'Perfect bearish alignment: SMA 20 < SMA 50 < SMA 200' });
    }
  }

  // Volume trend (from candles)
  if (candles && candles.length >= 20) {
    const recent10Avg = candles.slice(-10).reduce((s, c) => s + c.volume, 0) / 10;
    const prior10Avg = candles.slice(-20, -10).reduce((s, c) => s + c.volume, 0) / 10;
    if (recent10Avg > prior10Avg * 1.2) {
      signals.push({ type: 'neutral', text: `Volume increasing — ${((recent10Avg / prior10Avg - 1) * 100).toFixed(0)}% higher than average, confirming price action` });
    } else if (recent10Avg < prior10Avg * 0.8) {
      signals.push({ type: 'neutral', text: 'Volume declining — price move may lack conviction' });
    }
  }

  return { trend, strength, signals };
}

// --- Moving Average Analysis ---
function analyzeMovingAverages(data) {
  const { price, indicators } = data;
  const { sma20, sma50, sma200, ema12, ema26 } = indicators || {};
  const analysis = [];

  if (sma20) {
    const pctFrom20 = ((price - sma20) / sma20 * 100).toFixed(1);
    analysis.push({
      label: 'SMA 20 (Short-term)',
      value: sma20,
      position: price > sma20 ? 'above' : 'below',
      distance: `${pctFrom20}%`,
      interpretation: price > sma20
        ? `Price ${pctFrom20}% above SMA 20 — short-term momentum is bullish`
        : `Price ${Math.abs(pctFrom20)}% below SMA 20 — short-term weakness`,
    });
  }

  if (sma50) {
    const pctFrom50 = ((price - sma50) / sma50 * 100).toFixed(1);
    analysis.push({
      label: 'SMA 50 (Medium-term)',
      value: sma50,
      position: price > sma50 ? 'above' : 'below',
      distance: `${pctFrom50}%`,
      interpretation: price > sma50
        ? `Price ${pctFrom50}% above SMA 50 — intermediate trend bullish`
        : `Price ${Math.abs(pctFrom50)}% below SMA 50 — intermediate trend bearish`,
    });
  }

  if (sma200) {
    const pctFrom200 = ((price - sma200) / sma200 * 100).toFixed(1);
    analysis.push({
      label: 'SMA 200 (Long-term)',
      value: sma200,
      position: price > sma200 ? 'above' : 'below',
      distance: `${pctFrom200}%`,
      interpretation: price > sma200
        ? `Price ${pctFrom200}% above SMA 200 — long-term trend is up. Institutional support likely.`
        : `Price ${Math.abs(pctFrom200)}% below SMA 200 — caution, long-term trend is down.`,
    });
  }

  if (ema12 && ema26) {
    const emaSpread = ((ema12 - ema26) / ema26 * 100).toFixed(2);
    analysis.push({
      label: 'EMA 12/26 Spread',
      value: null,
      position: ema12 > ema26 ? 'bullish' : 'bearish',
      distance: `${emaSpread}%`,
      interpretation: ema12 > ema26
        ? `EMA 12 above EMA 26 (spread: ${emaSpread}%) — short-term momentum favors bulls`
        : `EMA 12 below EMA 26 (spread: ${emaSpread}%) — short-term momentum favors bears`,
    });
  }

  return analysis;
}

// --- Valuation Analysis ---
function analyzeValuation(data) {
  const { pe, eps, price, marketCap, week52High, week52Low, revenueGrowth, epsGrowth, earnings } = data;
  const insights = [];

  if (pe !== null && pe !== undefined) {
    if (pe < 0) {
      insights.push({ type: 'warning', text: `P/E Ratio is negative (${pe.toFixed(1)}) — company is not currently profitable` });
    } else if (pe < 15) {
      insights.push({ type: 'bullish', text: `P/E of ${pe.toFixed(1)} suggests undervaluation — below market average of ~20-25x` });
    } else if (pe < 30) {
      insights.push({ type: 'neutral', text: `P/E of ${pe.toFixed(1)} is fairly valued — in line with growth expectations` });
    } else if (pe < 60) {
      insights.push({ type: 'warning', text: `P/E of ${pe.toFixed(1)} is elevated — market pricing in high growth expectations` });
    } else {
      insights.push({ type: 'warning', text: `P/E of ${pe.toFixed(1)} is very high — extreme growth expectations priced in. High risk if growth disappoints.` });
    }

    // PEG-like estimate
    if (epsGrowth && epsGrowth > 0) {
      const peg = pe / epsGrowth;
      if (peg < 1) {
        insights.push({ type: 'bullish', text: `PEG ratio ~${peg.toFixed(1)} (P/E / EPS growth) — undervalued relative to growth rate` });
      } else if (peg > 2) {
        insights.push({ type: 'warning', text: `PEG ratio ~${peg.toFixed(1)} — overvalued relative to growth rate` });
      }
    }
  }

  if (week52High && week52Low) {
    const range = week52High - week52Low;
    const posInRange = ((price - week52Low) / range * 100).toFixed(0);
    insights.push({
      type: posInRange > 80 ? 'warning' : posInRange < 20 ? 'bullish' : 'neutral',
      text: `Trading at ${posInRange}% of 52-week range ($${week52Low.toFixed(2)} - $${week52High.toFixed(2)})`,
    });
  }

  // Earnings momentum
  if (earnings && earnings.length >= 2) {
    const beats = earnings.filter(e => e.actual !== null && e.estimate !== null && e.actual > e.estimate).length;
    const total = earnings.filter(e => e.actual !== null && e.estimate !== null).length;
    if (total > 0) {
      insights.push({
        type: beats / total >= 0.75 ? 'bullish' : beats / total <= 0.25 ? 'bearish' : 'neutral',
        text: `Earnings track record: Beat estimates ${beats}/${total} quarters (${(beats / total * 100).toFixed(0)}%)`,
      });
    }

    // Latest quarter
    const latest = earnings.find(e => e.actual !== null);
    if (latest && latest.surprisePercent !== null) {
      insights.push({
        type: latest.surprisePercent > 0 ? 'bullish' : 'bearish',
        text: `Latest earnings: ${latest.quarter} — ${latest.surprisePercent > 0 ? 'Beat' : 'Missed'} by ${Math.abs(latest.surprisePercent).toFixed(1)}% (Actual: $${latest.actual?.toFixed(2)} vs Est: $${latest.estimate?.toFixed(2)})`,
      });
    }
  }

  if (revenueGrowth !== null && revenueGrowth !== undefined) {
    insights.push({
      type: revenueGrowth > 10 ? 'bullish' : revenueGrowth < 0 ? 'bearish' : 'neutral',
      text: `Revenue growth: ${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% YoY`,
    });
  }

  return insights;
}

// --- Momentum Analysis ---
function analyzeMomentum(data) {
  const { indicators } = data;
  if (!indicators) return [];
  const { rsi, macd, macdSignal, macdHistogram, stochasticK, stochasticD } = indicators;
  const signals = [];

  if (rsi !== null && rsi !== undefined) {
    if (rsi > 70) {
      signals.push({ type: 'bearish', text: `RSI at ${rsi.toFixed(1)} — Overbought territory. Pullback risk increases.`, importance: 'high' });
    } else if (rsi > 60) {
      signals.push({ type: 'bullish', text: `RSI at ${rsi.toFixed(1)} — Bullish momentum, approaching overbought.`, importance: 'medium' });
    } else if (rsi < 30) {
      signals.push({ type: 'bullish', text: `RSI at ${rsi.toFixed(1)} — Oversold territory. Potential bounce setup.`, importance: 'high' });
    } else if (rsi < 40) {
      signals.push({ type: 'bearish', text: `RSI at ${rsi.toFixed(1)} — Bearish momentum, approaching oversold.`, importance: 'medium' });
    } else {
      signals.push({ type: 'neutral', text: `RSI at ${rsi.toFixed(1)} — Neutral zone, no extreme reading.`, importance: 'low' });
    }
  }

  if (macd !== null && macdSignal !== null) {
    if (macd > macdSignal && macdHistogram > 0) {
      signals.push({ type: 'bullish', text: `MACD bullish: Line (${macd.toFixed(2)}) above Signal (${macdSignal.toFixed(2)}) — upward momentum`, importance: 'medium' });
    } else if (macd < macdSignal && macdHistogram < 0) {
      signals.push({ type: 'bearish', text: `MACD bearish: Line (${macd.toFixed(2)}) below Signal (${macdSignal.toFixed(2)}) — downward momentum`, importance: 'medium' });
    }
    // Crossover detection
    if (macdHistogram !== null && Math.abs(macdHistogram) < Math.abs(macd) * 0.1) {
      signals.push({ type: 'neutral', text: 'MACD approaching crossover — potential trend change ahead', importance: 'high' });
    }
  }

  if (stochasticK !== null) {
    if (stochasticK > 80 && stochasticD && stochasticK < stochasticD) {
      signals.push({ type: 'bearish', text: `Stochastic bearish crossover in overbought zone (%K: ${stochasticK.toFixed(1)})`, importance: 'high' });
    } else if (stochasticK < 20 && stochasticD && stochasticK > stochasticD) {
      signals.push({ type: 'bullish', text: `Stochastic bullish crossover in oversold zone (%K: ${stochasticK.toFixed(1)})`, importance: 'high' });
    }
  }

  return signals;
}

// --- Price Targets ---
function computePriceTargets(data) {
  const { price, indicators, candles, week52High, week52Low } = data;
  const { atr, sma20, sma50, sma200, bollingerUpper, bollingerLower } = indicators || {};

  const targets = {};

  if (atr && price) {
    // ATR-based targets (statistical range)
    targets.nextWeek = {
      high: +(price + atr * 1.5).toFixed(2),
      low: +(price - atr * 1.5).toFixed(2),
      basis: 'Based on 1.5x ATR from current price',
    };
    targets.nextMonth = {
      high: +(price + atr * 4).toFixed(2),
      low: +(price - atr * 4).toFixed(2),
      basis: 'Based on 4x ATR from current price',
    };
  }

  // Support/Resistance from Bollinger and MAs
  targets.support = [];
  targets.resistance = [];

  if (bollingerLower) targets.support.push({ level: +bollingerLower.toFixed(2), label: 'Bollinger Lower Band' });
  if (sma50 && sma50 < price) targets.support.push({ level: +sma50.toFixed(2), label: 'SMA 50' });
  if (sma200 && sma200 < price) targets.support.push({ level: +sma200.toFixed(2), label: 'SMA 200' });
  if (sma20 && sma20 < price) targets.support.push({ level: +sma20.toFixed(2), label: 'SMA 20' });

  if (bollingerUpper) targets.resistance.push({ level: +bollingerUpper.toFixed(2), label: 'Bollinger Upper Band' });
  if (sma50 && sma50 > price) targets.resistance.push({ level: +sma50.toFixed(2), label: 'SMA 50' });
  if (sma200 && sma200 > price) targets.resistance.push({ level: +sma200.toFixed(2), label: 'SMA 200' });
  if (week52High) targets.resistance.push({ level: +week52High.toFixed(2), label: '52-Week High' });

  targets.support.sort((a, b) => b.level - a.level); // Closest support first
  targets.resistance.sort((a, b) => a.level - b.level); // Closest resistance first

  return targets;
}

// --- Trading Strategy ---
function generateTradingStrategy(data) {
  const { price, indicators, candles } = data;
  const { rsi, atr, sma20, sma50, sma200, bollingerUpper, bollingerLower, signal } = indicators || {};
  const strategies = [];

  // Day/Swing Trading Setup
  if (atr && price) {
    const stopLoss = +(price - atr * 1.5).toFixed(2);
    const target1 = +(price + atr * 2).toFixed(2);
    const target2 = +(price + atr * 3).toFixed(2);
    const rr = ((target1 - price) / (price - stopLoss)).toFixed(1);

    strategies.push({
      type: 'Swing Trade',
      direction: signal === 'Bearish' ? 'Short' : 'Long',
      entry: price.toFixed(2),
      stopLoss: signal === 'Bearish' ? +(price + atr * 1.5).toFixed(2) : stopLoss,
      target1: signal === 'Bearish' ? +(price - atr * 2).toFixed(2) : target1,
      target2: signal === 'Bearish' ? +(price - atr * 3).toFixed(2) : target2,
      riskReward: rr,
      reasoning: signal === 'Bearish'
        ? `ATR: $${atr.toFixed(2)}. Short setup with ${rr}:1 R/R. ${rsi && rsi > 70 ? 'RSI overbought supports short thesis.' : ''}`
        : `ATR: $${atr.toFixed(2)}. Long setup with ${rr}:1 R/R. ${rsi && rsi < 30 ? 'RSI oversold supports bounce play.' : ''}`,
    });
  }

  // Mean Reversion
  if (bollingerUpper && bollingerLower) {
    const bbWidth = ((bollingerUpper - bollingerLower) / price * 100).toFixed(1);
    if (price >= bollingerUpper * 0.98) {
      strategies.push({
        type: 'Mean Reversion (Short)',
        direction: 'Short',
        entry: `Near $${bollingerUpper.toFixed(2)} (Upper BB)`,
        stopLoss: +(bollingerUpper * 1.02).toFixed(2),
        target1: sma20 ? +sma20.toFixed(2) : +(price * 0.97).toFixed(2),
        reasoning: `Price near upper Bollinger Band. BB width: ${bbWidth}%. High probability of reverting to mean (SMA 20).`,
      });
    } else if (price <= bollingerLower * 1.02) {
      strategies.push({
        type: 'Mean Reversion (Long)',
        direction: 'Long',
        entry: `Near $${bollingerLower.toFixed(2)} (Lower BB)`,
        stopLoss: +(bollingerLower * 0.98).toFixed(2),
        target1: sma20 ? +sma20.toFixed(2) : +(price * 1.03).toFixed(2),
        reasoning: `Price near lower Bollinger Band. BB width: ${bbWidth}%. High probability of bouncing to SMA 20.`,
      });
    }
  }

  return strategies;
}

// --- Investment Thesis ---
function generateInvestmentThesis(data) {
  const { price, pe, eps, earnings, revenueGrowth, epsGrowth, indicators, name, marketCap } = data;
  const { sma200, signal } = indicators || {};

  const thesis = { recommendation: 'Hold', confidence: 'Medium', reasons: [], risks: [] };
  let score = 0; // Positive = bullish, negative = bearish

  // Trend
  if (sma200 && price > sma200) { score += 2; thesis.reasons.push('Above 200-day SMA — long-term uptrend intact'); }
  else if (sma200) { score -= 2; thesis.risks.push('Below 200-day SMA — long-term trend is bearish'); }

  // Valuation
  if (pe !== null && pe > 0 && pe < 25) { score += 1; thesis.reasons.push(`Reasonable valuation (P/E: ${pe.toFixed(1)})`); }
  else if (pe !== null && pe > 50) { score -= 1; thesis.risks.push(`High valuation (P/E: ${pe.toFixed(1)}) — vulnerable to multiple compression`); }

  // Growth
  if (revenueGrowth && revenueGrowth > 15) { score += 2; thesis.reasons.push(`Strong revenue growth: +${revenueGrowth.toFixed(1)}% YoY`); }
  if (epsGrowth && epsGrowth > 15) { score += 1; thesis.reasons.push(`Strong EPS growth: +${epsGrowth.toFixed(1)}% YoY`); }
  if (revenueGrowth && revenueGrowth < 0) { score -= 1; thesis.risks.push(`Revenue declining: ${revenueGrowth.toFixed(1)}% YoY`); }

  // Earnings consistency
  if (earnings && earnings.length >= 4) {
    const beats = earnings.slice(0, 4).filter(e => e.actual > e.estimate).length;
    if (beats >= 3) { score += 1; thesis.reasons.push(`Consistent earnings beats (${beats}/4 quarters)`); }
    if (beats <= 1) { score -= 1; thesis.risks.push(`Frequent earnings misses (beat only ${beats}/4 quarters)`); }
  }

  // Set recommendation
  if (score >= 4) { thesis.recommendation = 'Strong Buy'; thesis.confidence = 'High'; }
  else if (score >= 2) { thesis.recommendation = 'Buy'; thesis.confidence = 'Medium'; }
  else if (score >= 0) { thesis.recommendation = 'Hold'; thesis.confidence = 'Medium'; }
  else if (score >= -2) { thesis.recommendation = 'Reduce'; thesis.confidence = 'Medium'; }
  else { thesis.recommendation = 'Sell'; thesis.confidence = 'High'; }

  // LEAP recommendation
  thesis.leapThesis = generateLeapAdvice(data, score);

  // Long-term projection
  thesis.projection = generateLongTermProjection(data);

  return thesis;
}

// --- LEAP / Options Insight ---
function generateOptionsInsight(data) {
  const { price, indicators, pe, beta } = data;
  const { rsi, atr, signal, bollingerUpper, bollingerLower } = indicators || {};
  const insights = [];

  // Implied volatility proxy from ATR
  if (atr) {
    const ivProxy = (atr / price * 100 * Math.sqrt(252)).toFixed(1);
    insights.push({
      type: 'info',
      text: `Estimated annualized volatility: ~${ivProxy}% (based on ATR). ${ivProxy > 50 ? 'High IV — options are expensive. Consider selling premium.' : 'Moderate IV — buying options is reasonable.'}`,
    });
  }

  // Bollinger Band width as volatility squeeze indicator
  if (bollingerUpper && bollingerLower) {
    const bbWidth = (bollingerUpper - bollingerLower) / price * 100;
    if (bbWidth < 5) {
      insights.push({ type: 'bullish', text: `Bollinger Band squeeze detected (width: ${bbWidth.toFixed(1)}%). Volatility expansion likely — good time to buy options/straddles.` });
    } else if (bbWidth > 15) {
      insights.push({ type: 'neutral', text: `Wide Bollinger Bands (width: ${bbWidth.toFixed(1)}%). High volatility — selling premium may be favorable.` });
    }
  }

  // Strategy suggestions
  if (signal === 'Bullish') {
    insights.push({ type: 'bullish', text: 'Bullish signal: Consider buying Calls or selling Puts.' });
    if (rsi && rsi < 40) {
      insights.push({ type: 'bullish', text: 'RSI low + bullish signal: Strong call buying opportunity. Consider ATM or slightly OTM calls.' });
    }
  } else if (signal === 'Bearish') {
    insights.push({ type: 'bearish', text: 'Bearish signal: Consider buying Puts or selling Calls (covered).' });
    if (rsi && rsi > 70) {
      insights.push({ type: 'bearish', text: 'RSI overbought + bearish signal: Put buying opportunity for protection.' });
    }
  } else {
    insights.push({ type: 'neutral', text: 'Neutral signal: Consider selling Iron Condors or Strangles to collect premium from low directional conviction.' });
  }

  // Beta-based insight
  if (beta) {
    if (beta > 1.5) {
      insights.push({ type: 'warning', text: `High beta (${beta.toFixed(2)}) — stock moves ${((beta - 1) * 100).toFixed(0)}% more than the market. Options will be more expensive.` });
    } else if (beta < 0.8) {
      insights.push({ type: 'info', text: `Low beta (${beta.toFixed(2)}) — stock is less volatile than the market. Options may be cheaper.` });
    }
  }

  return insights;
}

// --- LEAP Advice ---
function generateLeapAdvice(data, score) {
  const { price, pe, revenueGrowth, epsGrowth, indicators } = data;
  const { sma200 } = indicators || {};

  if (score >= 3 && sma200 && price > sma200) {
    const strikePrice = +(price * 0.85).toFixed(2); // Deep ITM for safety
    return {
      recommendation: 'Consider LEAP Calls',
      strike: `$${strikePrice} (15% ITM)`,
      expiry: '12-18 months out',
      reasoning: 'Strong fundamentals + uptrend. Deep ITM LEAPs provide leveraged exposure with time for thesis to play out.',
      caution: 'LEAPs are leveraged instruments. Never allocate more than 5-10% of portfolio.',
    };
  } else if (score <= -2) {
    return {
      recommendation: 'Avoid LEAPs — Consider Protective Puts',
      reasoning: 'Weak fundamentals and/or bearish trend. If holding shares, consider buying protective puts for downside protection.',
      caution: 'Buying puts is a hedge, not a profit strategy for long-term holders.',
    };
  }
  return {
    recommendation: 'Wait for clearer signal',
    reasoning: 'Mixed signals. Wait for trend confirmation before committing to LEAPs.',
  };
}

// --- News Sentiment ---
function analyzeNewsSentiment(data) {
  const { news } = data;
  if (!news || news.length === 0) return { overall: 'neutral', score: 50, summary: 'No recent news available.' };

  let positive = 0, negative = 0, neutral = 0;
  news.forEach((n) => {
    if (n.sentiment === 'positive') positive++;
    else if (n.sentiment === 'negative') negative++;
    else neutral++;
  });

  const total = news.length;
  const score = Math.round((positive / total) * 100);
  let overall = 'neutral';
  if (positive > negative * 2) overall = 'bullish';
  else if (negative > positive * 2) overall = 'bearish';
  else if (positive > negative) overall = 'slightly bullish';
  else if (negative > positive) overall = 'slightly bearish';

  return {
    overall,
    score,
    positive,
    negative,
    neutral,
    total,
    summary: `${total} recent articles: ${positive} positive, ${negative} negative, ${neutral} neutral. Overall sentiment: ${overall}.`,
  };
}

// --- Risk Assessment ---
function assessRisk(data) {
  const { beta, pe, indicators, price, week52High, week52Low } = data;
  const { rsi, atr } = indicators || {};
  const risks = [];

  if (beta && beta > 1.5) {
    risks.push({ level: 'high', text: `High Beta (${beta.toFixed(2)}) — stock is highly volatile relative to the market` });
  }

  if (pe && pe > 60) {
    risks.push({ level: 'high', text: `Very high P/E ratio (${pe.toFixed(1)}) — expensive valuation. Susceptible to earnings disappointments.` });
  }

  if (rsi && rsi > 75) {
    risks.push({ level: 'medium', text: `RSI overbought (${rsi.toFixed(1)}) — short-term pullback risk` });
  }

  if (atr && price) {
    const dailyRisk = (atr / price * 100).toFixed(1);
    risks.push({ level: dailyRisk > 3 ? 'high' : dailyRisk > 1.5 ? 'medium' : 'low', text: `Average daily range: ${dailyRisk}% ($${atr.toFixed(2)}) — ${dailyRisk > 3 ? 'very volatile' : dailyRisk > 1.5 ? 'moderately volatile' : 'low volatility'}` });
  }

  if (week52High && price >= week52High * 0.95) {
    risks.push({ level: 'medium', text: 'Near 52-week high — potential resistance zone' });
  }

  return risks;
}

// --- Long-term Projection ---
function generateLongTermProjection(data) {
  const { price, revenueGrowth, epsGrowth, pe, eps } = data;
  if (!price) return null;

  // Use actual growth rate if available, otherwise conservative estimate
  const growthRate = epsGrowth && epsGrowth > 0 ? Math.min(epsGrowth, 40) : revenueGrowth && revenueGrowth > 0 ? Math.min(revenueGrowth * 0.7, 25) : 8;

  const projections = [];
  let currentPrice = price;
  const years = [1, 2, 3, 5, 10];

  // Three scenarios: bear, base, bull
  const scenarios = [
    { name: 'Conservative', growthMult: 0.5 },
    { name: 'Base Case', growthMult: 1.0 },
    { name: 'Optimistic', growthMult: 1.5 },
  ];

  for (const year of years) {
    const yearProjection = { year };
    for (const scenario of scenarios) {
      const rate = growthRate * scenario.growthMult / 100;
      yearProjection[scenario.name] = +(price * Math.pow(1 + rate, year)).toFixed(2);
    }
    projections.push(yearProjection);
  }

  // Investment return calculation
  const investmentAmounts = [1000, 5000, 10000, 25000];
  const returns = investmentAmounts.map(amt => ({
    invested: amt,
    shares: +(amt / price).toFixed(2),
    value5yr: +(amt * Math.pow(1 + growthRate / 100, 5)).toFixed(2),
    value10yr: +(amt * Math.pow(1 + growthRate / 100, 10)).toFixed(2),
  }));

  return {
    growthRateUsed: growthRate,
    projections,
    returns,
    disclaimer: 'Projections are hypothetical based on historical growth rates. Past performance does not guarantee future results.',
  };
}

// --- Future Projection for chart ---
function generateFutureProjection(data) {
  const { price, candles, revenueGrowth, epsGrowth } = data;
  if (!price || !candles || candles.length < 30) return null;

  const growthRate = epsGrowth && epsGrowth > 0 ? Math.min(epsGrowth, 40) : revenueGrowth && revenueGrowth > 0 ? Math.min(revenueGrowth * 0.7, 25) : 8;
  const dailyRate = growthRate / 100 / 252; // Trading days per year

  // Calculate historical volatility for the confidence band
  const returns = [];
  for (let i = 1; i < candles.length; i++) {
    returns.push(Math.log(candles[i].close / candles[i - 1].close));
  }
  const volatility = Math.sqrt(returns.reduce((s, r) => s + r * r, 0) / returns.length);

  // Generate 252 trading days (1 year) of projection
  const lastCandle = candles[candles.length - 1];
  const lastTime = lastCandle.time;
  const projection = [];
  let projPrice = price;

  for (let i = 1; i <= 252; i++) {
    projPrice = projPrice * (1 + dailyRate);
    const time = lastTime + i * 86400; // Approximate — add 1 day in seconds
    const upperBand = projPrice * (1 + volatility * Math.sqrt(i) * 1.5);
    const lowerBand = projPrice * (1 - volatility * Math.sqrt(i) * 1.5);
    projection.push({
      time,
      value: +projPrice.toFixed(2),
      upper: +upperBand.toFixed(2),
      lower: +Math.max(lowerBand, 0).toFixed(2),
    });
  }

  return { projection, growthRate, volatility: +(volatility * Math.sqrt(252) * 100).toFixed(1) };
}

// --- Comprehensive Options Strategies ---
function generateOptionsStrategies(data) {
  const { price, indicators, pe, beta, week52High, week52Low, candles, name, symbol } = data;
  if (!price || price <= 0) return null;
  const { rsi, atr, signal, sma20, sma50, sma200, bollingerUpper, bollingerLower, macd, macdSignal } = indicators || {};

  const strategies = [];

  // Estimate implied volatility from ATR or beta
  const ivEstimate = atr ? (atr / price * 100 * Math.sqrt(252)) : beta ? (beta * 20) : 30;
  const ivLevel = ivEstimate > 50 ? 'High' : ivEstimate > 30 ? 'Moderate' : 'Low';

  // Bollinger Band width as squeeze indicator
  const bbWidth = bollingerUpper && bollingerLower ? ((bollingerUpper - bollingerLower) / price * 100) : null;
  const isSqueeze = bbWidth !== null && bbWidth < 6;

  // Position in 52-week range
  const rangePct = week52High && week52Low ? ((price - week52Low) / (week52High - week52Low) * 100) : 50;

  // --- Strategy 1: Directional Options ---
  if (signal === 'Bullish' || (rsi && rsi < 35)) {
    const callStrike = Math.round(price * 1.05 / 5) * 5; // Round to nearest $5
    const estimatedPremium = +(price * (ivEstimate / 100) * Math.sqrt(30 / 365) * 0.4).toFixed(2);
    strategies.push({
      name: 'Bullish Call Option',
      type: 'directional',
      direction: 'Bullish',
      legs: [
        { action: 'BUY', type: 'CALL', strike: `$${callStrike}`, expiry: '30-45 DTE', premium: `~$${estimatedPremium}` },
      ],
      maxProfit: 'Unlimited',
      maxLoss: `Premium paid (~$${estimatedPremium}/contract)`,
      breakeven: `$${(callStrike + estimatedPremium).toFixed(2)}`,
      reasoning: `${signal === 'Bullish' ? 'Technical signals bullish' : `RSI oversold (${rsi?.toFixed(1)})`}. ${sma20 && price > sma20 ? 'Above SMA 20.' : ''} ${macd && macdSignal && macd > macdSignal ? 'MACD bullish crossover.' : ''}`,
      confidence: rsi && rsi < 30 && signal === 'Bullish' ? 'High' : 'Medium',
    });
  }

  if (signal === 'Bearish' || (rsi && rsi > 70)) {
    const putStrike = Math.round(price * 0.95 / 5) * 5;
    const estimatedPremium = +(price * (ivEstimate / 100) * Math.sqrt(30 / 365) * 0.4).toFixed(2);
    strategies.push({
      name: 'Bearish Put Option',
      type: 'directional',
      direction: 'Bearish',
      legs: [
        { action: 'BUY', type: 'PUT', strike: `$${putStrike}`, expiry: '30-45 DTE', premium: `~$${estimatedPremium}` },
      ],
      maxProfit: `$${putStrike} - premium (if stock goes to $0)`,
      maxLoss: `Premium paid (~$${estimatedPremium}/contract)`,
      breakeven: `$${(putStrike - estimatedPremium).toFixed(2)}`,
      reasoning: `${signal === 'Bearish' ? 'Technical signals bearish' : `RSI overbought (${rsi?.toFixed(1)})`}. ${sma20 && price < sma20 ? 'Below SMA 20.' : ''} ${macd && macdSignal && macd < macdSignal ? 'MACD bearish.' : ''}`,
      confidence: rsi && rsi > 75 && signal === 'Bearish' ? 'High' : 'Medium',
    });
  }

  // --- Strategy 2: Covered Call (if holding shares) ---
  {
    const ccStrike = Math.round(price * 1.08 / 5) * 5;
    const ccPremium = +(price * (ivEstimate / 100) * Math.sqrt(30 / 365) * 0.3).toFixed(2);
    const annualReturn = ((ccPremium / price) * 12 * 100).toFixed(1);
    strategies.push({
      name: 'Covered Call (Income)',
      type: 'income',
      direction: 'Neutral to Mildly Bullish',
      legs: [
        { action: 'OWN', type: '100 shares', strike: `$${price.toFixed(2)}`, expiry: '', premium: '' },
        { action: 'SELL', type: 'CALL', strike: `$${ccStrike}`, expiry: '30 DTE', premium: `~$${ccPremium}` },
      ],
      maxProfit: `$${((ccStrike - price + ccPremium) * 100).toFixed(0)}/contract`,
      maxLoss: `Stock decline minus premium collected`,
      breakeven: `$${(price - ccPremium).toFixed(2)}`,
      reasoning: `Collect ~$${ccPremium}/share monthly premium (${annualReturn}% annualized). ${ivLevel} IV makes premium ${ivLevel === 'High' ? 'attractive' : 'decent'}. Best when you expect sideways to mild upside.`,
      confidence: ivLevel === 'High' ? 'High' : 'Medium',
    });
  }

  // --- Strategy 3: Cash Secured Put (for entry) ---
  {
    const cspStrike = Math.round(price * 0.92 / 5) * 5;
    const cspPremium = +(price * (ivEstimate / 100) * Math.sqrt(30 / 365) * 0.3).toFixed(2);
    const discount = ((1 - cspStrike / price) * 100).toFixed(1);
    strategies.push({
      name: 'Cash Secured Put (Entry)',
      type: 'income',
      direction: 'Bullish (willing to buy at discount)',
      legs: [
        { action: 'SELL', type: 'PUT', strike: `$${cspStrike}`, expiry: '30-45 DTE', premium: `~$${cspPremium}` },
      ],
      maxProfit: `$${(cspPremium * 100).toFixed(0)}/contract (if expires OTM)`,
      maxLoss: `Obligation to buy 100 shares at $${cspStrike}`,
      breakeven: `$${(cspStrike - cspPremium).toFixed(2)}`,
      reasoning: `Get paid ~$${cspPremium}/share to wait. If assigned, effective entry at $${(cspStrike - cspPremium).toFixed(2)} — ${discount}% below current price. Great if you want to own the stock cheaper.`,
      confidence: 'Medium',
    });
  }

  // --- Strategy 4: Iron Condor (if neutral / high IV) ---
  if (ivLevel !== 'Low') {
    const icShortCall = Math.round(price * 1.10 / 5) * 5;
    const icLongCall = icShortCall + 10;
    const icShortPut = Math.round(price * 0.90 / 5) * 5;
    const icLongPut = icShortPut - 10;
    const icCredit = +(price * (ivEstimate / 100) * Math.sqrt(30 / 365) * 0.2).toFixed(2);
    strategies.push({
      name: 'Iron Condor (Neutral)',
      type: 'income',
      direction: 'Neutral (range-bound)',
      legs: [
        { action: 'BUY', type: 'PUT', strike: `$${icLongPut}`, expiry: '30-45 DTE', premium: '' },
        { action: 'SELL', type: 'PUT', strike: `$${icShortPut}`, expiry: '30-45 DTE', premium: '' },
        { action: 'SELL', type: 'CALL', strike: `$${icShortCall}`, expiry: '30-45 DTE', premium: '' },
        { action: 'BUY', type: 'CALL', strike: `$${icLongCall}`, expiry: '30-45 DTE', premium: '' },
      ],
      maxProfit: `~$${(icCredit * 100).toFixed(0)}/contract (net credit)`,
      maxLoss: `$${((10 - icCredit) * 100).toFixed(0)}/contract (width minus credit)`,
      breakeven: `$${icShortPut - icCredit} / $${icShortCall + icCredit}`,
      reasoning: `${ivLevel} IV = higher premium. Profit if ${symbol} stays between $${icShortPut}-$${icShortCall} by expiry. ${bbWidth ? `BB width: ${bbWidth.toFixed(1)}%.` : ''} ${isSqueeze ? 'Caution: BB squeeze detected — breakout possible.' : ''}`,
      confidence: isSqueeze ? 'Low' : signal === 'Neutral' ? 'High' : 'Medium',
    });
  }

  // --- Strategy 5: LEAP Call (long-term bullish) ---
  if (sma200 && price > sma200 * 0.95) {
    const leapStrike = Math.round(price * 0.80 / 5) * 5;
    const leapPremium = +(price * (ivEstimate / 100) * Math.sqrt(365 / 365) * 0.6).toFixed(2);
    strategies.push({
      name: 'LEAP Call (Long-term)',
      type: 'directional',
      direction: 'Long-term Bullish',
      legs: [
        { action: 'BUY', type: 'CALL', strike: `$${leapStrike}`, expiry: '12-18 months', premium: `~$${leapPremium}` },
      ],
      maxProfit: 'Unlimited',
      maxLoss: `Premium paid (~$${leapPremium}/contract)`,
      breakeven: `$${(leapStrike + leapPremium).toFixed(2)}`,
      reasoning: `Deep ITM LEAP (delta ~0.80) acts as stock replacement with less capital. ${sma200 ? `Price ${price > sma200 ? 'above' : 'near'} SMA 200.` : ''} ${pe && pe < 30 ? `Reasonable P/E (${pe.toFixed(1)}).` : ''} Good for 1-2 year bullish thesis.`,
      confidence: signal === 'Bullish' && rangePct < 80 ? 'High' : 'Medium',
    });
  }

  // --- Strategy 6: Protective Put (if holding) ---
  {
    const ppStrike = Math.round(price * 0.90 / 5) * 5;
    const ppPremium = +(price * (ivEstimate / 100) * Math.sqrt(60 / 365) * 0.35).toFixed(2);
    strategies.push({
      name: 'Protective Put (Hedge)',
      type: 'hedge',
      direction: 'Downside Protection',
      legs: [
        { action: 'OWN', type: '100 shares', strike: `$${price.toFixed(2)}`, expiry: '', premium: '' },
        { action: 'BUY', type: 'PUT', strike: `$${ppStrike}`, expiry: '60 DTE', premium: `~$${ppPremium}` },
      ],
      maxProfit: 'Unlimited upside (minus put premium)',
      maxLoss: `$${((price - ppStrike + ppPremium) * 100).toFixed(0)}/contract`,
      breakeven: `$${(price + ppPremium).toFixed(2)}`,
      reasoning: `Insurance against a drop below $${ppStrike}. Cost: ~$${ppPremium}/share. ${rsi && rsi > 65 ? `RSI elevated (${rsi.toFixed(1)}) — hedging is prudent.` : ''} ${rangePct > 80 ? 'Near 52-week high — protection is wise.' : ''}`,
      confidence: rangePct > 75 || (rsi && rsi > 70) ? 'High' : 'Medium',
    });
  }

  // --- Volatility summary ---
  const volatilitySummary = {
    ivEstimate: +ivEstimate.toFixed(1),
    ivLevel,
    bbWidth: bbWidth ? +bbWidth.toFixed(1) : null,
    isSqueeze,
    recommendation: ivLevel === 'High'
      ? 'High IV environment — favor SELLING premium (covered calls, iron condors, credit spreads)'
      : ivLevel === 'Low'
      ? 'Low IV environment — favor BUYING options (calls, puts, straddles). Premium is cheap.'
      : 'Moderate IV — both buying and selling strategies are viable.',
  };

  return { strategies, volatilitySummary };
}
