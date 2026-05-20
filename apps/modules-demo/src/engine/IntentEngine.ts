import type { PageSkeleton, InferredModule, ParsedElement } from './types'

/** Keyword → module mapping with confidence — covers both finance and general UI */
const KEYWORD_MAP: Record<string, { module: string; label: string; confidence: number }> = {
  // Finance
  行情: { module: 'QuotePanel', label: '行情面板', confidence: 0.85 },
  价格: { module: 'QuotePanel', label: '行情面板', confidence: 0.8 },
  quotes: { module: 'QuotePanel', label: '行情面板', confidence: 0.85 },
  k线: { module: 'QuotePanel', label: 'K线图表', confidence: 0.8 },
  报价: { module: 'QuotePanel', label: '报价面板', confidence: 0.75 },
  订单: { module: 'DataTable', label: '订单表格', confidence: 0.85 },
  表格: { module: 'DataTable', label: '数据表格', confidence: 0.8 },
  列表: { module: 'DataTable', label: '数据列表', confidence: 0.75 },
  list: { module: 'DataTable', label: '数据列表', confidence: 0.8 },
  trade: { module: 'DataTable', label: '交易表格', confidence: 0.75 },
  买卖: { module: 'DataTable', label: '交易记录', confidence: 0.75 },
  文件: { module: 'FileManager', label: '文件管理', confidence: 0.85 },
  文档: { module: 'FileManager', label: '文档管理', confidence: 0.8 },
  upload: { module: 'FileManager', label: '文件上传', confidence: 0.75 },
  file: { module: 'FileManager', label: '文件管理', confidence: 0.8 },
  通知: { module: 'Notification', label: '通知中心', confidence: 0.85 },
  消息: { module: 'Notification', label: '消息中心', confidence: 0.75 },
  告警: { module: 'Notification', label: '告警通知', confidence: 0.8 },
  notification: { module: 'Notification', label: '通知中心', confidence: 0.85 },
  总览: { module: 'Dashboard', label: '数据总览', confidence: 0.8 },
  指标: { module: 'Dashboard', label: '指标面板', confidence: 0.75 },
  kpi: { module: 'Dashboard', label: 'KPI仪表盘', confidence: 0.8 },
  仪表盘: { module: 'Dashboard', label: '仪表盘', confidence: 0.85 },
  dashboard: { module: 'Dashboard', label: '仪表盘', confidence: 0.85 },
  管理: { module: 'Dashboard', label: '管理面板', confidence: 0.7 },
  后台: { module: 'Dashboard', label: '管理后台', confidence: 0.7 },
  // General UI — layout structure
  顶部: { module: 'Dashboard', label: '顶部导航', confidence: 0.7 },
  header: { module: 'Dashboard', label: '页面头部', confidence: 0.7 },
  导航: { module: 'Dashboard', label: '导航栏', confidence: 0.75 },
  侧边: { module: 'Dashboard', label: '侧边栏', confidence: 0.7 },
  sidebar: { module: 'Dashboard', label: '侧边栏', confidence: 0.7 },
  内容: { module: 'Dashboard', label: '内容区', confidence: 0.65 },
  content: { module: 'Dashboard', label: '内容区', confidence: 0.65 },
  卡片: { module: 'Dashboard', label: '卡片组', confidence: 0.7 },
  card: { module: 'Dashboard', label: '卡片组', confidence: 0.7 },
  搜索: { module: 'Dashboard', label: '搜索栏', confidence: 0.7 },
  search: { module: 'Dashboard', label: '搜索栏', confidence: 0.7 },
  用户: { module: 'Dashboard', label: '用户中心', confidence: 0.65 },
  user: { module: 'Dashboard', label: '用户中心', confidence: 0.65 },
  设置: { module: 'Dashboard', label: '设置面板', confidence: 0.65 },
  settings: { module: 'Dashboard', label: '设置面板', confidence: 0.65 },
  登录: { module: 'Dashboard', label: '登录框', confidence: 0.65 },
  login: { module: 'Dashboard', label: '登录框', confidence: 0.65 },
  英雄: { module: 'Dashboard', label: '英雄横幅', confidence: 0.65 },
  hero: { module: 'Dashboard', label: '英雄横幅', confidence: 0.65 },
  banner: { module: 'Dashboard', label: '横幅', confidence: 0.65 },
  画廊: { module: 'FileManager', label: '图片画廊', confidence: 0.7 },
  gallery: { module: 'FileManager', label: '图片画廊', confidence: 0.7 },
  图片: { module: 'FileManager', label: '图片展示', confidence: 0.65 },
  image: { module: 'FileManager', label: '图片展示', confidence: 0.65 },
  照片: { module: 'FileManager', label: '照片墙', confidence: 0.65 },
  photo: { module: 'FileManager', label: '照片墙', confidence: 0.65 },
  相册: { module: 'FileManager', label: '相册', confidence: 0.65 },
  视频: { module: 'FileManager', label: '视频播放器', confidence: 0.65 },
  video: { module: 'FileManager', label: '视频播放器', confidence: 0.65 },
  播放: { module: 'FileManager', label: '媒体播放器', confidence: 0.65 },
  音乐: { module: 'FileManager', label: '音乐播放器', confidence: 0.65 },
  music: { module: 'FileManager', label: '音乐播放器', confidence: 0.65 },
  评论: { module: 'Notification', label: '评论区', confidence: 0.65 },
  comment: { module: 'Notification', label: '评论区', confidence: 0.65 },
  反馈: { module: 'Notification', label: '反馈面板', confidence: 0.65 },
  feedback: { module: 'Notification', label: '反馈面板', confidence: 0.65 },
  活动: { module: 'Notification', label: '活动流', confidence: 0.6 },
  feed: { module: 'Notification', label: '动态流', confidence: 0.6 },
  动态: { module: 'Notification', label: '动态流', confidence: 0.6 },
  收藏: { module: 'DataTable', label: '收藏夹', confidence: 0.65 },
  favorite: { module: 'DataTable', label: '收藏夹', confidence: 0.65 },
  排行: { module: 'DataTable', label: '排行榜', confidence: 0.65 },
  ranking: { module: 'DataTable', label: '排行榜', confidence: 0.65 },
  进度: { module: 'Dashboard', label: '进度条', confidence: 0.65 },
  地图: { module: 'Dashboard', label: '地图展示', confidence: 0.6 },
  map: { module: 'Dashboard', label: '地图展示', confidence: 0.6 },
  聊天: { module: 'Notification', label: '聊天窗口', confidence: 0.65 },
  chat: { module: 'Notification', label: '聊天窗口', confidence: 0.65 },
  好友: { module: 'DataTable', label: '好友列表', confidence: 0.6 },
  friend: { module: 'DataTable', label: '好友列表', confidence: 0.6 },
  角色: { module: 'DataTable', label: '角色列表', confidence: 0.6 },
  人物: { module: 'DataTable', label: '人物列表', confidence: 0.6 },
  景点: { module: 'DataTable', label: '景点列表', confidence: 0.6 },
  场景: { module: 'Dashboard', label: '场景展示', confidence: 0.6 },
  动画: { module: 'FileManager', label: '动画展示', confidence: 0.6 },
  animation: { module: 'FileManager', label: '动画展示', confidence: 0.6 },
  故事: { module: 'Dashboard', label: '故事区', confidence: 0.6 },
  story: { module: 'Dashboard', label: '故事区', confidence: 0.6 },
  时间线: { module: 'DataTable', label: '时间线', confidence: 0.65 },
  timeline: { module: 'DataTable', label: '时间线', confidence: 0.65 },
  统计: { module: 'Dashboard', label: '统计面板', confidence: 0.7 },
  图表: { module: 'Dashboard', label: '图表区', confidence: 0.65 },
  chart: { module: 'Dashboard', label: '图表区', confidence: 0.65 },
  graph: { module: 'Dashboard', label: '图表区', confidence: 0.65 },
  // Romantic / Personal — scene recognition
  520: { module: 'RomancePage', label: '520浪漫', confidence: 0.9 },
  浪漫: { module: 'RomancePage', label: '浪漫场景', confidence: 0.8 },
  爱情: { module: 'RomancePage', label: '爱情主题', confidence: 0.8 },
  love: { module: 'RomancePage', label: '浪漫场景', confidence: 0.75 },
  女朋友: { module: 'RomancePage', label: '情侣页面', confidence: 0.8 },
  男朋友: { module: 'RomancePage', label: '情侣页面', confidence: 0.8 },
  情侣: { module: 'RomancePage', label: '情侣页面', confidence: 0.8 },
  表白: { module: 'RomancePage', label: '表白页面', confidence: 0.8 },
  情人节: { module: 'RomancePage', label: '情人节页面', confidence: 0.8 },
  礼物: { module: 'RomancePage', label: '礼物展示', confidence: 0.7 },
  惊喜: { module: 'RomancePage', label: '惊喜页面', confidence: 0.7 },
  花: { module: 'RomancePage', label: '花卉展示', confidence: 0.6 },
  玫瑰: { module: 'RomancePage', label: '玫瑰花束', confidence: 0.7 },
  爱心: { module: 'RomancePage', label: '爱心页面', confidence: 0.75 },
  我们: { module: 'RomancePage', label: '情侣页面', confidence: 0.7 },
  快乐: { module: 'RomancePage', label: '祝福页面', confidence: 0.6 },
  祝福: { module: 'RomancePage', label: '祝福页面', confidence: 0.7 },
  生日: { module: 'RomancePage', label: '生日页面', confidence: 0.8 },
  节日: { module: 'RomancePage', label: '节日页面', confidence: 0.65 },
  派对: { module: 'Notification', label: '派对活动', confidence: 0.65 },
  party: { module: 'Notification', label: '派对活动', confidence: 0.65 },
  庆祝: { module: 'RomancePage', label: '庆祝页面', confidence: 0.7 },
  // Entertainment / Scene — Disney & theme parks
  迪士尼: { module: 'ThemePark', label: '迪士尼乐园', confidence: 0.85 },
  disney: { module: 'ThemePark', label: '迪士尼乐园', confidence: 0.85 },
  卡通: { module: 'ThemePark', label: '卡通角色', confidence: 0.75 },
  cartoon: { module: 'ThemePark', label: '卡通角色', confidence: 0.75 },
  动漫场景: { module: 'ThemePark', label: '动漫场景', confidence: 0.75 },
  女孩: { module: 'ThemePark', label: '人物角色', confidence: 0.65 },
  人物角色: { module: 'ThemePark', label: '人物角色', confidence: 0.65 },
  卡通角色: { module: 'ThemePark', label: '卡通角色', confidence: 0.75 },
  打招呼: { module: 'ThemePark', label: '互动环节', confidence: 0.65 },
  烟花: { module: 'ThemePark', label: '烟花表演', confidence: 0.8 },
  城堡: { module: 'ThemePark', label: '城堡场景', confidence: 0.75 },
  乐园: { module: 'ThemePark', label: '主题乐园', confidence: 0.75 },
  心仪: { module: 'ThemePark', label: '心愿之旅', confidence: 0.6 },
  晚上: { module: 'ThemePark', label: '夜间表演', confidence: 0.6 },
  夜景: { module: 'ThemePark', label: '夜景展示', confidence: 0.65 },
  表演: { module: 'ThemePark', label: '演出场景', confidence: 0.7 },
  show: { module: 'ThemePark', label: '演出场景', confidence: 0.65 },
  高级: { module: 'ThemePark', label: '高级动画', confidence: 0.6 },
  简短: { module: 'ThemePark', label: '简短动画', confidence: 0.55 },
  电影: { module: 'ThemePark', label: '电影场景', confidence: 0.65 },
  movie: { module: 'ThemePark', label: '电影场景', confidence: 0.65 },
}

