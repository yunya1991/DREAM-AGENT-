import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────
interface QuoteData {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: number;
}

interface QuoteSymbol {
  code: string;
  name: string;
  exchange?: string;
}

interface QuotePanelProps {
  symbols: QuoteSymbol[];
  dataProvider?: (symbol: string) => Promise<QuoteData>;
  colorScheme?: 'red-up' | 'green-up';
  decimals?: number;
  refreshInterval?: number;
  className?: string;
}

// ─── Formatters ───────────────────────────────────────────────
const formatPrice = (price: number, decimals: number): string => {
  return price.toFixed(decimals);
};

const formatVolume = (vol: number): string => {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return vol.toString();
};

const formatTime = (ts: number): string => {
  return new Date(ts).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// ─── Mock Data Provider (replace with real API) ───────────────
const defaultDataProvider = async (symbol: string): Promise<QuoteData> => {
  // Simulated delay
  await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
  const base = Math.random() * 200 + 50;
  const change = (Math.random() - 0.5) * 10;
  return {
    symbol,
    name: symbol,
    exchange: 'MOCK',
    price: base + change,
    change,
    changePercent: (change / base) * 100,
    volume: Math.floor(Math.random() * 10_000_000),
    high: base + Math.abs(change) + 2,
    low: base - Math.abs(change) - 2,
    open: base,
    prevClose: base,
    timestamp: Date.now(),
  };
};

// ─── Quote Row ────────────────────────────────────────────────
interface QuoteRowProps {
  quote: QuoteData;
  colorScheme: 'red-up' | 'green-up';
  decimals: number;
}

function QuoteRow({ quote, colorScheme, decimals }: QuoteRowProps) {
  const isUp = quote.change >= 0;
  const colorClass = isUp
    ? colorScheme === 'red-up'
      ? 'text-red-600 dark:text-red-400'
      : 'text-green-600 dark:text-green-400'
    : colorScheme === 'red-up'
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';

  const ArrowIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg">
      {/* Symbol */}
      <div className="min-w-[100px]">
        <div className="font-semibold text-gray-800 dark:text-gray-200">
          {quote.symbol}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {quote.exchange}
        </div>
      </div>

      {/* Price */}
      <div className="text-right min-w-[120px]">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {formatPrice(quote.price, decimals)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatTime(quote.timestamp)}
        </div>
      </div>

      {/* Change */}
      <div className={`flex items-center gap-1 min-w-[100px] justify-end ${colorClass}`}>
        <ArrowIcon className="w-4 h-4" />
        <span className="font-medium">
          {isUp ? '+' : ''}
          {quote.changePercent.toFixed(2)}%
        </span>
      </div>

      {/* Volume */}
      <div className="text-right min-w-[80px]">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatVolume(quote.volume)}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-3 px-2">
      <div className="space-y-2 min-w-[100px]">
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

// ─── Quote Panel (Main Component) ─────────────────────────────
export function QuotePanel({
  symbols,
  dataProvider,
  colorScheme = 'red-up',
  decimals = 2,
  refreshInterval = 5000,
  className = '',
}: QuotePanelProps) {
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);

  const fetcher = dataProvider || defaultDataProvider;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results: Record<string, QuoteData> = {};
    await Promise.all(
      symbols.map(async (sym) => {
        try {
          const data = await fetcher(sym.code);
          results[sym.code] = data;
        } catch {
          // Silently fail, keep old data
        }
      }),
    );
    setQuotes((prev) => ({ ...prev, ...results }));
    setLoading(false);
  }, [symbols, fetcher]);

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, refreshInterval);
    return () => clearInterval(timer);
  }, [fetchAll, refreshInterval]);

  const lastUpdate = useMemo(() => {
    const timestamps = Object.values(quotes).map((q) => q.timestamp);
    if (timestamps.length === 0) return '';
    return formatTime(Math.max(...timestamps));
  }, [quotes]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          行情面板 ({symbols.length})
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Clock className="w-3.5 h-3.5" />
          )}
          <span>{loading ? '更新中...' : lastUpdate}</span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="flex items-center justify-between py-2 px-4 border-b border-gray-100 dark:border-gray-700/50 text-xs text-gray-400 dark:text-gray-500">
        <span className="min-w-[100px]">代码</span>
        <span className="min-w-[120px] text-right">最新价</span>
        <span className="min-w-[100px] text-right">涨跌幅</span>
        <span className="min-w-[80px] text-right">成交量</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50 dark:divide-gray-700/30 px-1">
        {loading && Object.keys(quotes).length === 0 ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          symbols.map((sym) => {
            const quote = quotes[sym.code];
            if (!quote) return <SkeletonRow key={sym.code} />;
            return <QuoteRow key={sym.code} quote={quote} colorScheme={colorScheme} decimals={decimals} />;
          })
        )}
      </div>
    </div>
  );
}

export default QuotePanel;
