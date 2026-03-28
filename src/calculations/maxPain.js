export function calculateMaxPain(optionsChain) {
  const strikes = [...new Set(optionsChain.map(o => o.strike))].sort((a, b) => a - b);
  let minPain = Infinity;
  let maxPainStrike = 0;

  for (const testStrike of strikes) {
    let totalPain = 0;
    for (const opt of optionsChain) {
      if (opt.option_type === 'call' && testStrike > opt.strike) {
        totalPain += (testStrike - opt.strike) * (opt.open_interest || 0) * 100;
      }
      if (opt.option_type === 'put' && testStrike < opt.strike) {
        totalPain += (opt.strike - testStrike) * (opt.open_interest || 0) * 100;
      }
    }
    if (totalPain < minPain) {
      minPain = totalPain;
      maxPainStrike = testStrike;
    }
  }
  return { strike: maxPainStrike, totalPain: minPain };
}
