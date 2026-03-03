// Technical Indicator Calculations — all pure functions operating on number arrays

export function calcSMA(closes, period) {
  const result = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += closes[j];
      result.push(sum / period);
    }
  }
  return result;
}

export function calcEMA(closes, period) {
  const k = 2 / (period + 1);
  const result = [];

  // Seed with SMA of first `period` values
  let sum = 0;
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      sum += closes[i];
      result.push(null);
    } else if (i === period - 1) {
      sum += closes[i];
      result.push(sum / period);
    } else {
      result.push(closes[i] * k + result[i - 1] * (1 - k));
    }
  }
  return result;
}

export function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return closes.map(() => null);

  const result = new Array(closes.length).fill(null);
  const gains = [];
  const losses = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  // First average
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result[period] = 100 - 100 / (1 + rs);

  // Wilder's smoothing
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result[i + 1] = 100 - 100 / (1 + rs);
  }

  return result;
}

export function calcMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const emaFast = calcEMA(closes, fastPeriod);
  const emaSlow = calcEMA(closes, slowPeriod);

  const macdLine = emaFast.map((fast, i) => {
    if (fast === null || emaSlow[i] === null) return null;
    return fast - emaSlow[i];
  });

  // Signal line = EMA of MACD line (skip nulls for EMA calculation)
  const validMacd = [];
  const validIndices = [];
  macdLine.forEach((v, i) => {
    if (v !== null) {
      validMacd.push(v);
      validIndices.push(i);
    }
  });

  const signalEma = calcEMA(validMacd, signalPeriod);
  const signalLine = new Array(closes.length).fill(null);
  const histogram = new Array(closes.length).fill(null);

  validIndices.forEach((idx, i) => {
    signalLine[idx] = signalEma[i];
    if (macdLine[idx] !== null && signalEma[i] !== null) {
      histogram[idx] = macdLine[idx] - signalEma[i];
    }
  });

  return { macdLine, signalLine, histogram };
}

export function calcBollingerBands(closes, period = 20, multiplier = 2) {
  const sma = calcSMA(closes, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < closes.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      let sumSqDiff = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sumSqDiff += (closes[j] - sma[i]) ** 2;
      }
      const stdDev = Math.sqrt(sumSqDiff / period);
      upper.push(sma[i] + multiplier * stdDev);
      lower.push(sma[i] - multiplier * stdDev);
    }
  }

  return { upper, middle: sma, lower };
}

export function calcATR(highs, lows, closes, period = 14) {
  if (closes.length < 2) return closes.map(() => null);

  const trueRanges = [highs[0] - lows[0]];
  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }

  const result = new Array(closes.length).fill(null);
  if (trueRanges.length < period) return result;

  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result[period - 1] = atr;

  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
    result[i] = atr;
  }

  return result;
}

export function calcStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
  const kValues = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(null);
    } else {
      const highSlice = highs.slice(i - kPeriod + 1, i + 1);
      const lowSlice = lows.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...highSlice);
      const lowestLow = Math.min(...lowSlice);
      const range = highestHigh - lowestLow;
      kValues.push(range === 0 ? 50 : ((closes[i] - lowestLow) / range) * 100);
    }
  }

  const dValues = calcSMA(
    kValues.map((v) => (v === null ? 0 : v)),
    dPeriod
  );

  return { k: kValues, d: dValues };
}

// Convenience: get the latest non-null value from an indicator array
export function latestValue(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null) return arr[i];
  }
  return null;
}
