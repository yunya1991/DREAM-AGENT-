/**
 * AIDrawer — Generate Excalidraw scene from natural language description.
 *
 * Strategy:
 * 1. Try LLM API (OpenAI-compatible) if VITE_AI_DRAWER_API_URL is set
 * 2. Fall back to rule-based description → template mapping
 *
 * Output: Excalidraw-compatible JSON elements array
 */

interface ExcalidrawElement {
  id: string
  type: 'rectangle' | 'ellipse' | 'text' | 'arrow' | 'line' | 'freedraw'
  x: number
  y: number
  width: number
  height: number
  angle: number
  strokeColor: string
  backgroundColor: string
  fillStyle: 'solid' | 'hachure' | 'cross-hatch' | 'zigzag'
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted'
  roughness: number
  opacity: number
  rounded: boolean
  fontSize: number
  fontFamily: number
  text?: string
  textAlign: string
  verticalAlign: string
  containerId?: string
  start?: { id: string }
  end?: { id: string }
  points?: [number, number][]
  boundElements?: { id: string; type: string }[]
  seed: number
  version: number
  versionNonce: number
  isDeleted: boolean
  updated: number
  index: string
  groupIds: string[]
}

/** Generate a unique id */
let _idCounter = 0
function uid(prefix: string): string {
  _idCounter += 1
  return `${prefix}-${_idCounter}-${Math.random().toString(36).slice(2, 8)}`
}

/** Create a rectangle element */
function rect(x: number, y: number, w: number, h: number, rounded = false): ExcalidrawElement {
  return {
    id: uid('rect'), type: 'rectangle', x, y, width: w, height: h, angle: 0,
    strokeColor: '#1e1e1e', backgroundColor: '#a5d8ff', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100, rounded,
    fontSize: 20, fontFamily: 1, textAlign: 'left', verticalAlign: 'top',
    seed: Math.random() | 0, version: 1, versionNonce: Math.random() | 0,
    isDeleted: false, updated: Date.now(), index: '', groupIds: [],
  }
}

/** Create a text element */
function text(x: number, y: number, label: string, fontSize = 16): ExcalidrawElement {
  const w = label.length * fontSize * 0.6
  return {
    id: uid('text'), type: 'text', x, y, width: w, height: fontSize * 1.4,
    angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1,
    opacity: 100, rounded: false, fontSize, fontFamily: 1, textAlign: 'center',
    verticalAlign: 'middle', text: label,
    seed: Math.random() | 0, version: 1, versionNonce: Math.random() | 0,
    isDeleted: false, updated: Date.now(), index: '', groupIds: [],
  }
}

/** Create an arrow from one rect to another */
function arrow(fromRect: ExcalidrawElement, toRect: ExcalidrawElement): ExcalidrawElement {
  return {
    id: uid('arrow'), type: 'arrow', x: 0, y: 0, width: 0, height: 0, angle: 0,
    strokeColor: '#1e1e1e', backgroundColor: 'transparent', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100, rounded: false,
    fontSize: 20, fontFamily: 1, textAlign: 'left', verticalAlign: 'top',
    start: { id: fromRect.id }, end: { id: toRect.id },
    points: [[0, 0], [1, 1]],
    seed: Math.random() | 0, version: 1, versionNonce: Math.random() | 0,
    isDeleted: false, updated: Date.now(), index: '', groupIds: [],
  }
}

// ============================================================
// Sketch primitives — freedraw-based simple drawings
// ============================================================

function freedraw(x: number, y: number, points: [number, number][], color = '#1e1e1e'): ExcalidrawElement {
  return {
    id: uid('free'), type: 'freedraw', x, y, width: 0, height: 0, angle: 0,
    strokeColor: color, backgroundColor: 'transparent', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 2, opacity: 100, rounded: false,
    fontSize: 20, fontFamily: 1, textAlign: 'left', verticalAlign: 'top',
    points, seed: Math.random() | 0, version: 1, versionNonce: Math.random() | 0,
    isDeleted: false, updated: Date.now(), index: '', groupIds: [],
  }
}

function ellipse(x: number, y: number, w: number, h: number, stroke = '#1e1e1e', fill = 'transparent'): ExcalidrawElement {
  return {
    id: uid('elli'), type: 'ellipse', x, y, width: w, height: h, angle: 0,
    strokeColor: stroke, backgroundColor: fill, fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100, rounded: false,
    fontSize: 20, fontFamily: 1, textAlign: 'left', verticalAlign: 'top',
    seed: Math.random() | 0, version: 1, versionNonce: Math.random() | 0,
    isDeleted: false, updated: Date.now(), index: '', groupIds: [],
  }
}

function line(x: number, y: number, points: [number, number][], stroke = '#1e1e1e'): ExcalidrawElement {
  return {
    id: uid('line'), type: 'line', x, y, width: 0, height: 0, angle: 0,
    strokeColor: stroke, backgroundColor: 'transparent', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100, rounded: false,
    fontSize: 20, fontFamily: 1, textAlign: 'left', verticalAlign: 'top',
    points, seed: Math.random() | 0, version: 1, versionNonce: Math.random() | 0,
    isDeleted: false, updated: Date.now(), index: '', groupIds: [],
  }
}

/** Stick figure: head + body + arms + legs */
function stickFigure(cx: number, cy: number, size = 60): ExcalidrawElement[] {
  const r = size * 0.2
  return [
    ellipse(cx - r, cy - size * 0.5 - r, r * 2, r * 2), // head
    line(cx, cy - size * 0.3, [[0, 0], [0, size * 0.6]]), // body
    line(cx, cy - size * 0.1, [[-size * 0.35, size * 0.1], [size * 0.35, -size * 0.1]]), // arms
    line(cx, cy + size * 0.3, [[-size * 0.2, size * 0.35], [size * 0.2, -size * 0.05]]), // left leg
    line(cx, cy + size * 0.3, [[size * 0.2, size * 0.35], [-size * 0.2, -size * 0.05]]), // right leg
  ]
}

