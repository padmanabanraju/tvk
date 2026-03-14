import { Activity, TrendingUp, BarChart3, Layers, Compass, DollarSign, BarChart2 } from 'lucide-react';

function formatValue(value, format) {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value !== 'number') return value;
  if (format === 'volume') {
    const abs = Math.abs(value);
    if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(0);
  }
  return value.toFixed(2);
}

function IndicatorCard({ label, value, icon: Icon, description, color = '#00ffc8', format }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#5a6478] uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="text-xl font-bold mono" style={{ color }}>
        {formatValue(value, format)}
      </div>
      {description && <div className="text-xs text-[#5a6478] mt-1">{description}</div>}
    </div>
  );
}

function getSignalDescription(label, value) {
  if (value === null || value === undefined) return '';
  switch (label) {
    case 'RSI':
      if (value < 30) return 'Oversold';
      if (value > 70) return 'Overbought';
      return 'Neutral';
    case 'Stoch %K':
      if (value < 20) return 'Oversold';
      if (value > 80) return 'Overbought';
      return 'Neutral';
    case 'ADX':
      if (value > 50) return 'Very Strong Trend';
      if (value > 25) return 'Strong Trend';
      if (value > 20) return 'Moderate Trend';
      return 'Weak / No Trend';
    default:
      return '';
  }
}

function getColor(label, value) {
  if (value === null || value === undefined) return '#5a6478';
  switch (label) {
    case 'RSI':
      if (value < 30) return '#00ffc8';
      if (value > 70) return '#ff4976';
      return '#ffd700';
    case 'MACD':
      return value > 0 ? '#00ffc8' : '#ff4976';
    case 'Stoch %K':
      if (value < 20) return '#00ffc8';
      if (value > 80) return '#ff4976';
      return '#ffd700';
    case 'ADX':
      if (value > 25) return '#00ffc8';
      if (value > 20) return '#ffd700';
      return '#5a6478';
    case 'OBV':
      return value > 0 ? '#00ffc8' : '#ff4976';
    default:
      return '#00ffc8';
  }
}

export function TechnicalIndicators({ indicators }) {
  if (!indicators) return null;

  const cards = [
    { label: 'RSI', value: indicators.rsi, icon: Activity },
    { label: 'MACD', value: indicators.macd, icon: TrendingUp },
    { label: 'MACD Signal', value: indicators.macdSignal, icon: TrendingUp },
    { label: 'MACD Hist', value: indicators.macdHistogram, icon: BarChart3 },
    { label: 'Stoch %K', value: indicators.stochasticK, icon: Activity },
    { label: 'ATR', value: indicators.atr, icon: Layers },
    { label: 'ADX', value: indicators.adx, icon: Compass },
    { label: 'VWAP', value: indicators.vwap, icon: DollarSign },
    { label: 'OBV', value: indicators.obv, icon: BarChart2, format: 'volume' },
    { label: 'SMA 20', value: indicators.sma20, icon: TrendingUp },
    { label: 'SMA 50', value: indicators.sma50, icon: TrendingUp },
    { label: 'SMA 200', value: indicators.sma200, icon: TrendingUp },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-[#e0e6ed] mb-4 uppercase tracking-wider">Technical Indicators</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card) => (
          <IndicatorCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            description={getSignalDescription(card.label, card.value)}
            color={getColor(card.label, card.value)}
            format={card.format}
          />
        ))}
      </div>
    </div>
  );
}
