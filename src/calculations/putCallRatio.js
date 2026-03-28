export function calculatePutCallRatios(chain) {
  const calls = chain.filter(o => o.option_type === 'call');
  const puts = chain.filter(o => o.option_type === 'put');

  const callVolume = calls.reduce((sum, o) => sum + (o.volume || 0), 0);
  const putVolume = puts.reduce((sum, o) => sum + (o.volume || 0), 0);
  const callOI = calls.reduce((sum, o) => sum + (o.open_interest || 0), 0);
  const putOI = puts.reduce((sum, o) => sum + (o.open_interest || 0), 0);

  return {
    volumeRatio: putVolume / (callVolume || 1),
    oiRatio: putOI / (callOI || 1),
    totalCallVol: callVolume,
    totalPutVol: putVolume,
    totalCallOI: callOI,
    totalPutOI: putOI,
    sentiment: (putVolume / (callVolume || 1)) > 1.2 ? 'BEARISH' :
               (putVolume / (callVolume || 1)) < 0.8 ? 'BULLISH' : 'NEUTRAL',
  };
}
