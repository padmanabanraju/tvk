export function calculateExpectedMove(optionsChain, currentPrice) {
  if (!optionsChain || optionsChain.length === 0 || !currentPrice) return null;

  // Find ATM strike
  const strikes = [...new Set(optionsChain.map(o => o.strike))];
  const atmStrike = strikes.reduce((closest, strike) =>
    Math.abs(strike - currentPrice) < Math.abs(closest - currentPrice) ? strike : closest
  );

  const atmCall = optionsChain.find(o => o.strike === atmStrike && o.option_type === 'call');
  const atmPut = optionsChain.find(o => o.strike === atmStrike && o.option_type === 'put');

  if (!atmCall || !atmPut) return null;

  const callMid = (atmCall.bid + atmCall.ask) / 2 || atmCall.last || 0;
  const putMid = (atmPut.bid + atmPut.ask) / 2 || atmPut.last || 0;

  if (callMid === 0 && putMid === 0) return null;

  const straddle = callMid + putMid;
  const expectedMove = straddle * 0.85;
  const expectedMovePct = (expectedMove / currentPrice) * 100;

  return {
    straddle: straddle.toFixed(2),
    expectedMove: expectedMove.toFixed(2),
    expectedMovePct: expectedMovePct.toFixed(1),
    upperBound: (currentPrice + expectedMove).toFixed(2),
    lowerBound: (currentPrice - expectedMove).toFixed(2),
    atmStrike,
    atmCallPrice: callMid.toFixed(2),
    atmPutPrice: putMid.toFixed(2),
  };
}
