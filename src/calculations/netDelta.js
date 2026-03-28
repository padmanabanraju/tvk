export function calculateNetDelta(chain) {
  let netDelta = 0;
  for (const opt of chain) {
    if (!opt.greeks?.delta || !opt.open_interest) continue;
    const dealerDelta = opt.option_type === 'call'
      ? -opt.greeks.delta * opt.open_interest * 100
      : opt.greeks.delta * opt.open_interest * 100;
    netDelta += dealerDelta;
  }
  return {
    netDelta,
    direction: netDelta > 0 ? 'DEALERS LONG (bearish for stock)' : 'DEALERS SHORT (bullish for stock)',
  };
}