/** Simple girl figure (stick figure + dress + hair) */
function girlFigure(cx: number, cy: number, size = 70): ExcalidrawElement[] {
  const r = size * 0.18
  return [
    ellipse(cx - r, cy - size * 0.5 - r, r * 2, r * 2), // head
    // hair (two side curves)
    freedraw(cx - r - 5, cy - size * 0.5 - r * 0.5, [[0, 0], [-3, 10], [0, 20]]),
    freedraw(cx + r + 5, cy - size * 0.5 - r * 0.5, [[0, 0], [3, 10], [0, 20]]),
    // dress (triangle shape)
    line(cx, cy - size * 0.3, [[0, 0], [0, size * 0.4]]), // body center
    line(cx - size * 0.05, cy - size * 0.1, [[-size * 0.25, size * 0.4], [size * 0.55, 0]]), // dress bottom
    // arms
    line(cx, cy - size * 0.2, [[-size * 0.3, 0.1 * size], [size * 0.3, -0.1 * size]]),
    // legs
    line(cx - size * 0.1, cy + size * 0.3, [[0, 0], [0, size * 0.25]]),
    line(cx + size * 0.1, cy + size * 0.3, [[0, 0], [0, size * 0.25]]),
  ]
}

/** Simple tree: trunk + canopy */
function tree(cx: number, cy: number, size = 80): ExcalidrawElement[] {
  return [
    rect(cx - size * 0.06, cy, size * 0.12, size * 0.35), // trunk
    ellipse(cx - size * 0.3, cy - size * 0.35, size * 0.6, size * 0.5), // canopy
  ]
}

/** Simple castle with towers */
function castle(cx: number, cy: number, width = 200, height = 150): ExcalidrawElement[] {
  const tw = width * 0.2 // tower width
  const th = height * 0.6 // tower height
  const mw = width * 0.5 // main width
  const mh = height * 0.4 // main height
  return [
    rect(cx, cy + (th - mh), mw, mh), // main wall
    rect(cx - tw * 0.5, cy, tw, th), // left tower
    rect(cx + mw - tw * 0.5, cy, tw, th), // right tower
    ellipse(cx - tw * 0.5, cy - tw * 0.5, tw, tw), // left tower top
    ellipse(cx + mw - tw * 0.5, cy - tw * 0.5, tw, tw), // right tower top
    // gate
    rect(cx + mw * 0.35, cy + th * 0.6, mw * 0.3, mh * 0.4, true),
    // flags
    line(cx, cy - tw * 0.5, [[0, 0], [0, -tw * 0.8]]),
    line(cx + mw, cy - tw * 0.5, [[0, 0], [0, -tw * 0.8]]),
  ]
}

/** Mickey-style character: big circle head + 2 ear circles */
function mickeyHead(cx: number, cy: number, size = 40): ExcalidrawElement[] {
  const r = size
  return [
    ellipse(cx - r, cy - r, r * 2, r * 2), // head
    ellipse(cx - r * 1.8, cy - r * 1.5, r * 1.2, r * 1.2), // left ear
    ellipse(cx + r * 0.6, cy - r * 1.5, r * 1.2, r * 1.2), // right ear
  ]
}

/** Sun: circle + rays */
function sun(cx: number, cy: number, size = 30): ExcalidrawElement[] {
  const r = size
  const elements: ExcalidrawElement[] = [
    ellipse(cx - r, cy - r, r * 2, r * 2, '#f59e0b', '#fef3c7'),
  ]
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const sx = cx + Math.cos(angle) * r * 1.3
    const sy = cy + Math.sin(angle) * r * 1.3
    const ex = cx + Math.cos(angle) * r * 1.8
    const ey = cy + Math.sin(angle) * r * 1.8
    elements.push(line(sx, sy, [[0, 0], [ex - sx, ey - sy]], '#f59e0b'))
  }
  return elements
}

/** Cloud shape: overlapping ellipses */
function cloud(cx: number, cy: number, width = 80): ExcalidrawElement[] {
  return [
    ellipse(cx - width * 0.3, cy, width * 0.4, width * 0.25, '#94a3b8', '#f1f5f9'),
    ellipse(cx, cy - width * 0.05, width * 0.35, width * 0.25, '#94a3b8', '#f1f5f9'),
    ellipse(cx + width * 0.3, cy, width * 0.4, width * 0.25, '#94a3b8', '#f1f5f9'),
  ]
}

/** Path/walkway: dashed line */
function pathWalk(x: number, y: number, length = 300): ExcalidrawElement {
  return line(x, y, [[0, 0], [length, 20]], '#78716c')
}

/** Heart shape: two overlapping arcs using ellipses */
function heart(cx: number, cy: number, size = 40, fill = '#ef4444', stroke = '#dc2626'): ExcalidrawElement[] {
  return [
    ellipse(cx - size * 0.5, cy, size, size * 0.7, stroke, fill), // left bump
    ellipse(cx + size * 0.5, cy, size, size * 0.7, stroke, fill), // right bump
    // bottom triangle — use a filled diamond
    {
      id: uid('heart'), type: 'line', x: cx - size * 0.5, y: cy + size * 0.2, width: 0, height: 0, angle: 0,
      strokeColor: stroke, backgroundColor: fill, fillStyle: 'solid',
      strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100, rounded: false,
      fontSize: 20, fontFamily: 1, textAlign: 'left', verticalAlign: 'top',
      points: [[0, 0], [size * 0.5, size * 0.6], [size, 0]],
      seed: Math.random() | 0, version: 1, versionNonce: Math.random() | 0,
      isDeleted: false, updated: Date.now(), index: '', groupIds: [],
    },
  ]
}

/** Star shape */
function star(cx: number, cy: number, size = 20): ExcalidrawElement[] {
  return [
    ellipse(cx - size * 0.5, cy - size * 0.5, size, size, '#f59e0b', '#fef3c7'),
  ]
}

/** Rose: stem + red petals */
function rose(cx: number, cy: number, size = 20): ExcalidrawElement[] {
  return [
    line(cx, cy + size, [[0, 0], [0, size * 2]], '#16a34a'), // stem
    line(cx, cy + size * 1.5, [[-size, -size * 0.3], [0, 0]]), // leaf left
    line(cx, cy + size * 1.2, [[size * 0.8, -size * 0.2], [0, 0]]), // leaf right
    ellipse(cx - size * 0.5, cy - size * 0.5, size, size, '#dc2626', '#fecaca'), // bloom
    ellipse(cx - size * 0.3, cy - size * 0.3, size * 0.5, size * 0.5, '#f87171', '#fca5a5'), // inner
  ]
}

