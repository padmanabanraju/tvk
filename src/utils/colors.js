export const colors = {
  bullish: '#22c55e',
  bearish: '#ef4444',
  neutral: '#f59e0b',
  extreme: '#a855f7',
  bg: '#08080e',
  card: '#0d1117',
  border: 'rgba(255,255,255,0.05)',
  text: '#d0d0dd',
  muted: '#666',
};

export function getChangeColor(value) {
  if (value > 0) return colors.bullish;
  if (value < 0) return colors.bearish;
  return colors.muted;
}

export function getSentimentColor(sentiment) {
  if (!sentiment) return colors.muted;
  const s = sentiment.toUpperCase();
  if (s.includes('BULL') || s.includes('BUY') || s.includes('POSITIVE')) return colors.bullish;
  if (s.includes('BEAR') || s.includes('SELL') || s.includes('NEGATIVE')) return colors.bearish;
  return colors.neutral;
}

export function getRSIColor(rsi) {
  if (rsi <= 30) return colors.bearish;
  if (rsi >= 70) return colors.bullish;
  return colors.neutral;
}
