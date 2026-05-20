// ============================================================
// Type definitions for the Canvas → Architecture inference system
// ============================================================

/** A bounding box on the canvas */
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

/** A parsed element from Excalidraw */
export interface ParsedElement {
  id: string
  type: 'rect' | 'ellipse' | 'diamond' | 'arrow' | 'line' | 'text' | 'freedraw'
  bbox: BoundingBox
  label?: string
  parentId?: string
  linkedToId?: string
  createdAt: number
}

/** The structural skeleton extracted from a sketch */
export interface PageSkeleton {
  topLevel: ParsedElement[]
  nested: { parent: ParsedElement; children: ParsedElement[] }[]
  arrows: { from: string; to: string }[]
  textLabels: { text: string; nearElementId?: string }[]
  drawOrder: string[] // element IDs sorted by created timestamp
}

/** An inferred module from the user's intent */
export interface InferredModule {
  module: string
  label: string
  dependsOn: string[]
  confidence: number
  evidence: string[] // why we inferred this
}

/** A classic template from the library */
export interface ClassicTemplate {
  id: string
  name: string
  modules: string[]
  keywords: string[]
  description: string
}

/** Template matching result */
export interface TemplateMatch {
  template: ClassicTemplate
  similarity: number
  matchedModules: string[]
  missingModules: string[]
}

/** The complete inference result */
export interface InferenceResult {
  modules: InferredModule[]
  templateMatch: TemplateMatch | null
  overallConfidence: number
  needsWebResearch: boolean
  webResearch?: WebResearchResult
  summary: string
}

/** Web research result */
export interface WebResearchResult {
  query: string
  suggestions: string[]
  industryPatterns: string[]
  confidence: number
}

/** Scoring breakdown */
export interface ScoreBreakdown {
  signalCoverage: number
  keywordMatch: number
  structuralCompleteness: number
  drawOrderliness: number
  overall: number
}