/** Couple walking together */
function couple(cx: number, cy: number, size = 50): ExcalidrawElement[] {
  const gap = size * 0.6
  return [
    ...girlFigure(cx - gap, cy, size),
    ...stickFigure(cx + gap, cy, size * 0.9),
    // Hand-holding line
    line(cx - gap + size * 0.3, cy + size * 0.1, [[size * 0.4, 0], [0, 0]], '#f43f5e'),
  ]
}

/** 520 romantic scene */
function romantic520(): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  // Sky
  elements.push(...cloud(200, 40, 50))
  elements.push(...cloud(500, 30, 60))
  elements.push(...cloud(700, 50, 45))
  // Stars
  for (let i = 0; i < 8; i++) {
    elements.push(...star(60 + i * 100, 30 + (i % 3) * 15, 10))
  }
  // Ground
  elements.push(line(30, 520, [[0, 0], [800, 5]], '#86efac'))
  // Couple in center
  elements.push(...couple(430, 490, 55))
  elements.push(text(380, 560, '我们', 18))
  // Big heart above
  elements.push(...heart(430, 200, 80, '#ef4444', '#dc2626'))
  elements.push(text(390, 185, '520', 20))
  // Roses on left
  elements.push(...rose(100, 470, 15))
  elements.push(...rose(150, 490, 18))
  elements.push(...rose(80, 500, 14))
  elements.push(text(70, 550, '给你的花', 14))
  // Gifts on right
  elements.push(rect(650, 460, 80, 60))
  elements.push(text(655, 485, '礼物'))
  elements.push(rect(700, 470, 80, 60))
  elements.push(text(705, 495, '惊喜'))
  // Fireworks (small circles in sky)
  const fireworkColors = ['#f472b6', '#a78bfa', '#60a5fa', '#fbbf24', '#34d399']
  for (let i = 0; i < 5; i++) {
    const fx = 100 + i * 160
    const fy = 100 + (i % 3) * 30
    elements.push(ellipse(fx - 8, fy - 8, 16, 16, fireworkColors[i], fireworkColors[i] + '40'))
  }
  // Title
  elements.push(text(250, 610, '520 快乐 — 你是我的全部', 16))
  return elements
}

/** Disney + romance scene */
function disneyRomance(): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  elements.push(...sun(100, 60, 25))
  elements.push(...cloud(350, 40, 60))
  elements.push(line(30, 520, [[0, 0], [800, 10]], '#92400e'))
  // Girl
  elements.push(...girlFigure(350, 500, 70))
  elements.push(text(330, 580, '小女孩'))
  // Left: castle
  elements.push(...castle(60, 370, 160, 130))
  elements.push(text(80, 510, '城堡'))
  // Right: Mickey
  elements.push(...mickeyHead(650, 430, 35))
  elements.push(text(620, 510, '卡通角色'))
  // Trees
  elements.push(...tree(200, 480, 50))
  elements.push(...tree(500, 470, 55))
  // Flowers
  elements.push(...flower(150, 540, 10))
  elements.push(...flower(450, 545, 12))
  elements.push(...flower(600, 538, 10))
  // 520 heart overlay
  elements.push(...heart(550, 200, 60, '#ef4444', '#dc2626'))
  elements.push(text(520, 190, '520', 16))
  // Title
  elements.push(text(200, 595, '迪士尼乐园 — 520的浪漫', 14))
  return elements
}

/** Flower: simple circle + stem */
function flower(cx: number, cy: number, size = 15): ExcalidrawElement[] {
  return [
    line(cx, cy, [[0, 0], [0, size * 2]], '#22c55e'), // stem
    ellipse(cx - size, cy - size, size * 2, size * 2, '#ec4899', '#fce7f3'), // petals
  ]
}

/** House: rectangle + triangle roof */
function house(cx: number, cy: number, width = 80, height = 60): ExcalidrawElement[] {
  return [
    rect(cx - width * 0.4, cy, width * 0.8, height), // walls
    line(cx - width * 0.5, cy, [[0, 0], [width * 0.5, -height * 0.5], [width, 0]]), // roof
  ]
}

/** Gallery scene: frames on wall */
function gallerySketch(): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  // Wall
  elements.push(rect(30, 30, 800, 300))
  elements.push(text(300, 15, '画廊墙'))
  // Frames in grid
  const frames = [
    { x: 60, y: 60, w: 200, h: 120 },
    { x: 300, y: 60, w: 200, h: 120 },
    { x: 560, y: 60, w: 200, h: 120 },
    { x: 60, y: 210, w: 200, h: 100 },
    { x: 300, y: 210, w: 200, h: 100 },
    { x: 560, y: 210, w: 200, h: 100 },
  ]
  for (const f of frames) {
    elements.push(rect(f.x, f.y, f.w, f.h))
    elements.push(text(f.x + 70, f.y + 40, '图片'))
  }
  // Viewer
  elements.push(...stickFigure(430, 370, 50))
  elements.push(text(410, 430, '观众'))
  return elements
}

/** Social scene: people chatting */
function socialSketch(): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  // Background
  elements.push(rect(30, 30, 800, 40, true))
  elements.push(text(300, 38, '社交平台'))
  // People
  elements.push(...stickFigure(150, 300, 60))
  elements.push(text(120, 370, '好友A'))
  elements.push(...stickFigure(400, 290, 60))
  elements.push(text(370, 360, '好友B'))
  elements.push(...stickFigure(650, 300, 60))
  elements.push(text(620, 370, '好友C'))
  // Chat bubbles
  elements.push(ellipse(170, 180, 120, 50, '#3b82f6', '#dbeafe'))
  elements.push(text(200, 195, '你好!'))
  elements.push(ellipse(420, 170, 120, 50, '#3b82f6', '#dbeafe'))
  elements.push(text(445, 185, '最近怎样?'))
  // Feed
  elements.push(rect(30, 420, 800, 120))
  elements.push(text(300, 460, '动态时间线'))
  return elements
}

/** Shopping scene */
function shopSketch(): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  elements.push(rect(30, 30, 800, 40, true))
  elements.push(text(320, 38, '🛒 商城'))
  // Products grid
  const products = [
    { x: 60, y: 100 },
    { x: 300, y: 100 },
    { x: 560, y: 100 },
    { x: 60, y: 280 },
    { x: 300, y: 280 },
    { x: 560, y: 280 },
  ]
  for (const p of products) {
    elements.push(rect(p.x, p.y, 200, 140))
    elements.push(text(p.x + 60, p.y + 50, '商品'))
    elements.push(ellipse(p.x + 80, p.y + 100, 40, 20, '#22c55e', '#dcfce7'))
    elements.push(text(p.x + 65, p.y + 105, '购买'))
  }
  // Cart
  elements.push(rect(650, 30, 140, 40, true))
  elements.push(text(680, 38, '购物车'))
  return elements
}

