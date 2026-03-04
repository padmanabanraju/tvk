import { useRef, useEffect, useState } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';

const TIMEFRAMES = [
  { label: '1W', days: 7, resolution: '15' },
  { label: '1M', days: 30, resolution: '60' },
  { label: '3M', days: 90, resolution: 'D' },
  { label: '6M', days: 180, resolution: 'D' },
  { label: '1Y', days: 365, resolution: 'D' },
];

export function CandlestickChart({ candles, chartOverlays, height, onTimeframeChange }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const [activeTimeframe, setActiveTimeframe] = useState('6M');

  // Responsive: shorter on mobile
  const chartHeight = height || (typeof window !== 'undefined' && window.innerWidth < 768 ? 300 : 450);

  useEffect(() => {
    if (!containerRef.current || !candles?.length) return;

    // Clean up previous chart (try-catch for React StrictMode double-invoke)
    if (chartRef.current) {
      try { chartRef.current.remove(); } catch (_) { /* already disposed */ }
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: chartHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8892a6',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(37, 44, 58, 0.5)' },
        horzLines: { color: 'rgba(37, 44, 58, 0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(0, 255, 200, 0.3)', width: 1 },
        horzLine: { color: 'rgba(0, 255, 200, 0.3)', width: 1 },
      },
      rightPriceScale: {
        borderColor: '#252c3a',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#252c3a',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Candlestick series (v5 API)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00ffc8',
      downColor: '#ff4976',
      borderUpColor: '#00ffc8',
      borderDownColor: '#ff4976',
      wickUpColor: '#00ffc8',
      wickDownColor: '#ff4976',
    });
    candleSeries.setData(candles);

    // Volume histogram (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(0, 255, 200, 0.2)' : 'rgba(255, 73, 118, 0.2)',
      }))
    );

    // SMA overlays (v5 API)
    if (chartOverlays?.sma20?.length > 1) {
      const sma20Line = chart.addSeries(LineSeries, { color: '#9d4edd', lineWidth: 1, title: 'SMA 20' });
      sma20Line.setData(chartOverlays.sma20);
    }
    if (chartOverlays?.sma50?.length > 1) {
      const sma50Line = chart.addSeries(LineSeries, { color: '#ff6b35', lineWidth: 1, title: 'SMA 50' });
      sma50Line.setData(chartOverlays.sma50);
    }
    if (chartOverlays?.sma200?.length > 1) {
      const sma200Line = chart.addSeries(LineSeries, { color: '#ffd700', lineWidth: 1, title: 'SMA 200', lineStyle: 2 });
      sma200Line.setData(chartOverlays.sma200);
    }

    // Bollinger Bands (v5 API)
    if (chartOverlays?.bollingerUpper?.length > 1) {
      const bbUpper = chart.addSeries(LineSeries, { color: 'rgba(0, 255, 200, 0.3)', lineWidth: 1, lineStyle: 2 });
      bbUpper.setData(chartOverlays.bollingerUpper);
    }
    if (chartOverlays?.bollingerLower?.length > 1) {
      const bbLower = chart.addSeries(LineSeries, { color: 'rgba(0, 255, 200, 0.3)', lineWidth: 1, lineStyle: 2 });
      bbLower.setData(chartOverlays.bollingerLower);
    }

    chart.timeScale().fitContent();

    // Responsive resize
    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    chartRef.current = chart;

    return () => {
      ro.disconnect();
      chartRef.current = null;
      try { chart.remove(); } catch (_) { /* already disposed */ }
    };
  }, [candles, chartOverlays, chartHeight]);

  const handleTimeframeChange = (tf) => {
    setActiveTimeframe(tf.label);
    if (onTimeframeChange) {
      const to = Math.floor(Date.now() / 1000);
      const from = to - tf.days * 24 * 60 * 60;
      onTimeframeChange(tf.resolution, from, to);
    }
  };

  return (
    <div>
      {/* Timeframe selector */}
      <div className="flex items-center gap-1 mb-3">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.label}
            onClick={() => handleTimeframeChange(tf)}
            className={`px-3 py-1 text-xs font-medium rounded transition-all ${
              activeTimeframe === tf.label
                ? 'bg-[#00ffc8] text-[#0a0e14]'
                : 'bg-[#1a1f2b] text-[#8892a6] hover:text-[#e0e6ed] hover:bg-[#252c3a]'
            }`}
          >
            {tf.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs text-[#5a6478]">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#9d4edd] inline-block"></span> SMA 20</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#ff6b35] inline-block"></span> SMA 50</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#ffd700] inline-block"></span> SMA 200</span>
        </div>
      </div>
      <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
    </div>
  );
}
