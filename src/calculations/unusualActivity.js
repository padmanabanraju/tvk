export function detectUnusualActivity(chain) {
  return chain
    .filter(o => o.volume > 0 && o.open_interest > 0)
    .filter(o => o.volume > (o.open_interest * 2))
    .sort((a, b) => (b.volume / b.open_interest) - (a.volume / a.open_interest))
    .slice(0, 10)
    .map(o => ({
      strike: o.strike,
      type: o.option_type,
      volume: o.volume,
      openInterest: o.open_interest,
      ratio: (o.volume / o.open_interest).toFixed(1),
      iv: o.greeks?.mid_iv ? (o.greeks.mid_iv * 100).toFixed(1) + '%' : null,
      signal: o.volume > (o.open_interest * 5) ? 'EXTREME' :
              o.volume > (o.open_interest * 3) ? 'HIGH' : 'ELEVATED',
    }));
}
