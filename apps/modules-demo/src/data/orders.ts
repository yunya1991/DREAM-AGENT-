const symbols = ['AAPL', 'TSLA', '600519', 'BTC/USD', 'ETH/USD', '00700', 'GOOGL', 'AMZN']
const sides = ['买入', '卖出'] as const
const statuses = ['已成交', '部分成交', ' pending', '已撤单', '待成交']

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export const orderColumns = [
  { key: 'id', header: 'ID', sortable: true, width: '60px' },
  { key: 'symbol', header: '品种', sortable: true },
  { key: 'side', header: '方向' },
  { key: 'price', header: '价格', sortable: true, render: (v: number) => `$${v.toFixed(2)}` },
  { key: 'quantity', header: '数量', sortable: true },
  { key: 'status', header: '状态' },
  { key: 'time', header: '时间', sortable: true },
]

export const mockOrders = Array.from({ length: 50 }, (_, i) => {
  const seed = i * 7 + 3
  return {
    id: i + 1,
    symbol: symbols[Math.floor(seededRandom(seed) * symbols.length)],
    side: sides[Math.floor(seededRandom(seed + 1) * sides.length)],
    price: +(seededRandom(seed + 2) * 200 + 10).toFixed(2),
    quantity: Math.floor(seededRandom(seed + 3) * 1000) + 1,
    status: statuses[Math.floor(seededRandom(seed + 4) * statuses.length)],
    time: `2026-05-20 ${String(Math.floor(seededRandom(seed + 5) * 24)).padStart(2, '0')}:${String(Math.floor(seededRandom(seed + 6) * 60)).padStart(2, '0')}:${String(Math.floor(seededRandom(seed + 7) * 60)).padStart(2, '0')}`,
  }
})