/** Blog/article scene */
function blogSketch(): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  elements.push(rect(30, 30, 800, 40))
  elements.push(text(300, 38, '博客'))
  // Article
  elements.push(rect(30, 90, 500, 350))
  elements.push(text(150, 110, '文章标题'))
  elements.push(text(60, 140, '正文段落...'))
  elements.push(text(60, 170, '正文段落...'))
  elements.push(text(60, 200, '正文段落...'))
  // Sidebar
  elements.push(rect(560, 90, 270, 150))
  elements.push(text(620, 140, '目录'))
  elements.push(rect(560, 260, 270, 180))
  elements.push(text(620, 340, '评论区'))
  return elements
}

/** Offset all elements by (dx, dy) */
export function offsetElements(elements: ExcalidrawElement[], dx: number, dy: number): ExcalidrawElement[] {
  return elements.map((el) => ({ ...el, x: el.x + dx, y: el.y + dy }))
}

/** Named scene presets — each can be dragged onto the canvas independently */
export const SCENE_PRESETS: {
  id: string
  label: string
  icon: string
  keywords: string[]
  generate: () => ExcalidrawElement[]
}[] = [
  // === Finance ===
  {
    id: 'trading', label: '交易终端', icon: '📊',
    keywords: ['交易', '行情', '订单', 'trading', 'quote'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '交易终端')
      const leftRect = rect(pad, pad + 80, 380, 400)
      const leftText = text(pad + 130, pad + 260, '行情面板')
      const rightRect = rect(pad + 420, pad + 80, 380, 400)
      const rightText = text(pad + 550, pad + 260, '订单表格')
      const arrowEl = arrow(leftRect, rightRect)
      return [header, headerText, leftRect, leftText, rightRect, rightText, arrowEl]
    },
  },
  {
    id: 'admin', label: '管理后台', icon: '🏢',
    keywords: ['管理', '后台', 'admin', 'CRUD', '用户'],
    generate: () => {
      const pad = 40
      const sidebar = rect(pad, pad + 50, 200, 450)
      const sidebarText = text(pad + 40, pad + 250, '导航栏')
      const topBar = rect(pad + 240, pad, 560, 40, true)
      const topBarText = text(pad + 480, pad + 10, '顶部导航')
      const content = rect(pad + 240, pad + 60, 560, 440)
      const contentText = text(pad + 440, pad + 260, '数据表格')
      return [sidebar, sidebarText, topBar, topBarText, content, contentText]
    },
  },
  {
    id: 'risk', label: '风控看板', icon: '🛡️',
    keywords: ['风控', '监控', '告警', 'risk', 'monitor'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '风控看板')
      const kpi1 = rect(pad, pad + 80, 250, 120)
      const kpi1Text = text(pad + 80, pad + 130, '指标1')
      const kpi2 = rect(pad + 290, pad + 80, 250, 120)
      const kpi2Text = text(pad + 370, pad + 130, '指标2')
      const kpi3 = rect(pad + 580, pad + 80, 250, 120)
      const kpi3Text = text(pad + 660, pad + 130, '指标3')
      const table = rect(pad, pad + 240, 540, 250)
      const tableText = text(pad + 200, pad + 350, '数据表格')
      const alert = rect(pad + 580, pad + 240, 250, 250)
      const alertText = text(pad + 630, pad + 350, '告警通知')
      return [header, headerText, kpi1, kpi1Text, kpi2, kpi2Text, kpi3, kpi3Text, table, tableText, alert, alertText]
    },
  },
  {
    id: 'data-platform', label: '数据中台', icon: '📈',
    keywords: ['数据', '报表', '统计', 'analytics', '分析'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '数据中台')
      const left = rect(pad, pad + 80, 540, 400)
      const leftText = text(pad + 200, pad + 260, '数据表格')
      const right = rect(pad + 580, pad + 80, 250, 400)
      const rightText = text(pad + 630, pad + 260, '指标面板')
      return [header, headerText, left, leftText, right, rightText]
    },
  },
  {
    id: 'doc-center', label: '文档中心', icon: '📄',
    keywords: ['文件', '文档', '知识', 'doc', 'wiki'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '文档中心')
      const tree = rect(pad, pad + 80, 300, 400)
      const treeText = text(pad + 80, pad + 260, '文件管理')
      const content = rect(pad + 340, pad + 80, 490, 400)
      const contentText = text(pad + 520, pad + 260, '文档预览')
      return [header, headerText, tree, treeText, content, contentText]
    },
  },
  {
    id: 'notification', label: '通知中心', icon: '🔔',
    keywords: ['通知', '消息', 'notification', 'alert'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '通知中心')
      const list = rect(pad, pad + 80, 540, 400)
      const listText = text(pad + 200, pad + 260, '消息列表')
      const detail = rect(pad + 580, pad + 80, 250, 400)
      const detailText = text(pad + 630, pad + 260, '详情面板')
      return [header, headerText, list, listText, detail, detailText]
    },
  },
  {
    id: 'dashboard', label: '数据总览', icon: '📋',
    keywords: ['仪表盘', '总览', 'dashboard', 'kpi', '指标'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '数据总览')
      const cards = [
        { x: pad, y: pad + 80, label: '卡片1' },
        { x: pad + 290, y: pad + 80, label: '卡片2' },
        { x: pad + 580, y: pad + 80, label: '卡片3' },
      ]
      const elements: ExcalidrawElement[] = [header, headerText]
      for (const c of cards) {
        elements.push(rect(c.x, c.y, 250, 120))
        elements.push(text(c.x + 80, c.y + 50, c.label))
      }
      const table = rect(pad, pad + 240, 800, 240)
      const tableText = text(pad + 330, pad + 340, '数据表格')
      elements.push(table, tableText)
      return elements
    },
  },
  // === Romance / Lifestyle ===
  {
    id: 'romance-520', label: '520浪漫', icon: '❤️',
    keywords: ['520', '情人节', '浪漫', '爱情', 'love', '女朋友'],
    generate: () => romantic520(),
  },
  {
    id: 'disney', label: '迪士尼乐园', icon: '🏰',
    keywords: ['迪士尼', '乐园', '公园', '旅游', 'disney', 'park'],
    generate: () => disneyRomance(),
  },
  {
    id: 'girl', label: '小女孩', icon: '👧',
    keywords: ['小女孩', '女孩', '人物', 'girl', 'person'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(...sun(100, 50, 25))
      elements.push(...cloud(350, 40, 60))
      elements.push(...cloud(550, 60, 50))
      elements.push(line(30, 500, [[0, 0], [800, 5]], '#92400e'))
      elements.push(...girlFigure(350, 470, 80))
      elements.push(text(320, 560, '小女孩'))
      elements.push(...tree(100, 450, 60))
      elements.push(...tree(600, 440, 55))
      elements.push(...flower(200, 520, 12))
      elements.push(...flower(500, 510, 10))
      elements.push(...house(700, 440, 80, 50))
      elements.push(text(690, 510, '家'))
      return elements
    },
  },
  {
    id: 'castle', label: '城堡', icon: '🏯',
    keywords: ['城堡', '皇宫', '塔楼', 'castle', 'tower'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(...sun(400, 40, 30))
      elements.push(line(30, 500, [[0, 0], [800, 5]], '#92400e'))
      elements.push(...castle(300, 330, 250, 160))
      elements.push(text(380, 510, '城堡'))
      elements.push(...tree(100, 440, 50))
      elements.push(...tree(650, 430, 60))
      elements.push(...flower(200, 510, 10))
      elements.push(...flower(580, 500, 12))
      elements.push(...stickFigure(200, 460, 50))
      elements.push(text(185, 520, '守卫'))
      return elements
    },
  },
  {
    id: 'park', label: '公园自然', icon: '🌳',
    keywords: ['树', '森林', '花园', '公园', 'tree', 'forest', 'garden', 'nature'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(...sun(700, 50, 25))
      elements.push(...cloud(200, 40, 70))
      elements.push(line(30, 520, [[0, 0], [800, 5]], '#22c55e'))
      elements.push(...tree(80, 460, 70))
      elements.push(...tree(200, 450, 80))
      elements.push(...tree(320, 470, 60))
      elements.push(...tree(440, 440, 75))
      elements.push(...tree(560, 460, 65))
      elements.push(...tree(680, 450, 70))
      elements.push(...flower(150, 530, 12))
      elements.push(...flower(350, 540, 10))
      elements.push(...flower(500, 535, 14))
      elements.push(...flower(620, 525, 11))
      elements.push(pathWalk(50, 540, 750))
      return elements
    },
  },
  {
    id: 'gallery', label: '图片画廊', icon: '🖼️',
    keywords: ['画廊', '照片', '相册', '图片', 'gallery', 'photo'],
    generate: () => gallerySketch(),
  },
  {
    id: 'video', label: '视频播放', icon: '🎬',
    keywords: ['视频', '播放', '电影', 'video', 'movie', 'player'],
    generate: () => {
      const pad = 40
      const player = rect(pad, pad + 50, 560, 320, true)
      const playerText = text(pad + 200, pad + 200, '视频播放器')
      const sidebar = rect(pad + 600, pad + 50, 230, 320)
      const sidebarText = text(pad + 640, pad + 200, '推荐列表')
      const info = rect(pad, pad + 400, 830, 100)
      const infoText = text(pad + 300, pad + 440, '视频信息 + 评论区')
      const topBar = rect(pad, pad, 830, 40)
      const topBarText = text(pad + 350, pad + 8, '顶部导航 — 搜索 分类 上传')
      return [topBar, topBarText, player, playerText, sidebar, sidebarText, info, infoText]
    },
  },
  {
    id: 'music', label: '音乐播放器', icon: '🎵',
    keywords: ['音乐', '音频', 'music', 'audio', 'song'],
    generate: () => {
      const pad = 40
      const sidebar = rect(pad, pad, 200, 500)
      const sidebarText = text(pad + 40, pad + 230, '播放列表')
      const main = rect(pad + 240, pad, 590, 400)
      const mainText = text(pad + 440, pad + 190, '专辑封面')
      const bottom = rect(pad, pad + 510, 830, 60)
      const bottomText = text(pad + 330, pad + 528, '播放控制条')
      return [sidebar, sidebarText, main, mainText, bottom, bottomText]
    },
  },
  {
    id: 'social', label: '社交动态', icon: '💬',
    keywords: ['社交', '动态', '好友', '聊天', 'social', 'chat', 'feed'],
    generate: () => socialSketch(),
  },
  {
    id: 'shop', label: '电商购物', icon: '🛒',
    keywords: ['电商', '购物', '商品', 'shop', 'buy', 'cart'],
    generate: () => shopSketch(),
  },
  {
    id: 'blog', label: '博客文章', icon: '📝',
    keywords: ['博客', '文章', '阅读', 'blog', 'article', 'read'],
    generate: () => blogSketch(),
  },
  {
    id: 'game', label: '游戏主页', icon: '🎮',
    keywords: ['游戏', '排行', '成就', 'game', 'rank', 'level'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(rect(30, 30, 800, 40, true))
      elements.push(text(320, 38, '游戏主页'))
      elements.push(...stickFigure(100, 280, 60))
      elements.push(text(70, 350, '角色'))
      const stats = [
        { x: 200, y: 100, label: 'Lv.10' },
        { x: 450, y: 100, label: '9999' },
        { x: 650, y: 100, label: '★5' },
      ]
      for (const s of stats) {
        elements.push(rect(s.x, s.y, 180, 60))
        elements.push(text(s.x + 50, s.y + 20, s.label))
      }
      elements.push(rect(200, 200, 400, 140))
      elements.push(text(330, 255, '关卡列表'))
      elements.push(rect(220, 220, 80, 40, true))
      elements.push(text(225, 230, '关卡1'))
      elements.push(rect(330, 220, 80, 40, true))
      elements.push(text(335, 230, '关卡2'))
      elements.push(rect(440, 220, 80, 40, true))
      elements.push(text(445, 230, '关卡3'))
      elements.push(rect(630, 200, 160, 140))
      elements.push(text(670, 250, '排行榜'))
      return elements
    },
  },
  {
    id: 'login', label: '登录注册', icon: '🔐',
    keywords: ['登录', '注册', 'login', 'register', 'auth'],
    generate: () => {
      const pad = 40
      const bg = rect(pad, pad, 400, 350, true)
      const bgText = text(pad + 140, pad + 50, '登录/注册')
      const input1 = rect(pad + 50, pad + 100, 300, 40)
      const input1Text = text(pad + 140, pad + 110, '用户名/邮箱')
      const input2 = rect(pad + 50, pad + 160, 300, 40)
      const input2Text = text(pad + 160, pad + 170, '密码')
      const btn = rect(pad + 100, pad + 220, 200, 40, true)
      const btnText = text(pad + 170, pad + 230, '登录')
      return [bg, bgText, input1, input1Text, input2, input2Text, btn, btnText]
    },
  },
  {
    id: 'settings', label: '设置/个人中心', icon: '⚙️',
    keywords: ['设置', '配置', '个人中心', 'profile', 'setting'],
    generate: () => {
      const pad = 40
      const sidebar = rect(pad, pad, 250, 500)
      const sidebarText = text(pad + 60, pad + 230, '设置菜单')
      const main = rect(pad + 290, pad, 540, 250)
      const mainText = text(pad + 440, pad + 110, '个人信息编辑')
      const preview = rect(pad + 290, pad + 280, 540, 220)
      const previewText = text(pad + 440, pad + 380, '预览效果')
      return [sidebar, sidebarText, main, mainText, preview, previewText]
    },
  },
  {
    id: 'animation', label: '动画工作室', icon: '🎨',
    keywords: ['动画', '动漫', '卡通', 'animation', 'cartoon'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(rect(30, 30, 800, 40, true))
      elements.push(text(320, 38, '动画工作室'))
      elements.push(...mickeyHead(150, 200, 40))
      elements.push(text(100, 280, '卡通角色'))
      elements.push(...stickFigure(400, 300, 70))
      elements.push(text(370, 380, '人物'))
      elements.push(rect(550, 100, 250, 150))
      elements.push(text(610, 160, '帧1'))
      elements.push(rect(550, 280, 250, 150))
      elements.push(text(610, 340, '帧2'))
      return elements
    },
  },
  {
    id: 'map', label: '探险地图', icon: '🗺️',
    keywords: ['地图', '导航', 'map', 'navigation', 'treasure'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(rect(30, 30, 800, 500))
      elements.push(text(350, 12, '探险地图'))
      elements.push(line(50, 200, [[0, 0], [750, 50]], '#92400e'))
      elements.push(line(50, 350, [[0, 0], [700, -50]], '#92400e'))
      elements.push(...castle(80, 150, 100, 80))
      elements.push(text(90, 240, '城堡'))
      elements.push(...tree(300, 180, 50))
      elements.push(text(280, 240, '森林'))
      elements.push(...house(500, 200, 60, 40))
      elements.push(text(490, 260, '村庄'))
      elements.push(ellipse(650, 350, 30, 20, '#f59e0b', '#fef3c7'))
      elements.push(text(630, 390, '宝藏!'))
      elements.push(...stickFigure(200, 300, 50))
      elements.push(text(175, 360, '探险家'))
      elements.push(...sun(720, 60, 20))
      return elements
    },
  },
]

