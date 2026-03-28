import { useState } from 'react';
import { useKeys } from '../../contexts/KeyContext';
import { useStockData } from '../../hooks/useTradeRadarStock';
import { useOptionsData } from '../../hooks/useOptionsData';
import { useNewsData } from '../../hooks/useNewsData';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import SearchBar from './SearchBar';
import MarketStatus from './MarketStatus';
import MarketPulse from './MarketPulse';
import PriceCard from './PriceCard';
import MiniChart from './MiniChart';
import FundamentalsCard from './FundamentalsCard';
import TechnicalCard from './TechnicalCard';
import OptionsQuantCard from './OptionsQuantCard';
import ExpectedMoveCard from './ExpectedMoveCard';
import GEXCard from './GEXCard';
import UnusualActivityCard from './UnusualActivityCard';
import SmartMoneyCard from './SmartMoneyCard';
import AnalystCard from './AnalystCard';
import EarningsCountdown from './EarningsCountdown';
import EarningsCard from './EarningsCard';
import SentimentCard from './SentimentCard';
import EconomicCalendar from './EconomicCalendar';
import NewsCenterCard from './NewsCenterCard';
import TradeScorer from './TradeScorer';

export default function RadarView() {
  const { hasTwelveData, hasTradier } = useKeys();
  const [symbol, setSymbol] = useState('SPY');
  const [technicals, setTechnicals] = useState({});
  const [marketQuotes, setMarketQuotes] = useState({});

  const stockData = useStockData(symbol);
  const spotPrice = stockData.quote?.c;
  const optionsData = useOptionsData(symbol, spotPrice, hasTradier);
  const newsData = useNewsData(symbol);

  useAutoRefresh(() => { stockData.refresh(); }, 15000, !!symbol);

  const handleSearch = (sym) => setSymbol(sym);

  return (
    <div className="max-w-[480px] mx-auto px-3 py-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-[#e0e6ed]">Radar</h2>
        <MarketStatus />
      </div>

      {/* Market Pulse */}
      <MarketPulse onQuotesUpdate={setMarketQuotes} />

      {/* Search */}
      <SearchBar onSearch={handleSearch} currentSymbol={symbol} />

      {/* Cards — always show (Finnhub-powered) */}
      <div className="space-y-3">
        <PriceCard quote={stockData.quote} profile={stockData.profile} />
        <MiniChart symbol={symbol} />
        <FundamentalsCard financials={stockData.financials} profile={stockData.profile} />

        {/* Twelve Data — only if key provided */}
        {hasTwelveData && (
          <TechnicalCard technicalSignal={stockData.technicalSignal} currentPrice={spotPrice} symbol={symbol} onDataLoaded={setTechnicals} />
        )}
        {!hasTwelveData && (
          <div className="bg-[#0d1117] rounded-xl border border-white/5 p-4">
            <span className="text-sm text-[#5a6478]">Technical Indicators — Add Twelve Data API key in Settings to enable</span>
          </div>
        )}

        {/* Tradier — only if key provided */}
        {hasTradier && (
          <>
            <OptionsQuantCard
              calculations={optionsData.calculations}
              expirations={optionsData.expirations}
              categorizedExps={optionsData.categorizedExps}
              selectedExp={optionsData.selectedExp}
              onExpChange={optionsData.setSelectedExp}
              loading={optionsData.loading}
            />
            <ExpectedMoveCard symbol={symbol} currentPrice={spotPrice} categorizedExps={optionsData.categorizedExps} />
            <GEXCard gex={optionsData.calculations?.gex} spotPrice={spotPrice} />
            <UnusualActivityCard unusualActivity={optionsData.calculations?.unusualActivity} />
          </>
        )}
        {!hasTradier && (
          <div className="bg-[#0d1117] rounded-xl border border-white/5 p-4">
            <span className="text-sm text-[#5a6478]">Options Data — Add Tradier API key in Settings to enable</span>
          </div>
        )}

        {/* Always show (Finnhub-powered) */}
        <SmartMoneyCard
          insiderSentiment={stockData.insiderSentiment}
          insiderTransactions={stockData.insiderTransactions}
          institutional={stockData.institutional}
          congressional={stockData.congressional}
        />
        <AnalystCard
          recommendations={stockData.recommendations}
          priceTarget={stockData.priceTarget}
          upgradeDowngrade={stockData.upgradeDowngrade}
          currentPrice={spotPrice}
        />
        <EarningsCountdown earnings={stockData.earnings} symbol={symbol} />
        <EarningsCard earnings={stockData.earnings} />
        <SentimentCard
          socialSentiment={stockData.socialSentiment}
          wsbSentiment={newsData.wsbData?.sentiment}
        />
        <EconomicCalendar />

        {hasTradier && (
          <TradeScorer
            currentPrice={spotPrice}
            maxPain={optionsData.calculations?.maxPain?.strike}
            expirations={optionsData.categorizedExps}
          />
        )}

        <NewsCenterCard
          marketNews={newsData.marketNews}
          companyNews={newsData.companyNews}
          trumpNews={newsData.trumpNews}
          wsbData={newsData.wsbData}
          nextRefresh={newsData.nextRefresh}
          loading={newsData.loading}
        />
      </div>

      <div className="h-8" />

      {stockData.loading && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#22c55e] animate-pulse z-50" />
      )}
    </div>
  );
}
