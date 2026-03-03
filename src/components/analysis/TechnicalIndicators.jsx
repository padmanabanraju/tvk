import { Activity, TrendingUp, BarChart3, Layers } from 'lucide-react';

function IndicatorCard({ label, value, icon: Icon, description, color = '#00ffc8' }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#5a6478] uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="text-xl font-bold mono" style={{ color }}>
        {value !== null && value !== undefined ? (typeof value === 'number' ? value.toFixed(2) : value) : 'N/A'}
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
    { label: 'SMA 20', value: indicators.sma20, icon: TrendingUp },
    { label: 'SMA 50', value: indicators.sma50, icon: TrendingUp },
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
          />
        ))}
      </div>
    </div>
  );
}
