export interface QuoteSymbol {
  code: string
  name: string
  exchange?: string
}

export const mockSymbols: QuoteSymbol[] = [
  { code: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ' },
  { code: 'TSLA', name: 'Tesla Inc', exchange: 'NASDAQ' },
  { code: '600519', name: '贵州茅台', exchange: 'SSE' },
  { code: 'BTC/USD', name: 'Bitcoin', exchange: 'CRYPTO' },
  { code: 'ETH/USD', name: 'Ethereum', exchange: 'CRYPTO' },
  { code: '00700', name: '腾讯控股', exchange: 'HKEX' },
]
