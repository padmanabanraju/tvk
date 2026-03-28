export function calculateWalls(chain) {
  const calls = chain.filter(o => o.option_type === 'call');
  const puts = chain.filter(o => o.option_type === 'put');

  const callWall = calls.reduce((max, o) => (o.open_interest || 0) > (max.open_interest || 0) ? o : max, { open_interest: 0 });
  const putWall = puts.reduce((max, o) => (o.open_interest || 0) > (max.open_interest || 0) ? o : max, { open_interest: 0 });

  return {
    callWall: { strike: callWall.strike, oi: callWall.open_interest || 0 },
    putWall: { strike: putWall.strike, oi: putWall.open_interest || 0 },
  };
}
