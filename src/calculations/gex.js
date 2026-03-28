export function calculateGEX(chain, spotPrice) {
  let netGEX = 0;
  const gexByStrike = {};

  for (const opt of chain) {
    if (!opt.greeks?.gamma || !opt.open_interest) continue;

    const gamma = opt.greeks.gamma;
    const oi = opt.open_interest;
    const gex = gamma * oi * 100 * spotPrice * spotPrice * 0.01;

    const signedGEX = opt.option_type === 'call' ? gex : -gex;
    netGEX += signedGEX;

    if (!gexByStrike[opt.strike]) gexByStrike[opt.strike] = 0;
    gexByStrike[opt.strike] += signedGEX;
  }

  const strikes = Object.keys(gexByStrike).map(Number).sort((a, b) => a - b);
  let gammaFlip = spotPrice;
  let cumGEX = 0;
  for (const strike of strikes) {
    const prevCum = cumGEX;
    cumGEX += gexByStrike[strike];
    if (prevCum > 0 && cumGEX < 0) { gammaFlip = strike; break; }
  }

  return {
    netGEX,
    regime: netGEX > 0 ? 'POSITIVE' : 'NEGATIVE',
    implication: netGEX > 0 ? 'Pin likely — mean reversion' : 'Vol expansion — momentum',
    gammaFlip,
    gexByStrike,
  };
}
