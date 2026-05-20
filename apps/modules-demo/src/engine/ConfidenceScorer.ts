import type { PageSkeleton, ScoreBreakdown } from './types'

export function computeConfidence(skeleton: PageSkeleton, moduleCount: number, hasKeywords: boolean): ScoreBreakdown {
  // Signal coverage: do we have shapes + text + arrows?
  const signalCount = [
    skeleton.topLevel.length > 0,
    skeleton.textLabels.length > 0,
    skeleton.arrows.length > 0,
    skeleton.nested.length > 0,
    skeleton.drawOrder.length > 0,
  ].filter(Boolean).length
  const signalCoverage = signalCount / 5

  // Keyword match: any text labels found
  const keywordMatch = hasKeywords ? Math.min(1, skeleton.textLabels.length / 3) : 0.1

  // Structural completeness: modules identified vs canvas elements
  // Include both rects and non-rect shapes (ellipses, lines, freedraw) for sketch scenes
  const shapeCount = skeleton.topLevel.filter((e) =>
    e.type !== 'text' && e.type !== 'arrow',
  ).length + skeleton.nested.reduce((s, n) => s + n.children.length, 0)
  const structuralCompleteness = shapeCount > 0 ? moduleCount / Math.max(shapeCount, 1) : 0

  // Draw orderliness: more elements drawn in a logical sequence = higher score
  const drawOrderliness = Math.min(1, skeleton.drawOrder.length / 5)

  const overall =
    signalCoverage * 0.2 +
    keywordMatch * 0.35 +
    structuralCompleteness * 0.25 +
    drawOrderliness * 0.2

  return {
    signalCoverage: Math.round(signalCoverage * 100),
    keywordMatch: Math.round(keywordMatch * 100),
    structuralCompleteness: Math.round(Math.min(1, structuralCompleteness) * 100),
    drawOrderliness: Math.round(drawOrderliness * 100),
    overall: Math.round(overall * 100),
  }
}