/** Shape-based inference when no text label is present */
function inferFromShape(element: ParsedElement): InferredModule | null {
  if (element.type === 'rect') {
    const ratio = element.bbox.width / Math.max(element.bbox.height, 1)
    if (ratio > 2.5) return { module: 'DataTable', label: '宽表格区域', dependsOn: [], confidence: 0.4, evidence: ['宽矩形 → 可能是表格'] }
    if (ratio > 1.5) return { module: 'Dashboard', label: '卡片区域', dependsOn: [], confidence: 0.35, evidence: ['扁矩形 → 可能是面板卡片'] }
    return { module: 'Dashboard', label: '面板区域', dependsOn: [], confidence: 0.3, evidence: ['矩形 → 可能是UI面板'] }
  }
  if (element.type === 'ellipse') return { module: 'Notification', label: '状态指示', dependsOn: [], confidence: 0.3, evidence: ['圆形 → 可能是状态指示器'] }
  if (element.type === 'diamond') return { module: 'Notification', label: '决策节点', dependsOn: [], confidence: 0.3, evidence: ['菱形 → 可能是决策/判断'] }
  return null
}

/** Resolve shape-based confidence using text labels */
function boostConfidenceByText(modules: InferredModule[], textLabels: { text: string }[]): InferredModule[] {
  const allText = textLabels.map((t) => t.text.toLowerCase()).join(' ')
  return modules.map((m) => {
    let boosted = m.confidence
    // If there are text labels in the sketch, boost overall confidence
    if (allText.length > 0) boosted = Math.min(0.95, boosted + 0.2)
    return { ...m, confidence: boosted }
  })
}