/** Legacy: all-in-one preset layouts for single-description generation */
const PRESET_LAYOUTS: { keywords: string[]; generate: () => ExcalidrawElement[] }[] = [
  // === Finance ===
  {
    keywords: ['交易', '行情', '订单', '买卖', 'trading', 'quote', 'order'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '交易终端')
      const leftRect = rect(pad, pad + 80, 380, 400)
      const leftText = text(pad + 130, pad + 260, '行情面板')
      const rightRect = rect(pad + 420, pad + 80, 380, 400)
      const rightText = text(pad + 550, pad + 260, '订单表格')
      const arrowEl = arrow(leftRect, rightRect)
      return [header, headerText, leftRect, leftText, rightRect, rightText, arrowEl]
    },
  },
  {
    keywords: ['管理', '后台', 'admin', 'CRUD', '用户'],
    generate: () => {
      const pad = 40
      const sidebar = rect(pad, pad + 50, 200, 450)
      const sidebarText = text(pad + 40, pad + 250, '导航栏')
      const topBar = rect(pad + 240, pad, 560, 40, true)
      const topBarText = text(pad + 480, pad + 10, '顶部导航')
      const content = rect(pad + 240, pad + 60, 560, 440)
      const contentText = text(pad + 440, pad + 260, '数据表格')
      return [sidebar, sidebarText, topBar, topBarText, content, contentText]
    },
  },
  {
    keywords: ['风控', '监控', '告警', 'risk', 'monitor'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '风控看板')
      const kpi1 = rect(pad, pad + 80, 250, 120)
      const kpi1Text = text(pad + 80, pad + 130, '指标1')
      const kpi2 = rect(pad + 290, pad + 80, 250, 120)
      const kpi2Text = text(pad + 370, pad + 130, '指标2')
      const kpi3 = rect(pad + 580, pad + 80, 250, 120)
      const kpi3Text = text(pad + 660, pad + 130, '指标3')
      const table = rect(pad, pad + 240, 540, 250)
      const tableText = text(pad + 200, pad + 350, '数据表格')
      const alert = rect(pad + 580, pad + 240, 250, 250)
      const alertText = text(pad + 630, pad + 350, '告警通知')
      return [header, headerText, kpi1, kpi1Text, kpi2, kpi2Text, kpi3, kpi3Text, table, tableText, alert, alertText]
    },
  },
  {
    keywords: ['数据', '报表', '统计', 'analytics', '报表', '分析'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '数据中台')
      const left = rect(pad, pad + 80, 540, 400)
      const leftText = text(pad + 200, pad + 260, '数据表格')
      const right = rect(pad + 580, pad + 80, 250, 400)
      const rightText = text(pad + 630, pad + 260, '指标面板')
      return [header, headerText, left, leftText, right, rightText]
    },
  },
  {
    keywords: ['文件', '文档', '知识', 'doc', 'wiki'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '文档中心')
      const tree = rect(pad, pad + 80, 300, 400)
      const treeText = text(pad + 80, pad + 260, '文件管理')
      const content = rect(pad + 340, pad + 80, 490, 400)
      const contentText = text(pad + 520, pad + 260, '文档预览')
      return [header, headerText, tree, treeText, content, contentText]
    },
  },
  {
    keywords: ['通知', '消息', 'notification', 'alert'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '通知中心')
      const list = rect(pad, pad + 80, 540, 400)
      const listText = text(pad + 200, pad + 260, '消息列表')
      const detail = rect(pad + 580, pad + 80, 250, 400)
      const detailText = text(pad + 630, pad + 260, '详情面板')
      return [header, headerText, list, listText, detail, detailText]
    },
  },
  {
    keywords: ['仪表盘', '总览', 'dashboard', 'kpi', '指标'],
    generate: () => {
      const pad = 40
      const header = rect(pad, pad, 800, 50, true)
      const headerText = text(pad + 300, pad + 12, '数据总览')
      const cards = [
        { x: pad, y: pad + 80, label: '卡片1' },
        { x: pad + 290, y: pad + 80, label: '卡片2' },
        { x: pad + 580, y: pad + 80, label: '卡片3' },
      ]
      const elements: ExcalidrawElement[] = [header, headerText]
      for (const c of cards) {
        elements.push(rect(c.x, c.y, 250, 120))
        elements.push(text(c.x + 80, c.y + 50, c.label))
      }
      const table = rect(pad, pad + 240, 800, 240)
      const tableText = text(pad + 330, pad + 340, '数据表格')
      elements.push(table, tableText)
      return elements
    },
  },
  // === General / Lifestyle — sketch mode ===
  {
    keywords: ['迪士尼', '乐园', '公园', '旅游', '景点', '迪士尼', 'disney', 'park', 'travel'],
    generate: () => disneyRomance(),
  },
  {
    keywords: ['520', '情人节', '浪漫', '爱情', 'love', 'romantic', '惊喜', '女朋友', '表白'],
    generate: () => romantic520(),
  },
  {
    keywords: ['小女孩', '女孩', '人物', '角色', '小人', 'girl', 'person', 'character'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(...sun(100, 50, 25))
      elements.push(...cloud(350, 40, 60))
      elements.push(...cloud(550, 60, 50))
      elements.push(line(30, 500, [[0, 0], [800, 5]], '#92400e'))
      // Girl
      elements.push(...girlFigure(350, 470, 80))
      elements.push(text(320, 560, '小女孩'))
      // Trees
      elements.push(...tree(100, 450, 60))
      elements.push(...tree(600, 440, 55))
      // Flowers
      elements.push(...flower(200, 520, 12))
      elements.push(...flower(500, 510, 10))
      // House
      elements.push(...house(700, 440, 80, 50))
      elements.push(text(690, 510, '家'))
      return elements
    },
  },
  {
    keywords: ['城堡', '皇宫', '塔楼', 'castle', 'tower', 'palace'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(...sun(400, 40, 30))
      elements.push(line(30, 500, [[0, 0], [800, 5]], '#92400e'))
      elements.push(...castle(300, 330, 250, 160))
      elements.push(text(380, 510, '城堡'))
      elements.push(...tree(100, 440, 50))
      elements.push(...tree(650, 430, 60))
      elements.push(...flower(200, 510, 10))
      elements.push(...flower(580, 500, 12))
      // Guard
      elements.push(...stickFigure(200, 460, 50))
      elements.push(text(185, 520, '守卫'))
      return elements
    },
  },
  {
    keywords: ['树', '森林', '花园', '公园', 'tree', 'forest', 'garden', 'nature'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(...sun(700, 50, 25))
      elements.push(...cloud(200, 40, 70))
      elements.push(line(30, 520, [[0, 0], [800, 5]], '#22c55e'))
      // Many trees
      elements.push(...tree(80, 460, 70))
      elements.push(...tree(200, 450, 80))
      elements.push(...tree(320, 470, 60))
      elements.push(...tree(440, 440, 75))
      elements.push(...tree(560, 460, 65))
      elements.push(...tree(680, 450, 70))
      // Flowers
      elements.push(...flower(150, 530, 12))
      elements.push(...flower(350, 540, 10))
      elements.push(...flower(500, 535, 14))
      elements.push(...flower(620, 525, 11))
      // Path through forest
      elements.push(pathWalk(50, 540, 750))
      return elements
    },
  },
  {
    keywords: ['画廊', '照片', '相册', '图片', 'gallery', 'photo', 'album', 'image'],
    generate: () => gallerySketch(),
  },
  {
    keywords: ['视频', '播放', '电影', '影视', 'video', 'movie', 'player', 'stream'],
    generate: () => {
      const pad = 40
      const player = rect(pad, pad + 50, 560, 320, true)
      const playerText = text(pad + 200, pad + 200, '视频播放器')
      const sidebar = rect(pad + 600, pad + 50, 230, 320)
      const sidebarText = text(pad + 640, pad + 200, '推荐列表')
      const info = rect(pad, pad + 400, 830, 100)
      const infoText = text(pad + 300, pad + 440, '视频信息 + 评论区')
      const topBar = rect(pad, pad, 830, 40)
      const topBarText = text(pad + 350, pad + 8, '顶部导航 — 搜索 分类 上传')
      return [topBar, topBarText, player, playerText, sidebar, sidebarText, info, infoText]
    },
  },
  {
    keywords: ['音乐', '音频', 'music', 'audio', 'song'],
    generate: () => {
      const pad = 40
      const sidebar = rect(pad, pad, 200, 500)
      const sidebarText = text(pad + 40, pad + 230, '播放列表')
      const main = rect(pad + 240, pad, 590, 400)
      const mainText = text(pad + 440, pad + 190, '专辑封面')
      const bottom = rect(pad, pad + 510, 830, 60)
      const bottomText = text(pad + 330, pad + 528, '播放控制条 — 上一首 播放/暂停 下一首')
      return [sidebar, sidebarText, main, mainText, bottom, bottomText]
    },
  },
  {
    keywords: ['社交', '动态', '好友', '聊天', 'social', 'friend', 'chat', 'feed', 'timeline'],
    generate: () => socialSketch(),
  },
  {
    keywords: ['电商', '购物', '商品', 'shop', 'buy', 'cart', 'product'],
    generate: () => shopSketch(),
  },
  {
    keywords: ['博客', '文章', '阅读', 'blog', 'article', 'read', 'post', '写作'],
    generate: () => blogSketch(),
  },
  {
    keywords: ['游戏', '排行', '成就', '关卡', 'game', 'rank', 'level', 'score', '成就'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(rect(30, 30, 800, 40, true))
      elements.push(text(320, 38, '游戏主页'))
      // Player character
      elements.push(...stickFigure(100, 280, 60))
      elements.push(text(70, 350, '角色'))
      // Stats
      const stats = [
        { x: 200, y: 100, label: 'Lv.10' },
        { x: 450, y: 100, label: '9999' },
        { x: 650, y: 100, label: '★5' },
      ]
      for (const s of stats) {
        elements.push(rect(s.x, s.y, 180, 60))
        elements.push(text(s.x + 50, s.y + 20, s.label))
      }
      // Levels
      elements.push(rect(200, 200, 400, 140))
      elements.push(text(330, 255, '关卡列表'))
      elements.push(rect(220, 220, 80, 40, true))
      elements.push(text(225, 230, '关卡1'))
      elements.push(rect(330, 220, 80, 40, true))
      elements.push(text(335, 230, '关卡2'))
      elements.push(rect(440, 220, 80, 40, true))
      elements.push(text(445, 230, '关卡3'))
      // Ranking
      elements.push(rect(630, 200, 160, 140))
      elements.push(text(670, 250, '排行榜'))
      return elements
    },
  },
  {
    keywords: ['登录', '注册', '注册页', 'login', 'register', 'signup', 'auth'],
    generate: () => {
      const pad = 40
      const bg = rect(pad, pad, 400, 350, true)
      const bgText = text(pad + 140, pad + 50, '登录/注册')
      const input1 = rect(pad + 50, pad + 100, 300, 40)
      const input1Text = text(pad + 140, pad + 110, '用户名/邮箱')
      const input2 = rect(pad + 50, pad + 160, 300, 40)
      const input2Text = text(pad + 160, pad + 170, '密码')
      const btn = rect(pad + 100, pad + 220, 200, 40, true)
      const btnText = text(pad + 170, pad + 230, '登录')
      return [bg, bgText, input1, input1Text, input2, input2Text, btn, btnText]
    },
  },
  {
    keywords: ['设置', '配置', '个人中心', 'profile', 'setting', 'account'],
    generate: () => {
      const pad = 40
      const sidebar = rect(pad, pad, 250, 500)
      const sidebarText = text(pad + 60, pad + 230, '设置菜单')
      const main = rect(pad + 290, pad, 540, 250)
      const mainText = text(pad + 440, pad + 110, '个人信息编辑')
      const preview = rect(pad + 290, pad + 280, 540, 220)
      const previewText = text(pad + 440, pad + 380, '预览效果')
      return [sidebar, sidebarText, main, mainText, preview, previewText]
    },
  },
  // === Sketch-specific ===
  {
    keywords: ['动画', '动漫', '卡通', 'animation', 'cartoon', 'anime'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      elements.push(rect(30, 30, 800, 40, true))
      elements.push(text(320, 38, '动画工作室'))
      // Character 1 - Mickey style
      elements.push(...mickeyHead(150, 200, 40))
      elements.push(text(100, 280, '卡通角色'))
      // Character 2 - simple person
      elements.push(...stickFigure(400, 300, 70))
      elements.push(text(370, 380, '人物'))
      // Animation frames
      elements.push(rect(550, 100, 250, 150))
      elements.push(text(610, 160, '帧1'))
      elements.push(rect(550, 280, 250, 150))
      elements.push(text(610, 340, '帧2'))
      elements.push(ellipse(650, 175, 30, 30))
      // Arrow between frames
      elements.push(arrow(
        { id: '', x: 550, y: 100, width: 250, height: 150, type: 'rectangle' } as ExcalidrawElement,
        { id: '', x: 550, y: 280, width: 250, height: 150, type: 'rectangle' } as ExcalidrawElement,
      ))
      return elements
    },
  },
  {
    keywords: ['地图', '导航', 'map', 'navigation', 'treasure'],
    generate: () => {
      const elements: ExcalidrawElement[] = []
      // Map background
      elements.push(rect(30, 30, 800, 500))
      elements.push(text(350, 12, '探险地图'))
      // Roads
      elements.push(line(50, 200, [[0, 0], [750, 50]], '#92400e'))
      elements.push(line(50, 350, [[0, 0], [700, -50]], '#92400e'))
      // Locations
      elements.push(...castle(80, 150, 100, 80))
      elements.push(text(90, 240, '城堡'))
      elements.push(...tree(300, 180, 50))
      elements.push(text(280, 240, '森林'))
      elements.push(...house(500, 200, 60, 40))
      elements.push(text(490, 260, '村庄'))
      // Treasure
      elements.push(ellipse(650, 350, 30, 20, '#f59e0b', '#fef3c7'))
      elements.push(text(630, 390, '宝藏!'))
      // Explorer
      elements.push(...stickFigure(200, 300, 50))
      elements.push(text(175, 360, '探险家'))
      // Sun
      elements.push(...sun(720, 60, 20))
      return elements
    },
  },
]

