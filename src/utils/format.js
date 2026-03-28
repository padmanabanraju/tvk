export function formatCurrency(num, decimals = 2) {
  if (num == null || isNaN(num)) return '—';
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatNumber(num, decimals = 2) {
  if (num == null || isNaN(num)) return '—';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatLargeNumber(num) {
  if (num == null || isNaN(num)) return '—';
  const abs = Math.abs(num);
  if (abs >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(2);
}

export function formatPercent(num, decimals = 1) {
  if (num == null || isNaN(num)) return '—';
  return num.toFixed(decimals) + '%';
}

export function formatAge(ms) {
  if (ms < 60000) return 'just now';
  if (ms < 3600000) return Math.floor(ms / 60000) + 'm ago';
  if (ms < 86400000) return Math.floor(ms / 3600000) + 'h ago';
  return Math.floor(ms / 86400000) + 'd ago';
}

export function timeAgo(dateStr) {
  const ms = Date.now() - new Date(dateStr).getTime();
  return formatAge(ms);
}
