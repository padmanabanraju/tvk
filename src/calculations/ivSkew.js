export function calculateIVSkew(chain, spotPrice) {
  const otmPuts = chain.filter(o => o.option_type === 'put' && o.strike < spotPrice && o.greeks?.mid_iv);
  const otmCalls = chain.filter(o => o.option_type === 'call' && o.strike > spotPrice && o.greeks?.mid_iv);

  const avgPutIV = otmPuts.reduce((s, o) => s + o.greeks.mid_iv, 0) / (otmPuts.length || 1);
  const avgCallIV = otmCalls.reduce((s, o) => s + o.greeks.mid_iv, 0) / (otmCalls.length || 1);

  return {
    putIV: (avgPutIV * 100).toFixed(1),
    callIV: (avgCallIV * 100).toFixed(1),
    skew: (avgPutIV / (avgCallIV || 0.01)).toFixed(2),
    interpretation: avgPutIV > avgCallIV * 1.2 ? 'FEAR ELEVATED — puts expensive' :
                    avgCallIV > avgPutIV * 1.2 ? 'GREED — calls expensive' : 'BALANCED',
  };
}