/** Match description to preset layout */
function matchPreset(description: string): ExcalidrawElement[] | null {
  const lower = description.toLowerCase()
  let bestScore = 0
  let bestLayout: ExcalidrawElement[] | null = null

  for (const preset of PRESET_LAYOUTS) {
    let score = 0
    for (const kw of preset.keywords) {
      if (lower.includes(kw.toLowerCase())) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestLayout = preset.generate()
    }
  }

  return bestScore > 0 ? bestLayout : null
}

/**
 * Generate Excalidraw elements from a natural language description.
 * Tries LLM API first, falls back to preset templates.
 */
export async function generateFromDescription(description: string): Promise<ExcalidrawElement[]> {
  // Try LLM API if configured
  const apiUrl = (import.meta as any).env?.VITE_AI_DRAWER_API_URL
  if (apiUrl) {
    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `根据以下描述生成前端页面草图（Excalidraw JSON格式）：${description}`,
        }),
      })
      const data = await resp.json()
      if (data.elements && Array.isArray(data.elements)) {
        return data.elements as ExcalidrawElement[]
      }
    } catch {
      // Fall through to preset
    }
  }

  // Fallback to preset templates
  const preset = matchPreset(description)
  if (preset) return preset

  // Ultimate fallback: a generic dashboard layout
  return PRESET_LAYOUTS[PRESET_LAYOUTS.length - 1].generate()
}
