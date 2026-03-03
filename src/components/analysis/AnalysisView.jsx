import { useState, useCallback, useMemo } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { useStockData } from '../../hooks/useStockData';
import { finnhubClient } from '../../services/finnhub';
import { transformCandles, computeIndicators } from '../../services/dataTransformers';
import { generateFullAnalysis } from '../../services/analysisEngine';
import { CandlestickChart } from '../charts/CandlestickChart';
import { PriceHeader } from './PriceHeader';
import { TechnicalIndicators } from './TechnicalIndicators';
import { MAAnalysis } from './MAAnalysis';
import { AIInsights } from './AIInsights';
import { PriceTargets } from './PriceTargets';
import { TradingStrategy } from './TradingStrategy';
import { OptionsStrategy } from './OptionsStrategy';
import { FutureProjection } from './FutureProjection';
import { NewsFeed } from './NewsFeed';
import { EarningsCard } from './EarningsCard';
import { KeyStatistics } from './KeyStatistics';
import { ChartSkeleton } from '../common/LoadingSkeleton';
import { ErrorBanner } from '../common/ErrorBanner';

export function AnalysisView({ symbol, onSymbolChange }) {
  const { data, loading, error, warnings, refetch } = useStockData(symbol);
  const [searchInput, setSearchInput] = useState('');
  const [chartCandles, setChartCandles] = useState(null);
  const [chartOverlays, setChartOverlays] = useState(null);

  const analysis = useMemo(() => {
    if (!data) return null;
    return generateFullAnalysis(data);
  }, [data]);

  const handleSearch = (e) => {
    e.preventDefault();
    const sym = searchInput.trim().toUpperCase();
    if (sym && onSymbolChange) {
      onSymbolChange(sym);
      setSearchInput('');
      setChartCandles(null);
      setChartOverlays(null);
    }
  };

  const handleTimeframeChange = useCallback(async (resolution, from, to) => {
    if (!symbol) return;
    try {
      const rawCandles = await finnhubClient.getCandles(symbol, resolution, from, to);
      const candles = transformCandles(rawCandles);
      const indicators = computeIndicators(candles);
      setChartCandles(candles);
      setChartOverlays(indicators.chartOverlays);
    } catch (err) {
      // Fall back to existing candles
    }
  }, [symbol]);

  const displayCandles = chartCandles || data?.candles;
  const displayOverlays = chartOverlays || data?.chartOverlays;

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6478]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search symbol (e.g., AAPL, TSLA, NVDA)..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#131720] border border-[#252c3a] rounded-xl text-sm text-[#e0e6ed] placeholder-[#5a6478] focus:outline-none focus:border-[#00ffc8]/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#00ffc8] text-[#0a0e14] rounded-xl text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors"
        >
          Analyze
        </button>
      </form>

      {loading && <ChartSkeleton />}
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Warnings */}
      {warnings && warnings.length > 0 && warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-[#ffd700]/5 border border-[#ffd700]/20 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-[#ffd700] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-xs text-[#ffd700]">{w}</span>
            <button onClick={refetch} className="ml-2 text-xs text-[#00ffc8] hover:underline">Retry</button>
          </div>
        </div>
      ))}

      {!loading && !error && !data && (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Search className="w-12 h-12 text-[#5a6478] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#e0e6ed] mb-2">Search for a stock</h3>
          <p className="text-sm text-[#5a6478]">Enter a ticker symbol above to view real-time analysis with AI insights</p>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Row 1: Chart + Key Stats + AI Insights */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <PriceHeader data={data} />
                {displayCandles && displayCandles.length > 0 ? (
                  <CandlestickChart
                    candles={displayCandles}
                    chartOverlays={displayOverlays}
                    onTimeframeChange={handleTimeframeChange}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-sm text-[#5a6478]">
                    Chart data loading... Check console for details.
                  </div>
                )}
              </div>

              <TechnicalIndicators indicators={data.indicators} />

              {analysis?.maAnalysis && analysis.maAnalysis.length > 0 && (
                <MAAnalysis maAnalysis={analysis.maAnalysis} price={data.price} />
              )}
            </div>

            <div className="space-y-6">
              <KeyStatistics data={data} />

              {analysis?.priceTargets && (
                <PriceTargets targets={analysis.priceTargets} price={data.price} />
              )}

              {analysis && <AIInsights analysis={analysis} />}
            </div>
          </div>

          {/* Row 2: Options Strategies (full width) */}
          {analysis?.optionsStrategies && (
            <OptionsStrategy
              optionsStrategies={analysis.optionsStrategies}
              optionsInsight={analysis.optionsInsight}
            />
          )}

          {/* Row 3: Trading Strategy + Investment + Projection */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TradingStrategy
              strategies={analysis?.tradingStrategy}
              investmentThesis={analysis?.investmentThesis}
              optionsInsight={[]}
            />

            <div className="space-y-6">
              {analysis?.investmentThesis?.projection && (
                <FutureProjection
                  projection={analysis.investmentThesis.projection}
                  price={data.price}
                  symbol={data.symbol}
                />
              )}
              <EarningsCard earnings={data.earnings} />
            </div>
          </div>

          {/* Row 4: News */}
          <NewsFeed news={data.news} />
        </>
      )}
    </div>
  );
}