export function inferIntent(skeleton: PageSkeleton, description = '', purpose = ''): InferredModule[] {
  const modules: InferredModule[] = []
  const seenModules = new Set<string>()
  const allKeywords: string[] = []

  // Sort keywords by length desc so longer matches take priority
  const keywordEntries = Object.entries(KEYWORD_MAP).sort(
    (a, b) => b[0].length - a[0].length,
  )

  // 1. Purpose-driven inference — highest priority (goal-oriented)
  if (purpose) {
    const lowerPurpose = purpose.toLowerCase()
    for (const [kw, info] of keywordEntries) {
      if (seenModules.has(info.module)) continue
      if (lowerPurpose.includes(kw.toLowerCase())) {
        seenModules.add(info.module)
        allKeywords.push(kw)
        modules.push({
          module: info.module,
          label: info.label,
          dependsOn: [],
          confidence: Math.min(0.95, info.confidence + 0.1), // purpose boosts confidence
          evidence: [`目的驱动: "${purpose}" 包含 "${kw}" → ${info.module}`],
        })
      }
    }
  }

  // 2. Text label based inference — substring matching (works for Chinese)
  for (const label of skeleton.textLabels) {
    const lowerText = label.text.toLowerCase()
    for (const [kw, info] of keywordEntries) {
      if (seenModules.has(info.module)) continue
      if (lowerText.includes(kw.toLowerCase())) {
        seenModules.add(info.module)
        allKeywords.push(kw)
        modules.push({
          module: info.module,
          label: info.label,
          dependsOn: [],
          confidence: info.confidence,
          evidence: [`文字标注: "${label.text}" 包含 "${kw}" → ${info.module}`],
        })
      }
    }
  }

  // 3. Match against the raw user description text (from AI dialog)
  if (description) {
    const lowerDesc = description.toLowerCase()
    for (const [kw, info] of keywordEntries) {
      if (seenModules.has(info.module)) continue
      if (lowerDesc.includes(kw.toLowerCase())) {
        seenModules.add(info.module)
        allKeywords.push(kw)
        modules.push({
          module: info.module,
          label: info.label,
          dependsOn: [],
          confidence: info.confidence,
          evidence: [`用户描述包含 "${kw}" → ${info.module}`],
        })
      }
    }
  }

  // 3. Shape-based inference for rects without labels
  for (const el of skeleton.topLevel) {
    if (el.type === 'rect' && !el.label && !seenModules.size) {
      const inferred = inferFromShape(el)
      if (inferred && !seenModules.has(inferred.module)) {
        seenModules.add(inferred.module)
        modules.push(inferred)
      }
    }
  }

  // 3. Use arrow links to set dependencies
  for (const arrow of skeleton.arrows) {
    const fromModule = modules.find((m) => m.module === skeleton.topLevel.find((t) => t.id === arrow.from)?.label)
    const toModule = modules.find((m) => m.module === skeleton.topLevel.find((t) => t.id === arrow.to)?.label)
    if (fromModule && toModule && !toModule.dependsOn.includes(fromModule.module)) {
      toModule.dependsOn.push(fromModule.module)
    }
  }

  // 4. Boost confidence if text labels exist
  const result = boostConfidenceByText(modules, skeleton.textLabels)

  // 5. If no modules inferred at all, fall back to shape inference for all rects
  if (result.length === 0) {
    for (const el of skeleton.topLevel) {
      if (el.type === 'rect') {
        const inferred = inferFromShape(el)
        if (inferred) modules.push(inferred)
      }
    }
    return modules
  }

  return result
}

/** Extract all unique keywords from the sketch and/or purpose — substring matching for Chinese */
export function extractKeywords(skeleton: PageSkeleton, purpose = ''): string[] {
  const keywords = new Set<string>()
  const allText = skeleton.textLabels.map((l) => l.text.toLowerCase()).join(' ')
  // Also check purpose text for keywords
  const allSources = purpose ? `${allText} ${purpose.toLowerCase()}` : allText
  for (const kw of Object.keys(KEYWORD_MAP)) {
    if (kw.length > 1 && allSources.includes(kw.toLowerCase())) {
      keywords.add(kw)
    }
  }
  return [...keywords]
}
